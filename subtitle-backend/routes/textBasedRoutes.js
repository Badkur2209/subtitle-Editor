const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();
const inputPath = path.join(__dirname, "../data/activity_data_full.json");

// GET Hindi Activity names
router.get("/", (req, res) => {
  try {
    const rawData = fs.readFileSync(inputPath);
    const allActivities = JSON.parse(rawData);

    // Only extract id and Hindi name
    const hindiActivities = allActivities.map((a) => ({
      id: a.id,
      ActivityName_Hindi: a.ActivityName_Hindi
    }));

    res.json(hindiActivities);
  } catch (err) {
    console.error("❌ Failed to read JSON:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
