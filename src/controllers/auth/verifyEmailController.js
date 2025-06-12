const UserSchemas = require('../../models/users_model');
const { BadRequestError } = require('../../utils/errors');

// Verify Email Controller
const verifyEmailController = async (req, res, next) => {
  try {
    // Prefer req.query for tokens in links, but sticking to req.params as per original code
    const { token } = req.params;

    if (!token) {
      return next(new BadRequestError('Verification token is required.'));
    }

    // Find user by verification token and check token expiration (if applicable)
    // Consider adding a check for token expiration if 'emailVerificationExpires' is implemented
    const user = await UserSchemas.findOne({
      emailVerificationToken: token,
      // emailVerificationExpires: { $gt: Date.now() }, // Uncomment if expiration is used
    });

    if (!user) {
      return next(
        new BadRequestError('Invalid or expired verification token.'),
      );
    }

    // Update user's email verification status
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined; // Invalidate the token
    // user.emailVerificationExpires = undefined; // Clear expiration if used
    await user.save();

    res.status(200).json({ message: 'Email verified successfully.' });
  } catch (error) {
    console.error('Email verification error:', error);
    // Pass error to the global error handler
    next(error);
  }
};

module.exports = verifyEmailController;
