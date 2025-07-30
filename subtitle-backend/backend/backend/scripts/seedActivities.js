const fs = require('fs');
const path = require('path');
const ActivityData = require('../models/ActivityData');
const { sequelize } = require('../db/index.js');

async function seed() {
  try {
    const rawData = fs.readFileSync(path.join(__dirname, '../data/activity_data_full.json'), 'utf-8');
    const activities = JSON.parse(rawData);

    await sequelize.sync(); // make sure tables exist, adjust as needed

    for (const act of activities) {
      // Example: adapt keys according to your JSON structure
      await ActivityData.create({
        english: act.english || '',
        hindi: act.hindi || '',
        telugu: act.telugu || '',
        marathi: act.marathi || '',
        date: act.date || null,
      });
    }

    console.log('✅ Activities seeded successfully');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
}

seed();
