// models/ActivityData.js
import { DataTypes } from "sequelize";
import { sequelize } from "../db/index.js";

const ActivityData = sequelize.define(
  "ActivityData",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    Date: { type: DataTypes.TEXT, field: "Date" },
    url: DataTypes.TEXT,
    TotalDuration: { type: DataTypes.TEXT, field: "TotalDuration" },
    MKSA_start: { type: DataTypes.TEXT, field: "MKSA_start" },
    MKSA_end: { type: DataTypes.TEXT, field: "MKSA_end" },
    BB_Start: { type: DataTypes.TEXT, field: "BB_Start" },
    BB_End: { type: DataTypes.TEXT, field: "BB_End" },
    day: DataTypes.TEXT,

    ActivityTimeReminderTime: DataTypes.TEXT,

    act_hi: DataTypes.TEXT,
    act_en: DataTypes.TEXT,
    hi: DataTypes.TEXT,

    File: { type: DataTypes.TEXT, field: "File" },
    en: DataTypes.TEXT,
    SuvarnAkshar: { type: DataTypes.TEXT, field: "SuvarnAkshar" },
    BlastingBirthday: { type: DataTypes.TEXT, field: "BlastingBirthday" },
    MarriageAnniversary: { type: DataTypes.TEXT, field: "MarriageAnniversary" },
    Manifestation: { type: DataTypes.TEXT, field: "Manifestation" },
    WishList: { type: DataTypes.TEXT, field: "WishList" },
    SpecificProblem: { type: DataTypes.TEXT, field: "SpecificProblem" },
    NoOfSteps: { type: DataTypes.TEXT, field: "NoOfSteps" },
    RepeatNumber: { type: DataTypes.TEXT, field: "RepeatNumber" },
    Tantra: DataTypes.TEXT,
    Mantra: DataTypes.TEXT,
    Mudra: DataTypes.TEXT,
    Position: DataTypes.TEXT,
    Day: DataTypes.TEXT,
    Bath: DataTypes.TEXT,

    Time: { type: DataTypes.TEXT, field: "Time" },

    timeWithSpace: { type: DataTypes.TEXT, field: "Time " }, // handles the "Time " column

    Time2: { type: DataTypes.CHAR, field: "Time2" },

    Tithi: DataTypes.TEXT,
    Planet: DataTypes.TEXT,
    Material: DataTypes.TEXT,
    MaterialQuantity: { type: DataTypes.TEXT, field: "MaterialQuantity" },
    Astronomical: DataTypes.TEXT,

    gu: DataTypes.TEXT,
    bn: DataTypes.TEXT,
    te: DataTypes.TEXT,
    mr: DataTypes.TEXT,

    assigned_to: DataTypes.TEXT,
    status: DataTypes.TEXT,

    act_gu: DataTypes.TEXT,
    act_bn: DataTypes.TEXT,
    act_te: DataTypes.TEXT,
    act_mr: DataTypes.TEXT,
    status: {
      type: DataTypes.ENUM("pending", "working", "completed"),
      defaultValue: "pending",
      allowNull: false,
    },
  },
  {
    tableName: "activities",
    timestamps: false,
  }
);

export default ActivityData;
