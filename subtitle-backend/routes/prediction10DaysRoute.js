import express from "express";
import Prediction10Days from "../models/Prediction10Days.js";
import { Op } from "sequelize";
const router = express.Router();

// router.post("/tenday", async (req, res) => {
//   try {
//     const { predictions } = req.body;
//     if (!predictions || !Array.isArray(predictions)) {
//       return res.status(400).json({ error: "Invalid predictions input" });
//     }

//     await Prediction10Days.bulkCreate(predictions, { validate: true });
//     res.json({ success: true, message: "10-Day predictions uploaded" });
//   } catch (err) {
//     console.error("Error uploading 10-day predictions:", err);
//     res.status(500).json({ error: "Database error while saving predictions" });
//   }
// });

// Assign prediction tasks to a user

router.post("/tenday", async (req, res) => {
  try {
    let { predictions } = req.body;

    if (!predictions || !Array.isArray(predictions)) {
      return res.status(400).json({ error: "Invalid predictions input" });
    }

    // drop id so DB can auto-generate
    predictions = predictions.map(({ id, ...rest }) => rest);

    await Prediction10Days.bulkCreate(predictions, { validate: true });

    res.json({ success: true, message: "10-Day predictions uploaded" });
  } catch (err) {
    console.error("Error uploading 10-day predictions:", err);
    res.status(500).json({
      error: err.message || "Database error while saving predictions",
    });
  }
});
router.post("/assignPredictions10days", async (req, res) => {
  try {
    const { userId, taskCount, targetLanguage } = req.body;
    const sanitizedTargetLang = (targetLanguage || "").toString().trim();

    if (!userId || !taskCount || !sanitizedTargetLang) {
      return res
        .status(400)
        .json({ error: "Missing userId or taskCount or targetlang" });
    }

    // ✅ Validate language codes
    const validLanguages = ["en", "hi", "gu", "mr", "te", "bn"];
    if (!validLanguages.includes(sanitizedTargetLang)) {
      return res.status(400).json({
        error: `Invalid targetLanguage. Allowed: ${validLanguages.join(", ")}`,
      });
    }

    // Fetch the user's username from the User table
    const user = await import("../models/User.js").then((m) =>
      m.default.findByPk(userId)
    );
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const username = user.username;
    const statusField = `status_${sanitizedTargetLang}`;

    // Fetch unassigned prediction rows
    const predictions = await Prediction10Days.findAll({
      [statusField]: {
        [Op.or]: [null, "pending"],
      },
      limit: parseInt(taskCount, 10),
    });

    if (predictions.length === 0) {
      return res
        .status(404)
        .json({ error: "No unassigned prediction rows available" });
    }

    // Update the rows with the assigned username
    await Promise.all(
      predictions.map((prediction) =>
        prediction.update({
          assigned_to: username,
          status: "working",
          [statusField]: "assigned",
        })
      )
    );

    res.status(200).json({
      message: `✅ Assigned ${predictions.length} predictions to ${username}`,
    });
  } catch (error) {
    console.error("❌ Error assigning predictions:", error);
    res.status(500).json({ error: error.message });
  }
});
// GET all 10-day prediction entries
router.get("/predictions10days", async (req, res) => {
  try {
    const predictions = await Prediction10Days.findAll();
    res.json(predictions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE a specific translation or field
// router.post("/savePrediction10days", async (req, res) => {
//   try {
//     const { id, translated, targetLang, statusCol, newStatus } = req.body;
//     console.log("Received save request:", {
//       id,
//       translated,
//       targetLang,
//       statusCol,
//       newStatus,
//     });

//     await Prediction10Days.update(updateData, {
//       where: { id },
//     });

//     if (!id || !translated?.trim() || !targetLang) {
//       return res.status(400).json({ error: "Missing required fields" });
//     }

//     // Allowlist of valid column names that can be updated
//     // Frontend now sends actual column names like "hi_1", "en_2", etc.
//     const allowedColumns = new Set([
//       // Info fields
//       "type",
//       "fromdate",
//       "todate",
//       "subno",
//       "daycount",
//       "url",
//       "totalduration",
//       "starttime",
//       "endtime",
//       "lagna_rasi",
//       "lrname",
//       "sentiment",
//       "super_positive",
//       "positive",
//       "productive",
//       "lucky",
//       "average",
//       "below_average",
//       "negative",
//       "super_negative",
//       "pending_works",
//       "tiring_even",
//       "bhagdaud",

//       // All language columns - actual DB column names
//       "en_1",
//       "en_2",
//       "en_3",
//       "en_4",
//       "hi_1",
//       "hi_2",
//       "hi_3",
//       "hi_4",
//       "mr_1",
//       "mr_2",
//       "mr_3",
//       "mr_4",
//       "gu_1",
//       "gu_2",
//       "gu_3",
//       "gu_4",
//       "bn_1",
//       "bn_2",
//       "bn_3",
//       "bn_4",
//       "te_1",
//       "te_2",
//       "te_3",
//       "te_4",
//     ]);

//     // Check if the targetLang is a valid column name
//     if (!allowedColumns.has(targetLang)) {
//       return res.status(400).json({
//         error: `Invalid target column: ${targetLang}`,
//       });
//     }
//     // Build update payload dynamically
//     const updateData = {};
//     if (translated && targetLang) {
//       updateData[targetLang] = translated;
//     }
//     if (statusCol && newStatus) {
//       updateData[statusCol] = newStatus;
//     }
//     await Prediction10Days.update(updateData, { where: { id } });
//     if (!prediction) {
//       return res.status(404).json({ error: "Prediction not found" });
//     }

//     // Update the specific column
//     prediction[targetLang] = translated;
//     await prediction.save();

//     res.json({
//       message: "Translation saved successfully",
//       updated: updateData,
//     });
//   } catch (error) {
//     console.error("❌ Error saving prediction:", error);
//     res.status(500).json({ error: error.message });
//   }
// });

router.post("/savePrediction10days", async (req, res) => {
  try {
    const { id, translated, targetLang, statusCol, newStatus } = req.body;
    console.log("Received save request:", {
      id,
      translated,
      targetLang,
      statusCol,
      newStatus,
    });

    // Validate required fields
    if (!id) {
      return res.status(400).json({ error: "Missing id" });
    }

    // If it’s a translation update, validate inputs
    if (translated && targetLang) {
      const allowedColumns = new Set([
        "type",
        "fromdate",
        "todate",
        "subno",
        "daycount",
        "url",
        "totalduration",
        "starttime",
        "endtime",
        "lagna_rasi",
        "lrname",
        "sentiment",
        "super_positive",
        "positive",
        "productive",
        "lucky",
        "average",
        "below_average",
        "negative",
        "super_negative",
        "pending_works",
        "tiring_even",
        "bhagdaud",
        "en_1",
        "en_2",
        "en_3",
        "en_4",
        "hi_1",
        "hi_2",
        "hi_3",
        "hi_4",
        "mr_1",
        "mr_2",
        "mr_3",
        "mr_4",
        "gu_1",
        "gu_2",
        "gu_3",
        "gu_4",
        "bn_1",
        "bn_2",
        "bn_3",
        "bn_4",
        "te_1",
        "te_2",
        "te_3",
        "te_4",
        "status_en",
        "status_hi",
        "status_mr",
        "status_gu",
        "status_bn",
        "status_te",
      ]);

      if (!allowedColumns.has(targetLang)) {
        return res
          .status(400)
          .json({ error: `Invalid target column: ${targetLang}` });
      }
    }

    // Build update payload dynamically
    const updateData = {};
    if (translated && targetLang) {
      updateData[targetLang] = translated;
    }
    if (statusCol && newStatus) {
      updateData[statusCol] = newStatus;
    }

    // Update the row in one shot
    await Prediction10Days.update(updateData, { where: { id } });

    return res.json({
      message: "Saved successfully",
      updated: updateData,
    });
  } catch (error) {
    console.error("❌ Error saving prediction:", error);
    res.status(500).json({ error: error.message });
  }
});
export default router;
