import express from "express";
import Channel from "../models/Channel.js";
import Video from "../models/Video.js";
import TranslationProject from "../models/TranslationProject.js";
import SubtitleSegment from "../models/SubtitleSegment.js";

const router = express.Router();

// 1️⃣ Get all channels
router.get("/channels", async (req, res) => {
  try {
    const channels = await Channel.findAll();
    res.json(channels);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch channels" });
  }
});

// 2️⃣ Get videos for a channel
router.get("/channels/:id/videos", async (req, res) => {
  try {
    const channelId = req.params.id;
    const videos = await Video.findAll({ where: { channel_id: channelId } });
    res.json(videos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch videos" });
  }
});

// 3️⃣ Create or get translation project
router.post("/projects", async (req, res) => {
  try {
    const { video_id, target_language } = req.body;

    let project = await TranslationProject.findOne({
      where: { video_id, target_language },
    });

    if (!project) {
      project = await TranslationProject.create({
        video_id,
        target_language,
        status: "pending",
      });
    }

    res.json(project);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create/get project" });
  }
});

// 4️⃣ Load VTT segments for a project
router.get("/projects/:projectId/load-vtt", async (req, res) => {
  try {
    const { projectId } = req.params;

    const segments = await SubtitleSegment.findAll({
      where: { project_id: projectId },
      order: [["segment_index", "ASC"]],
    });

    res.json({ segments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to load VTT segments" });
  }
});

// 5️⃣ Save segments
router.post("/projects/:projectId/segments", async (req, res) => {
  try {
    const { projectId } = req.params;
    const { segments } = req.body;

    // Save or update each segment
    for (const seg of segments) {
      if (seg.id) {
        await SubtitleSegment.update(seg, { where: { id: seg.id } });
      } else {
        await SubtitleSegment.create({ ...seg, project_id: projectId });
      }
    }

    res.json({ message: "Segments saved successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to save segments" });
  }
});

export default router;
