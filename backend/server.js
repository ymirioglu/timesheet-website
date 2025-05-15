const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware'ler (her zaman route'ların üstünde)
app.use(cors());
app.use(express.json()); 

// Routes
const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

const timesheetRoutes = require("./routes/timesheet");
app.use("/api/timesheets", timesheetRoutes);

const adminRoutes = require("./routes/admin");
app.use("/api/admin", adminRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("Timesheet API is running 🚀");
});

// MongoDB bağlantısı
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log("✅ MongoDB connected successfully.");
  app.listen(PORT, () => console.log(`🚀 Server is running on http://localhost:${PORT}`));
})
.catch((err) => {
  console.error("❌ MongoDB connection error:", err);
});
