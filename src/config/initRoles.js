const mongoose = require('mongoose');
const Role = require('../models/role.model');
require('dotenv').config();

const initializeRoles = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Initialize roles
        await Role.initializeRoles();
        console.log('Roles initialized successfully');

        // Disconnect from MongoDB
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    } catch (error) {
        console.error('Error initializing roles:', error);
        process.exit(1);
    }
};

// Run the initialization
initializeRoles(); 