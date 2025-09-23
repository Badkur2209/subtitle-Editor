import React, { useState, FormEvent, useEffect, ChangeEvent } from "react";
import * as XLSX from "xlsx";
import { parse, format } from "date-fns";

type Channel = { id: number; channel_name: string };
type VideoRow = { video_title: string; link: string };
const normalizeDate = (raw: string): string | null => {
  if (!raw) return null;
  let d = parse(raw, "yyyy-MM-dd", new Date());
  if (isNaN(d.getTime())) d = parse(raw, "d/M/yyyy", new Date());
  return isNaN(d.getTime()) ? null : format(d, "yyyy-MM-dd");
};
// Prediction row, matching your DB columns
// type PredictionRow = {
//   [key: string]: string | undefined;
//   type?: string;
//   fromdate?: string;
//   todate?: string;
//   subno?: string;
//   daycount?: string;
//   url?: string;
//   totalduration?: string;
//   starttime?: string;
//   endtime?: string;
//   lagna_rasi?: string;
//   lrname?: string;
//   sentiment?: string;
//   super_positive?: string;
//   positive?: string;
//   productive?: string;
//   lucky?: string;
//   average?: string;
//   below_average?: string;
//   negative?: string;
//   super_negative?: string;
//   pending_work?: string;
//   tiring_even?: string;
//   bhaag_daud?: string;
//   en_1?: string;
//   en_2?: string;
//   en_3?: string;
//   en_4?: string;
//   hi_1?: string;
//   hi_2?: string;
//   hi_3?: string;
//   hi_4?: string;
//   mr_1?: string;
//   mr_2?: string;
//   mr_3?: string;
//   mr_4?: string;
//   gu_1?: string;
//   gu_2?: string;
//   gu_3?: string;
//   gu_4?: string;
//   bn_1?: string;
//   bn_2?: string;
//   bn_3?: string;
//   bn_4?: string;
//   te_1?: string;
//   te_2?: string;
//   te_3?: string;
//   te_4?: string;
//   status?: string;
//   assigned_to?: string;
//   status_en?: string;
//   status_hi?: string;
//   status_mr?: string;
//   status_gu?: string;
//   status_te?: string;
//   status_bn?: string;
// };
/* lower-cased header list taken from models/predictionsData.js */
// const requiredHeaders = [
//   "type",
//   "fromdate",
//   "todate",
//   "subno",
//   "daycount",
//   "url",
//   "totalduration",
//   "starttime",
//   "endtime",
//   "lagna_rasi",
//   "lrname",
//   "sentiment",
//   "super_positive",
//   "positive",
//   "productive",
//   "lucky",
//   "average",
//   "below_average",
//   "negative",
//   "super_negative",
//   "pending_work",
//   "tiring_even",
//   "bhaag_daud",
//   "en_1",
//   "en_2",
//   "en_3",
//   "en_4",
//   "hi_1",
//   "hi_2",
//   "hi_3",
//   "hi_4",
//   "mr_1",
//   "mr_2",
//   "mr_3",
//   "mr_4",
//   "gu_1",
//   "gu_2",
//   "gu_3",
//   "gu_4",
//   "bn_1",
//   "bn_2",
//   "bn_3",
//   "bn_4",
//   "te_1",
//   "te_2",
//   "te_3",
//   "te_4",
//   "status",
//   "assigned_to",
//   "status_en",
//   "status_hi",
//   "status_mr",
//   "status_gu",
//   "status_te",
//   "status_bn",
// ];
// /* 12 English lagna names used to count rows */
// const LAGNAs = [
//   "Aries",
//   "Taurus",
//   "Gemini",
//   "Cancer",
//   "Leo",
//   "Virgo",
//   "Libra",
//   "Scorpio",
//   "Sagittarius",
//   "Capricorn",
//   "Aquarius",
//   "Pisces",
// ];

// Fully implemented VideoForm component
// const VideoForm: React.FC = () => {
//   const [channels, setChannels] = useState<Channel[]>([]);
//   const [selectedChannelId, setSelectedChannelId] = useState<string>("");
//   const [file, setFile] = useState<File | null>(null);
//   const [videos, setVideos] = useState<VideoRow[]>([]);
//   const [error, setError] = useState<string>("");
//   const [loading, setLoading] = useState(false);
//   const [result, setResult] = useState<string>("");

