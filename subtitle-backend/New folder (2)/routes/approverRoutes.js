// routes/approverRoutes.js
import express from "express";
import Prediction10Days from "../models/Prediction10Days.js";
import { Op } from "sequelize";

const router = express.Router();

// GET items for review based on language status
router.get("/prediction10days", async (req, res) => {
  try {
    const { language = "en" } = req.query;
    const statusColumn = `status_${language}`;

    const items = await Prediction10Days.findAll({
      where: {
        [statusColumn]: "inreview",
      },
      order: [["fromdate", "DESC"]],
    });
    res.json(items);
  } catch (err) {
    console.error("Error fetching items for review:", err);
    res.status(500).json({ error: "Failed to fetch items" });
  }
});

// POST update status for specific language
router.post("/prediction10days/status", async (req, res) => {
  const { id, status, statusColumn, language } = req.body;

  if (!id || !status || !language) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const item = await Prediction10Days.findByPk(id);
    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }

    // Update the specific language status
    const updateData = {};
    updateData[`status_${language}`] = status;

    await Prediction10Days.update(updateData, {
      where: { id },
    });

    res.json({
      message: "Status updated successfully",
      updated: updateData,
    });
  } catch (err) {
    console.error("Error updating status:", err);
    res.status(500).json({ error: "Failed to update status" });
  }
});

export default router;

// // routes/approverRoutes.js

// import express from "express";
// import Prediction10Days from "../models/prediction10Days.js";

// const router = express.Router();

// // GET inreview items
// router.get("/prediction10days", async (req, res) => {
//   try {
//     const items = await Prediction10Days.findAll({
//       where: { status_en: "inreview" },
//     });
//     res.json(items);
//   } catch (err) {
//     res.status(500).json({ error: "Failed to fetch items" });
//   }
// });

// // POST update status
// router.post("/prediction10days/status", async (req, res) => {
//   const { id, status, assigned_to } = req.body;
//   if (!id || !status) {
//     return res.status(400).json({ error: "Missing id or status" });
//   }
//   try {
//     const item = await Prediction10Days.findByPk(id);
//     if (!item) {
//       return res.status(404).json({ error: "Item not found" });
//     }

//     // Update status_en and optionally assigned_to if status is assigned
//     item.status_en = status;
//     if (status === "assigned" && assigned_to) {
//       item.assigned_to = assigned_to;
//     }
//     await item.save();

//     res.json({ message: "Status updated" });
//   } catch (err) {
//     res.status(500).json({ error: "Failed to update status" });
//   }
// });

// export default router;
