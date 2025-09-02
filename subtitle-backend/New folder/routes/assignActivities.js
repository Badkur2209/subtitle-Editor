import express from "express";
import { Op } from "sequelize";
// import { sequelize, activities } from "../db/index.js"; // ✅

const router = express.Router();

router.post("/assign-activities", async (req, res) => {
  try {
    const { userIds, fromDate, toDate, count } = req.body;

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res
        .status(400)
        .json({ message: "At least one user is required." });
    }
    if (!fromDate || !toDate) {
      return res
        .status(400)
        .json({ message: "From and To dates are required." });
    }
    if (!count || isNaN(count) || count <= 0) {
      return res.status(400).json({ message: "Invalid activity count." });
    }

    const activities = await Activity.findAll({
      where: {
        Date: { [Op.between]: [fromDate, toDate] },
        id: {
          [Op.notIn]: sequelize.literal(
            "(SELECT task_id FROM activity_assignments)"
          ),
        },
      },
      limit: count,
    });

    if (!activities.length) {
      return res
        .status(400)
        .json({ message: "No activities available for assignment." });
    }

    const assignments = [];
    for (const userId of userIds) {
      for (const activity of activities) {
        assignments.push({
          user_id: userId,
          task_id: activity.id,
          status: "assigned",
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }

    await ActivityAssignment.bulkCreate(assignments);

    return res.status(200).json({
      success: true,
      assigned: assignments.length,
      message: `${assignments.length} assignments created successfully.`,
    });
  } catch (error) {
    console.error("Error assigning activities:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
});

export default router;
