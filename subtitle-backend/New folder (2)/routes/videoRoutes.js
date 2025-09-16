import express from "express";
import Video from "../models/Video.js";
import { createVideos } from "../controllers/videoController.js";
const router = express.Router();
router.post("/", createVideos);
// GET videos for a specific channel
// routes/videoRoutes.js
router.get("/:channelId", async (req, res) => {
  try {
    const channelId = parseInt(req.params.channelId, 10); // convert to number

    const videos = await Video.findAll({
      where: { channel_id: channelId }, // must match integer type
      attributes: ["id", "video_title", "link"],
    });

    console.log("Videos fetched:", videos);
    res.json(videos);
  } catch (err) {
    console.error("Error fetching videos:", err); // log full error
    res.status(500).json({ error: err.message });
  }
});

export default router;
