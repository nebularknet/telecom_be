const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");
const User = require("../../../models/users_model");
const crypto = require('crypto');

async function getUserData(access_token) {
  try {
    const response = await fetch(
      `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${access_token}`
    );
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      console.error("Failed to fetch user data from Google:", response.status, errorData);
      throw new Error(`Google API Error: ${response.status} ${errorData.message || ''}`);
    }
    const data = await response.json();
    console.log("Fetched Google user data:", data);
    return data;
  } catch (error) {
    console.error("Error in getUserData:", error);
    throw error;
  }
}

const handleGoogleOAuth = async (req, res, next) => {
  const code = req?.body?.code || req?.query?.code;
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

  if (!code) {
    console.log("Authorization code not found in request.");
    return res.redirect(303, `${frontendUrl}/?error=nocode`);
  }

  try {
    const redirectURL = process.env.GOOGLE_REDIRECT_URI;
    const googleClientId = process.env.GOOGLE_CLIENTID;
    const googleClientSecret = process.env.GOOGLE_SECRETID;

    if (!redirectURL || !googleClientId || !googleClientSecret) {
      console.error("Google OAuth environment variables for callback are not fully set.");
      return res.status(500).json({ message: "Server configuration error for Google OAuth callback." });
    }

    const oAuth2Client = new OAuth2Client(googleClientId, googleClientSecret, redirectURL);
    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);
    
    const googleUserProfile = await getUserData(tokens.access_token);

    if (!googleUserProfile || !googleUserProfile.email) {
      console.error("Failed to fetch Google user profile or email is missing.");
      return res.redirect(303, `${frontendUrl}/?error=profile_fetch_failed`);
    }

    // Check if user exists in database
    let user = await User.findOne({ email: googleUserProfile.email });

    if (!user) {
      // First time login - Create new user
      console.log(`First time login for ${googleUserProfile.email}. Creating new user.`);
      user = new User({
        email: googleUserProfile.email,
        googleId: googleUserProfile.sub,
        fullname: googleUserProfile.name,
        password: crypto.randomBytes(32).toString('hex'),
        role: 'user', // Default role for new users
        isVerified: true,
        profilePicture: googleUserProfile.picture,
        lastLogin: new Date()
      });
      await user.save();
      console.log(`New user created with ID: ${user._id}`);
    } else {
      // Subsequent login - Update last login time
      console.log(`Subsequent login for ${user.email}`);
      user.lastLogin = new Date();
      await user.save();
    }

    // Generate JWT token
    const jwtPayload = {
      userId: user._id,
      role: user.role,
      email: user.email,
    };
    const jwtSecret = process.env.JWT_SECRET;
    const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '1h';

    if (!jwtSecret) {
      console.error("JWT_SECRET is not set. Cannot sign token.");
      return res.redirect(303, `${frontendUrl}/?error=server_config_error`);
    }

    const appToken = jwt.sign(jwtPayload, jwtSecret, { expiresIn: jwtExpiresIn });
    console.info(`Successfully authenticated user ${user.email} via Google. Redirecting with token.`);
    res.redirect(303, `${frontendUrl}/auth/google/success?token=${appToken}`);

  } catch (err) {
    console.error("Error during Google OAuth callback flow:", err.message, err.stack);
    res.redirect(303, `${frontendUrl}/?error=oauth_processing_failed`);
  }
};

module.exports = handleGoogleOAuth;
