/**
 * Chord utilities for parsing and manipulating guitar chords
 */

// Chromatic scale with sharps and flats
export const NOTES_SHARP: readonly string[] = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
export const NOTES_FLAT: readonly string[] = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

// Simple chord pattern: note (A-G) + optional (#/b) + quality
const CHORD_REGEX = /^([A-G][#b]?)(.*)$/;

export interface ParsedChord {
  root: string;
  quality: string;
}

/**
 * Transpose a single chord by a number of semitones
 */
export function transposeChord(chord: string, semitones: number, useFlats = false): string {
  if (!chord || chord.trim() === '') return chord;

  const match = chord.match(CHORD_REGEX);
  if (!match) return chord;

  const [, root, quality] = match;
  const noteScale = useFlats ? NOTES_FLAT : NOTES_SHARP;

  let noteIndex = noteScale.indexOf(root);
  if (noteIndex === -1) {
    const altScale = useFlats ? NOTES_SHARP : NOTES_FLAT;
    noteIndex = altScale.indexOf(root);
    if (noteIndex === -1) return chord;
  }

  const newIndex = ((noteIndex + semitones) % 12 + 12) % 12;
  const newRoot = noteScale[newIndex];

  return newRoot + quality;
}

/**
 * Detect if a key signature typically uses flats or sharps
 */
export function keyUsesFlats(key: string): boolean {
  const flatKeys = ['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb', 'Dm', 'Gm', 'Cm', 'Fm', 'Bbm', 'Ebm'];
  return flatKeys.some(flatKey => key.startsWith(flatKey));
}

/**
 * Parse a chord to extract root note and quality
 */
export function parseChord(chord: string): ParsedChord | null {
  const match = chord.match(CHORD_REGEX);
  if (!match) return null;

  const [, root, quality] = match;
  return { root, quality };
}

/**
 * Validate if a string is a valid chord
 */
export function isValidChord(chord: string): boolean {
  return CHORD_REGEX.test(chord);
}

/**
 * Get the semitone difference between two notes
 */
export function getSemitoneDifference(fromNote: string, toNote: string): number {
  let fromIndex = NOTES_SHARP.indexOf(fromNote);
  if (fromIndex === -1) fromIndex = NOTES_FLAT.indexOf(fromNote);

  let toIndex = NOTES_SHARP.indexOf(toNote);
  if (toIndex === -1) toIndex = NOTES_FLAT.indexOf(toNote);

  if (fromIndex === -1 || toIndex === -1) return 0;

  let diff = toIndex - fromIndex;
  if (diff < 0) diff += 12;

  return diff;
}
