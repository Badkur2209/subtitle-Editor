// models/predictionsData.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../db/index.js';

const PredictionDaily = sequelize.define('PredictionDaily', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  en_1: DataTypes.TEXT,
  hi_2: DataTypes.TEXT,
  te_3: DataTypes.TEXT,
  mr_4: DataTypes.TEXT,
}, {
  tableName: 'predictionDaily',
  timestamps: false,
});

export default PredictionDaily; // ✅ Correct: match the defined variable name
