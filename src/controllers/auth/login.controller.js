const UserSchemas = require("../../models/user.model");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Generic Login Controller
const loginController = async (req, res) => {
  try {
    if (!req.body) {
      process.stderr.write("Login error: Request body is missing.\n");
      return res.status(400).json({ message: "Request body is missing or empty." });
    }

    const { email, password } = req.body;

    if (!email || !password) {
      process.stderr.write("Login validation failed: Missing email or password.\n");
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = await UserSchemas.findOne({ email })
      .select('+password')
      .populate('role'); // Populate role name from ObjectId

    if (!user) {
      process.stderr.write(`Login failed: User not found (${email})\n`);
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const isMatch = await bcryptjs.compare(password, user.password);
    if (!isMatch) {
      process.stderr.write(`Login failed: Incorrect password for ${email}\n`);
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const jwtSecret = process.env.JWT_SECRET;
    const jwtExpiresIn = process.env.JWT_EXPIRES_IN || "1d";

    if (!jwtSecret) {
      process.stderr.write("Missing JWT_SECRET env var.\n");
      return res.status(500).json({ message: "Server config error: Missing JWT secret." });
    }

    // Build payload with populated role info
    const payload = {
      userId: user._id,
      role: user.role.name,   // Use role name here
      email: user.email,
      name: user.fullname,
    };

    const token = jwt.sign(payload, jwtSecret, { expiresIn: jwtExpiresIn });

    process.stderr.write(`${user.role.name} logged in: ${user.email}\n`);
    return res.status(200).json({
      message: `${user.role.name} login successful.`,
      token: token,
      user: {
        id: user._id,
        name: user.fullname,
        email: user.email,
        role: user.role.name, // Send readable role
        permissions: user.role.permissions, // Optional: return permissions too
      },
    });

  } catch (error) {
    process.stderr.write("Login error:\n", error);
    return res.status(500).json({
      message: "Server error during login.",
      error: error.message,
    });
  }
};

module.exports = loginController;
