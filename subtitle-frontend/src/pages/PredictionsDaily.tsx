import React, { useEffect, useState } from "react";

function getContentKeyFromActivityNameKey(activityNameKey) {
  if (activityNameKey.startsWith("ActivityName_")) {
    return activityNameKey.replace("ActivityName_", "").toLowerCase();
  }
  return activityNameKey.toLowerCase();
}

function getPlainLangName(langKey) {
  return langKey.startsWith("ActivityName_") ? langKey.replace("ActivityName_", "") : langKey;
}

const LANG_KEYS = [
  { label: "English", key: "ActivityName_English" },
  { label: "Hindi", key: "ActivityName_Hindi" },
  { label: "Telugu", key: "ActivityName_Telugu" },
  { label: "Marathi", key: "ActivityName_Marathi" },
];

export default function TextBased() {
  const [activities, setActivities] = useState([]);
  const [selected, setSelected] = useState(null);
  const [translatedText, setTranslatedText] = useState("");
  const [sourceLangKey, setSourceLangKey] = useState("ActivityName_English");
  const [targetLangKey, setTargetLangKey] = useState("ActivityName_Hindi");
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLoad = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/textbased/activities");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log("✅ Loaded activities:", data);
      setActivities(data);
      setLoaded(true);
    } catch (err) {
      console.error("❌ Error loading activities:", err);
      alert("Failed to load activities. Please check if the server is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selected && loaded) {
      const targetKey = getContentKeyFromActivityNameKey(targetLangKey);
      setTranslatedText(selected[targetKey] || "");
    }
  }, [targetLangKey, selected, loaded]);

  const handleSelectActivity = (activity) => {
    setSelected(activity);
    const targetKey = getContentKeyFromActivityNameKey(targetLangKey);
    setTranslatedText(activity[targetKey] || "");
  };

  const handleSave = async () => {
    if (!selected || !translatedText.trim()) {
      alert("Please select an activity and enter a translation.");
      return;
    }

    const payload = {
      id: selected.id,
      translated: translatedText,
      targetLang: getPlainLangName(targetLangKey).toLowerCase(),
    };

    try {
      const res = await fetch("http://localhost:5000/api/textbased/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Save failed");

      alert("✅ Translation saved successfully");
      
      // Refresh activities to get updated data after saving 
      await handleLoad();

      // Reset the selected item to refresh translation text from updated data
      const updatedActivity = activities.find(a => a.id === selected.id);
      if (updatedActivity) {
        setSelected(updatedActivity);
        const targetKey = getContentKeyFromActivityNameKey(targetLangKey);
        setTranslatedText(updatedActivity[targetKey] || "");
      }
      
    } catch (err) {
      console.error("❌ Save failed:", err);
      alert("❌ Failed to save translation");
    }
  };

  const getSourceLangContent = (activity) => {
    const sourceKey = getContentKeyFromActivityNameKey(sourceLangKey);
    return activity[sourceKey] || "";
  };

  const filteredActivities = activities.filter((a) => {
    const sourceKey = getContentKeyFromActivityNameKey(sourceLangKey);
    return a[sourceKey] && a[sourceKey].trim() !== "";
  });

  const formatDate = (ms) => {
    const date = new Date(Number(ms));
    return date.toLocaleDateString("en-IN");
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Daily Prediction Translation Editor</h2>

      <div className="flex gap-4 mb-4">
        {/* Source Language */}
        <div>
          <label className="block font-medium">Source Language</label>
          <select
            className="p-2 border rounded"
            value={sourceLangKey}
            onChange={(e) => {
              setSourceLangKey(e.target.value);
              if (e.target.value === targetLangKey) {
                const fallback = LANG_KEYS.find((k) => k.key !== e.target.value);
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
        
        {/* Target Language */}
        <div>
          <label className="block font-medium">Target Language</label>
          <select
            className="p-2 border rounded"
            value={targetLangKey}
            onChange={(e) => setTargetLangKey(e.target.value)}
          >
            {LANG_KEYS.filter((lang) => lang.key !== sourceLangKey).map((lang) => (
              <option key={lang.key} value={lang.key}>
                {lang.label}
              </option>
            ))}
          </select>
        </div>
        {/* LOAD Button */}
        <button
          className="mt-6 bg-blue-600 text-white px-5 py-2 rounded disabled:bg-gray-400"
          onClick={handleLoad}
          disabled={loading}
        >
          {loading ? "Loading..." : "Load"}
        </button>
      </div>

      {/* Only show this if loaded */}
      {loaded && (
        <div className="flex gap-6">
          {/* List */}
          <div className="w-1/3">
            <h3 className="font-semibold mb-2">Activities ({filteredActivities.length})</h3>
            <ul className="space-y-2 max-h-96 overflow-y-auto">
              {filteredActivities.map((activity, index) => (
                <li
                
                  key={activity.id}
                  
                  className={`p-2 border rounded cursor-pointer ${
                    selected?.id === activity.id ? "bg-blue-100" : "hover:bg-gray-100"
                  }`}
                  onClick={() => handleSelectActivity(activity)}
                >
                   
                  <div className="text-sm font-semibold">
                    {index + 1}.
                    {/* {activity.date && (
                    <div className="text-sm text-gray-500">📅 {formatDate(activity.date)}</div>
                  )} */}
                  {getSourceLangContent(activity).substring(0, 50)}
                    {getSourceLangContent(activity).length > 50 ? "..." : ""}
                  </div>
                  {activity.date && (
                    <div className="text-sm text-gray-500">📅 {formatDate(activity.date)}</div>
                  )}
                </li>
              ))}
            </ul>
            {filteredActivities.length === 0 && (
              <p className="text-gray-500 text-sm">No activities found for the selected source language.</p>
            )}
          </div>
          
          {/* Translation Editor */}
          <div className="w-2/3">
            {selected ? (
              <div className="flex gap-8">
                {/* Original Section */}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2">
                    Original ({getPlainLangName(sourceLangKey)})
                  </h3>
                  <textarea
                    className="w-full h-80 p-2 border rounded bg-gray-100"
                    readOnly
                    value={getSourceLangContent(selected)}
                  />
                </div>
                
                {/* Translation Section */}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2">
                    Translation ({getPlainLangName(targetLangKey)})
                  </h3>
                  <textarea
                    className="w-full h-80 p-2 border rounded"
                    value={translatedText}
                    onChange={(e) => setTranslatedText(e.target.value)}
                    placeholder={`Enter ${getPlainLangName(targetLangKey)} translation...`}
                  />
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
          >
            Save Translation
          </button>
        </div>
      )}
    </div>
  );
}
