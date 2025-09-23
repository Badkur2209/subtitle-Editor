import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { API_BASE_URL } from "../utils/config.ts";

interface Channel {
  id: number;
  channel_name: string;
}

interface Video {
  id: number;
  video_title: string;
  link: string;
}

interface Segment {
  start: string;
  end: string;
  text: string;
}

const LANG_KEYS = [
  "english",
  "hindi",
  "marathi",
  "bengali",
  "gujarati",
  "telugu",
];

const Translate: React.FC = () => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [sourceLangKey, setSourceLangKey] = useState<string>("english");
  const [targetLangKey, setTargetLangKey] = useState<string>("hindi");
  const [segments, setSegments] = useState<Segment[]>([]);
  const [translatedSegments, setTranslatedSegments] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<boolean>(false);

  // Prevent selecting same language
  useEffect(() => {
    if (sourceLangKey === targetLangKey) {
      const alternative =
        LANG_KEYS.find((lang) => lang !== sourceLangKey) || "english";
      setTargetLangKey(alternative);
    }
  }, [sourceLangKey, targetLangKey]);

  // Load channels on mount
  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/channels`);
        setChannels(res.data);
      } catch (err) {
        setError("Failed to load channels");
      }
    };
    fetchChannels();
  }, []);

  // Load videos when channel changes
  useEffect(() => {
    if (!selectedChannel) return;
    const fetchVideos = async () => {
      try {
        //  `${API_BASE_URL}/textbased/save`,
        const res = await axios.get(
          `${API_BASE_URL}/videos/${selectedChannel.id}`
        );
        setVideos(res.data);
      } catch (err) {
        setError("Failed to load videos");
      }
    };
    fetchVideos();
  }, [selectedChannel]);

  // Auto-save every 30 sec
  useEffect(() => {
    if (!selectedVideo) return;
    const interval = setInterval(() => {
      handleSave();
    }, 30000);
    return () => clearInterval(interval);
  }, [selectedVideo, translatedSegments]);

  // Utility: Parse .vtt into segments
  const parseVTT = (content: string): Segment[] => {
    const lines = content.split("\n");
    let segments: Segment[] = [];
    let i = 0;
    while (i < lines.length) {
      if (lines[i].includes("-->")) {
        const [start, end] = lines[i].split(" --> ").map((s) => s.trim());
        let textLines: string[] = [];
        i++;
        while (i < lines.length && lines[i].trim() !== "") {
          textLines.push(lines[i]);
          i++;
        }
        segments.push({
          start,
          end,
          text: textLines.join(" "),
        });
      }
      i++;
    }
    return segments;
  };

  // Utility: Build VTT back
  const buildVTT = (segments: Segment[], translations: string[]): string => {
    return (
      "WEBVTT\n\n" +
      segments
        .map(
          (seg, idx) =>
            `${seg.start} --> ${seg.end}\n${translations[idx] || ""}\n`
        )
        .join("\n")
    );
  };

  // Utility: Extract YouTube ID
  const extractYouTubeId = (url: string): string | null => {
    const match = url.match(/(?:v=|\.be\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
  };

  // Handler: Load VTT
  // const handleLoadVTT = async () => {
  //   if (!selectedChannel || !selectedVideo) return;
  //   setLoading(true);
  //   setError(null);
  //   try {
  //     const res = await axios.get(`${API_BASE_URL}/vtt`, {
  //       params: {
  //         channel: selectedChannel.channel_name,
  //         video: selectedVideo.video_title,
  //       },
  //     });
  //     const parsed = parseVTT(res.data);
  //     setSegments(parsed);
  //     setTranslatedSegments(Array(parsed.length).fill(""));
  //   } catch (err) {
  //     setError("Failed to load VTT file");
  //   } finally {
  //     setLoading(false);
  //   }
  // };
  const handleLoadVTT = async () => {
    if (!selectedVideo) return;
    setLoading(true);
    setError(null);
    try {
      // Now call backend with videoId (not channel + videoTitle)
      const res = await axios.get(`${API_BASE_URL}/vtt/${selectedVideo.id}`);

      const parsed = parseVTT(res.data.content);
      setSegments(parsed);
      setTranslatedSegments(Array(parsed.length).fill(""));

      // You also get the YouTube link back if you want:
      // res.data.link
    } catch (err) {
      setError("Failed to load VTT file");
    } finally {
      setLoading(false);
    }
  };
  // Handler: Save VTT
  // const handleSave = async () => {
  //   if (!selectedVideo) return;
  //   setSaving(true);
  //   try {
  //     const content = buildVTT(segments, translatedSegments);
  //     await axios.post(`${API_BASE_URL}/vtt/${selectedVideo.id}/translate`, {
  //       language: targetLangKey,
  //       content,
  //       userId: 1,
  //       status: "in-progress",
  //     });
  //   } catch (err) {
  //     setError("Failed to save translation");
  //   } finally {
  //     setSaving(false);
  //   }
  // };
  const handleSave = async () => {
    if (!selectedVideo) return;
    setSaving(true);
    try {
      const content = buildVTT(segments, translatedSegments);
      await axios.post(`${API_BASE_URL}/vtt/${selectedVideo.id}/translate`, {
        language: targetLangKey,
        content, // full WEBVTT string
      });
    } catch (err) {
      setError("Failed to save translation");
    } finally {
      setSaving(false);
    }
  };
  // Utility to sanitize filenames by removing unsupported characters
  const sanitizeFilename = (name: string): string => {
    return name.replace(/[<>:"/\\|?*\x00-\x1F]/g, "_").trim();
  };
  // Handler: Export to .vtt
  const handleExport = () => {
    if (!selectedVideo) return;
    const content = buildVTT(segments, translatedSegments);
    const blob = new Blob([content], { type: "text/vtt;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    // sanitize the file title
    const safeTitle = sanitizeFilename(selectedVideo.video_title);
    const filename = `${safeTitle}_${targetLangKey}.vtt`;

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const videoId = selectedVideo ? extractYouTubeId(selectedVideo.link) : null;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-4">VTT Translator</h1>

      {error && <p className="text-red-500">{error}</p>}
      {loading && <p className="text-blue-500">Loading...</p>}
      {saving && <p className="text-green-500">Saving...</p>}

      {/* Channel selector */}
      <select
        className="border p-2 mr-4"
        onChange={(e) =>
          setSelectedChannel(
            channels.find((ch) => ch.id === Number(e.target.value)) || null
          )
        }
      >
        <option value="">Select Channel</option>
        {channels.map((ch) => (
          <option key={ch.id} value={ch.id}>
            {ch.channel_name}
          </option>
        ))}
      </select>

      {/* Video selector */}
      <select
        className="border p-2 mr-4"
        onChange={(e) =>
          setSelectedVideo(
            videos.find((v) => v.id === Number(e.target.value)) || null
          )
        }
      >
        <option value="">Select Video</option>
        {videos.map((v) => (
          <option key={v.id} value={v.id}>
            {v.video_title}
          </option>
        ))}
      </select>

      {/* Language selectors */}
      <div className="flex space-x-4">
        <select
          value={sourceLangKey}
          onChange={(e) => setSourceLangKey(e.target.value)}
          className="border p-2"
        >
          {LANG_KEYS.map((lang) => (
            <option key={lang} value={lang}>
              {lang}
            </option>
          ))}
        </select>
        <select
          value={targetLangKey}
          onChange={(e) => setTargetLangKey(e.target.value)}
          className="border p-2"
        >
          {LANG_KEYS.map((lang) => (
            <option key={lang} value={lang}>
              {lang}
            </option>
          ))}
        </select>
      </div>

      {/* YouTube embed */}
      {videoId && (
        <iframe
          className="w-full h-64"
          src={`https://www.youtube.com/embed/${videoId}`}
          title="YouTube player"
          allowFullScreen
        />
      )}

      {/* Load button */}
      <button
        onClick={handleLoadVTT}
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Load VTT
      </button>

      {/* Grid for subtitles */}
      {/*<div className="grid grid-cols-2 gap-4">
        {segments.map((seg, idx) => (
          <React.Fragment key={idx}>
            <textarea
              readOnly
              value={seg.text}
              className="w-full border p-2 bg-gray-100"
            />
            <textarea
              value={translatedSegments[idx]}
              onChange={(e) => {
                const copy = [...translatedSegments];
                copy[idx] = e.target.value;
                setTranslatedSegments(copy);
              }}
              className="w-full border p-2"
              placeholder="Type translation..."
            />
          </React.Fragment>
        ))}
      </div>*/}
      <table className="table-auto w-full border-collapse border border-gray-400">
        <thead className="bg-gray-200">
          <tr>
            <th className="border p-2">#</th>
            <th className="border p-2">Start</th>
            <th className="border p-2">End</th>
            <th className="border p-2">Original</th>
            <th className="border p-2">Translation</th>
          </tr>
        </thead>
        <tbody>
          {segments.map((seg, idx) => (
            <tr key={idx}>
              <td className="border p-2 text-center">{idx + 1}</td>
              <td className="border p-2">{seg.start}</td>
              <td className="border p-2">{seg.end}</td>
              <td className="border p-2 bg-gray-100">{seg.text}</td>
              <td className="border p-2">
                <textarea
                  value={translatedSegments[idx]}
                  onChange={(e) => {
                    const copy = [...translatedSegments];
                    copy[idx] = e.target.value;
                    setTranslatedSegments(copy);
                  }}
                  className="w-full border p-1"
                  placeholder="Type translation..."
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Save and Export */}
      <div className="flex space-x-4">
        <button
          onClick={handleSave}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Save Now
        </button>
        <button
          onClick={handleExport}
          className="bg-purple-500 text-white px-4 py-2 rounded"
        >
          Export .vtt
        </button>
      </div>
    </div>
  );
};

