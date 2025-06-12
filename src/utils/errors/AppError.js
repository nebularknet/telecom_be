/**
 * Custom error class to create operational, HTTP-friendly errors.
 * @class AppError
 * @extends Error
 */
class AppError extends Error {
  /**
   * Creates an instance of AppError.
   * @param {string} message - Error message.
   * @param {number} statusCode - HTTP status code.
   */
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error'; // 'fail' for 4xx, 'error' for 5xx
    this.isOperational = true; // Distinguishes AppError from other unexpected errors

    Error.captureStackTrace(this, this.constructor); // Maintains stack trace
  }
}

module.exports = AppError;
