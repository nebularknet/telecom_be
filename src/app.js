const express = require("express");
const UserRouting = require("./routes/user_route");
const dotenv = require("dotenv");
const cors = require("cors");
const GoogleAuthRequest = require("../src/controllers/Admin/google/Google_Auth_request");
const GoogleOAuth = require("../src/controllers/Admin/google/Google_o_Auth");
dotenv.config();
const app = express();
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/user", UserRouting);
app.use("/request", GoogleAuthRequest);
app.use("/oauth", GoogleOAuth);

module.exports = app;
