const express = require("express");
const router = express.Router();
const pool = require("../db");

// Save original + translated VTT
router.post("/save", async (req, res) => {
  const { video_id, user_id, original_vtt, translated_vtt } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO subtitles (video_id, user_id, original_vtt, translated_vtt)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [video_id, user_id, original_vtt, translated_vtt]
    );

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error("❌ Error saving subtitles:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
