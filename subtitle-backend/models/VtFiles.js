import { DataTypes } from "sequelize";
import { sequelize } from "../db/index.js";
import Video from "./Video.js";
import User from "./User.js";

const VttFile = sequelize.define(
  "VttFile",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    video_id: {
      type: DataTypes.INTEGER,
      references: { model: Video, key: "id" },
    },
    language_code: { type: DataTypes.STRING, allowNull: false },
    file_path: { type: DataTypes.TEXT, allowNull: false },
    uploaded_by: {
      type: DataTypes.INTEGER,
      references: { model: User, key: "id" },
    },
    uploaded_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  { tableName: "vtt_files", timestamps: false }
);

VttFile.belongsTo(Video, { foreignKey: "video_id" });
Video.hasMany(VttFile, { foreignKey: "video_id" });
VttFile.belongsTo(User, { foreignKey: "uploaded_by" });

export default VttFile;
