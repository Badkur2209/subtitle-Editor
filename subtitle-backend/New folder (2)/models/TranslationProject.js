import { DataTypes } from "sequelize";
import { sequelize } from "../db/index.js";
import Video from "./Video.js";
import User from "./User.js";

const TranslationProject = sequelize.define(
  "TranslationProject",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    video_id: {
      type: DataTypes.INTEGER,
      references: { model: Video, key: "id" },
    },
    target_language: { type: DataTypes.STRING, allowNull: false },
    assigned_to: {
      type: DataTypes.INTEGER,
      references: { model: User, key: "id" },
    },
    status: {
      type: DataTypes.ENUM("pending", "working", "completed"),
      defaultValue: "pending",
    },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  { tableName: "translation_projects", timestamps: false }
);

TranslationProject.belongsTo(Video, { foreignKey: "video_id" });
Video.hasMany(TranslationProject, { foreignKey: "video_id" });
TranslationProject.belongsTo(User, { foreignKey: "assigned_to" });

export default TranslationProject;
