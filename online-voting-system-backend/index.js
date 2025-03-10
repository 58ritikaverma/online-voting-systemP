const express = require("express");
require("./db");
const cors = require("cors");
const path = require('path');
global.appRoot = path.resolve(__dirname);

const PORT = process.env.PORT || 5001;
const app = express();


app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));


// app.get("/", (req, res) => {
//     res.send("Welcome to Online Voting System API");
//   });
  
// Use User Routes
app.use("/api/v1",require("./routes/user")); 

// Use Admin Routes
app.use("/api/v1",require("./routes/admin")); 

app.listen(PORT,()=>{
    console.log(`Start Server on ${PORT}`);
})
