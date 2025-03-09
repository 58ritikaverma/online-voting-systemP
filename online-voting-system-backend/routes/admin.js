const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require('path')
const fetchUser = require("../middleware/fetchUser");

// Import User Model
const User = require("../model/User");
// Import Election Model
const Election = require("../model/Election");
const Candidate = require("../model/Candidate");
const Voting = require("../model/Voting");

const route = express.Router();

const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "files");
    },
    filename: function (req, file, cb) {
      cb(
        null,
        req.body.candidate_name +
          "-" +
          req.body.party_name +
          "-" +
          req.body.election_id +
          "-" +
          file.fieldname +
          path.extname(file.originalname)
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

// Route 1 : Create Election
route.post("/admin/create-election", fetchUser, async (req, res) => {
  try {
    const admin = await User.findById(req.user.id);
    if (!admin.admin) {
      return res.status(401).json({ error: "Only Access Admin." });
    }

    const { election_name, election_date, no_of_candidate } = req.body;
    if (election_name && election_date && no_of_candidate) {
      const election = await Election.create({
        election_name,
        election_date,
        no_of_candidate,
      });
      return res.json({ status: true, election });
    } else {
      return res.status(200).json({
        status: false,
        msg: "Please provide election_name,election_date,no_of_candidate",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: false, error });
  }
});

// Route 1 : Edit Election
route.put("/admin/update-election", fetchUser, async (req, res) => {
  try {
    const admin = await User.findById(req.user.id);
    if (!admin.admin) {
      return res.status(401).json({ error: "Only Access Admin." });
    }

    const { election_name, election_date, no_of_candidate, _id } = req.body;
    if ((election_name && election_date && no_of_candidate, _id)) {
      const election = await Election.findByIdAndUpdate(
        _id,
        {
          election_name,
          election_date,
          no_of_candidate,
        },
        { new: true }
      );
      return res.json({ status: true, election });
    } else {
      return res.status(200).json({
        status: false,
        msg: "Please provide election_name,election_date,no_of_candidate",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: false, error });
  }
});

// Route 1 : Delete Election
route.post("/admin/delete-election", fetchUser, async (req, res) => {
  try {
    const admin = await User.findById(req.user.id);
    if (!admin.admin) {
      return res.status(401).json({ error: "Only Access Admin." });
    }

    const { _id } = req.body;
    if (_id) {
      const election = await Election.findByIdAndDelete(_id);
      return res.json({ status: true, election });
    } else {
      return res.status(200).json({
        status: false,
        msg: "Please provide _id",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: false, error });
  }
});

// Route 2 : Verify User
route.put("/admin/verify-user", fetchUser, async (req, res) => {
  try {
    const admin = await User.findById(req.user.id);
    if (!admin.admin) {
      return res.status(401).json({ error: "Only Access Admin." });
    }

    const { user_id, status, verified } = req.body;
    if (!user_id) {
      return res.status(200).json({
        status: false,
        msg: "Please provide user_id",
      });
    }
    const user = await User.findByIdAndUpdate(
      user_id,
      { verified: verified, status: status },
      { new: true }
    ).select("-password");
    return res.json({ status: true, user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: false, error });
  }
});

// Route 3 : Add Candidate for Specific Election
route.post("/admin/add-candidate", fetchUser, upload, async (req, res) => {
  try {
    let partyLogo =
      appRoot +
      "/files/" +
      req.body.candidate_name +
      "-" +
      req.body.party_name +
      "-" +
      req.body.election_id +
      "-" +
      req.files[0].fieldname +
      path.extname(req.files[0].originalname);
    let CandidateImg =
      appRoot +
      "/files/" +
      req.body.candidate_name +
      "-" +
      req.body.party_name +
      "-" +
      req.body.election_id +
      "-" +
      req.files[1].fieldname +
      path.extname(req.files[1].originalname);
    let mainfest =
      appRoot +
      "/files/" +
      req.body.candidate_name +
      "-" +
      req.body.party_name +
      "-" +
      req.body.election_id +
      "-" +
      req.files[2].fieldname +
      path.extname(req.files[1].originalname);
    try {
      const admin = await User.findById(req.user.id);
      if (!admin.admin) {
        deleteImages(partyLogo);
        deleteImages(CandidateImg);
        deleteImages(mainfest);
        return res.status(401).json({ error: "Only Access Admin." });
      }

      const { candidate_name, election_id, party_name, candidate_age } =
        req.body;
      if (
        !election_id &&
        !candidate_name &&
        !election_id &&
        !party_name &&
        !candidate_age
      ) {
        return res.status(200).json({
          status: false,
          msg: "Please provide candidate_name, election_id,party_name,candidate_age,party_logo",
        });
      }
      const election = await Election.findById(election_id);
      if (!election) {
        deleteImages(partyLogo);
        deleteImages(CandidateImg);
        deleteImages(mainfest);
        return res.status(401).json({ msg: "Election are not exist" });
      }

      const result = await Candidate.find({
        candidate_name,
        election_id,
        party_name,
        candidate_age,
      });
      const result1 = await Candidate.find({
        election_id,
      });
      if (result.length) {
        deleteImages(partyLogo);
        deleteImages(CandidateImg);
        deleteImages(mainfest);
        return res.status(200).json({
          status: false,
          msg: "Candidate All ready added in this election",
        });
      }

      if (election.no_of_candidate > result1.length) {
        const candidate = await Candidate.create({
          candidate_name,
          election_id,
          party_name,
          candidate_age,
          party_logo:
            "/files/" +
            candidate_name +
            "-" +
            party_name +
            "-" +
            election_id +
            "-" +
            req.files[0].fieldname +
            path.extname(req.files[0].originalname),
          candidate_img:
            "/files/" +
            candidate_name +
            "-" +
            party_name +
            "-" +
            election_id +
            "-" +
            req.files[1].fieldname +
            path.extname(req.files[1].originalname),
          mainfest:
            "/files/" +
            candidate_name +
            "-" +
            party_name +
            "-" +
            election_id +
            "-" +
            req.files[2].fieldname +
            path.extname(req.files[2].originalname)
        });
        return res.json({ status: true, candidate });
      } else {
        deleteImages(partyLogo);
        deleteImages(CandidateImg);
        deleteImages(mainfest);
        return res.json({
          status: false,
          msg: "You cannot add new candidate in this election.",
        });
      }
    } catch (error) {
      console.log(error);
      deleteImages(partyLogo);
      deleteImages(CandidateImg);
      res.status(500).json({ status: false, error });
    }
  } catch (error) {
    console.log(error);
    deleteImages(partyLogo);
    deleteImages(CandidateImg);
    res.status(500).json({ status: false, error });
  }
});

// Route 3 : Edit Candidate for Specific Election
route.post("/admin/edit-candidate", fetchUser, upload, async (req, res) => {
  let partyLogo =
    appRoot +
    "/files/" +
    req.body.candidate_name +
    "-" +
    req.body.party_name +
    "-" +
    req.body.election_id +
    "-" +
    req.files[0].fieldname +
    ".jpg";
  let CandidateImg =
    appRoot +
    "/files/" +
    req.body.candidate_name +
    "-" +
    req.body.party_name +
    "-" +
    req.body.election_id +
    "-" +
    req.files[1].fieldname +
    ".jpg";
  try {
    const admin = await User.findById(req.user.id);
    if (!admin.admin) {
      deleteImages(partyLogo);
      deleteImages(CandidateImg);
      return res.status(401).json({ error: "Only Access Admin." });
    }

    const { _id, candidate_name, election_id, party_name, candidate_age } =
      req.body;
    if (
      !_id &&
      !election_id &&
      !candidate_name &&
      !election_id &&
      !party_name &&
      !candidate_age
    ) {
      return res.status(200).json({
        status: false,
        msg: "Please provide candidate_name, election_id,party_name,candidate_age,party_logo",
      });
    }
    const election = await Election.findById(election_id);
    if (!election) {
      deleteImages(partyLogo);
      deleteImages(CandidateImg);
      return res.status(401).json({ msg: "Election are not exist" });
    }

    const candidate = await Candidate.findByIdAndUpdate(
      _id,
      {
        candidate_name,
        election_id,
        party_name,
        candidate_age,
        party_logo:
          "/files/" +
          candidate_name +
          "-" +
          party_name +
          "-" +
          election_id +
          "-" +
          req.files[0].fieldname +
          ".jpg",
        candidate_img:
          "/files/" +
          candidate_name +
          "-" +
          party_name +
          "-" +
          election_id +
          "-" +
          req.files[1].fieldname +
          ".jpg",
      },
      { new: true }
    );
    return res.json({ status: true, candidate });
  } catch (error) {
    console.log(error);
    deleteImages(partyLogo);
    deleteImages(CandidateImg);
    res.status(500).json({ status: false, error });
  }
});

// Route 3 : Edit Candidate for Specific Election
route.post("/admin/delete-candidate", fetchUser, async (req, res) => {
  try {
    const admin = await User.findById(req.user.id);
    if (!admin.admin) {
      return res.status(401).json({ error: "Only Access Admin." });
    }

    const { _id } = req.body;
    if (!_id) {
      return res.status(200).json({
        status: false,
        msg: "Please provide _id",
      });
    }

    const candidate1 = await Candidate.findById(_id);
    try {
      deleteImages(candidate1.party_logo);
      deleteImages(candidate1.candidate_img);
    } catch (error) {
      console.log(error);
    }
    const candidate = await Candidate.findByIdAndDelete(_id);
    return res.json({ status: true, candidate });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: false, error });
  }
});

// Route 4 : See All Elections
route.get("/admin/all-elections", fetchUser, async (req, res) => {
  try {
    const elections = await Election.find();

    return res.json({ status: true, elections });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: false, error });
  }
});

// Route 5 : See User Approved or pending
route.post("/admin/user-list", fetchUser, async (req, res) => {
  try {
    const admin = await User.findById(req.user.id);
    if (!admin.admin) {
      return res.status(401).json({ error: "Only Access Admin." });
    }
    const { approved_list } = req.body;

    const list = await User.find({
      status: approved_list,
      admin: false,
    }).select("-password");
    return res.json({ status: true, list });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: false, error });
  }
});

