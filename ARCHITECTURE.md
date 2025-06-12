# Architecture Decisions Document

This document outlines key architectural decisions made for the Telecom Project API.

## 1. Overall Structure

*   **Pattern:** The application generally follows a Model-View-Controller (MVC)-like pattern, adapted for an API backend. "Views" are the JSON responses.
    *   **Models (`src/models`):** Mongoose schemas defining data structures and database interactions.
    *   **Controllers (`src/controllers`):** Handle HTTP request/response lifecycle, parse input, call services, and format responses. They are responsible for HTTP concerns.
    *   **Services (`src/services`):** Encapsulate core business logic, data manipulation, and interactions with models or external services (e.g., phone validation). They are designed to be reusable and independent of specific HTTP contexts.
    *   **Routes (`src/routes`):** Define API endpoints and map them to specific controller actions. Also responsible for applying route-specific middleware (validation, authorization).
    *   **Middlewares (`src/middlewares`):** Handle cross-cutting concerns applicable to multiple routes, such as authentication, authorization (RBAC), error handling, rate limiting, and file uploads (Multer).
    *   **Configuration (`src/config`):** Centralized management for environment variables (`env.js`), Swagger API documentation (`swagger.js`), permissions (`permissions.js`), etc.
    *   **Utilities (`src/utils`):** Shared helper functions (e.g., `sendEmail.js`) and custom error classes (`src/utils/errors`).

## 2. Authentication and Authorization

*   **Authentication:**
    *   **JWT-based:** Uses JSON Web Tokens for stateless authentication.
    *   **Access Tokens:** Short-lived, sent in the `Authorization` header (Bearer scheme). Used to access protected resources.
    *   **Refresh Tokens:** Longer-lived, used to obtain new access tokens.
        *   **Storage:** Stored in `HttpOnly` cookies (`jid`) to mitigate XSS risks. The cookie should be `Secure` in production and use `SameSite=Strict` (or `Lax`).
        *   **Rotation:** Refresh tokens are rotated upon use (a new refresh token is issued when an old one is used to get a new access token) to enhance security.
*   **Authorization (RBAC):**
    *   **Role-Based:** Users are assigned roles (e.g., `client`, `admin`, `tenant_admin`).
    *   **Permissions Mapping (`src/config/permissions.js`):** Roles are mapped to a list of specific permission strings (e.g., `phonenumber:validate`, `admin:manage_tenants`).
    *   **`checkPermission` Middleware:** A middleware factory `checkPermission(requiredPermission)` is used to protect routes based on the permissions associated with the authenticated user's role.

## 3. Error Handling

*   **Custom Error Classes (`src/utils/errors`):** A base `AppError` class extends `Error`, adding `statusCode` and `isOperational` properties. Specific error classes (e.g., `BadRequestError`, `NotFoundError`, `UnauthorizedError`, `ForbiddenError`, `InternalServerError`, `TooManyRequestsError`) inherit from `AppError`.
*   **Global Error Handler (`src/app.js`):** A final error-handling middleware catches all errors passed via `next(error)`.
    *   If the error is an instance of `AppError` (operational), it sends a structured JSON response with the error's message and status code.
    *   For non-operational errors (or unexpected errors), it logs the full error and sends a generic 500 Internal Server Error response to the client.
    *   Stack traces are included in error responses only in the 'development' environment.

## 4. Input Validation

*   **`express-validator`:** Used for validating and sanitizing incoming request data (body, query, params).
*   **Route-Level:** Validation rules are defined in route files and applied as middleware before controllers are invoked.
*   **Custom `validate` Middleware:** A helper middleware in `auth_route.js` (and potentially reusable) checks `validationResult` from `express-validator` and calls `next(new BadRequestError(...))` if validation fails.
*   **Service-Level Validation:** Services may perform additional business logic validation (e.g., password policy complexity in `authService.js`).

## 5. Multi-tenancy

*   **Strategy:** Shared Database, Shared Schema with Tenant ID.
*   **`tenantId` Field:** A `tenantId` field (referencing a `Tenants` collection) is added to relevant Mongoose schemas (`User`, `PhoneNumberValidation`, `VerificationPhone`) to associate data with a specific tenant.
*   **Data Isolation:** Intended to be enforced at the query level in services (e.g., all database lookups for tenant-specific data must include a `WHERE tenantId = ?` clause). The `tenantId` would typically be derived from the authenticated user's claims (e.g., from their JWT). *Full implementation of query modification is a larger ongoing task.*
*   **`Tenant` Model:** A dedicated `Tenant` model stores tenant-specific information, including name, status, and basic subscription details.

## 6. Caching

*   **In-Memory Caching:** Implemented for the phone number validation service (`src/service/libphonenumber.js`) to reduce redundant external lookups or processing for frequently queried numbers.
*   **`cacheService.js`:** A simple custom in-memory cache was created due to `npm install` issues preventing the use of libraries like `node-cache`. It provides basic `get`, `set`, `del`, `flush` with TTL support.

## 7. Asynchronous Processing

*   **File Uploads (`src/middlewares/upload.js`):**
    *   Large file processing (reading JSON content, transforming, and batch database inserts) is deferred using `setImmediate`.
    *   The API responds quickly to the client (`202 Accepted`) after initial file validation, while the actual data processing happens in the background.
    *   Errors during background processing are logged to the console, as the client request is already completed. More sophisticated notification mechanisms (e.g., webhooks, email) would be needed for production.

## 8. Security Headers

*   **Helmet.js:** Intended to be used for setting various security-related HTTP headers (e.g., XSS protection, HSTS, content security policy). Installation was blocked by `npm install` issues in the current environment.

## 9. Database

*   **MongoDB:** Chosen as the NoSQL database.
*   **Mongoose:** ODM used for schema definition, validation, and database interaction.
*   **Indexing:** Indexes are added to Mongoose schemas for frequently queried fields to improve performance (e.g., user email, role, tenantId, phone numbers).

## 10. Logging

*   **HTTP Request Logging:** `morgan('dev')` is used for request logging in the development environment.
*   **Application Logging:** `console.log`, `console.warn`, `console.error` are used throughout the application. A more structured and configurable logging solution (e.g., Winston, Pino) would be beneficial for production environments.

## 11. Environment Configuration

*   **Centralized (`src/config/env.js`):** All environment-dependent configurations (database URIs, JWT secrets, API keys, rate limits, etc.) are managed via a central `env.js` file, which loads variables from a `.env` file using `dotenv`.
*   **Validation:** Critical environment variables are validated at startup in `env.js`, and the application will exit if they are missing.

## 12. API Documentation

*   **Swagger/OpenAPI:** `swagger-jsdoc` and `swagger-ui-express` are used to generate and serve API documentation from JSDoc comments in route files.
*   Accessible at `/api-docs`.

This document provides a snapshot of the current architecture and key decisions. It should be updated as the application evolves.
