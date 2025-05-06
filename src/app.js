const express = require("express");
const UserRouting = require("./routes/user_route");
const dotenv = require("dotenv");
const cors = require("cors");
const UploadFile= require('../src/middlewares/upload')
dotenv.config();
const app = express();
app.options('*any',function(req,res,next){
  res.header("Access-Control-Allow-Origin", 'http://localhost:5173');
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Headers", ['X-Requested-With','content-type','credentials']);
  res.header('Access-Control-Allow-Methods', 'GET,POST');
  res.status(200);
  next()
})
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/user", UserRouting);
app.post('/upload',UploadFile)
module.exports = app;
