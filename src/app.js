const express = require('express')
const UserRouting= require('./routes/user_route')

const app = express();
app.use('/api/user',UserRouting);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

module.exports = app
