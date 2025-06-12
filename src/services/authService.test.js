const assert = require('assert');
const authService = require('./authService'); // Assuming this will have the __setTestDeps hook
const { BadRequestError, UnauthorizedError, InternalServerError } = require('../utils/errors');

// --- Simplified Mocks ---
let mockUserDb = {}; // In-memory "database"

const mockUserFunctions = {
  findOne: async ({ email }) => {
    for (const id in mockUserDb) {
      if (mockUserDb[id].email === email) {
        // Simulate Mongoose document structure and select('+password')
        const userDoc = {
          ...mockUserDb[id],
          toObject: () => ({ ...mockUserDb[id] }),
          save: async function() { // Make save part of the "document"
            mockUserDb[this._id] = { ...this };
            delete mockUserDb[this._id].save; // remove save from stored object
            delete mockUserDb[this._id].toObject;
            return this;
          }
        };
        return userDoc;
      }
    }
    return null;
  },
  // Constructor for new User
  UserConstructor: function (data) {
    this._id = `id_${Date.now()}_${Math.random()}`;
    this.email = data.email;
    this.fullname = data.fullname;
    this.password = data.password; // Will be overwritten by hashed password in service
    this.role = data.role;
    this.tenantId = data.tenantId;
    // Add other fields from schema with defaults if necessary
    this.isEmailVerified = false;
    this.emailVerificationToken = null;
    this.resetPasswordToken = null;
    this.resetPasswordExpires = null;

    this.save = async () => {
      mockUserDb[this._id] = { ...this };
      // Clean up methods from stored object
      const storedUser = { ...mockUserDb[this._id] };
      delete storedUser.save;
      delete storedUser.toObject;
      mockUserDb[this._id] = storedUser;
      return this;
    };
    this.toObject = () => {
      const obj = { ...this };
      // delete obj.password; // Service is responsible for deleting password from final output
      delete obj.save; // Don't include methods in toObject result
      return obj;
    };
  }
};
// The User object to be injected will be the constructor
mockUserFunctions.UserConstructor.findOne = mockUserFunctions.findOne;


const mockBcryptjs = {
  hash: async (password, salt) => `hashed_${password}`,
  genSalt: async (rounds) => 10,
  compare: async (plainPassword, hashedPassword) => `hashed_${plainPassword}` === hashedPassword,
};

const mockJsonwebtoken = {
  sign: (payload, secret, options) => `mock_token::${payload.userId}::${secret}::${options.expiresIn}`,
};

const mockEnvConfig = {
  JWT_SECRET: 'test_jwt_secret',
  JWT_EXPIRES_IN: '1h',
  REFRESH_TOKEN_SECRET: 'test_refresh_secret',
  REFRESH_TOKEN_EXPIRES_IN: '7d',
};

