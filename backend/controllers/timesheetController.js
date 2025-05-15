const Timesheet = require("../models/Timesheet");

// Create new timesheet entry
exports.createTimesheet = async (req, res) => {
  try {
    const { project, hours, description, date } = req.body;
    const newEntry = await Timesheet.create({
      user: req.user.id,
      project,
      hours,
      description,
      date,
    });
    res.status(201).json(newEntry);
  } catch (err) {
    res.status(500).json({ message: "Failed to create timesheet", error: err.message });
  }
};

// Get all timesheets of the logged-in user
exports.getMyTimesheets = async (req, res) => {
  try {
    const entries = await Timesheet.find({ user: req.user.id }).sort({ date: -1 });
    res.status(200).json(entries);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch timesheets", error: err.message });
  }
};

// Update a timesheet by ID
exports.updateTimesheet = async (req, res) => {
  try {
    const updated = await Timesheet.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Timesheet not found or unauthorized" });
    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ message: "Failed to update timesheet", error: err.message });
  }
};

// Delete a timesheet by ID
exports.deleteTimesheet = async (req, res) => {
  try {
    const deleted = await Timesheet.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });
    if (!deleted) return res.status(404).json({ message: "Timesheet not found or unauthorized" });
    res.status(200).json({ message: "Timesheet deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete timesheet", error: err.message });
  }
};
