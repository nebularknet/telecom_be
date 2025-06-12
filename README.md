# Telecom Project API

A backend API for telecom-related services, including user authentication, phone number validation, bulk file uploads, and designed with SaaS capabilities in mind.

## Features

*   User authentication (signup, login, refresh tokens) with JWT and HttpOnly cookies for refresh tokens.
*   Role-Based Access Control (RBAC) with permissions.
*   Phone number validation service (integration with libphonenumber-js, caching).
*   Bulk JSON file upload for phone number data, processed asynchronously.
*   Multi-tenancy support (data isolation via `tenantId` in key models).
*   Password policies and secure password hashing.
*   Rate limiting on API endpoints.
*   Swagger API documentation.
*   (Intended: Security headers via Helmet.js - blocked by npm install issues).

## Tech Stack

*   **Node.js:** JavaScript runtime environment.
*   **Express.js:** Web application framework for Node.js.
*   **MongoDB:** NoSQL database for data storage.
*   **Mongoose:** ODM library for MongoDB.
*   **JSON Web Tokens (JWT):** For generating access and refresh tokens.
*   **bcryptjs:** For hashing passwords.
*   **express-validator:** For input validation.
*   **express-rate-limit:** For rate limiting API requests.
*   **libphonenumber-js:** For phone number parsing and validation.
*   **multer:** For handling file uploads.
*   **Swagger (swagger-jsdoc, swagger-ui-express):** For API documentation.
*   (Intended: `helmet` for security headers, `node-cache` for caching, `cookie-parser` for cookie handling, `ms` for time string conversion - all blocked by npm install issues).

## Prerequisites

*   Node.js (v18.x or later recommended)
*   MongoDB connection string

## Environment Variables

Create a `.env` file in the root of the project. This file should **not** be committed to version control.

Key environment variables (see `src/config/env.js` for defaults and more):

*   `PORT`: Port the application will run on (e.g., 3000).
*   `MONGODB_URI`: MongoDB connection string.
*   `JWT_SECRET`: Secret key for signing JWT access tokens (strong, random string).
*   `JWT_EXPIRES_IN`: Expiry time for access tokens (e.g., '1h').
*   `REFRESH_TOKEN_SECRET`: Secret key for signing JWT refresh tokens (strong, random string, different from `JWT_SECRET`).
*   `REFRESH_TOKEN_EXPIRES_IN`: Expiry time for refresh tokens (e.g., '7d').
*   `COOKIE_SECRET`: Secret for signing cookies (optional, but recommended if used).
*   `CORS_ORIGIN`: Allowed origin for CORS (e.g., 'http://localhost:5173' for frontend).
*   `NODE_ENV`: Application environment ('development', 'production', 'test').

**Email Configuration (for password reset, email verification - using Nodemailer):**
*   `SMTP_HOST`: SMTP server host.
*   `SMTP_PORT`: SMTP server port.
*   `SMTP_USER`: SMTP username.
*   `SMTP_PASSWORD`: SMTP password.
*   `FROM_EMAIL`: Default sender email address.
*   `FROM_NAME`: Default sender name.

**Google OAuth Configuration:**
*   `GOOGLE_CLIENTID`: Google OAuth Client ID.
*   `GOOGLE_SECRETID`: Google OAuth Client Secret.
*   `GOOGLE_REDIRECT_URI`: Google OAuth Redirect URI.
*   `FRONTEND_URL`: Base URL of your frontend application (used for redirects).

**Rate Limiting (defaults are set, but can be overridden):**
*   `RATE_LIMIT_GENERIC_WINDOW_MS`, `RATE_LIMIT_GENERIC_MAX`
*   `RATE_LIMIT_LOGIN_WINDOW_MS`, `RATE_LIMIT_LOGIN_MAX`
*   `RATE_LIMIT_SIGNUP_WINDOW_MS`, `RATE_LIMIT_SIGNUP_MAX`
*   `RATE_LIMIT_PASSWORD_RESET_WINDOW_MS`, `RATE_LIMIT_PASSWORD_RESET_MAX`
*   `RATE_LIMIT_FILE_UPLOAD_WINDOW_MS`, `RATE_LIMIT_FILE_UPLOAD_MAX`

## Installation

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    cd <repository-name>
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
    *Note: The current sandbox environment has issues with `npm install` for new packages. If these persist, some features (Helmet, advanced cookie handling, some caching libraries) might not be available.*

## Running the Application

*   **Development (with Nodemon for auto-restarts):**
    ```bash
    npm run dev
    ```
*   **Production:**
    ```bash
    npm start
    ```
The application will typically start on the port specified in your `.env` file or the default (e.g., 3000).

## API Endpoints

API documentation is available via Swagger UI at `/api-docs` once the application is running.

Key resource groups include:
*   **Auth:** User registration, login, token refresh, user profile.
*   **Client:** Phone number validation.
*   **Upload:** Bulk file uploads.

## Testing

*   **Unit Tests (authService specific, using Node.js assert):**
    ```bash
    npm run test:authservice
    ```
    *Note: Full unit and integration testing setup (e.g., with Jest/Supertest and a test database) is outlined in `authController.test.js`, `auth.integration.test.js`, and `TESTING_DATABASE_SETUP.MD` but could not be fully implemented due to `npm install` issues for testing frameworks.*
*   **All Tests (if a general test script is configured):**
    ```bash
    npm test
    ```

## Linting & Formatting

*   **Lint:**
    ```bash
    npm run lint
    ```
*   **Check Formatting (Prettier):**
    ```bash
    npm run format:check
    ```
*   **Apply Formatting (Prettier):**
    ```bash
    npm run format:write
    ```

## Architectural Overview

The application follows a structure similar to Model-View-Controller (MVC), with a clear separation of concerns:
*   **Models (`src/models`):** Define Mongoose schemas for database interaction.
*   **Services (`src/services`):** Encapsulate business logic (e.g., authentication, phone validation).
*   **Controllers (`src/controllers`):** Handle incoming HTTP requests, interact with services, and send responses.
*   **Routes (`src/routes`):** Define API endpoints and map them to controllers.
*   **Middlewares (`src/middlewares`):** Handle cross-cutting concerns like authentication, authorization (RBAC), error handling, rate limiting, and file uploads.
*   **Configuration (`src/config`):** Centralized configuration for environment variables, Swagger, permissions, etc.
*   **Utilities (`src/utils`):** Helper functions and custom error classes.

Key architectural decisions are further documented in `ARCHITECTURE.MD`.

## Security Notes

*   **Password Hashing:** Passwords are hashed using `bcryptjs`.
*   **JWT Security:** Access and refresh tokens are used. Refresh tokens are intended to be stored in HttpOnly cookies for better XSS protection.
*   **Input Validation:** `express-validator` is used for validating and sanitizing user input.
*   **Rate Limiting:** Implemented to prevent abuse of API endpoints.
*   **Role-Based Access Control (RBAC):** A basic RBAC system is in place with permissions mapped to roles.
*   **(Intended) Security Headers:** Helmet.js was planned for adding various security-related HTTP headers, but installation was not possible in the current environment.

## Contribution Guidelines

(Optional: Add guidelines if this were an open project).
