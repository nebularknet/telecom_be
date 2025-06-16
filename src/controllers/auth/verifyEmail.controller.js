const UserSchemas = require("../../models/user.model");

// Verify Email Controller
const verifyEmailController = async (req, res) => {
  try {
    const { token } = req.params; // Assuming token is passed as a URL parameter

    if (!token) {
      return res.status(400).json({ message: "Verification token is required." });
    }

    // Find user by verification token and check token expiration (if applicable)
    const user = await UserSchemas.findOne({
      emailVerificationToken: token,
      // Assuming emailVerificationExpires field exists and is checked
      // emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired verification token." });
    }

    // Update user's email verification status
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined; // Invalidate the token
    // user.emailVerificationExpires = undefined; // Clear expiration if used
    await user.save();

    res.status(200).json({ message: "Email verified successfully." });

  } catch (error) {
    process.stderr.write("Email verification error:", error);
    res.status(500).json({ message: "Server error during email verification." });
  }
};

module.exports = verifyEmailController;
