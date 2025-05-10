const { OAuth2Client } = require("google-auth-library");
const crypto = require('crypto'); // For generating state

// Define the handler function directly
const handleAuthRequest = async (req, res, next) => {
  try {
    // CORS headers should be handled by global CORS middleware in app.js
    // res.header("Access-Control-Allow-Origin", "http://localhost:5173"); 
    // res.header("Access-Control-Allow-Credentials", "true");
    res.header("Referrer-Policy", "no-referrer-when-downgrade"); // This can remain if specifically needed for Google OAuth

    const redirectURL = process.env.GOOGLE_REDIRECT_URI;
    const googleClientId = process.env.GOOGLE_CLIENTID;
    const googleClientSecret = process.env.GOOGLE_SECRETID;

    if (!redirectURL || !googleClientId || !googleClientSecret) {
      console.error("Google OAuth environment variables are not fully set.");
      return res.status(500).json({ message: "Server configuration error for Google OAuth." });
    }

    const oAuth2Client = new OAuth2Client(
      googleClientId,
      googleClientSecret,
      redirectURL
    );

    // Generate a random state value for CSRF protection
    const state = crypto.randomBytes(16).toString('hex');
    // Store the state in session to verify in callback. Requires session middleware (e.g., express-session)
    // Example: req.session.googleOauthState = state; 
    // (This line is commented out as session setup is not confirmed yet)

    // Generate the url that will be used for the consent dialog.
    const authorizeUrl = oAuth2Client.generateAuthUrl({
      access_type: "offline",
      scope: [
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/userinfo.email", // Added email scope
        "openid"
      ].join(" "), // Join scopes with a space
      prompt: "consent",
      state: state, // Add state parameter for CSRF protection
    });

    // If using sessions, ensure req.session.save() is called if your session store is async
    // For example, if (req.session) req.session.save((err) => { if (err) { return next(err); } res.json({ url: authorizeUrl }); });
    // else res.json({ url: authorizeUrl });
    // For now, assuming no async session save is needed or session is not yet implemented:
    res.json({ url: authorizeUrl });

  } catch (error) {
    console.error("Error generating Google OAuth URL:", error);
    res.status(500).json({ message: "Error initiating Google authentication." });
  }
};

module.exports = handleAuthRequest; // Export the handler function
