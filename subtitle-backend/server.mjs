import express from "express";
import cors from "cors";
import { testDbConnection } from "./db/index.js";
import textbasedRoutes from "./routes/textBasedRoutes.js";
import predictionDailyRoutes from "./routes/predictionDailyRoutes.js";
import prediction10DaysRoutes from "./routes/prediction10DaysRoute.js";
import authRoutes from "./routes/authRoutes.js";
import userInfoRouter from "./routes/userInfo.js";
import subtitleRoutes from "./routes/subtitleRoutes.js";
import assignActivitiesRoute from "./routes/assignActivities.js"; // Use import instead of require

const app = express();

(async () => {
  try {
    await testDbConnection();

    // Middleware
    app.use(cors());
    app.use(express.json());

    // Routes
    app.use("/api/users", userInfoRouter);
    app.use("/api/auth", authRoutes);
    app.use("/api/subtitles", subtitleRoutes);
    app.use("/api/predictions", prediction10DaysRoutes);
    app.use("/api/predictions", predictionDailyRoutes);
    app.use("/api/textbased", textbasedRoutes);
    app.use("/api", assignActivitiesRoute);

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to connect to DB:", error);
    process.exit(1);
  }
})();
