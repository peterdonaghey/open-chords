/**
 * Chord utilities for parsing and manipulating guitar chords
 */

// Chromatic scale with sharps and flats
export const NOTES_SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
export const NOTES_FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

// Common chord patterns (root note followed by quality)
const CHORD_REGEX = /^([A-G][#b]?)(.*)$/;

/**
 * Transpose a single chord by a number of semitones
 * @param {string} chord - The chord to transpose (e.g., 'Am7', 'C#', 'Bb')
 * @param {number} semitones - Number of semitones to transpose (positive = up, negative = down)
 * @param {boolean} useFlats - Whether to use flats (true) or sharps (false) for accidentals
 * @returns {string} - The transposed chord
 */
export function transposeChord(chord, semitones, useFlats = false) {
  if (!chord || chord.trim() === '') return chord;

  const match = chord.match(CHORD_REGEX);
  if (!match) return chord; // Not a valid chord, return as-is

  const [, root, quality] = match;
  const noteScale = useFlats ? NOTES_FLAT : NOTES_SHARP;

  // Find the root note in the scale
  let noteIndex = noteScale.indexOf(root);

  // If not found, try the other scale
  if (noteIndex === -1) {
    const altScale = useFlats ? NOTES_SHARP : NOTES_FLAT;
    noteIndex = altScale.indexOf(root);
    if (noteIndex === -1) return chord; // Invalid note
  }

  // Transpose by semitones (modulo 12 for octave wrapping)
  const newIndex = (noteIndex + semitones + 12) % 12;
  const newRoot = noteScale[newIndex];

  return newRoot + quality;
}

/**
 * Detect if a key signature typically uses flats or sharps
 * @param {string} key - The key signature (e.g., 'C', 'Am', 'Eb')
 * @returns {boolean} - True if key uses flats, false if sharps
 */
export function keyUsesFlats(key) {
  const flatKeys = ['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb', 'Dm', 'Gm', 'Cm', 'Fm', 'Bbm', 'Ebm'];
  return flatKeys.some(flatKey => key.startsWith(flatKey));
}

/**
 * Parse a chord to extract root note and quality
 * @param {string} chord - The chord to parse
 * @returns {{root: string, quality: string} | null} - Parsed chord or null
 */
export function parseChord(chord) {
  const match = chord.match(CHORD_REGEX);
  if (!match) return null;

  const [, root, quality] = match;
  return { root, quality };
}

/**
 * Validate if a string is a valid chord
 * @param {string} chord - The chord to validate
 * @returns {boolean} - True if valid chord
 */
export function isValidChord(chord) {
  return CHORD_REGEX.test(chord);
}

/**
 * Get the semitone difference between two notes
 * @param {string} fromNote - Starting note
 * @param {string} toNote - Target note
 * @returns {number} - Semitone difference
 */
export function getSemitoneDifference(fromNote, toNote) {
  let fromIndex = NOTES_SHARP.indexOf(fromNote);
  if (fromIndex === -1) fromIndex = NOTES_FLAT.indexOf(fromNote);

  let toIndex = NOTES_SHARP.indexOf(toNote);
  if (toIndex === -1) toIndex = NOTES_FLAT.indexOf(toNote);

  if (fromIndex === -1 || toIndex === -1) return 0;

  let diff = toIndex - fromIndex;
  // Handle wrapping
  if (diff < 0) diff += 12;

  return diff;
}
