const express = require('express')
const UserRouting= require('./routes/user_route')
const dotenv = require('dotenv')
const cors = require('cors')

dotenv.config();
const app = express();
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
  }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/user',UserRouting);


module.exports = app
