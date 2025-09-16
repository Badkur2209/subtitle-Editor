// routes/vttRoutes.js
import express from "express";
import fs from "fs";
import path from "path";
import Video from "../models/Video.js";

const router = express.Router();
// POST save translated VTT
router.post("/:videoId/translate", async (req, res) => {
  try {
    const { language, content } = req.body;
    const video = await Video.findByPk(req.params.videoId);
    if (!video) return res.status(404).json({ error: "Video not found" });

    // Construct translated VTT path
    const translatedDir = path.join("storage", "translated");
    if (!fs.existsSync(translatedDir))
      fs.mkdirSync(translatedDir, { recursive: true });

    const filePath = path.join(
      translatedDir,
      `${video.video_title}_${language}.vtt`
    );
    fs.writeFileSync(filePath, content, "utf8");

    // Update status_<lang> column
    video[`status_${language}`] = "pending"; // or "completed"
    await video.save();

    res.json({ message: "Translation saved successfully" });
  } catch (err) {
    console.error("Error saving translated VTT:", err);
    res.status(500).json({ error: err.message });
  }
});

// GET original VTT by video ID
router.get("/:videoId", async (req, res) => {
  try {
    const video = await Video.findByPk(req.params.videoId);
    if (!video) return res.status(404).json({ error: "Video not found" });

    // Construct VTT path using video title
    const fileName = `${video.video_title}.vtt`;
    const vttPath = path.join("storage", "vtt", fileName);

    if (!fs.existsSync(vttPath)) {
      return res.status(404).json({ error: "VTT file not found" });
    }

    const content = fs.readFileSync(vttPath, "utf8");

    res.json({
      content,
      link: video.link,
    });
  } catch (err) {
    console.error("Error loading VTT:", err);
    res.status(500).json({ error: err.message });
  }
});
export default router;
