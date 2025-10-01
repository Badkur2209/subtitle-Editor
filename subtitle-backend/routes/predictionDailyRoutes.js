// // routes/predictionDailyRoutes.js

import express from "express";
import PredictionDaily from "../models/predictionsData.js";
import { ValidationError } from "sequelize";
import { Op } from "sequelize";
const router = express.Router();

router.post("/daily", async (req, res) => {
  try {
    const { predictions } = req.body;
    if (
      !predictions ||
      !Array.isArray(predictions) ||
      predictions.length === 0
    ) {
      return res
        .status(400)
        .json({ success: false, error: "No predictions to insert" });
    }

    const validatedPredictions = [];
    const errors = [];
    predictions.forEach((pred, index) => {
      if (
        (!pred.fromdate && !pred.todate) ||
        !pred.lagna_rasi ||
        !pred.lrname
      ) {
        errors.push(`Row ${index + 1}: Missing required fields`);
        return;
      }
      pred.status = pred.status || "pending";
      validatedPredictions.push(pred);
    });

    if (errors.length > 0) {
      return res
        .status(400)
        .json({ success: false, error: "Validation failed", details: errors });
    }

    console.log(
      "🟢 Validated predictions to insert:",
      validatedPredictions.length
    );

    const insertedPredictions = await PredictionDaily.bulkCreate(
      validatedPredictions,
      {
        validate: true, // forces Sequelize to validate model constraints
        returning: true, // ensure we get inserted rows back
      }
    );

    if (!insertedPredictions || insertedPredictions.length === 0) {
      return res.status(500).json({
        success: false,
        error: "Nothing was inserted into the database",
        debug: validatedPredictions,
      });
    }

    res.json({
      success: true,
      message: "Predictions uploaded successfully",
      inserted: insertedPredictions.length,
      total_received: predictions.length,
    });
  } catch (error) {
    console.error("❌ Bulk insert failed:", error);

    if (error instanceof ValidationError) {
      return res.status(400).json({
        success: false,
        error: "Validation error from Sequelize",
        details: error.errors.map((e) => e.message),
      });
    }

    res.status(500).json({
      success: false,
      error: "Database insert failed",
      details: error.message,
    });
  }
});

// GET: Validate 12 lagna entries for a date
router.get("/validate-lagna/:date", async (req, res) => {
  try {
    const { date } = req.params;
    const allLagnas = [
      "Aries",
      "Taurus",
      "Gemini",
      "Cancer",
      "Leo",
      "Virgo",
      "Libra",
      "Scorpio",
      "Sagittarius",
      "Capricorn",
      "Aquarius",
      "Pisces",
    ];
    const existingEntries = await PredictionDaily.findAll({
      where: {
        [Op.or]: [{ fromdate: date }, { todate: date }],
      },
      attributes: ["lagna_rasi", "lrname"],
    });
    const existingLagnas = existingEntries.map((entry) =>
      (entry.lagna_rasi || entry.lrname || "").toString()
    );
    const count = existingLagnas.length;
    const exists = count > 0;
    const missingLagnas = allLagnas.filter(
      (lagna) =>
        !existingLagnas.some(
          (existing) =>
            existing.toLowerCase().includes(lagna.toLowerCase()) ||
            lagna.toLowerCase().includes(existing.toLowerCase())
        )
    );
    res.json({
      success: true,
      exists,
      count,
      total_required: 12,
      existing_lagnas: existingLagnas,
      missing_lagnas: missingLagnas,
      is_complete: count >= 12,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, error: "Failed to validate lagna entries" });
  }
});

// POST: Bulk upload predictions from Excel data
// router.post("/daily", async (req, res) => {
//   try {
//     console.log("📥 Incoming Daily Predictions:", req.body); // Debug incoming data
//     const created = await PredictionDaily.bulkCreate(req.body); // Or whatever method you use
//     res.status(201).json(created);
//     const { predictions } = req.body;
//     if (
//       !predictions ||
//       !Array.isArray(predictions) ||
//       predictions.length === 0
//     ) {
//       return res
//         .status(400)
//         .json({ success: false, error: "No predictions to insert" });
//     }
//     // Validate required fields for each prediction
//     const validatedPredictions = [];
//     const errors = [];
//     predictions.forEach((pred, index) => {
//       if (
//         (!pred.fromdate && !pred.todate) ||
//         !pred.lagna_rasi ||
//         !pred.lrname
//       ) {
//         errors.push(`Row ${index + 1}: Missing required fields`);
//         return;
//       }
//       // Set default status if missing
//       pred.status = pred.status || "pending";
//       validatedPredictions.push(pred);
//     });
//     if (errors.length > 0) {
//       return res
//         .status(400)
//         .json({ success: false, error: "Validation failed", details: errors });
//     }
//     // Bulk insert
//     const insertedPredictions = await PredictionDaily.bulkCreate(
//       validatedPredictions,
//       { ignoreDuplicates: false }
//     );
//     res.json({
//       success: true,
//       message: "Predictions uploaded successfully",
//       inserted: insertedPredictions.length,
//       total_received: predictions.length,
//     });
//   } catch (error) {
//     console.error("❌ Error in /api/predictions/daily:", error);
//     res.status(500).json({ error: error.message });
//     res
//       .status(500)
//       .json({ success: false, error: "Failed to upload predictions" });
//   }
// });

// GET all prediction entries
router.get("/predictions", async (req, res) => {
  try {
    const predictions = await PredictionDaily.findAll();
    res.json(predictions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// Assign prediction tasks to a user
router.post("/assignPredictions", async (req, res) => {
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
    const predictions = await PredictionDaily.findAll({
      [statusField]: {
        [Op.or]: [null, "pending"],
      },
      limit: parseInt(taskCount, 10),
    });

    if (predictions.length === 0) {
      return res
        .status(400)
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
      message: `✅ Assigned ${predictions.length} predictions to ${username} with ${statusField} = "assigned".`,
    });
  } catch (error) {
    console.error("❌ Error assigning predictions:", error);
    res.status(500).json({ error: error.message });
  }
});

// Save/update one field (translation or other) of a prediction
router.post("/savePrediction", async (req, res) => {
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
        "pending_work",
        "tiring_even",
        "bhag_daud",
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
    await PredictionDaily.update(updateData, { where: { id } });

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
