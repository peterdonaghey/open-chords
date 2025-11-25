# Getting Started with Open Chords

Welcome to Open Chords! This guide will help you get started using the application.

## Quick Start

The development server is now running at: **http://localhost:5173/**

Open this URL in your browser to start using Open Chords.

## First Steps

### 1. Welcome Screen
When you first open the app, you'll see a welcome screen with two storage options:
- **Local Storage** (currently active): Stores your songs in your browser
- **GitHub Storage** (coming soon): Sync songs to a GitHub repository

Click **"Get Started"** to begin.

### 2. Create Your First Song

Click the **"+ New Song"** button and fill in:
- **Title**: Name of the song (required)
- **Artist**: Artist or band name (required)
- **Key**: Original key of the song (e.g., C, Am, G)
- **Type**: Chords or Tabs
- **Content**: Your chord sheet

### 3. Writing Chord Sheets

Use the Ultimate Guitar two-line format:

```
[Verse 1]
C       G       Am      F
Amazing grace how sweet the sound
C       G       C
That saved a wretch like me

[Chorus]
F       C       G       Am
I once was lost but now am found
F       C       G       C
Was blind but now I see
```

**Tips:**
- Put chords on one line, lyrics on the next
- Use spaces to align chords with syllables
- Mark sections with [brackets]
- Use standard chord notation: C, Am, G7, Dsus4, etc.

### 4. Preview Your Song

Click the **"Preview"** button to see how your chord sheet looks with proper formatting. Toggle back to **"Edit"** to make changes.

### 5. Save Your Song

Click **"Save Song"** when you're done. Your song will be added to your library.

## Using the Song Viewer

### Viewing Songs
- Click any song in your library to view it
- Chords appear in red above the lyrics
- Sections are highlighted in blue
- Monospace font ensures perfect alignment

### Transposing
Use the transpose controls to change the key:
- **+ Up**: Transpose up one semitone
- **− Down**: Transpose down one semitone
- **Reset to Original**: Return to original key

**Keyboard Shortcuts:**
- `↑` (Up Arrow): Transpose up
- `↓` (Down Arrow): Transpose down
- `0` (Zero): Reset to original

### Editing
- Click the **"Edit"** button to make changes to your song
- Your changes are saved immediately

## Managing Your Library

### Search
Use the search box to find songs by title or artist.

### Sort
Choose how to organize your songs:
- **Sort by Title**: Alphabetical by song title
- **Sort by Artist**: Grouped by artist
- **Sort by Recent**: Most recently updated first

### Delete
Click the menu button (⋮) on any song card and select **"Delete"** to remove it from your library.

## Tips for Best Results

### Chord Alignment
- Use spaces (not tabs) for alignment
- Preview often to check alignment
- Monospace fonts (Consolas, Monaco) work best
- Keep chord lines consistent length

### Song Organization
- Use consistent artist names (e.g., "Bob Dylan" not "Dylan, Bob")
- Set the correct original key for accurate transposition
- Use clear section markers: [Intro], [Verse 1], [Chorus], [Bridge], [Outro]

### Mobile Use
- App works great on phones and tablets
- Use landscape mode for longer chord lines
- Pinch to zoom if needed

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| ↑ | Transpose up |
| ↓ | Transpose down |
| 0 | Reset transpose |

## Printing

To print a song:
1. Open the song in view mode
2. Use your browser's print function (Ctrl/Cmd + P)
3. The transposer and buttons will hide automatically
4. Print to paper or PDF

## Data Storage

Your songs are currently stored in your browser's localStorage:
- **Persistent**: Songs remain even after closing the browser
- **Local**: Data never leaves your computer
- **Private**: No account or login required

**Important:** Clearing your browser data will delete your songs. To back up:
1. Future feature: GitHub sync
2. For now: Copy song text and save externally

## Troubleshooting

### Songs not displaying correctly?
- Check that chords and lyrics are on separate lines
- Ensure you're using spaces (not tabs) for alignment
- Try the preview mode to see formatting

### Transposition not working?
- Make sure the song has a key set
- Check that chords are recognized (standard notation)
- Try resetting and transposing again

### Can't find a song?
- Check your search term spelling
- Try searching by artist instead of title
- Clear the search to see all songs

## What's Next?

Future features coming soon:
- GitHub repository sync
- Export to PDF
- Chord diagrams
- Auto-scroll for practice
- Dark mode
- Import from Ultimate Guitar

## Need Help?

- Check the [README](../README.md) for more details
- Report issues on GitHub
- Contribute improvements

---

Enjoy making music with Open Chords! 🎸
