// models/ActivityData.js
import { DataTypes } from "sequelize";
import { sequelize } from "../db/index.js";

const ActivityData = sequelize.define(
  "ActivityData",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },

    // Date: { type: DataTypes.TEXT, field: "Date" },
    Date: {
      type: DataTypes.DATEONLY, // Use DATEONLY for 'YYYY-MM-DD' dates
      field: "Date",
    },
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

    timeWithSpace: { type: DataTypes.TEXT, field: "Time " },
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
    // status: DataTypes.TEXT,

    act_gu: DataTypes.TEXT,
    act_bn: DataTypes.TEXT,
    act_te: DataTypes.TEXT,
    act_mr: DataTypes.TEXT,
    status: {
      type: DataTypes.ENUM("pending", "working", "completed"),
      defaultValue: "pending",
      allowNull: false,
    },
    status_en: DataTypes.TEXT,
    status_hi: DataTypes.TEXT,
    status_gu: DataTypes.TEXT,
    status_mr: DataTypes.TEXT,
    status_te: DataTypes.TEXT,
    status_bn: DataTypes.TEXT,
    mksabb: DataTypes.TEXT,

    dateStatus: DataTypes.TEXT,
    unit: DataTypes.TEXT,
    value: DataTypes.TEXT,
    tithi1: DataTypes.TEXT,
    tithi2: DataTypes.TEXT,
    tithi3: DataTypes.TEXT,
    tithi4: DataTypes.TEXT,
    tithi5: DataTypes.TEXT,
    planet1: DataTypes.TEXT,
    planet2: DataTypes.TEXT,
    planet3: DataTypes.TEXT,
    Astronomical1: DataTypes.TEXT,
    Astronomical2: DataTypes.TEXT,
  },
  {
    tableName: "activities",
    timestamps: false,
  }
);
export default ActivityData;
