// models/predictionsData.js
import { DataTypes } from "sequelize";
import { sequelize } from "../db/index.js";

const PredictionDaily = sequelize.define(
  "PredictionDaily",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    type: DataTypes.TEXT,
    fromdate: DataTypes.TEXT,
    todate: DataTypes.TEXT,
    subno: DataTypes.TEXT,
    daycount: DataTypes.TEXT,
    url: DataTypes.TEXT,
    totalduration: DataTypes.TEXT,
    starttime: DataTypes.TEXT,
    endtime: DataTypes.TEXT,
    lagna_rasi: DataTypes.TEXT,
    lrname: DataTypes.TEXT,
    sentiment: DataTypes.TEXT,
    super_positive: DataTypes.TEXT,
    positive: DataTypes.TEXT,
    productive: DataTypes.TEXT,
    lucky: DataTypes.TEXT,
    average: DataTypes.TEXT,
    below_average: DataTypes.TEXT,
    negative: DataTypes.TEXT,
    super_negative: DataTypes.TEXT,
    pending_work: DataTypes.TEXT,
    tiring_even: DataTypes.TEXT,
    bhaag_daud: DataTypes.TEXT,

    en_1: DataTypes.TEXT,
    en_2: DataTypes.TEXT,
    en_3: DataTypes.TEXT,
    en_4: DataTypes.TEXT,

    hi_1: DataTypes.TEXT,
    hi_2: DataTypes.TEXT,
    hi_3: DataTypes.TEXT,
    hi_4: DataTypes.TEXT,

    mr_1: DataTypes.TEXT,
    mr_2: DataTypes.TEXT,
    mr_3: DataTypes.TEXT,
    mr_4: DataTypes.TEXT,

    gu_1: DataTypes.TEXT,
    gu_2: DataTypes.TEXT,
    gu_3: DataTypes.TEXT,
    gu_4: DataTypes.TEXT,

    bn_1: DataTypes.TEXT,
    bn_2: DataTypes.TEXT,
    bn_3: DataTypes.TEXT,
    bn_4: DataTypes.TEXT,

    te_1: DataTypes.TEXT,
    te_2: DataTypes.TEXT,
    te_3: DataTypes.TEXT,
    te_4: DataTypes.TEXT,

    status: {
      type: DataTypes.ENUM("pending", "working", "completed"),
      defaultValue: "pending",
      allowNull: false,
    },
    assigned_to: DataTypes.TEXT,
    status_en: DataTypes.TEXT,
    status_hi: DataTypes.TEXT,
    status_mr: DataTypes.TEXT,
    status_gu: DataTypes.TEXT,
    status_te: DataTypes.TEXT,
    status_bn: DataTypes.TEXT,
  },
  {
    tableName: "predictionDaily",
    timestamps: false,
  }
);

export default PredictionDaily;
