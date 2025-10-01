import fs from "fs";
import path from "path";
import { Router } from "express";
import Video from "../models/Video.js";
import Channel from "../models/Channel.js";

const router = Router();

// --- Helper: sanitize video titles for safe filenames ---
const sanitizeFilename = (name) =>
  name.replace(/[<>:"/\\|?*\x00-\x1F]/g, "_").trim();

// --- GET: Load subtitles by videoId ---
// router.get("/vtt/:videoId", async (req, res) => {
//   try {
//     const { videoId } = req.params;

//     // Fetch video including its channel
//     const video = await Video.findByPk(videoId, {
//       include: [{ model: Channel, attributes: ["channel_name"] }],
//     });

//     if (!video) {
//       return res.status(404).json({ error: "Video not found" });
//     }

//     const channelName = sanitizeFilename(video.Channel.channel_name);
//     const safeTitle = sanitizeFilename(video.video_title);

//     const filePath = path.join("storage", channelName, `${safeTitle}.vtt`);

//     if (!fs.existsSync(filePath)) {
//       return res.status(404).json({ error: "VTT file not found" });
//     }

//     const content = fs.readFileSync(filePath, "utf8");

//     res.json({
//       content,
//       link: video.link,
//     });
//   } catch (error) {
//     console.error("Error loading VTT:", error);
//     res.status(500).json({ error: "Failed to load VTT file" });
//   }
// });
router.get("/:channelId", async (req, res) => {
  try {
    const channelId = parseInt(req.params.channelId, 10);

    const videos = await Video.findAll({
      where: { channel_id: channelId },
      attributes: ["id", "video_title", "link"],
    });

    res.json(videos);
  } catch (err) {
    console.error("Error fetching videos:", err);
    res.status(500).json({ error: err.message });
  }
});

// --- POST: Save translated file ---
router.post("/vtt/:videoId/translate", async (req, res) => {
  try {
    const { videoId } = req.params;
    const { language, content } = req.body;

    if (!videoId || !language || !content) {
      return res.status(400).json({ error: "Missing fields" });
    }

    // Fetch video including its channel
    const video = await Video.findByPk(videoId, {
      include: [{ model: Channel, attributes: ["channel_name"] }],
    });

    if (!video) {
      return res.status(404).json({ error: "Video not found" });
    }

    const channelName = sanitizeFilename(video.Channel.channel_name);
    const safeTitle = sanitizeFilename(video.video_title);

    // Store as <videoId>_<language>.vtt for uniqueness
    const filename = `${videoId}_${language}.vtt`;
    const dirPath = path.join("storage", channelName);

    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    const filePath = path.join(dirPath, filename);

    fs.writeFileSync(filePath, content, "utf-8");

    // Optionally update DB with status for language
    const statusField = `status_${language}`;
    await video.update({ [statusField]: "in-progress" }); // or "completed" later

    res.json({
      success: true,
      filepath: filePath,
      message: `Translation saved for ${language}`,
    });
  } catch (error) {
    console.error("Error saving translation:", error);
    res.status(500).json({ error: "Failed to save translation" });
  }
});

export default router;
