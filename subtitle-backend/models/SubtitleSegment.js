import { DataTypes } from "sequelize";
import { sequelize } from "../db/index.js";

const SubtitleSegment = sequelize.define(
  "SubtitleSegment",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    project_id: { type: DataTypes.INTEGER, allowNull: false },
    segment_index: { type: DataTypes.INTEGER, allowNull: false },
    start_time: { type: DataTypes.STRING(20), allowNull: false },
    end_time: { type: DataTypes.STRING(20), allowNull: false },
    original_text: { type: DataTypes.TEXT, allowNull: false },
    translated_text: { type: DataTypes.TEXT },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    tableName: "subtitle_segments",
    timestamps: false,
  }
);

export default SubtitleSegment;
