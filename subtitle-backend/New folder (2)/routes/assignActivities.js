//assignActivities.js
import express from "express";
import ActivityData from "../models/ActivityData.js";
// import { sequelize, activities } from "../db/index.js"; // ✅

const router = express.Router();

// router.get("/activities", async (req, res) => {
//   try {
//     const { status, date, assignedTo } = req.query;
//     const conditions = {};

//     // Add filters only if they exist
//     if (status) conditions.status = status;
//     if (date) conditions.Date = date;
//     if (assignedTo) conditions.assigned_to = assignedTo;

//     // Fetch all activities if no conditions, or filtered activities
//     const activities = await ActivityData.findAll({
//       where: Object.keys(conditions).length > 0 ? conditions : {},
//       order: [["Date", "DESC"]], // Add ordering
//     });

//     res.status(200).json({
//       success: true,
//       count: activities.length,
//       activities: activities,
//     });
//   } catch (error) {
//     console.error("Error fetching activities:", error);
//     res.status(500).json({
//       success: false,
//       message: "Error fetching activities",
//       error: error.message,
//     });
//   }
// });

router.get("/activities", async (req, res) => {
  try {
    // 2. Get fromDate and toDate from the query string
    const { status, assignedTo, fromDate, toDate } = req.query;
    const conditions = {};

    // Add filters only if they exist
    if (status) {
      conditions.status = status;
    }
    if (assignedTo) {
      conditions.assigned_to = assignedTo;
    }

    // 3. Add date range condition if both fromDate and toDate are provided
    // The frontend should send dates in 'YYYY-MM-DD' format
    if (fromDate && toDate) {
      conditions.Date = {
        [Op.between]: [fromDate, toDate],
      };
    }

    // Fetch all activities if no conditions, or filtered activities
    const activities = await ActivityData.findAll({
      where: conditions, // Simplified this line
      order: [["Date", "DESC"]],
    });

    res.status(200).json({
      success: true,
      count: activities.length,
      activities: activities,
    });
  } catch (error) {
    console.error("Error fetching activities:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching activities",
      error: error.message,
    });
  }
});

router.post("/assignActivities", async (req, res) => {
  try {
    const { userId, taskCount } = req.body;

    if (!userId || !taskCount) {
      return res.status(400).json({ error: "Missing userId or taskCount" });
    }

    // Fetch the user's username from the User table
    const user = await import("../models/User.js").then((m) =>
      m.default.findByPk(userId)
    );
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const username = user.username;

    // Fetch unassigned activities rows
    const activity = await ActivityData.findAll({
      where: { assigned_to: null }, // or assigned_to: '' depending on DB
      limit: parseInt(taskCount, 10),
    });

    if (activity.length === 0) {
      return res
        .status(400)
        .json({ error: "No unassigned activities rows available" });
    }

    // Update the rows with the assigned username
    await Promise.all(
      activity.map((activity) =>
        activity.update({ assigned_to: username, status: "working" })
      )
    );

    res.status(200).json({
      message: `✅ Assigned ${activity.length} activities to ${username}`,
    });
  } catch (error) {
    console.error("❌ Error assigning activities:", error);
    res.status(500).json({ error: error.message });
  }
});
export default router;
