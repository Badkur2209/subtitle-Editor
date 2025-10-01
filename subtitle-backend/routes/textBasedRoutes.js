//textBasedRoutes.js
import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import { sequelize } from "../db/index.js";
import ActivityData from "../models/ActivityData.js"; // corrected filename

const router = express.Router();

// Fix for __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to local JSON file (if needed)
const dataPath = path.join(__dirname, "../activity_data_full.json");
router.post("/upload-activities", async (req, res) => {
  try {
    const { activities } = req.body;
    if (!activities || !Array.isArray(activities)) {
      return res.status(400).json({ error: "No activities data provided" });
    }

    await ActivityData.bulkCreate(activities, { ignoreDuplicates: true });

    res.json({ success: true, inserted: activities.length });
  } catch (error) {
    console.error("❌ Error uploading activities:", error);
    res.status(500).json({ error: error.message });
  }
});
// =============================
// Import activities from JSON
// =============================
router.get("/import", async (req, res) => {
  try {
    console.log("Starting import...");

    const rawData = fs.readFileSync(dataPath, "utf-8");
    const jsonData = JSON.parse(rawData);

    // Map JSON fields to DB columns
    const formatted = jsonData.map((item) => ({
      Date: item.Date || "",
      url: item.url || "",
      TotalDuration: item.TotalDuration || "",
      MKSA_start: item.MKSA_start || "",
      MKSA_end: item.MKSA_end || "",
      BB_Start: item.BB_Start || "",
      BB_End: item.BB_End || "",
      day: item.day || "",
      ActivityTimeReminderTime: item.ActivityTimeReminderTime || "",
      act_hi: item.act_hi || "",
      act_en: item.act_en || "",
      hi: item.hi || "",
      File: item.File || "",
      en: item.en || "",
      SuvarnAkshar: item.SuvarnAkshar || "",
      BlastingBirthday: item.BlastingBirthday || "",
      MarriageAnniversary: item.MarriageAnniversary || "",
      Manifestation: item.Manifestation || "",
      WishList: item.WishList || "",
      SpecificProblem: item.SpecificProblem || "",
      NoOfSteps: item.NoOfSteps || "",
      RepeatNumber: item.RepeatNumber || "",
      Tantra: item.Tantra || "",
      Mantra: item.Mantra || "",
      Mudra: item.Mudra || "",
      Position: item.Position || "",
      Day: item.Day || "",
      Bath: item.Bath || "",
      Time: item.Time || "",
      Time2: item.Time2 || "",
      Tithi: item.Tithi || "",
      Planet: item.Planet || "",
      Material: item.Material || "",
      MaterialQuantity: item.MaterialQuantity || "",
      Astronomical: item.Astronomical || "",
      "Time ": item["Time "] || "",
      act_bn: item.act_bn || "",
      act_gu: item.act_gu || "",
      act_te: item.act_te || "",
      assigned_to: item.assigned_to || "",
      status: item.status || "",
      bn: item.bn || "",
      gu: item.gu || "",
      te: item.te || "",
      act_mr: item.act_mr || "",
      mr: item.mr || "",
      status_en: item.status_en || "",
      status_hi: item.status_hi || "",
      status_gu: item.status_gu || "",
      status_mr: item.status_mr || "",
      status_te: item.status_te || "",
      status_bn: item.status_bn || "",
    }));

    // Sync and bulk insert
    await sequelize.sync();
    await ActivityData.bulkCreate(formatted, { ignoreDuplicates: true });

    res.json({
      message: `✅ Successfully imported ${formatted.length} records.`,
      imported: formatted.length,
    });
  } catch (err) {
    console.error("❌ Error during import:", err);
    res.status(500).json({
      message: "Server error during import.",
      error: err.message,
    });
  }
});

// =============================
// Get all activities
// =============================
router.get("/activities", async (req, res) => {
  try {
    const allActivities = await ActivityData.findAll();
    res.json(allActivities);
  } catch (err) {
    console.error("❌ Error fetching activities:", err);
    res.status(500).json({ message: "Server error while fetching data." });
  }
});

// router.post("/save", async (req, res) => {
//   try {
//     const { id, translated, targetLang, activityName, status, mksabb } =
//       req.body;

//     console.log("Received save request:", {
//       id,
//       translated,
//       targetLang,
//       activityName,
//       status,
//       mksabb,
//     });

//     if (!id || !targetLang) {
//       return res.status(400).json({ message: "Missing required fields." });
//     }

//     // Map frontend key to DB content column
//     const columnMap = {
//       english: "en",
//       hindi: "hi",
//       telugu: "te",
//       gujarati: "gu",
//       bengali: "bn",
//       marathi: "mr",
//     };

