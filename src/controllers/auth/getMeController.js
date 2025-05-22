const UserSchemas = require("../../models/users_model");

// Get Me Controller
const getMeController = async (req, res) => {
  try {
    // Assuming authentication middleware has attached user information to req.user
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: "User not authenticated." });
    }

    const userId = req.user.userId;

    // Find the user by ID, excluding the password field
    const user = await UserSchemas.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Return the user's information
    res.status(200).json({ user });

  } catch (error) {
    console.error("Get me error:", error);
    res.status(500).json({ message: "Server error getting user information." });
  }
};

module.exports = getMeController;
