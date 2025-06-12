const UserSchemas = require('../../models/users_model');
const jwt = require('jsonwebtoken');
const env = require('../../config/env'); // Import centralized env
const { UnauthorizedError, ForbiddenError } = require('../../utils/errors');

// const ms = require('ms'); // For converting time strings to milliseconds for cookie maxAge - install failed

// Refresh Token Controller
const refreshTokenController = async (req, res, next) => {
  try {
    // Assuming cookie-parser middleware is used
    const refreshTokenFromCookie = req.cookies?.jid;

    if (!refreshTokenFromCookie) {
      return next(new UnauthorizedError('No refresh token provided in cookie.'));
    }

    const refreshToken = refreshTokenFromCookie;

    // Find user by refresh token
    const user = await UserSchemas.findOne({ refreshToken });

    if (!user) {
      // To prevent token reuse if it was somehow compromised and removed from user
      // but still sent by client.
      return next(new ForbiddenError('Invalid refresh token.'));
    }

    // Verify refresh token
    // jwt.verify runs synchronously if no callback is passed.
    // It will throw an error if verification fails.
    const decodedOldToken = jwt.verify(refreshToken, env.REFRESH_TOKEN_SECRET);

    if (user._id.toString() !== decodedOldToken.userId) {
      return next(new ForbiddenError('Refresh token mismatch.'));
    }

    // Generate new Access Token
    const accessToken = jwt.sign(
      {
        userId: user._id, // Use user._id from DB record
        role: user.role,
        email: user.email,
      },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN },
    );

    // Generate new Refresh Token (rotation)
    const newRefreshToken = jwt.sign(
      { userId: user._id },
      env.REFRESH_TOKEN_SECRET,
      { expiresIn: env.REFRESH_TOKEN_EXPIRES_IN },
    );

    // TODO: If storing refresh tokens in DB for more control (e.g. allow list per user)
    // user.refreshToken = newRefreshToken; // Or add to a list of valid tokens
    // await user.save();

    // Set the new refresh token in HttpOnly cookie
    res.cookie('jid', newRefreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'strict',
      // maxAge: ms(env.REFRESH_TOKEN_EXPIRES_IN), // Requires 'ms' library - install failed
    });

    res.status(200).json({ accessToken });
  } catch (error) {
    console.error('Refresh token error:', error);
    // Clear cookie if refresh token processing fails (e.g. it's invalid/expired)
    res.clearCookie('jid', { httpOnly: true, secure: env.NODE_ENV === 'production', sameSite: 'strict' });
    if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
      return next(new ForbiddenError(`Invalid or expired refresh token: ${error.message}`));
    }
    next(error);
  }
};

module.exports = refreshTokenController;