// Route 6 : See Candidate according to election
route.post("/admin/candidates-details", fetchUser, async (req, res) => {
  try {
    const admin = await User.findById(req.user.id);
    // if (!admin.admin) {
    //   return res.status(401).json({ error: "Only Access Admin." });
    // }
    const { election_id } = req.body;

    const total_voters = await (await Voting.find({ election_id })).length;
    const election = await await Election.findById(election_id);

    const candidate_list = await Candidate.find({ election_id });
    return res.json({ status: true, election, total_voters, candidate_list });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: false, error });
  }
});

// Route 6 : Declare result
route.post("/admin/declare-result", fetchUser, async (req, res) => {
  try {
    const admin = await User.findById(req.user.id);
    if (!admin.admin) {
      return res.status(401).json({ error: "Only Access Admin." });
    }
    const { election_id, declare } = req.body;
    const election = await await Election.findById(election_id);
    if (!election) {
      res.status(200).json({ status: false, msg: "Election not exist." });
    }

    const result = await await Election.findByIdAndUpdate(
      election_id,
      { declare },
      { new: true }
    );
    return res.json({ status: true, result });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: false, error });
  }
});

// Route 7 : Get All Voted User
route.post("/admin/voted-user", fetchUser, async (req, res) => {
  try {
    const admin = await User.findById(req.user.id);
    if (!admin.admin) {
      return res.status(401).json({ error: "Only Access Admin." });
    }
    const { election_id } = req.body;

    const voted_user_list = await Voting.find({ election_id });
    return res.json({ status: true, voted_user_list });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: false, error });
  }
});

