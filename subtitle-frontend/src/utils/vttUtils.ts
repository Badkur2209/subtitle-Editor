// // src/utils/vttUtils.ts

// export function parseVTT(vttText: string) {
//   const segments = [];
//   const blocks = vttText.split(/\n\n+/);

//   for (const block of blocks) {
//     const lines = block.split("\n");
//     if (lines.length >= 2) {
//       const time = lines[0].includes("-->") ? lines[0] : lines[1];
//       const text = lines.slice(lines[0].includes("-->") ? 1 : 2).join("\n");
//       segments.push({ time, text });
//     }
//   }
//   return segments;
// }

// export function generateVTT(segments: { time: string; text: string }[]) {
//   return (
//     "WEBVTT\n\n" +
//     segments.map(s => `${s.time}\n${s.text}`).join("\n\n")
//   );
// }
// utils/vttUtils.ts

export function parseVTT(vttText: string) {
  const lines = vttText.split("\n");
  const segments: { time: string; text: string }[] = [];

  let time = "";
  let text = "";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (!line || line === "WEBVTT" || /^\d+$/.test(line)) continue;

    if (line.includes("-->")) {
      if (time && text) {
        segments.push({ time, text: text.trim() });
        text = "";
      }
      time = line;
    } else {
      text += line + "\n";
    }
  }

  if (time && text) {
    segments.push({ time, text: text.trim() });
  }

  return segments;
}

// ✅ Add this export for saving translated VTT
export function generateVTT(segments: { time: string; text: string }[]) {
  let vtt = "WEBVTT\n\n";

  segments.forEach((seg, index) => {
    vtt += `${index + 1}\n${seg.time}\n${seg.text}\n\n`;
  });

  return vtt;
}
