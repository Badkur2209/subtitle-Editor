// Parse VTT file content into segments
export const parseVTT = (vttContent) => {
  const lines = vttContent.split('\n');
  const segments = [];
  let currentSegment = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip empty lines and WEBVTT header
    if (!line || line === 'WEBVTT') continue;
    
    // Skip cue numbers (just numbers)
    if (line.match(/^\d+$/)) continue;
    
    // Time line (contains -->)
    if (line.includes(' --> ')) {
      // Save previous segment if exists
      if (currentSegment) {
        segments.push(currentSegment);
      }
      
      // Start new segment
      const [startTime, endTime] = line.split(' --> ');
      currentSegment = {
        start_time: startTime.trim(),
        end_time: endTime.trim(),
        text: ''
      };
    }
    // Text line
    else if (currentSegment && line) {
      if (currentSegment.text) {
        currentSegment.text += '\n';
      }
      currentSegment.text += line;
    }
    // Empty line indicates end of segment
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
