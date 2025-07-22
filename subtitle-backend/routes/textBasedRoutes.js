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

export default router;
