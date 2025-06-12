const User = require('../../models/users_model');
const Verification = require('../../models/verfication_model');
const bcrypt = require('bcryptjs');
const { BadRequestError, NotFoundError } = require('../../utils/errors');

const resetPasswordController = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return next(new BadRequestError('Token and password are required.'));
    }

    // Find the verification entry with the provided token
    const verificationEntry = await Verification.findOne({ token });

    if (!verificationEntry) {
      return next(new BadRequestError('Invalid or expired token.'));
    }

    // Check if the token has expired
    if (verificationEntry.expiresAt < Date.now()) {
      // Optionally remove the expired token
      await Verification.deleteOne({ token });
      return next(new BadRequestError('Token has expired.'));
    }

    // Find the user associated with the token
    const user = await User.findById(verificationEntry.userId);

    if (!user) {
      // This case should ideally not happen if the userId in verification is valid
      return next(new NotFoundError('User not found.'));
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update the user's password
    user.password = hashedPassword;
    await user.save();

    // Invalidate the token by deleting the verification entry
    await Verification.deleteOne({ token });

    res.status(200).json({ message: 'Password reset successful.' });
  } catch (error) {
    console.error('Error resetting password:', error);
    // Pass error to the global error handler
    next(error);
  }
};

module.exports = resetPasswordController;
