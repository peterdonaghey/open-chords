import { parseUGFormat, transposeParsedSong, formatToUGText } from './parser';
import { transposeChord, keyUsesFlats, getSemitoneDifference } from '../utils/chords';

/**
 * Transpose a song in Ultimate Guitar format
 */
export function transposeSong(
  songText: string,
  semitones: number,
  originalKey: string | null = null
): string {
  const parsed = parseUGFormat(songText);
  const transposed = transposeParsedSong(parsed, semitones, originalKey);
  return formatToUGText(transposed);
}

/**
 * Transpose a song to a target key
 */
export function transposeSongToKey(songText: string, fromKey: string, toKey: string): string {
  const semitones = getSemitoneDifference(fromKey, toKey);
  return transposeSong(songText, semitones, toKey);
}

/**
 * Get the transposed key after applying semitone shift
 */
export function getTransposedKey(originalKey: string | null, semitones: number): string | null {
  if (!originalKey) return null;
  const useFlats = keyUsesFlats(originalKey);
  return transposeChord(originalKey, semitones, useFlats);
}

export default {
  transposeSong,
  transposeSongToKey,
  getTransposedKey,
};
