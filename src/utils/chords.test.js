import { describe, it, expect } from 'vitest';
import {
  transposeChord,
  keyUsesFlats,
  parseChord,
  isValidChord,
  getSemitoneDifference,
  NOTES_SHARP,
  NOTES_FLAT,
} from './chords';

describe('chords utilities', () => {
  describe('transposeChord', () => {
    it('should transpose major chords up by semitones', () => {
      expect(transposeChord('C', 1, false)).toBe('C#');
      expect(transposeChord('C', 2, false)).toBe('D');
      expect(transposeChord('C', 3, false)).toBe('D#');
      expect(transposeChord('C', 12, false)).toBe('C'); // Full octave
    });

    it('should transpose major chords down by semitones', () => {
      expect(transposeChord('C', -1, false)).toBe('B');
      expect(transposeChord('C', -2, false)).toBe('A#');
      expect(transposeChord('C', -3, false)).toBe('A');
    });

    it('should use flats when specified', () => {
      expect(transposeChord('C', 1, true)).toBe('Db');
      expect(transposeChord('C', 3, true)).toBe('Eb');
      expect(transposeChord('F', 1, true)).toBe('Gb');
    });

    it('should preserve chord quality (minor, 7th, etc)', () => {
      expect(transposeChord('Am', 2, false)).toBe('Bm');
      expect(transposeChord('C7', 2, false)).toBe('D7');
      expect(transposeChord('Gmaj7', 3, false)).toBe('A#maj7');
      expect(transposeChord('Dm7', 5, false)).toBe('Gm7');
    });

    it('should handle complex chord qualities', () => {
      expect(transposeChord('Cadd9', 2, false)).toBe('Dadd9');
      expect(transposeChord('Gsus4', 3, false)).toBe('A#sus4');
      expect(transposeChord('Am11', 1, false)).toBe('A#m11');
      expect(transposeChord('Fmaj7', 2, false)).toBe('Gmaj7');
    });

    it('should handle slash chords', () => {
      expect(transposeChord('C/G', 2, false)).toBe('D/G');
      expect(transposeChord('Am/E', 3, false)).toBe('Cm/E');
    });

    it('should handle sharp and flat input chords', () => {
      expect(transposeChord('C#', 1, false)).toBe('D');
      expect(transposeChord('Db', 1, false)).toBe('D');
      expect(transposeChord('Bb', 2, false)).toBe('C');
      expect(transposeChord('F#m', 1, false)).toBe('Gm');
    });

  it('should wrap around octave correctly', () => {
    expect(transposeChord('B', 1, false)).toBe('C');
    expect(transposeChord('B', 2, false)).toBe('C#');
    expect(transposeChord('C', -1, false)).toBe('B');
    expect(transposeChord('C', -2, false)).toBe('A#');
  });

    it('should handle empty or invalid input', () => {
      expect(transposeChord('', 1, false)).toBe('');
      expect(transposeChord('X', 1, false)).toBe('X');
      expect(transposeChord('123', 1, false)).toBe('123');
    });

    it('should handle edge case of transposing by 0', () => {
      expect(transposeChord('C', 0, false)).toBe('C');
      expect(transposeChord('Am7', 0, false)).toBe('Am7');
    });
  });

  describe('keyUsesFlats', () => {
    it('should return true for flat major keys', () => {
      expect(keyUsesFlats('F')).toBe(true);
      expect(keyUsesFlats('Bb')).toBe(true);
      expect(keyUsesFlats('Eb')).toBe(true);
      expect(keyUsesFlats('Ab')).toBe(true);
      expect(keyUsesFlats('Db')).toBe(true);
      expect(keyUsesFlats('Gb')).toBe(true);
      expect(keyUsesFlats('Cb')).toBe(true);
    });

    it('should return true for flat minor keys', () => {
      expect(keyUsesFlats('Dm')).toBe(true);
      expect(keyUsesFlats('Gm')).toBe(true);
      expect(keyUsesFlats('Cm')).toBe(true);
      expect(keyUsesFlats('Fm')).toBe(true);
      expect(keyUsesFlats('Bbm')).toBe(true);
      expect(keyUsesFlats('Ebm')).toBe(true);
    });

    it('should return false for sharp keys', () => {
      expect(keyUsesFlats('C')).toBe(false);
      expect(keyUsesFlats('G')).toBe(false);
      expect(keyUsesFlats('D')).toBe(false);
      expect(keyUsesFlats('A')).toBe(false);
      expect(keyUsesFlats('E')).toBe(false);
      expect(keyUsesFlats('B')).toBe(false);
      expect(keyUsesFlats('Am')).toBe(false);
      expect(keyUsesFlats('Em')).toBe(false);
      expect(keyUsesFlats('Bm')).toBe(false);
    });
  });

  describe('parseChord', () => {
    it('should parse major chords', () => {
      expect(parseChord('C')).toEqual({ root: 'C', quality: '' });
      expect(parseChord('G')).toEqual({ root: 'G', quality: '' });
      expect(parseChord('F#')).toEqual({ root: 'F#', quality: '' });
      expect(parseChord('Bb')).toEqual({ root: 'Bb', quality: '' });
    });

    it('should parse minor chords', () => {
      expect(parseChord('Am')).toEqual({ root: 'A', quality: 'm' });
      expect(parseChord('Dm')).toEqual({ root: 'D', quality: 'm' });
      expect(parseChord('C#m')).toEqual({ root: 'C#', quality: 'm' });
    });

    it('should parse 7th chords', () => {
      expect(parseChord('C7')).toEqual({ root: 'C', quality: '7' });
      expect(parseChord('Gmaj7')).toEqual({ root: 'G', quality: 'maj7' });
      expect(parseChord('Am7')).toEqual({ root: 'A', quality: 'm7' });
    });

    it('should parse complex chords', () => {
      expect(parseChord('Cadd9')).toEqual({ root: 'C', quality: 'add9' });
      expect(parseChord('Gsus4')).toEqual({ root: 'G', quality: 'sus4' });
      expect(parseChord('Ddim')).toEqual({ root: 'D', quality: 'dim' });
      expect(parseChord('Aaug')).toEqual({ root: 'A', quality: 'aug' });
    });

    it('should return null for invalid chords', () => {
      expect(parseChord('X')).toBeNull();
      expect(parseChord('123')).toBeNull();
      expect(parseChord('')).toBeNull();
      expect(parseChord('H')).toBeNull();
    });
  });

  describe('isValidChord', () => {
    it('should return true for valid major chords', () => {
      expect(isValidChord('C')).toBe(true);
      expect(isValidChord('G')).toBe(true);
      expect(isValidChord('F#')).toBe(true);
      expect(isValidChord('Bb')).toBe(true);
    });

    it('should return true for valid minor chords', () => {
      expect(isValidChord('Am')).toBe(true);
      expect(isValidChord('Dm')).toBe(true);
      expect(isValidChord('C#m')).toBe(true);
    });

    it('should return true for valid complex chords', () => {
      expect(isValidChord('C7')).toBe(true);
      expect(isValidChord('Gmaj7')).toBe(true);
      expect(isValidChord('Cadd9')).toBe(true);
      expect(isValidChord('Gsus4')).toBe(true);
    });

    it('should return false for invalid chords', () => {
      expect(isValidChord('X')).toBe(false);
      expect(isValidChord('123')).toBe(false);
      expect(isValidChord('')).toBe(false);
      expect(isValidChord('H')).toBe(false);
      expect(isValidChord('h')).toBe(false);
    });
  });

  describe('getSemitoneDifference', () => {
    it('should calculate semitone difference between notes', () => {
      expect(getSemitoneDifference('C', 'D')).toBe(2);
      expect(getSemitoneDifference('C', 'E')).toBe(4);
      expect(getSemitoneDifference('C', 'G')).toBe(7);
      expect(getSemitoneDifference('C', 'C')).toBe(0);
    });

    it('should handle sharp notes', () => {
      expect(getSemitoneDifference('C', 'C#')).toBe(1);
      expect(getSemitoneDifference('C#', 'D')).toBe(1);
      expect(getSemitoneDifference('F#', 'G#')).toBe(2);
    });

    it('should handle flat notes', () => {
      expect(getSemitoneDifference('C', 'Db')).toBe(1);
      expect(getSemitoneDifference('Bb', 'C')).toBe(2);
      expect(getSemitoneDifference('Eb', 'F')).toBe(2);
    });

    it('should wrap around correctly (no negative results)', () => {
      expect(getSemitoneDifference('G', 'C')).toBe(5); // G to C is +5 (forward)
      expect(getSemitoneDifference('B', 'C')).toBe(1); // B to C is +1
      expect(getSemitoneDifference('C', 'B')).toBe(11); // C to B is +11 (forward wrap)
    });

    it('should return 0 for invalid notes', () => {
      expect(getSemitoneDifference('X', 'C')).toBe(0);
      expect(getSemitoneDifference('C', 'X')).toBe(0);
      expect(getSemitoneDifference('X', 'Y')).toBe(0);
    });
  });

  describe('note scales', () => {
    it('should have correct sharp scale', () => {
      expect(NOTES_SHARP).toEqual(['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']);
    });

    it('should have correct flat scale', () => {
      expect(NOTES_FLAT).toEqual(['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']);
    });

    it('should have same length for both scales', () => {
      expect(NOTES_SHARP.length).toBe(12);
      expect(NOTES_FLAT.length).toBe(12);
    });
  });
});

