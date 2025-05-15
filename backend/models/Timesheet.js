const mongoose = require("mongoose");

const TimesheetSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  project: {
    type: String,
    enum: ["Firma A", "Firma B", "Firma C", "Internal", "Resmî Tatil", "İzin"],
    required: true,
  },
  hours: {
    type: Number,
    min: 1,
    max: 8,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.model("Timesheet", TimesheetSchema);
