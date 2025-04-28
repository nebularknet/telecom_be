const app = require('./src/app.js'); 
const port = 3000;
const dotenv = require('dotenv');
const mongoDBConnect = require('./src/config/mongodb.js');
const cors = require('cors')
dotenv.config();

app.use(cors({
    origin: "http://localhost:5173",  // your frontend address
    credentials: true,                // allow cookies if needed
  }));

mongoDBConnect();
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});