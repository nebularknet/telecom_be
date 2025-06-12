const authService = require('../../services/authService');
const env = require('../../config/env'); // Import env for NODE_ENV

/**
 * Handles user login.
 * It expects email, password, and role in the request body.
 * Calls the authService.loginUser to perform authentication logic.
 * On success, it sets a refresh token in an HttpOnly cookie and returns an access token
 * along with user details in the JSON response.
 * Passes errors to the next middleware (global error handler).
 *
 * @async
 * @function loginController
 * @param {object} req - Express request object.
 * @param {object} req.body - The request body.
 * @param {string} req.body.email - User's email.
 * @param {string} req.body.password - User's password.
 * @param {string} req.body.role - User's role.
 * @param {object} res - Express response object.
 * @param {function} next - Express next middleware function.
 */
const loginController = async (req, res, next) => {
  const { email, password, role } = req.body;

  try {
    // Input validation is now handled by express-validator middleware

    const result = await authService.loginUser({ email, password, role });

    // Set refresh token in HttpOnly cookie
    res.cookie('jid', result.refreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production', // Use secure cookies in production
      sameSite: 'strict', // Or 'lax' depending on your needs
      // maxAge: ms(env.REFRESH_TOKEN_EXPIRES_IN), // Convert expiry to milliseconds if needed by cookie-parser or directly
      // Note: env.REFRESH_TOKEN_EXPIRES_IN is a string like '7d'.
      //       maxAge needs milliseconds. A helper function or library (like `ms`) might be needed.
      //       For simplicity, if REFRESH_TOKEN_EXPIRES_IN is '7d', maxAge is 7 * 24 * 60 * 60 * 1000.
      //       Or, jwt.verify will handle expiry validation of the token itself.
      //       The cookie 'expires' or 'maxAge' attribute primarily controls browser storage duration.
      //       Let's set maxAge based on a parsed REFRESH_TOKEN_EXPIRES_IN for browser persistence.
      //       Example: If REFRESH_TOKEN_EXPIRES_IN is '7d', convert '7d' to milliseconds.
      //       This requires a utility like `ms` or manual parsing. For now, relying on JWT expiry.
      //       A common practice is to have cookie maxAge align with token's own expiry.
      //       Let's assume a utility `parseExpiryToMilliseconds` exists or will be added.
      //       For now, we'll omit maxAge and rely on session cookie behavior or JWT internal expiry.
      //       A better approach is to set maxAge (e.g., using a library like 'ms' if installable).
      //       For now, will keep it simple. The token itself has an expiry.
    });

    // Send success response with access token and user data
    console.info(`${result.user.role} logged in successfully: ${result.user.email}`);
    return res.status(200).json({
      message: `${result.user.role} login successful.`,
      accessToken: result.accessToken, // Use the renamed field
      user: result.user,
    });
  } catch (error) {
    // Pass errors to the global error handler
    // Clear cookie if login fails for some reason after it might have been set (though unlikely here)
    // res.clearCookie('jid', { httpOnly: true, secure: env.NODE_ENV === 'production', sameSite: 'strict' });
    next(error);
  }
};

module.exports = loginController;
