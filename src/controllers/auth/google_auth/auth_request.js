const { OAuth2Client } = require('google-auth-library');
const crypto = require('crypto'); // For generating state
// const dotenv = require('dotenv'); // No longer needed, env.js handles it
const env = require('../../../config/env'); // Import centralized env

const { InternalServerError } = require('../../../utils/errors');

// dotenv.config(); // Handled by env.js
// Define the handler function directly
const handleAuthRequest = async (req, res, next) => {
  try {
    // CORS headers should be handled by global CORS middleware in app.js
    res.header('Referrer-Policy', 'no-referrer-when-downgrade'); // This can remain if specifically needed for Google OAuth

    // Use values from centralized env
    if (!env.GOOGLE_REDIRECT_URI || !env.GOOGLE_CLIENTID || !env.GOOGLE_SECRETID) {
      console.error(
        'Google OAuth environment variables (REDIRECT_URI, CLIENTID, SECRETID) are not fully set in config/env.js.',
      );
      return next(
        new InternalServerError(
          'Server configuration error for Google OAuth. Missing required environment variables.',
        ),
      );
    }

    const oAuth2Client = new OAuth2Client(
      env.GOOGLE_CLIENTID,
      env.GOOGLE_SECRETID,
      env.GOOGLE_REDIRECT_URI,
    );

    // Generate a random state value for CSRF protection
    const state = crypto.randomBytes(16).toString('hex');
    // Store the state in session to verify in callback. Requires session middleware (e.g., express-session)
    // Example: req.session.googleOauthState = state;
    // (This line is commented out as session setup is not confirmed yet)

    // Generate the url that will be used for the consent dialog.
    const authorizeUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email', // Added email scope
        'openid',
      ].join(' '), // Join scopes with a space
      prompt: 'consent',
      state: state, // Add state parameter for CSRF protection
    });

    // If using sessions, ensure req.session.save() is called if your session store is async
    // For example, if (req.session) req.session.save((err) => { if (err) { return next(err); } res.json({ url: authorizeUrl }); });
    // else res.json({ url: authorizeUrl });
    // For now, assuming no async session save is needed or session is not yet implemented:
    res.json({ url: authorizeUrl });
  } catch (error) {
    console.error('Error generating Google OAuth URL:', error);
    // Pass error to the global error handler
    next(error);
  }
};

module.exports = handleAuthRequest; // Export the handler function
