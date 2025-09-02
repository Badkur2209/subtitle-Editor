import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface Channel {
  id: number;
  channel_name: string;
  description: string;
}

interface Video {
  id: number;
  channel_id: number;
  video_title: string;
  youtube_link: string;
  vtt_file_path: string;
  has_vtt: boolean;
}

interface SubtitleSegment {
  id?: number;
  segment_index: number;
  start_time: string;
  end_time: string;
  original_text: string;
  translated_text: string;
}

interface TranslationProject {
  id: number;
  video_id: number;
  target_language: string;
  status: string;
}

export default function Translate() {
  const { user } = useAuth();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<number | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [currentProject, setCurrentProject] =
    useState<TranslationProject | null>(null);
  const [segments, setSegments] = useState<SubtitleSegment[]>([]);
  const [targetLanguage, setTargetLanguage] = useState("hi");
  const [loading, setLoading] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  // API helper
  // In your apiCall function, update the base URL:
  const apiCall = async (url: string, options: RequestInit = {}) => {
    const token = localStorage.getItem("token");
    const response = await fetch(
      `http://localhost:5000/api/subtitles${url}`,

      {
        // ← localhost:5000
        ...options,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          ...options.headers,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`API call failed: ${response.statusText}`);
    }

    return response.json();
  };

  // Load channels on mount
  useEffect(() => {
    loadChannels();
  }, []);

  const loadChannels = async () => {
    try {
      setLoading(true);
      const data = await apiCall("/channels");
      setChannels(data);
    } catch (error) {
      console.error("Error loading channels:", error);
      alert("Failed to load channels");
    } finally {
      setLoading(false);
    }
  };

  // Load videos when channel changes
  const handleChannelSelect = async (channelId: number) => {
    try {
      setLoading(true);
      setSelectedChannel(channelId);
      setSelectedVideo(null);
      setCurrentProject(null);
      setSegments([]);

      const data = await apiCall(`/channels/${channelId}/videos`);
      setVideos(data);
    } catch (error) {
      console.error("Error loading videos:", error);
      alert("Failed to load videos");
    } finally {
      setLoading(false);
    }
  };

  // Create/get project and load VTT
  const handleVideoSelect = async (video: Video) => {
    try {
      setLoading(true);
      setSelectedVideo(video);

      // Create or get project
      const projectData = await apiCall("/projects", {
        method: "POST",
        body: JSON.stringify({
          video_id: video.id,
          target_language: targetLanguage,
        }),
      });

      setCurrentProject(projectData);

      // Load VTT and segments
      const vttData = await apiCall(`/projects/${projectData.id}/load-vtt`);
      setSegments(vttData.segments || []);

      if (vttData.segments.length === 0) {
        alert(
          "No VTT file found for this video. You can manually add segments."
        );
      }
    } catch (error) {
      console.error("Error loading video:", error);
      alert("Failed to load video");
    } finally {
      setLoading(false);
    }
  };
  const loadVTTManually = async () => {
    if (!currentProject) return;
    try {
      setLoading(true);
      const vttData = await apiCall(`/projects/${currentProject.id}/load-vtt`);
      setSegments(vttData.segments || []);
      alert(`Loaded ${vttData.segments.length} segments from VTT`);
    } catch (error) {
      console.error("Error loading VTT manually:", error);
      alert("Failed to load VTT");
    } finally {
      setLoading(false);
    }
  };

  // Update segment
  const updateSegment = (
    index: number,
    field: keyof SubtitleSegment,
    value: string
  ) => {
    const updated = [...segments];
    updated[index] = { ...updated[index], [field]: value };
    setSegments(updated);
  };

  // Add new segment
  const addSegment = () => {
    const newSegment: SubtitleSegment = {
      segment_index: segments.length,
      start_time: "00:00:00.000",
      end_time: "00:00:05.000",
      original_text: "",
      translated_text: "",
    };
    setSegments([...segments, newSegment]);
  };

  // Delete segment
  const deleteSegment = (index: number) => {
    const updated = segments.filter((_, i) => i !== index);
    updated.forEach((seg, i) => {
      seg.segment_index = i;
    });
    setSegments(updated);
  };

  // Save to database
  const handleSave = async () => {
    if (!currentProject) return;

    try {
      setLoading(true);
      await apiCall(`/projects/${currentProject.id}/segments`, {
        method: "POST",
        body: JSON.stringify({ segments }),
      });
      alert("Translation saved successfully!");
    } catch (error) {
      console.error("Error saving:", error);
      alert("Failed to save translation");
    } finally {
      setLoading(false);
    }
  };

  // Export functions
  const exportToVTT = () => {
    if (!selectedVideo || segments.length === 0) return;

    let vttContent = "WEBVTT\n\n";
    segments.forEach((seg, index) => {
      vttContent += `${index + 1}\n`;
      vttContent += `${seg.start_time} --> ${seg.end_time}\n`;
      vttContent += `${seg.translated_text || seg.original_text}\n\n`;
    });

    const blob = new Blob([vttContent], { type: "text/vtt" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedVideo.video_title.replace(
      /[^a-zA-Z0-9]/g,
      "_"
    )}_${targetLanguage}.vtt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportToSRT = () => {
    if (!selectedVideo || segments.length === 0) return;

    let srtContent = "";
    segments.forEach((seg, index) => {
      const startTime = seg.start_time.replace(".", ",");
      const endTime = seg.end_time.replace(".", ",");

      srtContent += `${index + 1}\n`;
      srtContent += `${startTime} --> ${endTime}\n`;
      srtContent += `${seg.translated_text || seg.original_text}\n\n`;
    });

    const blob = new Blob([srtContent], { type: "text/srt" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedVideo.video_title.replace(
      /[^a-zA-Z0-9]/g,
      "_"
    )}_${targetLanguage}.srt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Scroll sync effect
  useEffect(() => {
    const original = document.getElementById("originalBox");
    const translate = document.getElementById("translateBox");

    if (!original || !translate) return;

    let isSyncing = false;
    const syncScroll = (source: HTMLElement, target: HTMLElement) => {
      if (isSyncing) return;
      isSyncing = true;
      const percent =
        source.scrollTop / (source.scrollHeight - source.clientHeight);
      target.scrollTop = percent * (target.scrollHeight - target.clientHeight);
      setTimeout(() => (isSyncing = false), 10);
    };

    const onOriginal = () => syncScroll(original, translate);
    const onTranslate = () => syncScroll(translate, original);

    original.addEventListener("scroll", onOriginal);
    translate.addEventListener("scroll", onTranslate);

    return () => {
      original.removeEventListener("scroll", onOriginal);
      translate.removeEventListener("scroll", onTranslate);
    };
  }, [segments]);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Translation Editor</h1>

      {/* Selection Controls */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Channel</label>
          <select
            className="w-full p-2 border rounded"
            onChange={(e) =>
              e.target.value
                ? handleChannelSelect(Number(e.target.value))
                : null
            }
            value={selectedChannel || ""}
          >
            <option value="">-- Select Channel --</option>
            {channels.map((channel) => (
              <option key={channel.id} value={channel.id}>
                {channel.channel_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Video</label>
          <select
            className="w-full p-2 border rounded"
            onChange={(e) => {
              const video = videos.find((v) => v.id === Number(e.target.value));
              if (video) handleVideoSelect(video);
            }}
            value={selectedVideo?.id || ""}
            disabled={!selectedChannel}
          >
            <option value="">-- Select Video --</option>
            {videos.map((video) => (
              <option key={video.id} value={video.id}>
                {video.video_title} {video.has_vtt ? "📄" : ""}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Target Language
          </label>
          <select
            className="w-full p-2 border rounded"
            value={targetLanguage}
            onChange={(e) => setTargetLanguage(e.target.value)}
          >
            <option value="hi">Hindi</option>
            <option value="gu">Gujarati</option>
            <option value="mr">Marathi</option>
            <option value="bn">Bengali</option>
            <option value="te">Telugu</option>
          </select>
        </div>

        <div className="flex items-end">
          <button
            onClick={addSegment}
            disabled={!selectedVideo}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
          >
            Add Segment
          </button>
          <button
            onClick={loadVTTManually}
            disabled={!currentProject}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
          >
            Load VTT
          </button>
        </div>
      </div>

      {/* YouTube Embed */}
      {selectedVideo && (
        <iframe
          className="w-full h-64 rounded"
          src={`https://www.youtube.com/embed/${
            selectedVideo.youtube_link.split("v=")[1]?.split("&")[0]
          }`}
          allowFullScreen
        />
      )}

      {/* Translation Editor */}
      {selectedVideo && (
        <div className="grid grid-cols-2 gap-4">
          {/* Original */}
          <div
            id="originalBox"
            className="overflow-y-auto h-[500px] border rounded p-4 bg-white"
          >
            <h2 className="font-semibold mb-4 text-lg">Original (From VTT)</h2>
            {segments.map((seg, i) => (
              <div key={i} className="mb-4 p-3 border rounded">
                <div className="flex justify-between items-center mb-2">
                  <div className="text-sm font-mono text-gray-500">
                    {seg.start_time} → {seg.end_time}
                  </div>
                  <button
                    onClick={() => deleteSegment(i)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Delete
                  </button>
                </div>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Start time"
                      className="w-24 p-1 border rounded text-xs"
                      value={seg.start_time}
                      onChange={(e) =>
                        updateSegment(i, "start_time", e.target.value)
                      }
                    />
                    <input
                      type="text"
                      placeholder="End time"
                      className="w-24 p-1 border rounded text-xs"
                      value={seg.end_time}
                      onChange={(e) =>
                        updateSegment(i, "end_time", e.target.value)
                      }
                    />
                  </div>
                  <textarea
                    rows={2}
                    className="w-full p-2 border rounded resize-none bg-gray-50"
                    placeholder="Original text (from VTT)..."
                    value={seg.original_text}
                    onChange={(e) =>
                      updateSegment(i, "original_text", e.target.value)
                    }
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Translation */}
          <div
            id="translateBox"
            className="overflow-y-auto h-[500px] border rounded p-4 bg-white"
          >
            <h2 className="font-semibold mb-4 text-lg">
              Translation ({targetLanguage.toUpperCase()})
            </h2>
            {segments.map((seg, i) => (
              <div key={i} className="mb-4 p-3 border rounded">
                <div className="text-sm font-mono text-gray-500 mb-2">
                  {seg.start_time} → {seg.end_time}
                </div>
                <textarea
                  rows={3}
                  className="w-full p-2 border rounded resize-none"
                  placeholder={`Translation in ${targetLanguage.toUpperCase()}...`}
                  value={seg.translated_text}
                  onChange={(e) =>
                    updateSegment(i, "translated_text", e.target.value)
                  }
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {selectedVideo && (
        <div className="flex gap-4">
          <button
            onClick={handleSave}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save to Database"}
          </button>

          {/* Export Options */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="border border-blue-600 text-blue-600 px-6 py-2 rounded hover:bg-blue-50"
            >
              Export ▼
            </button>

            {showExportMenu && (
              <div className="absolute top-full left-0 mt-1 bg-white border rounded shadow-lg z-10">
                <button
                  onClick={() => {
                    exportToVTT();
                    setShowExportMenu(false);
                  }}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  Export as VTT
                </button>
                <button
                  onClick={() => {
                    exportToSRT();
                    setShowExportMenu(false);
                  }}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  Export as SRT
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => {
              setSelectedVideo(null);
              setCurrentProject(null);
              setSegments([]);
            }}
            className="border border-gray-300 px-6 py-2 rounded hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}
