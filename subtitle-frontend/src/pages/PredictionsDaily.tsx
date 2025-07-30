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
  { label: "English", key: "english" }, // Represents all English columns
  { label: "Hindi", key: "hi_1" },
  { label: "Telugu", key: "te_1" },
  { label: "Marathi", key: "mr_1" },
];
const ENGLISH_COLUMNS = ["en_1", "en_2", "en_3", "en_4"];


export default function PredictionsDaily() {
  const [activities, setActivities] = useState([]);
  const [selected, setSelected] = useState(null);
  const [translatedText, setTranslatedText] = useState("");
  const [sourceLangKey, setSourceLangKey] = useState("english");
  const [targetLangKey, setTargetLangKey] = useState("hindi");
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedLink, setSelectedLink] = useState("");

  const handleLoad = async () => {
    setLoading(true);
    try { 
      const response = await fetch("http://localhost:5000/api/predictions/predictions");
     
      // const response = await fetch("https://api.ayushcms.info/api/textbased/activities");
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
    // For translation text, show the content of the targetLangKey in the selected activity
    const translation = getLangContent(selected, targetLangKey);
    setTranslatedText(translation);
  }
}, [targetLangKey, selected, loaded]);

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
    const youtubeId = extractYouTubeId(activity.url);
    setSelectedLink(youtubeId ? `https://www.youtube.com/watch?v=${youtubeId}` : "");
  };

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
      const res = await fetch("http://localhost:5000/api/predictions/savePrediction", {
      // const res = await fetch("https://api.ayushcms.info/api/predictions/savePrediction", {

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

  // const getSourceLangContent = (activity) => {
  //   const sourceKey = getContentKeyFromActivityNameKey(sourceLangKey);
  //   return activity[sourceKey] || "";
  // };

    //updated getSourceLangContent to handle multiple English columns
    const getSourceLangContent = (activity, langKey) => {
  if (langKey === "english") {
    return ENGLISH_COLUMNS
      .map(col => activity[col])
      .filter(text => text && text.trim() !== "")
      .join(" | ");  // or use "\n" or any separator you prefer
  } else {
    return activity[langKey] || "";
  }
};



  // const filteredActivities = activities.filter((a) => {
  //   const sourceKey = getContentKeyFromActivityNameKey(sourceLangKey);
  //   return a[sourceKey] && a[sourceKey].trim() !== "";
  // });
  //updated filteredActivities to handle multiple English columns
  const filteredActivities = activities.filter(activity => {
  if (sourceLangKey === "english") {
    // At least one English column has data
    return ENGLISH_COLUMNS.some(col => activity[col] && activity[col].trim() !== "");
  } else {
    return activity[sourceLangKey] && activity[sourceLangKey].trim() !== "";
  }
});


  const formatDate = (ms) => {
    const date = new Date(Number(ms));
    return date.toLocaleDateString("en-IN");
  };

 const getLangContent = (activity, langKey) => {
  if (langKey === "english") {
    return ENGLISH_COLUMNS
      .map(col => activity[col])
      .filter(text => text && text.trim() !== "")
      .join(" | ");  // or newline '\n', whichever UI style you want
  } else {
    return activity[langKey] || "";
  }
};



  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">prediction daily Translation Editor</h2>

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
        {/* Todays Date */}
<div>
  <label className="block font-medium ">Today's Date</label>
  <input
    type="date"
    className="p-2 border rounded"
    // value={toDate}
    // onChange={(e) => setToDate(e.target.value)}
  />
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

             {/* YouTube Embed */}
      {selectedLink && (
        <div className="mb-4">
          <h3 className="font-semibold mb-2">Related Video</h3>
          {/* disabled related video in iframe */}
          <iframe
             className="w-full h-64 rounded"
              src={`https://www.youtube.com/embed/${extractYouTubeId(selectedLink)}?rel=0`}
                    allowFullScreen
              title="Related Video"
                      />

        </div>
      )}

      {/* Only show this if loaded */}
      {loaded && (
        <div className="flex gap-6">
          {/* List */}
          <div className="w-1/3">
            <h3 className="font-semibold mb-2">predictions ({filteredActivities.length})</h3>
            <ul className="space-y-2 max-h-96 overflow-y-auto">
              {/* {filteredActivities.map((activity, index) => (
                <li
                
                  key={activity.id}
                  
                  className={`p-2 border rounded cursor-pointer ${
                    selected?.id === activity.id ? "bg-blue-100" : "hover:bg-gray-100"
                  }`}
                  onClick={() => handleSelectActivity(activity)}
                >
                   
                  <div className="text-sm font-semibold">
                    {index + 1}.
                   
                  {getSourceLangContent(activity).substring(0, 50)}
                    {getSourceLangContent(activity).length > 50 ? "..." : ""}
                  </div>
                 {/* {activity.date && (
                  <div className="text-sm text-gray-500">📅 {activity.date}</div>
                  )}</li> */}
                
              {/* ))} */} 
              
{filteredActivities.map((activity, index) => (
  <li
    key={activity.id}
    className={`p-2 border rounded cursor-pointer ${
      selected?.id === activity.id ? "bg-blue-100" : "hover:bg-gray-100"
    }`}
    onClick={() => handleSelectActivity(activity)}
  >
    <div className="text-sm font-semibold">
      {index + 1}. {getSourceLangContent(activity, sourceLangKey).substring(0, 50)}
      {getSourceLangContent(activity, sourceLangKey).length > 50 ? "..." : ""}
    </div>
  </li>
))}
            </ul>
            {filteredActivities.length === 0 && (
              <p className="text-gray-500 text-sm">No precdiction found for the selected source language.</p>
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
                   value={getLangContent(selected, sourceLangKey)}
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
                <p>Select an precdiction from the list to start translating</p>
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
