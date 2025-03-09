const mongoose = require("mongoose");

const User_Schema = mongoose.Schema({
  adhar_no: { type: Number, unique: true, required: true },
  user_name: { type: String, required: true },
  user_img: { type: String, required: true },
  date_of_birth: { type: Date, required: true },
  state: { type: String, required: true },
  city: { type: String, required: true },
  pincode: { type: Number, required: true },
  password: { type: String, required: true },
  verified: {type: Boolean, default: false},
  status: {type: String, default: 'Pending'},
  admin: {type: Boolean,default: false},
});

const User = mongoose.model("User", User_Schema);
User.createIndexes();
module.exports = User;
