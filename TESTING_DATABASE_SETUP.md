# Test Database Setup Guide

For comprehensive testing (especially integration and end-to-end tests), a separate, isolated test database is crucial. This ensures that tests do not interfere with development or production data and can run in a controlled environment.

## 1. Configuration

*   **Environment Variable:** Define a specific environment variable for the test database connection string, for example, `TEST_MONGODB_URI`.
    *   This should be configured in your environment (e.g., `.env.test` file, CI/CD environment variables).
    *   Example: `TEST_MONGODB_URI=mongodb://localhost:27017/my_app_test_db`
*   **`src/config/env.js`:** Ensure your environment configuration loader (`src/config/env.js`) can pick up `TEST_MONGODB_URI` when the `NODE_ENV` is set to `test`.
    ```javascript
    // In src/config/env.js (conceptual addition)
    // ...
    const env = {
      NODE_ENV: process.env.NODE_ENV || 'development',
      // ... other vars
      MONGODB_URI: process.env.NODE_ENV === 'test'
                   ? process.env.TEST_MONGODB_URI
                   : process.env.MONGODB_URI,
      // ...
    };
    // ...
    // Critical check for MONGODB_URI should consider this logic or ensure TEST_MONGODB_URI is set for test env.
    if (!env.MONGODB_URI) {
      console.error('FATAL ERROR: MONGODB_URI (or TEST_MONGODB_URI for test environment) is not defined.');
      process.exit(1);
    }
    ```

## 2. Test Setup and Teardown (e.g., using Jest)

*   **Global Setup/Teardown (Jest Example):**
    *   `jest.setup.js` (configured via `setupFilesAfterEnv` in `jest.config.js`):
        ```javascript
        const mongoose = require('mongoose');
        const env = require('./src/config/env'); // Adjust path

        beforeAll(async () => {
          if (env.NODE_ENV !== 'test' || !env.MONGODB_URI) {
            throw new Error(
              'Tests must run with NODE_ENV=test and a valid TEST_MONGODB_URI (via MONGODB_URI in env.js).',
            );
          }
          await mongoose.connect(env.MONGODB_URI);
        });

        afterAll(async () => {
          await mongoose.disconnect();
        });
        ```
*   **Per-Test-Suite or Per-Test Data Cleaning:**
    *   It's essential to clean up data between tests or test suites to ensure test isolation and prevent tests from affecting each other.
    *   `beforeEach` or `afterEach` (or `beforeAll`/`afterAll` per suite):
        ```javascript
        // Example in a test file (e.g., auth.integration.test.js)
        // const User = require('../../src/models/users_model');
        // const PhoneNumberValidation = require('../../src/models/phonenumberValidation');
        // ... import other models

        afterEach(async () => {
          // Clear all relevant collections
          // const collections = mongoose.connection.collections;
          // for (const key in collections) {
          //   const collection = collections[key];
          //   await collection.deleteMany({});
          // }
          // A more targeted approach:
          await User.deleteMany({});
          // await PhoneNumberValidation.deleteMany({});
          // ... delete for other models used in the test suite
        });
        ```
    *   **Alternative for Cleaning:** If using MongoDB Atlas or a cloud provider, consider if their API offers faster ways to reset a test database if performance of `deleteMany` becomes an issue with large schemas. For most cases, `deleteMany` is sufficient.

## 3. Running Tests

*   **NPM Script:** Your `package.json` should have a test script that sets `NODE_ENV=test`.
    ```json
    "scripts": {
      "test": "NODE_ENV=test jest --runInBand"
      // "--runInBand" can be useful if tests are not fully isolated or if resource contention is an issue.
    }
    ```
*   **CI/CD Environment:** Your CI/CD pipeline (e.g., GitHub Actions) must also set `NODE_ENV=test` and provide the `TEST_MONGODB_URI` (or `MONGODB_URI` which gets selected by the test env logic). If using a service container for MongoDB in CI, the URI would point to that container (e.g., `mongodb://localhost:27017/test_db_ci`).

## 4. Considerations

*   **Data Seeding:** Some tests might require specific data to be present before they run. This can be handled in `beforeEach` or `beforeAll` blocks by creating the necessary documents.
*   **Performance:** For very large test suites or frequent runs, ensure the test database is performant. Running MongoDB locally (e.g., via Docker) for local testing is common.
*   **Security:** Never use production database credentials or connection strings for testing. The test database should contain no sensitive real-world data.

This setup provides a reliable environment for running integration tests that interact with the database, ensuring that tests are repeatable and don't corrupt development or production data.
