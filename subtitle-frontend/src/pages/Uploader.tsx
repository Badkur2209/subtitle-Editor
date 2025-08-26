import React, { useState } from "react";

const DUMMY_CHANNELS = [
  { id: 1, name: "YogaChannel" },
  { id: 2, name: "AyurvedInsights" },
];

function Uploader() {
  const [channels, setChannels] = useState(DUMMY_CHANNELS);
  const [selectedChannel, setSelectedChannel] = useState("");
  const [newChannel, setNewChannel] = useState("");
  const [vttFiles, setVttFiles] = useState([]);
  const [fileInfo, setFileInfo] = useState([]); // [{file, link}]
  const [uploadDate, setUploadDate] = useState("");
  const [error, setError] = useState("");

  // Handle channel select or addition
  const handleAddChannel = () => {
    if (!newChannel.trim()) return;
    const id = channels.length ? Math.max(...channels.map((c) => c.id)) + 1 : 1;
    setChannels([...channels, { id, name: newChannel }]);
    setSelectedChannel(id.toString());
    setNewChannel("");
  };

  // Handle VTT files selection
  const handleVttChange = (e) => {
    const files = Array.from(e.target.files);
    setVttFiles(files);

    // Initialize fileInfo for each file
    setFileInfo(
      files.map((file) => ({
        file,
        link: "",
      }))
    );
  };

  // Handle link assignment for each file
  const handleLinkChange = (idx, value) => {
    setFileInfo((prev) =>
      prev.map((x, i) => (i === idx ? { ...x, link: value } : x))
    );
  };

  // Handle upload
  const handleUpload = () => {
    setError("");
    if (!selectedChannel) {
      setError("Please select or add a YouTube channel.");
      return;
    }
    if (!uploadDate) {
      setError("Please select the upload date.");
      return;
    }
    if (!vttFiles.length) {
      setError("Please choose at least one VTT file.");
      return;
    }
    if (fileInfo.some((x) => !x.link.trim())) {
      setError("Each VTT file must have a related YouTube video link.");
      return;
    }
    // Here add your backend upload logic!
    alert("Files and data submitted (mock).");
    // Clear after upload if needed
    setVttFiles([]);
    setFileInfo([]);
    setUploadDate("");
  };

  return (
    <div className="p-6 max-w-full mx-auto">
      <h2 className="text-2xl font-bold mb-4">Uploader</h2>

      {/* Channel selection */}
      <label className="block font-medium mb-1">YouTube Channel</label>
      <div className="flex gap-2 mb-3">
        <select
          className="p-2 border rounded flex-1"
          value={selectedChannel}
          onChange={(e) => setSelectedChannel(e.target.value)}
        >
          <option value="">-- Select Channel --</option>
          {channels.map((ch) => (
            <option key={ch.id} value={ch.id}>
              {ch.name}
            </option>
          ))}
        </select>
        <input
          className="p-2 w-1/2 border rounded flex-1"
          placeholder="Add new channel"
          value={newChannel}
          onChange={(e) => setNewChannel(e.target.value)}
        />
        <button
          className="bg-blue-600 text-white px-3 py-1 rounded"
          type="button"
          onClick={handleAddChannel}
        >
          Add
        </button>
      </div>

      {/* VTT file upload */}
      <label className="block w-1/2 font-medium mb-1">Select VTT Files</label>
      <input
        type="file"
        accept=".vtt"
        multiple
        className="block mb-4"
        onChange={handleVttChange}
      />

      {/* Upload date */}
      <label className="block w-1/2 font-medium mb-1">Upload Date</label>
      <input
        type="date"
        value={uploadDate}
        onChange={(e) => setUploadDate(e.target.value)}
        className="p-2 w-1/2 border rounded mb-4 block"
      />

      {/* Enter YouTube link for each VTT */}
      {vttFiles.length > 0 && (
        <div className="mb-4">
          <h3 className="font-semibold mb-2">YouTube Video Links</h3>
          {vttFiles.map((file, i) => (
            <div key={file.name} className="mb-2">
              <div className="text-sm mb-1">
                <b>{file.name}</b>
              </div>
              <input
                className="w-1/2 p-2 border rounded"
                type="url"
                placeholder="Paste related YouTube video link here"
                value={fileInfo[i]?.link || ""}
                onChange={(e) => handleLinkChange(i, e.target.value)}
                required
              />
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && <div className="text-red-600 mb-3">{error}</div>}

      {/* Upload Btn */}
      <button
        className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
        type="button"
        onClick={handleUpload}
      >
        Upload
      </button>
    </div>
  );
}

export default Uploader;
