const User = require('../../models/user.model');
const Role = require('../../models/role.model');

const upgradeUserRoleController = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { newRole } = req.body; // e.g., PAID_USER, TRIAL_USER

    if (!newRole) {
      return res.status(400).json({ message: 'New role is required.' });
    }

    const allowedRoles = ['PAID_USER', 'TRIAL_USER', 'ENTERPRISE_USER'];
    const roleToAssign = newRole.toUpperCase();

    if (!allowedRoles.includes(roleToAssign)) {
      return res.status(400).json({ message: 'Invalid upgrade role.' });
    }

    const user = await User.findById(userId).populate('role');

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (roleToAssign === 'TRIAL_USER') {
      // Prevent trial re-usage
      if (user.trialStart && user.trialEnd) {
        return res.status(403).json({ message: 'Trial has already been used.' });
      }

      const trialDays = 7;
      const now = new Date();
      const trialEnd = new Date(now.getTime() + trialDays * 24 * 60 * 60 * 1000);

      const trialRole = await Role.findOne({ name: 'TRIAL_USER' });
      if (!trialRole) {
        return res.status(500).json({ message: 'TRIAL_USER role not found in system.' });
      }

      user.role = trialRole._id;
      user.trialStart = now;
      user.trialEnd = trialEnd;
      await user.save();

      return res.status(200).json({
        message: 'Upgraded to TRIAL_USER successfully.',
        trialStart: now,
        trialEnd,
        trialDaysLeft: trialDays
      });
    }

    // Handle PAID or ENTERPRISE upgrade
    const newRoleDoc = await Role.findOne({ name: roleToAssign });
    if (!newRoleDoc) {
      return res.status(500).json({ message: `${roleToAssign} role not found in system.` });
    }

    user.role = newRoleDoc._id;
    await user.save();

    return res.status(200).json({
      message: `Upgraded to ${roleToAssign} successfully.`
    });

  } catch (err) {
    console.error('Upgrade error:', err);
    return res.status(500).json({ message: 'Server error during role upgrade.' });
  }
};

module.exports = upgradeUserRoleController;