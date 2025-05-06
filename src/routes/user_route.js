const express = require('express')
const AdminLogin = require('../controllers/admin/admin_login')
const AdminSignup = require('../controllers/admin/admin_signup')
const AdminGoogleSignR = require ('../controllers/admin/google_auth/auth_request')
const AdminGoogleOAuth = require ('../controllers/admin/google_auth/google_oauth')
const authrouter = express.Router();



authrouter.post('/admin/signup',AdminSignup)
authrouter.post('/admin/login',AdminLogin)
authrouter.post('/request',AdminGoogleSignR)
authrouter.post('/oauth',AdminGoogleOAuth)

module.exports=authrouter