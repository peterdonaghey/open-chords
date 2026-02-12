import { transposeChord, keyUsesFlats } from '../utils/chords';
import type { ParsedLine, ChordPosition } from '../types/song';

/**
 * Parse Ultimate Guitar format song text
 * Format: Chords on one line, lyrics on the next line
 * Section markers in square brackets: [Verse 1], [Chorus], etc.
 */

/**
 * Parse a song in Ultimate Guitar format
 */
export function parseUGFormat(text: string | null | undefined): ParsedLine[] {
  if (!text) return [];

  const lines = text.split('\n');
  const parsed: ParsedLine[] = [];

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

function isChordLine(line: string): boolean {
  if (!line.trim()) return false;

  const chordPattern = /(?<![A-Za-z])[A-G][#b]?(m|maj|min|dim|aug|sus|add)?\d*(?![A-Za-z#b])/g;
  const matches = line.match(chordPattern);

  if (!matches || matches.length === 0) return false;

  const totalLength = line.length;
  const chordLength = matches.join('').length;
  const ratio = chordLength / totalLength;

  return ratio > 0.15 || line.trim().split(/\s+/).length <= 6;
}

function extractChords(line: string): ChordPosition[] {
  const chordPattern = /(?<![A-Za-z])([A-G][#b]?(?:m|maj|min|dim|aug|sus|add)?\d*(?:\/[A-G][#b]?)?)(?![A-Za-z#b])/g;
  const chords: ChordPosition[] = [];
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
 */
export function transposeParsedSong(
  parsedLines: ParsedLine[],
  semitones: number,
  originalKey: string | null = null
): ParsedLine[] {
  const useFlats = originalKey ? keyUsesFlats(originalKey) : false;

  return parsedLines.map((line) => {
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
 */
export function formatToUGText(parsedLines: ParsedLine[]): string {
  return parsedLines
    .map((line) => {
      switch (line.type) {
        case 'section':
          return line.content;
        case 'chord-line':
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

function reconstructChordLine(chords: ChordPosition[]): string {
  if (!chords || chords.length === 0) return '';

  const sorted = [...chords].sort((a, b) => a.position - b.position);
  let result = '';
  let currentPos = 0;

  sorted.forEach(({ chord, position }) => {
    const spacesNeeded = Math.max(position - currentPos, result.length > 0 ? 1 : 0);
    result += ' '.repeat(spacesNeeded) + chord;
    currentPos = position + chord.length;
  });

  return result;
}

export interface ExtractedMetadata {
  title: string | null;
  artist: string | null;
  key: string | null;
}

/**
 * Extract metadata from song text (title, artist, key)
 */
export function extractMetadata(text: string): ExtractedMetadata {
  const metadata: ExtractedMetadata = {
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
