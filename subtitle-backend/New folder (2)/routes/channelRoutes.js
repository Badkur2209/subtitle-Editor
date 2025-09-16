// routes/channelRoutes.js
import express from "express";
import Channel from "../models/Channel.js";
import { createChannel } from "../controllers/channelController.js";
const router = express.Router();

// GET all channels
router.get("/", async (req, res) => {
  try {
    const channels = await Channel.findAll({
      attributes: ["id", "channel_name"],
    });
    res.json(channels); // return array
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.post("/", createChannel);
export default router;
