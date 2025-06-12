const UserSchemas = require('../../models/users_model');
const { UnauthorizedError, NotFoundError } = require('../../utils/errors');

// Get Me Controller
const getMeController = async (req, res, next) => {
  try {
    // Assuming authentication middleware has attached user information to req.user
    if (!req.user || !req.user.userId) {
      return next(new UnauthorizedError('User not authenticated.'));
    }

    const userId = req.user.userId;

    // Find the user by ID, excluding password and other sensitive tokens
    const user = await UserSchemas.findById(userId).select(
      '-password -emailVerificationToken -resetPasswordToken -resetPasswordExpires',
    );

    if (!user) {
      return next(new NotFoundError('User not found.'));
    }

    // Return the user's information
    res.status(200).json({ user });
  } catch (error) {
    console.error('Get me error:', error);
    // Pass error to the global error handler
    next(error);
  }
};

module.exports = getMeController;
