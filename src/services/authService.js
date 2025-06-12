const User = require('../models/users_model');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {
  BadRequestError,
  UnauthorizedError,
  InternalServerError,
} = require('../utils/errors');
const env = require('../config/env'); // Import centralized env

// Access environment variables
const JWT_SECRET = env.JWT_SECRET;
const JWT_EXPIRES_IN = env.JWT_EXPIRES_IN;


/**
 * Registers a new user after validating password policy and checking for existing email.
 * @async
 * @function registerUser
 * @param {object} userData - User data for registration.
 * @param {string} userData.fullname - User's full name.
 * @param {string} userData.email - User's email address.
 * @param {string} userData.password - User's raw password.
 * @param {string} [userData.role='client'] - User's role (e.g., 'client', 'admin', 'tenant_admin'). Defaults to 'client'.
 * @param {string} [userData.tenantId=null] - ID of the tenant the user belongs to. Optional.
 * @returns {Promise<object>} The created user object (excluding password and sensitive tokens like reset/verification tokens).
 * @throws {BadRequestError} If email already exists or if the password does not meet the complexity policy.
 * @throws {InternalServerError} If there's an unexpected error during user creation or saving (though most DB errors might be caught as BadRequestError if they are constraint violations).
 */
const registerUser = async (userData) => {
  const { fullname, email, password, role, tenantId } = userData;

  // Password complexity check
  // Example: min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special character
  const passwordPolicyRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!passwordPolicyRegex.test(password)) {
    throw new BadRequestError(
      'Password does not meet policy: minimum 8 characters, including at least one uppercase letter, one lowercase letter, one number, and one special character.',
    );
  }

  // Check if a user with the same email already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new BadRequestError('User with this email already exists.');
  }

  // Generate salt and hash the password
  const salt = await bcryptjs.genSalt(10);
  const hashedPassword = await bcryptjs.hash(password, salt);

  // Create a new user instance
  const newUser = new User({
    fullname,
    email,
    password: hashedPassword,
    role: role || 'client', // Default role to 'client' if not provided
    tenantId: tenantId || null, // Save tenantId if provided, else null
  });

  // Save the new user to the database
  await newUser.save();

  // Return user object, excluding password and other sensitive tokens
  const userObject = newUser.toObject();
  delete userObject.password;
  delete userObject.emailVerificationToken;
  delete userObject.resetPasswordToken;
  delete userObject.resetPasswordExpires;
  // isEmailVerified can usually be returned
  return userObject;
};

/**
 * Logs in an existing user.
 * @param {object} credentials - User credentials (email, password, role).
 * @returns {Promise<object>} Object containing user details (without password) and JWT token.
 * Logs in an existing user after verifying credentials and role.
 * Generates and returns access and refresh tokens.
 * @async
 * @function loginUser
 * @param {object} credentials - User login credentials.
 * @param {string} credentials.email - User's email address.
 * @param {string} credentials.password - User's raw password.
 * @param {string} credentials.role - User's role for login.
 * @returns {Promise<object>} An object containing the accessToken, refreshToken, and user object (excluding password and sensitive tokens).
 * @throws {UnauthorizedError} If credentials are invalid, user not found, or role does not match.
 * @throws {InternalServerError} If server configuration for token generation is missing (e.g., JWT secrets).
 */
const loginUser = async (credentials) => {
  const { email, password, role } = credentials;

  // Find user by email
  const user = await User.findOne({ email }).select('+password');

  // Check if user exists
  if (!user) {
    throw new UnauthorizedError('Invalid credentials.');
  }

  // Check if user has the correct role
  if (user.role !== role) {
    throw new UnauthorizedError('Invalid credentials or insufficient permissions.');
  }

  // Compare passwords
  const isMatch = await bcryptjs.compare(password, user.password);
  if (!isMatch) {
    throw new UnauthorizedError('Invalid credentials.');
  }

  // Check if JWT_SECRET is available
  if (!JWT_SECRET) {
    console.error('JWT_SECRET environment variable is not set. Cannot generate token.');
    throw new InternalServerError('Server configuration error.');
  }

  // Generate JWT token
  const payload = {
    userId: user._id,
    role: user.role,
    email: user.email,
    name: user.fullname,
  };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

  // Prepare user object to return (excluding password and other sensitive tokens)
  const userObject = user.toObject();
  delete userObject.password; // Password was selected for comparison, ensure it's removed
  delete userObject.emailVerificationToken;
  delete userObject.resetPasswordToken;
  delete userObject.resetPasswordExpires;

  // Generate Refresh Token
  // Ensure REFRESH_TOKEN_SECRET and REFRESH_TOKEN_EXPIRES_IN are defined in env
  if (!env.REFRESH_TOKEN_SECRET || !env.REFRESH_TOKEN_EXPIRES_IN) {
    console.error(
      'Refresh token secret or expiry is not defined in environment variables.',
    );
    throw new InternalServerError('Server configuration error for token generation.');
  }
  const refreshToken = jwt.sign(
    { userId: user._id }, // Minimal payload for refresh token
    env.REFRESH_TOKEN_SECRET,
    { expiresIn: env.REFRESH_TOKEN_EXPIRES_IN },
  );

  // TODO: Store the refreshToken in the user document if implementing refresh token rotation
  // or a list of active refresh tokens per user. For now, we assume it's stateless or
  // the controller will handle storing it if needed (e.g., in an HttpOnly cookie).
  // Example: user.refreshToken = refreshToken; await user.save(); (if storing one per user)

  return {
    accessToken: token, // Renamed from 'token' for clarity
    refreshToken,
    user: userObject,
  };
};

module.exports = {
  registerUser,
  loginUser,
};