export default Translate;
// import React, { useState, useEffect } from "react";
// import axios from "axios";

// // Types
// type Channel = {
//   id: number;
//   channel_name: string;
// };

// type Video = {
//   id: number;
//   video_title: string;
//   youtube_link: string;
// };

// type SubtitleSegment = {
//   start: string;
//   end: string;
//   text: string;
// };
// const LANG_KEYS = [
//   { label: "English", key: "act_en", dataKey: "en", langId: "english" },
//   { label: "Hindi", key: "act_hi", dataKey: "hi", langId: "hindi" },
//   { label: "Telugu", key: "act_te", dataKey: "te", langId: "telugu" },
//   { label: "Marathi", key: "act_mr", dataKey: "mr", langId: "marathi" },
//   { label: "Gujarati", key: "act_gu", dataKey: "gu", langId: "gujarati" },
//   { label: "Bengali", key: "act_bn", dataKey: "bn", langId: "bengali" },
// ];
// const languages = [
//   { code: "en", label: "English" },
//   { code: "hi", label: "Hindi" },
//   { code: "mr", label: "Marathi" },
//   { code: "gu", label: "Gujarati" },
//   { code: "te", label: "Telugu" },
//   { code: "bn", label: "Bengali" },
// ];

// const Translate: React.FC = () => {
//   const [channels, setChannels] = useState<Channel[]>([]);
//   const [videos, setVideos] = useState<Video[]>([]);
//   const [selectedChannel, setSelectedChannel] = useState<number | null>(null);
//   const [selectedVideo, setSelectedVideo] = useState<number | null>(null);
//   const [sourceLangKey, setSourceLangKey] = useState("act_hi");
//   const [targetLangKey, setTargetLangKey] = useState("act_en");
//   const [selectedLink, setSelectedLink] = useState<string | null>(null);
//   const [language, setLanguage] = useState<string>("hi");
//   const [segments, setSegments] = useState<SubtitleSegment[]>([]);
//   const [translatedSegments, setTranslatedSegments] = useState<string[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [saving, setSaving] = useState(false);

