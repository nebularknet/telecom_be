const authService = require('../../services/authService');

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
const signupController = async (req, res, next) => {
  const { fullname, email, password } = req.body;
  // role is optional and defaults to 'client' if not provided or invalid,
  // or handled by validation rule `optional().isIn(['client', 'admin'])`
  // If role is strictly required and must be one of the two, the validator handles it.
  // If not provided, and you want a default here, you can set it.
  // role is optional and defaults to 'client' if not provided by user or validator
  const role = req.body.role || 'client';

  try {
    // Validation is handled by express-validator middleware.
    // The controller assumes data is valid if it reaches here.

    const user = await authService.registerUser({
      fullname,
      email,
      password,
      role,
    });

    // Respond with success message and the new user's data (excluding sensitive info)
    console.info(
      `${user.role} registered successfully: ${user.email} (ID: ${user._id})`,
    );
    res.status(201).json({
      message: `${user.role} registered successfully.`,
      userId: user._id, // Or return the whole user object as received from service
      // user: user // if service returns the user object
    });
  } catch (error) {
    // Pass errors to the global error handler
    next(error);
  }
};
module.exports = signupController;
