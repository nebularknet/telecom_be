const { OAuth2Client } = require("google-auth-library");
const express = require('express');
const dotenv = require('dotenv');
dotenv.config();
const router = express.Router();

router.post('/admin_signin',function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "http://localhost:5173");
  res.header("Referrer-Policy", "no-referrer-when-downgrade");

  const redirectUrl = "http://127.0.0.1:3000/google_oauth";
  const OAuth2Client = new OAuth2Client(
    process.env.GOOGLE_CLIENTID,
    process.env.GOOGLE_SERECTID,
    redirectUrl
  );
  const authorizeUrl = OAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: 'http://www.googleapis.com/auth/userinfo.profile openId',
    prompt: 'consent',
  });
  res.json({ url: authorizeUrl });
});

module.exports= router;