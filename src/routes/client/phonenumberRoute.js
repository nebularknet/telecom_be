const express = require('express')
const PhoneNumberSearch = require('../../controllers/client/veriPhoneNumberSearch')
const authrouter = express.Router();



authrouter.post('/verify',PhoneNumberSearch)

module.exports=authrouter