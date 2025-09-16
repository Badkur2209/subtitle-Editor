import { DataTypes } from "sequelize";
import { sequelize } from "../db/index.js";
import TranslationProject from "./TranslationProject.js";

const SubtitleSegment = sequelize.define(
  "SubtitleSegment",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    project_id: {
      type: DataTypes.INTEGER,
      references: { model: TranslationProject, key: "id" },
    },
    segment_index: { type: DataTypes.INTEGER, allowNull: false },
    start_time: { type: DataTypes.STRING, allowNull: false },
    end_time: { type: DataTypes.STRING, allowNull: false },
    original_text: DataTypes.TEXT,
    translated_text: DataTypes.TEXT,
    status_en: DataTypes.STRING,
    status_hi: DataTypes.STRING,
    status_gu: DataTypes.STRING,
    status_mr: DataTypes.STRING,
    status_te: DataTypes.STRING,
    status_bn: DataTypes.STRING,
  },
  { tableName: "subtitle_segments", timestamps: false }
);

SubtitleSegment.belongsTo(TranslationProject, { foreignKey: "project_id" });
TranslationProject.hasMany(SubtitleSegment, { foreignKey: "project_id" });

export default SubtitleSegment;
