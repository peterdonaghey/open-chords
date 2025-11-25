import { parseUGFormat, transposeParsedSong, formatToUGText } from './parser';
import { transposeChord, keyUsesFlats, getSemitoneDifference } from '../utils/chords';

/**
 * Transpose a song in Ultimate Guitar format
 * @param {string} songText - Original song text
 * @param {number} semitones - Number of semitones to transpose (+/-)
 * @param {string} originalKey - Original key signature (optional)
 * @returns {string} - Transposed song text
 */
export function transposeSong(songText, semitones, originalKey = null) {
  const parsed = parseUGFormat(songText);
  const transposed = transposeParsedSong(parsed, semitones, originalKey);
  return formatToUGText(transposed);
}

/**
 * Transpose a song to a target key
 * @param {string} songText - Original song text
 * @param {string} fromKey - Original key
 * @param {string} toKey - Target key
 * @returns {string} - Transposed song text
 */
export function transposeSongToKey(songText, fromKey, toKey) {
  const semitones = getSemitoneDifference(fromKey, toKey);
  return transposeSong(songText, semitones, fromKey);
}

/**
 * Get the transposed key after applying semitone shift
 * @param {string} originalKey - Original key signature
 * @param {number} semitones - Number of semitones
 * @returns {string} - New key signature
 */
export function getTransposedKey(originalKey, semitones) {
  if (!originalKey) return null;
  const useFlats = keyUsesFlats(originalKey);
  return transposeChord(originalKey, semitones, useFlats);
}

export default {
  transposeSong,
  transposeSongToKey,
  getTransposedKey,
};
