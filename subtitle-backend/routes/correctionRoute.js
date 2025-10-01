import express from "express";
import ActivityData from "../models/ActivityData.js";
import { Op } from "sequelize";

const router = express.Router();

// Load items based on module, language, and date filter
router.post("/load-items", async (req, res) => {
  try {
    const { module, sourceLanguage, date } = req.body;

    if (!module || !sourceLanguage) {
      return res.status(400).json({
        error: "Module and source language are required",
      });
    }

    let whereClause = {};

    // Add date filter if provided
    if (date) {
      whereClause.Date = {
        [Op.like]: `%${date}%`,
      };
    }

    // Only show items that have data for the selected language
    const activityField = `act_${sourceLanguage}`;
    const languageField = sourceLanguage;

    whereClause[Op.or] = [
      { [activityField]: { [Op.ne]: null } },
      { [activityField]: { [Op.ne]: "" } },
      { [languageField]: { [Op.ne]: null } },
      { [languageField]: { [Op.ne]: "" } },
    ];

    if (module === "activities") {
      const items = await ActivityData.findAll({
        where: whereClause,
        attributes: [
          "id",
          "Date",
          "status",
          "act_hi",
          "act_en",
          "act_gu",
          "act_mr",
          "act_te",
          "act_bn",
          "hi",
          "en",
          "gu",
          "mr",
          "te",
          "bn",
          "url",
          "assigned_to",
        ],
        order: [
          ["Date", "DESC"],
          ["id", "DESC"],
        ],
      });

      return res.json({
        success: true,
        items: items || [],
      });
    }

    // Handle other modules here (predictionDaily, prediction10Days)
    return res.json({
      success: true,
      items: [],
    });
  } catch (error) {
    console.error("Error loading items:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
});

// Save correction
router.post("/save-correction", async (req, res) => {
  try {
    const {
      id,
      module,
      sourceLanguage,
      correctedActivityName,
      correctedLanguageData,
    } = req.body;

    if (!id || !module || !sourceLanguage) {
      return res.status(400).json({
        error: "ID, module, and source language are required",
      });
    }

    if (!correctedActivityName && !correctedLanguageData) {
      return res.status(400).json({
        error: "At least one correction field is required",
      });
    }

    if (module === "activities") {
      // Determine which fields to update based on source language
      const activityField = `act_${sourceLanguage}`;
      const languageField = sourceLanguage;

      const updateData = {
        status: "completed",
      };

      // Only update fields that have corrections
      if (correctedActivityName) {
        updateData[activityField] = correctedActivityName;
      }

      if (correctedLanguageData) {
        updateData[languageField] = correctedLanguageData;
      }

      const [updatedRowsCount] = await ActivityData.update(updateData, {
        where: { id: id },
      });

      if (updatedRowsCount === 0) {
        return res.status(404).json({
          error: "Item not found",
        });
      }

      // Get the updated item to return
      const updatedItem = await ActivityData.findByPk(id, {
        attributes: [
          "id",
          "Date",
          "status",
          "act_hi",
          "act_en",
          "act_gu",
          "act_mr",
          "act_te",
          "act_bn",
          "hi",
          "en",
          "gu",
          "mr",
          "te",
          "bn",
          "url",
          "assigned_to",
        ],
      });

      return res.json({
        success: true,
        message: "Correction saved successfully",
        item: updatedItem,
      });
    }

    // Handle other modules here
    return res.status(400).json({
      error: "Module not supported yet",
    });
  } catch (error) {
    console.error("Error saving correction:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
});

// Get single item details with language-specific data
router.get("/item/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { module, sourceLanguage } = req.query;

    if (module === "activities") {
      const item = await ActivityData.findByPk(id);

      if (!item) {
        return res.status(404).json({
          error: "Item not found",
        });
      }

      // Extract language-specific data
      const activityField = `act_${sourceLanguage}`;
      const languageField = sourceLanguage;

      const responseData = {
        ...item.toJSON(),
        correctionData: {
          activityName: item[activityField] || "",
          languageData: item[languageField] || "",
        },
      };

      return res.json({
        success: true,
        item: responseData,
      });
    }

    return res.status(400).json({
      error: "Module not supported",
    });
  } catch (error) {
    console.error("Error fetching item:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
});

// Get correction statistics by language
router.get("/stats", async (req, res) => {
  try {
    const { module, sourceLanguage } = req.query;

    if (module === "activities") {
      // Base stats
      const stats = await ActivityData.findAll({
        attributes: [
          "status",
          [ActivityData.sequelize.fn("COUNT", "*"), "count"],
        ],
        group: ["status"],
      });

      const formattedStats = stats.reduce((acc, stat) => {
        acc[stat.status] = parseInt(stat.get("count"));
        return acc;
      }, {});

      // Language-specific stats if language is provided
      if (sourceLanguage) {
        const activityField = `act_${sourceLanguage}`;
        const languageField = sourceLanguage;

        const languageStats = await ActivityData.findAll({
          attributes: [
            [ActivityData.sequelize.fn("COUNT", "*"), "total"],
            [
              ActivityData.sequelize.fn(
                "COUNT",
                ActivityData.sequelize.col(activityField)
              ),
              "activityCount",
            ],
            [
              ActivityData.sequelize.fn(
                "COUNT",
                ActivityData.sequelize.col(languageField)
              ),
              "languageCount",
            ],
          ],
        });

        if (languageStats.length > 0) {
          const langStat = languageStats[0];
          formattedStats.languageSpecific = {
            total: parseInt(langStat.get("total")),
            hasActivityName: parseInt(langStat.get("activityCount")),
            hasLanguageData: parseInt(langStat.get("languageCount")),
          };
        }
      }

      return res.json({
        success: true,
        stats: formattedStats,
      });
    }

    return res.json({
      success: true,
      stats: {},
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return res.status(500).json({
      error: "Internal server error",
      details: error.message,
    });
  }
});

export default router;
