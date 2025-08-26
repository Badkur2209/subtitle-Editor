import React, { useEffect, useState, useMemo } from "react";

const LANG_KEYS = [
  { label: "English", key: "en_1", langId: "english" },
  { label: "Hindi", key: "hi_1", langId: "hindi" },
  { label: "Marathi", key: "mr_1", langId: "marathi" },
  { label: "Gujarati", key: "gu_1", langId: "gujarati" },
  { label: "Bengali", key: "bn_1", langId: "bengali" },
];

const LANGUAGE_COLUMNS_MAP = {
  en_1: ["en_1", "en_2", "en_3", "en_4"],
  hi_1: ["hi_1", "hi_2", "hi_3", "hi_4"],
  mr_1: ["mr_1", "mr_2", "mr_3", "mr_4"],
  gu_1: ["gu_1", "gu_2", "gu_3", "gu_4"],
  bn_1: ["bn_1", "bn_2", "bn_3", "bn_4"],
};

function getPlainLangName(langKey) {
  const lang = LANG_KEYS.find((l) => l.key === langKey);
  return lang ? lang.label : langKey;
}

// // Format date string in format "DD-MM-YY"
// const formatDate = (dateString) => {
//   if (!dateString) return "";
//   const [day, month, year] = dateString.split("-");
//   const fullYear = `20${year}`;
//   const date = new Date(`${fullYear}-${month}-${day}`);
//   return date.toLocaleDateString("en-IN");
// };
// Format date string
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
  lagna_rasi?: string;
  lrname?: string;
  url?: string;
  [key: string]: any;
}

interface LanguageSetItem {
  activity: Activity;
  primaryLangKey: string; // en_1, hi_1, etc. (first column of each language)
  targetLangKey: string; // the corresponding target language first column
}

