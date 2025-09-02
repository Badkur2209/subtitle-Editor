import fs from "fs";
import path from "path";
import { sequelize } from "../db/index.js";
import Video from "../models/Video.js";

const fixVttPaths = async () => {
  try {
    await sequelize.authenticate();
    console.log("🔌 Database connected");

    const dataDir = path.join(process.cwd(), "public", "data");
    const allVttFiles = fs
      .readdirSync(dataDir)
      .filter((f) => f.endsWith(".vtt"));
    console.log(`📁 Found ${allVttFiles.length} VTT files in directory`);

    const videos = await Video.findAll();
    let fixedCount = 0;

    for (const video of videos) {
      // Try to find matching VTT file
      const cleanTitle = video.video_title
        .replace(/[<>:"/\\|?*]/g, "")
        .replace(/&amp;/g, "&")
        .substring(0, 200);

      const possibleNames = [
        `${cleanTitle}.vtt`,
        `${video.video_title}.vtt`,
        video.vtt_file_path,
      ];

      let foundFile = null;
      for (const name of possibleNames) {
        if (name && allVttFiles.includes(name)) {
          foundFile = name;
          break;
        }
      }

      if (foundFile) {
        await video.update({
          vtt_file_path: foundFile,
          has_vtt: true,
        });
        console.log(
          `✅ Fixed: ${video.video_title.substring(0, 50)}... → ${foundFile}`
        );
        fixedCount++;
      } else {
        console.log(
          `❌ No VTT found for: ${video.video_title.substring(0, 50)}...`
        );
      }
    }

    console.log(`🎉 Fixed ${fixedCount} video VTT paths`);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await sequelize.close();
  }
};

fixVttPaths();
