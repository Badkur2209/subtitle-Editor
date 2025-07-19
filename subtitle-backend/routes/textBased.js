// subtitle-backend/routes/textBased.js
const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();

const activityFile = path.join(__dirname, "../data/activity_data_full.json");
const translatedFile = path.join(__dirname, "../data/translated.json");

// GET: Read list of activities
router.get("/activities", (req, res) => {
  fs.readFile(activityFile, "utf-8", (err, data) => {
    if (err) return res.status(500).json({ error: "Failed to read file" });
    try {
      const parsed = JSON.parse(data);
      res.json(parsed);
    } catch (err) {
      res.status(500).json({ error: "Invalid JSON format" });
    }
  });
});

// POST: Save translated activity
// router.post("/save", (req, res) => {
//   const { id, translated } = req.body;

//   if (!id || !translated) {
//     return res.status(400).json({ error: "Missing id or translated text" });
//   }

//   try {
//     let existing = [];

//     // Load existing translations if any
//     if (fs.existsSync(translatedFile)) {
//       const raw = fs.readFileSync(translatedFile, "utf-8");
//       existing = JSON.parse(raw);
//     }

//     // Update or add translation
//     const idx = existing.findIndex((item) => item.id === id);
//     if (idx !== -1) {
//       existing[idx].translated = translated;
//     } else {
//       existing.push({ id, translated });
//     }

//     fs.writeFileSync(translatedFile, JSON.stringify(existing, null, 2), "utf-8");
//     res.json({ success: true });
//   } catch (err) {
//     console.error("❌ Error saving translation:", err);
//     res.status(500).json({ error: "Failed to save translation" });
//   }
// });
router.post("/save", (req, res) => {
  const { id, translated, targetLang } = req.body;
  const translatedPath = path.join(__dirname, "../data/translated.json");

  fs.readFile(translatedPath, "utf-8", (err, data) => {
    let existing = [];
    if (!err && data) {
      try {
        existing = JSON.parse(data);
      } catch (_) {}
    }

    // Field name like: ActivityName_Hindi
    const fieldKey = `ActivityName_${targetLang}`;
    const index = existing.findIndex((item) => item.id === id);

    if (index >= 0) {
      existing[index][fieldKey] = translated;
    } else {
      existing.push({
        id,
        [fieldKey]: translated
      });
    }

    fs.writeFile(translatedPath, JSON.stringify(existing, null, 2), (err) => {
      if (err) {
        console.error("❌ Failed to write file", err);
        return res.status(500).json({ error: "Failed to save translation" });
      }
      res.json({ message: "Saved successfully" });
    });
  });
});


module.exports = router;
