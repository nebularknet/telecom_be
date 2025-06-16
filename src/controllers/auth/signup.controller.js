const UserSchemas = require("../../models/user.model");
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
  // Check if req.body exists before attempting to destructure
  // NOTE: Ensure express.json() middleware is applied *before* this route in your app setup.
  if (!req.body) {
    process.stderr.write(
      "Registration error: Request body is missing or empty."
    );
    // Send a 400 Bad Request response indicating the issue
    return res
      .status(400)
      .json({ message: "Request body is missing or empty." });
  }

  const { fullname, email, password, role } = req.body;

  // Basic validation - Ensure required fields are provided
  if (!fullname || !email || !password || !role) {
    // Log the received body for debugging partial data issues
    process.stderr.write("Registration validation failed: Missing fields.", {
      fullname: !!fullname,
      email: !!email,
      password: !!password,
      role: !!role,
    });
    return res
      .status(400)
      .json({ message: "Please provide fullname, email, password, and role." });
  }

  try {
    // Check if a user with the same email already exists
    const existingUser = await UserSchemas.findOne({ email });
    if (existingUser) {
      // If user exists, return a conflict error
      process.stderr.write(
        `Registration conflict: Email ${email} already exists.`
      );
      return res
        .status(409)
        .json({ message: "User with this email already exists." });
    }

    // Generate salt and hash the password
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    // Create a new user instance with hashed password and provided role
    const newUser = new UserSchemas({
      fullname,
      email,
      password: hashedPassword,
      role
    });

    // Save the new user to the database
    await newUser.save();

    // Respond with success message and the new user's ID (excluding sensitive info)
    process.stderr.write(
      `${role} registered successfully: ${newUser.email} (ID: ${newUser._id})`
    );
    res
      .status(201)
      .json({ message: `${role} registered successfully.`, userId: newUser._id });
  } catch (error) {
    process.stderr.write("Registration error:", error);
    // Handle Mongoose validation errors specifically
    if (error.name === "ValidationError") {
      // Extract validation error messages
      const messages = Object.values(error.errors).map((val) => val.message);
      return res
        .status(400)
        .json({ message: `Validation Error: ${messages.join(", ")}` });
    }
    // Handle potential duplicate key errors from MongoDB (though covered by findOne check)
    if (error.code === 11000) {
      process.stderr.write(`Registration duplicate key error: ${error.message}`);
      return res
        .status(409)
        .json({
          message:
            "User with this email already exists (database constraint).",
        });
    }
    // Handle generic server errors
    res
      .status(500)
      .json({ message: "Server error during registration." });
  }
};
module.exports = signupController;
