const UserSchemas = require("../../models/users_model");
const crypto = require("crypto"); // Node.js built-in module for generating tokens
// Assuming a sendEmail function exists elsewhere, e.g., in a utils or service file
// const sendEmail = require("../utils/sendEmail");

// Request Password Reset Controller
const requestPasswordResetController = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required." });
    }

    const user = await UserSchemas.findOne({ email });

    // Even if user not found, send a success response to prevent email enumeration
    if (!user) {
      return res.status(200).json({ message: "If a user with that email exists, a password reset link has been sent." });
    }

    // Generate a reset token
    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetTokenExpires = Date.now() + 3600000; // Token expires in 1 hour

    // Save the token and expiration to the user record
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpires;
    await user.save();

    // Construct the reset URL (replace with your frontend URL)
    const resetUrl = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;

    // TODO: Implement email sending logic using a dedicated email service/utility
    console.log(`Password Reset Token: ${resetToken}`); // Log token for testing if email sending is not set up
    console.log(`Password Reset URL: ${resetUrl}`); // Log URL for testing

    // Example of how you might call a sendEmail function (uncomment and implement sendEmail)
    /*
    try {
      await sendEmail({
        email: user.email,
        subject: "Password Reset Request",
        message: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\nPlease click on the following link, or paste this into your browser to complete the process:\n\n${resetUrl}\n\nIf you did not request this, please ignore this email and your password will remain unchanged.`,
      });
      res.status(200).json({ message: "Password reset email sent." });
    } catch (emailError) {
      console.error("Error sending password reset email:", emailError);
      // If email sending fails, you might want to clear the token from the user record
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save();
      return res.status(500).json({ message: "Error sending password reset email." });
    }
    */

    // Sending a success response even if email sending is not fully implemented yet
    res.status(200).json({ message: "If a user with that email exists, a password reset link has been sent." });

  } catch (error) {
    console.error("Request password reset error:", error);
    res.status(500).json({ message: "Server error during password reset request." });
  }
};

module.exports = requestPasswordResetController;
