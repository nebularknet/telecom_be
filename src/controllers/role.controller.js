const Role = require('../models/role.model');

// Get all roles
const getAllRoles = async (req, res) => {
    try {
        const roles = await Role.find();
        res.json(roles);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching roles', error: error.message });
    }
};

// Get role by ID
const getRoleById = async (req, res) => {
    try {
        const role = await Role.findById(req.params.id);
        if (!role) {
            return res.status(404).json({ message: 'Role not found' });
        }
        res.json(role);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching role', error: error.message });
    }
};

// Create new role
const createRole = async (req, res) => {
    try {
        const { name, category, description, permissions } = req.body;
        
        const existingRole = await Role.findOne({ name });
        if (existingRole) {
            return res.status(400).json({ message: 'Role with this name already exists' });
        }

        const role = new Role({
            name,
            category,
            description,
            permissions
        });

        await role.save();
        res.status(201).json(role);
    } catch (error) {
        res.status(500).json({ message: 'Error creating role', error: error.message });
    }
};

// Update role
const updateRole = async (req, res) => {
    try {
        const { name, category, description, permissions } = req.body;
        
        const role = await Role.findById(req.params.id);
        if (!role) {
            return res.status(404).json({ message: 'Role not found' });
        }

        // Check if new name conflicts with existing role
        if (name !== role.name) {
            const existingRole = await Role.findOne({ name });
            if (existingRole) {
                return res.status(400).json({ message: 'Role with this name already exists' });
            }
        }

        role.name = name;
        role.category = category;
        role.description = description;
        role.permissions = permissions;

        await role.save();
        res.json(role);
    } catch (error) {
        res.status(500).json({ message: 'Error updating role', error: error.message });
    }
};

// Delete role
const deleteRole = async (req, res) => {
    try {
        const role = await Role.findById(req.params.id);
        if (!role) {
            return res.status(404).json({ message: 'Role not found' });
        }

        await role.remove();
        res.json({ message: 'Role deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting role', error: error.message });
    }
};

// Initialize default roles
const initializeRoles = async (req, res) => {
    try {
        await Role.initializeRoles();
        res.json({ message: 'Default roles initialized successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error initializing roles', error: error.message });
    }
};

module.exports = {
    getAllRoles,
    getRoleById,
    createRole,
    updateRole,
    deleteRole,
    initializeRoles
}; 