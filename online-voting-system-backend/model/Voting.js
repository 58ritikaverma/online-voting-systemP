const mongoose = require("mongoose");

const Voting_Schema = mongoose.Schema({
  candidate_name: {
    type: String,
    required: true,
  },
  party_name: {
    type: String,
    required: true,
  },
  user_name: {
    type: String,
    required: true,
  },
  election_id: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Election',
    required: true,
  },
  candidate_id: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Candidate',
    required: true,
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true,
  },
});

const Voting = mongoose.model("Voting", Voting_Schema);
Voting.createIndexes();
module.exports = Voting;
