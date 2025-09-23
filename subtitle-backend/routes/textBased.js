// routes/textbased.js
const express = require("express");
const router = express.Router();
const ActivityData = require("../models/ActivityData");
import { authenticateToken } from "../middleware/auth.js";

// GET /activities
// router.get("/activities", async (req, res) => {
//   try {
//     const activities = await ActivityData.findAll();

//     // Map your DB columns to keys expected by frontend (optional)
//     const formatted = activities.map((act) => ({
//       id: act.id,
//       en_1: act.en_1,
//       ActivityName_Hindi: act.hi_1,
//       url: act.url,
//       ActivityName_Marathi: act.mr_1,
//       date: act.todate,
//     }));

//     res.json(formatted);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Failed to fetch activities" });
//   }
// });
// =============================
// Get activities with role-based filtering
// =============================
router.get("/activities", authenticateToken, async (req, res) => {
  try {
    const username = req.user.username; // this comes from your JWT payload

    const activities = await ActivityData.findAll({
      where: { assigned_to: username }, // ✅ Only rows assigned to THIS user
      order: [["Date", "DESC"]],
    });

    res.json({ success: true, activities });
  } catch (err) {
    console.error("❌ Error fetching activities:", err);
    res.status(500).json({ message: "Server error while fetching data." });
  }
});
// POST /save - update translation
router.post("/save", async (req, res) => {
  const { id, translated, targetLang } = req.body;
  debugger;
  if (!id || !translated || !targetLang) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Map plain language keys (e.g., 'en') to DB columns
  const langColumnMap = {
    en: "en_1",
    en: "en_2",
    en: "en_3",
    en: "en_4",
    hi: "hi_1",
    Telugu: "te_1",
    Marathi: "mr_1",
  };
  const column = langColumnMap[targetLang];
  if (!column)
    return res.status(400).json({ error: "Invalid target language" });

  try {
    const activity = await ActivityData.findByPk(id);
    if (!activity) return res.status(404).json({ error: "Activity not found" });

    // Dynamically update correct column
    activity[column] = translated;
    await activity.save();

    res.json({ message: "Translation saved successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Save failed" });
  }
});

module.exports = router;
