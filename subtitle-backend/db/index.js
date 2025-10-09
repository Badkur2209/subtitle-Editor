// db/index.js
import { Sequelize } from "sequelize";

// const sequelize = new Sequelize("SUBTITLE_EDITOR", "postgres", "14All", {
//   host: "localhost",
//   dialect: "postgres",
//   port: 5432,
//   logging: false,
// });
// import { Sequelize } from "sequelize";

const sequelize = new Sequelize("ayushcms", "ayushcms", "Tathastu@2020", {
  host: "103.133.214.127",
  dialect: "postgres",
  port: 5432,
  logging: false,
});

// Test DB connection
export const testDbConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connection has been established successfully.");
    // await syncDatabase();
  } catch (error) {
    console.error("❌ Unable to connect to the database:", error.message);
    process.exit(1);
  }
};

// export const syncDatabase = async () => {
//   try {
//     if (process.env.NODE_ENV === "production") {
//       await sequelize.sync({ force: false });
//       console.log("✅ Database synced (production mode - no alterations)");
//     } else {
//       await sequelize.sync({ alter: true });
//       console.log("✅ Database synced (development mode - tables altered)");
//     }
//   } catch {
//     console.error("❌ Error syncing database:", error.message);
//     throw error;
//   }
// };
export { sequelize };
