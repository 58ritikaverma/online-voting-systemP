const mongoose = require("mongoose");

const Candidate_Schema = mongoose.Schema({
  candidate_name: {
    type: String,
    required: true,
  },
  party_name: {
    type: String,
    required: true,
  },
  party_logo: {
    type: String,
    required: true,
  },
  mainfest: {
    type: String,
    required: true,
  },
  candidate_img: {
    type: String,
    required: true,
  },
  election_id: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Election'
  },
  candidate_age: {
    type: Number,
  },
  voting: {
    type: Number,
    default: 0
  },
});

const Candidate = mongoose.model("Candidate", Candidate_Schema);
Candidate.createIndexes();
module.exports = Candidate;
