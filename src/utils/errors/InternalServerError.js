const AppError = require('./AppError');

class InternalServerError extends AppError {
  constructor(message) {
    super(message, 500);
  }
}

module.exports = InternalServerError;
