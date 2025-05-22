const UserSchemas = require("../../models/users_model");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Generic Login Controller
const loginController = async (req, res) => {
  try {
    // Ensure req.body exists
    if (!req.body) {
      console.error("Login error: Request body is missing or empty.");
      return res
        .status(400)
        .json({ message: "Request body is missing or empty." });
    }

    const { email, password, role } = req.body;

    // Validate input
    if (!email || !password || !role) {
      console.warn("Login validation failed: Missing email, password, or role.");
      return res
        .status(400)
        .json({ message: "Email, password, and role are required." });
    }

    // Find user by email
    const user = await UserSchemas.findOne({ email }).select("+password");

    // Check if user exists
    if (!user) {
      console.warn(`Login failed: User not found for email ${email}`);
      return res.status(401).json({ message: "Invalid credentials." });
    }

    // Check if user has the correct role
    if (user.role !== role) {
      console.warn(`${role} login failed: User not ${role} for email ${email}`);
      return res
        .status(401)
        .json({ message: "Invalid credentials or insufficient permissions." });
    }

    // Compare passwords using the imported bcryptjs library
    const isMatch = await bcryptjs.compare(password, user.password);
    if (!isMatch) {
      console.warn(`Login failed: Incorrect password for email ${email}`);
      return res.status(401).json({ message: "Invalid credentials." });
    }

    // Check if JWT_SECRET is available
    const jwtSecret = process.env.JWT_SECRET;
    const jwtExpiresIn = process.env.JWT_EXPIRES_IN || "1h";

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
    const token = jwt.sign(payload, jwtSecret, { expiresIn: jwtExpiresIn });

    // Send success response with token
    console.info(`${role} logged in successfully: ${user.email}`);
    return res.status(200).json({
      message: `${role} login successful.`,
      token: token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(`${role} login error:`, error);
    return res.status(500).json({
      message: "Server error during login.",
      error: error.message,
    });
  }
};

module.exports = loginController;
