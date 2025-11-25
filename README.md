# Open Chords

> An open-source guitar chord sheet manager with transposition

Open Chords is a simple, fast, and free web application for managing guitar chord sheets. Write chords in the familiar Ultimate Guitar format, transpose them to any key, and organize your personal song library.

## Features

- **Ultimate Guitar Format**: Write chords above lyrics in the two-line format you know and love
- **Instant Transposition**: Change key with a click - perfect transposition every time
- **Monospace Rendering**: Proper chord alignment using monospace fonts
- **Local Storage**: Your songs are stored in your browser (GitHub sync coming soon)
- **Mobile Friendly**: Works great on phones, tablets, and desktop
- **Keyboard Shortcuts**: Use arrow keys to transpose, '0' to reset
- **Print Support**: Clean printing for practice or performance

## Getting Started

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/open-chords.git
cd open-chords

# Install dependencies
npm install

# Start development server
npm run dev
```

### Usage

1. **Create a Song**: Click "New Song" and enter title, artist, and key
2. **Write Chords**: Enter chords above lyrics in Ultimate Guitar format
3. **Preview**: Toggle preview to see how it looks
4. **Save**: Save to your library
5. **Transpose**: Use +/- buttons or arrow keys to change key

## Song Format

Open Chords uses the Ultimate Guitar two-line format:

```
[Verse 1]
C       G       Am      F
This is a line of lyrics

[Chorus]
F       G       C       Am
Another line with chords above
```

**Format Guidelines:**
- Use `[Section Name]` for verse, chorus, bridge markers
- Write chords on one line, lyrics on the next
- Use spaces to align chords with lyrics
- Chords: Major (C), Minor (Am), 7th (G7), etc.

## Technology Stack

- **React** - UI framework
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **ChordSheetJS** - Chord parsing library (if needed)
- **Octokit** - GitHub API integration (future feature)

## Project Structure

```
src/
├── components/
│   ├── SongList.jsx       # Browse and search songs
│   ├── SongEditor.jsx     # Create/edit with live preview
│   ├── SongViewer.jsx     # Display with monospace rendering
│   └── Transposer.jsx     # Transpose controls
├── services/
│   ├── github.js          # GitHub API integration (future)
│   ├── parser.js          # Ultimate Guitar format parser
│   └── transposer.js      # Chord transposition logic
├── utils/
│   └── chords.js          # Chord utilities and algorithms
└── App.jsx                # Main app with routing
```

## Keyboard Shortcuts

- **↑** - Transpose up one semitone
- **↓** - Transpose down one semitone
- **0** - Reset to original key

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Future Features

- [ ] GitHub repository sync
- [ ] Export to PDF
- [ ] Chord diagrams
- [ ] Auto-scroll for practice
- [ ] Dark mode
- [ ] Sharing via link
- [ ] Import from Ultimate Guitar (via URL)
- [ ] Setlist management

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - See LICENSE file for details

## Credits

Built with:
- React + Vite
- Custom chord transposition algorithm
- Inspired by Ultimate Guitar

## Support

If you find this useful, consider:
- Starring the repo
- Reporting bugs
- Suggesting features
- Contributing code

---

Made with ♪ for guitarists by guitarists
