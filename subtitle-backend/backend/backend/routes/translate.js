// routes/translate.js
const express = require("express");
const router = express.Router();
const axios = require("axios");

router.post("/translate", async (req, res) => {
  try {
    const { q, target } = req.body;
    const response = await axios.post("https://libretranslate.de/translate", {
      q,
      source: "en",
      target,
      format: "text"
    }, {
      headers: { "Content-Type": "application/json" }
    });

    res.json({ translatedText: response.data.translatedText });
  } catch (error) {
    console.error("Translation error:", error.message);
    res.status(500).json({ error: "Translation failed" });
  }
});

module.exports = router;
