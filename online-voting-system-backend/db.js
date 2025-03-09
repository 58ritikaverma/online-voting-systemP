const mongoose = require("mongoose");

// Data Base URL
const monngodb_url = `mongodb://localhost:27017/voting_db`;

mongoose.connect(monngodb_url, {useNewUrlParser: true,useUnifiedTopology: true}).then(()=>{
    console.log("mongoDB is connected");
}).catch((error)=>{
    console.log("mongoDB not connected");
    console.log(error);
});