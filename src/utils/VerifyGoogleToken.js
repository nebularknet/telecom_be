const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLLE_CLIENT_ID);

async function verifyGoogleToKen(idToken) {
    const ticket = await client.verifyIdToken({
        idToken,
        audience:process.env.GOOGLLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    return{
        googleId: payload.sub,
        email:payload.email,
        name:payload.name,
        picture:payload.picture
    }
}

module.exports = verifyGoogleToKen