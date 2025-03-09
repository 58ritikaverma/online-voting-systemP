const mongoose = require("mongoose");

const Election_Schema = mongoose.Schema({
  election_name: {
    type: String,
    required: true,
  },
  election_date: {
    type: String,
    required: true,
  },
  declare: { type: Boolean, default: false },
  no_of_candidate: {
    type: Number,
  },
});

const Election = mongoose.model("Election", Election_Schema);
Election.createIndexes();
module.exports = Election;
