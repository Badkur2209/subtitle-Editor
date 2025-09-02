// Prediction10Days.tsx
// Prediction10Days.tsx
import React, { useEffect, useState, useMemo } from "react";

const LANG_KEYS = [
  { label: "English", key: "en_1" },
  { label: "Hindi", key: "hi_1" },
  { label: "Marathi", key: "mr_1" },
  { label: "Gujarati", key: "gu_1" },
  { label: "Bengali", key: "bn_1" },
  { label: "Telugu", key: "te_1" },
];

const LANGUAGE_COLUMNS_MAP = {
  en_1: ["en_1", "en_2", "en_3", "en_4"],
  hi_1: ["hi_1", "hi_2", "hi_3", "hi_4"],
  mr_1: ["mr_1", "mr_2", "mr_3", "mr_4"],
  gu_1: ["gu_1", "gu_2", "gu_3", "gu_4"],
  bn_1: ["bn_1", "bn_2", "bn_3", "bn_4"],
  te_1: ["te_1", "te_2", "te_3", "te_4"],
};

const getStatusColor = (status?: string) => {
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

function getPlainLangName(langKey) {
  const lang = LANG_KEYS.find((l) => l.key === langKey);
  return lang ? lang.label : langKey;
}

const formatDate = (dateString) => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN");
  } catch {
    return dateString;
  }
};

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

interface Activity {
  id: number;
  fromdate?: string;
  todate?: string;
  lagna_rasi?: string;
  lrname?: string;
  url?: string;
  [key: string]: any;
}

interface LanguageSetItem {
  activity: Activity;
  primaryLangKey: string;
  targetLangKey: string;
}

