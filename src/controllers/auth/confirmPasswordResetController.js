const UserSchemas = require('../../models/users_model');
const bcryptjs = require('bcryptjs');
const { BadRequestError } = require('../../utils/errors');

// Confirm Password Reset Controller
const confirmPasswordResetController = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return next(
        new BadRequestError('Token and new password are required.'),
      );
    }

    // Find user by reset token and check token expiration
    const user = await UserSchemas.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }, // Check if token is not expired
    });

    if (!user) {
      return next(new BadRequestError('Invalid or expired token.'));
    }

    // Hash the new password
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(newPassword, salt);

    // Update user's password and clear reset token fields
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: 'Password reset successfully.' });
  } catch (error) {
    console.error('Confirm password reset error:', error);
    // Pass error to the global error handler
    next(error);
  }
};

module.exports = confirmPasswordResetController;
