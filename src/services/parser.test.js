import { describe, it, expect } from 'vitest';
import {
  parseUGFormat,
  transposeParsedSong,
  formatToUGText,
  extractMetadata,
} from './parser';

describe('parser service', () => {
  describe('parseUGFormat', () => {
    it('should parse section markers', () => {
      const text = '[Verse 1]\n[Chorus]\n[Bridge]';
      const result = parseUGFormat(text);
      
      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({ type: 'section', content: '[Verse 1]' });
      expect(result[1]).toEqual({ type: 'section', content: '[Chorus]' });
      expect(result[2]).toEqual({ type: 'section', content: '[Bridge]' });
    });

    it('should parse chord-lyric pairs', () => {
      const text = 'C       G       Am      F\nThis is a line of lyrics';
      const result = parseUGFormat(text);
      
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('chord-line');
      expect(result[0].lyrics).toBe('This is a line of lyrics');
      expect(result[0].chords).toHaveLength(4);
      expect(result[0].chords[0].chord).toBe('C');
      expect(result[0].chords[1].chord).toBe('G');
    });

    it('should parse complete song structure', () => {
      const text = `[Verse 1]
C       G       Am      F
This is a line of lyrics

[Chorus]
F       G       C
Chorus lyrics here`;
      
      const result = parseUGFormat(text);
      
      expect(result).toHaveLength(5); // section, chord-line, empty, section, chord-line
      expect(result[0].type).toBe('section');
      expect(result[1].type).toBe('chord-line');
      expect(result[2].type).toBe('empty');
      expect(result[3].type).toBe('section');
      expect(result[4].type).toBe('chord-line');
    });

    it('should handle empty lines', () => {
      const text = 'C       G\nLyrics\n\nD       A\nMore lyrics';
      const result = parseUGFormat(text);
      
      const emptyLine = result.find(line => line.type === 'empty');
      expect(emptyLine).toBeDefined();
    });

    it('should handle lyrics without chords', () => {
      const text = '[Verse 1]\nJust some lyrics without chords above';
      const result = parseUGFormat(text);
      
      expect(result).toHaveLength(2);
      expect(result[0].type).toBe('section');
      expect(result[1].type).toBe('lyric');
      expect(result[1].content).toBe('Just some lyrics without chords above');
    });

    it('should handle complex chords', () => {
      const text = 'Cmaj7   Gsus4   Am11    Fmaj7\nComplex chord line';
      const result = parseUGFormat(text);
      
      expect(result[0].chords).toHaveLength(4);
      expect(result[0].chords[0].chord).toBe('Cmaj7');
      expect(result[0].chords[1].chord).toBe('Gsus4');
      expect(result[0].chords[2].chord).toBe('Am11');
      expect(result[0].chords[3].chord).toBe('Fmaj7');
    });

    it('should handle slash chords', () => {
      const text = 'C/G     Am/E    F/C\nSlash chord line';
      const result = parseUGFormat(text);
      
      expect(result[0].chords).toHaveLength(3);
      expect(result[0].chords[0].chord).toBe('C/G');
      expect(result[0].chords[1].chord).toBe('Am/E');
      expect(result[0].chords[2].chord).toBe('F/C');
    });

    it('should preserve chord positions', () => {
      const text = 'C               G\nWord1 word2 word3';
      const result = parseUGFormat(text);
      
      expect(result[0].chords[0].position).toBe(0);
      expect(result[0].chords[1].position).toBe(16);
    });

    it('should handle empty input', () => {
      expect(parseUGFormat('')).toEqual([]);
      expect(parseUGFormat(null)).toEqual([]);
      expect(parseUGFormat(undefined)).toEqual([]);
    });

    it('should distinguish between chord lines and lyrics', () => {
      const text = 'This line has some words that look like chords: Am I going to be parsed wrong?';
      const result = parseUGFormat(text);
      
      // Should be parsed as lyric, not chord line
      expect(result[0].type).toBe('lyric');
    });
  });

  describe('transposeParsedSong', () => {
    it('should transpose all chords in parsed song', () => {
      const parsed = [
        {
          type: 'chord-line',
          chords: [
            { chord: 'C', position: 0 },
            { chord: 'G', position: 8 },
          ],
          lyrics: 'Test lyrics',
        },
      ];
      
      const result = transposeParsedSong(parsed, 2, 'C');
      
      expect(result[0].chords[0].chord).toBe('D');
      expect(result[0].chords[1].chord).toBe('A');
    });

    it('should preserve positions when transposing', () => {
      const parsed = [
        {
          type: 'chord-line',
          chords: [
            { chord: 'C', position: 0 },
            { chord: 'G', position: 8 },
          ],
          lyrics: 'Test lyrics',
        },
      ];
      
      const result = transposeParsedSong(parsed, 2, 'C');
      
      expect(result[0].chords[0].position).toBe(0);
      expect(result[0].chords[1].position).toBe(8);
    });

    it('should use flats for flat keys', () => {
      const parsed = [
        {
          type: 'chord-line',
          chords: [{ chord: 'C', position: 0 }],
          lyrics: 'Test',
        },
      ];
      
      const result = transposeParsedSong(parsed, 1, 'Bb');
      
      expect(result[0].chords[0].chord).toBe('Db');
    });

    it('should not modify non-chord lines', () => {
      const parsed = [
        { type: 'section', content: '[Verse 1]' },
        { type: 'lyric', content: 'Just lyrics' },
        { type: 'empty', content: '' },
      ];
      
      const result = transposeParsedSong(parsed, 2, 'C');
      
      expect(result).toEqual(parsed);
    });
  });

  describe('formatToUGText', () => {
    it('should format chord-lyric pairs correctly', () => {
      const parsed = [
        {
          type: 'chord-line',
          chords: [
            { chord: 'C', position: 0 },
            { chord: 'G', position: 8 },
          ],
          lyrics: 'Test lyrics',
        },
      ];
      
      const result = formatToUGText(parsed);
      
      expect(result).toContain('C       G');
      expect(result).toContain('Test lyrics');
    });

    it('should format section markers', () => {
      const parsed = [
        { type: 'section', content: '[Verse 1]' },
      ];
      
      const result = formatToUGText(parsed);
      
      expect(result).toBe('[Verse 1]');
    });

    it('should format complete song structure', () => {
      const parsed = [
        { type: 'section', content: '[Verse 1]' },
        {
          type: 'chord-line',
          chords: [{ chord: 'C', position: 0 }],
          lyrics: 'Lyrics here',
        },
        { type: 'empty', content: '' },
      ];
      
      const result = formatToUGText(parsed);
      
      expect(result).toContain('[Verse 1]');
      expect(result).toContain('C');
      expect(result).toContain('Lyrics here');
    });

    it('should handle empty lines', () => {
      const parsed = [
        { type: 'empty', content: '' },
      ];
      
      const result = formatToUGText(parsed);
      
      expect(result).toBe('');
    });

    it('should round-trip parse and format', () => {
      const originalText = `[Verse 1]
C       G       Am      F
This is a line of lyrics

[Chorus]
F       G       C
Chorus lyrics`;
      
      const parsed = parseUGFormat(originalText);
      const formatted = formatToUGText(parsed);
      
      // Should be able to parse it again
      const reparsed = parseUGFormat(formatted);
      
      expect(reparsed).toHaveLength(parsed.length);
      expect(reparsed[0].type).toBe('section');
      expect(reparsed[1].type).toBe('chord-line');
    });
  });

  describe('extractMetadata', () => {
    it('should extract title from metadata', () => {
      const text = 'Title: Test Song\nArtist: Test Artist';
      const metadata = extractMetadata(text);
      
      expect(metadata.title).toBe('Test Song');
    });

    it('should extract artist from metadata', () => {
      const text = 'Title: Test Song\nArtist: Test Artist';
      const metadata = extractMetadata(text);
      
      expect(metadata.artist).toBe('Test Artist');
    });

    it('should extract key from metadata', () => {
      const text = 'Title: Test Song\nKey: C';
      const metadata = extractMetadata(text);
      
      expect(metadata.key).toBe('C');
    });

    it('should handle case-insensitive metadata labels', () => {
      const text = 'title: Test Song\nartist: Test Artist\nkey: G';
      const metadata = extractMetadata(text);
      
      expect(metadata.title).toBe('Test Song');
      expect(metadata.artist).toBe('Test Artist');
      expect(metadata.key).toBe('G');
    });

    it('should return null for missing metadata', () => {
      const text = '[Verse 1]\nC       G\nLyrics';
      const metadata = extractMetadata(text);
      
      expect(metadata.title).toBeNull();
      expect(metadata.artist).toBeNull();
      expect(metadata.key).toBeNull();
    });

    it('should handle partial metadata', () => {
      const text = 'Title: Test Song\n[Verse 1]\nC       G';
      const metadata = extractMetadata(text);
      
      expect(metadata.title).toBe('Test Song');
      expect(metadata.artist).toBeNull();
      expect(metadata.key).toBeNull();
    });

    it('should trim whitespace from metadata values', () => {
      const text = 'Title:   Test Song  \nArtist:  Test Artist  ';
      const metadata = extractMetadata(text);
      
      expect(metadata.title).toBe('Test Song');
      expect(metadata.artist).toBe('Test Artist');
    });
  });
});