//   // Fetch channels
//   useEffect(() => {
//     setLoading(true);
//     axios
//       .get("http://localhost:5000/api/channels")
//       .then((res) => setChannels(res.data))
//       .catch(() => setError("Failed to fetch channels."))
//       .finally(() => setLoading(false));
//   }, []);
//   // Clear segments when video selection changes
//   useEffect(() => {
//     setSegments([]);
//     setTranslatedSegments([]);
//     setSelectedLink(null);
//     setError(null);
//   }, [selectedVideo]);

//   // Fetch videos for selected channel
//   useEffect(() => {
//     if (!selectedChannel) {
//       setVideos([]);
//       return;
//     }
//     setLoading(true);
//     axios
//       .get(`http://localhost:5000/api/videos/${selectedChannel}`)
//       .then((res) => setVideos(Array.isArray(res.data) ? res.data : []))
//       .catch(() => setError("Failed to fetch videos."))
//       .finally(() => setLoading(false));
//   }, [selectedChannel]);

//   // Load original VTT when video selected
//   // useEffect(() => {
//   //   if (!selectedVideo) return;
//   //   setLoading(true);
//   //   axios
//   //     .get(`http://localhost:5000/api/vtt/${selectedVideo}`)
//   //     .then((res) => {
//   //       setSelectedLink(res.data.link);
//   //       const parsedSegments = parseVTT(res.data.content);
//   //       setSegments(parsedSegments);
//   //       setTranslatedSegments(parsedSegments.map(() => "")); // Empty translation initially
//   //     })
//   //     .catch(() => setError("Failed to load subtitles."))
//   //     .finally(() => setLoading(false));
//   // }, [selectedVideo]);

//   // const handleLoadVTT = () => {
//   //   if (!selectedVideo) return;
//   //   setLoading(true);
//   //   setError(null);
//   //   setSegments([]);
//   //   setTranslatedSegments([]);

//   //   axios
//   //     .get(`http://localhost:5000/api/vtt/${selectedVideo}`)
//   //     .then((res) => {
//   //       setSelectedLink(res.data.link);
//   //       const parsedSegments = parseVTT(res.data.content);
//   //       setSegments(parsedSegments);
//   //       setTranslatedSegments(parsedSegments.map(() => ""));
//   //     })
//   //     .catch(() => setError("Failed to load subtitles."))
//   //     .finally(() => setLoading(false));
//   // };
//   const handleLoadVTT = () => {
//     if (!selectedChannel || !selectedVideo) return;
//     setLoading(true);
//     setError(null);
//     setSegments([]);
//     setTranslatedSegments([]);

//     // Find the channel_name for the selectedChannel id
//     const channel = channels.find((c) => c.id === selectedChannel);
//     if (!channel) {
//       setError("Channel not found");
//       setLoading(false);
//       return;
//     }

//     axios
//       .get(
//         `http://localhost:5000/api/vtt?channel=${encodeURIComponent(
//           channel.channel_name
//         )}&video=${encodeURIComponent(
//           videos.find((v) => v.id === selectedVideo)?.video_title || ""
//         )}`
//       )
//       .then((res) => {
//         setSelectedLink(res.data.link);
//         const parsedSegments = parseVTT(res.data.content);
//         setSegments(parsedSegments);
//         setTranslatedSegments(parsedSegments.map(() => ""));
//       })
//       .catch(() => setError("Failed to load subtitles."))
//       .finally(() => setLoading(false));
//   };

//   // Auto-save every 30s
//   useEffect(() => {
//     if (!selectedVideo) return;
//     const interval = setInterval(() => {
//       if (translatedSegments.some((t) => t.trim() !== "")) {
//         saveTranslation(true);
//       }
//     }, 30000);
//     return () => clearInterval(interval);
//   }, [translatedSegments, selectedVideo]);

//   const handleSegmentChange = (index: number, value: string) => {
//     const updated = [...translatedSegments];
//     updated[index] = value;
//     setTranslatedSegments(updated);
//   };

//   const saveTranslation = async (silent = false) => {
//     if (!selectedVideo) return;
//     setSaving(true);
//     try {
//       await axios.post(
//         `http://localhost:5000/api/vtt/${selectedVideo}/translate`,
//         {
//           language,
//           content: buildVTT(segments, translatedSegments),
//           userId: 1, // Replace with logged-in user ID
//           status: "draft",
//         }
//       );
//       if (!silent) alert("Translation saved!");
//     } catch (err) {
//       if (!silent) alert("Failed to save translation.");
//     } finally {
//       setSaving(false);
//     }
//   };

//   const exportTranslation = () => {
//     const blob = new Blob([buildVTT(segments, translatedSegments)], {
//       type: "text/vtt",
//     });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = `video_${selectedVideo}_${language}.vtt`;
//     a.click();
//     URL.revokeObjectURL(url);
//   };

