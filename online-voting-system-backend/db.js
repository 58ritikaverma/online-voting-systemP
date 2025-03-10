// const mongoose = require("mongoose");

// // Data Base URL
// const monngodb_url = `mongodb://localhost:27017/voting_db`;

// mongoose.connect(monngodb_url, {useNewUrlParser: true,useUnifiedTopology: true}).then(()=>{
//     console.log("mongoDB is connected");
// }).catch((error)=>{
//     console.log("mongoDB not connected");
//     console.log(error);
// });

const mongoose = require("mongoose");

mongoose.set("strictQuery", true); // Set strictQuery to avoid deprecation warnings

const mongodb_url = "mongodb://localhost:27017/voting_db";

mongoose.connect(mongodb_url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 10000, // Increase timeout (default is 30000ms)
  })
  .then(() => {
    console.log("MongoDB is connected");
  })
  .catch((error) => {
    console.error("MongoDB connection error:",error);
});