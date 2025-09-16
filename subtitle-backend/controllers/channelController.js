// controllers/channelController.js (ES module syntax)
import Channel from "../models/Channel.js";

export async function createChannel(req, res) {
  try {
    const { channel_name, description } = req.body;
    const channel = await Channel.create({
      channel_name,
      description,
    });
    res.status(201).json(channel);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}
