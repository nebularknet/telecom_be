const express = require('express')
const UserRouting= require('./routes/user_route')
const dotenv = require('dotenv')
dotenv.config();
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/user',UserRouting);



module.exports = app