// Route 8 : get all stats for admin dashboard
route.get("/admin/get-all-stats", async (req, res) => {
  try {
    const total_candidate = await (await Candidate.find()).length;
    const total_election = await (await Election.find()).length;
    const total_user = (await (await User.find()).length) - 1;
    return res.json({
      status: true,
      total_candidate,
      total_election,
      total_user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: false, error });
  }
});

// Route 9 : get recent results admin
route.get("/admin/recent-results", fetchUser, async (req, res) => {
  try {
    const admin = await User.findById(req.user.id);
    if (!admin.admin) {
      return res.status(401).json({ error: "Only Access Admin." });
    }

    const candidate_list = await (await Candidate.find()).splice(0, 5);
    return res.json({ status: true, candidate_list });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: false, error });
  }
});

// Route 10 : get recent voters admin
route.get("/admin/recent-voters", fetchUser, async (req, res) => {
  try {
    const admin = await User.findById(req.user.id);
    if (!admin.admin) {
      return res.status(401).json({ error: "Only Access Admin." });
    }

    const voters = await (await Voting.find()).splice(0, 5);
    return res.json({ status: true, voters });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: false, error });
  }
});

// Route 11 : get Proper result
route.post("/admin/result", fetchUser, async (req, res) => {
  try {
    const { election_id } = req.body;
    if (!election_id) {
      return res
        .status(200)
        .json({ status: false, msg: "Please provide the election_id" });
    }

    const admin = await User.findById(req.user.id);
    if (!admin.admin) {
      return res.status(401).json({ error: "Only Access Admin." });
    }

    const voter_list = await Voting.find({ election_id });
    let obj = {};
    let arr = [];
    const total_voters = voter_list.length;
    voter_list.forEach((element) => {
      if (element.candidate_id in arr) {
        obj[element.candidate_id] = obj[element.candidate_id] + 1;
      } else {
        arr.push(element.candidate_id);
        obj[element.candidate_id] = 1;
      }
    });

    Object.keys(obj).forEach(function (key, idx) {
      let voter = obj[key];
      let percentage = (voter * 100) / total_voters;
      obj[key] = percentage;
    });
    console.log(obj);
    res.status(200).json({ status: true, obj });
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: false, error });
  }
});

module.exports = route;
