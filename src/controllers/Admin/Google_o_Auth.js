const { OAuth2Client } = require("google-auth-library");
const express = require('express');
const dotenv = require('dotenv');
dotenv.config();
const router = express.Router();

async function getUserData(accesstoken) {
    const response = await fetch(
      `https://www.googleapis.com/oauth2/v3/userinfo?access_token${accesstoken}`
    );
    const data = await response.json();
    console.log("data", data);
  }
  
  
  // get home apge
  router.get('/', async function (req, res, next) {
    const code = req.query.code;
    try {
      const redirectUrl = "https://127.0.0.1:3000/google_oauth";
      const OAuth2Client = new OAuth2Client(
        process.env.GOOGLE_CLIENTID,
        process.env.GOOGLE_SERECTID,
        redirectUrl
      );
      const res = await OAuth2Client.getToken(code);
      await OAuth2Client.setCredentials(res.tokens);
      console.log("token acquired");
      const user = OAuth2Client.Credentials;
      console.log("credentials", user);
      await getUserData(user.access_token);
    } catch (err) {
      console.log(err);
    }
  });
  module.exports= router;