// routes/importActivity.js
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { sequelize } from '../db/index.js';
import ActivityData from '../models/Activitydata';

const router = express.Router();

// Fix for __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataPath = path.join(__dirname, '../data/activity_data_full.json');

// GET API to import data from local file
router.get('/import', async (req, res) => {
  try {

    console.log("hellooo")
    const rawData = fs.readFileSync(dataPath, 'utf-8');
    const jsonData = JSON.parse(rawData);

    const formatted = jsonData.map(item => ({
      english: item.English || '',
      hindi: item.Hindi || '',
      telugu: '',
      marathi: '',
      date: item.Date,
    }));

    await sequelize.sync();
    await ActivityData.bulkCreate(formatted);

    res.json({ message: `✅ Successfully imported ${formatted.length} records.` });
  } catch (err) {
    console.error('❌ Error during import:', err);
    res.status(500).json({ message: 'Server error during import.' });
  }
});
router.get('/activities', async (req, res) => {
  try {
    const allActivities = await ActivityData.findAll();
    res.json(allActivities);
  } catch (err) {
    console.error('❌ Error fetching activities:', err);
    res.status(500).json({ message: 'Server error while fetching data.' });
  }
});


router.post('/save', async (req, res) => {
  try {
    const { id, translated, targetLang } = req.body;

    if (!id || !translated?.trim() || !targetLang) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }

    // Allowed language columns in DB
    const allowedLangs = ['english', 'hindi', 'telugu', 'marathi'];
    if (!allowedLangs.includes(targetLang.toLowerCase())) {
      return res.status(400).json({ message: 'Invalid language key.' });
    }

    // Find activity record by ID
    const activity = await ActivityData.findByPk(id);
    if (!activity) {
      return res.status(404).json({ message: 'Activity not found.' });
    }

    // Update translation field
    activity[targetLang.toLowerCase()] = translated;
    await activity.save();

    res.json({ message: 'Translation saved successfully.' });
  } catch (error) {
    console.error('❌ Error saving translation:', error);
    res.status(500).json({ message: 'Server error while saving translation.' });
  }
});
export default router;
