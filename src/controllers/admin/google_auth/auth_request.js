const dotenv = require("dotenv");
dotenv.config(); // Load environment variables from .env file

const { OAuth2Client } = require("google-auth-library");

// Define the handler function directly
const handleAuthRequest = async (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:5173"); // Consider making this configurable
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Referrer-Policy", "no-referrer-when-downgrade");

  // Ensure this redirectURL matches the one used in the OAuth callback handler
  // AND the one registered in Google Cloud Console
  const redirectURL = "http://127.0.0.1:3000/api/user/oauth"; // Corrected path based on user_route.js and google_oauth.js

  const oAuth2Client = new OAuth2Client(
    process.env.GOOGLE_CLIENTID, // Ensure GOOGLE_CLIENTID is set
    process.env.GOOGLE_SERECTID, // Ensure GOOGLE_SERECTID is set
    redirectURL
  );

  // Generate the url that will be used for the consent dialog.
  const authorizeUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: "https://www.googleapis.com/auth/userinfo.profile openid", // Corrected scope spacing
    prompt: "consent",
  });

  res.json({ url: authorizeUrl });
};

module.exports = handleAuthRequest; // Export the handler function
