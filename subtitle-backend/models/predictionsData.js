// models/predictionsData.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../db/index.js';
import e from 'express';

const PredictionDaily = sequelize.define('PredictionDaily', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  en_1: DataTypes.TEXT,
  en_2: DataTypes.TEXT,
  en_3: DataTypes.TEXT,
  en_4: DataTypes.TEXT,
  hi_1: DataTypes.TEXT,
  te_1: DataTypes.TEXT,
  mr_1: DataTypes.TEXT,
  fromdate: DataTypes.TEXT,
}, {
  tableName: 'predictionDaily',
  timestamps: false,
});

export default PredictionDaily; // ✅ Correct: match the defined variable name
