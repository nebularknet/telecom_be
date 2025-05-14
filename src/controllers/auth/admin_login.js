const UserSchemas = require("../../models/users_model");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Admin Login
const adminLogin = async (req, res) => {
  try {
    // Ensure req.body exists
    if (!req.body) {
      console.error("Admin login error: Request body is missing or empty.");
      return res
        .status(400)
        .json({ message: "Request body is missing or empty." });
    }

    const { email, password, role } = req.body;

    // Validate input
    if (!email || !password) {
      console.warn("Admin login validation failed: Missing email or password.");
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    // Find user by email
    const user = await UserSchemas.findOne({ email }).select("+password");

    // Check if user exists
    if (!user) {
      console.warn(`Admin login failed: User not found for email ${email}`);
      return res.status(401).json({ message: "Invalid credentials." });
    }

    // Check if user is an admin
    if (role !== "admin" || user.role !== "admin") {
      console.warn(
        `Admin login failed: User not admin for email ${email}`
      );
      return res
        .status(401)
        .json({ message: "Invalid credentials or insufficient permissions." });
    }

    // Compare passwords using the imported bcryptjs library
    const isMatch = await bcryptjs.compare(password, user.password);
    if (!isMatch) {
      console.warn(`Admin login failed: Incorrect password for email ${email}`);
      return res.status(401).json({ message: "Invalid credentials." });
    }

    // Check if JWT_SECRET is available
    const jwtSecret = process.env.JWT_SECRET;
    const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '1h';

    if (!jwtSecret) {
      console.error(
        "JWT_SECRET environment variable is not set. Cannot generate token."
      );
      return res.status(500).json({ message: "Server configuration error." });
    }

    // Generate JWT token
    const payload = {
      userId: user._id,
      role: user.role,
      email: user.email,
    };
    const token = jwt.sign(
      payload,
      jwtSecret,
      { expiresIn: jwtExpiresIn }
    );

    // Send success response with token
    console.info(`Admin logged in successfully: ${user.email}`);
    return res.status(200).json({
      message: "Admin login successful.",
      token: token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);
    return res.status(500).json({ 
      message: "Server error during admin login.",
      error: error.message 
    });
  }
};

module.exports = adminLogin;
