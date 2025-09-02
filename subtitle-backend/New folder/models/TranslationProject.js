import { DataTypes } from "sequelize";
import { sequelize } from "../db/index.js";

const TranslationProject = sequelize.define(
  "TranslationProject",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    video_id: { type: DataTypes.INTEGER, allowNull: false },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    target_language: { type: DataTypes.STRING(10), allowNull: false },
    status: { 
      type: DataTypes.ENUM('draft', 'in_progress', 'completed'),
      defaultValue: 'draft'
    },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    tableName: "translation_projects",
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ['video_id', 'user_id', 'target_language']
      }
    ]
  }
);

export default TranslationProject;
