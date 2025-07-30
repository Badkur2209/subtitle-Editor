// routes/predictionDailyRoutes.js
import express from 'express';
import PredictionDaily from '../models/predictionsData.js';

const router = express.Router();

// GET all prediction entries
router.get('/predictions', async (req, res) => {
  try {
    const predictions = await PredictionDaily.findAll();
    res.json(predictions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Save translation
router.post('/savePrediction', async (req, res) => {
  try {
    const { id, translated, targetLang } = req.body;
    const column = targetLang.toLowerCase(); // e.g., 'hindi' -> 'hi_2'

    const langColumnMap = {
      fromdate: 'fromdate',
      english: 'en_1',
      english2: 'en_2',
      english3: 'en_3',
      english4: 'en_4',

      hindi: 'hi_1',
      telugu: 'hi_1',
      marathi: 'mr_1',
    };

    const columnName = langColumnMap[targetLang.toLowerCase()];
    if (!columnName) {
      return res.status(400).json({ error: 'Invalid target language' });
    }

    const prediction = await PredictionDaily.findByPk(id);
    if (!prediction) {
      return res.status(404).json({ error: 'Prediction not found' });
    }

    prediction[columnName] = translated;
    await prediction.save();

    res.json({ message: 'Translation saved successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
