const express = require("express");
const router = express.Router();
const Timesheet = require("../models/Timesheet");
const User = require("../models/User");

const auth = require("../middleware/auth");
const isManager = require("../middleware/isManager");

// Get all users
router.get("/users", auth, isManager, async (req, res) => {
  try {
    const users = await User.find({}, "name email role");
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch users", error: err.message });
  }
});

// Get all timesheets (optionally filtered by userId or date range)
router.get("/timesheets", auth, isManager, async (req, res) => {
  try {
    const { userId, startDate, endDate } = req.query;

    const filter = {};
    if (userId) filter.user = userId;
    if (startDate && endDate) {
      filter.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    const timesheets = await Timesheet.find(filter).populate("user", "name email").sort({ date: -1 });
    res.status(200).json(timesheets);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch timesheets", error: err.message });
  }
});

module.exports = router;
