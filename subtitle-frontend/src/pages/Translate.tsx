import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { parseVTT, generateVTT } from "../utils/vttUtils";
import axios from "axios";

export default function Translate() {
  const [videoData, setVideoData] = useState<{ name: string; "Youtube Link": string }[]>([]);
  const [selectedTitle, setSelectedTitle] = useState("");
  const [selectedLink, setSelectedLink] = useState("");
  const [segments, setSegments] = useState<{ time: string; text: string }[]>([]);
  const [translations, setTranslations] = useState<string[]>([]);



const targetLanguage = "hi"; // Change to "es", "fr", "gu", "mr", etc. as needed

// LibreTranslate API (hosted instance or self-host)
const LIBRE_TRANSLATE_URL = "https://libretranslate.de/translate"; // or self-hosted endpoint

const translateText = async (text: string, targetLang: string) => {
  try {
    const response = await axios.post("/api/translate", {
      q: text,
      target: targetLang,
    });

    return response.data.translatedText;
  } catch (err) {
    console.error("Translation error:", err);
    return `[${targetLang}] ${text}`;
  }
};


   // scroll sync
useEffect(() => {
  const original = document.getElementById("originalBox");
  const translate = document.getElementById("translateBox");

  if (!original || !translate) return;

  let isSyncing = false;

  const syncScroll = (source: HTMLElement, target: HTMLElement) => {
    if (isSyncing) return;
    isSyncing = true;
    const percent = source.scrollTop / (source.scrollHeight - source.clientHeight);
    target.scrollTop = percent * (target.scrollHeight - target.clientHeight);
    setTimeout(() => (isSyncing = false), 10);
  };

  const onOriginal = () => syncScroll(original, translate);
  const onTranslate = () => syncScroll(translate, original);

  original.addEventListener("scroll", onOriginal);
  translate.addEventListener("scroll", onTranslate);

  return () => {
    original.removeEventListener("scroll", onOriginal);
    translate.removeEventListener("scroll", onTranslate);
  };
}, [segments]);

  // Load Excel on mount
useEffect(() => {
  fetch("/data/channelname.xlsx")
    .then((res) => res.arrayBuffer())
    .then((data) => {
      const workbook = XLSX.read(data, { type: "buffer" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet) as any[];
      console.log("✅ Loaded Excel data:", json);
      setVideoData(json);
    })
    .catch((err) => {
      console.error("❌ Failed to load Excel:", err);
    });
}, []);

//   const handleVideoSelect = (title: string) => {
//     setSelectedTitle(title);
//     const link = videoData.find(v => v.title === title)?.link || "";
//     setSelectedLink(link);
//   };
//as per excel cols we are adjusting the code below 
const handleVideoSelect = (name: string) => {
  setSelectedTitle(name);
  const link = videoData.find((v) => v.name === name)?.["Youtube Link"] || "";
  setSelectedLink(link);
};

//   const handleLoadVTT = async () => {
//     const fileName = `/data/${selectedTitle}.vtt`;
//     const res = await fetch(fileName);
//     const text = await res.text();
//     const parsed = parseVTT(text);
//     setSegments(parsed);
//     setTranslations(parsed.map(s => s.text)); // initial fill
//   };
// const handleLoadVTT = async () => {
//   const fileName = `/data/${selectedTitle}.vtt`;
//   try {
//     const res = await fetch(fileName);
//     if (!res.ok) throw new Error("File not found");
//     const text = await res.text();
//     const parsed = parseVTT(text);
//     setSegments(parsed);
//     setTranslations(parsed.map((s) => s.text));
//   } catch (err) {
//     console.error("❌ Error loading VTT:", err);
//     alert("VTT file not found or invalid.");
//   }
// };

const handleLoadVTT = async () => {
  const fileName = `/data/${selectedTitle}.vtt`;
  try {
    const res = await fetch(fileName);
    if (!res.ok) throw new Error("File not found");

    const text = await res.text();
    if (!text.startsWith("WEBVTT")) {
      throw new Error("Invalid VTT file. Missing WEBVTT header.");
    }

    const parsed = parseVTT(text);
    setSegments(parsed);

    // ✅ Translate in parallel
    const translated = await Promise.all(
      parsed.map((seg) => translateText(seg.text, targetLanguage))
    );
    setTranslations(translated);
  } catch (err) {
    console.error("❌ Error loading VTT:", err);
    alert("VTT file not found or invalid.");
  }
};

  const handleTranslateChange = (i: number, value: string) => {
    const updated = [...translations];
    updated[i] = value;
    setTranslations(updated);
  };

const handleCancel = () => {
  setSelectedTitle("");
  setSelectedLink("");
  setSegments([]);
  setTranslations([]);
};

  const handleSaveVTT = async () => {
  try {
    const res = await fetch("/api/save-subtitles", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        videoTitle: selectedTitle,
        youtubeLink: selectedLink,
        originalSegments: segments,
        translatedSegments: translations,
        userId: 1,
      }),
    });

    if (!res.ok) throw new Error("Failed to save subtitles");

    const result = await res.json();
    alert("✅ Subtitles saved to database");
  } catch (error) {
    console.error("❌ Error saving subtitles:", error);
    alert("Failed to save subtitles");
  }
};

  return (
     <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Translation Editor</h1>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium">Select Video</label>
          <select
            className="w-full mt-1 p-2 border rounded"
            onChange={(e) => handleVideoSelect(e.target.value)}
          >
            <option value="">-- Select --</option>
            {videoData.map(v => (
              <option key={v.name} value={v.name}>
                {v.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end">
          <button
            onClick={handleLoadVTT}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Load VTT
          </button>
        </div>
      </div>

         <div className="grid grid-cols-2 gap-4 mt-6">
  {/* ORIGINAL */}
  <div
    id="originalBox"
    className="overflow-y-auto h-[500px] w-full border rounded p-4 bg-white scroll-smooth"
    >
    <h2 className="font-semibold mb-2 text-lg">Original</h2>
    {segments.map((seg, i) => (
      <div key={i} className="mb-4">
        <div className="text-sm font-mono text-gray-500">{seg.time}</div>
        <div className="text-black whitespace-pre-line">{seg.text}</div>
      </div>
    ))}
  </div>

  {/* TRANSLATE */}
  <div
    id="translateBox"
    className="overflow-y-auto h-[500px] w-full border rounded p-4 bg-white scroll-smooth"
  >
    <h2 className="font-semibold mb-2 text-lg">Translate</h2>
    {segments.map((seg, i) => (
      <div key={i} className="mb-4">
        <div className="text-sm font-mono text-gray-500">{seg.time}</div>
        <textarea
          rows={2}
          className="w-full p-2 border rounded text-black resize-none"
          value={translations[i] || ""}
          onChange={(e) => handleTranslateChange(i, e.target.value)}
        />
      </div>
    ))}
  </div>
</div>
      {/* YouTube Embed */}
      {selectedLink && (
        <iframe
          className="w-full h-64 rounded"
          src={`https://www.youtube.com/embed/${selectedLink.split("v=")[1]}`}
          allowFullScreen
        />
      )}

      {/* Translation Area */}
      {/* <div className="grid grid-cols-2 gap-4 mt-6">
        <div>
          <h2 className="font-semibold mb-2">Original</h2>
          {segments.map((seg, i) => (
            <div key={i} className="mb-4">
              <div className="text-sm text-gray-500">{seg.time}</div>
              <div className="p-2 bg-gray-100 rounded">{seg.text}</div>
            </div>
          ))}
        </div>
        <div>
          <h2 className="font-semibold mb-2">Translation</h2>
          {segments.map((seg, i) => (
            <div key={i} className="mb-4">
              <div className="text-sm text-gray-500">{seg.time}</div>
              <textarea
                className="w-full p-2 border rounded"
                value={translations[i] || ""}
                onChange={(e) => handleTranslateChange(i, e.target.value)}
              />
            </div>
          ))}
        </div>
      </div> */}

      {/* adding the scroll logic in translation and original  */}
  
      <div className="flex gap-4 mt-6">
        <button
          onClick={handleSaveVTT}
          className="bg-blue-600 text-white px-6 py-2 rounded"
        >
          Save
        </button>
        <button
          onClick={handleSaveVTT}
          className="border border-blue-600 text-blue-600 px-6 py-2 rounded"
        >
          Export
        </button>
         <button onClick={handleCancel} className="border border-red-600 text-red-600 px-6 py-2 rounded">
    Cancel
  </button>
      </div>
    </div>
  ); 

}