//   return (
//     <div className="p-6">
//       <h1 className="text-2xl font-bold mb-6">Translate Subtitles</h1>
//       {loading && <p className="text-blue-500">Loading...</p>}
//       {error && <p className="text-red-500">{error}</p>}
//       <div className="flex gap-4 mb-4">
//         {/* Language Selectors */}
//         <div>
//           <label className="block font-medium">Source Language</label>
//           <select
//             className="p-2 border rounded"
//             value={sourceLangKey}
//             onChange={(e) => {
//               const newSource = e.target.value;
//               setSourceLangKey(newSource);
//               if (newSource === targetLangKey) {
//                 const fallback = LANG_KEYS.find((k) => k.key !== newSource);
//                 setTargetLangKey(fallback?.key || "act_hi");
//               }
//             }}
//           >
//             {LANG_KEYS.map((lang) => (
//               <option key={lang.key} value={lang.key}>
//                 {lang.label}
//               </option>
//             ))}
//           </select>
//         </div>
//         {/* target language  */}
//         <div>
//           <label className="block font-medium">Target Language</label>
//           <select
//             className="p-2 border rounded"
//             value={targetLangKey}
//             onChange={(e) => setTargetLangKey(e.target.value)}
//           >
//             {LANG_KEYS.filter((lang) => lang.key !== sourceLangKey).map(
//               (lang) => (
//                 <option key={lang.key} value={lang.key}>
//                   {lang.label}
//                 </option>
//               )
//             )}
//           </select>
//         </div>
//         {/* Channel / Video / Language Selection */}
//         <div>
//           {" "}
//           <label className="block font-medium">Channel</label>
//           <select
//             className="p-2 border rounded"
//             value={selectedChannel || ""}
//             onChange={(e) => setSelectedChannel(Number(e.target.value))}
//           >
//             <option value="">Select Channel</option>
//             {channels.map((c) => (
//               <option key={c.id} value={c.id}>
//                 {c.channel_name}
//               </option>
//             ))}
//           </select>
//         </div>

//         {/* select video */}
//         <div>
//           <label className="block font-medium">Video</label>
//           <select
//             className="p-2 w-40 border rounded "
//             value={selectedVideo || ""}
//             onChange={(e) => setSelectedVideo(Number(e.target.value))}
//           >
//             <option value="">Select Video</option>
//             {videos.map((v) => (
//               <option key={v.id} value={v.id}>
//                 {v.video_title}
//               </option>
//             ))}
//           </select>
//         </div>

//         {/* load button */}

//         <button
//           className="mt-7 h-10 text-white bg-blue-700 hover:bg-blue-800 rounded px-5"
//           onClick={handleLoadVTT}
//           disabled={!selectedChannel || !selectedVideo || loading}
//         >
//           {loading ? "Loading..." : "Load VTT"}
//         </button>

//         {/* <button
//           className="bg-blue-500 text-white px-4 py-2 rounded"
//           onClick={() => selectedVideo && console.log("Reloading VTT...")}
//         >
//           Load VTT
//         </button> */}
//       </div>

//       {selectedLink && (
//         <div className="mb-6">
//           <h3 className="font-semibold mb-2">Related Video</h3>
//           <iframe
//             className="w-full h-64 rounded"
//             src={`https://www.youtube.com/embed/${extractYouTubeId(
//               selectedLink
//             )}?rel=0`}
//             allowFullScreen
//             title="Related Video"
//           />
//         </div>
//       )}

//       {/* Segment-based VTT Editor */}
//       {/* <div className="space-y-2">
//         {segments.map((seg, index) => (
//           <div key={index} className="grid grid-cols-3 gap-2 items-center">
//             <span className="text-sm text-gray-500">
//               {seg.start} → {seg.end}
//             </span>
//             <textarea
//               className="col-span-1 border p-1 rounded bg-gray-100 text-xs"
//               value={seg.text}
//               readOnly
//             />
//             <textarea
//               className="col-span-1 border p-1 rounded text-xs"
//               value={translatedSegments[index]}
//               onChange={(e) => handleSegmentChange(index, e.target.value)}
//             />
//           </div>
//         ))}
//       </div> */}
//       {/* Show editor only when segments are loaded */}
//       {segments.length > 0 && (
//         <>
//           {/* Segment-based VTT Editor */}
//           <div className="space-y-2">
//             {segments.map((seg, index) => (
//               <div key={index} className="grid grid-cols-3 gap-2 items-center">
//                 <span className="text-sm text-gray-500">
//                   {seg.start} → {seg.end}
//                 </span>
//                 <textarea
//                   className="col-span-1 border p-1 rounded bg-gray-100 text-xs"
//                   value={seg.text}
//                   readOnly
//                 />
//                 <textarea
//                   className="col-span-1 border p-1 rounded text-xs"
//                   value={translatedSegments[index]}
//                   onChange={(e) => handleSegmentChange(index, e.target.value)}
//                 />
//               </div>
//             ))}
//           </div>

//           <div className="flex gap-4 mt-6">
//             <button
//               className="bg-green-500 text-white px-6 py-2 rounded disabled:opacity-50"
//               onClick={() => saveTranslation(false)}
//               disabled={saving}
//             >
//               {saving ? "Saving..." : "Save"}
//             </button>
//             <button
//               className="bg-gray-500 text-white px-6 py-2 rounded"
//               onClick={exportTranslation}
//             >
//               Export
//             </button>
//           </div>
//         </>
//       )}

//       {/* <div className="flex gap-4 mt-6">
//         <button
//           className="bg-green-500 text-white px-6 py-2 rounded disabled:opacity-50"
//           onClick={() => saveTranslation(false)}
//           disabled={saving}
//         >
//           {saving ? "Saving..." : "Save"}
//         </button>
//         <button
//           className="bg-gray-500 text-white px-6 py-2 rounded"
//           onClick={exportTranslation}
//         >
//           Export
//         </button>
//       </div> */}
//     </div>
//   );
// };

// function extractYouTubeId(url: string) {
//   const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
//   const match = url.match(regExp);
//   return match && match[2].length === 11 ? match[2] : "";
// }

// // Parse VTT into segments
// function parseVTT(vtt: string): SubtitleSegment[] {
//   const lines = vtt.split("\n");
//   const segments: SubtitleSegment[] = [];
//   let current: Partial<SubtitleSegment> = {};
//   for (const line of lines) {
//     if (line.includes("-->")) {
//       const [start, end] = line.split(" --> ");
//       current = { start, end, text: "" };
//     } else if (line.trim() === "") {
//       if (current.start && current.end)
//         segments.push(current as SubtitleSegment);
//       current = {};
//     } else {
//       current.text = (current.text || "") + line + " ";
//     }
//   }
//   return segments;
// }

// // Build VTT back from segments
// function buildVTT(segments: SubtitleSegment[], translations: string[]): string {
//   return (
//     "WEBVTT\n\n" +
//     segments
//       .map((s, i) => `${s.start} --> ${s.end}\n${translations[i] || ""}\n`)
//       .join("\n")
//   );
// }

// export default Translate;

// import React, { useState, useEffect } from "react";
// import axios from "axios";

// type Channel = {
//   id: number;
//   channel_name: string;
// };

// type Video = {
//   id: number;
//   video_title: string;
//   youtube_link: string;
// };

// const languages = [
//   { code: "en", label: "English" },
//   { code: "hi", label: "Hindi" },
//   { code: "mr", label: "Marathi" },
//   { code: "gu", label: "Gujarati" },
//   { code: "te", label: "Telugu" },
//   { code: "bn", label: "Bengali" },
// ];

// const Translate: React.FC = () => {
//   const [channels, setChannels] = useState<Channel[]>([]);
//   const [videos, setVideos] = useState<Video[]>([]);
//   const [selectedChannel, setSelectedChannel] = useState<number | null>(null);
//   const [selectedVideo, setSelectedVideo] = useState<number | null>(null);
//   const [selectedLink, setSelectedLink] = useState<string | null>(null);
//   const [language, setLanguage] = useState<string>("hi");
//   const [originalVtt, setOriginalVtt] = useState<string>("");
//   const [translatedVtt, setTranslatedVtt] = useState<string>("");

//   // Fetch channels
//   useEffect(() => {
//     axios
//       .get("http://localhost:5000/api/channels")
//       // .get("https://api.ayushcms.info/api/channels")
//       .then((res) => {
//         console.log("Channels API response:", res.data);
//         setChannels(res.data); // maybe you need res.data.channels
//       })
//       .catch((err) => console.error(err));
//   }, []);

//   // Fetch videos for selected channel
//   useEffect(() => {
//     if (!selectedChannel) {
//       setVideos([]);
//       return;
//     }

//     axios
//       .get(`http://localhost:5000/api/videos/${selectedChannel}`)
//       // .get(`https://api.ayushcms.info/api/videos/${selectedChannel}`)
//       .then((res) => {
//         console.log("Videos API response:", res.data);
//         setVideos(Array.isArray(res.data) ? res.data : []);
//       })
//       .catch((err) => console.error("Error fetching videos:", err));
//   }, [selectedChannel]);

//   // Load original VTT when video selected
//   useEffect(() => {
//     if (selectedVideo) {
//       axios
//         .get(`http://localhost:5000/api/vtt/${selectedVideo}`)
//         // .get(`https://api.ayushcms.info/api/vtt/${selectedVideo}`)
//         .then((res) => {
//           setOriginalVtt(res.data.content);
//           setSelectedLink(res.data.link);
//         });
//     }
//   }, [selectedVideo]);

//   const saveTranslation = async () => {
//     if (!selectedVideo) return;
//     await axios.post(
//       `http://localhost:5000/api/vtt/${selectedVideo}/translate`,
//       // `https://api.ayushcms.info/api/vtt/${selectedVideo}/translate`,
//       {
//         language,
//         content: translatedVtt,
//       }
//     );
//     alert("Translation saved!");
//   };

//   const exportTranslation = () => {
//     const blob = new Blob([translatedVtt], { type: "text/vtt" });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = `video_${selectedVideo}_${language}.vtt`;
//     a.click();
//     URL.revokeObjectURL(url);
//   };

//   return (
//     <div className="p-6">
//       <h1 className="text-2xl font-bold mb-6">Translate Subtitles</h1>

//       {/* Select channel */}
//       <div className="grid grid-cols-4 gap-4 mb-6">
//         <select
//           className="p-2 border rounded"
//           value={selectedChannel || ""}
//           onChange={(e) => setSelectedChannel(Number(e.target.value))}
//         >
//           <option value="">Select Channel</option>
//           {Array.isArray(channels) &&
//             channels.map((c) => (
//               <option key={c.id} value={c.id}>
//                 {c.channel_name}
//               </option>
//             ))}
//         </select>

