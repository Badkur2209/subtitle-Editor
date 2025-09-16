import { DataTypes } from "sequelize";
import { sequelize } from "../db/index.js";
import Channel from "./Channel.js";

const Video = sequelize.define(
  "Video",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    channel_id: {
      type: DataTypes.INTEGER,
      references: { model: Channel, key: "id" },
    },
    video_title: { type: DataTypes.STRING, allowNull: false },
    link: { type: DataTypes.STRING, allowNull: false },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    assigned_to: { type: DataTypes.STRING, allowNull: true },
    status_en: { type: DataTypes.STRING },
    status_hi: { type: DataTypes.STRING },
    status_mr: { type: DataTypes.STRING },
    status_bn: { type: DataTypes.STRING },
    status_te: { type: DataTypes.STRING },
    status_gu: { type: DataTypes.STRING },
  },
  { tableName: "videos", timestamps: false }
);
Video.belongsTo(Channel, { foreignKey: "channel_id" });
Channel.hasMany(Video, { foreignKey: "channel_id" });

export default Video;