export default function Prediction10Days() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedLanguageSet, setSelectedLanguageSet] =
    useState<LanguageSetItem | null>(null);
  const [sourceLangKey, setSourceLangKey] = useState("en_1");
  const [targetLangKey, setTargetLangKey] = useState("hi_1");
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedLink, setSelectedLink] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [filterLagna, setFilterLagna] = useState("");

  const [translationTexts, setTranslationTexts] = useState<
    Record<string, string>
  >({});

  const getNonEmptyTranslations = (item: any, langKey: string) => {
    const keys = LANGUAGE_COLUMNS_MAP[langKey] || [];
    return keys.filter((key) => item[key] && item[key].trim() !== "");
  };

  const LAGNA_OPTIONS = [
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

  const handleLoad = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        "http://localhost:5000/api/predictions/predictions10days"
        // "https://api.ayushcms.info/api/predictions/predictions10days"
      );
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setActivities(data);
      setLoaded(true);
    } catch (err) {
      console.error("❌ Error loading activities:", err);
      alert("Failed to load activities.");
    } finally {
      setLoading(false);
    }
  };

  const languageSetList = useMemo(() => {
    const list: LanguageSetItem[] = [];
    activities.forEach((activity) => {
      if (fromDate && toDate) {
        const from = new Date(fromDate);
        const to = new Date(toDate);
        const aFrom = new Date(activity.fromdate || "");
        const aTo = new Date(activity.todate || "");
        if (!(aFrom <= to && aTo >= from)) return;
      }
      if (filterLagna) {
        const actLagna = (activity.lagna_rasi || activity.lrname || "")
          .toLowerCase()
          .trim();
        const filter = filterLagna.toLowerCase().trim();
        if (!(actLagna === filter || actLagna.includes(filter))) return;
      }
      LANG_KEYS.forEach((lang) => {
        const col = lang.key;
        if (activity[col] && activity[col].trim() !== "") {
          list.push({
            activity,
            primaryLangKey: col,
            targetLangKey:
              col === sourceLangKey ? targetLangKey : sourceLangKey,
          });
        }
      });
    });
    return list;
  }, [activities, sourceLangKey, targetLangKey, fromDate, toDate, filterLagna]);

  const handleSelectLanguageSet = (item: LanguageSetItem) => {
    setSelectedLanguageSet(item);
    const targetCols = LANGUAGE_COLUMNS_MAP[item.targetLangKey] || [];
    const translations: Record<string, string> = {};
    targetCols.forEach((col) => {
      translations[col] = item.activity[col] || "";
    });
    setTranslationTexts(translations);

    const youtubeId = extractYouTubeId(item.activity.url);
    setSelectedLink(
      youtubeId ? `https://www.youtube.com/watch?v=${youtubeId}` : ""
    );
  };

  const handleSaveAll = async () => {
    if (!selectedLanguageSet) {
      alert("Please select an item first.");
      return;
    }
    const targetCols = LANGUAGE_COLUMNS_MAP[targetLangKey];
    if (!targetCols) {
      alert("Invalid target language.");
      return;
    }
    try {
      const savePromises = targetCols
        .map((col) => ({
          col,
          text: translationTexts[col] || "",
        }))
        .filter((item) => item.text.trim())
        .map((item) =>
          fetch(
            "http://localhost:5000/api/predictions/savePrediction10days",
            // "https://api.ayushcms.info/api/predictions/savePrediction10days",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                id: selectedLanguageSet.activity.id,
                translated: item.text,
                targetLang: item.col,
              }),
            }
          )
        );
      await Promise.all(savePromises);
      alert("✅ All translations saved successfully!");
      await handleLoad();
    } catch (err) {
      console.error("❌ Save failed:", err);
      alert("❌ Failed to save translations");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">
        Prediction 10 Days Translation Editor
      </h2>

      {/* Filters */}
      <div className="flex gap-4 mb-4">
        {/* Source Language */}
        <div>
          <label className="block font-medium">Source Language</label>
          <select
            className="h-10 w-40 p-2 border rounded"
            value={sourceLangKey}
            onChange={(e) => setSourceLangKey(e.target.value)}
          >
            {LANG_KEYS.map((lang) => (
              <option key={lang.key} value={lang.key}>
                {lang.label}
              </option>
            ))}
          </select>
        </div>

        {/* Target Language */}
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

        {/* Date Filters */}
        <div>
          <label className="block font-medium mb-1">From Date</label>
          <input
            type="date"
            className="p-2 border rounded"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </div>
        <div>
          <label className="block font-medium mb-1">To Date</label>
          <input
            type="date"
            className="p-2 border rounded"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>

        {/* Lagna Filter */}
        <div>
          <label className="block font-medium">Filter by Lagna</label>
          <select
            className="p-2 border rounded"
            value={filterLagna}
            onChange={(e) => setFilterLagna(e.target.value)}
          >
            <option value="">-- All Lagna --</option>
            {LAGNA_OPTIONS.map((lagna) => (
              <option key={lagna} value={lagna}>
                {lagna}
              </option>
            ))}
          </select>
        </div>

        {/* Load Button */}
        <button
          className="mt-7 h-10 text-white bg-blue-700 hover:bg-blue-800 rounded px-5"
          onClick={handleLoad}
          disabled={loading}
        >
          {loading ? "Loading..." : "Load"}
        </button>
      </div>

      {/* YouTube */}
      {selectedLink && (
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
      )}

      {loaded && (
        <div className="flex gap-6">
          {/* List */}
          <div className="w-1/3">
            <h3 className="font-semibold mb-2">
              Language Sets ({languageSetList.length})
            </h3>
            <ul className="space-y-2 max-h-96 overflow-y-auto">
              {languageSetList.map((item, idx) => (
                <li
                  key={`${item.activity.id}-${item.primaryLangKey}`}
                  className={`p-2 border rounded cursor-pointer ${
                    selectedLanguageSet &&
                    selectedLanguageSet.activity.id === item.activity.id &&
                    selectedLanguageSet.primaryLangKey === item.primaryLangKey
                      ? "bg-blue-100"
                      : "hover:bg-gray-100"
                  }`}
                  onClick={() => handleSelectLanguageSet(item)}
                >
                  <div className="text-sm font-semibold flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-3 h-3 rounded-full ${getStatusColor(
                          item.activity.status
                        )}`}
                      />
                      <span>{idx + 1}.</span>
                    </div>
                    {item.activity.fromdate && (
                      <span className="text-gray-500 text-sm">
                        📅 {formatDate(item.activity.fromdate)}
                      </span>
                    )}
                    {item.activity.lagna_rasi && (
                      <span className="text-gray-700 text-sm font-medium">
                        {item.activity.lagna_rasi}
                      </span>
                    )}
                    {item.activity.lrname && (
                      <span className="text-gray-700 text-sm font-medium">
                        {item.activity.lrname}
                      </span>
                    )}
                    <span>
                      {item.activity[item.primaryLangKey]?.substring(0, 40)}
                      {(item.activity[item.primaryLangKey]?.length || 0) > 40
                        ? "..."
                        : ""}
                      <small className="ml-1 text-xs text-gray-400">
                        ({item.primaryLangKey})
                      </small>
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Dynamic Translation Editor */}
          <div className="w-2/3">
            {selectedLanguageSet ? (
              <div>
                <div className="mb-4 p-3 bg-gray-50 rounded text-sm text-gray-600">
                  <strong>ID:</strong> {selectedLanguageSet.activity.id} |{" "}
                  <strong>Status:</strong> {selectedLanguageSet.activity.status}{" "}
                  | <strong>Language Pair:</strong>{" "}
                  {getPlainLangName(sourceLangKey)} →{" "}
                  {getPlainLangName(targetLangKey)} | <strong>From:</strong>{" "}
                  {formatDate(selectedLanguageSet.activity.fromdate)} |{" "}
                  <strong>To:</strong>{" "}
                  {formatDate(selectedLanguageSet.activity.todate)}
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 font-semibold text-lg border-b pb-2">
                    <div>Original ({getPlainLangName(sourceLangKey)})</div>
                    <div>Translation ({getPlainLangName(targetLangKey)})</div>
                  </div>

                  {getNonEmptyTranslations(
                    selectedLanguageSet.activity,
                    sourceLangKey
                  ).map((colKey, idx) => (
                    <div key={colKey} className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-gray-50 rounded">
                        <div className="text-sm text-gray-500 mb-1">
                          Column {idx + 1}
                        </div>
                        <div>{selectedLanguageSet.activity[colKey]}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500 mb-1">
                          Column {idx + 1}
                        </div>
                        <textarea
                          className="w-full h-20 p-2 border rounded"
                          value={
                            translationTexts[
                              LANGUAGE_COLUMNS_MAP[targetLangKey][idx]
                            ] || ""
                          }
                          onChange={(e) =>
                            setTranslationTexts((prev) => ({
                              ...prev,
                              [LANGUAGE_COLUMNS_MAP[targetLangKey][idx]]:
                                e.target.value,
                            }))
                          }
                          placeholder="Enter translation..."
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-20">
                <p>Select a language set from the list to start translating</p>
              </div>
            )}
          </div>
        </div>
      )}

      {loaded && selectedLanguageSet && (
        <div className="mt-4">
          <button
            onClick={handleSaveAll}
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
          >
            Save All Translations
          </button>
        </div>
      )}
    </div>
  );
}

// import React, { useEffect, useState, useMemo } from "react";

// const LANG_KEYS = [
//   { label: "English", key: "en_1" },
//   { label: "Hindi", key: "hi_1" },
//   { label: "Marathi", key: "mr_1" },
//   { label: "Gujarati", key: "gu_1" },
//   { label: "Bengali", key: "bn_1" },
//   { label: "Telugu", key: "te_1" },
// ];

// const LANGUAGE_COLUMNS_MAP = {
//   en_1: ["en_1", "en_2", "en_3", "en_4"],
//   hi_1: ["hi_1", "hi_2", "hi_3", "hi_4"],
//   mr_1: ["mr_1", "mr_2", "mr_3", "mr_4"],
//   gu_1: ["gu_1", "gu_2", "gu_3", "gu_4"],
//   bn_1: ["bn_1", "bn_2", "bn_3", "bn_4"],
//   te_1: ["te_1", "te_2", "te_3", "te_4"],
// };
// const getStatusColor = (status?: string) => {
//   switch (status) {
//     case "completed":
//       return "bg-green-500";
//     case "working":
//       return "bg-yellow-500";
//     case "pending":
//     default:
//       return "bg-red-500";
//   }
// };

// function getPlainLangName(langKey) {
//   const lang = LANG_KEYS.find((l) => l.key === langKey);
//   return lang ? lang.label : langKey;
// }

// // Format date string
// const formatDate = (dateString) => {
//   if (!dateString) return "";
//   try {
//     const date = new Date(dateString);
//     return date.toLocaleDateString("en-IN");
//   } catch {
//     return dateString;
//   }
// };

// const extractYouTubeId = (url) => {
//   if (!url) return null;
//   const patterns = [
//     /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
//     /youtube\.com\/live\/([^&\n?#]+)/,
//   ];
//   for (const pattern of patterns) {
//     const match = url.match(pattern);
//     if (match) return match[1];
//   }
//   return null;
// };

// interface Activity {
//   id: number;
//   fromdate?: string;
//   todate?: string;
//   lagna_rasi?: string;
//   lrname?: string;
//   url?: string;
//   [key: string]: any;
// }

// interface LanguageSetItem {
//   activity: Activity;
//   primaryLangKey: string; // en_1, hi_1, etc.
//   targetLangKey: string;
// }

// export default function Prediction10Days() {
//   const [activities, setActivities] = useState<Activity[]>([]);
//   const [selectedLanguageSet, setSelectedLanguageSet] =
//     useState<LanguageSetItem | null>(null);
//   const [sourceLangKey, setSourceLangKey] = useState("en_1");
//   const [targetLangKey, setTargetLangKey] = useState("hi_1");
//   const [loaded, setLoaded] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [selectedLink, setSelectedLink] = useState("");
//   const [fromDate, setFromDate] = useState("");
//   const [toDate, setToDate] = useState("");
//   const [filterLagna, setFilterLagna] = useState("");

//   // Store translations for all 4 columns
//   const [translationTexts, setTranslationTexts] = useState({
//     col1: "",
//     col2: "",
//     col3: "",
//     col4: "",
//   });
//   const getNonEmptyTranslations = (item: any) => {
//     const translationKeys = [
//       "en_1",
//       "en_2",
//       "en_3",
//       "en_4",
//       "hi_1",
//       "hi_2",
//       "hi_3",
//       "hi_4",
//       "mr_1",
//       "mr_2",
//       "mr_3",
//       "mr_4",
//       "gu_1",
//       "gu_2",
//       "gu_3",
//       "gu_4",
//       "bn_1",
//       "bn_2",
//       "bn_3",
//       "bn_4",
//       "te_1",
//       "te_2",
//       "te_3",
//       "te_4",
//     ];

//     return translationKeys.filter(
//       (key) => item[key] && item[key].trim() !== ""
//     );
//   };

//   const LAGNA_OPTIONS = [
//     "Mesha",
//     "Vrushabh",
//     "Mithun",
//     "Kark",
//     "Sinh",
//     "Kanya",
//     "Tula",
//     "Vrushik",
//     "Dhanu",
//     "Makar",
//     "Kumbh",
//     "Meen",
//   ];

//   // Load activities from backend
//   const handleLoad = async () => {
//     setLoading(true);
//     try {
//       const response = await fetch(
//         "http://localhost:5000/api/predictions/predictions10days"
//         // "https://api.ayushcms.info/api/predictions/predictions10days"
//       );
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }
//       const data = await response.json();
//       console.log("✅ Loaded activities:", data);
//       setActivities(data);
//       setLoaded(true);
//     } catch (err) {
//       console.error("❌ Error loading activities:", err);
//       alert(
//         "Failed to load activities. Please check if the server is running."
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Create list showing only first column of each language
//   const languageSetList = useMemo(() => {
//     const list: LanguageSetItem[] = [];

//     activities.forEach((activity) => {
//       // Apply date range filter
//       if (fromDate && toDate) {
//         const activityDateFrom = new Date(activity.fromdate || "");
//         const activityDateTo = new Date(activity.todate || "");
//         const filterFromDate = new Date(fromDate);
//         const filterToDate = new Date(toDate);

//         const isWithinRange =
//           activityDateFrom <= filterToDate && activityDateTo >= filterFromDate;

//         if (!isWithinRange) return;
//       }

//       // Apply lagna filter
//       if (filterLagna) {
//         const activityLagna = activity.lagna_rasi || activity.lrname || "";

//         // Debug: Log the values to see what we're comparing
//         console.log("Filter:", filterLagna, "Activity lagna:", activityLagna);

//         // Try multiple comparison methods
//         const normalizedFilter = filterLagna.toLowerCase().trim();
//         const normalizedActivity = activityLagna.toLowerCase().trim();

//         // Check for exact match or partial match
//         const matches =
//           normalizedActivity === normalizedFilter ||
//           normalizedActivity.includes(normalizedFilter) ||
//           normalizedFilter.includes(normalizedActivity);

//         if (!matches) {
//           return;
//         }
//       }

//       // Add entry for each language that has content in first column
//       LANG_KEYS.forEach((lang) => {
//         const primaryCol = lang.key;
//         if (activity[primaryCol] && activity[primaryCol].trim() !== "") {
//           list.push({
//             activity,
//             primaryLangKey: primaryCol,
//             targetLangKey:
//               primaryCol === sourceLangKey ? targetLangKey : sourceLangKey,
//           });
//         }
//       });
//     });

//     return list;
//   }, [activities, sourceLangKey, targetLangKey, fromDate, toDate, filterLagna]);

//   // Handle selection of language set
//   const handleSelectLanguageSet = (item: LanguageSetItem) => {
//     setSelectedLanguageSet(item);

//     // Load all translation texts for the target language
//     const targetCols = LANGUAGE_COLUMNS_MAP[item.targetLangKey];
//     if (targetCols) {
//       setTranslationTexts({
//         col1: item.activity[targetCols[0]] || "",
//         col2: item.activity[targetCols[1]] || "",
//         col3: item.activity[targetCols[2]] || "",
//         col4: item.activity[targetCols[3]] || "",
//       });
//     }

//     const youtubeId = extractYouTubeId(item.activity.url);
//     setSelectedLink(
//       youtubeId ? `https://www.youtube.com/watch?v=${youtubeId}` : ""
//     );
//   };

//   // Update translations when target language changes
//   useEffect(() => {
//     if (selectedLanguageSet) {
//       const targetCols = LANGUAGE_COLUMNS_MAP[targetLangKey];
//       if (targetCols) {
//         setTranslationTexts({
//           col1: selectedLanguageSet.activity[targetCols[0]] || "",
//           col2: selectedLanguageSet.activity[targetCols[1]] || "",
//           col3: selectedLanguageSet.activity[targetCols[2]] || "",
//           col4: selectedLanguageSet.activity[targetCols[3]] || "",
//         });
//       }
//       setSelectedLanguageSet((prev) =>
//         prev ? { ...prev, targetLangKey } : null
//       );
//     }
//   }, [targetLangKey]);

//   // Save all translations
//   const handleSaveAll = async () => {
//     if (!selectedLanguageSet) {
//       alert("Please select an item first.");
//       return;
//     }

//     const targetCols = LANGUAGE_COLUMNS_MAP[targetLangKey];
//     if (!targetCols) {
//       alert("Invalid target language.");
//       return;
//     }

//     try {
//       // Save all 4 translations
//       const savePromises = [
//         { col: targetCols[0], text: translationTexts.col1 },
//         { col: targetCols[1], text: translationTexts.col2 },
//         { col: targetCols[2], text: translationTexts.col3 },
//         { col: targetCols[3], text: translationTexts.col4 },
//       ]
//         .filter((item) => item.text.trim()) // Only save non-empty translations
//         .map((item) =>
//           fetch(
//             "http://localhost:5000/api/predictions/savePrediction10days",
//             // "https://api.ayushcms.info/api/predictions/savePrediction10days",
//             {
//               method: "POST",
//               headers: { "Content-Type": "application/json" },
//               body: JSON.stringify({
//                 id: selectedLanguageSet.activity.id,
//                 translated: item.text,
//                 targetLang: item.col,
//               }),
//             }
//           )
//         );

//       await Promise.all(savePromises);
//       alert("✅ All translations saved successfully!");

//       // Refresh data
//       await handleLoad();
//     } catch (err) {
//       console.error("❌ Save failed:", err);
//       alert("❌ Failed to save translations");
//     }
//   };

//   return (
//     <div className="p-6">
//       <h2 className="text-xl font-bold mb-4">
//         Prediction 10 Days Translation Editor
//       </h2>

//       <div className="flex gap-4 mb-4">
//         {/* Source Language */}
//         <div>
//           <label className="block font-medium">Source Language</label>
//           <select
//             className="h-10 w-40 p-2 border rounded"
//             value={sourceLangKey}
//             onChange={(e) => {
//               const newSource = e.target.value;
//               setSourceLangKey(newSource);
//               if (newSource === targetLangKey) {
//                 const fallback = LANG_KEYS.find((k) => k.key !== newSource);
//                 setTargetLangKey(fallback?.key || "hi_1");
//               }
//               // setSelectedLanguageSet(null);
//               {
//                 getNonEmptyTranslations(selectedLanguageSet).map((key) => (
//                   <div key={key} className="mb-2 p-2 bg-gray-50 rounded">
//                     <strong>{key.toUpperCase()}:</strong>{" "}
//                     {selectedLanguageSet[key]}
//                   </div>
//                 ));
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
//             {LANG_KEYS.filter((lang) => lang.key !== sourceLangKey).map(
//               (lang) => (
//                 <option key={lang.key} value={lang.key}>
//                   {lang.label}
//                 </option>
//               )
//             )}
//           </select>
//         </div>

//         {/* From Date */}
//         <div>
//           <label className="block font-medium mb-1">From Date</label>
//           <input
//             type="date"
//             className="p-2 border rounded"
//             value={fromDate}
//             onChange={(e) => setFromDate(e.target.value)}
//           />
//         </div>

//         {/* To Date */}
//         <div>
//           <label className="block font-medium mb-1">To Date</label>
//           <input
//             type="date"
//             className="p-2 border rounded w-full"
//             value={toDate}
//             onChange={(e) => setToDate(e.target.value)}
//           />
//         </div>

//         {/* Lagna Rasi Filter */}
//         <div>
//           <label className="block font-medium">Filter by Lagna</label>
//           <select
//             className="p-2 border rounded"
//             value={filterLagna}
//             onChange={(e) => setFilterLagna(e.target.value)}
//           >
//             <option value="">-- All Lagna --</option>
//             {LAGNA_OPTIONS.map((lagna) => (
//               <option key={lagna} value={lagna}>
//                 {lagna}
//               </option>
//             ))}
//           </select>
//         </div>

//         {/* Load Button */}
//         <button
//           className="mt-7 h-10 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-1 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800 w-auto"
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
//             src={`https://www.youtube.com/embed/${extractYouTubeId(
//               selectedLink
//             )}?rel=0`}
//             allowFullScreen
//             title="Related Video"
//           />
//         </div>
//       )}

//       {/* Main Content */}
//       {loaded && (
//         <div className="flex gap-6">
//           {/* List */}
//           <div className="w-1/3">
//             <h3 className="font-semibold mb-2">
//               Language Sets ({languageSetList.length})
//             </h3>
//             {languageSetList.length === 0 && (
//               <p className="text-gray-500 text-sm">No predictions found.</p>
//             )}
//             <ul className="space-y-2 max-h-96 overflow-y-auto">
//               {languageSetList.map((item, idx) => (
//                 <li
//                   key={`${item.activity.id}-${item.primaryLangKey}`}
//                   className={`p-2 border rounded cursor-pointer ${
//                     selectedLanguageSet &&
//                     selectedLanguageSet.activity.id === item.activity.id &&
//                     selectedLanguageSet.primaryLangKey === item.primaryLangKey
//                       ? "bg-blue-100"
//                       : "hover:bg-gray-100"
//                   }`}
//                   onClick={() => handleSelectLanguageSet(item)}
//                   role="button"
//                   tabIndex={0}
//                 >
//                   <div className="text-sm font-semibold flex items-center gap-3 flex-wrap">
//                     <div className="flex items-center gap-2">
//                       <span
//                         className={`w-3 h-3 rounded-full ${getStatusColor(
//                           item.activity.status
//                         )}`}
//                       />
//                       <span>{idx + 1}.</span>
//                     </div>
//                     {item.activity.fromdate && (
//                       <span className="text-gray-500 text-sm">
//                         📅 {formatDate(item.activity.fromdate)}
//                       </span>
//                     )}
//                     {item.activity.lagna_rasi && (
//                       <span className="text-gray-700 text-sm font-medium">
//                         {item.activity.lagna_rasi}
//                       </span>
//                     )}
//                     {item.activity.lrname && (
//                       <span className="text-gray-700 text-sm font-medium">
//                         {item.activity.lrname}
//                       </span>
//                     )}
//                     <span>
//                       {item.activity[item.primaryLangKey]?.substring(0, 40)}
//                       {(item.activity[item.primaryLangKey]?.length || 0) > 40
//                         ? "..."
//                         : ""}
//                       <small className="ml-1 text-xs text-gray-400">
//                         ({item.primaryLangKey})
//                       </small>
//                     </span>
//                   </div>
//                 </li>
//               ))}
//             </ul>
//           </div>

//           {/* Multi-Row Translation Editor */}
//           <div className="w-2/3">
//             {selectedLanguageSet ? (
//               <div>
//                 <div className="mb-4 p-3 bg-gray-50 rounded text-sm text-gray-600">
//                   <strong>ID:</strong> {selectedLanguageSet.activity.id} |
//                   <strong> Language Pair:</strong>{" "}
//                   {getPlainLangName(sourceLangKey)} →{" "}
//                   {getPlainLangName(targetLangKey)} |<strong> From:</strong>{" "}
//                   {formatDate(selectedLanguageSet.activity.fromdate)} |
//                   <strong> To:</strong>{" "}
//                   {formatDate(selectedLanguageSet.activity.todate)}
//                 </div>

//                 {/* Multi-row translation grid */}
//                 <div className="space-y-4">
//                   <div className="grid grid-cols-2 gap-4 font-semibold text-lg border-b pb-2">
//                     <div>Original ({getPlainLangName(sourceLangKey)})</div>
//                     <div>Translation ({getPlainLangName(targetLangKey)})</div>
//                   </div>

//                   {/* Row 1 */}
//                   <div className="grid grid-cols-2 gap-4">
//                     <div className="p-3 bg-gray-50 rounded">
//                       <div className="text-sm text-gray-500 mb-1">Column 1</div>
//                       <div>
//                         {selectedLanguageSet.activity[
//                           LANGUAGE_COLUMNS_MAP[sourceLangKey][0]
//                         ] || ""}
//                       </div>
//                     </div>
//                     <div>
//                       <div className="text-sm text-gray-500 mb-1">Column 1</div>
//                       <textarea
//                         className="w-full h-20 p-2 border rounded"
//                         value={translationTexts.col1}
//                         onChange={(e) =>
//                           setTranslationTexts((prev) => ({
//                             ...prev,
//                             col1: e.target.value,
//                           }))
//                         }
//                         placeholder="Enter translation..."
//                       />
//                     </div>
//                   </div>

//                   {/* Row 2 */}
//                   <div className="grid grid-cols-2 gap-4">
//                     <div className="p-3 bg-gray-50 rounded">
//                       <div className="text-sm text-gray-500 mb-1">Column 2</div>
//                       <div>
//                         {selectedLanguageSet.activity[
//                           LANGUAGE_COLUMNS_MAP[sourceLangKey][1]
//                         ] || ""}
//                       </div>
//                     </div>
//                     <div>
//                       <div className="text-sm text-gray-500 mb-1">Column 2</div>
//                       <textarea
//                         className="w-full h-20 p-2 border rounded"
//                         value={translationTexts.col2}
//                         onChange={(e) =>
//                           setTranslationTexts((prev) => ({
//                             ...prev,
//                             col2: e.target.value,
//                           }))
//                         }
//                         placeholder="Enter translation..."
//                       />
//                     </div>
//                   </div>

//                   {/* Row 3 */}
//                   <div className="grid grid-cols-2 gap-4">
//                     <div className="p-3 bg-gray-50 rounded">
//                       <div className="text-sm text-gray-500 mb-1">Column 3</div>
//                       <div>
//                         {selectedLanguageSet.activity[
//                           LANGUAGE_COLUMNS_MAP[sourceLangKey][2]
//                         ] || ""}
//                       </div>
//                     </div>
//                     <div>
//                       <div className="text-sm text-gray-500 mb-1">Column 3</div>
//                       <textarea
//                         className="w-full h-20 p-2 border rounded"
//                         value={translationTexts.col3}
//                         onChange={(e) =>
//                           setTranslationTexts((prev) => ({
//                             ...prev,
//                             col3: e.target.value,
//                           }))
//                         }
//                         placeholder="Enter translation..."
//                       />
//                     </div>
//                   </div>

//                   {/* Row 4 */}
//                   <div className="grid grid-cols-2 gap-4">
//                     <div className="p-3 bg-gray-50 rounded">
//                       <div className="text-sm text-gray-500 mb-1">Column 4</div>
//                       <div>
//                         {selectedLanguageSet.activity[
//                           LANGUAGE_COLUMNS_MAP[sourceLangKey][3]
//                         ] || ""}
//                       </div>
//                     </div>
//                     <div>
//                       <div className="text-sm text-gray-500 mb-1">Column 4</div>
//                       <textarea
//                         className="w-full h-20 p-2 border rounded"
//                         value={translationTexts.col4}
//                         onChange={(e) =>
//                           setTranslationTexts((prev) => ({
//                             ...prev,
//                             col4: e.target.value,
//                           }))
//                         }
//                         placeholder="Enter translation..."
//                       />
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             ) : (
//               <div className="text-center text-gray-500 py-20">
//                 <p>Select a language set from the list to start translating</p>
//               </div>
//             )}
//           </div>
//         </div>
//       )}

//       {/* Save Button */}
//       {loaded && selectedLanguageSet && (
//         <div className="mt-4">
//           <button
//             onClick={handleSaveAll}
//             className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
//           >
//             Save All Translations
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }

// import React, { useEffect, useState } from "react";

// function getContentKeyFromActivityNameKey(activityNameKey) {
//   if (activityNameKey.startsWith("ActivityName_")) {
//     return activityNameKey.replace("ActivityName_", "").toLowerCase();
//   }
//   return activityNameKey.toLowerCase();
// }

// function getActivityData(activity, key) {
//   return activity?.[key] || "";
// }

// function getPlainLangName(key) {
//   const found = LANG_KEYS.find((l) => l.key === key);
//   return found ? found.label : key;
// }

// const LANG_KEYS = [
//   { label: "English", key: "en_1" },
//   { label: "Hindi", key: "hi_1" },
//   { label: "Marathi", key: "mr_1" },
//   { label: "Gujarati", key: "gu_1" },
//   { label: "bengali", key: "bn_1" },
//   { label: "telugu", key: "te_1" },
//   // Add more as needed: { label: "English 2", key: "en_2" }, ...
// ];

// export default function Prediction10Days() {
//   const [activities, setActivities] = useState([]);
//   const [selected, setSelected] = useState(null);
//   const [translatedText, setTranslatedText] = useState("");
//   const [sourceLangKey, setSourceLangKey] = useState("en_1");
//   const [targetLangKey, setTargetLangKey] = useState("hi_1");
//   const [loaded, setLoaded] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [selectedLink, setSelectedLink] = useState("");

//   const [fromDate, setFromDate] = useState("");
//   const [toDate, setToDate] = useState("");

//   const handleLoad = async () => {
//     setLoading(true);
//     try {
//       // const response = await fetch();
//       const response = await fetch(
//         "http://localhost:5000/api/predictions/predictions10days"
//         // "https://api.ayushcms.info/api/predictions/prediction10days"
//       );
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }
//       const data = await response.json();
//       console.log("✅ Loaded activities:", data);
//       setActivities(data);
//       setLoaded(true);
//     } catch (err) {
//       console.error("❌ Error loading activities:", err);
//       alert(
//         "Failed to load activities. Please check if the server is running."
//       );
//     } finally {
//       setLoading(false);
//     }
//   };
//   useEffect(() => {
//     if (selected && loaded) {
//       setTranslatedText(getActivityData(selected, targetLangKey));
//     }
//   }, [targetLangKey, selected, loaded]);

//   const handleSelectActivity = (activity) => {
//     setSelected(activity);
//     const targetKey = getContentKeyFromActivityNameKey(targetLangKey);
//     setTranslatedText(activity[targetKey] || "");
//     const youtubeId = extractYouTubeId(activity.url);
//     setSelectedLink(
//       youtubeId ? `https://www.youtube.com/watch?v=${youtubeId}` : ""
//     );
//   };

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

//   const handleSave = async () => {
//     if (!selected || !translatedText.trim()) {
//       alert("Please select an activity and enter a translation.");
//       return;
//     }

//     const payload = {
//       id: selected.id,
//       translated: translatedText,
//       targetLang: targetLangKey, // like "hi_1", "en_1", etc.
//     };
//     try {
//       const res = await fetch(
//         "http://localhost:5000/api/predictions/savePrediction10days",
//         // "https://api.ayushcms.info/api/predictions/savePrediction10days",
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify(payload),
//         }
//       );

//       if (!res.ok) throw new Error("Save failed");

//       alert("✅ Translation saved successfully");

//       // Refresh activities to get updated data after saving
//       await handleLoad();

//       // Reset the selected item to refresh translation text from updated data
//       const updatedActivity = activities.find((a) => a.id === selected.id);
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

//   //  const filteredActivities = activities.filter(a => getActivityData(a, sourceLangKey).trim() !== "");
//   const filteredActivities = activities.filter((a) => {
//     // Get source language content for text filtering (your previous filter)
//     const sourceContent = getSourceLangContent(a);
//     if (!sourceContent || sourceContent.trim() === "") return false;

//     // Check date range filter only if both dates provided
//     if (fromDate && toDate) {
//       // Convert activity's date fields to Date objects for comparison
//       // Adjust the field names and formats as per your data, e.g.:
//       const activityDateFrom = new Date(a.fromdate);
//       const activityDateTo = new Date(a.todate);

//       // Convert filter dates to Date too
//       const filterFromDate = new Date(fromDate);
//       const filterToDate = new Date(toDate);

//       // Check if activity range overlaps with the filter range
//       // This example includes activities that start, end or overlap within the filter range
//       const isWithinRange =
//         activityDateFrom <= filterToDate && activityDateTo >= filterFromDate;

//       if (!isWithinRange) return false;
//     }

//     return true;
//   });

//   const formatDate = (ms) => {
//     const date = new Date(Number(ms));
//     return date.toLocaleDateString("en-IN");
//   };

//   return (
//     <div className="p-6">
//       <h2 className="text-xl font-bold mb-4">
//         prediction 10 days Translation Editor
//       </h2>

//       <div className="flex gap-4 mb-4">
//         {/* Source Language */}
//         <div>
//           <label className="block font-medium">Source Language</label>
//           <select
//             className="h-10 w-40 p-2 border rounded"
//             value={sourceLangKey}
//             onChange={(e) => {
//               setSourceLangKey(e.target.value);
//               if (e.target.value === targetLangKey) {
//                 const fallback = LANG_KEYS.find(
//                   (k) => k.key !== e.target.value
//                 );
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
//             {LANG_KEYS.filter((lang) => lang.key !== sourceLangKey).map(
//               (lang) => (
//                 <option key={lang.key} value={lang.key}>
//                   {lang.label}
//                 </option>
//               )
//             )}
//           </select>
//         </div>

//         {/* From Date */}
//         <div>
//           <label className="block font-medium mb-1">From Date</label>
//           <input
//             type="date"
//             className="p-2 border rounded"
//             value={fromDate}
//             onChange={(e) => setFromDate(e.target.value)}
//           />
//         </div>

//         {/* To Date */}
//         <div>
//           <label className="block font-medium mb-1">To Date</label>
//           <input
//             type="date"
//             className="p-2 border rounded w-full"
//             value={toDate}
//             onChange={(e) => setToDate(e.target.value)}
//           />
//         </div>

//         {/* LOAD Button */}
//         <button
//           className="mt-7 h-10 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-1 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800 w-auto"
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
//       {/* Only show this if loaded */}
//       {loaded && (
//         <div className="flex gap-6">
//           {/* List */}
//           <div className="w-1/3">
//             <h3 className="font-semibold mb-2">
//               predictions ({filteredActivities.length})
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
//                 >
//                   <div className="text-sm font-semibold">
//                     {index + 1}.
//                     {getSourceLangContent(activity).substring(0, 50)}
//                     {getSourceLangContent(activity).length > 50 ? "..." : ""}
//                   </div>
//                   {/* {activity.date && (
//                   <div className="text-sm text-gray-500">📅 {activity.date}</div>
//                   )} */}
//                 </li>
//               ))}
//             </ul>
//             {filteredActivities.length === 0 && (
//               <p className="text-gray-500 text-sm">
//                 No precdiction found for the selected source language.
//               </p>
//             )}
//           </div>

//           {/* Translation Editor */}
//           <div className="w-2/3">
//             {selected ? (
//               <div className="flex gap-8">
//                 {/* Original Section */}
//                 <div className="flex-1">
//                   <h3 className="text-lg font-semibold mb-2">
//                     Original ({getPlainLangName(sourceLangKey)})
//                   </h3>
//                   <textarea
//                     className="w-full h-80 p-2 border rounded bg-gray-100"
//                     readOnly
//                     value={getActivityData(selected, sourceLangKey)}
//                   />
//                 </div>

//                 {/* Translation Section */}
//                 <div className="flex-1">
//                   <h3 className="text-lg font-semibold mb-2">
//                     Translation ({getPlainLangName(targetLangKey)})
//                   </h3>
//                   <textarea
//                     className="w-full h-80 p-2 border rounded"
//                     value={translatedText}
//                     onChange={(e) => setTranslatedText(e.target.value)}
//                     placeholder={`Enter ${getPlainLangName(
//                       targetLangKey
//                     )} translation...`}
//                   />
//                 </div>
//               </div>
//             ) : (
//               <div className="text-center text-gray-500 py-20">
//                 <p>Select an precdiction from the list to start translating</p>
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
