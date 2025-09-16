import React, { useState, FormEvent, useEffect, ChangeEvent } from "react";

type Channel = { id: number; channel_name: string };
type VideoRow = { video_title: string; link: string };

// Fully implemented VideoForm component
const VideoForm: React.FC = () => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannelId, setSelectedChannelId] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [videos, setVideos] = useState<VideoRow[]>([]);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>("");

  // Fetch channels on mount
  useEffect(() => {
    fetch("http://localhost:5000/api/channels")
      .then((res) => res.json())
      .then((data) => setChannels(data))
      .catch(() => setError("Failed to load channels"));
  }, []);

  // Parse CSV file on upload
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setError("");
    setResult("");
    setVideos([]);
    if (!e.target.files || e.target.files.length === 0) {
      setFile(null);
      return;
    }
    const uploadedFile = e.target.files[0];
    setFile(uploadedFile);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result;
      if (typeof text === "string") {
        parseCSV(text);
      }
    };
    reader.readAsText(uploadedFile);
  };

  // Simple CSV parser assuming header row with video_title, link
  const parseCSV = (text: string) => {
    const lines = text.trim().split("\n");
    if (lines.length < 2) {
      setError("CSV file has no data");
      return;
    }

    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
    if (!headers.includes("video_title") || !headers.includes("link")) {
      setError("CSV must contain 'video_title' and 'link' columns");
      return;
    }

    const titleIdx = headers.indexOf("video_title");
    const linkIdx = headers.indexOf("link");

    const rows: VideoRow[] = lines.slice(1).map((line) => {
      const cols = line.split(",");
      return {
        video_title: cols[titleIdx]?.trim() || "",
        link: cols[linkIdx]?.trim() || "",
      };
    });

    setVideos(rows);
  };

  // Submit videos to backend
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setResult("");

    if (!selectedChannelId) {
      setError("Please select a channel");
      return;
    }
    if (!videos.length) {
      setError("No videos to upload");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/videos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel_id: Number(selectedChannelId),
          videos,
        }),
      });

      if (res.ok) {
        setResult("Videos uploaded successfully!");
        setVideos([]);
        setFile(null);
        setSelectedChannelId("");
      } else {
        const data = await res.json();
        setError(data.error || "Failed to upload videos");
      }
    } catch {
      setError("Network error while uploading videos");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full">
      <h3 className="text-xl font-semibold mb-4">Video Upload Form</h3>

      {error && <div className="text-red-600">{error}</div>}
      {result && <div className="text-green-600">{result}</div>}

      <div>
        <label className="block font-medium mb-1" htmlFor="channelSelect">
          Select Channel <span className="text-red-600">*</span>
        </label>
        <select
          id="channelSelect"
          className="border rounded p-2 w-full"
          value={selectedChannelId}
          onChange={(e) => setSelectedChannelId(e.target.value)}
          required
          disabled={loading}
        >
          <option value="">-- Select Channel --</option>
          {channels.map((ch) => (
            <option key={ch.id} value={ch.id}>
              {ch.channel_name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block font-medium mb-1" htmlFor="csvUpload">
          Upload Videos CSV (columns: video_title, link)
          <span className="text-red-600">*</span>
        </label>
        <input
          id="csvUpload"
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          disabled={loading}
        />
      </div>

      {videos.length > 0 && (
        <div className="overflow-x-auto max-h-60 border rounded p-2 bg-gray-50">
          <table className="w-full text-left text-sm">
            <thead>
              <tr>
                <th className="border px-2 py-1">Video Title</th>
                <th className="border px-2 py-1">Link</th>
              </tr>
            </thead>
            <tbody>
              {videos.map((vid, idx) => (
                <tr key={idx}>
                  <td className="border px-2 py-1">{vid.video_title}</td>
                  <td className="border px-2 py-1 break-all">{vid.link}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !videos.length || !selectedChannelId}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-blue-300"
      >
        {loading ? "Uploading..." : "Upload Videos"}
      </button>
    </form>
  );
};

// Channel form with API submit example
const ChannelForm: React.FC = () => {
  const [channelName, setChannelName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [resultMsg, setResultMsg] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setResultMsg(null);
    if (!channelName.trim()) {
      setResultMsg("Channel name is required");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/channels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel_name: channelName, description }),
      });
      if (res.ok) {
        setResultMsg("Channel created successfully!");
        setChannelName("");
        setDescription("");
      } else {
        const data = await res.json();
        setResultMsg(data.error || "Failed to create channel");
      }
    } catch {
      setResultMsg("Network error. Please try again.");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-xl font-semibold">Add New Channel</h3>
      {resultMsg && (
        <div
          className={`${
            resultMsg.includes("success") ? "text-green-600" : "text-red-600"
          }`}
        >
          {resultMsg}
        </div>
      )}
      <div>
        <label className="block font-medium mb-1" htmlFor="channelName">
          Channel Name <span className="text-red-600">*</span>
        </label>
        <input
          id="channelName"
          type="text"
          className="border rounded p-2 w-full"
          value={channelName}
          onChange={(e) => setChannelName(e.target.value)}
          required
          disabled={loading}
        />
      </div>
      <div>
        <label className="block font-medium mb-1" htmlFor="description">
          Description
        </label>
        <textarea
          id="description"
          className="border rounded p-2 w-full"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={loading}
        />
      </div>
      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-blue-300"
        disabled={loading}
      >
        {loading ? "Saving..." : "Create Channel"}
      </button>
    </form>
  );
};

// Placeholder for Daily Prediction form
const DailyPredictionForm: React.FC = () => (
  <div>
    <h3 className="text-xl font-semibold mb-4">Daily Prediction Form</h3>
    <p>Form implementation will go here.</p>
  </div>
);

// Placeholder for 10 Days Prediction form
const TenDayPredictionForm: React.FC = () => (
  <div>
    <h3 className="text-xl font-semibold mb-4">10-Day Prediction Form</h3>
    <p>Form implementation will go here.</p>
  </div>
);

// Placeholder for Translate form
const TranslateForm: React.FC = () => (
  <div>
    <h3 className="text-xl font-semibold mb-4">Translate Form</h3>
    <p>Form implementation will go here.</p>
  </div>
);

const TABS = [
  { key: "channel", label: "Channel", Component: ChannelForm },
  { key: "videos", label: "Videos", Component: VideoForm },
  { key: "daily", label: "Predictions Daily", Component: DailyPredictionForm },
  {
    key: "tenday",
    label: "Prediction 10 Days",
    Component: TenDayPredictionForm,
  },
  { key: "translate", label: "Translate", Component: TranslateForm },
];

const Uploader: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("channel");

  const ActiveForm = TABS.find((tab) => tab.key === activeTab)?.Component;

  return (
    <div className="p-6 w-full mx-auto">
      <h2 className="text-3xl font-bold mb-6">Content Uploader</h2>

      {/* Tabs */}
      <nav className="flex gap-2 mb-6 border-b">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`px-4 py-2 -mb-px rounded-t ${
              activeTab === key
                ? "border border-b-0 border-blue-600 bg-white text-blue-600 font-semibold"
                : "bg-gray-200 text-gray-600 hover:bg-gray-300"
            }`}
          >
            {label}
          </button>
        ))}
      </nav>

      {/* Active Form */}
      <section className="bg-white p-6 rounded shadow">
        {ActiveForm && <ActiveForm />}
      </section>
    </div>
  );
};

export default Uploader;
