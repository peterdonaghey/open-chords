import { transposeChord, keyUsesFlats } from '../utils/chords';

/**
 * Parse Ultimate Guitar format song text
 * Format: Chords on one line, lyrics on the next line
 * Section markers in square brackets: [Verse 1], [Chorus], etc.
 */

/**
 * Parse a song in Ultimate Guitar format
 * @param {string} text - Raw song text
 * @returns {Array<Object>} - Array of parsed lines with type and content
 */
export function parseUGFormat(text) {
  if (!text) return [];

  const lines = text.split('\n');
  const parsed = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();

    // Check if it's a section marker
    if (trimmedLine.match(/^\[.*\]$/)) {
      parsed.push({
        type: 'section',
        content: trimmedLine,
      });
      continue;
    }

    // Check if it's a chord line (next line exists and current line has chords)
    if (isChordLine(line) && i + 1 < lines.length) {
      const nextLine = lines[i + 1];
      parsed.push({
        type: 'chord-line',
        chords: extractChords(line),
        lyrics: nextLine,
      });
      i++; // Skip the next line since we've already processed it
      continue;
    }

    // Check if it's just a lyric line (no chords above it)
    if (trimmedLine && !isChordLine(line)) {
      parsed.push({
        type: 'lyric',
        content: line,
      });
      continue;
    }

    // Empty line
    if (!trimmedLine) {
      parsed.push({
        type: 'empty',
        content: '',
      });
    }
  }

  return parsed;
}

/**
 * Check if a line contains chords
 * Heuristic: Line has chord-like patterns and mostly spaces between them
 */
function isChordLine(line) {
  if (!line.trim()) return false;

  // Look for common chord patterns
  // Use lookbehind/lookahead instead of \b because # is not a word character
  const chordPattern = /(?<![A-Za-z])[A-G][#b]?(m|maj|min|dim|aug|sus|add)?\d*(?![A-Za-z#b])/g;
  const matches = line.match(chordPattern);

  if (!matches || matches.length === 0) return false;

  // Check if the line is mostly chords and spaces (not continuous text)
  const totalLength = line.length;
  const chordLength = matches.join('').length;
  const ratio = chordLength / totalLength;

  // If chords make up less than 30% and there are lots of characters,
  // it's probably lyrics with some chord-like words
  return ratio > 0.15 || line.trim().split(/\s+/).length <= 6;
}

/**
 * Extract chord positions from a chord line
 * Returns array of {chord: string, position: number}
 */
function extractChords(line) {
  // Use lookbehind/lookahead instead of \b word boundaries
  // because \b doesn't work correctly with # (e.g., "F#" would only match "F")
  const chordPattern = /(?<![A-Za-z])([A-G][#b]?(?:m|maj|min|dim|aug|sus|add)?\d*(?:\/[A-G][#b]?)?)(?![A-Za-z#b])/g;
  const chords = [];
  let match;

  while ((match = chordPattern.exec(line)) !== null) {
    chords.push({
      chord: match[1],
      position: match.index,
    });
  }

  return chords;
}

/**
 * Transpose all chords in a parsed song
 * @param {Array<Object>} parsedLines - Parsed song lines
 * @param {number} semitones - Number of semitones to transpose
 * @param {string} originalKey - Original key signature (optional)
 * @returns {Array<Object>} - Transposed parsed lines
 */
export function transposeParsedSong(parsedLines, semitones, originalKey = null) {
  const useFlats = originalKey ? keyUsesFlats(originalKey) : false;

  return parsedLines.map(line => {
    if (line.type === 'chord-line') {
      return {
        ...line,
        chords: line.chords.map(({ chord, position }) => ({
          chord: transposeChord(chord, semitones, useFlats),
          position,
        })),
      };
    }
    return line;
  });
}

/**
 * Format parsed lines back to Ultimate Guitar format text
 * @param {Array<Object>} parsedLines - Parsed song lines
 * @returns {string} - Formatted song text
 */
export function formatToUGText(parsedLines) {
  return parsedLines
    .map(line => {
      switch (line.type) {
        case 'section':
          return line.content;
        case 'chord-line':
          // Reconstruct chord line with proper spacing
          const chordLine = reconstructChordLine(line.chords);
          return chordLine + '\n' + line.lyrics;
        case 'lyric':
          return line.content;
        case 'empty':
          return '';
        default:
          return '';
      }
    })
    .join('\n');
}

/**
 * Reconstruct a chord line from chord positions
 */
function reconstructChordLine(chords) {
  if (!chords || chords.length === 0) return '';

  // Find the maximum position to determine line length
  const maxPos = Math.max(...chords.map(c => c.position + c.chord.length));
  const line = new Array(maxPos + 1).fill(' ');

  // Place each chord at its position
  chords.forEach(({ chord, position }) => {
    for (let i = 0; i < chord.length; i++) {
      line[position + i] = chord[i];
    }
  });

  return line.join('');
}

/**
 * Extract metadata from song text (title, artist, key)
 * Looks for patterns like "Title: Song Name" or "Artist: Artist Name"
 */
export function extractMetadata(text) {
  const metadata = {
    title: null,
    artist: null,
    key: null,
  };

  const lines = text.split('\n');

  for (const line of lines) {
    const titleMatch = line.match(/^Title:\s*(.+)$/i);
    if (titleMatch) {
      metadata.title = titleMatch[1].trim();
      continue;
    }

    const artistMatch = line.match(/^Artist:\s*(.+)$/i);
    if (artistMatch) {
      metadata.artist = artistMatch[1].trim();
      continue;
    }

    const keyMatch = line.match(/^Key:\s*([A-G][#b]?m?)$/i);
    if (keyMatch) {
      metadata.key = keyMatch[1].trim();
      continue;
    }
  }

  return metadata;
}
