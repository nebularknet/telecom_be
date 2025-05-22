const UserSchemas = require("../../models/users_model");
const jwt = require("jsonwebtoken");

// Refresh Token Controller
const refreshTokenController = async (req, res) => {
  try {
    const cookies = req.cookies;

    if (!cookies?.jwt) {
      return res.sendStatus(401); // Unauthorized
    }

    const refreshToken = cookies.jwt;

    // Find user by refresh token
    const user = await UserSchemas.findOne({ refreshToken });

    if (!user) {
      return res.sendStatus(403); // Forbidden
    }

    // Verify refresh token
    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET, // Assuming a separate secret for refresh tokens
      (err, decoded) => {
        if (err || user._id.toString() !== decoded.userId) {
          return res.sendStatus(403); // Forbidden
        }

        // Generate new access token
        const accessToken = jwt.sign(
          {
            userId: decoded.userId,
            role: user.role,
            email: user.email,
          },
          process.env.JWT_SECRET,
          { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
        );

        res.status(200).json({ accessToken });
      }
    );

  } catch (error) {
    console.error("Refresh token error:", error);
    res.status(500).json({ message: "Server error during token refresh." });
  }
};

module.exports = refreshTokenController;
