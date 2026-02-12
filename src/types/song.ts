/**
 * Song and parsing types
 */

export interface Song {
  id: string;
  path?: string; // legacy
  title: string;
  artist: string;
  content: string;
  type?: 'chords' | 'tabs';
  userId?: string;
  ownerEmail?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ChordPosition {
  chord: string;
  position: number;
}

export type ParsedLineType = 'section' | 'chord-line' | 'lyric' | 'empty';

export interface ParsedSection {
  type: 'section';
  content: string;
}

export interface ParsedChordLine {
  type: 'chord-line';
  chords: ChordPosition[];
  lyrics: string;
}

export interface ParsedLyric {
  type: 'lyric';
  content: string;
}

export interface ParsedEmpty {
  type: 'empty';
  content: string;
}

export type ParsedLine =
  | ParsedSection
  | ParsedChordLine
  | ParsedLyric
  | ParsedEmpty;
