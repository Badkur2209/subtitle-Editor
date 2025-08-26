import { DataTypes } from "sequelize";
import { sequelize } from "../db/index.js";

const Video = sequelize.define(
  "Video",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    channel_id: { type: DataTypes.INTEGER, allowNull: false },
    video_title: { type: DataTypes.STRING(500), allowNull: false },
    youtube_link: { type: DataTypes.TEXT, allowNull: false },
    vtt_file_path: DataTypes.STRING,
    has_vtt: { type: DataTypes.BOOLEAN, defaultValue: false },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    tableName: "videos",
    timestamps: false,
  }
);

export default Video;
