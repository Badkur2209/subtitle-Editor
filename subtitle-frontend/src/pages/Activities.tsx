// Activities.tsx - Activity Translation Editor Page
import React, { useEffect, useState } from "react";
import { API_BASE_URL } from "../utils/config.ts";

// Language config for dropdowns and mappings
const LANG_KEYS = [
  { label: "English", key: "act_en", dataKey: "en", langId: "english" },
  { label: "Hindi", key: "act_hi", dataKey: "hi", langId: "hindi" },
  { label: "Telugu", key: "act_te", dataKey: "te", langId: "telugu" },
  { label: "Marathi", key: "act_mr", dataKey: "mr", langId: "marathi" },
  { label: "Gujarati", key: "act_gu", dataKey: "gu", langId: "gujarati" },
  { label: "Bengali", key: "act_bn", dataKey: "bn", langId: "bengali" },
];

function getPlainLangName(langKey) {
  const lang = LANG_KEYS.find((l) => l.key === langKey);
  return lang ? lang.label : langKey.replace("act_", "");
}
const currentUsername = "hindi11@ayushcms.com";
const jwtToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTcsInVzZXJuYW1lIjoiaGluZGkxMUBheXVzaGNtcy5jb20iLCJyb2xlIjoidHJhbnNsYXRvciIsIm5hbWUiOiJoaW5kaSIsImlhdCI6MTc1NzkyOTUxNCwiZXhwIjoxNzU4NTM0MzE0fQ.SnAdTwofqLui3a2dt3O-YELqw-ilxZ5RrEqfgwOUBTg";
// "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjEsInVzZXJuYW1lIjoibWFyYXRoaTkzQGF5dXNoY21zLmNvbSIsInJvbGUiOiJ0cmFuc2xhdG9yIiwibmFtZSI6Im1hcmF0aGkiLCJpYXQiOjE3NTc5Mjc5MTEsImV4cCI6MTc1ODUzMjcxMX0.xYJ-oRcDz9PMi4rMGI05wcdyupAf5ho4gs_UqKPTbeI";

const getStatusColor = (status) => {
  switch (status) {
    case "completed":
      return "bg-green-500";
    case "working":
      return "bg-yellow-500";
    case "pending":
    default:
      return "bg-red-500";
  }
};