//         {/* Select video */}
//         <select
//           className="p-2 border rounded"
//           value={selectedVideo || ""}
//           onChange={(e) => setSelectedVideo(Number(e.target.value))}
//         >
//           <option value="">Select Video</option>
//           {Array.isArray(videos) &&
//             videos.map((v) => (
//               <option key={v.id} value={v.id}>
//                 {v.video_title}
//               </option>
//             ))}
//         </select>

//         {/* Select language */}
//         <select
//           className="p-2 border rounded"
//           value={language}
//           onChange={(e) => setLanguage(e.target.value)}
//         >
//           {languages.map((l) => (
//             <option key={l.code} value={l.code}>
//               {l.label}
//             </option>
//           ))}
//         </select>

//         {/* Load button */}
//         <button
//           className="bg-blue-500 text-white px-4 py-2 rounded"
//           onClick={() => {
//             selectedVideo && console.log("Loading VTT...");
//           }}
//         >
//           Load VTT
//         </button>
//       </div>

//       {/* YouTube embed */}
//       {selectedLink && (
//         <div className="mb-6">
//           <h3 className="font-semibold mb-2">Related Video</h3>
//           <iframe
//             className="w-full h-64 rounded"
//             src={`https://www.youtube.com/embed/${extractYouTubeId(
//               selectedLink
//             )}?rel=0`}
//             allowFullScreen
//             title="Related Video"
//           />
//         </div>
//       )}

//       {/* VTT editor */}
//       <div className="grid grid-cols-2 gap-4">
//         <textarea
//           className="w-full h-80 border p-2 rounded"
//           value={originalVtt}
//           readOnly
//         />
//         <textarea
//           className="w-full h-80 border p-2 rounded"
//           value={translatedVtt}
//           onChange={(e) => setTranslatedVtt(e.target.value)}
//         />
//       </div>

//       {/* Buttons */}
//       <div className="flex gap-4 mt-6">
//         <button
//           className="bg-green-500 text-white px-6 py-2 rounded"
//           onClick={saveTranslation}
//         >
//           Save
//         </button>
//         <button
//           className="bg-gray-500 text-white px-6 py-2 rounded"
//           onClick={exportTranslation}
//         >
//           Export
//         </button>
//       </div>
//     </div>
//   );
// };

// // Helper to extract YouTube ID
// function extractYouTubeId(url: string) {
//   const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
//   const match = url.match(regExp);
//   return match && match[2].length === 11 ? match[2] : "";
// }

// export default Translate;

// import React, { useEffect, useState } from "react";
// import { useAuth } from "@/contexts/AuthContext";

// interface Channel {
//   id: number;
//   channel_name: string;
//   description: string;
// }

// interface Video {
//   id: number;
//   channel_id: number;
//   video_title: string;
//   youtube_link: string;
//   vtt_file_path: string;
//   has_vtt: boolean;
// }

// interface SubtitleSegment {
//   id?: number;
//   segment_index: number;
//   start_time: string;
//   end_time: string;
//   original_text: string;
//   translated_text: string;
// }

// interface TranslationProject {
//   id: number;
//   video_id: number;
//   target_language: string;
//   status: string;
// }

// export default function Translate() {
//   const { user } = useAuth();
//   const [channels, setChannels] = useState<Channel[]>([]);
//   const [videos, setVideos] = useState<Video[]>([]);
//   const [selectedChannel, setSelectedChannel] = useState<number | null>(null);
//   const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
//   const [currentProject, setCurrentProject] =
//     useState<TranslationProject | null>(null);
//   const [segments, setSegments] = useState<SubtitleSegment[]>([]);
//   const [targetLanguage, setTargetLanguage] = useState("hi");
//   const [loading, setLoading] = useState(false);
//   const [showExportMenu, setShowExportMenu] = useState(false);

//   // API helper
//   // In your apiCall function, update the base URL:
//   const apiCall = async (url: string, options: RequestInit = {}) => {
//     const token = localStorage.getItem("token");
//     const response = await fetch(
//       `http://localhost:5000/api/subtitles${url}`,

//       {
//         // ← localhost:5000
//         ...options,
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//           ...options.headers,
//         },
//       }
//     );

//     if (!response.ok) {
//       throw new Error(`API call failed: ${response.statusText}`);
//     }

//     return response.json();
//   };

//   // Load channels on mount
//   useEffect(() => {
//     loadChannels();
//   }, []);

//   const loadChannels = async () => {
//     try {
//       setLoading(true);
//       const data = await apiCall("/channels");
//       setChannels(data);
//     } catch (error) {
//       console.error("Error loading channels:", error);
//       alert("Failed to load channels");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Load videos when channel changes
//   const handleChannelSelect = async (channelId: number) => {
//     try {
//       setLoading(true);
//       setSelectedChannel(channelId);
//       setSelectedVideo(null);
//       setCurrentProject(null);
//       setSegments([]);

//       const data = await apiCall(`/channels/${channelId}/videos`);
//       setVideos(data);
//     } catch (error) {
//       console.error("Error loading videos:", error);
//       alert("Failed to load videos");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Create/get project and load VTT
//   const handleVideoSelect = async (video: Video) => {
//     try {
//       setLoading(true);
//       setSelectedVideo(video);

//       // Create or get project
//       const projectData = await apiCall("/projects", {
//         method: "POST",
//         body: JSON.stringify({
//           video_id: video.id,
//           target_language: targetLanguage,
//         }),
//       });

//       setCurrentProject(projectData);

//       // Load VTT and segments
//       const vttData = await apiCall(`/projects/${projectData.id}/load-vtt`);
//       setSegments(vttData.segments || []);