//   // Fetch channels on mount
//   useEffect(() => {
//     fetch("http://localhost:5000/api/channels")
//       .then((res) => res.json())
//       .then((data) => setChannels(data))
//       .catch(() => setError("Failed to load channels"));
//   }, []);

//   // Parse CSV file on upload
//   const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
//     setError("");
//     setResult("");
//     setVideos([]);
//     if (!e.target.files || e.target.files.length === 0) {
//       setFile(null);
//       return;
//     }
//     const uploadedFile = e.target.files[0];
//     setFile(uploadedFile);

//     const reader = new FileReader();
//     reader.onload = (evt) => {
//       const text = evt.target?.result;
//       if (typeof text === "string") {
//         parseCSV(text);
//       }
//     };
//     reader.readAsText(uploadedFile);
//   };

//   // Simple CSV parser assuming header row with video_title, link
//   const parseCSV = (text: string) => {
//     const lines = text.trim().split("\n");
//     if (lines.length < 2) {
//       setError("CSV file has no data");
//       return;
//     }

//     const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
//     if (!headers.includes("video_title") || !headers.includes("link")) {
//       setError("CSV must contain 'video_title' and 'link' columns");
//       return;
//     }

//     const titleIdx = headers.indexOf("video_title");
//     const linkIdx = headers.indexOf("link");

//     const rows: VideoRow[] = lines.slice(1).map((line) => {
//       const cols = line.split(",");
//       return {
//         video_title: cols[titleIdx]?.trim() || "",
//         link: cols[linkIdx]?.trim() || "",
//       };
//     });

//     setVideos(rows);
//   };

//   // Submit videos to backend
//   const handleSubmit = async (e: FormEvent) => {
//     e.preventDefault();
//     setError("");
//     setResult("");

//     if (!selectedChannelId) {
//       setError("Please select a channel");
//       return;
//     }
//     if (!videos.length) {
//       setError("No videos to upload");
//       return;
//     }

//     setLoading(true);

//     try {
//       const res = await fetch("http://localhost:5000/api/videos", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           channel_id: Number(selectedChannelId),
//           videos,
//         }),
//       });

//       if (res.ok) {
//         setResult("Videos uploaded successfully!");
//         setVideos([]);
//         setFile(null);
//         setSelectedChannelId("");
//       } else {
//         const data = await res.json();
//         setError(data.error || "Failed to upload videos");
//       }
//     } catch {
//       setError("Network error while uploading videos");
//     }
//     setLoading(false);
//   };

//   return (
//     <form onSubmit={handleSubmit} className="space-y-4 w-full">
//       <h3 className="text-xl font-semibold mb-4">Video Upload Form</h3>

//       {error && <div className="text-red-600">{error}</div>}
//       {result && <div className="text-green-600">{result}</div>}

//       <div>
//         <label className="block font-medium mb-1" htmlFor="channelSelect">
//           Select Channel <span className="text-red-600">*</span>
//         </label>
//         <select
//           id="channelSelect"
//           className="border rounded p-2 w-full"
//           value={selectedChannelId}
//           onChange={(e) => setSelectedChannelId(e.target.value)}
//           required
//           disabled={loading}
//         >
//           <option value="">-- Select Channel --</option>
//           {channels.map((ch) => (
//             <option key={ch.id} value={ch.id}>
//               {ch.channel_name}
//             </option>
//           ))}
//         </select>
//       </div>

//       <div>
//         <label className="block font-medium mb-1" htmlFor="csvUpload">
//           Upload Videos CSV (columns: video_title, link)
//           <span className="text-red-600">*</span>
//         </label>
//         <input
//           id="csvUpload"
//           type="file"
//           accept=".csv"
//           onChange={handleFileChange}
//           disabled={loading}
//         />
//       </div>

//       {videos.length > 0 && (
//         <div className="overflow-x-auto max-h-60 border rounded p-2 bg-gray-50">
//           <table className="w-full text-left text-sm">
//             <thead>
//               <tr>
//                 <th className="border px-2 py-1">Video Title</th>
//                 <th className="border px-2 py-1">Link</th>
//               </tr>
//             </thead>
//             <tbody>
//               {videos.map((vid, idx) => (
//                 <tr key={idx}>
//                   <td className="border px-2 py-1">{vid.video_title}</td>
//                   <td className="border px-2 py-1 break-all">{vid.link}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       )}

//       <button
//         type="submit"
//         disabled={loading || !videos.length || !selectedChannelId}
//         className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-blue-300"
//       >
//         {loading ? "Uploading..." : "Upload Videos"}
//       </button>
//     </form>
//   );
// };

