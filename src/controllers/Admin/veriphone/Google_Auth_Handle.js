const jwt = require("jsonwebtoken");
const User = require("../../../models/users_model");
const verifyGoogleToKen = require("../../../utils/VerifyGoogleToken");

async function handleGoogleLogin() {
  const { token } = req.body;
  const userData = await verifyGoogleToKen(token);
  let user = await User.find({googleId:userData.googleId});
  if(!user){
    user= await User.create({
        ...userData,
        createAt: new Date(),
        lastLogin: new Date(),
        jwtIssueAt: new Date()
    })
  }else{
    user.lastLogin= new Date();
    user.jwtIssueAt= new Date();
    // await user.save();
  }

  const jwtToken = jwt.sign(
    {}
  )
}
