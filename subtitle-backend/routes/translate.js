// routes/translate.js
import fs from "fs";
import path from "path";
import Video from "../models/Video.js";
import Channel from "../models/Channel.js";
const express = require("express");
const router = express.Router();
const axios = require("axios");

const { language, content } = req.body;
const { videoId } = req.params;

if (!language || !content || !videoId) {
  return res.status(400).json({ error: "Missing fields" });
}

// save subtitles as e.g. <videoId>_<language>.vtt
const filePath = path.join(STORAGE_PATH, `${videoId}_${language}.vtt`);
fs.writeFileSync(filePath, content, "utf-8");

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
app.get("/api/vtt/:videoId", async (req, res) => {
  try {
    const { videoId } = req.params;

    // Get video with channel info
    const video = await Video.findByPk(videoId, {
      include: [{ model: Channel, attributes: ["channel_name"] }],
    });

    if (!video) {
      return res.status(404).json({ error: "Video not found" });
    }

    const channelName = video.Channel.channel_name;
    const videoTitle = video.video_title;
    const vttPath = path.join("storage", channelName, `${videoTitle}.vtt`);

    // Check if file exists
    if (!fs.existsSync(vttPath)) {
      return res.status(404).json({ error: "VTT file not found" });
    }

    const content = fs.readFileSync(vttPath, "utf8");

    res.json({
      content: content,
      link: video.link,
    });
  } catch (error) {
    console.error("Error loading VTT:", error);
    res.status(500).json({ error: "Failed to load VTT file" });
  }
});

// POST /api/vtt/:videoId/translate
app.post("/api/vtt/:videoId/translate", async (req, res) => {
  try {
    const { videoId } = req.params;
    const { language, content } = req.body;

    // Get video with channel info
    const video = await Video.findByPk(videoId, {
      include: [{ model: Channel, attributes: ["channel_name"] }],
    });

    if (!video) {
      return res.status(404).json({ error: "Video not found" });
    }

    const channelName = video.Channel.channel_name;
    const videoTitle = video.video_title;

    // Create translated filename
    const translatedFilename = `${videoTitle}_${language}.vtt`;
    const translatedPath = path.join(
      "storage",
      channelName,
      translatedFilename
    );

    // Ensure directory exists
    const dir = path.join("storage", channelName);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Save translated file
    fs.writeFileSync(translatedPath, content);

    // Update video status for this language
    const statusField = `status_${language}`;
    await video.update({ [statusField]: "completed" });

    res.json({
      success: true,
      filepath: translatedPath,
      message: `Translation saved for ${language}`,
    });
  } catch (error) {
    console.error("Error saving translation:", error);
    res.status(500).json({ error: "Failed to save translation" });
  }
});

module.exports = router;
