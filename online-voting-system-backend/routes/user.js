const express = require("express");
const fs = require("fs");
const { body, validationResult, check } = require("express-validator");
const bcrypt = require("bcryptjs");
const fetchUser = require("../middleware/fetchUser");
const jwt = require("jsonwebtoken");
const multer = require("multer");

const JWT_SECERT = "ONLINE_VOTING_SYSTEM_SECRET_KEY";

// Import User Model
const User = require("../model/User");
const Candidate = require("../model/Candidate");
const Voting = require("../model/Voting");
const Election = require("../model/Election");

const route = express.Router();

// Calculate Age from the Date of birth
function calculate_age(dob) {
  var diff_ms = Date.now() - dob.getTime();
  var age_dt = new Date(diff_ms);

  return Math.abs(age_dt.getUTCFullYear() - 1970);
}

const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "files");
    },
    filename: function (req, file, cb) {
      cb(
        null,
        req.body.user_name +
          "-" +
          req.body.adhar_no +
          "-" +
          file.fieldname +
          ".jpg"
      );
    },
  }),
}).any();

// Delete File
const deleteImages = async (fileName) => {
  try {
    await fs.unlinkSync(fileName);
  } catch (error) {
    console.log("Delete Error", error);
  }
};

// Handle compare date
const compareDate = (election_date, now_date) => {
  let electionDate = new Date(election_date).getDate();
  let electionMonth = new Date(election_date).getMonth();
  let electionYear = new Date(election_date).getFullYear();
  let nowDate = new Date(now_date).getDate();
  let nowMonth = new Date(now_date).getMonth();
  let nowYear = new Date(now_date).getFullYear();

  let date1 = electionDate + "-" + electionMonth + "-" + electionYear;
  let date2 = nowDate + "-" + nowMonth + "-" + nowYear;
  if (date1 == date2) {
    return true;
  } else {
    return false;
  }
};

// Route 1 : this route for register user
route.post(
  "/user/register",
  upload,
  [
    body("user_name").isLength({ min: 3 }),
    body("adhar_no").isLength({ min: 12, max: 12 }),
    body("password").isLength({ min: 5 }),
    body("pincode").isNumeric(),
    body("date_of_birth").isLength({ min: 1 }),
  ],
  async (req, res) => {
    // console.log("Received Registration Request:", req.body); //  Debugging log
    // console.log("Received Files:", req.files); //  Check uploaded files
    const {
      adhar_no,
      user_name,
      date_of_birth,
      password,
      state,
      city,
      pincode,
    } = req.body;

    let userImg =
      appRoot +
      "/files/" +
      user_name +
      "-" +
      adhar_no +
      "-" +
      req.files[0].fieldname +
      ".jpg";

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      deleteImages(userImg);
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    let year = new Date(date_of_birth).getFullYear();
    let month = new Date(date_of_birth).getMonth();
    let date = new Date(date_of_birth).getDate();
    const age = calculate_age(new Date(year, month, date));

    if (age < 18) {
      deleteImages(userImg);
      return res.json({ status: false, msg: "You are not eligible for it." });
    }
    try {
      const user = await User.find({ adhar_no });
      if (user.length) {
        deleteImages(userImg);
        return res
          .status(200)
          .json({ status: false, msg: "User Already Exist" });
      }

      const salt = await bcrypt.genSalt(10);
      const secPass = await bcrypt.hash(password, salt);
      const result = await User.create({
        adhar_no,
        user_name,
        date_of_birth,
        state,
        city,
        pincode,
        user_img:
          "/files/" +
          user_name +
          "-" +
          adhar_no +
          "-" +
          req.files[0].fieldname +
          ".jpg",
        password: secPass,
      });
      if (result) {
        return res
          .status(200)
          .json({ status: true, msg: "Create your Account Successfully" });
      } else {
        deleteImages(userImg);
        return res.status(400).json({ status: true, msg: "Some Error" });
      }
    } catch (error) {
      deleteImages(userImg);
      console.log(error);
      res.status(500).json({ status: false, error });
    }
  }
);

// Route 2 : Login User
route.post(
  "/user/login",
  [body("adhar_no").exists(), body("password").exists()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { adhar_no, password } = req.body;
    try {
      let user = await User.findOne({ adhar_no });
      if (!user) {
        return res.status(400).json({
          success: false,
          error: "Please try to login with correct credentials",
        });
      }
      const passwordCompare = await bcrypt.compare(password, user.password);
      if (!passwordCompare) {
        return res.status(400).json({
          success: false,
          error: "Please try to login with correct credentials",
        });
      }

      data = {
        user: {
          id: user.id,
        },
      };
      if (user.verified) {
        user = await User.findOne({ adhar_no }).select("-password");
        const authtoken = jwt.sign(data, JWT_SECERT);
        return res.json({ success: true, user, admin: user.admin, authtoken });
      } else {
        return res.json({
          success: false,
          type: "Not Verified",
          msg: "you are not verified. After verification login again",
        });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ success: false, error: "Some Error occured" });
    }
  }
);

// Route 3 : See Candidate according to election
route.post("/user/candidates-details", fetchUser, async (req, res) => {
  try {
    const { election_id } = req.body;

    const candidate_list = await Candidate.find({ election_id }).select(
      "-voting"
    );
    return res.json({ status: true, candidate_list });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: false, error });
  }
});

// Route 4 : Give the vote according to election
route.post("/user/vote", fetchUser, async (req, res) => {
  try {
    const { election_id, candidate_id } = req.body;

    const admin = await User.findById(req.user.id);
    if (admin.admin) {
      return res.status(401).json({ error: "Admin cannot give vote." });
    }

    if (!candidate_id && !election_id) {
      return res.json({
        msg: "Please provide candidate_id,election_id for give the vote",
      });
    }

    const candidate = await Candidate.find({ _id: candidate_id });
    if (!candidate.length) {
      return res.json({ msg: "Candidate or Election not exist" });
    }

    const election = await Election.findById(election_id);
    let election_date = election.election_date;
    let nowDate = new Date();

    if (!compareDate(election_date,nowDate)) {
      return res
        .status(200)
        .json({ status: false, msg: `You can only vote on election date ${election_date}` });
    }

    const vote = await Voting.find({ user_id: req.user.id, candidate_id });
    if (vote.length) {
      return res.json({ status: false, msg: "Already Voted." });
    }
    const result = await Candidate.findByIdAndUpdate(
      candidate_id,
      { voting: candidate[0].voting + 1 },
      { new: true }
    ).select("-voting");

    const voting_data = await Voting.create({
      candidate_name: candidate[0].candidate_name,
      party_name: candidate[0].party_name,
      election_id: candidate[0].election_id,
      candidate_id: candidate[0]._id,
      user_id: req.user.id,
      user_name: admin.user_name,
    });

    return res.json({
      status: true,
      result,
      msg: "Successfully give the vote.",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: false, error });
  }
});

// Route 5 : Return voted or not response
route.post("/user/vote-status", fetchUser, async (req, res) => {
  try {
    const { election_id, user_id } = req.body;

    const admin = await User.findById(req.user.id);
    if (admin.admin) {
      return res.status(401).json({ error: "Admin cannot give vote." });
    }
    if (!election_id && !user_id) {
      return res.json({
        msg: "Please provide candidate_id,election_id for give the vote",
      });
    }

    const vote = await Voting.find({ election_id, user_id });
    if (vote.length) {
      return res.json({ status: true, vote, msg: "Already Voted." });
    } else {
      return res.json({ status: false, vote, msg: "Not Voted." });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: false, error });
  }
});

module.exports = route;
