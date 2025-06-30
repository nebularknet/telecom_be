const UserSchemas = require("../../models/user.model");

// Logout Controller
const logoutController = async (req, res) => {
  try {
    // Assuming authentication middleware has attached user information to req.user
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: "User not authenticated." });
    }

    const userId = req.user.userId;

    // Find the user and clear their refresh token (assuming refresh token is stored in the user model)
    const user = await UserSchemas.findById(userId);

    if (user) {
      user.refreshToken = undefined; // Clear the refresh token field
      await user.save();
    }

    // Clear the JWT cookie on the client side (if using cookies)
    res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });

    res.status(200).json({ message: "Logout successful." });

  } catch (error) {
    process.stderr.write("Logout error:", error);
    res.status(500).json({ message: "Server error during logout." });
  }
};

module.exports = logoutController;
