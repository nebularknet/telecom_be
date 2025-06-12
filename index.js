// dotenv.config(); // This will be handled by env.js to ensure it's loaded first
const env = require('./src/config/env'); // Import centralized env
const app = require('./src/app.js');
const mongoDBConnect = require('./src/config/mongodb.js');

const port = env.PORT;

// Initialize MongoDB connection
mongoDBConnect();

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
