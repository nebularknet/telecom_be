const AppError = require('./AppError');
const BadRequestError = require('./BadRequestError');
const NotFoundError = require('./NotFoundError');
const UnauthorizedError = require('./UnauthorizedError');
const ForbiddenError = require('./ForbiddenError');
const InternalServerError = require('./InternalServerError');
const TooManyRequestsError = require('./TooManyRequestsError'); // Added import

module.exports = {
  AppError,
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  InternalServerError,
  TooManyRequestsError, // Added export
};
