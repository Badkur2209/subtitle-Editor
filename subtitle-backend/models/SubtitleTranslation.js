// models/SubtitleTranslation.js
import { DataTypes } from "sequelize";
import { sequelize } from "../db/index.js";
import SubtitleSegment from "./SubtitleSegment.js";

const SubtitleTranslation = sequelize.define(
  "SubtitleTranslation",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    segment_id: {
      type: DataTypes.INTEGER,
      references: { model: SubtitleSegment, key: "id" },
      allowNull: false,
      unique: "unique_segment_language",
    },
    language: {
      type: DataTypes.ENUM("en", "hi", "mr", "gu", "bn", "te"),
      allowNull: false,
      unique: "unique_segment_language",
    },
    translated_text: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: "",
    },
    updated_by: { type: DataTypes.STRING },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  { tableName: "subtitle_translations", timestamps: false }
);

SubtitleSegment.hasMany(SubtitleTranslation, { foreignKey: "segment_id" });
SubtitleTranslation.belongsTo(SubtitleSegment, { foreignKey: "segment_id" });

export default SubtitleTranslation;
