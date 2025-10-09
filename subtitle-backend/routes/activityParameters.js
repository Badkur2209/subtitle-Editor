import express from "express";
import { sequelize } from "../db/index.js";
import ActivityData from "../models/ActivityData.js";

const router = express.Router();

router.get("/parameters", async (req, res) => {
  try {
    const allActivities = await ActivityData.findAll();
    res.json(allActivities);
  } catch (err) {
    console.error("❌ Error fetching activities:", err);
    res.status(500).json({ message: "Server error while fetching data." });
  }
});

router.post("/parameters", async (req, res) => {
  try {
    console.log("📥 Incoming POST /parameters body:", req.body);
    const { id, ...fields } = req.body;

    if (!id) {
      return res.status(400).json({ message: "id is required" });
    }

    // Find record by ID
    const record = await ActivityData.findByPk(id);
    console.log("📄 Existing record:", record);
    if (record) {
      // Update existing
      await record.update(fields);
      res.json({ message: "ActivityData updated successfully", data: record });
    } else {
      // Create new (optional, remove if only update is needed)
      const created = await ActivityData.create({ id, ...fields });
      res.json({ message: "ActivityData created successfully", data: created });
    }
  } catch (err) {
    console.error("❌ Error saving activity data:", err);
    res.status(500).json({ message: "Server error while saving data." });
  }
});

export default router;
