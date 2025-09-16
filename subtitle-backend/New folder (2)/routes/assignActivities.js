import express from "express";
import ActivityData from "../models/ActivityData.js";
// import { sequelize, activities } from "../db/index.js"; // ✅

const router = express.Router();

// router.post("/assignActivities", async (req, res) => {
//   try {
//     const { userIds, fromDate, toDate, count } = req.body;

//     if (!Array.isArray(userIds) || userIds.length === 0) {
//       return res
//         .status(400)
//         .json({ message: "At least one user is required." });
//     }
//     if (!fromDate || !toDate) {
//       return res
//         .status(400)
//         .json({ message: "From and To dates are required." });
//     }
//     if (!count || isNaN(count) || count <= 0) {
//       return res.status(400).json({ message: "Invalid activity count." });
//     }

//     const activities = await Activity.findAll({
//       where: {
//         Date: { [Op.between]: [fromDate, toDate] },
//         id: {
//           [Op.notIn]: sequelize.literal(
//             "(SELECT task_id FROM activity_assignments)"
//           ),
//         },
//       },
//       limit: count,
//     });

//     if (!activities.length) {
//       return res
//         .status(400)
//         .json({ message: "No activities available for assignment." });
//     }

//     const assignments = [];
//     for (const userId of userIds) {
//       for (const activity of activities) {
//         assignments.push({
//           user_id: userId,
//           task_id: activity.id,
//           status: "assigned",
//           createdAt: new Date(),
//           updatedAt: new Date(),
//         });
//       }
//     }

//     await ActivityAssignment.bulkCreate(assignments);

//     return res.status(200).json({
//       success: true,
//       assigned: assignments.length,
//       message: `${assignments.length} assignments created successfully.`,
//     });
//   } catch (error) {
//     console.error("Error assigning activities:", error);
//     return res.status(500).json({ message: "Internal server error." });
//   }
// });
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
