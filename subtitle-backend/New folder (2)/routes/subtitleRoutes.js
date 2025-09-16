import express from "express";
import Channel from "../models/Channel.js";
import Video from "../models/Video.js";
import TranslationProject from "../models/TranslationProject.js";
import SubtitleSegment from "../models/SubtitleSegment.js";
// import { parseVTT } from "../utils/vttUtils.js";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";

const router = express.Router();
const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";

// Auth middleware
const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Auth error:", error);
    res.status(401).json({ error: "Invalid token" });
  }
};

// Test route
router.get("/test", (req, res) => {
  res.json({ message: "Subtitle routes working!", timestamp: new Date() });
});

// Get all channels
router.get("/channels", authMiddleware, async (req, res) => {
  try {
    const channels = await Channel.findAll({
      order: [["channel_name", "ASC"]],
    });
    console.log(`📺 Found ${channels.length} channels`);
    res.json(channels);
  } catch (error) {
    console.error("Error fetching channels:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get videos for a channel
router.get("/channels/:channelId/videos", authMiddleware, async (req, res) => {
  try {
    const videos = await Video.findAll({
      where: { channel_id: req.params.channelId },
      order: [["video_title", "ASC"]],
    });
    console.log(
      `🎬 Found ${videos.length} videos for channel ${req.params.channelId}`
    );
    res.json(videos);
  } catch (error) {
    console.error("Error fetching videos:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Create or get translation project
router.post("/projects", authMiddleware, async (req, res) => {
  try {
    const { video_id, target_language } = req.body;
    console.log(
      `🎯 Creating/getting project for video ${video_id}, language ${target_language}`
    );

    let project = await TranslationProject.findOne({
      where: {
        video_id,
        user_id: req.user.id,
        target_language,
      },
    });

    if (!project) {
      project = await TranslationProject.create({
        video_id,
        user_id: req.user.id,
        target_language,
      });
      console.log(`✅ Created new project ${project.id}`);
    } else {
      console.log(`📝 Using existing project ${project.id}`);
    }

    res.json(project);
  } catch (error) {
    console.error("Error creating project:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Load VTT file and populate segments
router.get(
  "/projects/:projectId/load-vtt",
  authMiddleware,
  async (req, res) => {
    try {
      const projectId = req.params.projectId;
      console.log(`📁 Loading VTT for project ${projectId}`);

      const project = await TranslationProject.findOne({
        where: { id: projectId, user_id: req.user.id },
      });

      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      const video = await Video.findByPk(project.video_id);
      if (!video) {
        return res.status(404).json({ error: "Video not found" });
      }

      console.log(`🎬 Video: ${video.video_title}`);
      console.log(`📄 VTT file: ${video.vtt_file_path}`);

      // Check if segments already exist
      let segments = await SubtitleSegment.findAll({
        where: { project_id: project.id },
        order: [["segment_index", "ASC"]],
      });

      console.log(`💾 Found ${segments.length} existing segments in DB`);

      if (segments.length === 0 && video.vtt_file_path && video.has_vtt) {
        const vttPath = path.join(
          process.cwd(),
          "public",
          "data",
          video.vtt_file_path
        );
        console.log(`📂 Looking for VTT at: ${vttPath}`);

        if (fs.existsSync(vttPath)) {
          const vttContent = fs.readFileSync(vttPath, "utf8");
          const parsedVTT = parseVTT(vttContent);

          console.log(`📄 Parsed ${parsedVTT.length} segments from VTT`);

          for (let i = 0; i < parsedVTT.length; i++) {
            const seg = parsedVTT[i];
            await SubtitleSegment.create({
              project_id: project.id,
              segment_index: i,
              start_time: seg.start,
              end_time: seg.end,
              original_text: seg.text,
              translated_text: "",
            });
          }

          segments = await SubtitleSegment.findAll({
            where: { project_id: project.id },
            order: [["segment_index", "ASC"]],
          });

          console.log(`✅ Inserted ${segments.length} new segments`);
        } else {
          const dataDir = path.join(process.cwd(), "public", "data");
          const availableFiles = fs
            .readdirSync(dataDir)
            .filter((f) => f.endsWith(".vtt"));
          console.log(
            `❌ VTT file not found. Available .vtt files:`,
            availableFiles
          );
          return res.status(404).json({ error: "VTT file not found" });
        }
      }

      res.json({
        project,
        video,
        segments,
        message: `Loaded ${segments.length} segments`,
      });
    } catch (error) {
      console.error("Error loading VTT and segments:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Save segments
router.post(
  "/projects/:projectId/segments",
  authMiddleware,
  async (req, res) => {
    try {
      const { segments } = req.body;
      const projectId = req.params.projectId;

      console.log(
        `💾 Saving ${segments.length} segments for project ${projectId}`
      );

      const project = await TranslationProject.findOne({
        where: {
          id: projectId,
          user_id: req.user.id,
        },
      });

      if (!project) {
        return res.status(404).json({ error: "Project not found" });
      }

      let updatedCount = 0;
      for (const segment of segments) {
        await SubtitleSegment.upsert({
          id: segment.id,
          project_id: projectId,
          segment_index: segment.segment_index,
          start_time: segment.start_time,
          end_time: segment.end_time,
          original_text: segment.original_text,
          translated_text: segment.translated_text,
          updated_at: new Date(),
        });
        updatedCount++;
      }

      await project.update({
        status: "in_progress",
        updated_at: new Date(),
      });

      console.log(`✅ Updated ${updatedCount} segments`);
      res.json({
        message: "Segments saved successfully",
        updated: updatedCount,
      });
    } catch (error) {
      console.error("Error saving segments:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

export default router;

// import express from "express";
// import Channel from "../models/Channel.js";
// import Video from "../models/Video.js";
// import TranslationProject from "../models/TranslationProject.js";
// import SubtitleSegment from "../models/SubtitleSegment.js";
// import { parseVTT } from "../utils/vttUtils.js"; // ← Add this import
// import jwt from "jsonwebtoken";
// import fs from "fs";
// import path from "path";

// const router = express.Router();
// const JWT_SECRET =
//   process.env.JWT_SECRET || "your-secret-key-change-in-production";

// // Auth middleware
// const authMiddleware = (req, res, next) => {
//   try {
//     const token = req.headers.authorization?.split(" ")[1];
//     if (!token) {
//       return res.status(401).json({ error: "No token provided" });
//     }
//     const decoded = jwt.verify(token, JWT_SECRET);
//     req.user = decoded;
//     next();
//   } catch (error) {
//     console.error("Auth error:", error);
//     res.status(401).json({ error: "Invalid token" });
//   }
// };

// // Test route
// router.get("/test", (req, res) => {
//   res.json({ message: "Subtitle routes working!", timestamp: new Date() });
// });

// // Get all channels
// router.get("/channels", authMiddleware, async (req, res) => {
//   try {
//     const channels = await Channel.findAll({
//       order: [["channel_name", "ASC"]],
//     });
//     console.log(`📺 Found ${channels.length} channels`);
//     res.json(channels);
//   } catch (error) {
//     console.error("Error fetching channels:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

// // Get videos for a channel
// router.get("/channels/:channelId/videos", authMiddleware, async (req, res) => {
//   try {
//     const videos = await Video.findAll({
//       where: { channel_id: req.params.channelId },
//       order: [["video_title", "ASC"]],
//     });
//     console.log(
//       `🎬 Found ${videos.length} videos for channel ${req.params.channelId}`
//     );
//     res.json(videos);
//   } catch (error) {
//     console.error("Error fetching videos:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

// // Create or get translation project
// router.post("/projects", authMiddleware, async (req, res) => {
//   try {
//     const { video_id, target_language } = req.body;
//     console.log(
//       `🎯 Creating/getting project for video ${video_id}, language ${target_language}`
//     );

//     // Check if project exists
//     let project = await TranslationProject.findOne({
//       where: {
//         video_id,
//         user_id: req.user.id,
//         target_language,
//       },
//     });

//     if (!project) {
//       project = await TranslationProject.create({
//         video_id,
//         user_id: req.user.id,
//         target_language,
//       });
//       console.log(`✅ Created new project ${project.id}`);
//     } else {
//       console.log(`📝 Using existing project ${project.id}`);
//     }

//     res.json(project);
//   } catch (error) {
//     console.error("Error creating project:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

// // 🔥 NEW: Load VTT file and get project with segments
// router.get(
//   "/projects/:projectId/load-vtt",
//   authMiddleware,
//   async (req, res) => {
//     try {
//       console.log(`📁 Loading VTT for project ${req.params.projectId}`);

//       const project = await TranslationProject.findOne({
//         where: {
//           id: req.params.projectId,
//           user_id: req.user.id,
//         },
//       });

//       if (!project) {
//         return res.status(404).json({ error: "Project not found" });
//       }

//       // Get video info
//       const video = await Video.findByPk(project.video_id);
//       if (!video) {
//         return res.status(404).json({ error: "Video not found" });
//       }

//       console.log(`🎬 Video: ${video.video_title}`);
//       console.log(`📄 VTT file: ${video.vtt_file_path}`);

//       // Check if segments already exist in database
//       let segments = await SubtitleSegment.findAll({
//         where: { project_id: project.id },
//         order: [["segment_index", "ASC"]],
//       });

//       console.log(`💾 Found ${segments.length} existing segments in database`);

//       // If no segments in DB and VTT file exists, load from VTT
//       // Around the VTT loading part
//       if (segments.length === 0 && video.vtt_file_path && video.has_vtt) {
//         try {
//           const vttPath = path.join(
//             process.cwd(),
//             "public",
//             "data",
//             video.vtt_file_path
//           );
//           console.log(`🔍 DEBUG VTT Loading:`);
//           console.log(`   Video title: "${video.video_title}"`);
//           console.log(`   Database vtt_file_path: "${video.vtt_file_path}"`);
//           console.log(`   Full path: "${vttPath}"`);
//           console.log(`   File exists: ${fs.existsSync(vttPath)}`);

//           if (fs.existsSync(vttPath)) {
//             const vttContent = fs.readFileSync(vttPath, "utf8");
//             console.log(`📄 VTT file size: ${vttContent.length} characters`);
//             console.log(
//               `📄 First 100 characters: "${vttContent.substring(0, 100)}"`
//             );

//             const parsedVTT = parseVTT(vttContent);
//             console.log(`🔍 Parsed ${parsedVTT.length} segments from VTT`);

//             // Rest of your VTT processing code...
//           } else {
//             console.log(`❌ VTT file not found. Available files:`);
//             const dataDir = path.join(process.cwd(), "public", "data");
//             const vttFiles = fs
//               .readdirSync(dataDir)
//               .filter((f) => f.endsWith(".vtt"));
//             console.log(`   Available .vtt files:`, vttFiles);
//           }
//         } catch (vttError) {
//           console.error("❌ Error loading VTT file:", vttError);
//         }
//       }

//       res.json({
//         project,
//         video,
//         segments,
//         message: `Loaded ${segments.length} segments`,
//       });
//     } catch (error) {
//       console.error("Error loading project:", error);
//       res.status(500).json({ error: "Internal server error" });
//     }
//   }
// );

// // Save segments
// router.post(
//   "/projects/:projectId/segments",
//   authMiddleware,
//   async (req, res) => {
//     try {
//       const { segments } = req.body;
//       const projectId = req.params.projectId;

//       console.log(
//         `💾 Saving ${segments.length} segments for project ${projectId}`
//       );

//       // Verify project ownership
//       const project = await TranslationProject.findOne({
//         where: {
//           id: projectId,
//           user_id: req.user.id,
//         },
//       });

//       if (!project) {
//         return res.status(404).json({ error: "Project not found" });
//       }

//       // Update segments
//       let updatedCount = 0;
//       for (const segment of segments) {
//         const [segmentRecord, created] = await SubtitleSegment.upsert({
//           id: segment.id,
//           project_id: projectId,
//           segment_index: segment.segment_index,
//           start_time: segment.start_time,
//           end_time: segment.end_time,
//           original_text: segment.original_text,
//           translated_text: segment.translated_text,
//           updated_at: new Date(),
//         });
//         updatedCount++;
//       }

//       // Update project status
//       await project.update({
//         status: "in_progress",
//         updated_at: new Date(),
//       });

//       console.log(`✅ Updated ${updatedCount} segments`);
//       res.json({
//         message: "Segments saved successfully",
//         updated: updatedCount,
//       });
//     } catch (error) {
//       console.error("Error saving segments:", error);
//       res.status(500).json({ error: "Internal server error" });
//     }
//   }
// );

// export default router;
