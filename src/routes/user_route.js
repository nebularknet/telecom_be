const express = require('express')
const AdminLogin = require('../controllers/Admin/Admin_Login')
const AdminSignup = require('../controllers/Admin/Admin_Signup')
const authrouter = express.Router();



authrouter.post('/admin/signup',AdminSignup)
authrouter.post('/admin/login',AdminLogin)

module.exports=authrouter