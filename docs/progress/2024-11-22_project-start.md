# Open Chords - Project Start
**Date**: 2024-11-22
**Session**: Initial Setup

## Project Overview
Building an open-source guitar chord sheet manager inspired by Ultimate Guitar, with chord transposition capabilities and GitHub-based storage.

## Requirements
- Display guitar chords in Ultimate Guitar format (chords above lyrics)
- Transpose chords up/down by semitones
- CRUD operations for songs (title, artist, type)
- Monospace font rendering for proper chord alignment
- GitHub API integration for file storage
- Web-based React application

## Technology Decisions
- **Framework**: React (with Vite for fast development)
- **Chord Format**: Ultimate Guitar two-line style
- **Storage**: GitHub API with OAuth authentication
- **Libraries**:
  - ChordSheetJS: Chord parsing and transposition
  - Octokit: GitHub API client
  - React Router: Navigation

## Research Findings

### ChordPro Format
- Industry standard text-based format for chord notation
- Syntax: `[C]` inline with lyrics
- Well-documented at chordpro.org
- Current version: v6

### Existing Solutions
- **Chordly**: Open-source online chord sheet creator
- **ChordFiddle**: Online ChordPro playground
- **OpenChords**: Desktop ChordPro editor with HTML export

### Key Libraries
- **ChordSheetJS** (npm: chordsheetjs): Most popular JavaScript library
  - Supports multiple formats (ChordPro, Ultimate Guitar)
  - Built-in transposition: `transposeUp()`, `transposeDown()`, `transpose(n)`
  - Multiple formatters for output
- **Tonal.js**: Music theory library (backup option)

### Chord Alignment
- Use monospace fonts (Consolas, Monaco, Courier New)
- CSS techniques: `position: relative` with `top: -1em` for chord positioning
- Ensure consistent spacing for proper alignment

### Transposition Algorithm
- Uses chromatic scale (12 semitones)
- Only transpose root note, preserve chord quality (maj7, min, etc.)
- Handle enharmonics correctly (G# vs Ab)

## Architecture Plan

### File Structure
```
src/
├── components/
│   ├── SongList.jsx       # Browse/search songs
│   ├── SongEditor.jsx     # Create/edit with live preview
│   ├── SongViewer.jsx     # Display formatted chords
│   └── Transposer.jsx     # Transpose controls
├── services/
│   ├── github.js          # GitHub API wrapper
│   ├── parser.js          # UG format parser
│   └── transposer.js      # Chord transposition
├── utils/
│   └── chords.js          # Chord utilities
└── App.jsx                # Main app with routing
```

### Data Model
```javascript
Song {
  title: string
  artist: string
  type: 'chords' | 'tabs'
  key: string  // Original key (e.g., 'C', 'Am')
  content: string  // Raw chord sheet text
}
```

### GitHub Storage Structure
```
songs/
├── {artist-slug}/
│   └── {song-slug}.txt
```

## Next Steps
1. Initialize React project with Vite
2. Install dependencies
3. Create basic project structure
4. Implement chord transposition logic
5. Build Ultimate Guitar format parser
6. Create UI components
7. Integrate GitHub API

## Implementation Notes
- Start with local state management (no Redux initially)
- Focus on core features first (view, edit, transpose)
- Add GitHub integration once local functionality works
- Mobile-responsive from the start
