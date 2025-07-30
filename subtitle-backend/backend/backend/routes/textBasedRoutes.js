// routes/importActivity.js
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { sequelize } from '../db/index.js';
import ActivityData from '../models/ActivitData.js';

const router = express.Router();

// Fix for __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataPath = path.join(__dirname,'../activity_data_full.json');

// GET API to import data from local file
router.get('/import', async (req, res) => {
  try {
    console.log("Starting import...");
    
    const rawData = fs.readFileSync(dataPath, 'utf-8');
    const jsonData = JSON.parse(rawData);

    // Map all fields from JSON to database columns
    const formatted = jsonData.map(item => ({
      Date: item.Date || '',
      url: item.url || '',
      TotalDuration: item.TotalDuration || '',
      MKSA_start: item.MKSA_start || '',
      MKSA_end: item.MKSA_end || '',
      BB_Start: item.BB_Start || '',
      BB_End: item.BB_End || '',
      day: item.day || '',
      'ActivityTime(ReminderTime)': item['ActivityTime(ReminderTime)'] || '',
      ActivityName_Hindi: item.ActivityName_Hindi || '',
      ActivityName_English: item.ActivityName_English || '',
      Hindi: item.Hindi || '',
      File: item.File || '',
      English: item.English || '',
      SuvarnAkshar: item.SuvarnAkshar || '',
      BlastingBirthday: item.BlastingBirthday || '',
      MarriageAnniversary: item.MarriageAnniversary || '',
      Manifestation: item.Manifestation || '',
      WishList: item.WishList || '',
      SpecificProblem: item.SpecificProblem || '',
      NoOfSteps: item.NoOfSteps || '',
      RepeatNumber: item.RepeatNumber || '',
      Tantra: item.Tantra || '',
      Mantra: item.Mantra || '',
      Mudra: item.Mudra || '',
      Position: item.Position || '',
      Day: item.Day || '',
      Bath: item.Bath || '',
      Time: item.Time || '',
      Time2: item.Time || '',
      Tithi: item.Tithi || '',
      Planet: item.Planet || '',
      Material: item.Material || '',
      MaterialQuantity: item.MaterialQuantity || '',
      Astronomical: item.Astronomical || '',
      'Time ': item.Time2 || '', // Map Time2 from JSON to "Time " column in DB
    }));

    await sequelize.sync();
    
    await ActivityData.bulkCreate(formatted, {
      ignoreDuplicates: true
    });

    res.json({ 
      message: `✅ Successfully imported ${formatted.length} records.`,
      imported: formatted.length 
    });
    
  } catch (err) {
    console.error('❌ Error during import:', err);
    res.status(500).json({ 
      message: 'Server error during import.',
      error: err.message 
    });
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
    debugger
    console.log("Received data:", { id, translated, targetLang });
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
