const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken'); // For generating app tokens
const User = require('../../../models/users_model'); // Adjust path if necessary
const crypto = require('crypto'); // For generating placeholder password if needed
const env = require('../../../config/env'); // Import centralized env
const { InternalServerError } = require('../../../utils/errors');

async function getUserData(access_token) {
  try {
    const response = await fetch(
      `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${access_token}`,
    );
    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ message: response.statusText }));
      console.error(
        'Failed to fetch user data from Google:',
        response.status,
        errorData,
      );
      throw new Error(
        `Google API Error: ${response.status} ${errorData.message || ''}`,
      );
    }
    const data = await response.json();
    console.log('Fetched Google user data:', data);
    return data;
  } catch (error) {
    console.error('Error in getUserData:', error);
    throw error; // Re-throw to be caught by the main handler
  }
}

// This function will handle the POST request from /api/user/oauth
const handleGoogleOAuth = async (req, res, next) => {
  // The code might be in req.body for a POST request, or req.query if it's somehow still passed as a query param
  const code = req?.body?.code || req?.query?.code;
  // const receivedState = req?.body?.state || req?.query?.state; // Get state from request - CSRF check is commented out

  const frontendUrl = env.FRONTEND_URL;

  // IMPORTANT: Implement CSRF Protection by verifying the 'state' parameter
  // This requires session middleware (e.g., express-session) to be set up.
  // const sessionState = req.session ? req.session.googleOauthState : null;
  // if (!receivedState || !sessionState || receivedState !== sessionState) {
  //   console.error("Invalid OAuth state (CSRF protection). Received:", receivedState, "Expected:", sessionState);
  //   // Clear the potentially compromised session state if it exists
  //   // if (req.session) req.session.googleOauthState = null;
  //   return res.redirect(303, `${frontendUrl}/?error=invalid_state`);
  // }
  // Clear the state from session after successful verification
  // if (req.session) req.session.googleOauthState = null;

  if (!code) {
    console.log('Authorization code not found in request.');
    return res.redirect(303, `${frontendUrl}/?error=nocode`);
  }

  try {
    // Use values from centralized env
    // Checks for these are now in env.js or could be added if critical for this specific route
    if (!env.GOOGLE_REDIRECT_URI || !env.GOOGLE_CLIENTID || !env.GOOGLE_SECRETID) {
      console.error(
        'Google OAuth environment variables (REDIRECT_URI, CLIENTID, SECRETID) for callback are not fully set in config/env.js.',
      );
      return next(
        new InternalServerError(
          'Server configuration error for Google OAuth callback. Missing required environment variables.',
        ),
      );
    }

    const oAuth2Client = new OAuth2Client(
      env.GOOGLE_CLIENTID,
      env.GOOGLE_SECRETID,
      env.GOOGLE_REDIRECT_URI,
    );

    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);
    console.info('Google OAuth tokens acquired.');

    const googleUserProfile = await getUserData(tokens.access_token);

    if (!googleUserProfile || !googleUserProfile.email) {
      console.error('Failed to fetch Google user profile or email is missing.');
      return res.redirect(303, `${frontendUrl}/?error=profile_fetch_failed`);
    }

    // --- User lookup/creation and JWT generation logic ---
    let user = await User.findOne({ email: googleUserProfile.email });

    if (!user) {
      // If user doesn't exist, create a new one (ensure role is appropriate, e.g., 'user' by default)
      // For admin Google login, you might want to ensure the email is pre-authorized
      // or only allow existing admins to link their Google account.
      // This example assumes new users are created with 'user' role.
      // Adjust role assignment based on your application's logic for admin Google sign-up/sign-in.
      console.log(
        `User not found for email ${googleUserProfile.email}. Creating new user.`,
      );
      user = new User({
        email: googleUserProfile.email,
        googleId: googleUserProfile.sub, // 'sub' is the standard Google User ID
        fullname: googleUserProfile.name, // Map to 'fullname'
        // Handle password based on schema requirements:
        // Option 1: If password can be optional in schema (preferred for OAuth users) - ensure schema allows undefined/null
        // password: undefined,
        // Option 2: Temporary workaround - generate a random, unusable password if schema strictly requires it
        password: crypto.randomBytes(32).toString('hex'), // TEMPORARY: Remove if schema makes password optional
        role: 'admin', // Or 'user', BE CAREFUL with assigning admin role directly
        type: 'google', // Add type field to identify Google authentication
        isVerified: true, // Google email is considered verified
        // You might want to add other fields from googleUserProfile if your schema supports them
        // e.g., profilePicture: googleUserProfile.picture
      });
      await user.save();
      console.log(`New user created with ID: ${user._id}`);
    } else {
      // User exists, update Google ID if not present (linking account)
      if (!user.googleId) {
        user.googleId = googleUserProfile.sub;
        await user.save();
        console.log(`Linked Google ID for existing user: ${user.email}`);
      }
      console.log(`User found: ${user.email}`);
    }

    // Generate your application's JWT
    const jwtPayload = {
      userId: user._id,
      role: user.role,
      email: user.email,
    };
    // Use JWT_SECRET and JWT_EXPIRES_IN from centralized env
    if (!env.JWT_SECRET) {
      console.error('JWT_SECRET is not set in config/env.js. Cannot sign token.');
      return res.redirect(303, `${frontendUrl}/?error=server_config_error`);
    }

    const appToken = jwt.sign(jwtPayload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN,
    });

    // Redirect to frontend with the token (or handle via session/cookies)
    // Sending token in query param is common but consider security implications (e.g., browser history)
    console.info(
      `Successfully authenticated user ${user.email} via Google. Redirecting with token.`,
    );
    res.redirect(303, `${frontendUrl}/auth/google/success?token=${appToken}`);
  } catch (err) {
    console.error(
      'Error during Google OAuth callback flow:',
      err.message,
      err.stack,
    );
    // Pass error to the global error handler, or redirect to a generic frontend error page
    // For consistency with API error handling, using next(error) is preferred here.
    // The global error handler can then decide if it's an operational error to show the user
    // or a generic 500. Redirecting directly bypasses this.
    next(
      new InternalServerError(
        `Error during Google OAuth callback flow: ${err.message}`,
      ),
    );
    // Alternatively, to maintain redirect behavior:
    // return res.redirect(303, `${frontendUrl}/?error=oauth_processing_failed`);
  }
};

module.exports = handleGoogleOAuth; // Export the handler function directly
