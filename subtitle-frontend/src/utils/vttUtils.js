// Parse VTT file content
export const parseVTT = (vttContent) => {
  const lines = vttContent.split("\n");
  const segments = [];
  let currentSegment = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Skip empty lines and WEBVTT header
    if (!line || line === "WEBVTT") continue;

    // Time line (contains -->)
    if (line.includes(" --> ")) {
      currentSegment = {
        time: line,
        text: "",
      };
    }
    // Text line
    else if (currentSegment && line && !line.match(/^\d+$/)) {
      if (currentSegment.text) {
        currentSegment.text += "\n";
      }
      currentSegment.text += line;
    }
    // End of segment
    else if (currentSegment && !line) {
      segments.push(currentSegment);
      currentSegment = null;
    }
  }

  // Don't forget the last segment
  if (currentSegment) {
    segments.push(currentSegment);
  }

  return segments;
};

// Generate VTT content from segments
export const generateVTT = (segments) => {
  let vttContent = "WEBVTT\n\n";

  segments.forEach((seg, index) => {
    vttContent += `${index + 1}\n`;
    vttContent += `${seg.start_time} --> ${seg.end_time}\n`;
    vttContent += `${seg.translated_text || seg.original_text}\n\n`;
  });

  return vttContent;
};
