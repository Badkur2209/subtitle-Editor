import React, { useEffect, useState } from "react";

function getContentKeyFromActivityNameKey(activityNameKey) {
  if (activityNameKey.startsWith("ActivityName_")) {
    return activityNameKey.replace("ActivityName_", "");
  }
  return activityNameKey;
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

  useEffect(() => {
    fetch("http://localhost:5000/api/textbased/activities")
      .then((res) => res.json())
      .then((data) => setActivities(data))
      .catch((err) => console.error("❌ Error loading activities:", err));
  }, []);

  useEffect(() => {
    if (selected) {
      const targetKey = getContentKeyFromActivityNameKey(targetLangKey);
      setTranslatedText(selected[targetKey] || "");
    }
  }, [targetLangKey, selected]);

  const handleSelectActivity = (activity) => {
    setSelected(activity);
    const targetKey = getContentKeyFromActivityNameKey(targetLangKey);
    setTranslatedText(activity[targetKey] || "");
  };

  // <- Moved inside component! ->
  const handleSave = async () => {
    if (!selected || !translatedText.trim()) {
      alert("Please select an activity and enter a translation.");
      return;
    }

    const payload = {
      id: selected.id,
      translated: translatedText,
      targetLang: getPlainLangName(targetLangKey), // clean lang
    };

    try {
      const res = await fetch("http://localhost:5000/api/textbased/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Save failed");

      alert("✅ Translation saved successfully");
    } catch (err) {
      console.error("❌ Save failed:", err);
      alert("❌ Failed to save translation");
    }
  };

  const filteredActivities = activities.filter((a) => a[sourceLangKey]);

  const formatDate = (ms) => {
    const date = new Date(Number(ms));
    return date.toLocaleDateString("en-IN");
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Activity Translation Editor</h2>

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
          className="mt-6 bg-blue-600 text-white px-5 py-2 rounded"
          onClick={() => setLoaded(true)}
        >
          Load
        </button>
      </div>

      {/* Only show this if loaded */}
      {loaded && (
        <div className="flex gap-6">
          {/* List */}
          <div className="w-1/3">
            <ul className="space-y-2">
              {filteredActivities.map((activity, index) => (
                <li
                  key={activity.id}
                  className={`p-2 border rounded cursor-pointer ${
                    selected?.id === activity.id ? "bg-blue-100" : "hover:bg-gray-100"
                  }`}
                  onClick={() => handleSelectActivity(activity)}
                >
                  <div className="text-sm font-semibold">
                    {index + 1}. {activity[sourceLangKey]}
                  </div>
                  {activity.Date && (
                    <div className="text-sm text-gray-500">📅 {formatDate(activity.Date)}</div>
                  )}
                </li>
              ))}
            </ul>
          </div>
          {/* Translation Editor */}
          <div className="w-2/3">
            {selected && (
              <div className="flex gap-8">
                {/* Original Section */}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2">Original</h3>
                  <textarea
                    className="w-full h-80 p-2 border rounded bg-gray-100"
                    readOnly
                    value={selected[getContentKeyFromActivityNameKey(sourceLangKey)] || ""}
                  />
                </div>
                {/* Translation Section */}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2">Translation</h3>
                  <textarea
                    className="w-full h-80 p-2 border rounded"
                    value={translatedText}
                    onChange={(e) => setTranslatedText(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Save Button */}
      {loaded && selected && (
        <button onClick={handleSave} className="mt-4 bg-blue-600 text-white px-6 py-2 rounded">
          Save
        </button>
      )}
    </div>
  );
}




// import React, { useEffect, useState } from "react";

// // Helper to derive content key, e.g. ActivityName_Hindi → Hindi
// function getContentKeyFromActivityNameKey(activityNameKey) {
//   if (activityNameKey.startsWith("ActivityName_")) {
//     return activityNameKey.replace("ActivityName_", "");
//   }
//   return activityNameKey;
// }

// const LANG_KEYS = [
//   { label: "English", key: "ActivityName_English" },
//   { label: "Hindi", key: "ActivityName_Hindi" },
//   { label: "Telugu", key: "ActivityName_Telugu" },
//   { label: "Marathi", key: "ActivityName_Marathi" },
// ];

// export default function TextBased() {
//   const [activities, setActivities] = useState([]);
//   const [selected, setSelected] = useState(null);
//   const [translatedText, setTranslatedText] = useState("");
//   const [sourceLangKey, setSourceLangKey] = useState("ActivityName_English");
//   const [targetLangKey, setTargetLangKey] = useState("ActivityName_Hindi");
//    const [loaded, setLoaded] = useState(false);
//   useEffect(() => {
//     fetch("http://localhost:5000/api/textbased/activities")
//       .then((res) => res.json())
//       .then((data) => setActivities(data))
//       .catch((err) => console.error("❌ Error loading activities:", err));
//   }, []);

//   // If target lang changes (or when activity changes), update translation textarea with latest value from JSON
//   useEffect(() => {
//     if (selected) {
//       const targetKey = getContentKeyFromActivityNameKey(targetLangKey);
//       setTranslatedText(selected[targetKey] || "");
//     }
//   }, [targetLangKey, selected]);

//   const handleSelectActivity = (activity) => {
//     setSelected(activity);
//     const targetKey = getContentKeyFromActivityNameKey(targetLangKey);
//     setTranslatedText(activity[targetKey] || "");
//   };

//   const handleSave = async () => {
//     const targetKey = getContentKeyFromActivityNameKey(targetLangKey);
//     if (!selected || !translatedText.trim()) {
//       alert("Please select an activity and enter a translation.");
//       return;
//     }
//     try {
//       const res = await fetch("http://localhost:5000/api/textbased/save", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           id: selected.id,
//           langKey: targetKey, // for saving, use content key, not ActivityName_...
//           translated: translatedText,
//         }),
//       });
//       if (!res.ok) throw new Error("Save failed");
//       alert("✅ Translation saved successfully");
//     } catch (err) {
//       console.error("❌ Save failed:", err);
//       alert("❌ Failed to save translation");
//     }
//   };

//   const filteredActivities = activities.filter((a) => a[sourceLangKey]);
//   const formatDate = (ms) => {
//     const date = new Date(Number(ms));
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
//               // Optional: if target language changes to match, auto set to another available
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
//             {LANG_KEYS.filter((lang) => lang.key !== sourceLangKey).map(
//               (lang) => (
//                 <option key={lang.key} value={lang.key}>
//                   {lang.label}
//                 </option>
//               )
//             )}
//           </select>
//         </div>
//       </div>
//          {/* LOAD Button */}
//         <button
//           className="mt-4 bg-blue-600 text-white px-5 py-2 rounded"
//           onClick={() => setLoaded(true)}
//         >Load</button>
//       <div className="flex gap-6">
//         {/* List */}
//         <div className="w-1/3">
//           <ul className="space-y-2">
//             {filteredActivities.map((activity, index) => (
//               <li
//                 key={activity.id}
//                 className={`p-2 border rounded cursor-pointer ${
//                   selected?.id === activity.id
//                     ? "bg-blue-100"
//                     : "hover:bg-gray-100"
//                 }`}
//                 onClick={() => handleSelectActivity(activity)}
//               >
//                 <div className="text-sm font-semibold">
//                   {index + 1}. {activity[sourceLangKey]}
//                 </div>
//                 {activity.Date && (
//                   <div className="text-sm text-gray-500">
//                     📅 {formatDate(activity.Date)}
//                   </div>
//                 )}
//               </li>
//             ))}
//           </ul>
//         </div>
//         {/* Translation Editor */}
//         <div className="w-2/3">
//           {selected && (
//             <div className="flex gap-8">
//               {/* Original Section */}
//               <div className="flex-1">
//                 <h3 className="text-lg font-semibold mb-2">Original</h3>
//                 <textarea
//                   className="w-full h-80 p-2 border rounded bg-gray-100"
//                   readOnly
//                   value={
//                     selected[getContentKeyFromActivityNameKey(sourceLangKey)] ||
//                     ""
//                   }
//                 />
//               </div>
//               {/* Translation Section */}
//               <div className="flex-1">
//                 <h3 className="text-lg font-semibold mb-2">Translation</h3>
//                 <textarea
//                   className="w-full h-80 p-2 border rounded"
//                   value={translatedText}
//                   onChange={(e) => setTranslatedText(e.target.value)}
//                 />
//               </div>
//             </div>
//           )}
//         </div>
//       </div>

//       {selected && (
//         <button
//           onClick={handleSave}
//           className="mt-4 bg-blue-600 text-white px-6 py-2 rounded"
//         >
//           Save
//         </button>
//       )}
//     </div>
//   );
// }




// import React, { useEffect, useState } from "react";

// interface Activity {
//   id: number;
//   Date?: string;
//   [key: string]: any; // allows dynamic language fields like ActivityName_Hindi, ActivityName_Telugu, etc.
// }

// const LANG_KEYS = [
//   { label: "English", key: "ActivityName_English" },
//   { label: "Hindi", key: "ActivityName_Hindi" },
//   { label: "Telugu", key: "ActivityName_Telugu" },
//   { label: "Marathi", key: "ActivityName_Marathi" }
// ];
//     // e.g. "ActivityName_Hindi" => "Hindi"
// function getContentKeyFromActivityNameKey(activityNameKey) {
//   if (activityNameKey.startsWith("ActivityName_")) {
//     return activityNameKey.replace("ActivityName_", "");
//   }
//   return activityNameKey; // fallback
// }

// export default function TextBased() {
//   const [activities, setActivities] = useState<Activity[]>([]);
//   const [selected, setSelected] = useState<Activity | null>(null);
//   const [translatedText, setTranslatedText] = useState("");
//   const [sourceLangKey, setSourceLangKey] = useState("ActivityName_English");
//   const [targetLangKey, setTargetLangKey] = useState("ActivityName_Hindi");

//   const [oriLangKey, setOriLangKey] = useState("English");
//   const [tarLangKey, setTarLangKey] = useState("Hindi");

//   useEffect(() => {
//     fetch("http://localhost:5000/api/textbased/activities")
//       .then((res) => res.json())
//       .then((data) => {
//         console.log("✅ Loaded activities:", data);
//         setActivities(data);
//       })
//       .catch((err) => {
//         console.error("❌ Error loading activities:", err);
//       });
//   }, []);

//   const handleSelectActivity = (activity: Activity) => {
//     setSelected(activity);
//     setTranslatedText(activity[targetLangKey] || "");
//   };

//   const handleSave = async () => {
//     // if (!selected || !translatedText.trim())
//     if (!selected || !tarLangKey.trim()) {
//       alert("Please select an activity and enter a translation.");
//       return;
//     }


// const contentKey = getContentKeyFromActivityNameKey(sourceLangKey);



//     try {
//       const res = await fetch("http://localhost:5000/api/textbased/save", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json"
//         },
//         body: JSON.stringify({
//           id: selected.id,
//           langKey: targetLangKey,
//           translated: translatedText
//         })
//       });

//       if (!res.ok) throw new Error("Save failed");
//       const result = await res.json();
//       alert("✅ Translation saved successfully");
//     } catch (err) {
//       console.error("❌ Save failed:", err);
//       alert("❌ Failed to save translation");
//     }
//   };

//   const filteredActivities = activities.filter((a) => a[sourceLangKey]);
//   const formatDate = (ms: number | string) => {
//   const date = new Date(Number(ms));
//   return date.toLocaleDateString("en-IN"); // Format: DD/MM/YYYY
// };


//   return (
//     <div className="p-6">
//       <h2 className="text-xl font-bold mb-4">Activity Translation Editor</h2>

//       <div className="flex gap-4 mb-4">
//         <div>
//           <label className="block font-medium">Source Language</label>
//           <select
//             className="p-2 border rounded"
//             value={sourceLangKey}
//             onChange={(e) => setSourceLangKey(e.target.value)}
//           >
//             {LANG_KEYS.map((lang) => (
//               <option key={lang.key} value={lang.key}>
//                 {lang.label}
//               </option>
//             ))}
//           </select>
//         </div>
//         <div>
//           <label className="block font-medium">Target Language</label>
//           <select
//             className="p-2 border rounded"
//             value={targetLangKey}
//             onChange={(e) => setTargetLangKey(e.target.value)}
//           >
//             {LANG_KEYS.map((lang) => (
//               <option key={lang.key} value={lang.key}>
//                 {lang.label}
//               </option>
//             ))}
//           </select>
//         </div>
      
//         <button
//           className="mt-4 bg-blue-600 text-white px-5 py-2 rounded"
//         >
//           Load
//         </button>
      
//       </div>
            
//       <div className="flex gap-6">
//         <div className="w-1/3">
//           <ul className="space-y-2">
//             {filteredActivities.map((activity, index) => (
//               <li
//                 key={activity.id}
//                 className={`p-2 border rounded cursor-pointer ${
//                   selected?.id === activity.id ? "bg-blue-100" : "hover:bg-gray-100"
//                 }`}
//                 onClick={() => handleSelectActivity(activity)}
//               >
//                 <div className="text-sm font-semibold">
//                   {index + 1}. {activity[sourceLangKey]}
//                 </div>
//                 {activity.Date && (
//                   <div className="text-sm text-gray-500">
//           📅 {formatDate(activity.Date)}</div>
//                 )}
//               </li>
//             ))}
//           </ul>
//         </div>

//         {/* <div className="w-2/3">
//           {selected && (
//             <>
//               <h3 className="text-lg font-semibold mb-2">Original</h3>
//               <textarea
//                 className="w-1/2 h-40 p-2 border rounded bg-gray-100"
//                 readOnly
//                 value={selected[sourceLangKey] || ""}
//               />

//               <h3 className="text-lg font-semibold mt-4 mb-2">Translation</h3>
//               <textarea
//                 className="w-1/2 h-40 p-2 border rounded"
//                 value={translatedText}
//                 onChange={(e) => setTranslatedText(e.target.value)}
//               />
//             </>
//           )}
//         </div> */}
//         <div className="w-2/3">
//   {selected && (
//     <div className="flex gap-8">
//       {/* Original Section */}
//       {/* <div className="flex-1">
//         <h3 className="text-lg font-semibold mb-2">Original</h3>
//         <textarea
//           className="w-full h-80 p-2 border rounded bg-gray-100"
//           readOnly
//           value={selected[oriLangKey] || ""}
//         />
//       </div> */}
//       <div className="flex-1">
//   <h3 className="text-lg font-semibold mb-2">Original</h3>
//   <textarea
//     className="w-full h-80 p-2 border rounded bg-gray-100"
//     readOnly
//     value={selected ? selected[getContentKeyFromActivityNameKey(sourceLangKey)] || "" : ""}
//   />
// </div>


//       {/* Translation Section */}
//       <div className="flex-1">
//         <h3 className="text-lg font-semibold mb-2">Translation</h3>
//         <textarea
//           className="w-full h-80 p-2 border rounded"
//           value={tarLangKey}
//           onChange={(e) => setTranslatedText(e.target.value)}
//         />
//       </div>
//     </div>
//   )}
// </div>

//       </div>

//       {selected && (
//         <button
//           onClick={handleSave}
//           className="mt-4 bg-blue-600 text-white px-6 py-2 rounded"
//         >
//           Save
//         </button>
//       )}
//     </div>
//   );
// }

// import React, { useEffect, useState } from "react";

// interface Activity {
//   id: number;
// //   date?:string;
//   [key: string]: any; // allows dynamic language fields like ActivityName_Hindi, ActivityName_Telugu, etc.
// }

// const LANG_KEYS = [
//   { label: "English", key: "ActivityName_English" },
//   { label: "Hindi", key: "ActivityName_Hindi" },
//   { label: "Telugu", key: "ActivityName_Telugu" },
//   { label: "Marathi", key: "ActivityName_Marathi" }
// ];

// export default function TextBased() {
//   const [activities, setActivities] = useState<Activity[]>([]);
//   const [selected, setSelected] = useState<Activity | null>(null);
//   const [translatedText, setTranslatedText] = useState("");
//   const [sourceLangKey, setSourceLangKey] = useState("ActivityName_English");
//   const [targetLangKey, setTargetLangKey] = useState("ActivityName_Hindi");


//   useEffect(() => {
//     fetch("http://localhost:5000/api/textbased/activities")
//       .then((res) => res.json())
//       .then((data) => {
//         console.log("✅ Loaded activities:", data);
//         setActivities(data);
//       })
//       .catch((err) => {
//         console.error("❌ Error loading activities:", err);
//       });
//   }, []);

//   const handleSelectActivity = (activity: Activity) => {
//     setSelected(activity);
//     setTranslatedText(activity[targetLangKey] || "");
//   };

// //   const handleSave = async () => {
// //     if (!selected || !translatedText.trim()) {
// //       alert("Please select an activity and enter a translation.");
// //       return;
// //     }

// //     try {
// //       const res = await fetch("http://localhost:5000/api/textbased/save", {
// //         method: "POST",
// //         headers: {
// //           "Content-Type": "application/json"
// //         },
// //         body: JSON.stringify({
// //           id: selected.id,
// //           langKey: targetLangKey,
// //           translated: translatedText
// //         })
// //       });

// //       if (!res.ok) throw new Error("Save failed");
// //       const result = await res.json();
// //       alert("✅ Translation saved successfully");
// //     } catch (err) {
// //       console.error("❌ Save failed:", err);
// //       alert("❌ Failed to save translation");
// //     }
// //   };
// const handleSave = async () => {
//   if (!selected || !translatedText.trim()) {
//     alert("Please select an activity and enter a translation.");
//     return;
//   }

//   try {
//     const res = await fetch("http://localhost:5000/api/textbased/save", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json"
//       },
//       body: JSON.stringify({
//         id: selected.id,
//         translated: translatedText,
//        targetLang: targetLangKey  // This is the selected target language like "Hindi", "Marathi", etc.
//       })
//     });

//     if (!res.ok) throw new Error("Save failed");
//     const result = await res.json();
//     alert("✅ Translation saved successfully");
//   } catch (err) {
//     console.error("❌ Save failed:", err);
//     alert("❌ Failed to save translation");
//   }
// };

//   const filteredActivities = activities.filter((a) => a[sourceLangKey]);

//   return (
//     <div className="p-6">
//       <h2 className="text-xl font-bold mb-4">Activity Translation Editor</h2>

//       <div className="flex gap-4 mb-4">
//         <div>
//           <label className="block font-medium">Source Language</label>
//           <select
//             className="p-2 border rounded"
//             value={sourceLangKey}
//             onChange={(e) => setSourceLangKey(e.target.value)}
//           >
//             {LANG_KEYS.map((lang) => (
//               <option key={lang.key} value={lang.key}>
//                 {lang.label}
//               </option>
//             ))}
//           </select>
//         </div>
//         <div>
//           <label className="block font-medium">Target Language</label>
//           <select
//             className="p-2 border rounded"
//             value={targetLangKey}
//             onChange={(e) => setTargetLangKey(e.target.value)}
//           >
//             {LANG_KEYS.map((lang) => (
//               <option key={lang.key} value={lang.key}>
//                 {lang.label}
//               </option>
//             ))}
//           </select>
//         </div>
//       </div>

//       <div className="flex gap-6">
//         <div className="w-1/3">
//           <ul className="space-y-2">
//             {filteredActivities.map((activity) => (
//               <li
//                 key={activity.id}
//                 className={`p-2 border rounded cursor-pointer ${
//                   selected?.id === activity.id ? "bg-blue-100" : "hover:bg-gray-100"
//                 }`}
//                 onClick={() => handleSelectActivity(activity)}
//               >
//                 {activity[sourceLangKey]}
//               </li>
//             ))}
//           </ul>
//         </div>

//         <div className="w-2/3">
//           {selected && (
//             <>
//               <h3 className="text-lg font-semibold mb-2">Original</h3>
//               <textarea
//                 className="w-full h-40 p-2 border rounded bg-gray-100"
//                 readOnly
//                 value={selected[sourceLangKey] || ""}
//               />

//               <h3 className="text-lg font-semibold mt-4 mb-2">Translation</h3>
//               <textarea
//                 className="w-full h-40 p-2 border 1```rounded"
//                 value={translatedText}
//                 onChange={(e) => setTranslatedText(e.target.value)}
//               />
//             </>
//           )}
//         </div>
//       </div>

//       {selected && (
//         <button
//           onClick={handleSave}
//           className="mt-4 bg-blue-600 text-white px-6 py-2 rounded"
//         >
//           Save
//         </button>
//       )}
//     </div>
//   );
// }








//only goes for activity list filter 
// import React, { useEffect, useState } from "react";

// interface Activity {
//   id: number;
//   ActivityName_Hindi: string;
//   ActivityName_English: string;
// }

// const languageOptions = [
//   { key: "ActivityName_English", label: "English" },
//   { key: "ActivityName_Hindi", label: "Hindi" },
// ];

// export default function TextBased() {
//   const [activities, setActivities] = useState<Activity[]>([]);
//   const [selected, setSelected] = useState<Activity | null>(null);
//   const [translatedText, setTranslatedText] = useState("");
//   const [selectedLangKey, setSelectedLangKey] = useState("ActivityName_English");

//   // Fetch activity data
//   useEffect(() => {
//     fetch("http://localhost:5000/api/textbased/activities")
//       .then((res) => res.json())
//       .then((data) => {
//         console.log("✅ Loaded activities:", data);
//         setActivities(data);
//       })
//       .catch((err) => {
//         console.error("❌ Error loading activities:", err);
//       });
//   }, []);

//   const handleSelectActivity = (activity: Activity) => {
//     setSelected(activity);
//     setTranslatedText(activity.ActivityName_Hindi || "");
//   };

//   const handleSave = async () => {
//     if (!selected || !translatedText.trim()) {
//       alert("Please select an activity and enter a translation.");
//       return;
//     }

//     try {
//       const res = await fetch("http://localhost:5000/api/textbased/save", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           id: selected.id,
//           translated: translatedText,
//         }),
//       });

//       if (!res.ok) throw new Error("Save failed");
//       const result = await res.json();
//       alert("✅ Translation saved successfully");
//     } catch (err) {
//       console.error("❌ Save failed:", err);
//       alert("❌ Failed to save translation");
//     }
//   };

//   return (
//     <div className="p-6">
//       <div className="flex items-center justify-between mb-4">
//         <h2 className="text-xl font-bold">Activity List</h2>
//         <select
//           className="p-2 border rounded"
//           value={selectedLangKey}
//           onChange={(e) => setSelectedLangKey(e.target.value)}
//         >
//           {languageOptions.map((opt) => (
//             <option key={opt.key} value={opt.key}>
//               {opt.label}
//             </option>
//           ))}
//         </select>
//       </div>

//       <div className="flex gap-6">
//         {/* Activity List */}
//         <div className="w-1/3">
//           <ul className="space-y-2">
//             {activities.map((activity) => (
//               <li
//                 key={activity.id}
//                 className={`p-2 border rounded cursor-pointer ${
//                   selected?.id === activity.id ? "bg-blue-100" : "hover:bg-gray-100"
//                 }`}
//                 onClick={() => handleSelectActivity(activity)}
//               >
//                 {activity[selectedLangKey as keyof Activity]}
//               </li>
//             ))}
//           </ul>
//         </div>

//         {/* Translation UI */}
//         <div className="w-2/3">
//           {selected && (
//             <>
//               <h3 className="text-lg font-semibold mb-2">
//                 Original: {selected.ActivityName_English}
//               </h3>
//               <textarea
//                 className="w-full h-40 p-2 border rounded bg-gray-100"
//                 readOnly
//                 value={selected.ActivityName_English}
//               />

//               <h3 className="text-lg font-semibold mt-4 mb-2">Translation</h3>
//               <textarea
//                 className="w-full h-40 p-2 border rounded"
//                 value={translatedText}
//                 onChange={(e) => setTranslatedText(e.target.value)}
//               />
//             </>
//           )}
//         </div>
//       </div>

//       {selected && (
//         <button
//           onClick={handleSave}
//           className="mt-4 bg-blue-600 text-white px-6 py-2 rounded"
//         >
//           Save
//         </button>
//       )}
//     </div>
//   );
// }

// import React, { useEffect, useState } from "react";

// interface Activity {
//   id: number;
//   ActivityName_Hindi: string;
//   ActivityName_English: string;
// }

// export default function TextBased() {
//   const [activities, setActivities] = useState<Activity[]>([]);
//   const [selected, setSelected] = useState<Activity | null>(null);
//   const [translatedText, setTranslatedText] = useState("");

//   // Fetch activities on mount
//   useEffect(() => {
//     fetch("http://localhost:5000/api/textbased/activities")
//       .then((res) => res.json())
//       .then((data) => {
//         console.log("✅ Loaded activities:", data);
//         setActivities(data);
//       })
//       .catch((err) => {
//         console.error("❌ Error loading activities:", err);
//       });
//   }, []);

//   // When a new activity is selected
//   const handleSelectActivity = (activity: Activity) => {
//     setSelected(activity);
//     setTranslatedText(activity.ActivityName_Hindi || ""); // Default to existing Hindi
//   };

//   // Save translation to backend
//   const handleSave = async () => {
//     if (!selected || !translatedText.trim()) {
//       alert("Please select an activity and enter a translation.");
//       return;
//     }

//     try {
//       const res = await fetch("http://localhost:5000/api/textbased/save", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json"
//         },
//         body: JSON.stringify({
//           id: selected.id,
//           translated: translatedText
//         })
//       });

//       if (!res.ok) throw new Error("Save failed");
//       const result = await res.json();
//       alert("✅ Translation saved successfully");
//     } catch (err) {
//       console.error("❌ Save failed:", err);
//       alert("❌ Failed to save translation");
//     }
//   };

//   return (
//     <div className="p-6">
//       <h2 className="text-xl font-bold mb-4">Activity List</h2>
//       <div className="flex gap-6">
//         {/* Activity Selection List */}
//         <div className="w-1/3">
//           <ul className="space-y-2">
//             {activities.map((activity) => (
//               <li
//                 key={activity.id}
//                 className={`p-2 border rounded cursor-pointer ${
//                   selected?.id === activity.id ? "bg-blue-100" : "hover:bg-gray-100"
//                 }`}
//                 onClick={() => handleSelectActivity(activity)}
//               >
//                 {activity.ActivityName_English}
//               </li>
//             ))}
//           </ul>
//         </div>

//         {/* Editor Panel */}
//         <div className="w-2/3">
//           {selected && (
//             <>
//               <h3 className="text-lg font-semibold mb-2">
//                 Original: {selected.ActivityName_English}
//               </h3>
//               <textarea
//                 className="w-full h-40 p-2 border rounded bg-gray-100"
//                 readOnly
//                 value={selected.ActivityName_English}
//               />

//               <h3 className="text-lg font-semibold mt-4 mb-2">Translation</h3>
//               <textarea
//                 className="w-full h-40 p-2 border rounded"
//                 value={translatedText}
//                 onChange={(e) => setTranslatedText(e.target.value)}
//               />
//             </>
//           )}
//         </div>
//       </div>

//       {/* Save Button */}
//       {selected && (
//         <button
//           onClick={handleSave}
//           className="mt-4 bg-blue-600 text-white px-6 py-2 rounded"
//         >
//           Save
//         </button>
//       )}
//     </div>
//   );
// }




// import React, { useEffect, useState } from "react";

// interface Activity {
//   id: number;
//   ActivityName_Hindi: string;
//   ActivityName_English: string;
// }

// export default function TextBased() {
//   const [activities, setActivities] = useState<Activity[]>([]);
//   const [selected, setSelected] = useState<Activity | null>(null);
//   const [translatedText, setTranslatedText] = useState("");

//   // Fetch activities on mount
//   useEffect(() => {
//     fetch("http://localhost:5000/api/textbased/activities")
//       .then((res) => res.json())
//       .then((data) => {
//         console.log("✅ Loaded activities:", data);
//         setActivities(data);
//       })
//       .catch((err) => {
//         console.error("❌ Error loading activities:", err);
//       });
//   }, []);

//   // When a new activity is selected, reset the translation
//   const handleSelectActivity = (activity: Activity) => {
//     setSelected(activity);
//     setTranslatedText(activity.ActivityName_Hindi || ""); // or empty string
//   };

//   // Save translation
// //   const handleSave = async () => {
// //     if (!selected || !translatedText.trim()) {
// //       alert("Please select an activity and enter a translation.");
// //       return;
// //     }

// //     try {
// //       const res = await fetch("http://localhost:5000/api/textbased/save", {
// //         method: "POST",
// //         headers: {
// //           "Content-Type": "application/json"
// //         },
// //         body: JSON.stringify({
// //           id: selected.id,
// //           translated: translatedText
// //         })
// //       });

// //       if (!res.ok) throw new Error("Save failed");
// //       const result = await res.json();
// //       alert("✅ Translation saved successfully");
// //     } catch (err) {
// //       console.error("❌ Save failed:", err);
// //       alert("❌ Failed to save translation");
// //     }
// //   };
// // Add this below your existing GET /activities route
// router.post("/save", (req, res) => {
//   const { id, translated } = req.body;
//   const translatedPath = path.join(__dirname, "../data/translated.json");

//   fs.readFile(translatedPath, "utf-8", (err, data) => {
//     let existing = [];
//     if (!err && data) {
//       try {
//         existing = JSON.parse(data);
//       } catch (_) {}
//     }

//     // Update if entry exists, else add
//     const index = existing.findIndex(item => item.id === id);
//     if (index >= 0) {
//       existing[index].translated = translated;
//     } else {
//       existing.push({ id, translated });
//     }

//     fs.writeFile(translatedPath, JSON.stringify(existing, null, 2), (err) => {
//       if (err) {
//         console.error("❌ Failed to write file", err);
//         return res.status(500).json({ error: "Failed to save translation" });
//       }
//       res.json({ message: "Saved" });
//     });
//   });
// });


//   return (
//     <div className="p-6">
//       <h2 className="text-xl font-bold mb-4">Activity List</h2>
//       <div className="flex gap-6">
//         <div className="w-1/3">
//           <ul className="space-y-2">
//             {activities.map((activity) => (
//               <li
//                 key={activity.id}
//                 className={`p-2 border rounded cursor-pointer ${
//                   selected?.id === activity.id ? "bg-blue-100" : "hover:bg-gray-100"
//                 }`}
//                 onClick={() => handleSelectActivity(activity)}
//               >
//                 {activity.ActivityName_English}
//               </li>
//             ))}
//           </ul>
//         </div>

//         <div className="w-2/3">
//           {selected && (
//             <>
//               <h3 className="text-lg font-semibold mb-2">
//                 Original: {selected.ActivityName_English}
//               </h3>
//               <textarea
//                 className="w-full h-40 p-2 border rounded bg-gray-100"
//                 readOnly
//                 value={selected.ActivityName_English}
//               />

//               <h3 className="text-lg font-semibold mt-4 mb-2">Translation</h3>
//               <textarea
//                 className="w-full h-40 p-2 border rounded"
//                 value={translatedText}
//                 onChange={(e) => setTranslatedText(e.target.value)}
//               />
//             </>
//           )}
//         </div>
//       </div>

//       {selected && (
//         <button
//           onClick={handleSave}
//           className="mt-4 bg-blue-600 text-white px-6 py-2 rounded"
//         >
//           Save
//         </button>
//       )}
//     </div>
//   );
// }



// // import React, { useEffect, useState } from "react";

// // interface Activity {
// //   id: number;
// //   ActivityName_Hindi: string;
// //   ActivityName_English: string;
// // }

// // export default function TextBased() {
// //   const [activities, setActivities] = useState<Activity[]>([]);
// //   const [selected, setSelected] = useState<Activity | null>(null);

// //   useEffect(() => {
// //     fetch("http://localhost:5000/api/textbased/activities")
// //       .then((res) => res.json())
// //       .then((data) => {
// //         console.log("Loaded activities:", data);
// //         setActivities(data);
// //       })
// //       .catch((err) => {
// //         console.error("❌ Error loading activities:", err);
// //       });
// //   }, []);
  





// // //   ===============
// // // const handleSave = async () => {
// // //   if (!selected || !translatedText.trim()) {
// // //     alert("Please select an activity and enter a translation.");
// // //     return;
// // //   }

// // //   try {
// // //     const res = await fetch("/api/textbased/save", {
// // //       method: "POST",
// // //       headers: {
// // //         "Content-Type": "application/json"
// // //       },
// // //       body: JSON.stringify({
// // //         id: selectedId,
// // //         translated: translatedText
// // //       })
// // //     });

// // //     if (!res.ok) {
// // //       throw new Error("Save failed");
// // //     }

// // //     const result = await res.json();
// // //     alert("✅ Translation saved successfully");
// // //   } catch (err) {
// // //     console.error("❌ Save failed:", err);
// // //     alert("❌ Failed to save translation");
// // //   }
// // // };


// //   return (
// //     <div className="p-6">
// //       <h2 className="text-xl font-bold mb-4">Activity List</h2>
// //       <div className="flex gap-6">
// //         <div className="w-1/3">
// //           <ul className="space-y-2">
// //             {activities.map((activity) => (
// //               <li
// //                 key={activity.id}
// //                 className="p-2 border rounded cursor-pointer hover:bg-gray-100"
// //                 onClick={() => setSelected(activity)}
// //               >
// //                 {activity.ActivityName_English}
// //               </li>
// //             ))}
// //           </ul>
// //         </div>

// //         <div className="w-2/3">
// //           {selected && (
// //             <>
// //               <h3 className="text-lg font-semibold mb-2">
// //                 Original: {selected.ActivityName_English}
// //               </h3>
// //               <textarea
// //                 className="w-full h-40 p-2 border rounded"
// //                 defaultValue={selected.ActivityName_English}
// //               ></textarea>

// //               <h3 className="text-lg font-semibold mt-4 mb-2">Translation</h3>
// //               <textarea className="w-full h-40 p-2 border rounded"></textarea>
// //             </>
// //           )}
// //         </div>
// //       </div>
// //       <button
// //   onClick={handleSave}
// //   className="mt-4 bg-blue-600 text-white px-6 py-2 rounded"
// // >
// //   Save
// // </button>

// //     </div>
// //   );
// // }
