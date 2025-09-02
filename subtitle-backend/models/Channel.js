import { DataTypes } from "sequelize";
import { sequelize } from "../db/index.js";

const Channel = sequelize.define(
  "Channel",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    channel_name: { type: DataTypes.STRING, allowNull: false, unique: true },
    description: DataTypes.TEXT,
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    tableName: "channels",
    timestamps: false,
  }
);

export default Channel;