//       if (vttData.segments.length === 0) {
//         alert(
//           "No VTT file found for this video. You can manually add segments."
//         );
//       }
//     } catch (error) {
//       console.error("Error loading video:", error);
//       alert("Failed to load video");
//     } finally {
//       setLoading(false);
//     }
//   };
//   const loadVTTManually = async () => {
//     if (!currentProject) return;
//     try {
//       setLoading(true);
//       const vttData = await apiCall(`/projects/${currentProject.id}/load-vtt`);
//       setSegments(vttData.segments || []);
//       alert(`Loaded ${vttData.segments.length} segments from VTT`);
//     } catch (error) {
//       console.error("Error loading VTT manually:", error);
//       alert("Failed to load VTT");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Update segment
//   const updateSegment = (
//     index: number,
//     field: keyof SubtitleSegment,
//     value: string
//   ) => {
//     const updated = [...segments];
//     updated[index] = { ...updated[index], [field]: value };
//     setSegments(updated);
//   };

//   // Add new segment
//   const addSegment = () => {
//     const newSegment: SubtitleSegment = {
//       segment_index: segments.length,
//       start_time: "00:00:00.000",
//       end_time: "00:00:05.000",
//       original_text: "",
//       translated_text: "",
//     };
//     setSegments([...segments, newSegment]);
//   };

//   // Delete segment
//   const deleteSegment = (index: number) => {
//     const updated = segments.filter((_, i) => i !== index);
//     updated.forEach((seg, i) => {
//       seg.segment_index = i;
//     });
//     setSegments(updated);
//   };

//   // Save to database
//   const handleSave = async () => {
//     if (!currentProject) return;

//     try {
//       setLoading(true);
//       await apiCall(`/projects/${currentProject.id}/segments`, {
//         method: "POST",
//         body: JSON.stringify({ segments }),
//       });
//       alert("Translation saved successfully!");
//     } catch (error) {
//       console.error("Error saving:", error);
//       alert("Failed to save translation");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Export functions
//   const exportToVTT = () => {
//     if (!selectedVideo || segments.length === 0) return;

//     let vttContent = "WEBVTT\n\n";
//     segments.forEach((seg, index) => {
//       vttContent += `${index + 1}\n`;
//       vttContent += `${seg.start_time} --> ${seg.end_time}\n`;
//       vttContent += `${seg.translated_text || seg.original_text}\n\n`;
//     });

//     const blob = new Blob([vttContent], { type: "text/vtt" });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = `${selectedVideo.video_title.replace(
//       /[^a-zA-Z0-9]/g,
//       "_"
//     )}_${targetLanguage}.vtt`;
//     a.click();
//     URL.revokeObjectURL(url);
//   };

//   const exportToSRT = () => {
//     if (!selectedVideo || segments.length === 0) return;

//     let srtContent = "";
//     segments.forEach((seg, index) => {
//       const startTime = seg.start_time.replace(".", ",");
//       const endTime = seg.end_time.replace(".", ",");

//       srtContent += `${index + 1}\n`;
//       srtContent += `${startTime} --> ${endTime}\n`;
//       srtContent += `${seg.translated_text || seg.original_text}\n\n`;
//     });

//     const blob = new Blob([srtContent], { type: "text/srt" });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = `${selectedVideo.video_title.replace(
//       /[^a-zA-Z0-9]/g,
//       "_"
//     )}_${targetLanguage}.srt`;
//     a.click();
//     URL.revokeObjectURL(url);
//   };

//   // Scroll sync effect
//   useEffect(() => {
//     const original = document.getElementById("originalBox");
//     const translate = document.getElementById("translateBox");

//     if (!original || !translate) return;

//     let isSyncing = false;
//     const syncScroll = (source: HTMLElement, target: HTMLElement) => {
//       if (isSyncing) return;
//       isSyncing = true;
//       const percent =
//         source.scrollTop / (source.scrollHeight - source.clientHeight);
//       target.scrollTop = percent * (target.scrollHeight - target.clientHeight);
//       setTimeout(() => (isSyncing = false), 10);
//     };

//     const onOriginal = () => syncScroll(original, translate);
//     const onTranslate = () => syncScroll(translate, original);

//     original.addEventListener("scroll", onOriginal);
//     translate.addEventListener("scroll", onTranslate);

//     return () => {
//       original.removeEventListener("scroll", onOriginal);
//       translate.removeEventListener("scroll", onTranslate);
//     };
//   }, [segments]);

//   return (
//     <div className="p-6 space-y-6">
//       <h1 className="text-2xl font-semibold">Translation Editor</h1>

//       {/* Selection Controls */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//         <div>
//           <label className="block text-sm font-medium mb-1">Channel</label>
//           <select
//             className="w-full p-2 border rounded"
//             onChange={(e) =>
//               e.target.value
//                 ? handleChannelSelect(Number(e.target.value))
//                 : null
//             }
//             value={selectedChannel || ""}
//           >
//             <option value="">-- Select Channel --</option>
//             {channels.map((channel) => (
//               <option key={channel.id} value={channel.id}>
//                 {channel.channel_name}
//               </option>
//             ))}
//           </select>
//         </div>

//         <div>
//           <label className="block text-sm font-medium mb-1">Video</label>
//           <select
//             className="w-full p-2 border rounded"
//             onChange={(e) => {
//               const video = videos.find((v) => v.id === Number(e.target.value));
//               if (video) handleVideoSelect(video);
//             }}
//             value={selectedVideo?.id || ""}
//             disabled={!selectedChannel}
//           >
//             <option value="">-- Select Video --</option>
//             {videos.map((video) => (
//               <option key={video.id} value={video.id}>
//                 {video.video_title} {video.has_vtt ? "📄" : ""}
//               </option>
//             ))}
//           </select>
//         </div>

