const express = require("express");
const router = express.Router();
const pool = require("../db");

// POST /api/save-subtitles
router.post("/save-subtitles", async (req, res) => {
  try {
    const { videoTitle, originalSegments, translatedSegments, userId } = req.body;

    const originalVtt = originalSegments.map(s => `${s.time}\n${s.text}`).join("\n\n");
    const translatedVtt = translatedSegments.map((text, i) => `${originalSegments[i].time}\n${text}`).join("\n\n");

    const videoResult = await pool.query(
      "INSERT INTO videos (title) VALUES ($1) ON CONFLICT (title) DO UPDATE SET title = EXCLUDED.title RETURNING id",
      [videoTitle]
    );

    const videoId = videoResult.rows[0].id;

    await pool.query(
      `INSERT INTO subtitles (video_id, user_id, original_vtt, translated_vtt) 
       VALUES ($1, $2, $3, $4)`,
      [videoId, userId, originalVtt, translatedVtt]
    );

    res.json({ message: "✅ Subtitles saved" });
  } catch (err) {
    console.error("❌ DB Error:", err);
    res.status(500).json({ error: "Server error while saving subtitles" });
  }
});

module.exports = router;
