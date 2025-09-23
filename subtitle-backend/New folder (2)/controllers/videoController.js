import Video from "../models/Video.js";

export async function createVideos(req, res) {
  try {
    const { channel_id, videos } = req.body;

    if (!channel_id || !Array.isArray(videos) || videos.length === 0) {
      return res.status(400).json({ error: "Invalid input" });
    }

    // Prepare bulk create data
    const bulkVideos = videos.map((video) => ({
      channel_id,
      video_title: video.video_title,
      link: video.link,
    }));

    const createdVideos = await Video.bulkCreate(bulkVideos);

    res
      .status(201)
      .json({ message: "Videos created", count: createdVideos.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
