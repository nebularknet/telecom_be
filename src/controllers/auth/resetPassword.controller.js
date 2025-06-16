const User = require('../../models/user.model');
const Verification = require('../../models/verfication.model');
const bcrypt = require('bcryptjs');

const resetPasswordController = async (req, res) => {
  try {
    const { token, password } = req.body;

    // Find the verification entry with the provided token
    const verificationEntry = await Verification.findOne({ token });

    if (!verificationEntry) {
      return res.status(400).json({ message: 'Invalid or expired token.' });
    }

    // Check if the token has expired
    if (verificationEntry.expiresAt < Date.now()) {
      // Optionally remove the expired token
      await Verification.deleteOne({ token });
      return res.status(400).json({ message: 'Token has expired.' });
    }

    // Find the user associated with the token
    const user = await User.findById(verificationEntry.userId);

    if (!user) {
      // This case should ideally not happen if the userId in verification is valid
      return res.status(404).json({ message: 'User not found.' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update the user's password
    user.password = hashedPassword;
    await user.save();

    // Invalidate the token by deleting the verification entry
    await Verification.deleteOne({ token });

    res.status(200).json({ message: 'Password reset successful.' });

  } catch (error) {
    process.stderr.write('Error resetting password:', error);
    res.status(500).json({ message: 'An error occurred while resetting the password.' });
  }
};

module.exports = resetPasswordController;
