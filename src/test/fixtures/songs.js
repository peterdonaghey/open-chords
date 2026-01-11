/**
 * Test fixtures for songs
 */

export const basicSong = {
  id: '1',
  title: 'Test Song',
  artist: 'Test Artist',
  type: 'chords',
  content: `[Verse 1]
C       G       Am      F
This is a line of lyrics here

[Chorus]
F       G       C       Am
This is the chorus line`,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  userId: 'test-user-id',
};

export const songWithComplexChords = {
  id: '2',
  title: 'Complex Chords Song',
  artist: 'Test Artist',
  type: 'chords',
  content: `[Intro]
Dmaj7   G#dim   Am7/E   F#m7b5

[Verse]
Cadd9   Gsus4   Am11    Fmaj7
Test lyrics with complex chords`,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  userId: 'test-user-id',
};

export const songWithFlats = {
  id: '3',
  title: 'Flat Key Song',
  artist: 'Test Artist',
  type: 'chords',
  content: `[Verse]
Bb      Eb      Cm      F
Song in B flat major`,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  userId: 'test-user-id',
};

export const songWithSharps = {
  id: '4',
  title: 'Sharp Key Song',
  artist: 'Test Artist',
  type: 'chords',
  content: `[Verse]
E       A       C#m     B
Song in E major with sharps`,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  userId: 'test-user-id',
};

export const emptySong = {
  id: '5',
  title: 'Empty Song',
  artist: 'Test Artist',
  type: 'chords',
  content: '',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  userId: 'test-user-id',
};

export const anonymousSong = {
  id: '6',
  title: 'Anonymous Song',
  artist: 'Anonymous',
  type: 'chords',
  content: `[Verse]
G       D       Em      C
Created by anonymous user`,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  userId: 'anonymous',
};

export const allSongs = [
  basicSong,
  songWithComplexChords,
  songWithFlats,
  songWithSharps,
  emptySong,
  anonymousSong,
];

