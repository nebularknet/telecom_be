const AppError = require('./AppError');

class TooManyRequestsError extends AppError {
  constructor(message) {
    super(message || 'Too many requests, please try again later.', 429);
  }
}

module.exports = TooManyRequestsError;
