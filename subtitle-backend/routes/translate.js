// routes/translate.js
import fs from "fs";
import path from "path";
import Video from "../models/Video.js";
import Channel from "../models/Channel.js";
import express from "express";
const router = express.Router();
import axios from "axios";

import { fileURLToPath } from "url";

// recreate __filename and __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// now use __dirname
const STORAGE_PATH = path.join(__dirname, "../storage");

// save subtitles as e.g. <videoId>_<language>.vtt
// const filePath = path.join(STORAGE_PATH, `${videoId}_${language}.vtt`);
// fs.writeFileSync(filePath, content, "utf-8");

router.post("/translate", async (req, res) => {
  try {
    const { q, target } = req.body;
    const response = await axios.post(
      "https://libretranslate.de/translate",
      {
        q,
        source: "en",
        target,
        format: "text",
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    res.json({ translatedText: response.data.translatedText });
  } catch (error) {
    console.error("Translation error:", error.message);
    res.status(500).json({ error: "Translation failed" });
  }
});
// GET /api/vtt/:videoId
// app.get("/api/vtt/:videoId", async (req, res) => {
//   try {
//     const { videoId } = req.params;

//     // Get video with channel info
//     const video = await Video.findOne({ where: { id: videoId } });

//     if (!video) {
//       return res.status(404).json({ error: "Video not found" });
//     }

//     const channelName = video.Channel.channel_name;
//     const videoTitle = video.video_title;
//     const vttPath = path.join("storage", channelName, `${videoTitle}.vtt`);

//     // Check if file exists
//     if (!fs.existsSync(vttPath)) {
//       return res.status(404).json({ error: "VTT file not found" });
//     }

//     const content = fs.readFileSync(vttPath, "utf8");

//     res.json({
//       content: content,
//       link: video.link,
//     });
//   } catch (error) {
//     console.error("Error loading VTT:", error);
//     res.status(500).json({ error: "Failed to load VTT file" });
//   }
// });

// POST /api/vtt/:videoId/translate
router.post("/vtt/:videoId/translate", async (req, res) => {
  try {
    const { videoId } = req.params;
    const { language, content } = req.body;

    if (!videoId || !language || !content) {
      return res.status(400).json({ error: "Missing fields" });
    }

    // check existence
    const video = await Video.findOne({
      where: { id: videoId },
      include: [{ model: Channel, attributes: ["channel_name"] }],
    });

    if (!video) {
      return res.status(404).json({ error: "Video not found" });
    }

    const channelName = video.Channel.channel_name;
    const videoTitle = video.video_title;

    const translatedFilename = `${videoTitle}_${language}.vtt`;
    const translatedPath = path.join(
      "storage",
      channelName,
      translatedFilename
    );

    // ensure dir
    const dir = path.join("storage", channelName);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(translatedPath, content);

    const statusField = `status_${language}`;
    await video.update({ [statusField]: "completed" });

    return res.json({
      success: true,
      filepath: translatedPath,
      message: `Translation saved for ${language}`,
    });
  } catch (error) {
    console.error("Error in /translate:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});
export default router;
