import { Router } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Video from "../models/Video.js";
import Channel from "../models/Channel.js";

const router = Router();

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sanitizeFilename = (name) =>
  name.replace(/[<>:"/\\|?*\x00-\x1F]/g, "_").trim();

// GET /api/vtt/:videoId
router.get("/vtt/:videoId", async (req, res) => {
  try {
    const { videoId } = req.params;

    const video = await Video.findByPk(videoId, {
      include: [{ model: Channel, attributes: ["channel_name"] }],
    });

    if (!video) {
      return res.status(404).json({ error: "Video not found" });
    }

    const channelName = sanitizeFilename(video.Channel.channel_name);
    const videoTitle = sanitizeFilename(video.video_title);

    const vttPath = path.join(
      __dirname,
      "..",
      "storage",
      channelName,
      `${videoTitle}.vtt`
    );

    if (!fs.existsSync(vttPath)) {
      return res.status(404).json({ error: "VTT file not found" });
    }

    const content = fs.readFileSync(vttPath, "utf-8");

    res.json({
      content,
      link: video.link,
    });
  } catch (error) {
    console.error("Error loading VTT:", error);
    res.status(500).json({ error: "Failed to load VTT file" });
  }
});

export default router;