//         <div>
//           <label className="block text-sm font-medium mb-1">
//             Target Language
//           </label>
//           <select
//             className="w-full p-2 border rounded"
//             value={targetLanguage}
//             onChange={(e) => setTargetLanguage(e.target.value)}
//           >
//             <option value="hi">Hindi</option>
//             <option value="gu">Gujarati</option>
//             <option value="mr">Marathi</option>
//             <option value="bn">Bengali</option>
//             <option value="te">Telugu</option>
//           </select>
//         </div>

//         <div className="flex items-end">
//           <button
//             onClick={addSegment}
//             disabled={!selectedVideo}
//             className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
//           >
//             Add Segment
//           </button>
//           <button
//             onClick={loadVTTManually}
//             disabled={!currentProject}
//             className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
//           >
//             Load VTT
//           </button>
//         </div>
//       </div>

//       {/* YouTube Embed */}
//       {selectedVideo && (
//         <iframe
//           className="w-full h-64 rounded"
//           src={`https://www.youtube.com/embed/${
//             selectedVideo.youtube_link.split("v=")[1]?.split("&")[0]
//           }`}
//           allowFullScreen
//         />
//       )}

//       {/* Translation Editor */}
//       {selectedVideo && (
//         <div className="grid grid-cols-2 gap-4">
//           {/* Original */}
//           <div
//             id="originalBox"
//             className="overflow-y-auto h-[500px] border rounded p-4 bg-white"
//           >
//             <h2 className="font-semibold mb-4 text-lg">Original (From VTT)</h2>
//             {segments.map((seg, i) => (
//               <div key={i} className="mb-4 p-3 border rounded">
//                 <div className="flex justify-between items-center mb-2">
//                   <div className="text-sm font-mono text-gray-500">
//                     {seg.start_time} → {seg.end_time}
//                   </div>
//                   <button
//                     onClick={() => deleteSegment(i)}
//                     className="text-red-600 hover:text-red-800 text-sm"
//                   >
//                     Delete
//                   </button>
//                 </div>
//                 <div className="space-y-2">
//                   <div className="flex gap-2">
//                     <input
//                       type="text"
//                       placeholder="Start time"
//                       className="w-24 p-1 border rounded text-xs"
//                       value={seg.start_time}
//                       onChange={(e) =>
//                         updateSegment(i, "start_time", e.target.value)
//                       }
//                     />
//                     <input
//                       type="text"
//                       placeholder="End time"
//                       className="w-24 p-1 border rounded text-xs"
//                       value={seg.end_time}
//                       onChange={(e) =>
//                         updateSegment(i, "end_time", e.target.value)
//                       }
//                     />
//                   </div>
//                   <textarea
//                     rows={2}
//                     className="w-full p-2 border rounded resize-none bg-gray-50"
//                     placeholder="Original text (from VTT)..."
//                     value={seg.original_text}
//                     onChange={(e) =>
//                       updateSegment(i, "original_text", e.target.value)
//                     }
//                   />
//                 </div>
//               </div>
//             ))}
//           </div>

//           {/* Translation */}
//           <div
//             id="translateBox"
//             className="overflow-y-auto h-[500px] border rounded p-4 bg-white"
//           >
//             <h2 className="font-semibold mb-4 text-lg">
//               Translation ({targetLanguage.toUpperCase()})
//             </h2>
//             {segments.map((seg, i) => (
//               <div key={i} className="mb-4 p-3 border rounded">
//                 <div className="text-sm font-mono text-gray-500 mb-2">
//                   {seg.start_time} → {seg.end_time}
//                 </div>
//                 <textarea
//                   rows={3}
//                   className="w-full p-2 border rounded resize-none"
//                   placeholder={`Translation in ${targetLanguage.toUpperCase()}...`}
//                   value={seg.translated_text}
//                   onChange={(e) =>
//                     updateSegment(i, "translated_text", e.target.value)
//                   }
//                 />
//               </div>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* Action Buttons */}
//       {selectedVideo && (
//         <div className="flex gap-4">
//           <button
//             onClick={handleSave}
//             disabled={loading}
//             className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
//           >
//             {loading ? "Saving..." : "Save to Database"}
//           </button>

//           {/* Export Options */}
//           <div className="relative">
//             <button
//               onClick={() => setShowExportMenu(!showExportMenu)}
//               className="border border-blue-600 text-blue-600 px-6 py-2 rounded hover:bg-blue-50"
//             >
//               Export ▼
//             </button>

//             {showExportMenu && (
//               <div className="absolute top-full left-0 mt-1 bg-white border rounded shadow-lg z-10">
//                 <button
//                   onClick={() => {
//                     exportToVTT();
//                     setShowExportMenu(false);
//                   }}
//                   className="block w-full text-left px-4 py-2 hover:bg-gray-100"
//                 >
//                   Export as VTT
//                 </button>
//                 <button
//                   onClick={() => {
//                     exportToSRT();
//                     setShowExportMenu(false);
//                   }}
//                   className="block w-full text-left px-4 py-2 hover:bg-gray-100"
//                 >
//                   Export as SRT
//                 </button>
//               </div>
//             )}
//           </div>

//           <button
//             onClick={() => {
//               setSelectedVideo(null);
//               setCurrentProject(null);
//               setSegments([]);
//             }}
//             className="border border-gray-300 px-6 py-2 rounded hover:bg-gray-50"
//           >
//             Close
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }
