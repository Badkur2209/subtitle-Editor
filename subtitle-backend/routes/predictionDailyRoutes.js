// // routes/predictionDailyRoutes.js

import express from "express";
import PredictionDaily from "../models/predictionsData.js";

const router = express.Router();

// GET all prediction entries
router.get("/predictions", async (req, res) => {
  try {
    const predictions = await PredictionDaily.findAll();
    res.json(predictions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

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

    prediction[columnName] = translated;
    await prediction.save();

    res.json({ message: "Translation saved successfully" });
  } catch (error) {
    console.error("❌ Error saving translation:", error);
    res.status(500).json({ error: error.message });
  }
});

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