// Channel form with API submit example

const VideoForm: React.FC = () => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannelId, setSelectedChannelId] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [videos, setVideos] = useState<VideoRow[]>([]);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>("");

  useEffect(() => {
    fetch("http://localhost:5000/api/channels")
      .then((res) => res.json())
      .then((data) => setChannels(data))
      .catch(() => setError("Failed to load channels"));
  }, []);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setError("");
    setResult("");
    setVideos([]);
    if (!e.target.files || e.target.files.length === 0) {
      setFile(null);
      return;
    }

    const uploadedFile = e.target.files[0];
    setFile(uploadedFile);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = evt.target?.result;
      if (data) {
        parseExcel(data as ArrayBuffer);
      }
    };
    reader.readAsArrayBuffer(uploadedFile);
  };

  const parseExcel = (data: ArrayBuffer) => {
    try {
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const json: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

      if (!json.length) {
        setError("Excel file has no data");
        return;
      }

      const headers = Object.keys(json[0]).map((h) => h.trim().toLowerCase());
      if (!headers.includes("video_title") || !headers.includes("link")) {
        setError("Excel must contain 'video_title' and 'link' columns");
        return;
      }

      const rows: VideoRow[] = json.map((row) => ({
        video_title: String(
          row["video_title"] || row["Video_Title"] || ""
        ).trim(),
        link: String(row["link"] || row["Link"] || "").trim(),
      }));

      setVideos(rows);
    } catch {
      setError("Failed to parse Excel file");
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setResult("");
    if (!selectedChannelId) {
      setError("Please select a channel");
      return;
    }
    if (!videos.length) {
      setError("No videos to upload");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel_id: Number(selectedChannelId),
          videos,
        }),
      });
      if (res.ok) {
        setResult("Videos uploaded successfully!");
        setVideos([]);
        setFile(null);
        setSelectedChannelId("");
      } else {
        const data = await res.json();
        setError(data.error || "Failed to upload videos");
      }
    } catch {
      setError("Network error while uploading videos");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full">
      <h3 className="text-xl font-semibold mb-4">Video Upload Form</h3>
      {error && <div className="text-red-600">{error}</div>}
      {result && <div className="text-green-600">{result}</div>}

      <div>
        <label htmlFor="channelSelect" className="block font-medium mb-1">
          Select Channel <span className="text-red-600">*</span>
        </label>
        <select
          id="channelSelect"
          className="border rounded p-2 w-full"
          value={selectedChannelId}
          onChange={(e) => setSelectedChannelId(e.target.value)}
          required
          disabled={loading}
        >
          <option value="">-- Select Channel --</option>
          {channels.map((ch) => (
            <option key={ch.id} value={ch.id}>
              {ch.channel_name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="excelUpload" className="block font-medium mb-1">
          Upload Videos Excel (columns: video_title, link)
          <span className="text-red-600">*</span>
        </label>
        <input
          id="excelUpload"
          type="file"
          accept=".xlsx, .xls"
          onChange={handleFileChange}
          disabled={loading}
        />
      </div>

      {videos.length > 0 && (
        <div className="overflow-x-auto max-h-60 border rounded p-2 bg-gray-50">
          <table className="w-full text-left text-sm">
            <thead>
              <tr>
                <th className="border px-2 py-1">Video Title</th>
                <th className="border px-2 py-1">Link</th>
              </tr>
            </thead>
            <tbody>
              {videos.map((vid, idx) => (
                <tr key={idx}>
                  <td className="border px-2 py-1">{vid.video_title}</td>
                  <td className="border px-2 py-1 break-all">{vid.link}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !videos.length || !selectedChannelId}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-blue-300"
      >
        {loading ? "Uploading..." : "Upload Videos"}
      </button>
    </form>
  );
};

const ChannelForm: React.FC = () => {
  const [channelName, setChannelName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [resultMsg, setResultMsg] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setResultMsg(null);
    if (!channelName.trim()) {
      setResultMsg("Channel name is required");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/channels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel_name: channelName, description }),
      });
      if (res.ok) {
        setResultMsg("Channel created successfully!");
        setChannelName("");
        setDescription("");
      } else {
        const data = await res.json();
        setResultMsg(data.error || "Failed to create channel");
      }
    } catch {
      setResultMsg("Network error. Please try again.");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-xl font-semibold">Add New Channel</h3>
      {resultMsg && (
        <div
          className={`${
            resultMsg.includes("success") ? "text-green-600" : "text-red-600"
          }`}
        >
          {resultMsg}
        </div>
      )}
      <div>
        <label className="block font-medium mb-1" htmlFor="channelName">
          Channel Name <span className="text-red-600">*</span>
        </label>
        <input
          id="channelName"
          type="text"
          className="border rounded p-2 w-full"
          value={channelName}
          onChange={(e) => setChannelName(e.target.value)}
          required
          disabled={loading}
        />
      </div>
      <div>
        <label className="block font-medium mb-1" htmlFor="description">
          Description
        </label>
        <textarea
          id="description"
          className="border rounded p-2 w-full"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={loading}
        />
      </div>
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-blue-300"
        disabled={loading}
      >
        {loading ? "Saving..." : "Create Channel"}
      </button>
    </form>
  );
};
type PredictionRow = { [k: string]: string | undefined };
// const DailyPredictionForm: React.FC = () => {

//   const [file, setFile] = useState<File | null>(null);
//   const [predictions, setPredictions] = useState<PredictionRow[]>([]);
//   const [error, setError] = useState("");
//   const [result, setResult] = useState("");
//   const [loading, setLoading] = useState(false);

//   const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
//     setError("");
//     setResult("");
//     setPredictions([]);
//     const f = e.target.files?.[0];
//     if (!f) {
//       setFile(null);
//       return;
//     }
//     if (!f.name.match(/\.(xlsx|xls)$/)) {
//       setError("Upload .xlsx/.xls");
//       return;
//     }
//     setFile(f);

//     const reader = new FileReader();
//     reader.onload = (ev) => {
//       try {
//         /* read sheet */
//         const wb = XLSX.read(new Uint8Array(ev.target!.result as ArrayBuffer), {
//           type: "array",
//         });
//         const ws = wb.Sheets[wb.SheetNames[0]];
//         const arr = XLSX.utils.sheet_to_json(ws, {
//           header: 1,
//           defval: "",
//         }) as string[][];

//         /* header check */
//         if (arr.length < 2) {
//           setError("No data rows");
//           return;
//         }
//         const fileH = arr[0].map((h) => h.toString().toLowerCase().trim());
//         const miss = requiredHeaders.filter((h) => !fileH.includes(h));
//         if (miss.length) {
//           setError("Missing cols: " + miss.join(", "));
//           return;
//         }

//         /* build rows */
//         const rows = arr.slice(1);
//         const preds: PredictionRow[] = rows
//           .map((r) => {
//             const o: PredictionRow = {};
//             fileH.forEach((h, i) => {
//               if (r[i] !== "") o[h] = r[i].toString();
//             });
//             const iso = normalizeDate(o.fromdate || o.todate || "");
//             if (!iso) return null as any;
//             o.fromdate = o.todate = iso;
//             return o;
//           })
//           .filter((p): p is PredictionRow => !!p);

//         /* lrname validation */
//         /* ------- LR-NAME VALIDATION (replace old block) -------- */
//         const groups: Record<string, Set<string>> = {};

//         // build 1 Set per date
//         preds.forEach((p) => {
//           const dateISO = p.fromdate!;
//           const lr = (p.lrname || "").trim();
//           if (!lr) return;
//           (groups[dateISO] = groups[dateISO] ?? new Set()).add(lr);
//         });

//         // find any date whose unique-lrname count ≠ 12
//         const bad: string[] = [];
//         const missingInfo: string[] = [];

//         for (const [d, set] of Object.entries(groups)) {
//           if (set.size !== 12) {
//             bad.push(`${d} (${set.size}/12)`);
//             const missing = LAGNAs.filter((l) => !set.has(l));
//             missingInfo.push(`${d}: missing → ${missing.join(", ")}`);
//           }
//         }

//         if (bad.length) {
//           setError(
//             `Add missing lrname rows for: ${missingInfo.join(" | ")}` // shows which are absent
//           );
//           return; // block further processing
//         }

//         setResult("✅ Headers OK & every date has 12 UNIQUE lrname rows");
//       } catch {
//         setError("Cannot parse Excel");
//       }
//     };
//     reader.readAsArrayBuffer(f);
//   };

//   const upload = async (e: FormEvent) => {
//     e.preventDefault();
//     if (!predictions.length || error) return;
//     setLoading(true);
//     await fetch("http://localhost:5000/api/predictions/daily", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ predictions }),
//     });
//     setLoading(false);
//     setResult("Uploaded!");
//     setFile(null);
//     setPredictions([]);
//   };

//   return (
//     <form onSubmit={upload} className="space-y-4">
//       <h3 className="text-xl font-semibold">Daily Prediction Upload</h3>

//       {error && <div className="text-red-600">{error}</div>}
//       {result && <div className="text-green-600">{result}</div>}

//       <input
//         type="file"
//         id="excelUpload"
//         disabled={loading}
//         accept=".xlsx,.xls"
//         onChange={handleFile}
//       />

//       {predictions.length > 0 && (
//         <p className="text-sm text-gray-600">
//           Parsed {predictions.length} rows • ready to upload
//         </p>
//       )}

//       <button
//         disabled={loading || !predictions.length || !!error}
//         className="bg-blue-600 text-white px-4 py-2 rounded disabled:bg-gray-400"
//       >
//         {loading ? "Uploading…" : "Upload Predictions"}
//       </button>
//     </form>
//   );
// };

// --- Placeholders for other forms (unchanged) ---
// const DailyPredictionForm: React.FC = () => <div>daily Prediction Form</div>;
const DailyPredictionForm: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [result, setResult] = useState<string>("");

  // Model columns (must match your Sequelize model keys)
  const modelCols = [
    "type",
    "fromdate",
    "todate",
    "subno",
    "daycount",
    "url",
    "totalduration",
    "starttime",
    "endtime",
    "lagna_rasi",
    "lrname",
    "sentiment",
    "super_positive",
    "positive",
    "productive",
    "lucky",
    "average",
    "below_average",
    "negative",
    "super_negative",
    "pending_work",
    "tiring_even",
    "bhaag_daud",
    "en_1",
    "en_2",
    "en_3",
    "en_4",
    "hi_1",
    "hi_2",
    "hi_3",
    "hi_4",
    "mr_1",
    "mr_2",
    "mr_3",
    "mr_4",
    "gu_1",
    "gu_2",
    "gu_3",
    "gu_4",
    "bn_1",
    "bn_2",
    "bn_3",
    "bn_4",
    "te_1",
    "te_2",
    "te_3",
    "te_4",
    "status",
    "assigned_to",
    "status_en",
    "status_hi",
    "status_mr",
    "status_gu",
    "status_te",
    "status_bn",
  ];

  const REQUIRED_LAGNAS = [
    "Mesha",
    "Vrushabh",
    "Mithun",
    "Kark",
    "Sinh",
    "Kanya",
    "Tula",
    "Vrushik",
    "Dhanu",
    "Makar",
    "Kumbh",
    "Meen",
  ];

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setErrors([]);
    setResult("");
    setPredictions([]);
    if (!e.target.files?.length) return;
    const selectedFile = e.target.files[0];
    setFile(selectedFile);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: "" });
      validateData(jsonData);
    };
    reader.readAsArrayBuffer(selectedFile);
  };

  // const validateData = (data: any[]) => {
  //   const validationErrors: string[] = [];

  //   if (!data.length) {
  //     validationErrors.push("Excel file is empty.");
  //   } else {
  //     // Validate columns
  //     const fileCols = Object.keys(data[0]);
  //     const missingCols = modelCols.filter((col) => !fileCols.includes(col));
  //     if (missingCols.length) {
  //       validationErrors.push(`Missing columns: ${missingCols.join(", ")}`);
  //     }

  //     // Group by date and validate 12 lagnas
  //     const grouped: Record<string, Set<string>> = {};
  //     data.forEach((row, idx) => {
  //       if (!row.fromdate && !row.todate) {
  //         validationErrors.push(`Row ${idx + 1}: Missing fromdate/todate`);
  //       }
  //       if (!row.lrname) {
  //         validationErrors.push(`Row ${idx + 1}: Missing lrname`);
  //       }
  //       const dateKey = row.fromdate || row.todate;
  //       if (!grouped[dateKey]) grouped[dateKey] = new Set();
  //       grouped[dateKey].add(row.lrname?.trim());
  //     });

  //     // Check each date has all 12 lagnas
  //     Object.entries(grouped).forEach(([date, lagnaSet]) => {
  //       const missing = REQUIRED_LAGNAS.filter((lagna) => !lagnaSet.has(lagna));
  //       if (missing.length) {
  //         validationErrors.push(
  //           `Date ${date} missing lagnas: ${missing.join(", ")}`
  //         );
  //       }
  //     });
  //   }

  //   setErrors(validationErrors);
  //   if (validationErrors.length === 0) {
  //     setPredictions(data);
  //   }
  // };
  const validateData = (data: any[]) => {
    const validationErrors: string[] = [];
    const grouped: Record<string, Set<string>> = {};

    if (!data.length) {
      validationErrors.push("Excel file is empty.");
    } else {
      // Validate columns
      const fileCols = Object.keys(data[0]);
      const missingCols = modelCols.filter((col) => !fileCols.includes(col));
      if (missingCols.length) {
        validationErrors.push(`Missing columns: ${missingCols.join(", ")}`);
      }

      data.forEach((row, idx) => {
        // --- Normalize Date ---
        let dateValue = row.fromdate || row.todate;
        let formattedDate = "";
        if (typeof dateValue === "number") {
          // Excel serial date -> JS Date
          const parsed = XLSX.SSF.parse_date_code(dateValue);
          if (parsed) {
            const jsDate = new Date(parsed.y, parsed.m - 1, parsed.d);
            formattedDate = format(jsDate, "dd/MM/yyyy");
          }
        } else if (typeof dateValue === "string") {
          // Expect format dd/MM/yyyy
          formattedDate = dateValue.trim();
        }

        if (!formattedDate) {
          validationErrors.push(`Row ${idx + 1}: Invalid or missing date`);
        }

        if (!row.lrname) {
          validationErrors.push(`Row ${idx + 1}: Missing lrname`);
        }

        // Group by formatted date
        if (formattedDate) {
          if (!grouped[formattedDate]) grouped[formattedDate] = new Set();
          grouped[formattedDate].add(row.lrname?.trim());
        }
      });

      // Check for missing lagnas per date
      Object.entries(grouped).forEach(([date, lagnaSet]) => {
        const missing = REQUIRED_LAGNAS.filter((lagna) => !lagnaSet.has(lagna));
        if (missing.length) {
          validationErrors.push(
            `Date ${date} missing lagnas: ${missing.join(", ")}`
          );
        }
      });
    }

    setErrors(validationErrors);
    if (validationErrors.length === 0) {
      setPredictions(data);
    }
  };
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setResult("");
    if (errors.length > 0 || predictions.length === 0) return;

    try {
      const res = await fetch("http://localhost:5000/api/predictions/daily", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ predictions }),
      });
      if (res.ok) {
        setResult("Predictions uploaded successfully!");
        setPredictions([]);
        setFile(null);
      } else {
        const data = await res.json();
        setErrors([data.error || "Failed to upload predictions"]);
      }
    } catch {
      setErrors(["Network error while uploading predictions"]);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full">
      <h3 className="text-xl font-semibold mb-4">Upload Daily Predictions</h3>
      {errors.length > 0 && (
        <div className="text-red-600">
          <ul className="list-disc ml-6">
            {errors.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </div>
      )}
      {result && <div className="text-green-600">{result}</div>}

      <div>
        <label className="block font-medium mb-1" htmlFor="xlsxUpload">
          Upload Excel (.xlsx)
        </label>
        <input
          id="xlsxUpload"
          type="file"
          accept=".xlsx"
          onChange={handleFileChange}
        />
      </div>

      {predictions.length > 0 && (
        <div className="overflow-x-auto max-h-60 border rounded p-2 bg-gray-50 text-xs">
          <table className="w-full text-left">
            <thead>
              <tr>
                {Object.keys(predictions[0]).map((col) => (
                  <th key={col} className="border px-2 py-1">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {predictions.slice(0, 5).map((row, idx) => (
                <tr key={idx}>
                  {Object.values(row).map((val, i) => (
                    <td key={i} className="border px-2 py-1">
                      {String(val ?? "")}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-gray-500 mt-2">
            Showing first 5 rows ({predictions.length} total)
          </p>
        </div>
      )}

      <button
        type="submit"
        disabled={errors.length > 0 || predictions.length === 0}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-blue-300"
      >
        Upload Predictions
      </button>
    </form>
  );
};

// const TenDayPredictionForm: React.FC = () => <div>10-Day Prediction Form</div>;
const TenDayPredictionForm: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [result, setResult] = useState<string>("");

  // Model columns (must match Prediction10Days Sequelize model keys)
  const modelCols = [
    "type",
    "fromdate",
    "todate",
    "subno",
    "daycount",
    "url",
    "totalduration",
    "starttime",
    "endtime",
    "lagna_rasi",
    "lrname",
    "sentiment",
    "super_positive",
    "positive",
    "productive",
    "lucky",
    "average",
    "below_average",
    "negative",
    "super_negative",
    "pending_works", // <-- difference here!
    "tiring_even",
    "bhagdaud", // <-- difference here!
    "en_1",
    "en_2",
    "en_3",
    "en_4",
    "hi_1",
    "hi_2",
    "hi_3",
    "hi_4",
    "mr_1",
    "mr_2",
    "mr_3",
    "mr_4",
    "gu_1",
    "gu_2",
    "gu_3",
    "gu_4",
    "bn_1",
    "bn_2",
    "bn_3",
    "bn_4",
    "te_1",
    "te_2",
    "te_3",
    "te_4",
    "status",
    "assigned_to",
    "status_en",
    "status_hi",
    "status_mr",
    "status_gu",
    "status_te",
    "status_bn",
  ];

  const REQUIRED_LAGNAS = [
    "Mesha",
    "Vrushabh",
    "Mithun",
    "Kark",
    "Sinh",
    "Kanya",
    "Tula",
    "Vrushik",
    "Dhanu",
    "Makar",
    "Kumbh",
    "Meen",
  ];

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setErrors([]);
    setResult("");
    setPredictions([]);
    if (!e.target.files?.length) return;
    const selectedFile = e.target.files[0];
    setFile(selectedFile);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: "" });
      validateData(jsonData);
    };
    reader.readAsArrayBuffer(selectedFile);
  };

  // const validateData = (data: any[]) => {
  //   const validationErrors: string[] = [];
  //   const grouped: Record<string, Set<string>> = {};

  //   if (!data.length) {
  //     validationErrors.push("Excel file is empty.");
  //   } else {
  //     const fileCols = Object.keys(data[0]);
  //     const missingCols = modelCols.filter((col) => !fileCols.includes(col));
  //     if (missingCols.length) {
  //       validationErrors.push(`Missing columns: ${missingCols.join(", ")}`);
  //     }

  //     data.forEach((row, idx) => {
  //       let dateValue = row.fromdate || row.todate;
  //       let formattedDate = "";

  //       if (typeof dateValue === "number") {
  //         const parsed = XLSX.SSF.parse_date_code(dateValue);
  //         if (parsed) {
  //           const jsDate = new Date(parsed.y, parsed.m - 1, parsed.d);
  //           formattedDate = format(jsDate, "dd/MM/yyyy");
  //         }
  //       } else if (typeof dateValue === "string") {
  //         formattedDate = dateValue.trim();
  //       }

  //       if (!formattedDate) {
  //         validationErrors.push(`Row ${idx + 1}: Invalid or missing date`);
  //       }
  //       if (!row.lrname) {
  //         validationErrors.push(`Row ${idx + 1}: Missing lrname`);
  //       }

  //       if (formattedDate) {
  //         if (!grouped[formattedDate]) grouped[formattedDate] = new Set();
  //         grouped[formattedDate].add(row.lrname?.trim());
  //       }
  //     });

  //     Object.entries(grouped).forEach(([date, lagnaSet]) => {
  //       const missing = REQUIRED_LAGNAS.filter((lagna) => !lagnaSet.has(lagna));
  //       if (missing.length) {
  //         validationErrors.push(
  //           `Date ${date} missing lagnas: ${missing.join(", ")}`
  //         );
  //       }
  //     });
  //   }

  //   setErrors(validationErrors);
  //   if (!validationErrors.length) {
  //     setPredictions(data);
  //   }
  // };
  const validateData = (data: any[]) => {
    const validationErrors: string[] = [];

    if (!data.length) {
      validationErrors.push("Excel file is empty.");
    } else {
      // Check correct columns exist
      const fileCols = Object.keys(data[0]);
      const missingCols = modelCols.filter((col) => !fileCols.includes(col));
      if (missingCols.length) {
        validationErrors.push(`Missing columns: ${missingCols.join(", ")}`);
      }

      // Group by date range (fromdate → todate)
      const grouped: Record<string, Record<string, number>> = {};

      data.forEach((row, idx) => {
        if (!row.fromdate || !row.todate) {
          validationErrors.push(`Row ${idx + 1}: Missing fromdate/todate`);
          return;
        }
        if (!row.lrname) {
          validationErrors.push(`Row ${idx + 1}: Missing lrname`);
          return;
        }

        const rangeKey = `${row.fromdate}-${row.todate}`;
        if (!grouped[rangeKey]) grouped[rangeKey] = {};

        const lagna = row.lrname.trim();
        grouped[rangeKey][lagna] = (grouped[rangeKey][lagna] || 0) + 1;
      });

      // Validate each group
      Object.entries(grouped).forEach(([rangeKey, lagnaCounts]) => {
        REQUIRED_LAGNAS.forEach((lagna) => {
          const count = lagnaCounts[lagna] || 0;
          if (count < 10) {
            validationErrors.push(
              `Range ${rangeKey}: Lagna '${lagna}' has only ${count} records, expected 10`
            );
          }
          if (count > 10) {
            validationErrors.push(
              `Range ${rangeKey}: Lagna '${lagna}' has ${count} records (too many, should be 10)`
            );
          }
        });

        const total = Object.values(lagnaCounts).reduce((a, b) => a + b, 0);
        if (total !== 120) {
          validationErrors.push(
            `Range ${rangeKey}: Found ${total} rows total, expected 120`
          );
        }
      });
    }

    setErrors(validationErrors);
    if (!validationErrors.length) {
      setPredictions(data);
    }
  };
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setResult("");
    if (errors.length > 0 || predictions.length === 0) return;

    try {
      const res = await fetch("http://localhost:5000/api/predictions/tenday", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ predictions }),
      });
      if (res.ok) {
        setResult("10-Day Predictions uploaded successfully!");
        setPredictions([]);
        setFile(null);
      } else {
        const data = await res.json();
        setErrors([data.error || "Failed to upload 10-day predictions"]);
      }
    } catch {
      setErrors(["Network error while uploading predictions"]);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full">
      <h3 className="text-xl font-semibold mb-4">Upload 10-Day Predictions</h3>
      {errors.length > 0 && (
        <div className="text-red-600">
          <ul className="list-disc ml-6">
            {errors.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </div>
      )}
      {result && <div className="text-green-600">{result}</div>}

      <input
        type="file"
        accept=".xlsx"
        onChange={handleFileChange}
        className="block"
      />

      {predictions.length > 0 && (
        <div className="overflow-x-auto max-h-60 border rounded p-2 bg-gray-50 text-xs">
          <table className="w-full text-left">
            <thead>
              <tr>
                {Object.keys(predictions[0]).map((col) => (
                  <th key={col} className="border px-2 py-1">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {predictions.slice(0, 5).map((row, idx) => (
                <tr key={idx}>
                  {Object.values(row).map((val, i) => (
                    <td key={i} className="border px-2 py-1">
                      {String(val ?? "")}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-gray-500 mt-2">
            Showing first 5 rows ({predictions.length} total)
          </p>
        </div>
      )}

      <button
        type="submit"
        disabled={errors.length > 0 || predictions.length === 0}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-green-300"
      >
        Upload 10-Day Predictions
      </button>
    </form>
  );
};
const TranslateForm: React.FC = () => <div>Translate Form</div>;

// --- Main Uploader Tabs and Component ---
const TABS = [
  { key: "channel", label: "Channel", Component: ChannelForm },
  { key: "videos", label: "Videos", Component: VideoForm },
  { key: "daily", label: "Predictions Daily", Component: DailyPredictionForm }, // Now working
  {
    key: "tenday",
    label: "Prediction 10 Days",
    Component: TenDayPredictionForm,
  },
  { key: "translate", label: "Translate", Component: TranslateForm },
];
const Uploader: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("channel");
  const ActiveForm = TABS.find((tab) => tab.key === activeTab)?.Component;
  return (
    <div className="p-6 w-full mx-auto">
      <h2 className="text-3xl font-bold mb-6">Content Uploader</h2>
      {/* Tabs */}
      <nav className="flex gap-2 mb-6 border-b">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`px-4 py-2 -mb-px rounded-t ${
              activeTab === key
                ? "border border-b-0 border-blue-600 bg-white text-blue-600 font-semibold"
                : "bg-gray-200 text-gray-600 hover:bg-gray-300"
            }`}
          >
            {label}
          </button>
        ))}
      </nav>
      {/* Active Form */}
      <section className="bg-white p-6 rounded shadow">
        {ActiveForm && <ActiveForm />}
      </section>
    </div>
  );
};

export default Uploader;
