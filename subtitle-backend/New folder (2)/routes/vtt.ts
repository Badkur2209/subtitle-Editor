import express, { Request, Response } from "express";
import fs from "fs";
import path from "path";

const router = express.Router();

const STORAGE_PATH = path.join(__dirname, "../storage");

const sanitizeFilename = (name: string): string => {
  return name.replace(/[<>:"/\\|?*\x00-\x1F]/g, "_").trim();
};

// Notice Request/Response types here:
router.get("/", (req: Request, res: Response) => {
  try {
    const { channel, video } = req.query;

    if (!channel || !video) {
      return res.status(400).json({ error: "Missing channel or video param" });
    }

    const safeChannel = sanitizeFilename(String(channel));
    const safeVideo = sanitizeFilename(String(video));

    const filePath = path.join(STORAGE_PATH, safeChannel, `${safeVideo}.vtt`);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "VTT file not found" });
    }

    const vttContent = fs.readFileSync(filePath, "utf-8");
    res.setHeader("Content-Type", "text/vtt");
    return res.send(vttContent);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
