// utils/vtt.js

// Parses a WebVTT string into array of { start, end, text }
export function parseVTTString(vttText) {
  const lines = vttText.replace(/\r/g, "").split("\n");
  const segments = [];
  let cur = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Timestamp line: 00:00:00.000 --> 00:00:02.000
    if (line.includes("-->") && /\d{2}:\d{2}:\d{2}\.\d{3}/.test(line)) {
      if (cur) segments.push(cur);
      const [start, end] = line.split("-->").map((s) => s.trim());
      cur = { start, end, text: "" };
      continue;
    }

    if (cur) {
      cur.text = (cur.text ? cur.text + "\n" : "") + line;
    }
  }
  if (cur) segments.push(cur);
  return segments;
}

// Builds a WebVTT string from segments and a map of translations
export function buildVTT(segments, translationByIndex) {
  const body = segments
    .map(
      (seg, i) => `${seg.start} --> ${seg.end}\n${translationByIndex[i] || ""}`
    )
    .join("\n\n");
  return `WEBVTT\n\n${body}\n`;
}
