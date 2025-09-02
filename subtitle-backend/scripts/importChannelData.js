import XLSX from "xlsx";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Import your existing models and db connection
import { sequelize } from "../db/index.js";
import Channel from "../models/Channel.js";
import Video from "../models/Video.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const importChannelData = async (
  excelFilePath,
  channelName,
  channelDescription = ""
) => {
  try {
    console.log(`📁 Importing channel: ${channelName}`);

    // Create or get channel
    const [channel, created] = await Channel.findOrCreate({
      where: { channel_name: channelName },
      defaults: {
        channel_name: channelName,
        description: channelDescription,
      },
    });

    console.log(
      created
        ? `✅ Created channel: ${channelName} (ID: ${channel.id})`
        : `📝 Using existing channel: ${channelName} (ID: ${channel.id})`
    );

    // Read Excel file
    const fullPath = path.join(__dirname, "..", excelFilePath);
    console.log(`📖 Reading Excel from: ${fullPath}`);

    const workbook = XLSX.readFile(fullPath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const videos = XLSX.utils.sheet_to_json(sheet);

    console.log(`📺 Found ${videos.length} videos in Excel`);

    let importedCount = 0;
    let skippedCount = 0;

    // Import videos
    for (const video of videos) {
      if (
        video["Youtube Link"] &&
        video.name &&
        video.name !== "undefined" &&
        video.name.trim()
      ) {
        // Clean video title for file name
        const cleanTitle = video.name
          .replace(/[<>:"/\\|?*]/g, "")
          .replace(/&amp;/g, "&")
          .replace(/"/g, "")
          .trim()
          .substring(0, 200);

        const vttFileName = `${cleanTitle}.vtt`;
        const vttPath = path.join(
          __dirname,
          "..",
          "public",
          "data",
          vttFileName
        );
        const hasVTT = fs.existsSync(vttPath);

        try {
          const [videoRecord, videoCreated] = await Video.findOrCreate({
            where: {
              channel_id: channel.id,
              youtube_link: video["Youtube Link"],
            },
            defaults: {
              channel_id: channel.id,
              video_title: video.name,
              youtube_link: video["Youtube Link"],
              vtt_file_path: hasVTT ? vttFileName : null,
              has_vtt: hasVTT,
            },
          });

          if (videoCreated) {
            importedCount++;
            console.log(
              `  ✅ ${importedCount}. ${video.name.substring(0, 60)}... ${
                hasVTT ? "📄" : "❌"
              }`
            );
          } else {
            skippedCount++;
          }
        } catch (error) {
          console.error(`  ❌ Error importing "${video.name}":`, error.message);
        }
      } else {
        console.log(`  ⚠️  Skipping invalid entry: ${video.name || "unnamed"}`);
      }
    }

    console.log(`🎉 Import complete for ${channelName}:`);
    console.log(`   📺 ${importedCount} new videos imported`);
    console.log(`   ⏭️  ${skippedCount} videos skipped (already exist)`);
    console.log("---");

    return { imported: importedCount, skipped: skippedCount };
  } catch (error) {
    console.error(`❌ Error importing ${channelName}:`, error);
    throw error;
  }
};

// Main function
const runImport = async () => {
  try {
    console.log("🔌 Testing database connection...");
    await sequelize.authenticate();
    console.log("✅ Database connected successfully");
    console.log("");

    // Import your Barbara Oakley channel
    await importChannelData(
      "public/data/channelname.xlsx",
      "Barbara Oakley Physics",
      "Physics, Statistics, and Learning videos by Barbara Oakley"
    );

    // You can add more channels here later:
    // await importChannelData('public/data/channel2.xlsx', 'Channel 2 Name', 'Description');
    // await importChannelData('public/data/channel3.xlsx', 'Channel 3 Name', 'Description');

    console.log("🎊 All imports completed!");
  } catch (error) {
    console.error("💥 Import failed:", error);
  } finally {
    await sequelize.close();
    console.log("🔒 Database connection closed");
  }
};

// Run it
runImport();
