// PredictionDaily.tsx
import React, { useEffect, useState, useMemo } from "react";
import { API_BASE_URL } from "../utils/config.ts";
import { useAuth } from "@/contexts/AuthContext.tsx";

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

const getStatusColor = (status?: string) => {
  switch (status) {
    case "approved":
      return "bg-green-500";
    case "assigned":
      return "bg-yellow-500";
    case "inreview":
      return "bg-orange-500";
    case "pending":
    default:
      return "bg-red-500";
  }
};

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

export default function PredictionsDaily() {
  const [activities, setActivities] = useState([]);
  const [selectedLanguageSet, setSelectedLanguageSet] = useState(null);
  const [sourceLangKey, setSourceLangKey] = useState("hi_1");
  const [targetLangKey, setTargetLangKey] = useState("en_1");
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedLink, setSelectedLink] = useState("");
  const [filterDate, setFilterDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });
  const [filterLagna, setFilterLagna] = useState("");

  const handleSvgClick = () => {
    // Swap source and target languages
    setSourceLangKey(targetLangKey);
    setTargetLangKey(sourceLangKey);
  };
  const [translationTexts, setTranslationTexts] = useState({});

  const { user } = useAuth();

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
      const response = await fetch(`${API_BASE_URL}/predictions/predictions`);
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();

      // Filter to only assigned_to currentUsername (case-insensitive)
      const filteredData = data.filter(
        (item) =>
          item.assigned_to?.trim().toLowerCase() ===
          user.username.trim().toLowerCase()
      );

      setActivities(filteredData); // or setPredictions(filteredData)
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

  const languageSetList = useMemo(() => {
    const list = [];
    const dateFilter = filterDate ? new Date(filterDate) : null;
    const rasiFilter = filterLagna.trim().toLowerCase();

    activities.forEach((activity) => {
      // 1. Date filter
      if (dateFilter && activity.fromdate) {
        const [day, month, year] = activity.fromdate.split("/");
        const activityDate = new Date(`${year}-${month}-${day}`);
        if (
          activityDate.getFullYear() !== dateFilter.getFullYear() ||
          activityDate.getMonth() !== dateFilter.getMonth() ||
          activityDate.getDate() !== dateFilter.getDate()
        ) {
          return; // skip if dates don't match
        }
      } else if (dateFilter && !activity.fromdate) {
        return; // skip if filter set but no date on activity
      }

      // 2. Rasi (lrname) filter
      if (
        rasiFilter &&
        (activity.lrname || "").trim().toLowerCase() !== rasiFilter
      ) {
        return; // skip if Rasi doesn't match
      }

      // 3. Language existence (unchanged)
      const primaryCol = sourceLangKey;
      if (!activity[primaryCol] || activity[primaryCol].trim() === "") {
        return;
      }

      // Passed all active filters
      list.push({
        activity,
        primaryLangKey: primaryCol,
        targetLangKey,
      });
    });

    return list;
  }, [activities, sourceLangKey, targetLangKey, filterDate, filterLagna]);

  const handleSelectLanguageSet = (item) => {
    setSelectedLanguageSet(item);

    const sourceCols = LANGUAGE_COLUMNS_MAP[sourceLangKey];
    const targetCols = LANGUAGE_COLUMNS_MAP[item.targetLangKey];

    const newTranslations = {};
    sourceCols.forEach((col, idx) => {
      if (item.activity[col] && item.activity[col].trim() !== "") {
        newTranslations[`col${idx + 1}`] = item.activity[targetCols[idx]] || "";
      }
    });

    setTranslationTexts(newTranslations);

    const youtubeId = extractYouTubeId(item.activity.url);
    setSelectedLink(
      youtubeId ? `https://www.youtube.com/watch?v=${youtubeId}` : ""
    );
  };

  useEffect(() => {
    if (selectedLanguageSet) {
      const sourceCols = LANGUAGE_COLUMNS_MAP[sourceLangKey];
      const targetCols = LANGUAGE_COLUMNS_MAP[targetLangKey];

      const updatedTranslations = {};
      sourceCols.forEach((col, idx) => {
        if (
          selectedLanguageSet.activity[col] &&
          selectedLanguageSet.activity[col].trim() !== ""
        ) {
          updatedTranslations[`col${idx + 1}`] =
            selectedLanguageSet.activity[targetCols[idx]] || "";
        }
      });

      setTranslationTexts(updatedTranslations);
      setSelectedLanguageSet((prev) =>
        prev ? { ...prev, targetLangKey } : null
      );
    }
  }, [targetLangKey, sourceLangKey]);

  //   if (!selectedLanguageSet) {
  //     alert("Please select an item first.");
  //     return;
  //   }

  //   const targetCols = LANGUAGE_COLUMNS_MAP[targetLangKey];
  //   if (!targetCols) {
  //     alert("Invalid target language.");
  //     return;
  //   }
  // const handleSaveAll = async () => {
  //   try {
  //     const savePromises = Object.entries(translationTexts)
  //       // .filter(([_, text]) => text.trim())
  //       .map(([key, text]) => {
  //         const index = parseInt(key.replace("col", ""), 10) - 1;

  //         return fetch(
  //           `${API_BASE_URL}/predictions/savePrediction`,
  //           // "http://localhost:5000/api/predictions/savePrediction",
  //           // "https://api.ayushcms.info/api/predictions/savePrediction",

  //           {
  //             method: "POST",
  //             headers: { "Content-Type": "application/json" },
  //             body: JSON.stringify({
  //               id: selectedLanguageSet.activity.id,
  //               translated: text,
  //               targetLang: targetCols[index],
  //               statusCol,
  //               newStatus: "inreview",
  //             }),
  //           }
  //         );
  //       });

  //     await Promise.all(savePromises);
  //     alert("✅ All translations saved successfully!");
  //     await handleLoad();
  //   } catch (err) {
  //     console.error("❌ Save failed:", err);
  //     alert("❌ Failed to save translations");
  //   }
  // };
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
      const savePromises = Object.entries(translationTexts)
        // .filter(([_, text]) => text.trim())
        .map(([key, text]) => {
          const index = parseInt(key.replace("col", ""), 10) - 1;
          const prefix = targetLangKey.split("_")[0];
          const statusCol = `status_${prefix}`;
          return fetch(
            `${API_BASE_URL}/predictions/savePrediction`,

            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                id: selectedLanguageSet.activity.id,
                translated: text,
                targetLang: targetCols[index],
                statusCol,
                newStatus: "inreview",
              }),
            }
          );
        });

      await Promise.all(savePromises);
      alert("✅ All translations saved successfully!");
      await handleLoad();
    } catch (err) {
      console.error("❌ Save failed:", err);
      alert("❌ Failed to save translations");
    }
  };

  const timeStringToSeconds = (timeStr) => {
    if (!timeStr) return 0;
    const parts = timeStr.split(":").map(Number).reverse();
    return parts.reduce((acc, part, i) => acc + part * Math.pow(60, i), 0);
  };
  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">
        Prediction Daily Translation Editor
      </h2>

      {/* Filters and Load */}
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
        <button className="flex items-center">
          <svg
            className="w-6 h-6 text-gray-800 dark:text-white"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 20 18"
            onClick={handleSvgClick}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="m1 14 3-3m-3 3 3 3m-3-3h16v-3m2-7-3 3m3-3-3-3m3 3H3v3"
            ></path>
          </svg>
        </button>
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
          <label className="block font-medium">Rasi</label>
          <select
            className="p-2 border rounded"
            value={filterLagna}
            onChange={(e) => setFilterLagna(e.target.value)}
          >
            <option value=""> Select Rasi</option>
            {LAGNA_OPTIONS.map((lagna) => (
              <option key={lagna} value={lagna}>
                {lagna}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          className="mt-6 bg-red-600 text-white px-5 py-2 rounded disabled:bg-gray-400"
          onClick={() => {
            setFilterDate(""), setFilterLagna("");
          }}
        >
          Clear Filter
        </button>
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
      {selectedLink && selectedLanguageSet && (
        <div className="mb-4">
          <h3 className="font-semibold mb-2">Related Video</h3>
          {(() => {
            const start = timeStringToSeconds(
              selectedLanguageSet.activity.starttime
            );
            const end = timeStringToSeconds(
              selectedLanguageSet.activity.endtime
            );
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
          {/* Left Panel */}
          <div className="w-1/3">
            <h3 className="font-semibold mb-2">
              Language Sets ({languageSetList.length})
            </h3>
            {languageSetList.length === 0 && (
              <p className="text-gray-500 text-sm">No predictions found.</p>
            )}
            <ul className="space-y-2 max-h-96 overflow-y-auto">
              {languageSetList.map((item, idx) => {
                console.log(
                  "==pppp=ppppppppppppppppppppppppppppppppppppppp",
                  languageSetList
                );
                return (
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
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-3 h-3 rounded-full ${getStatusColor(
                            item.activity[
                              `status_${targetLangKey.split("_")[0]}`
                            ]
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
                );
              })}
            </ul>
          </div>

          {/* Editor */}
          <div className="w-2/3">
            {selectedLanguageSet ? (
              <div>
                <div className="mb-4 p-3 bg-gray-50 rounded text-sm text-gray-600">
                  <strong>ID:</strong> {selectedLanguageSet.activity.id} |
                  <strong> Status:</strong>{" "}
                  {selectedLanguageSet.activity.status} |
                  <strong> Language Pair:</strong>{" "}
                  {getPlainLangName(sourceLangKey)} →{" "}
                  {getPlainLangName(targetLangKey)}
                </div>

                {/* Dynamic Translation Rows */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 font-semibold text-lg border-b pb-2">
                    <div>Original ({getPlainLangName(sourceLangKey)})</div>
                    <div>Translation ({getPlainLangName(targetLangKey)})</div>
                  </div>

                  {LANGUAGE_COLUMNS_MAP[sourceLangKey].map((colKey, index) => {
                    const originalText = selectedLanguageSet.activity[colKey];
                    if (!originalText || originalText.trim() === "")
                      return null;

                    return (
                      <div key={colKey} className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-gray-50 rounded">
                          <div className="text-sm text-gray-500 mb-1">
                            Column {index + 1}
                          </div>
                          <div>{originalText}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-500 mb-1">
                            Column {index + 1}
                          </div>
                          <textarea
                            className="w-full h-20 p-2 border rounded"
                            value={translationTexts[`col${index + 1}`] || ""}
                            onChange={(e) =>
                              setTranslationTexts((prev) => ({
                                ...prev,
                                [`col${index + 1}`]: e.target.value,
                              }))
                            }
                            placeholder="Enter translation..."
                          />
                        </div>
                      </div>
                    );
                  })}
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
            type="button"
          >
            Save All Translations
          </button>
        </div>
      )}
    </div>
  );
}