export default function PredictionsDaily() {
  const [activities, setActivities] = useState([]);
  const [selectedLanguageSet, setSelectedLanguageSet] = useState(null);
  const [sourceLangKey, setSourceLangKey] = useState("en_1");
  const [targetLangKey, setTargetLangKey] = useState("hi_1");
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedLink, setSelectedLink] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [filterLagna, setFilterLagna] = useState("");

  // Store translations for all 4 columns
  const [translationTexts, setTranslationTexts] = useState({
    col1: "",
    col2: "",
    col3: "",
    col4: "",
  });

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

  // Load activities from backend
  const handleLoad = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        "http://localhost:5000/api/predictions/predictions"
        // "https://api.ayushcms.info/api/predictions/predictions"
      );
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setActivities(data);
      setLoaded(true);
    } catch (err) {
      console.error("❌ Error loading activities:", err);
      alert(
        "Failed to load activities. Please check if the server is running."
      );
    } finally {
      setLoading(false);
    }
  };

  // Create list showing only first column of each language (en_1, hi_1, etc.)
  const languageSetList = useMemo(() => {
    const list = [];
    const filterDateObj = filterDate ? new Date(filterDate) : null;

    activities.forEach((activity) => {
      // Apply date filter
      if (filterDateObj && activity.fromdate) {
        const parts = activity.fromdate.split("-");
        if (parts.length === 3) {
          const [day, month, year] = parts;
          const dbDateObj = new Date(`20${year}-${month}-${day}`);
          const matchesDate =
            dbDateObj.getFullYear() === filterDateObj.getFullYear() &&
            dbDateObj.getMonth() === filterDateObj.getMonth() &&
            dbDateObj.getDate() === filterDateObj.getDate();
          if (!matchesDate) return;
        }
      } else if (filterDateObj && !activity.fromdate) {
        return;
      }

      // Apply lagna filter
      if (
        filterLagna &&
        (activity.lagna_rasi || "").toLowerCase() !== filterLagna.toLowerCase()
      ) {
        return;
      }

      // Add entry for each language that has content in first column
      LANG_KEYS.forEach((lang) => {
        const primaryCol = lang.key; // en_1, hi_1, etc.
        if (activity[primaryCol] && activity[primaryCol].trim() !== "") {
          list.push({
            activity,
            primaryLangKey: primaryCol,
            targetLangKey:
              primaryCol === sourceLangKey ? targetLangKey : sourceLangKey,
          });
        }
      });
    });

    return list;
  }, [activities, sourceLangKey, targetLangKey, filterDate, filterLagna]);

  // Handle selection of language set
  const handleSelectLanguageSet = (item) => {
    setSelectedLanguageSet(item);

    // Load all translation texts for the target language
    const targetCols = LANGUAGE_COLUMNS_MAP[item.targetLangKey];
    if (targetCols) {
      setTranslationTexts({
        col1: item.activity[targetCols[0]] || "",
        col2: item.activity[targetCols[1]] || "",
        col3: item.activity[targetCols[2]] || "",
        col4: item.activity[targetCols[3]] || "",
      });
    }

    const youtubeId = extractYouTubeId(item.activity.url);
    setSelectedLink(
      youtubeId ? `https://www.youtube.com/watch?v=${youtubeId}` : ""
    );
  };

  // Update translations when target language changes
  useEffect(() => {
    if (selectedLanguageSet) {
      const targetCols = LANGUAGE_COLUMNS_MAP[targetLangKey];
      if (targetCols) {
        setTranslationTexts({
          col1: selectedLanguageSet.activity[targetCols[0]] || "",
          col2: selectedLanguageSet.activity[targetCols[1]] || "",
          col3: selectedLanguageSet.activity[targetCols[2]] || "",
          col4: selectedLanguageSet.activity[targetCols[3]] || "",
        });
      }
      // Update the target in selected item
      setSelectedLanguageSet((prev) =>
        prev ? { ...prev, targetLangKey } : null
      );
    }
  }, [targetLangKey]);

  // Save all translations
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
      // Save all 4 translations
      const savePromises = [
        { col: targetCols[0], text: translationTexts.col1 },
        { col: targetCols[1], text: translationTexts.col2 },
        { col: targetCols[2], text: translationTexts.col3 },
        { col: targetCols[3], text: translationTexts.col4 },
      ]
        .filter((item) => item.text.trim()) // Only save non-empty translations
        .map((item) =>
          fetch("http://localhost:5000/api/predictions/savePrediction", {
            // fetch("https://api.ayushcms.info/api/predictions/savePrediction", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: selectedLanguageSet.activity.id,
              translated: item.text,
              targetLang: item.col,
            }),
          })
        );

      await Promise.all(savePromises);
      alert("✅ All translations saved successfully!");

      // Refresh data
      await handleLoad();
    } catch (err) {
      console.error("❌ Save failed:", err);
      alert("❌ Failed to save translations");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">
        Prediction Daily Translation Editor
      </h2>

      <div className="flex gap-4 mb-4">
        {/* Source Language */}
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
                if (fallback) setTargetLangKey(fallback.key);
              }
              setSelectedLanguageSet(null);
            }}
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

        {/* Date Filter */}
        <div>
          <label className="block font-medium">Filter by Date</label>
          <input
            type="date"
            className="p-2 border rounded"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            max={new Date().toISOString().split("T")[0]}
          />
        </div>

        {/* Lagna Filter */}
        <div>
          <label className="block font-medium">Filter by Lagna Rasi</label>
          <select
            className="p-2 border rounded"
            value={filterLagna}
            onChange={(e) => setFilterLagna(e.target.value)}
          >
            <option value="">-- All Lagna Rasi --</option>
            {LAGNA_OPTIONS.map((lagna) => (
              <option key={lagna} value={lagna}>
                {lagna}
              </option>
            ))}
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

      {/* YouTube embed */}
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

      {/* Main Content */}
      {loaded && (
        <div className="flex gap-6">
          {/* List */}
          <div className="w-1/3">
            <h3 className="font-semibold mb-2">
              Language Sets ({languageSetList.length})
            </h3>
            {languageSetList.length === 0 && (
              <p className="text-gray-500 text-sm">No predictions found.</p>
            )}
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
                  role="button"
                  tabIndex={0}
                >
                  <div className="text-sm font-semibold flex items-center gap-3 flex-wrap">
                    <span>{idx + 1}.</span>
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
                      {item.activity[item.primaryLangKey]}
                      <small className="ml-1 text-xs text-gray-400">
                        ({item.primaryLangKey})
                      </small>
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Multi-Row Editor */}
          <div className="w-2/3">
            {selectedLanguageSet ? (
              <div>
                <div className="mb-4 p-3 bg-gray-50 rounded text-sm text-gray-600">
                  <strong>ID:</strong> {selectedLanguageSet.activity.id} |
                  <strong> Language Pair:</strong>{" "}
                  {getPlainLangName(sourceLangKey)} →{" "}
                  {getPlainLangName(targetLangKey)}
                </div>

                {/* Multi-row translation grid */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 font-semibold text-lg border-b pb-2">
                    <div>Original ({getPlainLangName(sourceLangKey)})</div>
                    <div>Translation ({getPlainLangName(targetLangKey)})</div>
                  </div>

                  {/* Row 1 */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-gray-50 rounded">
                      <div className="text-sm text-gray-500 mb-1">Column 1</div>
                      <div>
                        {selectedLanguageSet.activity[
                          LANGUAGE_COLUMNS_MAP[sourceLangKey][0]
                        ] || ""}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Column 1</div>
                      <textarea
                        className="w-full h-20 p-2 border rounded"
                        value={translationTexts.col1}
                        onChange={(e) =>
                          setTranslationTexts((prev) => ({
                            ...prev,
                            col1: e.target.value,
                          }))
                        }
                        placeholder="Enter translation..."
                      />
                    </div>
                  </div>

                  {/* Row 2 */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-gray-50 rounded">
                      <div className="text-sm text-gray-500 mb-1">Column 2</div>
                      <div>
                        {selectedLanguageSet.activity[
                          LANGUAGE_COLUMNS_MAP[sourceLangKey][1]
                        ] || ""}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Column 2</div>
                      <textarea
                        className="w-full h-20 p-2 border rounded"
                        value={translationTexts.col2}
                        onChange={(e) =>
                          setTranslationTexts((prev) => ({
                            ...prev,
                            col2: e.target.value,
                          }))
                        }
                        placeholder="Enter translation..."
                      />
                    </div>
                  </div>

                  {/* Row 3 */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-gray-50 rounded">
                      <div className="text-sm text-gray-500 mb-1">Column 3</div>
                      <div>
                        {selectedLanguageSet.activity[
                          LANGUAGE_COLUMNS_MAP[sourceLangKey][2]
                        ] || ""}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Column 3</div>
                      <textarea
                        className="w-full h-20 p-2 border rounded"
                        value={translationTexts.col3}
                        onChange={(e) =>
                          setTranslationTexts((prev) => ({
                            ...prev,
                            col3: e.target.value,
                          }))
                        }
                        placeholder="Enter translation..."
                      />
                    </div>
                  </div>

                  {/* Row 4 */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-gray-50 rounded">
                      <div className="text-sm text-gray-500 mb-1">Column 4</div>
                      <div>
                        {selectedLanguageSet.activity[
                          LANGUAGE_COLUMNS_MAP[sourceLangKey][3]
                        ] || ""}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Column 4</div>
                      <textarea
                        className="w-full h-20 p-2 border rounded"
                        value={translationTexts.col4}
                        onChange={(e) =>
                          setTranslationTexts((prev) => ({
                            ...prev,
                            col4: e.target.value,
                          }))
                        }
                        placeholder="Enter translation..."
                      />
                    </div>
                  </div>
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

      {/* Save Button */}
      {loaded && selectedLanguageSet && (
        <div className="mt-4">
          <button
            onClick={handleSaveAll}
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
            type="button"
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
// ];

// const ENGLISH_COLUMNS = ["en_1", "en_2", "en_3", "en_4"];
// const HINDI_COLUMNS = ["hi_1", "hi_2", "hi_3", "hi_4"];
// const MARATHI_COLUMNS = ["mr_1", "mr_2", "mr_3", "mr_4"];
// const GUJARATI_COLUMNS = ["gu_1", "gu_2", "gu_3", "gu_4"];
// const BENGALI_COLUMNS = ["bn_1", "bn_2", "bn_3", "bn_4"];

// const LANGUAGE_COLUMNS_MAP: Record<string, string[]> = {
//   en_1: ENGLISH_COLUMNS,
//   hi_1: HINDI_COLUMNS,
//   mr_1: MARATHI_COLUMNS,
//   gu_1: GUJARATI_COLUMNS,
//   bn_1: BENGALI_COLUMNS,
// };

// function getPlainLangName(langKey: string): string {
//   const lang = LANG_KEYS.find((l) => l.key === langKey);
//   return lang ? lang.label : langKey;
// }

// // Formats date string in format "DD-MM-YY"
// const formatDate = (dateString: string) => {
//   if (!dateString) return "";
//   const [day, month, year] = dateString.split("-");
//   const fullYear = `20${year}`;
//   const date = new Date(`${fullYear}-${month}-${day}`);
//   return date.toLocaleDateString("en-IN");
// };

// // Extract YouTube video ID helper (various URL formats)
// const extractYouTubeId = (url: string | undefined | null): string | null => {
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
//   lagna_rasi?: string;
//   lrname?: string;
//   url?: string;
//   [key: string]: any;
// }

// interface ExpandedListItem {
//   activity: Activity;
//   langColKey: string; // e.g. "en_1", "en_2"
// }

// export default function PredictionsDaily() {
//   const [activities, setActivities] = useState<Activity[]>([]);
//   const [selectedExpandedItem, setSelectedExpandedItem] =
//     useState<ExpandedListItem | null>(null);
//   const [translatedText, setTranslatedText] = useState("");
//   const [sourceLangKey, setSourceLangKey] = useState("en_1");
//   const [targetLangKey, setTargetLangKey] = useState("hi_1");
//   const [loaded, setLoaded] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [selectedLink, setSelectedLink] = useState("");
//   const [filterDate, setFilterDate] = useState("");
//   const [filterLagna, setFilterLagna] = useState("");

//   // Load activities from backend
//   const handleLoad = async () => {
//     setLoading(true);
//     try {
//       const response = await fetch(
//         "http://localhost:5000/api/predictions/predictions"
//         // "https://api.ayushcms.info/api/predictions/predictions"
//       );

//       if (!response.ok)
//         throw new Error(`HTTP error! status: ${response.status}`);
//       const data = await response.json();
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

//   const expandedList = useMemo(() => {
//     const langCols = LANGUAGE_COLUMNS_MAP[sourceLangKey] || [sourceLangKey];
//     const list = [];

//     const filterDateObj = filterDate ? new Date(filterDate) : null;

//     activities.forEach((activity) => {
//       // Date filter
//       if (filterDateObj && activity.fromdate) {
//         const parts = activity.fromdate.split("-");
//         if (parts.length === 3) {
//           const [day, month, year] = parts;
//           const dbDateObj = new Date(`20${year}-${month}-${day}`);
//           const matchesDate =
//             dbDateObj.getFullYear() === filterDateObj.getFullYear() &&
//             dbDateObj.getMonth() === filterDateObj.getMonth() &&
//             dbDateObj.getDate() === filterDateObj.getDate();
//           if (!matchesDate) return;
//         } else {
//           return;
//         }
//       } else if (filterDateObj && !activity.fromdate) {
//         return;
//       }

//       // Lagna Rasi filter (case insensitive)
//       if (
//         filterLagna &&
//         (activity.lagna_rasi || "").toLowerCase() !== filterLagna.toLowerCase()
//       ) {
//         return;
//       }

//       // Add entries for each non-empty language column
//       langCols.forEach((colKey) => {
//         const val = activity[colKey];
//         if (val && val.trim() !== "") {
//           list.push({ activity, langColKey: colKey });
//         }
//       });
//     });

//     return list;
//   }, [activities, sourceLangKey, filterDate, filterLagna]);

//   // When selectedExpandedItem changes or targetLangKey changes, update translatedText to translation in targetLangKey
//   useEffect(() => {
//     if (selectedExpandedItem && loaded) {
//       const translation = selectedExpandedItem.activity[targetLangKey] || "";
//       setTranslatedText(translation);
//       const youtubeId = extractYouTubeId(selectedExpandedItem.activity.url);
//       setSelectedLink(
//         youtubeId ? `https://www.youtube.com/watch?v=${youtubeId}` : ""
//       );
//     }
//   }, [selectedExpandedItem, targetLangKey, loaded]);

//   // Handle selection of expanded list item
//   const handleSelectExpandedItem = (item: ExpandedListItem) => {
//     setSelectedExpandedItem(item);
//   };

//   // Save translation to targetLangKey for selected activity
//   const handleSave = async () => {
//     if (!selectedExpandedItem || !translatedText.trim()) {
//       alert("Please select an activity column and enter a translation.");
//       return;
//     }

//     const payload = {
//       id: selectedExpandedItem.activity.id,
//       translated: translatedText,
//       targetLang: targetLangKey,
//       // activityName: someEditableNameValue,
//     };

//     try {
//       const res = await fetch(
//         "http://localhost:5000/api/predictions/savePrediction",
//         // "https://api.ayushcms.info/api/predictions/savePrediction",
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify(payload),
//         }
//       );

//       if (!res.ok) throw new Error("Save failed");

//       alert("✅ Translation saved successfully");

//       // Refresh activities to get updated data
//       await handleLoad();

//       // Reset selected item with updated activity data
//       const updatedActivity = activities.find(
//         (a) => a.id === selectedExpandedItem.activity.id
//       );
//       if (updatedActivity) {
//         setSelectedExpandedItem((prev) =>
//           prev
//             ? { activity: updatedActivity, langColKey: prev.langColKey }
//             : null
//         );
//         setTranslatedText(
//           updatedActivity ? updatedActivity[targetLangKey] || "" : ""
//         );
//       }
//     } catch (err) {
//       console.error("❌ Save failed:", err);
//       alert("❌ Failed to save translation");
//     }
//   };

//   return (
//     <div className="p-6">
//       <h2 className="text-xl font-bold mb-4">
//         Prediction Daily Translation Editor
//       </h2>

//       <div className="flex gap-4 mb-4">
//         {/* Source Language */}
//         <div>
//           <label className="block font-medium">Source Language</label>
//           <select
//             className="p-2 border rounded"
//             value={sourceLangKey}
//             onChange={(e) => {
//               const newSource = e.target.value;
//               setSourceLangKey(newSource);

//               // If sourceLang equals targetLang, switch targetLang to fallback
//               if (newSource === targetLangKey) {
//                 const fallback = LANG_KEYS.find((k) => k.key !== newSource);
//                 if (fallback) setTargetLangKey(fallback.key);
//               }
//               // Clear selection on source language change
//               setSelectedExpandedItem(null);
//               setTranslatedText("");
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
//         {/* Date Filter Selector */}
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
//         {/* Lagna Rasi Filter */}
//         <div>
//           <label className="block font-medium">Filter by Lagna Rasi</label>
//           <select
//             className="p-2 border rounded"
//             value={filterLagna}
//             onChange={(e) => setFilterLagna(e.target.value)}
//           >
//             <option value="">-- All Lagna Rasi --</option>
//             <option value="Mesha">Mesha</option>
//             <option value="Vrushabh">Vrushabh</option>
//             <option value="Mithun">Mithun</option>
//             <option value="Kark">Kark</option>
//             <option value="Sinh">Sinh</option>
//             <option value="Kanya">Kanya</option>
//             <option value="Tula">Tula</option>
//             <option value="Vrushik">Vrushik</option>
//             <option value="Dhanu">Dhanu</option>
//             <option value="Makar">Makar</option>
//             <option value="Kumbh">Kumbh</option>
//             <option value="Meen">Meen</option>
//           </select>
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

//       {/* YouTube embed */}
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

//       {/* Activities List */}
//       {loaded && (
//         <div className="flex gap-6">
//           <div className="w-1/3">
//             <h3 className="font-semibold mb-2">
//               Predictions ({expandedList.length})
//             </h3>
//             {expandedList.length === 0 && (
//               <p className="text-gray-500 text-sm">
//                 No predictions found for selected source language.
//               </p>
//             )}
//             <ul className="space-y-2 max-h-96 overflow-y-auto">
//               {expandedList.map((item, idx) => (
//                 <li
//                   key={`${item.activity.id}-${item.langColKey}`}
//                   className={`p-2 border rounded cursor-pointer ${
//                     selectedExpandedItem &&
//                     selectedExpandedItem.activity.id === item.activity.id &&
//                     selectedExpandedItem.langColKey === item.langColKey
//                       ? "bg-blue-100"
//                       : "hover:bg-gray-100"
//                   }`}
//                   onClick={() => handleSelectExpandedItem(item)}
//                   role="button"
//                   tabIndex={0}
//                   onKeyPress={(e) => {
//                     if (e.key === "Enter") handleSelectExpandedItem(item);
//                   }}
//                 >
//                   <div className="text-sm font-semibold flex items-center gap-3 flex-wrap">
//                     <span>{idx + 1}.</span>

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
//                       {item.activity[item.langColKey]}
//                       <small className="ml-1 text-xs text-gray-400">
//                         ({item.langColKey})
//                       </small>
//                     </span>
//                   </div>
//                 </li>
//               ))}
//             </ul>
//           </div>

//           {/* Translation Editor */}
//           <div className="w-2/3">
//             {selectedExpandedItem ? (
//               <div className="flex gap-8">
//                 {/* Original */}
//                 <div className="flex-1">
//                   <h3 className="text-lg font-semibold mb-2">
//                     Original ({getPlainLangName(sourceLangKey)})
//                   </h3>
//                   <textarea
//                     className="w-full h-80 p-2 border rounded bg-gray-100"
//                     readOnly
//                     value={
//                       selectedExpandedItem.activity[
//                         selectedExpandedItem.langColKey
//                       ] || ""
//                     }
//                   />
//                 </div>

//                 {/* Translation */}
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
//                 <p>Select a prediction entry to start translating</p>
//               </div>
//             )}
//           </div>
//         </div>
//       )}

//       {/* Save Button */}
//       {loaded && selectedExpandedItem && (
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