// --- Test Suite ---
async function runAllTests() {
  console.log('Starting authService.test.js...');
  let testsPassed = 0;
  let testsFailed = 0;

  const runTest = async (testName, testFn) => {
    mockUserDb = {}; // Reset DB for each test
    // Inject fresh mocks for each test
    authService.__setTestDeps({
      User: mockUserFunctions.UserConstructor, // This is the constructor
      bcryptjs: mockBcryptjs,
      jsonwebtoken: mockJsonwebtoken,
      envConfig: mockEnvConfig,
    });
    // Ensure User.findOne is attached to the constructor being injected
    authService.__setTestDeps({ User: { ...mockUserFunctions.UserConstructor, findOne: mockUserFunctions.findOne } });


    try {
      await testFn();
      console.log(`  [PASS] ${testName}`);
      testsPassed++;
    } catch (error) {
      console.error(`  [FAIL] ${testName}: ${error.message}`);
      console.error(error.stack); // Print stack for better debugging
      testsFailed++;
    }
  };

  await runTest('registerUser_success', async () => {
    const userData = { fullname: 'Test User', email: 'test@example.com', password: 'Password123!', role: 'client' };
    const result = await authService.registerUser(userData);
    assert.strictEqual(result.email, userData.email);
    assert.ok(result._id);
    assert.strictEqual(result.password, undefined, "Password should be excluded from result");
    const dbUser = mockUserDb[result._id];
    assert.ok(dbUser);
    assert.strictEqual(dbUser.password, 'hashed_Password123!');
  });

  await runTest('registerUser_existingEmail', async () => {
    const email = 'existing@example.com';
    mockUserDb['id1'] = { _id: 'id1', email, password: 'hashed_oldPassword', role: 'client' }; // Pre-populate
    const userData = { fullname: 'New User', email, password: 'Password123!', role: 'client' };
    try {
      await authService.registerUser(userData);
      assert.fail('Should have thrown BadRequestError for existing email');
    } catch (error) {
      assert.ok(error instanceof BadRequestError);
      assert.strictEqual(error.message, 'User with this email already exists.');
    }
  });

  await runTest('registerUser_passwordPolicyFailure', async () => {
    const userData = { fullname: 'Policy Fail', email: 'policy@example.com', password: 'weak', role: 'client' };
    try {
      await authService.registerUser(userData);
      assert.fail('Should have thrown BadRequestError for weak password');
    } catch (error) {
      assert.ok(error instanceof BadRequestError);
      assert.ok(error.message.includes('Password does not meet policy'));
    }
  });

  await runTest('loginUser_success', async () => {
    const email = 'login@example.com';
    const password = 'Password123!';
    mockUserDb['idLogin'] = { _id: 'idLogin', email, password: `hashed_${password}`, role: 'client', fullname: 'Login User' };
    const result = await authService.loginUser({ email, password, role: 'client' });
    assert.strictEqual(result.user.email, email);
    assert.ok(result.accessToken.startsWith('mock_token::idLogin'));
    assert.ok(result.refreshToken.startsWith('mock_token::idLogin'));
    assert.strictEqual(result.user.password, undefined, "Password should be excluded");
  });

  await runTest('loginUser_nonExistentEmail', async () => {
    try {
      await authService.loginUser({ email: 'no@user.com', password: 'any', role: 'client' });
      assert.fail('Should throw UnauthorizedError for non-existent email');
    } catch (error) {
      assert.ok(error instanceof UnauthorizedError);
      assert.strictEqual(error.message, 'Invalid credentials.');
    }
  });

  await runTest('loginUser_incorrectPassword', async () => {
    const email = 'login@example.com';
    mockUserDb['idPass'] = { _id: 'idPass', email, password: 'hashed_CorrectPassword!', role: 'client' };
    try {
      await authService.loginUser({ email, password: 'WrongPassword!', role: 'client' });
      assert.fail('Should throw UnauthorizedError for incorrect password');
    } catch (error) {
      assert.ok(error instanceof UnauthorizedError);
      assert.strictEqual(error.message, 'Invalid credentials.');
    }
  });

  await runTest('loginUser_incorrectRole', async () => {
    const email = 'login@example.com';
    const password = 'Password123!';
    mockUserDb['idRole'] = { _id: 'idRole', email, password: `hashed_${password}`, role: 'client' };
    try {
      await authService.loginUser({ email, password, role: 'admin' }); // Trying to login as admin
      assert.fail('Should throw UnauthorizedError for incorrect role');
    } catch (error) {
      assert.ok(error instanceof UnauthorizedError);
      assert.strictEqual(error.message, 'Invalid credentials or insufficient permissions.');
    }
  });

  await runTest('loginUser_missingJwtSecret', async () => {
    authService.__setTestDeps({
      User: { ...mockUserFunctions.UserConstructor, findOne: mockUserFunctions.findOne },
      bcryptjs: mockBcryptjs,
      jsonwebtoken: mockJsonwebtoken,
      envConfig: { ...mockEnvConfig, JWT_SECRET: null }, // Simulate missing secret
    });
    const email = 'login@example.com';
    const password = 'Password123!';
    mockUserDb['idJwt'] = { _id: 'idJwt', email, password: `hashed_${password}`, role: 'client' };
    try {
      await authService.loginUser({ email, password, role: 'client' });
      assert.fail('Should throw InternalServerError if JWT_SECRET is missing');
    } catch (error) {
      assert.ok(error instanceof InternalServerError);
      assert.strictEqual(error.message, 'Server configuration error.');
    }
  });


  console.log(`\n--- Summary ---`);
  console.log(`Total tests: ${testsPassed + testsFailed}`);
  console.log(`Passed: ${testsPassed}`);
  console.log(`Failed: ${testsFailed}`);
  console.log('authService.test.js finished.');

  if (testsFailed > 0) {
    // process.exit(1); // Exit with error code if any test fails
  }
}

// This check ensures that if this file is run directly, the tests execute.
if (require.main === module) {
  // This assumes authService.js has been modified to include __setTestDeps
  // Otherwise, this will fail or test the actual service.
  // For this environment, we are proceeding with this assumption for demonstration.
  if (!authService.__setTestDeps) {
    console.warn("!!! authService.__setTestDeps is not defined. Tests will likely fail or use actual dependencies. !!!");
    console.warn("!!! This test suite expects authService.js to be temporarily adapted for dependency injection. !!!");
    // Fallback: Try to run with potentially unmocked dependencies if hook is not present
    // This part is tricky because the mocks are defined in this file.
    // The ideal scenario is that authService.js IS adapted.
    // If not, these tests are more illustrative of the logic than runnable units.
  }
  runAllTests();
}

module.exports = { runAllTests }; // Export for potential external runner
