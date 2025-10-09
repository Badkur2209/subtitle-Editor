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

const sanitizeFilename = (name = "") => {
  if (typeof name !== "string") return ""; // safeguard for undefined/null
  return name
    .toLowerCase() // convert to lowercase
    .replace(/[^a-z0-9\s]/g, "") // remove special characters
    .trim() // trim edges
    .replace(/\s+/g, "_"); // replace spaces with underscores
};

// GET /api/vtt/:videoId
router.get("/vtt/:videoId/:selected_lang", async (req, res) => {
  try {
    const { videoId, selected_lang } = req.params;

    const video = await Video.findByPk(videoId, {
      include: [{ model: Channel, attributes: ["channel_name"] }],
    });

    if (!video) {
      return res.status(404).json({ error: "Video not found" });
    }

    const channelName = sanitizeFilename(video.Channel.channel_name || "");
    const videoTitle = sanitizeFilename(video.video_title || "");
    const selectedLanguage = sanitizeFilename(selected_lang || "");

    const vttPath = path.join(
      __dirname,
      "..",
      "storage",
      channelName,
      `${videoTitle}_${selectedLanguage}.vtt`
    );
    console.log(vttPath);

    if (!fs.existsSync(vttPath)) {
      return res
        .status(404)
        .json({ error: `VTT file not found at path ${vttPath}` });
    }
    console.log("=================", vttPath);
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
