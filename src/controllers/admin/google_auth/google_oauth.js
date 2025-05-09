const dotenv = require("dotenv");
dotenv.config(); // Load environment variables from .env file

const { OAuth2Client } = require("google-auth-library");

async function getUserData(access_token) {
  const response = await fetch(
    `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${access_token}`
  );
  const data = await response.json();
  console.log("data", data);
}

// This function will handle the POST request from /api/user/oauth
const handleGoogleOAuth = async (req, res, next) => {
  // The code might be in req.body for a POST request, or req.query if it's somehow still passed as a query param
  const code = req.body.code || req.query.code;

  console.log("Received code:", code);

  if (!code) {
    console.log("Authorization code not found in request.");
    // Redirect or send an error response if the code is missing
    // For now, redirecting back to the frontend. Adjust as needed.
    return res.redirect(303, "http://localhost:5173/?error=nocode");
  }

  try {
    // Ensure this redirectURL matches exactly what's configured in your Google Cloud Console
    const redirectURL = "http://localhost:3000/api/user/oauth";
    const oAuth2Client = new OAuth2Client(
      process.env.MUGOOGLE_CLIENTID, // Make sure CLIENT_ID is set in your .env
      process.env.MUGOOGLE_SERECTID, // Make sure CLIENT_SECRET is set in your .env
      redirectURL // Correct third argument
    );
    const r = await oAuth2Client.getToken(code);
    // Make sure to set the credentials on the OAuth2 client.
    await oAuth2Client.setCredentials(r.tokens);
    console.info("Tokens acquired.");
    const user = oAuth2Client.credentials;
    console.log("credentials", user);
    await getUserData(user.access_token); // Pass the access token correctly

    // Decide what to do after successful authentication
    // e.g., create user session, generate JWT, etc.
    // Then redirect the user back to the frontend, possibly with session info or a token
    res.redirect(303, "http://localhost:5173/?loginsuccess=true"); // Example redirect
  } catch (err) {
    console.error("Error during Google OAuth flow:", err);
    // Redirect to an error page or send an error response
    res.redirect(303, "http://localhost:5173/?error=oauthfailed"); // Example error redirect
  }
};

module.exports = handleGoogleOAuth; // Export the handler function directly
