// scripts/syncDatabase.js
import { sequelize } from "../db/index.js";
import ActivityData from "../models/ActivityData.js";

const syncDatabase = async () => {
  try {
    console.log("🔄 Starting database synchronization...");

    // Authenticate connection
    await sequelize.authenticate();
    console.log("✅ Database connection established");

    // Sync all models
    await sequelize.sync({ alter: true });
    console.log("✅ All models synchronized successfully");

    // Show current table structure
    const tableDescription = await sequelize
      .getQueryInterface()
      .describeTable("activities");
    console.log("📊 Current table structure:", Object.keys(tableDescription));

    process.exit(0);
  } catch (error) {
    console.error("❌ Synchronization failed:", error);
    process.exit(1);
  }
};

syncDatabase();
