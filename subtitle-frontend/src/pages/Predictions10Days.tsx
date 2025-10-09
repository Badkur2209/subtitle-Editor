// Prediction10Days.tsx
// Prediction10Days.tsx
import React, { useEffect, useState, useMemo } from "react";
import { API_BASE_URL } from "../utils/config.ts";
import { useAuth } from "@/contexts/AuthContext.tsx";

const LANG_KEYS = [
  { label: "English", key: "en_1" },
  { label: "Hindi", key: "hi_1" },
  { label: "Marathi", key: "mr_1" },
  { label: "Gujarati", key: "gu_1" },
  { label: "Bengali", key: "bn_1" },
  { label: "Telugu", key: "te_1" },
];

function getLangStatus(activity, targetLangKey) {
  const prefix = targetLangKey.split("_")[0]; // "en"
  return activity[`status_${prefix}`] || "pending";
}
function parseDMYDate(dmyStr) {
  if (!dmyStr) return null;
  const parts = dmyStr.split("/");
  if (parts.length !== 3) return null;
  const day = Number(parts[0]);
  const month = Number(parts[1]) - 1; // JS months 0-based
  const year = Number(parts[2]);
  if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
  return new Date(year, month, day);
}
// Prediction10Days.tsx ─ top of file, after parseDMYDate
function parseDate(isoStr: string): Date | null {
  if (!isoStr) return null;
  const [y, m, d] = isoStr.split("-");
  return new Date(Number(y), Number(m) - 1, Number(d));
}

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
  const [sourceLangKey, setSourceLangKey] = useState("hi_1");
  const [targetLangKey, setTargetLangKey] = useState("en_1");
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedLink, setSelectedLink] = useState("");

  // Initialize both dates to today
  const [fromDate, setFromDate] = useState(
    () => new Date().toISOString().split("T")[0]
  );
  const [toDate, setToDate] = useState(fromDate);

  // When fromDate changes, sync toDate if it matched the old fromDate
  const onFromDateChange = (value: string) => {
    setToDate((prev) => (prev === fromDate ? value : prev));
    setFromDate(value);
  };
  const handleSvgClick = () => {
    // Swap source and target languages
    setSourceLangKey(targetLangKey);
    setTargetLangKey(sourceLangKey);
  };
  // Handler for manual toDate changes
  const onToDateChange = (value: string) => {
    setToDate(value);
  };

  const [filterLagna, setFilterLagna] = useState("");

  const [translationTexts, setTranslationTexts] = useState<
    Record<string, string>
  >({});

  const getNonEmptyTranslations = (item: any, langKey: string) => {
    const keys = LANGUAGE_COLUMNS_MAP[langKey] || [];
    return keys.filter((key) => item[key] && item[key].trim() !== "");
  };
  const timeStringToSeconds = (timeStr) => {
    if (!timeStr) return 0;
    const parts = timeStr.split(":").map(Number).reverse();
    return parts.reduce((acc, part, i) => acc + part * Math.pow(60, i), 0);
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
  const { user } = useAuth(); // or useUser()
  // const currentUsername = user?.email;
  const handleLoad = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/predictions/predictions10days`
      );
      const data = await response.json();

      // ✅ Filter predictions based on assigned_to
      const filteredData = data.filter(
        (item) =>
          item.assigned_to?.trim().toLowerCase() ===
          user.username.trim().toLowerCase()
      );

      setActivities(filteredData);
      setLoaded(true);
    } catch (err) {
      console.error("Error loading activities:", err);
      alert("Failed to load activities.");
    } finally {
      setLoading(false);
    }
  };

  const languageSetList = useMemo(() => {
    const list: LanguageSetItem[] = [];

    activities.filter((activity) => activity.assigned_to === user.username);

    const from = parseDate(fromDate);
    const to = parseDate(toDate);

    activities.forEach((activity) => {
      const aFrom = parseDMYDate(activity.fromdate || "");
      const aTo = parseDMYDate(activity.todate || "");

      // 1. Date range filter
      if ((fromDate && !aTo) || (toDate && !aFrom)) return;
      if (fromDate && aTo < from) return;
      if (toDate && aFrom > to) return;

      // 2. Rasi (lrname) filter
      if (filterLagna) {
        const code = (activity.lrname || "").trim().toLowerCase();
        const filt = filterLagna.trim().toLowerCase();
        if (code !== filt) return;
      }

      // 3. Source-language presence
      const primaryCol = sourceLangKey;
      if (!activity[primaryCol] || activity[primaryCol].trim() === "") return;

      // Passed all filters → add to list
      list.push({ activity, primaryLangKey: primaryCol, targetLangKey });
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
          text: translationTexts[col].trim() || "",
        }))
        .map((item) =>
          fetch(
            `${API_BASE_URL}/predictions/savePrediction10days`,
            // "http://localhost:5000/api/predictions/savePrediction10days",
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
            className="p-2 border rounded"
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
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
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

        {/* Date Filters */}
        <div>
          <label className="block font-medium mb-1">From Date</label>
          <input
            type="date"
            className="p-2 border rounded"
            value={fromDate}
            onChange={(e) => onFromDateChange(e.target.value)}
          />
        </div>
        <div>
          <label className="block font-medium mb-1">To Date</label>
          <input
            type="date"
            className="p-2 border rounded"
            value={toDate}
            onChange={(e) => onToDateChange(e.target.value)}
          />
        </div>

        {/* Lagna Filter */}
        <div>
          <label className="block font-medium mb-1">Filter by Lagna</label>
          <select
            className="p-2 border rounded"
            value={filterLagna}
            onChange={(e) => setFilterLagna(e.target.value)}
          >
            <option value=""> All Lagna </option>
            {LAGNA_OPTIONS.map((lagna) => (
              <option key={lagna} value={lagna}>
                {lagna}
              </option>
            ))}
          </select>
        </div>
        <button
          className="mt-7 h-10 text-white bg-gray-500 hover:bg-gray-600 rounded px-5"
          onClick={() => {
            setFromDate("");
            setToDate("");
            setFilterLagna("");
            setSelectedLanguageSet(null);
            setSelectedLink("");
          }}
        >
          Clear Filters
        </button>

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
                          getLangStatus(item.activity, targetLangKey)
                        )}`}
                      />
                      <span>{idx + 1}.</span>
                    </div>
                    {item.activity.fromdate && (
                      <span className="text-gray-500 text-sm">
                        📅 {formatDate(item.activity.fromdate)}
                      </span>
                    )}
                    {/* {item.activity.lrname && (
                      <span className="text-gray-700 text-sm font-medium">
                        {item.activity.lrname}
                      </span>
                    )} */}
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
