import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE_URL } from "../utils/config.ts";
interface ActivityData {
  id: number;
  Date: string;
  TotalDuration: string;
  Mantra: string;
  WishList: string;
  Material: string;
  url?: string;
  MKSA_start?: string;
  MKSA_end?: string;
  BB_Start?: string;
  BB_End?: string;
  datestatus?: string;
}

const ActivityParameters: React.FC = () => {
  const [activities, setActivities] = useState<ActivityData[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [original, setOriginal] = useState<Partial<ActivityData>>({});
  const [corrected, setCorrected] = useState<Partial<ActivityData>>({});
  const [selected, setSelected] = useState(null);
  const [selectedLink, setSelectedLink] = useState("");

  useEffect(() => {
    axios
      .get<ActivityData[]>(`${API_BASE_URL}/parameters`)
      .then((res) => setActivities(res.data));
  }, []);

  const loadActivity = (id: number) => {
    const match = activities.find((a) => a.id === id);
    if (match) {
      setSelectedId(id);
      setOriginal(match);
      setCorrected({ ...match }); // Copy all fields for editing
      setSelected(match);
      setSelectedLink(match.url || ""); //sets the video
    }
  };

  const handleCorrectedChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setCorrected({ ...corrected, [e.target.name]: e.target.value });
  };

  //   const handleSave = async () => {
  //     if (!selectedId) return;
  //     await axios.put(`${API_BASE_URL}/parameters`, corrected); // Adjust endpoint as per backend
  //     // Optionally refetch all activities
  //   };
  const handleSave = async () => {
    if (!selectedId) return;
    try {
      await axios.post(`${API_BASE_URL}/parameters`, corrected); // Save changes with POST
      // Reload the updated activity data by passing selectedId
      loadActivity(selectedId);
      alert("Activity saved successfully");
    } catch (error) {
      console.error("Error saving activity", error);
      alert("Error saving activity data");
    }
  };
  const timeStringToSeconds = (timeStr) => {
    if (!timeStr) return 0;
    const parts = timeStr.split(":").map(Number).reverse();
    return parts.reduce((acc, part, i) => acc + part * Math.pow(60, i), 0);
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
  const yesNoFields = [
    // "Date",
    "Manifestation",
    "Bath",
    "Tantra",
    "Mantra",
    "Mudra",
    "WishList",
    "SpecificProblem",
    "datestatus",
  ];
  const placeholders = {
    tithi1: "Enter Tithi / NA",
    tithi2: "Enter Tithi / NA",
    tithi3: "Enter Tithi / NA",
    tithi4: "Enter Tithi / NA",
    tithi5: "Enter Tithi / NA",
    planet1: "Enter planet / NA",
    planet2: "Enter planet / NA",
    planet3: "Enter planet / NA",
    Astronomical1: "Enter astronomical / NA",
    Astronomical2: "Enter astronomical / NA",
  };
  const textareaFields = [""];

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Activity Parameters</h1>
      <select
        className="p-1 mb-6 border-round"
        onChange={(e) => loadActivity(Number(e.target.value))}
      >
        <option>Select Activity by Date</option>
        {activities.map((a) => (
          <option value={a.id} key={a.id}>
            {a.Date}
          </option>
        ))}
      </select>
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

      {selectedId && (
        <div className="max-h-[70vh] overflow-y-auto border border-gray-300 rounded ">
          <table className="min-w-full border-collapse">
            <thead className="bg-gray-200 sticky top-0 z-10">
              <tr>
                <th className="border px-4 py-2 text-left w-1/4">Field</th>
                <th className="border px-4 py-2 text-left w-1/4">Original</th>
                <th className="border px-4 py-2 text-left w-1/4">Reviewed</th>
              </tr>
            </thead>
            <tbody>
              {[
                "Date",

                "url",
                "TotalDuration",
                "MKSA_start",
                "MKSA_end",
                "BB_Start",
                "BB_End",
                "day",
                "ActivityTimeReminderTime",
                "File",
                "SuvarnAkshar",
                "BlastingBirthday",
                "MarriageAnniversary",
                "Manifestation",
                "WishList",
                "SpecificProblem",
                "NoOfSteps",
                "RepeatNumber",
                "unit",
                "value",
                "Tantra",
                "Mantra",
                "Mudra",
                "Position",
                "Day",
                "Bath",
                "Time",
                "timeWithSpace",
                "Time2",
                // "Tithi",
                "tithi1",
                "tithi2",
                "tithi3",
                "tithi4",
                "tithi5",
                // "Planet",
                "planet1",
                "planet2",
                "planet3",
                "Material",
                "MaterialQuantity",
                // "Astronomical",
                "Astronomical1",
                "Astronomical2",
              ].map((field) => (
                <tr
                  key={field}
                  className={
                    corrected[field] !== undefined &&
                    corrected[field] !== original[field]
                      ? "bg-yellow-100"
                      : ""
                  }
                >
                  <td className="border px-4 py-2 font-medium">{field}</td>
                  <td className="border px-4 py-2">
                    {original[field] !== undefined ? original[field] : ""}
                  </td>
                  <td className="border px-4 py-2">
                    {field === "Date" ? (
                      // For Date field, show Yes/No radio buttons that update datestatus
                      <div className="flex gap-4 items-center">
                        <label>
                          <input
                            type="radio"
                            name="datestatus" // ← This updates datestatus column
                            value="Yes"
                            checked={corrected.datestatus === "Yes"}
                            onChange={(e) =>
                              setCorrected({
                                ...corrected,
                                datestatus: e.target.value,
                              })
                            }
                            className="peer hidden"
                          />
                          <span className="px-4 py-1 rounded-full border cursor-pointer transition peer-checked:bg-green-500 peer-checked:text-white border-gray-300 text-gray-700">
                            Yes
                          </span>
                        </label>
                        <label>
                          <input
                            type="radio"
                            name="datestatus" // ← This updates datestatus column
                            value="No"
                            checked={corrected.datestatus === "No"}
                            onChange={(e) =>
                              setCorrected({
                                ...corrected,
                                datestatus: e.target.value,
                              })
                            }
                            className="peer hidden"
                          />
                          <span className="px-4 py-1 rounded-full border cursor-pointer transition peer-checked:bg-red-500 peer-checked:text-white border-gray-300 text-gray-700">
                            No
                          </span>
                        </label>
                      </div>
                    ) : yesNoFields.includes(field) ? (
                      <div className="flex gap-4 items-center">
                        <label>
                          <input
                            type="radio"
                            // name="datestatus"
                            name={field}
                            value="Yes"
                            checked={corrected[field] === "Yes"}
                            onChange={(e) =>
                              setCorrected({
                                ...corrected,
                                [field]: e.target.value,
                              })
                            }
                            className="peer hidden"
                          />
                          <span
                            className={`px-4 py-1 rounded-full border cursor-pointer transition 
          peer-checked:bg-green-500 peer-checked:text-white 
          border-gray-300 text-gray-700`}
                          >
                            Yes
                          </span>
                        </label>

                        <label>
                          <input
                            type="radio"
                            name={field}
                            value="No"
                            checked={corrected[field] === "No"}
                            onChange={(e) =>
                              setCorrected({
                                ...corrected,
                                [field]: e.target.value,
                              })
                            }
                            className="peer hidden"
                          />
                          <span
                            className={`px-4 py-1 rounded-full border cursor-pointer transition 
          peer-checked:bg-red-500 peer-checked:text-white 
          border-gray-300 text-gray-700`}
                          >
                            No
                          </span>
                        </label>
                      </div>
                    ) : textareaFields.includes(field) ? (
                      <textarea
                        name={field}
                        value={corrected[field] || ""}
                        onChange={handleCorrectedChange}
                        placeholder={placeholders[field] || ""}
                        className="w-full h-full border p-1 m-0 resize-none box-border"
                        style={{ minHeight: "60px" }} // adjust height if needed
                      />
                    ) : (
                      <input
                        name={field}
                        value={corrected[field] || ""}
                        onChange={handleCorrectedChange}
                        placeholder={placeholders[field] || ""}
                        className="border w-full p-1 m-0"
                      />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-4 text-right">
            <button
              onClick={handleSave}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityParameters;
