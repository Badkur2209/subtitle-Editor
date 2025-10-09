// Activities.tsx - Activity Translation Editor Page
import React, { useEffect, useState } from "react";
import { API_BASE_URL } from "../utils/config.ts";
import { useAuth } from "@/contexts/AuthContext.tsx";

// Language config for dropdowns and mappings
const LANG_KEYS = [
  { label: "English", key: "act_en", dataKey: "en", langId: "english" },
  { label: "Hindi", key: "act_hi", dataKey: "hi", langId: "hindi" },
  { label: "Telugu", key: "act_te", dataKey: "te", langId: "telugu" },
  { label: "Marathi", key: "act_mr", dataKey: "mr", langId: "marathi" },
  { label: "Gujarati", key: "act_gu", dataKey: "gu", langId: "gujarati" },
  { label: "Bengali", key: "act_bn", dataKey: "bn", langId: "bengali" },
];

// function getLangStatus(activity, targetLangKey) {
//   const prefix = targetLangKey.split("_")[0]; // "en"
//   return activity[`status_${prefix}`] || "pending";
// }
function getLangStatus(activity, targetLangKey) {
  const prefix = targetLangKey.split("_")[1]; // Changed from [0] to [1]
  return activity[`status_${prefix}`] || "pending";
}
function getPlainLangName(langKey) {
  const lang = LANG_KEYS.find((l) => l.key === langKey);
  return lang ? lang.label : langKey.replace("act_", "");
}

const getStatusColor = (status?: string) => {
  switch (status?.toLowerCase()) {
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
  const { user } = useAuth();
  const handleSvgClick = () => {
    // Swap source and target languages
    setSourceLangKey(targetLangKey);
    setTargetLangKey(sourceLangKey);
  };
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

  const handleLoad = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/activities`);
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();

      // Assuming data.activities is the activities array
      let activitiesArray =
        data.success && data.activities ? data.activities : [];

      // Filter activities where assigned_to matches currentUsername
      const filteredByUser = activitiesArray.filter(
        (activity) => activity.assigned_to === user.username
      );

      setActivities(filteredByUser);
      setLoaded(true);
    } catch (err) {
      console.error("Failed to load activities", err);
      alert("Failed to load activities.");
    } finally {
      setLoading(false);
    }
  };

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
      status: "inreview",
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
        <button className="flex items-center">
          <svg
            className="w-6 h-6 text-gray-800 dark:text-white "
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 20 18"
            //swappping
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
        {/* <div className="flex items-center gap-2 mt-1"> */}
        <div className="block font-medium">
          <div className="text-sm text-gray-600">
            Selected: {new Date(filterDate).toLocaleDateString("en-GB")}
          </div>
          <button
            type="button"
            onClick={() => setFilterDate("")}
            className="mt-1 h-10 text-white bg-gray-500 hover:bg-gray-600 rounded px-5"
          >
            Clear
          </button>
        </div>
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
              {/* {filteredActivities.map((activity, index) => (
                <li
                  key={activity.id}
                  className={`p-2 border rounded cursor-pointer flex item-center justify-between ${
                    selected?.id === activity.id
                      ? "bg-blue-100"
                      : "hover:bg-gray-100"
                  }`}
                  onClick={() => handleSelectActivity(activity)}
                >
                  <div className="flex flex-col text-sm gap-1">
                    <div className="flex item-center gap-2">
                      <span
                        className={`w-3 h-3 rounded-full ${getStatusColor(
                          getLangStatus(activity, targetLangKey)
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
                   
                    <span className="text-xs text-gray-500">
                      {formatDate(activity.Date)}
                    </span>
                  </div>
                </li>
              ))}  */}
              {filteredActivities.map((activity, index) => {
                // ✅ ADD THIS LINE HERE - inside the map function
                const currentStatus = getLangStatus(activity, targetLangKey);

                return (
                  <li
                    key={activity.id}
                    className={`p-2 border rounded cursor-pointer flex item-center justify-between ${
                      selected?.id === activity.id
                        ? "bg-blue-100"
                        : "hover:bg-gray-100"
                    }`}
                    onClick={() => handleSelectActivity(activity)}
                  >
                    <div className="flex flex-col text-sm gap-1">
                      <div className="flex item-center gap-2">
                        <span
                          className={`w-3 h-3 rounded-full ${getStatusColor(
                            currentStatus
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
                      {/* Show date and status */}
                      <div className="flex gap-2">
                        <span className="text-xs text-gray-500">
                          {formatDate(activity.Date)}
                        </span>
                        <span className="text-xs text-gray-500 capitalize">
                          • {currentStatus}
                        </span>
                      </div>
                    </div>
                  </li>
                );
              })}
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
