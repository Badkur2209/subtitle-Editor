// models/SubtitleSegment.js
import { DataTypes } from "sequelize";
import { sequelize } from "../db/index.js";
import Video from "./Video.js";

const SubtitleSegment = sequelize.define(
  "SubtitleSegment",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    video_id: {
      type: DataTypes.INTEGER,
      references: { model: Video, key: "id" },
      allowNull: false,
    },
    // 0-based order of the segment in the file
    index: { type: DataTypes.INTEGER, allowNull: false },
    start_time: { type: DataTypes.STRING, allowNull: false }, // "00:00:01.000"
    end_time: { type: DataTypes.STRING, allowNull: false },
    text: { type: DataTypes.TEXT, allowNull: false },
  },
  { tableName: "subtitle_segments", timestamps: false }
);

Video.hasMany(SubtitleSegment, { foreignKey: "video_id" });
SubtitleSegment.belongsTo(Video, { foreignKey: "video_id" });

export default SubtitleSegment;
