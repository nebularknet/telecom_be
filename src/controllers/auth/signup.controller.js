const UserSchemas = require("../../models/user.model");
const Role = require("../../models/role.model");
const bcryptjs = require("bcryptjs");

/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     summary: Register a new user or admin.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullname
 *               - email
 *               - password
 *               - role
 *             properties:
 *               fullname:
 *                 type: string
 *                 description: User's full name.
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address.
 *               password:
 *                 type: string
 *                 format: password
 *                 description: User's password.
 *               role:
 *                 type: string
 *                 enum: [user, admin] # Assuming roles are 'user' and 'admin'
 *                 description: User's role (e.g., 'user' or 'admin').
 *     responses:
 *       201:
 *         description: User or admin registered successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User registered successfully.
 *                 userId:
 *                   type: string
 *                   description: The ID of the newly created user.
 *       400:
 *         description: Bad request (e.g., missing fields, validation errors).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Please provide fullname, email, password, and role.
 *       409:
 *         description: Conflict (e.g., user with email already exists).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User with this email already exists.
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Server error during registration.
 */
// Generic Signup Controller
const signupController = async (req, res) => {
  if (!req.body) {
    process.stderr.write("Registration error: Request body is missing.\n");
    return res.status(400).json({ message: "Request body is missing or empty." });
  }

  let { fullname, email, password, role } = req.body;

  if (!fullname || !email || !password) {
    process.stderr.write("Registration validation failed: Missing required fields.\n");
    return res.status(400).json({ message: "Please provide fullname, email, and password." });
  }

  try {
    const existingUser = await UserSchemas.findOne({ email });
    if (existingUser) {
      process.stderr.write(`Registration conflict: Email ${email} already exists.\n`);
      return res.status(409).json({ message: "User with this email already exists." });
    }

    role = role ? role.toUpperCase() : 'FREE_USER';

    const allowedUserRoles = ['FREE_USER', 'TRIAL_USER', 'PAID_USER', 'ENTERPRISE_USER'];
    if (!allowedUserRoles.includes(role)) {
      return res.status(403).json({ message: 'You are not allowed to register with this role.' });
    }

    const userRole = await Role.findOne({ name: role });
    if (!userRole) {
      return res.status(400).json({ message: `Invalid role: ${role}` });
    }

    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    const newUser = new UserSchemas({
      fullname,
      email,
      password: hashedPassword,
      role: userRole._id
    });

    // Save user
    const savedUser = await newUser.save();

    // Populate role info for response
    const populatedUser = await UserSchemas.findById(savedUser._id).populate('role');

    process.stderr.write(`User registered: ${populatedUser.email} (ID: ${populatedUser._id})\n`);

    return res.status(201).json({
      message: 'Registered successfully.',
      user: {
        id: populatedUser._id,
        name: populatedUser.fullname,
        email: populatedUser.email,
        role: populatedUser.role.name,
        permissions: populatedUser.role.permissions // optional
      }
    });

  } catch (error) {
    process.stderr.write("Registration error:\n", error);
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: `Validation Error: ${messages.join(", ")}` });
    }
    if (error.code === 11000) {
      return res.status(409).json({ message: "User with this email already exists (duplicate key)." });
    }
    return res.status(500).json({ message: "Server error during registration." });
  }
};

module.exports = signupController;
