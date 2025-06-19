const UserSchemas = require("../../models/user.model");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Generic Login Controller
const loginController = async (req, res) => {
  try {
    // Ensure req.body exists
    if (!req.body) {
      process.stderr.write("Login error: Request body is missing or empty.");
      return res
        .status(400)
        .json({ message: "Request body is missing or empty." });
    }

    const { email, password, role } = req.body;

    // Validate input
    if (!email || !password || !role) {
      process.stderr.write("Login validation failed: Missing email, password, or role.");
      return res
        .status(400)
        .json({ message: "Email, password, and role are required." });
    }

    // Find user by email
    const user = await UserSchemas.findOne({ email }).select("+password");

    // Check if user exists
    if (!user) {
      process.stderr.write(`Login failed: User not found for email ${email}`);
      return res.status(401).json({ message: "Invalid credentials." });
    }

    // Check if user has the correct role
    // if (user.role !== role) {
    //   process.stderr.write(`${role} login failed: User not ${role} for email ${email}`);
    //   return res
    //     .status(401)
    //     .json({ message: "Invalid credentials or insufficient permissions." });
    // }

    // Compare passwords using the imported bcryptjs library
    const isMatch = await bcryptjs.compare(password, user.password);
    if (!isMatch) {
      process.stderr.write(`Login failed: Incorrect password for email ${email}`);
      return res.status(401).json({ message: "Invalid credentials." });
    }

    // Check if JWT_SECRET is available
    const jwtSecret = process.env.JWT_SECRET;
    const jwtExpiresIn = process.env.JWT_EXPIRES_IN || "1d";

    if (!jwtSecret) {
      process.stderr.write(
        "JWT_SECRET environment variable is not set. Cannot generate token."
      );
      return res.status(500).json({ message: "Server configuration error." });
    }

    // Generate JWT token
    const payload = {
      userId: user._id,
      role: user.role,
      email: user.email,
      name:user.fullname,
    };
    const token = jwt.sign(payload, jwtSecret, { expiresIn: jwtExpiresIn });

    // Send success response with token
    process.stderr.write(`${role} logged in successfully: ${user.email}`);
    return res.status(200).json({
      message: `${role} login successful.`,
      token: token,
      user: {
        id: user._id,
        name:user.fullname,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    process.stderr.write("Login error:", error);
    return res.status(500).json({
      message: "Server error during login.",
      error: error.message,
    });
  }
};

module.exports = loginController;
