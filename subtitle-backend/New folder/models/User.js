//User.js
import { DataTypes } from "sequelize";
import { sequelize } from "../db/index.js";

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: { type: DataTypes.STRING, allowNull: false },
    username: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    lang_pair1: DataTypes.STRING,
    lang_pair2: DataTypes.STRING,
    lang_pair3: DataTypes.STRING,
    lang_pair4: DataTypes.STRING,
    role: {
      type: DataTypes.ENUM(
        "admin",
        "translator",
        "editor",
        "reviewer",
        "assigner",
        "uploader"
      ),
      defaultValue: "translator", // ✅
    },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  {
    tableName: "user_info",
    timestamps: false,
  }
);
export default User;
