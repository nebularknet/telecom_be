const express = require('express');
const router = express.Router();
const roleController = require('../controllers/role.controller');
const { auth, checkRole } = require('../middleware/auth.middleware');

// Public routes
router.get('/', roleController.getAllRoles);
router.get('/:id', roleController.getRoleById);

// Protected routes (require authentication and specific roles)
router.post('/', auth, checkRole('SUPER_ADMIN'), roleController.createRole);
router.put('/:id', auth, checkRole('SUPER_ADMIN'), roleController.updateRole);
router.delete('/:id', auth, checkRole('SUPER_ADMIN'), roleController.deleteRole);
router.post('/initialize', auth, checkRole('SUPER_ADMIN'), roleController.initializeRoles);

module.exports = router; 