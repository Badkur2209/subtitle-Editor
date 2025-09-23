// // routes/predictionDailyRoutes.js

import express from "express";
import PredictionDaily from "../models/predictionsData.js";
import { ValidationError } from "sequelize";
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
    const { userId, taskCount } = req.body;

    if (!userId || !taskCount) {
      return res.status(400).json({ error: "Missing userId or taskCount" });
    }

    // Fetch the user's username from the User table
    const user = await import("../models/User.js").then((m) =>
      m.default.findByPk(userId)
    );
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const username = user.username;

    // Fetch unassigned prediction rows
    const predictions = await PredictionDaily.findAll({
      where: { assigned_to: null }, // or assigned_to: '' if DB has empty string
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
        prediction.update({ assigned_to: username, status: "working" })
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

// Save/update one field (translation or other) of a prediction
// Save/update one field (translation or other) of a prediction
router.post("/savePrediction", async (req, res) => {
  try {
    const { id, translated, targetLang } = req.body;
    console.log("Received save request:", { id, translated, targetLang });

    if (!id || !translated?.trim() || !targetLang) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    // Map of allowed keys to exact model columns
    const langColumnMap = {
      // Info fields
      type: "type",
      fromdate: "fromdate",
      todate: "todate",
      subno: "subno",
      daycount: "daycount",
      url: "url",
      totalduration: "totalduration",
      starttime: "starttime",
      endtime: "endtime",
      lagna_rasi: "lagna_rasi",
      lrname: "lrname",

      // All language columns
      en_1: "en_1",
      en_2: "en_2",
      en_3: "en_3",
      en_4: "en_4",
      hi_1: "hi_1",
      hi_2: "hi_2",
      hi_3: "hi_3",
      hi_4: "hi_4",
      mr_1: "mr_1",
      mr_2: "mr_2",
      mr_3: "mr_3",
      mr_4: "mr_4",
      gu_1: "gu_1",
      gu_2: "gu_2",
      gu_3: "gu_3",
      gu_4: "gu_4",
      bn_1: "bn_1",
      bn_2: "bn_2",
      bn_3: "bn_3",
      bn_4: "bn_4",
      te_1: "te_1",
      te_2: "te_2",
      te_3: "te_3",
      te_4: "te_4",
    };

    const columnName = langColumnMap[targetLang];
    if (!columnName) {
      return res
        .status(400)
        .json({ error: "Invalid target language or column" });
    }

    const prediction = await PredictionDaily.findByPk(id);
    if (!prediction) {
      return res.status(404).json({ error: "Prediction not found" });
    }

    // Update the translation
    prediction[columnName] = translated;

    // ✅ CALCULATE STATUS BASED ON TRANSLATION COMPLETENESS
    // Check how many language columns have translations
    const languageColumns = [
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
    ];

    const filledColumns = languageColumns.filter(
      (col) => prediction[col] && prediction[col].trim() !== ""
    );

    const totalColumns = languageColumns.length;
    const filledCount = filledColumns.length;

    // Set status based on completion percentage
    if (filledCount === 0) {
      prediction.status = "pending";
    } else if (filledCount === totalColumns) {
      prediction.status = "completed";
    } else {
      prediction.status = "working";
    }

    await prediction.save();

    res.json({
      message: "Translation saved successfully",
      status: prediction.status,
    });
  } catch (error) {
    console.error("❌ Error saving translation:", error);
    res.status(500).json({ error: error.message });
  }
});

// router.post("/savePrediction", async (req, res) => {
//   try {
//     const { id, translated, targetLang } = req.body;
//     console.log("Received save request:", { id, translated, targetLang });

//     if (!id || !translated?.trim() || !targetLang) {
//       return res.status(400).json({ error: "Missing required fields." });
//     }

//     // Map of allowed keys to exact model columns
//     const langColumnMap = {
//       // Info fields
//       type: "type",
//       fromdate: "fromdate",
//       todate: "todate",
//       subno: "subno",
//       daycount: "daycount",
//       url: "url",
//       totalduration: "totalduration",
//       starttime: "starttime",
//       endtime: "endtime",
//       lagna_rasi: "lagna_rasi",
//       lrname: "lrname",

//       // All language columns
//       en_1: "en_1",
//       en_2: "en_2",
//       en_3: "en_3",
//       en_4: "en_4",
//       hi_1: "hi_1",
//       hi_2: "hi_2",
//       hi_3: "hi_3",
//       hi_4: "hi_4",
//       mr_1: "mr_1",
//       mr_2: "mr_2",
//       mr_3: "mr_3",
//       mr_4: "mr_4",
//       gu_1: "gu_1",
//       gu_2: "gu_2",
//       gu_3: "gu_3",
//       gu_4: "gu_4",
//       bn_1: "bn_1",
//       bn_2: "bn_2",
//       bn_3: "bn_3",
//       bn_4: "bn_4",
//       te_1: "te_1",
//       te_2: "te_2",
//       te_3: "te_3",
//       te_4: "te_4",

//     };

//     const columnName = langColumnMap[targetLang];
//     if (!columnName) {
//       return res
//         .status(400)
//         .json({ error: "Invalid target language or column" });
//     }

//     const prediction = await PredictionDaily.findByPk(id);
//     if (!prediction) {
//       return res.status(404).json({ error: "Prediction not found" });
//     }

//     prediction[columnName] = translated;
//     await prediction.save();

//     res.json({ message: "Translation saved successfully" });
//   } catch (error) {
//     console.error("❌ Error saving translation:", error);
//     res.status(500).json({ error: error.message });
//   }
// });

export default router;

// import express from 'express';
// import PredictionDaily from '../models/predictionsData.js';

// const router = express.Router();

// // GET all prediction entries
// router.get('/predictions', async (req, res) => {
//   try {
//     const predictions = await PredictionDaily.findAll();
//     res.json(predictions);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // Save translation
// router.post('/savePrediction', async (req, res) => {
//   try {
//     const { id, translated, targetLang } = req.body;
//     const column = targetLang.toLowerCase(); // e.g., 'hindi' -> 'hi_2'

//     const langColumnMap = {
//       fromdate: 'fromdate',
//       english: 'en_1',
//       english2: 'en_2',
//       english3: 'en_3',
//       english4: 'en_4',
//       hindi: 'hi_1',
//       telugu: 'hi_1',
//       marathi: 'mr_1',
//     };

//     const columnName = langColumnMap[targetLang.toLowerCase()];
//     if (!columnName) {
//       return res.status(400).json({ error: 'Invalid target language' });
//     }

//     const prediction = await PredictionDaily.findByPk(id);
//     if (!prediction) {
//       return res.status(404).json({ error: 'Prediction not found' });
//     }

//     prediction[columnName] = translated;
//     await prediction.save();

//     res.json({ message: 'Translation saved successfully' });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// export default router;
