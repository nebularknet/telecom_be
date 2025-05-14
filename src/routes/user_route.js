const express = require('express');
const AdminLogin = require('../controllers/auth/admin_login');
const AdminSignup = require('../controllers/auth/admin_signup');
const AdminGoogleSignR = require ('../controllers/auth/google_auth/auth_request');
const AdminGoogleOAuth = require ('../controllers/auth/google_auth/google_oauth');
const authrouter = express.Router();



authrouter.post('/admin/signup',AdminSignup)
authrouter.post('/admin/login',AdminLogin)
authrouter.post('/request',AdminGoogleSignR)
authrouter.get('/oauth',AdminGoogleOAuth) // Changed from post to get

module.exports=authrouter
