//for advance and future proof TextBased.tsx
import React, { useEffect, useState } from "react";

// Language keys:
// key = ActivityName_XXX column in DB to show in list & headings
// dataKey = XXX column in DB for textarea content (read-only original or translate)
const LANG_KEYS = [
  { label: "English", key: "ActivityName_English", dataKey: "English" },
  { label: "Hindi", key: "ActivityName_Hindi", dataKey: "Hindi" },
  // Add more languages here as needed:
  // { label: "Telugu", key: "ActivityName_Telugu", dataKey: "Telugu" },
  // { label: "Marathi", key: "ActivityName_Marathi", dataKey: "Marathi" },
];

function getPlainLangName(langKey) {
  if (langKey.startsWith("ActivityName_")) {
    return langKey.replace("ActivityName_", "");
  }
  return langKey;
}

export default function TextBased() {
  const [activities, setActivities] = useState([]);
  const [selected, setSelected] = useState(null);
  const [translatedText, setTranslatedText] = useState("");
  const [sourceLangKey, setSourceLangKey] = useState("ActivityName_English");
  const [targetLangKey, setTargetLangKey] = useState("ActivityName_Hindi");
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedLink, setSelectedLink] = useState("");

  // Helper to get activity name column value for an activity
  function getActivityName(activity, activityNameKey) {
    return activity?.[activityNameKey] || "";
  }

  // Helper to get data content column value for an activity
  function getActivityData(activity, dataKey) {
    return activity?.[dataKey] || "";
  }

  const handleLoad = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        "http://localhost:5000/api/textbased/activities"
      );
      // const response = await fetch(
      //   "https://api.ayushcms.info/api/textbased/activities");

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setActivities(data);
      setLoaded(true);
    } catch (err) {
      console.error("Error loading activities:", err);
      alert(
        "Failed to load activities. Please check if the server is running."
      );
    } finally {
      setLoading(false);
    }
  };

  // Update translatedText whenever selected or target language changes
  useEffect(() => {
    if (selected && loaded) {
      const targetDataKey = LANG_KEYS.find(
        (l) => l.key === targetLangKey
      )?.dataKey;
      setTranslatedText(selected[targetDataKey] || "");
    }
  }, [targetLangKey, selected, loaded]);

  // Extract YouTube Id helper
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

  const handleSelectActivity = (activity) => {
    setSelected(activity);
    const targetDataKey = LANG_KEYS.find(
      (l) => l.key === targetLangKey
    )?.dataKey;
    setTranslatedText(activity[targetDataKey] || "");
    const youtubeId = extractYouTubeId(activity.url);
    setSelectedLink(
      youtubeId ? `https://www.youtube.com/watch?v=${youtubeId}` : ""
    );
  };

  const handleSave = async () => {
    if (!selected || !translatedText.trim()) {
      alert("Please select an activity and enter a translation.");
      return;
    }

    const targetDataKey = LANG_KEYS.find(
      (l) => l.key === targetLangKey
    )?.dataKey;

    const payload = {
      id: selected.id,
      translated: translatedText,
      targetLang: targetDataKey.toLowerCase(), // like "english" or "hindi"
    };

    try {
      const res = await fetch("http://localhost:5000/api/textbased/save", {
        // const res = await fetch("https://api.ayushcms.info/api/textbased/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Save failed");

      alert("✅ Translation saved successfully");

      // Refresh activities list to get updated data
      await handleLoad();

      // Reset selected with updated data (to refresh translation)
      const updatedActivity = activities.find((a) => a.id === selected.id);
      if (updatedActivity) {
        setSelected(updatedActivity);
        setTranslatedText(updatedActivity[targetDataKey] || "");
      }
    } catch (err) {
      console.error("Save failed:", err);
      alert("❌ Failed to save translation");
    }
  };

  // Filter activities with non-empty source language name for listing
  const filteredActivities = activities.filter((a) => {
    const sourceName = getActivityName(a, sourceLangKey);
    return sourceName && sourceName.trim() !== "";
  });

  // Format DD-MM-YY to readable date (for UI)
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const [day, month, year] = dateString.split("-");
    const fullYear = `20${year}`;
    const date = new Date(`${fullYear}-${month}-${day}`);
    return date.toLocaleDateString("en-IN");
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Activity Translation Editor</h2>

      <div className="flex gap-4 mb-4">
        {/* Source Language Selector */}
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
                setTargetLangKey(fallback.key);
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

        {/* Target Language Selector */}
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

        {/* Load Button */}
        <button
          className="mt-6 bg-blue-600 text-white px-5 py-2 rounded disabled:bg-gray-400"
          onClick={handleLoad}
          disabled={loading}
          type="button"
        >
          {loading ? "Loading..." : "Load"}
        </button>
      </div>

      {/* YouTube Embed */}
      {selectedLink && (
        <div className="mb-4">
          <h3 className="font-semibold mb-2">Related Video</h3>
          {/* disabled related video in iframe */}
          <iframe
            className="w-full h-64 rounded"
            src={`https://www.youtube.com/embed/${extractYouTubeId(
              selectedLink
            )}?rel=0`}
            allowFullScreen
            title="Related Video"
          />
        </div>
      )}

      {/* Activities List and Translation Editor */}
      {loaded && (
        <div className="flex gap-6">
          {/* Activities List */}
          <div className="w-1/3">
            <h3 className="font-semibold mb-2">
              Activities ({filteredActivities.length})
            </h3>
            <ul className="space-y-2 max-h-96 overflow-y-auto">
              {filteredActivities.map((activity, index) => (
                <li
                  key={activity.id}
                  className={`p-2 border rounded cursor-pointer ${
                    selected?.id === activity.id
                      ? "bg-blue-100"
                      : "hover:bg-gray-100"
                  }`}
                  onClick={() => handleSelectActivity(activity)}
                  role="button"
                  tabIndex={0}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") handleSelectActivity(activity);
                  }}
                >
                  <div className="text-sm font-semibold flex items-center gap-2">
                    {index + 1}.
                    {activity.Date && (
                      <span className="text-gray-500 text-sm">
                        📅 {formatDate(activity.Date)}
                      </span>
                    )}{" "}
                    <span>
                      {getActivityName(activity, sourceLangKey).substring(
                        0,
                        50
                      )}
                      {getActivityName(activity, sourceLangKey).length > 50
                        ? "..."
                        : ""}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
            {filteredActivities.length === 0 && (
              <p className="text-gray-500 text-sm">
                No activities found for the selected source language.
              </p>
            )}
          </div>

          {/* Translation Editor */}
          <div className="w-2/3">
            {selected ? (
              <div>
                {/* Activity Info */}
                <div className="mb-4 p-3 bg-gray-50 rounded text-sm text-gray-600">
                  <strong>ID:</strong> {selected.id} | <strong>Date:</strong>{" "}
                  {formatDate(selected.todate)} |<strong> Video:</strong>{" "}
                  {selected.url ? "Available" : "Not available"}
                </div>

                <div className="flex gap-8">
                  {/* Original Section */}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">
                      {getPlainLangName(sourceLangKey)}
                    </h3>
                    <div className="mb-1 font-semibold text-gray-700">
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

                  {/* Translation Section */}

                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">
                      {getPlainLangName(targetLangKey)}
                    </h3>
                    <div className="mb-1 font-semibold text-gray-700">
                      <textarea name="" id="">
                        {getActivityName(selected, targetLangKey)}
                      </textarea>
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

      {/* Save Button */}
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

// the main working one // TextBased.tsx
// import React, { useEffect, useState } from "react";

// function getContentKeyFromActivityNameKey(activityNameKey) {
//   const mapping = {
//     "ActivityName_English": "ActivityName_English",

//     "ActivityName_Hindi": "ActivityName_Hindi",
//     // "ActivityName_Telugu": "ActivityName_Telugu", // Assuming you'll add this
//     // "ActivityName_Marathi": "ActivityName_Marathi",
//   };
//   return mapping[activityNameKey] || "ActivityName_English";
// }

// function getPlainLangName(langKey) {
//   return langKey.startsWith("ActivityName_") ? langKey.replace("ActivityName_", "") : langKey;
// }

// const LANG_KEYS = [
//   { label: "English", key: "ActivityName_English" },
//   { label: "Hindi", key: "ActivityName_Hindi" },
//   // { label: "Telugu", key: "ActivityName_Telugu" }, // Comment out if not available in API
//   // { label: "Marathi", key: "ActivityName_Marathi" },
// ];

// export default function TextBased() {
//   const [activities, setActivities] = useState([]);
//   const [selected, setSelected] = useState(null);
//   const [translatedText, setTranslatedText] = useState("");
//   const [sourceLangKey, setSourceLangKey] = useState("English");
//   const [targetLangKey, setTargetLangKey] = useState("Hindi");
//   const [loaded, setLoaded] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [selectedLink, setSelectedLink] = useState("");

//   const handleLoad = async () => {
//     setLoading(true);
//     try {
//       const response = await fetch("http://localhost:5000/api/textbased/activities");
//       // const response = await fetch("https://api.ayushcms.info/api/textbased/activities");
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }
//       const data = await response.json();
//       console.log("✅ Loaded activities:", data);
//       setActivities(data);
//       setLoaded(true);
//     } catch (err) {
//       console.error("❌ Error loading activities:", err);
//       alert("Failed to load activities. Please check if the server is running.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (selected && loaded) {
//       const targetKey = getContentKeyFromActivityNameKey(targetLangKey);
//       setTranslatedText(selected[targetKey] || "");
//     }
//   }, [targetLangKey, selected, loaded]);

//   const extractYouTubeId = (url) => {
//     if (!url) return null;

//     // Handle different YouTube URL formats
//     const patterns = [
//       /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
//       /youtube\.com\/live\/([^&\n?#]+)/
//     ];

//     for (const pattern of patterns) {
//       const match = url.match(pattern);
//       if (match) return match[1];
//     }
//     return null;
//   };

//   const handleSelectActivity = (activity) => {
//     setSelected(activity);
//     const targetKey = getContentKeyFromActivityNameKey(targetLangKey);
//     setTranslatedText(activity[targetKey] || "");

//     // Set YouTube link for embedding
//     const youtubeId = extractYouTubeId(activity.url);
//     setSelectedLink(youtubeId ? `https://www.youtube.com/watch?v=${youtubeId}` : "");
//   };

//   const handleSave = async () => {
//     if (!selected || !translatedText.trim()) {
//       alert("Please select an activity and enter a translation.");
//       return;
//     }

//     const payload = {
//       id: selected.id,
//       translated: translatedText,
//       targetLang: getPlainLangName(targetLangKey).toLowerCase(),
//     };

//     try {
//       const res = await fetch("http://localhost:5000/api/textbased/save", {
//       // const res = await fetch("https://api.ayushcms.info/api/textbased/save", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });

//       if (!res.ok) throw new Error("Save failed");

//       alert("✅ Translation saved successfully");

//       // Refresh activities to get updated data after saving
//       await handleLoad();

//       // Reset the selected item to refresh translation text from updated data
//       const updatedActivity = activities.find(a => a.id === selected.id);
//       if (updatedActivity) {
//         setSelected(updatedActivity);
//         const targetKey = getContentKeyFromActivityNameKey(targetLangKey);
//         setTranslatedText(updatedActivity[targetKey] || "");
//       }

//     } catch (err) {
//       console.error("❌ Save failed:", err);
//       alert("❌ Failed to save translation");
//     }
//   };

//   const getSourceLangContent = (activity) => {
//     const sourceKey = getContentKeyFromActivityNameKey(sourceLangKey);
//     return activity[sourceKey] || "";
//   };

//   const filteredActivities = activities.filter((a) => {
//     const sourceKey = getContentKeyFromActivityNameKey(sourceLangKey);
//     return a[sourceKey] && a[sourceKey].trim() !== "";
//   });

//   const formatDate = (dateString) => {
//     if (!dateString) return "";
//     // Handle DD-MM-YY format from API
//     const [day, month, year] = dateString.split('-');
//     const fullYear = `20${year}`; // Convert YY to 20YY
//     const date = new Date(`${fullYear}-${month}-${day}`);
//     return date.toLocaleDateString("en-IN");
//   };

//   return (
//     <div className="p-6">
//       <h2 className="text-xl font-bold mb-4">Activity Translation Editor</h2>

//       <div className="flex gap-4 mb-4">
//         {/* Source Language */}
//         <div>
//           <label className="block font-medium">Source Language</label>
//           <select
//             className="p-2 border rounded"
//             value={sourceLangKey}
//             onChange={(e) => {
//               setSourceLangKey(e.target.value);
//               if (e.target.value === targetLangKey) {
//                 const fallback = LANG_KEYS.find((k) => k.key !== e.target.value);
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

//         {/* Target Language */}
//         <div>
//           <label className="block font-medium">Target Language</label>
//           <select
//             className="p-2 border rounded"
//             value={targetLangKey}
//             onChange={(e) => setTargetLangKey(e.target.value)}
//           >
//             {LANG_KEYS.filter((lang) => lang.key !== sourceLangKey).map((lang) => (
//               <option key={lang.key} value={lang.key}>
//                 {lang.label}
//               </option>
//             ))}
//           </select>
//         </div>

//         {/* LOAD Button */}
//         <button
//           className="mt-6 bg-blue-600 text-white px-5 py-2 rounded disabled:bg-gray-400"
//           onClick={handleLoad}
//           disabled={loading}
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
//             src={`https://www.youtube.com/embed/${extractYouTubeId(selectedLink)}`}
//             allowFullScreen
//             title="Related Video"
//           />
//         </div>
//       )}

//       {/* Only show this if loaded */}
//       {loaded && (
//         <div className="flex gap-6">
//           {/* List */}
//           <div className="w-1/3">
//             <h3 className="font-semibold mb-2">Activities ({filteredActivities.length})</h3>
//             <ul className="space-y-2 max-h-96 overflow-y-auto">
//               {filteredActivities.map((activity, index) => (
//                 <li
//                   key={activity.id}
//                   className={`p-2 border rounded cursor-pointer ${
//                     selected?.id === activity.id ? "bg-blue-100" : "hover:bg-gray-100"
//                   }`}
//                   onClick={() => handleSelectActivity(activity)}
//                 >
//                   {/* <div className="text-sm font-semibold">

//                     {index + 1}. {activity.todate && (
//                     <div className="text-sm text-gray-500">📅 {formatDate(activity.todate)}</div>
//                   )} {getSourceLangContent(activity).substring(0, 50)}
//                     {getSourceLangContent(activity).length > 50 ? "..." : ""}
//                   </div> */}
//                   <div className="text-sm font-semibold flex items-center gap-2">
//   {index + 1}.
//   {activity.todate && (
//     <span className="text-gray-500 text-sm">📅 {formatDate(activity.todate)}</span>
//   )}
//   <span>
//     {getSourceLangContent(activity).substring(0, 50)}
//     {getSourceLangContent(activity).length > 50 ? "..." : ""}
//   </span>
// </div>
//                 </li>
//               ))}
//             </ul>
//             {filteredActivities.length === 0 && (
//               <p className="text-gray-500 text-sm">No activities found for the selected source language.</p>
//             )}
//           </div>

//           {/* Translation Editor */}
//           <div className="w-2/3">
//             {selected ? (
//               <div>
//                 {/* Activity Info */}
//                 <div className="mb-4 p-3 bg-gray-50 rounded">
//                   <div className="text-sm text-gray-600">
//                     <strong>ID:</strong> {selected.id} |
//                     <strong> Date:</strong> {formatDate(selected.todate)} |
//                     <strong> Video:</strong> {selected.url ? "Available" : "Not available"}
//                   </div>
//                 </div>

//                 <div className="flex gap-8">
//                   {/* Original Section */}
//                   <div className="flex-1">
//                     <h3 className="text-lg font-semibold mb-2">
//                       Original ({getPlainLangName(sourceLangKey)})
//                     </h3>
//                     {selected?.English && (
//                            <div className="mt-2 p-2 bg-gray-50 border rounded text-sm text-gray-700">
//                           <strong>English:</strong> {selected.English}
//                           </div>
//                           )}
//                     <textarea
//                       className="w-full h-80 p-2 border rounded bg-gray-100"
//                       readOnly
//                       value={getSourceLangContent(selected)}
//                     />
//                   </div>

//                   {/* Translation Section */}
//                   <div className="flex-1">
//                     <h3 className="text-lg font-semibold mb-2">
//                       Translation ({getPlainLangName(targetLangKey)})
//                     </h3>
//                     <textarea
//                       className="w-full h-80 p-2 border rounded"
//                       value={translatedText}
//                       onChange={(e) => setTranslatedText(e.target.value)}
//                       placeholder={`Enter ${getPlainLangName(targetLangKey)} translation...`}
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
//           >
//             Save Translation
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }
