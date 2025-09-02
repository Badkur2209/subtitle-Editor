import express from "express";
import Prediction10Days from "../models/Prediction10Days.js";

const router = express.Router();

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
router.post("/savePrediction10days", async (req, res) => {
  try {
    const { id, translated, targetLang } = req.body;
    console.log("Received save request:", { id, translated, targetLang });

    if (!id || !translated?.trim() || !targetLang) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Allowlist of valid column names that can be updated
    // Frontend now sends actual column names like "hi_1", "en_2", etc.
    const allowedColumns = new Set([
      // Info fields
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

      // All language columns - actual DB column names
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
    ]);

    // Check if the targetLang is a valid column name
    if (!allowedColumns.has(targetLang)) {
      return res.status(400).json({
        error: `Invalid target column: ${targetLang}`,
      });
    }

    const prediction = await Prediction10Days.findByPk(id);
    if (!prediction) {
      return res.status(404).json({ error: "Prediction not found" });
    }

    // Update the specific column
    prediction[targetLang] = translated;
    await prediction.save();

    res.json({
      message: "Translation saved successfully",
      updated: { column: targetLang, value: translated },
    });
  } catch (error) {
    console.error("❌ Error saving prediction:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
