const UserSchemas = require("../../models/user.model");
const bcryptjs = require("bcryptjs");

// Confirm Password Reset Controller
const confirmPasswordResetController = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ message: "Token and new password are required." });
    }

    // Find user by reset token and check token expiration
    // const user = await UserSchemas.findOne({
    //   resetPasswordToken: token,
    //   resetPasswordExpires: { $gt: Date.now() },
    // });

    // if (!user) {
    //   return res.status(400).json({ message: "Invalid or expired token." });
    // }

    // Hash the new password
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(newPassword, salt);
    const user = await UserSchemas.updateOne({
        password:hashedPassword
      });
    // Update user's password and clear reset token fields
    // user.password = hashedPassword;
    // user.resetPasswordToken = undefined;
    // user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Password reset successfully." });

  } catch (error) {
    process.stderr.write("Confirm password reset error:", error);
    res.status(500).json({ message: "Server error during password reset confirmation." });
  }
};

module.exports = confirmPasswordResetController;
