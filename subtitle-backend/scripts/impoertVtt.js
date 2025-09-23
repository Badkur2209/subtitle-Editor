// scripts/importVTT.js
import fs from "fs";
import path from "path";
import { sequelize } from "../db/index.js";
import Video from "../models/Video.js";
import SubtitleSegment from "../models/SubtitleSegment.js";
import SubtitleTranslation from "../models/SubtitleTranslation.js";
import { parseVTTString } from "../utils/vtt.js";

// Customize this to your current folder layout
// e.g. /storage/<channel_name>/<language>/*.vtt
const BASE_DIR = path.resolve("./storage");
const LANGUAGE_DIR_TO_CODE = {
  english: "en",
  hindi: "hi",
  marathi: "mr",
  gujarati: "gu",
  telugu: "te",
  bengali: "bn",
};

function slugify(s) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function importChannel(channelName) {
  const channelPath = path.join(BASE_DIR, channelName);
  if (!fs.existsSync(channelPath)) return;

  const languages = Object.keys(LANGUAGE_DIR_TO_CODE);

  // First pass: import EN segments for each video title found in english/
  const enDir = path.join(channelPath, "english");
  if (!fs.existsSync(enDir)) return;

  const enFiles = fs.readdirSync(enDir).filter((f) => f.endsWith(".vtt"));
  for (const file of enFiles) {
    const baseName = file.replace(/\.vtt$/i, "");

    // Find matching video by title (exact or slug match)
    let video = await Video.findOne({ where: { video_title: baseName } });
    if (!video) {
      const all = await Video.findAll();
      video = all.find((v) => slugify(v.video_title) === slugify(baseName));
    }
    if (!video) {
      console.warn(
        `No video row for '${baseName}' in channel '${channelName}'. Skipping.`
      );
      continue;
    }

    // Parse EN VTT
    const full = path.join(enDir, file);
    const text = fs.readFileSync(full, "utf-8");
    const segs = parseVTTString(text);

    // Insert segments (wipe existing first for idempotency)
    await SubtitleSegment.destroy({ where: { video_id: video.id } });

    const rows = segs.map((s, idx) => ({
      video_id: video.id,
      index: idx,
      start_time: s.start,
      end_time: s.end,
      text: s.text,
    }));
    await SubtitleSegment.bulkCreate(rows);

    // Second pass: for each non-English language, try to import translations
    for (const dir of languages.filter((d) => d !== "english")) {
      const langCode = LANGUAGE_DIR_TO_CODE[dir];
      const langDir = path.join(channelPath, dir);
      if (!fs.existsSync(langDir)) continue;

      const langFileCandidates = [
        `${baseName}.vtt`,
        `${baseName}_${langCode}.vtt`,
        `${baseName}-${langCode}.vtt`,
      ];
      const existing = langFileCandidates.find((n) =>
        fs.existsSync(path.join(langDir, n))
      );
      if (!existing) continue;

      const tText = fs.readFileSync(path.join(langDir, existing), "utf-8");
      const tSegs = parseVTTString(tText);

      // Fetch EN segments again to map indexes
      const dbSegs = await SubtitleSegment.findAll({
        where: { video_id: video.id },
        order: [["index", "ASC"]],
      });

      // Insert translations by index alignment
      const tRows = dbSegs.map((dbSeg, i) => ({
        segment_id: dbSeg.id,
        language: langCode,
        translated_text: tSegs[i]?.text || "",
        updated_by: "importer",
        updated_at: new Date(),
      }));

      // Upsert per (segment_id, language)
      for (const r of tRows) {
        await SubtitleTranslation.upsert({
          segment_id: r.segment_id,
          language: r.language,
          translated_text: r.translated_text,
          updated_by: r.updated_by,
          updated_at: r.updated_at,
        });
      }
    }
  }
}

(async function run() {
  try {
    await sequelize.authenticate();
    console.log("DB connected");

    const channels = fs
      .readdirSync(BASE_DIR)
      .filter((d) => fs.statSync(path.join(BASE_DIR, d)).isDirectory());
    for (const ch of channels) {
      console.log("Importing:", ch);
      await importChannel(ch);
    }

    console.log("Import completed.");
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