//     // Map frontend key to DB activity name column
//     const activityNameMap = {
//       english: "act_en",
//       hindi: "act_hi",
//       telugu: "act_te",
//       gujarati: "act_gu",
//       bengali: "act_bn",
//       marathi: "act_mr",
//     };

//     const statusMap = {
//       english: "status_en",
//       hindi: "status_hi",
//       telugu: "status_te",
//       gujarati: "status_gu",
//       bengali: "status_bn",
//       marathi: "status_mr",
//     };

//     const contentCol = columnMap[targetLang.toLowerCase()];
//     const nameCol = activityNameMap[targetLang.toLowerCase()];
//     const statusCol = statusMap[targetLang.toLowerCase()];

//     if (!contentCol || !nameCol || !statusCol) {
//       return res.status(400).json({ message: "Invalid target language key." });
//     }

//     const activity = await ActivityData.findByPk(id);
//     if (!activity) {
//       return res.status(404).json({ message: "Activity not found." });
//     }

//     // Update translation content
//     activity[contentCol] = translated?.trim() || "";

//     // Update activity name if provided
//     if (activityName && activityName.trim()) {
//       activity[nameCol] = activityName.trim();
//     }

//     // ✅ Mark status for this language as inreview
//     activity[statusCol] = status || "inreview";

//     // Save mksabb choice
//     if (["same", "different"].includes(mksabb)) {
//       activity.mksabb = mksabb;
//     }

//     // ✅ Keep your general status field updated as well (optional)
//     const translatedExists = activity[contentCol]?.trim() !== "";
//     const nameExists = activity[nameCol]?.trim() !== "";

//     let newStatus = "pending";
//     if (!translatedExists && !nameExists) {
//       newStatus = "pending";
//     } else if (translatedExists && nameExists) {
//       newStatus = "completed";
//     } else {
//       newStatus = "working";
//     }

//     // ✅ Update the language-specific status column
//     const statusColumn = `status_${targetLang.toLowerCase()}`;
//     activity[statusColumn] = "inreview";
//     await activity.save();

//     res.json({
//       message: "✅ Translation saved and marked in review",
//       status: activity[statusCol],
//       mksabb: activity.mksabb,
//     });
//   } catch (error) {
//     console.error("❌ Error saving translation:", error);
//     res.status(500).json({ message: "Server error while saving translation" });
//   }
// });
router.post("/save", async (req, res) => {
  try {
    const { id, translated, targetLang, activityName, status, mksabb } =
      req.body;

    console.log("Received save request:", {
      id,
      translated,
      targetLang,
      activityName,
      status,
      mksabb,
    });

    if (!id || !targetLang) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const columnMap = {
      english: "en",
      hindi: "hi",
      telugu: "te",
      gujarati: "gu",
      bengali: "bn",
      marathi: "mr",
    };
    const nameMap = {
      english: "act_en",
      hindi: "act_hi",
      telugu: "act_te",
      gujarati: "act_gu",
      bengali: "act_bn",
      marathi: "act_mr",
    };
    const statusMap = {
      english: "status_en",
      hindi: "status_hi",
      telugu: "status_te",
      gujarati: "status_gu",
      bengali: "status_bn",
      marathi: "status_mr",
    };

    const langKey = targetLang.toLowerCase();
    const contentCol = columnMap[langKey];
    const nameCol = nameMap[langKey];
    const statusCol = statusMap[langKey];

    if (!contentCol || !nameCol || !statusCol) {
      return res.status(400).json({ message: "Invalid target language key." });
    }

    const activity = await ActivityData.findByPk(id);
    if (!activity) {
      return res.status(404).json({ message: "Activity not found." });
    }

    // Update translation content & name
    activity[contentCol] = translated?.trim() || "";
    if (activityName?.trim()) {
      activity[nameCol] = activityName.trim();
    }

    // Mark language-specific status
    activity[statusCol] = status || "inreview";

    // Save mksabb choice
    if (["same", "different"].includes(mksabb)) {
      activity.mksabb = mksabb;
    }

    // Optionally update overall status
    const translatedExists = !!activity[contentCol]?.trim();
    const nameExists = !!activity[nameCol]?.trim();
    activity.overallStatus =
      translatedExists && nameExists
        ? "completed"
        : translatedExists || nameExists
        ? "working"
        : "pending";

    await activity.save();

    res.json({
      message: "✅ Translation saved and marked in review",
      status: activity[statusCol],
      mksabb: activity.mksabb,
    });
  } catch (error) {
    console.error("❌ Error saving translation:", error);
    res.status(500).json({ message: "Server error while saving translation" });
  }
});

export default router;
