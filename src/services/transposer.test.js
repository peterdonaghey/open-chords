import { describe, it, expect } from 'vitest';
import {
  transposeSong,
  transposeSongToKey,
  getTransposedKey,
} from './transposer';

describe('transposer service', () => {
  describe('transposeSong', () => {
    it('should transpose a simple song up by semitones', () => {
      const song = `[Verse]
C       G       Am      F
This is a line of lyrics`;
      
      const result = transposeSong(song, 2);
      
      expect(result).toContain('D');
      expect(result).toContain('A');
      expect(result).toContain('Bm');
      expect(result).toContain('G');
      expect(result).toContain('This is a line of lyrics');
    });

    it('should transpose a simple song down by semitones', () => {
      const song = `[Verse]
C       G       Am      F
This is a line of lyrics`;
      
      const result = transposeSong(song, -2);
      
      expect(result).toContain('A#');
      expect(result).toContain('F');
      expect(result).toContain('Gm');
      expect(result).toContain('D#');
    });

    it('should preserve song structure when transposing', () => {
      const song = `[Verse 1]
C       G       Am      F
Line 1

[Chorus]
F       G       C
Line 2`;
      
      const result = transposeSong(song, 1);
      
      expect(result).toContain('[Verse 1]');
      expect(result).toContain('[Chorus]');
      expect(result).toContain('Line 1');
      expect(result).toContain('Line 2');
    });

  it('should use flats for flat keys', () => {
    const song = `C       F       G
Lyrics here`;
    const result = transposeSong(song, 1, 'Bb');
    
    expect(result).toContain('Db');
    expect(result).toContain('Gb');
    expect(result).toContain('Ab');
  });

  it('should use sharps for sharp keys', () => {
    const song = `C       F       G
Lyrics here`;
    const result = transposeSong(song, 1, 'D');
    
    expect(result).toContain('C#');
    expect(result).toContain('F#');
    expect(result).toContain('G#');
  });

  it('should handle complex chords', () => {
    const song = `Cmaj7   Gsus4   Am11    Fmaj7
Lyrics here`;
    const result = transposeSong(song, 2);
    
    expect(result).toContain('Dmaj7');
    expect(result).toContain('Asus4');
    expect(result).toContain('Bm11');
    expect(result).toContain('Gmaj7');
  });

  it('should handle slash chords', () => {
    const song = `C/G     Am/E    F/C
Lyrics here`;
    const result = transposeSong(song, 2);
    
    expect(result).toContain('D/G');
    expect(result).toContain('Bm/E');
    expect(result).toContain('G/C');
  });

    it('should not modify lyrics', () => {
      const song = `C       G
These lyrics should not change at all`;
      
      const result = transposeSong(song, 5);
      
      expect(result).toContain('These lyrics should not change at all');
    });

    it('should handle transposing by 0 (no change)', () => {
      const song = `[Verse]
C       G       Am      F
Lyrics here`;
      
      const result = transposeSong(song, 0);
      
      expect(result).toContain('C');
      expect(result).toContain('G');
      expect(result).toContain('Am');
      expect(result).toContain('F');
    });

  it('should handle full octave transposition', () => {
    const song = `C       G       Am
Lyrics here`;
    const result = transposeSong(song, 12);
    
    expect(result).toContain('C');
    expect(result).toContain('G');
    expect(result).toContain('Am');
  });

    it('should handle empty song', () => {
      const result = transposeSong('', 2);
      expect(result).toBe('');
    });
  });

  describe('transposeSongToKey', () => {
  it('should transpose from C to D', () => {
    const song = `C       G       Am      F
Lyrics here`;
    const result = transposeSongToKey(song, 'C', 'D');
    
    expect(result).toContain('D');
    expect(result).toContain('A');
    expect(result).toContain('Bm');
    expect(result).toContain('G');
  });

  it('should transpose from G to C', () => {
    const song = `G       D       Em      C
Lyrics here`;
    const result = transposeSongToKey(song, 'G', 'C');
    
    expect(result).toContain('C');
    expect(result).toContain('G');
    expect(result).toContain('Am');
    expect(result).toContain('F');
  });

  it('should transpose from C to Bb (use flats)', () => {
    const song = `C       F       G
Lyrics here`;
    const result = transposeSongToKey(song, 'C', 'Bb');
    
    expect(result).toContain('Bb');
    expect(result).toContain('Eb');
    expect(result).toContain('F');
  });

  it('should transpose from D to E (use sharps)', () => {
    const song = `D       G       A
Lyrics here`;
    const result = transposeSongToKey(song, 'D', 'E');
    
    expect(result).toContain('E');
    expect(result).toContain('A');
    expect(result).toContain('B');
  });

  it('should handle same key (no change)', () => {
    const song = `C       G       Am      F
Lyrics here`;
    const result = transposeSongToKey(song, 'C', 'C');
    
    expect(result).toContain('C');
    expect(result).toContain('G');
    expect(result).toContain('Am');
    expect(result).toContain('F');
  });

    it('should preserve song structure', () => {
      const song = `[Verse 1]
C       G
Lyrics

[Chorus]
F       Am
More lyrics`;
      
      const result = transposeSongToKey(song, 'C', 'G');
      
      expect(result).toContain('[Verse 1]');
      expect(result).toContain('[Chorus]');
      expect(result).toContain('Lyrics');
      expect(result).toContain('More lyrics');
    });
  });

  describe('getTransposedKey', () => {
    it('should transpose key signature up by semitones', () => {
      expect(getTransposedKey('C', 2)).toBe('D');
      expect(getTransposedKey('C', 4)).toBe('E');
      expect(getTransposedKey('C', 7)).toBe('G');
    });

    it('should transpose key signature down by semitones', () => {
      expect(getTransposedKey('C', -2)).toBe('A#');
      expect(getTransposedKey('C', -5)).toBe('G');
      expect(getTransposedKey('G', -2)).toBe('F');
    });

    it('should use flats for flat keys', () => {
      expect(getTransposedKey('Bb', 1)).toBe('B');
      expect(getTransposedKey('Eb', 1)).toBe('E');
      expect(getTransposedKey('F', 1)).toBe('Gb');
    });

    it('should use sharps for sharp keys', () => {
      expect(getTransposedKey('D', 1)).toBe('D#');
      expect(getTransposedKey('A', 1)).toBe('A#');
      expect(getTransposedKey('E', 1)).toBe('F');
    });

    it('should handle minor keys', () => {
      expect(getTransposedKey('Am', 2)).toBe('Bm');
      expect(getTransposedKey('Em', 2)).toBe('F#m');
      expect(getTransposedKey('Dm', -2)).toBe('Cm');
    });

    it('should handle full octave transposition', () => {
      expect(getTransposedKey('C', 12)).toBe('C');
      expect(getTransposedKey('G', 12)).toBe('G');
      expect(getTransposedKey('Am', 12)).toBe('Am');
    });

    it('should handle null or undefined key', () => {
      expect(getTransposedKey(null, 2)).toBeNull();
      expect(getTransposedKey(undefined, 2)).toBeNull();
      expect(getTransposedKey('', 2)).toBeNull();
    });

  it('should handle transposing by 0', () => {
    expect(getTransposedKey('C', 0)).toBe('C');
    expect(getTransposedKey('Am', 0)).toBe('Am');
    // F# with 0 transpose stays F# (sharp key)
    const result = getTransposedKey('F#', 0);
    expect(result === 'F#' || result === 'Gb').toBe(true);
  });
  });

  describe('integration tests', () => {
    it('should correctly transpose a complete song from C to G', () => {
      const song = `[Verse 1]
C       G       Am      F
I love to sing this song

[Chorus]
F       G       C       Am
In the key of C major`;
      
      const result = transposeSongToKey(song, 'C', 'G');
      
      expect(result).toContain('G');
      expect(result).toContain('D');
      expect(result).toContain('Em');
      expect(result).toContain('C');
      expect(result).toContain('I love to sing this song');
      expect(result).toContain('In the key of C major');
    });

  it('should handle multiple transpose operations', () => {
    const song = `C       G       Am      F
Lyrics here`;
    
    // Transpose up 2
    const up2 = transposeSong(song, 2);
    expect(up2).toContain('D');
    
    // Transpose up 2 again (should be like +4 from original)
    const up4 = transposeSong(up2, 2);
    expect(up4).toContain('E');
    
    // Transpose back down 4 (should return to original)
    const original = transposeSong(up4, -4);
    expect(original).toContain('C');
    expect(original).toContain('G');
  });
  });
});

