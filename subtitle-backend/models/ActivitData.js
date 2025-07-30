//ActivityData.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../db/index.js';

const ActivityData = sequelize.define('ActivityData', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  Date: DataTypes.TEXT,
  url: DataTypes.TEXT,
  TotalDuration: DataTypes.TEXT,
  MKSA_start: DataTypes.TEXT,
  MKSA_end: DataTypes.TEXT,
  BB_Start: DataTypes.TEXT,
  BB_End: DataTypes.TEXT,
  day: DataTypes.TEXT,
  'ActivityTime(ReminderTime)': DataTypes.TEXT,
  ActivityName_Hindi: DataTypes.TEXT,
  ActivityName_English: DataTypes.TEXT,
  Hindi: DataTypes.TEXT,
  File: DataTypes.TEXT,
  English: DataTypes.TEXT,
  SuvarnAkshar: DataTypes.TEXT,
  BlastingBirthday: DataTypes.TEXT,
  MarriageAnniversary: DataTypes.TEXT,
  Manifestation: DataTypes.TEXT,
  WishList: DataTypes.TEXT,
  SpecificProblem: DataTypes.TEXT,
  NoOfSteps: DataTypes.TEXT,
  RepeatNumber: DataTypes.TEXT,
  Tantra: DataTypes.TEXT,
  Mantra: DataTypes.TEXT,
  Mudra: DataTypes.TEXT,
  Position: DataTypes.TEXT,
  Day: DataTypes.TEXT,
  Bath: DataTypes.TEXT,
  Time: DataTypes.TEXT,
  Time2: DataTypes.TEXT,
  Tithi: DataTypes.TEXT,
  Planet: DataTypes.TEXT,
  Material: DataTypes.TEXT,
  MaterialQuantity: DataTypes.TEXT,
  Astronomical: DataTypes.TEXT,
  'Time2': DataTypes.TEXT, // Note: your table has "Time " with trailing space
}, {
  tableName: 'activities',
  timestamps: false,
});

export default ActivityData;
