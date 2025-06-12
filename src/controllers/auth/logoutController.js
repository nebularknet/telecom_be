const UserSchemas = require('../../models/users_model');
const { UnauthorizedError } = require('../../utils/errors');

// Logout Controller
const logoutController = async (req, res, next) => {
  try {
    // Assuming authentication middleware has attached user information to req.user
    if (!req.user || !req.user.userId) {
      return next(new UnauthorizedError('User not authenticated.'));
    }

    const userId = req.user.userId;

    // Find the user and clear their refresh token (assuming refresh token is stored in the user model)
    const user = await UserSchemas.findById(userId);

    if (user) {
      user.refreshToken = undefined; // Clear the refresh token field
      await user.save();
    }

    // Clear the JWT cookie on the client side
    res.clearCookie('jid', {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    res.status(200).json({ message: 'Logout successful.' });
  } catch (error) {
    console.error('Logout error:', error);
    // Pass error to the global error handler
    next(error);
  }
};

module.exports = logoutController;