export default function TextBased() {
  const [activities, setActivities] = useState([]);
  const [selected, setSelected] = useState(null);
  const [translatedText, setTranslatedText] = useState("");
  const [sourceLangKey, setSourceLangKey] = useState("act_hi");
  const [targetLangKey, setTargetLangKey] = useState("act_en");
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedLink, setSelectedLink] = useState("");
  const [activityNameText, setActivityNameText] = useState("");
  const [filterDate, setFilterDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });

  const getActivityName = (activity, activityNameKey) =>
    activity?.[activityNameKey] || "";

  const getActivityData = (activity, dataKey) => activity?.[dataKey] || "";

  const extractYouTubeId = (url) => {
    if (!url) return null;
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/live\/([^&\n?#]+)/,
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };
  const currentUsername = "hindi11@ayushcms.com"; // hardcoded for now

  const handleLoad = async () => {
    setLoading(true);
    try {
      const url = `${API_BASE_URL}/activities?assignedTo=${encodeURIComponent(
        currentUsername
      )}`;
      const response = await fetch(url);
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      const filteredByUser = data.filter(
        (activity) => activity.assigned_to === currentUsername
      );
      setActivities(filteredByUser);

      // setActivities(data); // sets only activities assigned to currentUsername
      setLoaded(true);
    } catch (err) {
      console.error("Failed to load activities", err);
      alert("Failed to load activities.");
    } finally {
      setLoading(false);
    }
  };

  // const handleLoad = async () => {
  //   setLoading(true);
  //   try {
  //     const response = await fetch(
  //       `${API_BASE_URL}/textbased/activities`
  //       // "http://localhost:5000/api/textbased/activities"
  //       // "https://api.ayushcms.info/api/textbased/activities"
  //     );
  //     if (!response.ok)
  //       throw new Error(`HTTP error! status: ${response.status}`);
  //     const data = await response.json();
  //     setActivities(data);
  //     setLoaded(true);
  //   } catch (err) {
  //     console.error("Error loading activities:", err);
  //     alert(
  //       "Failed to load activities. Please check if the server is running."
  //     );
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  useEffect(() => {
    handleLoad(); // Auto-load on mount
  }, []);

  useEffect(() => {
    if (selected && loaded) {
      const langConfig = LANG_KEYS.find((l) => l.key === targetLangKey);
      setActivityNameText(selected[targetLangKey] || "");
      setTranslatedText(selected[langConfig?.dataKey] || "");
    }
  }, [targetLangKey, selected, loaded]);

  const handleSelectActivity = (activity) => {
    setSelected(activity);
    const langConfig = LANG_KEYS.find((l) => l.key === targetLangKey);
    setActivityNameText(activity[targetLangKey] || "");
    setTranslatedText(activity[langConfig?.dataKey] || "");
    const youtubeId = extractYouTubeId(activity.url);
    setSelectedLink(
      youtubeId ? `https://www.youtube.com/watch?v=${youtubeId}` : ""
    );
  };
  const timeStringToSeconds = (timeStr) => {
    if (!timeStr) return 0;
    const parts = timeStr.split(":").map(Number).reverse();
    return parts.reduce((acc, part, i) => acc + part * Math.pow(60, i), 0);
  };
  const handleSave = async () => {
    if (!selected || !translatedText.trim()) {
      alert("Please select an activity and enter a translation.");
      return;
    }

    const langConfig = LANG_KEYS.find((l) => l.key === targetLangKey);
    const payload = {
      id: selected.id,
      translated: translatedText,
      targetLang: langConfig?.langId,
      activityName: activityNameText,
    };

    try {
      const res = await fetch(
        `${API_BASE_URL}/textbased/save`,
        // "http://localhost:5000/api/textbased/save",
        // "https://api.ayushcms.info/api/textbased/save",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error("Save failed");

      alert("✅ Translation saved successfully");

      await handleLoad();
      const updatedActivity = activities.find((a) => a.id === selected.id);
      if (updatedActivity) {
        setSelected(updatedActivity);
        setActivityNameText(updatedActivity[targetLangKey] || "");
        setTranslatedText(updatedActivity[langConfig?.dataKey] || "");
      }
    } catch (err) {
      console.error("Save failed:", err);
      alert("❌ Failed to save translation");
    }
  };

  // --- DATE FILTER FIX ---
  const filteredActivities = activities.filter((a) => {
    if (filterDate && a.Date) {
      let activityDateObj = null;
      const parts = a.Date.split("-");
      if (parts.length === 3) {
        // Handles DD-MM-YY or DD-MM-YYYY
        let [day, month, year] = parts;
        if (year.length === 2) year = "20" + year;
        activityDateObj = new Date(`${year}-${month}-${day}`);
      } else if (a.Date.includes("T")) {
        // ISO
        activityDateObj = new Date(a.Date.split("T"));
      } else {
        // Fallback: try to convert directly
        activityDateObj = new Date(a.Date);
      }
      const filterDateObj = new Date(filterDate);

      if (
        activityDateObj.getFullYear() !== filterDateObj.getFullYear() ||
        activityDateObj.getMonth() !== filterDateObj.getMonth() ||
        activityDateObj.getDate() !== filterDateObj.getDate()
      )
        return false;
    }
    const sourceName = getActivityName(a, sourceLangKey);
    return sourceName && sourceName.trim() !== "";
  });

  // Format date string
  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      // Attempt to parse DD-MM-YY, DD-MM-YYYY, or ISO
      const parts = dateString.split("-");
      if (parts.length === 3) {
        let [day, month, year] = parts;
        if (year.length === 2) year = "20" + year;
        const date = new Date(`${year}-${month}-${day}`);
        return date.toLocaleDateString("en-IN");
      }
      const date = new Date(dateString);
      return date.toLocaleDateString("en-IN");
    } catch {
      return dateString;
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Activity Translation Editor</h2>

      <div className="flex gap-4 mb-4">
        {/* Language Selectors */}
        <div>
          <label className="block font-medium">Source Language</label>
          <select
            className="p-2 border rounded"
            value={sourceLangKey}
            onChange={(e) => {
              const newSource = e.target.value;
              setSourceLangKey(newSource);
              if (newSource === targetLangKey) {
                const fallback = LANG_KEYS.find((k) => k.key !== newSource);
                setTargetLangKey(fallback?.key || "act_hi");
              }
            }}
          >
            {LANG_KEYS.map((lang) => (
              <option key={lang.key} value={lang.key}>
                {lang.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-medium">Target Language</label>
          <select
            className="p-2 border rounded"
            value={targetLangKey}
            onChange={(e) => setTargetLangKey(e.target.value)}
          >
            {LANG_KEYS.filter((lang) => lang.key !== sourceLangKey).map(
              (lang) => (
                <option key={lang.key} value={lang.key}>
                  {lang.label}
                </option>
              )
            )}
          </select>
        </div>

        <div>
          <label className="block font-medium">Filter by Date</label>
          <input
            type="date"
            className="p-2 border rounded"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            max={new Date().toISOString().split("T")[0]}
          />
          {filterDate && (
            <div className="mt-1 text-sm text-gray-600">
              Selected: {new Date(filterDate).toLocaleDateString("en-GB")}
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 mt-1">
        <div className="text-sm text-gray-600">
          Selected: {new Date(filterDate).toLocaleDateString("en-GB")}
        </div>
        <button
          type="button"
          onClick={() => setFilterDate("")}
          className="text-sm text-blue-600 underline hover:text-blue-800"
        >
          Clear
        </button>
      </div>
      {/* Video */}
      {/* {selectedLink && (
        <div className="mb-4">
          <h3 className="font-semibold mb-2">Related Video</h3>
          <iframe
            className="w-full h-64 rounded"
            src={`https://www.youtube.com/embed/${extractYouTubeId(
              selectedLink
            )}?rel=0`}
            allowFullScreen
            title="Related Video"
          />
        </div>
      )} */}
      {selectedLink && (
        <div className="mb-4">
          <h3 className="font-semibold mb-2">Related Video</h3>
          {(() => {
            const start = timeStringToSeconds(selected.BB_Start);
            const end = timeStringToSeconds(selected.BB_End);
            const videoId = extractYouTubeId(selectedLink);
            const url = `https://www.youtube.com/embed/${videoId}?start=${start}&end=${end}&rel=0`;
            return (
              <iframe
                className="w-full h-64 rounded"
                src={url}
                allowFullScreen
                title="Related Video"
              />
            );
          })()}
        </div>
      )}

      {/* Main Content */}
      {loaded && (
        <div className="flex gap-6">
          {/* Activity List */}
          <div className="w-1/3">
            <h3 className="font-semibold mb-2">
              Activities ({filteredActivities.length})
            </h3>
            <ul className="space-y-2 max-h-96 overflow-y-auto">
              {filteredActivities.map((activity, index) => (
                <li
                  key={activity.id}
                  className={`p-2 border rounded cursor-pointer flex items-center justify-between ${
                    selected?.id === activity.id
                      ? "bg-blue-100"
                      : "hover:bg-gray-100"
                  }`}
                  onClick={() => handleSelectActivity(activity)}
                >
                  <div className="flex flex-col text-sm gap-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-3 h-3 rounded-full ${getStatusColor(
                          activity.status
                        )}`}
                      />
                      <span className="font-semibold">
                        {index + 1}.{" "}
                        {getActivityName(activity, sourceLangKey).substring(
                          0,
                          50
                        )}
                        {getActivityName(activity, sourceLangKey).length > 50
                          ? "..."
                          : ""}
                      </span>
                    </div>
                    {/* Show date */}
                    <span className="text-xs text-gray-500">
                      {formatDate(activity.Date)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Editor */}
          <div className="w-2/3">
            {selected ? (
              <div>
                <div className="mb-4 p-3 bg-gray-50 rounded text-sm text-gray-600">
                  <strong>ID:</strong> {selected.id} | <strong>Status:</strong>{" "}
                  {selected.status} | <strong>Date:</strong>{" "}
                  {formatDate(selected.Date)} | <strong>Video:</strong>{" "}
                  {selected.url ? "Available" : "Not available"}
                </div>

                <div className="flex gap-8">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">
                      Original ({getPlainLangName(sourceLangKey)})
                    </h3>
                    <div className="mb-4 font-semibold text-gray-700 p-2 bg-gray-50 rounded">
                      {getActivityName(selected, sourceLangKey)}
                    </div>
                    <textarea
                      className="w-full h-80 p-2 border rounded bg-gray-100"
                      readOnly
                      value={getActivityData(
                        selected,
                        LANG_KEYS.find((l) => l.key === sourceLangKey)?.dataKey
                      )}
                    />
                  </div>

                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">
                      Translation ({getPlainLangName(targetLangKey)})
                    </h3>
                    <div className="mb-4">
                      <label className="block mb-1 font-medium">
                        Activity Name
                      </label>
                      <textarea
                        className="w-full h-12 p-2 border rounded"
                        value={activityNameText}
                        onChange={(e) => setActivityNameText(e.target.value)}
                        placeholder={`Enter activity name in ${getPlainLangName(
                          targetLangKey
                        )}...`}
                      />
                    </div>
                    <textarea
                      className="w-full h-80 p-2 border rounded"
                      value={translatedText}
                      onChange={(e) => setTranslatedText(e.target.value)}
                      placeholder={`Enter ${getPlainLangName(
                        targetLangKey
                      )} translation...`}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-20">
                <p>Select an activity from the list to start translating</p>
              </div>
            )}
          </div>
        </div>
      )}

      {loaded && selected && (
        <div className="mt-4">
          <button
            onClick={handleSave}
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
            type="button"
          >
            Save Translation
          </button>
        </div>
      )}
    </div>
  );
}

// import React, { useEffect, useState } from "react";

// // Language configuration mapping:
// // key = activity name column in DB (act_en, act_hi, etc.)
// // dataKey = translation content column in DB (en, hi, etc.)
// // langId = identifier sent to backend for columnMap/activityNameMap lookup
// const LANG_KEYS = [
//   { label: "English", key: "act_en", dataKey: "en", langId: "english" },
//   { label: "Hindi", key: "act_hi", dataKey: "hi", langId: "hindi" },
//   { label: "Telugu", key: "act_te", dataKey: "te", langId: "telugu" },
//   { label: "Marathi", key: "act_mr", dataKey: "mr", langId: "marathi" },
//   { label: "Gujarati", key: "act_gu", dataKey: "gu", langId: "gujarati" },
//   { label: "Bengali", key: "act_bn", dataKey: "bn", langId: "bengali" },
// ];

// function getPlainLangName(langKey) {
//   const lang = LANG_KEYS.find((l) => l.key === langKey);
//   return lang ? lang.label : langKey.replace("act_", "");
// }

// export default function TextBased() {
//   const [activities, setActivities] = useState([]);
//   const [selected, setSelected] = useState(null);
//   const [translatedText, setTranslatedText] = useState("");
//   const [sourceLangKey, setSourceLangKey] = useState("act_en");
//   const [targetLangKey, setTargetLangKey] = useState("act_hi");
//   const [loaded, setLoaded] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [selectedLink, setSelectedLink] = useState("");
//   const [activityNameText, setActivityNameText] = useState("");
//   const [filterDate, setFilterDate] = useState("");

//   // Helper to get activity name column value for an activity
//   function getActivityName(activity, activityNameKey) {
//     return activity?.[activityNameKey] || "";
//   }

//   // Helper to get data content column value for an activity
//   function getActivityData(activity, dataKey) {
//     return activity?.[dataKey] || "";
//   }

//   // Load activities from backend
//   const handleLoad = async () => {
//     setLoading(true);
//     try {
//       const response = await fetch(
//         "http://localhost:5000/api/textbased/activities"
//         // "https://api.ayushcms.info/api/textbased/activities"
//       );
//       if (!response.ok)
//         throw new Error(`HTTP error! status: ${response.status}`);
//       const data = await response.json();
//       setActivities(data);
//       setLoaded(true);
//     } catch (err) {
//       console.error("Error loading activities:", err);
//       alert(
//         "Failed to load activities. Please check if the server is running."
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Update translated text and activity name when selection or target language changes
//   useEffect(() => {
//     if (selected && loaded) {
//       const langConfig = LANG_KEYS.find((l) => l.key === targetLangKey);

//       // Set activity name from the activity name column (act_*)
//       setActivityNameText(selected[targetLangKey] || "");

//       // Set translation text from the content column (en, hi, te, etc.)
//       setTranslatedText(selected[langConfig?.dataKey] || "");
//     }
//   }, [targetLangKey, selected, loaded]);

//   // Extract YouTube ID helper
//   const extractYouTubeId = (url) => {
//     if (!url) return null;
//     const patterns = [
//       /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
//       /youtube\.com\/live\/([^&\n?#]+)/,
//     ];
//     for (const pattern of patterns) {
//       const match = url.match(pattern);
//       if (match) return match[1];
//     }
//     return null;
//   };

//   // Handle activity selection
//   const handleSelectActivity = (activity) => {
//     setSelected(activity);

//     const langConfig = LANG_KEYS.find((l) => l.key === targetLangKey);

//     // Set activity name from target language activity name column
//     setActivityNameText(activity[targetLangKey] || "");

//     // Set translation from target language content column
//     setTranslatedText(activity[langConfig?.dataKey] || "");

//     // Set YouTube link if available
//     const youtubeId = extractYouTubeId(activity.url);
//     setSelectedLink(
//       youtubeId ? `https://www.youtube.com/watch?v=${youtubeId}` : ""
//     );
//   };

//   // Save translation and activity name
//   const handleSave = async () => {
//     if (!selected || !translatedText.trim()) {
//       alert("Please select an activity and enter a translation.");
//       return;
//     }

//     const langConfig = LANG_KEYS.find((l) => l.key === targetLangKey);

//     const payload = {
//       id: selected.id,
//       translated: translatedText,
//       targetLang: langConfig?.langId, // english, hindi, telugu, etc.
//       activityName: activityNameText,
//     };

//     try {
//       const res = await fetch("http://localhost:5000/api/textbased/save", {
//         // const res = await fetch("https://api.ayushcms.info/api/textbased/save", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });

//       if (!res.ok) throw new Error("Save failed");

//       alert("✅ Translation saved successfully");

//       // Refresh activities list to get updated data
//       await handleLoad();

//       // Reset selected with updated data
//       const updatedActivity = activities.find((a) => a.id === selected.id);
//       if (updatedActivity) {
//         setSelected(updatedActivity);
//         setActivityNameText(updatedActivity[targetLangKey] || "");
//         setTranslatedText(updatedActivity[langConfig?.dataKey] || "");
//       }
//     } catch (err) {
//       console.error("Save failed:", err);
//       alert("❌ Failed to save translation");
//     }
//   };

//   // Filter activities with non-empty source language name for listing
//   const filteredActivities = activities.filter((a) => {
//     // Filter by date if set
//     if (filterDate && a.Date) {
//       // Convert filterDate (YYYY-MM-DD) to match Date format in DB
//       const filterDateFormatted = new Date(filterDate).toLocaleDateString(
//         "en-GB"
//       );
//       const activityDateFormatted = new Date(a.Date).toLocaleDateString(
//         "en-GB"
//       );
//       if (filterDateFormatted !== activityDateFormatted) {
//         return false;
//       }
//     }

//     // Filter by source language - activity must have content in source language
//     const sourceName = getActivityName(a, sourceLangKey);
//     return sourceName && sourceName.trim() !== "";
//   });

//   // Format date for display (handles various formats)
//   const formatDate = (dateString) => {
//     if (!dateString) return "";
//     try {
//       // Try parsing as-is first
//       const date = new Date(dateString);
//       if (!isNaN(date.getTime())) {
//         return date.toLocaleDateString("en-IN");
//       }

//       // If that fails, try DD-MM-YY format
//       const [day, month, year] = dateString.split("-");
//       if (day && month && year) {
//         const fullYear = year.length === 2 ? `20${year}` : year;
//         const parsedDate = new Date(`${fullYear}-${month}-${day}`);
//         return parsedDate.toLocaleDateString("en-IN");
//       }

//       return dateString; // fallback to original string
//     } catch {
//       return dateString;
//     }
//   };

//   return (
//     <div className="p-6">
//       <h2 className="text-xl font-bold mb-4">Activity Translation Editor</h2>

//       <div className="flex gap-4 mb-4">
//         {/* Source Language Selector */}
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

//         {/* Target Language Selector */}
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

//         {/* Date Filter */}
//         <div>
//           <label className="block font-medium">Filter by Date</label>
//           <input
//             type="date"
//             className="p-2 border rounded"
//             value={filterDate}
//             onChange={(e) => setFilterDate(e.target.value)}
//             max={new Date().toISOString().split("T")[0]}
//           />
//           {filterDate && (
//             <div className="mt-1 text-sm text-gray-600">
//               Selected: {new Date(filterDate).toLocaleDateString("en-GB")}
//             </div>
//           )}
//         </div>

//         {/* Load Button */}
//         <button
//           className="mt-6 bg-blue-600 text-white px-5 py-2 rounded disabled:bg-gray-400"
//           onClick={handleLoad}
//           disabled={loading}
//           type="button"
//         >
//           {loading ? "Loading..." : "Load"}
//         </button>
//       </div>

//       {/* YouTube Embed */}
//       {selectedLink && (
//         <div className="mb-4">
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

//       {/* Activities List and Translation Editor */}
//       {loaded && (
//         <div className="flex gap-6">
//           {/* Activities List */}
//           <div className="w-1/3">
//             <h3 className="font-semibold mb-2">
//               Activities ({filteredActivities.length})
//             </h3>
//             <ul className="space-y-2 max-h-96 overflow-y-auto">
//               {filteredActivities.map((activity, index) => (
//                 <li
//                   key={activity.id}
//                   className={`p-2 border rounded cursor-pointer ${
//                     selected?.id === activity.id
//                       ? "bg-blue-100"
//                       : "hover:bg-gray-100"
//                   }`}
//                   onClick={() => handleSelectActivity(activity)}
//                   role="button"
//                   tabIndex={0}
//                   onKeyPress={(e) => {
//                     if (e.key === "Enter") handleSelectActivity(activity);
//                   }}
//                 >
//                   <div className="text-sm font-semibold flex items-center gap-2">
//                     {index + 1}.
//                     {activity.Date && (
//                       <span className="text-gray-500 text-sm">
//                         📅 {formatDate(activity.Date)}
//                       </span>
//                     )}
//                     <span>
//                       {getActivityName(activity, sourceLangKey).substring(
//                         0,
//                         50
//                       )}
//                       {getActivityName(activity, sourceLangKey).length > 50
//                         ? "..."
//                         : ""}
//                     </span>
//                   </div>
//                 </li>
//               ))}
//             </ul>
//             {filteredActivities.length === 0 && (
//               <p className="text-gray-500 text-sm">
//                 No activities found for the selected source language.
//               </p>
//             )}
//           </div>

//           {/* Translation Editor */}
//           <div className="w-2/3">
//             {selected ? (
//               <div>
//                 {/* Activity Info */}
//                 <div className="mb-4 p-3 bg-gray-50 rounded text-sm text-gray-600">
//                   <strong>ID:</strong> {selected.id} | <strong>Date:</strong>{" "}
//                   {formatDate(selected.Date)} | <strong>Video:</strong>{" "}
//                   {selected.url ? "Available" : "Not available"}
//                 </div>

//                 <div className="flex gap-8">
//                   {/* Original Section */}
//                   <div className="flex-1">
//                     <h3 className="text-lg font-semibold mb-2">
//                       Original ({getPlainLangName(sourceLangKey)})
//                     </h3>
//                     <div className="mb-4 font-semibold text-gray-700 p-2 bg-gray-50 rounded">
//                       {getActivityName(selected, sourceLangKey)}
//                     </div>
//                     <textarea
//                       className="w-full h-80 p-2 border rounded bg-gray-100"
//                       readOnly
//                       value={getActivityData(
//                         selected,
//                         LANG_KEYS.find((l) => l.key === sourceLangKey)?.dataKey
//                       )}
//                     />
//                   </div>

//                   {/* Translation Section */}
//                   <div className="flex-1">
//                     <h3 className="text-lg font-semibold mb-2">
//                       Translation ({getPlainLangName(targetLangKey)})
//                     </h3>

//                     {/* Activity Name Editor */}
//                     <div className="mb-4">
//                       <label className="block mb-1 font-medium">
//                         Activity Name
//                       </label>
//                       <textarea
//                         className="w-full h-12 p-2 border rounded"
//                         value={activityNameText}
//                         onChange={(e) => setActivityNameText(e.target.value)}
//                         placeholder={`Enter activity name in ${getPlainLangName(
//                           targetLangKey
//                         )}...`}
//                       />
//                     </div>

//                     {/* Translation Content Editor */}
//                     <textarea
//                       className="w-full h-80 p-2 border rounded"
//                       value={translatedText}
//                       onChange={(e) => setTranslatedText(e.target.value)}
//                       placeholder={`Enter ${getPlainLangName(
//                         targetLangKey
//                       )} translation...`}
//                     />
//                   </div>
//                 </div>
//               </div>
//             ) : (
//               <div className="text-center text-gray-500 py-20">
//                 <p>Select an activity from the list to start translating</p>
//               </div>
//             )}
//           </div>
//         </div>
//       )}

//       {/* Save Button */}
//       {loaded && selected && (
//         <div className="mt-4">
//           <button
//             onClick={handleSave}
//             className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
//             type="button"
//           >
//             Save Translation
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }

// //for advance and future proof TextBased.tsx
// import React, { useEffect, useState } from "react";

// // Language keys:
// // key = ActivityName_XXX column in DB to show in list & headings
// // dataKey = XXX column in DB for textarea content (read-only original or translate)
// const LANG_KEYS = [
//   { label: "English", key: "act_en", dataKey: "English" },
//   { label: "Hindi", key: "act_hi", dataKey: "Hindi" },
//   // Add more languages here as needed:
//   { label: "Telugu", key: "act_te", dataKey: "Telugu" },
//   { label: "Marathi", key: "act_mr", dataKey: "Marathi" },
//   { label: "Gujarati", key: "act_gu", dataKey: "Marathi" },
//   { label: "bengali", key: "act_bn", dataKey: "Marathi" },
// ];

// function getPlainLangName(langKey) {
//   if (langKey.startsWith("act_")) {
//     return langKey.replace("act_", "");
//   }
//   return langKey;
// }

// export default function TextBased() {
//   const [activities, setActivities] = useState([]);
//   const [selected, setSelected] = useState(null);
//   const [translatedText, setTranslatedText] = useState("");
//   const [sourceLangKey, setSourceLangKey] = useState("act_en");
//   const [targetLangKey, setTargetLangKey] = useState("act_hi");
//   const [loaded, setLoaded] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [selectedLink, setSelectedLink] = useState("");
//   const [activityNameText, setActivityNameText] = useState("");
//   const [filterDate, setFilterDate] = useState("");

//   // Helper to get activity name column value for an activity
//   function getActivityName(activity, activityNameKey) {
//     return activity?.[activityNameKey] || "";
//   }

//   // Helper to get data content column value for an activity
//   function getActivityData(activity, dataKey) {
//     return activity?.[dataKey] || "";
//   }
//   useEffect(() => {
//     if (selected && loaded) {
//       const langConfig = LANG_KEYS.find((l) => l.key === targetLangKey);
//       const targetDataKey = langConfig?.dataKey;

//       setActivityNameText(getActivityName(selected, targetLangKey) || "");
//       setTranslatedText(selected[targetDataKey] || "");
//     }
//   }, [targetLangKey, selected, loaded]);

//   const handleLoad = async () => {
//     setLoading(true);
//     try {
//       // const response = await fetch();
//       const response = await fetch(
//         "http://localhost:5000/api/textbased/activities"
//         // "https://api.ayushcms.info/api/textbased/activities"
//       );
//       if (!response.ok)
//         throw new Error(`HTTP error! status: ${response.status}`);
//       const data = await response.json();
//       setActivities(data);
//       setLoaded(true);
//     } catch (err) {
//       console.error("Error loading activities:", err);
//       alert(
//         "Failed to load activities. Please check if the server is running."
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Update translatedText whenever selected or target language changes
//   useEffect(() => {
//     if (selected && loaded) {
//       const targetDataKey = LANG_KEYS.find(
//         (l) => l.key === targetLangKey
//       )?.dataKey;
//       setTranslatedText(selected[targetDataKey] || "");
//     }
//   }, [targetLangKey, selected, loaded]);

//   // Extract YouTube Id helper
//   const extractYouTubeId = (url) => {
//     if (!url) return null;
//     const patterns = [
//       /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
//       /youtube\.com\/live\/([^&\n?#]+)/,
//     ];
//     for (const pattern of patterns) {
//       const match = url.match(pattern);
//       if (match) return match[1];
//     }
//     return null;
//   };

//   const handleSelectActivity = (activity) => {
//     setSelected(activity);
//     const targetDataKey = LANG_KEYS.find(
//       (l) => l.key === targetLangKey
//     )?.dataKey;
//     setTranslatedText(activity[targetDataKey] || "");
//     const youtubeId = extractYouTubeId(activity.url);
//     setSelectedLink(
//       youtubeId ? `https://www.youtube.com/watch?v=${youtubeId}` : ""
//     );
//   };

//   const handleSave = async () => {
//     if (!selected || !translatedText.trim()) {
//       alert("Please select an activity and enter a translation.");
//       return;
//     }

//     const targetDataKey = LANG_KEYS.find(
//       (l) => l.key === targetLangKey
//     )?.dataKey;

//     const payload = {
//       id: selected.id,
//       translated: translatedText,
//       targetLang: LANG_KEYS.find(
//         (l) => l.key === targetLangKey
//       )?.dataKey.toLowerCase(),
//       activityName: activityNameText,
//     };

//     try {
//       const res = await fetch("http://localhost:5000/api/textbased/save", {
//         // const res = await fetch("https://api.ayushcms.info/api/textbased/save", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });
//       if (!res.ok) throw new Error("Save failed");

//       alert("✅ Translation saved successfully");

//       // Refresh activities list to get updated data
//       await handleLoad();

//       // Reset selected with updated data (to refresh translation)
//       const updatedActivity = activities.find((a) => a.id === selected.id);
//       if (updatedActivity) {
//         setSelected(updatedActivity);
//         setTranslatedText(updatedActivity[targetDataKey] || "");
//       }
//     } catch (err) {
//       console.error("Save failed:", err);
//       alert("❌ Failed to save translation");
//     }
//   };

//   // Filter activities with non-empty source language name for listing
//   const filteredActivities = activities.filter((a) => {
//     const sourceName = getActivityName(a, sourceLangKey);
//     return sourceName && sourceName.trim() !== "";
//   });

//   // Format DD-MM-YY to readable date (for UI)
//   const formatDate = (dateString) => {
//     if (!dateString) return "";
//     const [day, month, year] = dateString.split("-");
//     const fullYear = `20${year}`;
//     const date = new Date(`${fullYear}-${month}-${day}`);
//     return date.toLocaleDateString("en-IN");
//   };

//   return (
//     <div className="p-6">
//       <h2 className="text-xl font-bold mb-4">Activity Translation Editor</h2>

//       <div className="flex gap-4 mb-4">
//         {/* Source Language Selector */}
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
//                 setTargetLangKey(fallback.key);
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

//         {/* Target Language Selector */}
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
//         <div>
//           <label className="block font-medium">Filter by Date</label>
//           <input
//             type="date"
//             className="p-2 border rounded"
//             value={filterDate}
//             onChange={(e) => setFilterDate(e.target.value)}
//             max={new Date().toISOString().split("T")[0]} // optional max today
//             placeholder="YYYY-MM-DD"
//           />
//         </div>
//         {/* Load Button */}
//         <button
//           className="mt-6 bg-blue-600 text-white px-5 py-2 rounded disabled:bg-gray-400"
//           onClick={handleLoad}
//           disabled={loading}
//           type="button"
//         >
//           {loading ? "Loading..." : "Load"}
//         </button>
//       </div>

//       {/* YouTube Embed */}
//       {selectedLink && (
//         <div className="mb-4">
//           <h3 className="font-semibold mb-2">Related Video</h3>
//           {/* disabled related video in iframe */}
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

//       {/* Activities List and Translation Editor */}
//       {loaded && (
//         <div className="flex gap-6">
//           {/* Activities List */}
//           <div className="w-1/3">
//             <h3 className="font-semibold mb-2">
//               Activities ({filteredActivities.length})
//             </h3>
//             <ul className="space-y-2 max-h-96 overflow-y-auto">
//               {filteredActivities.map((activity, index) => (
//                 <li
//                   key={activity.id}
//                   className={`p-2 border rounded cursor-pointer ${
//                     selected?.id === activity.id
//                       ? "bg-blue-100"
//                       : "hover:bg-gray-100"
//                   }`}
//                   onClick={() => handleSelectActivity(activity)}
//                   role="button"
//                   tabIndex={0}
//                   onKeyPress={(e) => {
//                     if (e.key === "Enter") handleSelectActivity(activity);
//                   }}
//                 >
//                   <div className="text-sm font-semibold flex items-center gap-2">
//                     {index + 1}.
//                     {activity.Date && (
//                       <span className="text-gray-500 text-sm">
//                         📅 {formatDate(activity.Date)}
//                       </span>
//                     )}{" "}
//                     <span>
//                       {getActivityName(activity, sourceLangKey).substring(
//                         0,
//                         50
//                       )}
//                       {getActivityName(activity, sourceLangKey).length > 50
//                         ? "..."
//                         : ""}
//                     </span>
//                   </div>
//                 </li>
//               ))}
//             </ul>
//             {filteredActivities.length === 0 && (
//               <p className="text-gray-500 text-sm">
//                 No activities found for the selected source language.
//               </p>
//             )}
//           </div>

//           {/* Translation Editor */}
//           <div className="w-2/3">
//             {selected ? (
//               <div>
//                 {/* Activity Info */}
//                 <div className="mb-4 p-3 bg-gray-50 rounded text-sm text-gray-600">
//                   <strong>ID:</strong> {selected.id} | <strong>Date:</strong>{" "}
//                   {formatDate(selected.todate)} |<strong> Video:</strong>{" "}
//                   {selected.url ? "Available" : "Not available"}
//                 </div>

//                 <div className="flex gap-8">
//                   {/* Original Section */}
//                   <div className="flex-1">
//                     <h3 className="text-lg font-semibold mb-2">
//                       {getPlainLangName(sourceLangKey)}
//                     </h3>
//                     <div className="mb-12 font-semibold text-gray-700">
//                       {getActivityName(selected, sourceLangKey)}
//                     </div>
//                     <textarea
//                       className="w-full h-80 p-2 border rounded bg-gray-100"
//                       readOnly
//                       value={getActivityData(
//                         selected,
//                         LANG_KEYS.find((l) => l.key === sourceLangKey)?.dataKey
//                       )}
//                     />
//                   </div>

//                   {/* Translation Section */}

//                   <div className="flex-1">
//                     <h3 className="text-lg font-semibold mb-2">
//                       {getPlainLangName(targetLangKey)}
//                     </h3>

//                     {/* Show the existing activity name for the selected target language */}
//                     <div className="mb-1 font-semibold text-gray-700">
//                       <label className="block mb-1">Activity Name</label>
//                       <textarea
//                         className="w-full h-12 p-2 border rounded"
//                         value={activityNameText}
//                         onChange={(e) => setActivityNameText(e.target.value)}
//                         placeholder={`Edit activity name in ${getPlainLangName(
//                           targetLangKey
//                         )}...`}
//                       />
//                     </div>

//                     {/* Translation input (editable) */}
//                     <textarea
//                       className="w-full h-80 p-2 border rounded"
//                       value={translatedText}
//                       onChange={(e) => setTranslatedText(e.target.value)}
//                       placeholder={`Enter ${getPlainLangName(
//                         targetLangKey
//                       )} translation...`}
//                     />
//                   </div>
//                 </div>
//               </div>
//             ) : (
//               <div className="text-center text-gray-500 py-20">
//                 <p>Select an activity from the list to start translating</p>
//               </div>
//             )}
//           </div>
//         </div>
//       )}

//       {/* Save Button */}
//       {loaded && selected && (
//         <div className="mt-4">
//           <button
//             onClick={handleSave}
//             className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
//             type="button"
//           >
//             Save Translation
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }
