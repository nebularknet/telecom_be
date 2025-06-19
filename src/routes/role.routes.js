const express = require('express');
const router = express.Router();
const roleController = require('../controllers/role.controller');
const { auth, checkRole } = require('../middleware/auth.middleware');

// Public routes
router.get('/', roleController.getAllRoles);
router.get('/:id', roleController.getRoleById);

// Protected routes (require authentication and specific roles)
router.post('/', roleController.createRole);
router.put('/:id', roleController.updateRole);
router.delete('/:id', roleController.deleteRole);
router.post('/initialize', roleController.initializeRoles);

module.exports = router; 