const express = require("express");
const router = express.Router();
const {
  createTimesheet,
  getMyTimesheets,
  updateTimesheet,
  deleteTimesheet
} = require("../controllers/timesheetController");
const auth = require("../middleware/auth");

router.post("/", auth, createTimesheet);
router.get("/", auth, getMyTimesheets);
router.put("/:id", auth, updateTimesheet);
router.delete("/:id", auth, deleteTimesheet);

module.exports = router;
