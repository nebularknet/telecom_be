const mongoose= require('mongoose') 

const mongoDBConnect= async () => {
  await mongoose.connect("mongodb://localhost:27017/veriphone")
    .then(() => console.log("MongoDB Connected"))
    .catch((err) => console.error("MongoDB Connection Error:", err));
}
module.exports= mongoDBConnect