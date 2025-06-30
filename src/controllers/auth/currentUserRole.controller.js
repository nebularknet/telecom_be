// controllers/roleController.js
const User = require('../../models/user.model');

const getCurrentUserRole = async (req, res) => {
  try {
    const userId = req.user.userId; // from JWT middleware

    const user = await User.findById(userId).populate('role');

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    return res.status(200).json({
      role: user.role.name,
      permissions: user.role.permissions,
      description: user.role.description,
    });

  } catch (error) {
    return res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

module.exports = { getCurrentUserRole };