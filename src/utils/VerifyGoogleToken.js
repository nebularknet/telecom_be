const { OAuth2Client } = require('google-auth-library');
const env = require('../config/env'); // Import centralized env

// Ensure GOOGLE_CLIENTID is defined before creating the client
if (!env.GOOGLE_CLIENTID) {
  throw new Error(
    'FATAL ERROR: GOOGLE_CLIENTID is not defined in environment variables. Google token verification cannot be initialized.',
  );
}
const client = new OAuth2Client(env.GOOGLE_CLIENTID);

async function verifyGoogleToKen(idToken) {
  // It's good practice to wrap external calls in try...catch,
  // even if the caller is expected to do so.
  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: env.GOOGLE_CLIENTID, // Use the same client ID for audience
    });

    const payload = ticket.getPayload();
    if (!payload) {
      // This case might occur if getPayload returns null or undefined for some reason
      throw new Error('Failed to get payload from Google token.');
    }
    return {
      googleId: payload.sub,
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
    };
  } catch (error) {
    console.error('Error verifying Google token:', error.message);
    // Re-throw the error or a more specific custom error
    // For example, map to an application-specific error
    // For now, re-throwing the original error is fine as it will be caught by the service/controller
    throw error;
  }
}

module.exports = verifyGoogleToKen;
  return {
    googleId: payload.sub,
    email: payload.email,
    name: payload.name,
    picture: payload.picture,
  };
}

module.exports = verifyGoogleToKen;
