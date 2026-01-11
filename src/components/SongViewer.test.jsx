import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../test/utils/test-utils';
import userEvent from '@testing-library/user-event';
import SongViewer from './SongViewer';

describe('SongViewer component', () => {
  const basicSong = `[Verse 1]
C       G       Am      F
This is a line of lyrics

[Chorus]
F       G       C
Chorus lyrics here`;

  it('should render song title and artist', () => {
    render(
      <SongViewer
        songText={basicSong}
        title="Test Song"
        artist="Test Artist"
      />
    );
    
    expect(screen.getByText('Test Song')).toBeInTheDocument();
    expect(screen.getByText('Test Artist')).toBeInTheDocument();
  });

  it('should render section markers', () => {
    render(<SongViewer songText={basicSong} />);
    
    expect(screen.getByText('[Verse 1]')).toBeInTheDocument();
    expect(screen.getByText('[Chorus]')).toBeInTheDocument();
  });

  it('should render lyrics', () => {
    render(<SongViewer songText={basicSong} />);
    
    expect(screen.getByText('This is a line of lyrics')).toBeInTheDocument();
    expect(screen.getByText('Chorus lyrics here')).toBeInTheDocument();
  });

  it('should render chords above lyrics', () => {
    const { container } = render(<SongViewer songText={basicSong} />);
    
    const chordLines = container.querySelectorAll('.chord-line');
    expect(chordLines.length).toBeGreaterThan(0);
  });

  it('should show empty state when no song text', () => {
    render(<SongViewer songText="" />);
    
    expect(screen.getByText('No song selected')).toBeInTheDocument();
  });

  it('should not render title/artist when not provided', () => {
    render(<SongViewer songText={basicSong} />);
    
    const header = document.querySelector('.song-header');
    expect(header).not.toBeInTheDocument();
  });

  it('should render in single column mode by default', () => {
    const { container } = render(<SongViewer songText={basicSong} />);
    
    const viewer = container.querySelector('.song-viewer');
    expect(viewer).not.toHaveClass('compact-mode');
  });

  it('should render in double column mode when enabled', () => {
    const { container } = render(
      <SongViewer songText={basicSong} isDoubleColumn={true} />
    );
    
    const viewer = container.querySelector('.song-viewer');
    expect(viewer).toHaveClass('compact-mode');
  });

  it('should parse and display complex chords', () => {
    const complexSong = 'Cmaj7   Gsus4   Am11\nComplex chords';
    render(<SongViewer songText={complexSong} />);
    
    expect(screen.getByText('Complex chords')).toBeInTheDocument();
  });

  it('should handle songs with only lyrics (no chords)', () => {
    const lyricsOnly = '[Verse]\nJust lyrics\nNo chords here';
    render(<SongViewer songText={lyricsOnly} />);
    
    expect(screen.getByText('[Verse]')).toBeInTheDocument();
    expect(screen.getByText('Just lyrics')).toBeInTheDocument();
    expect(screen.getByText('No chords here')).toBeInTheDocument();
  });

  it('should handle empty lines in song', () => {
    const songWithEmptyLines = `[Verse]
C       G
Lyrics

[Chorus]
F       C
More lyrics`;
    
    const { container } = render(<SongViewer songText={songWithEmptyLines} />);
    
    const emptyLines = container.querySelectorAll('.empty-line');
    expect(emptyLines.length).toBeGreaterThan(0);
  });

  it('should update when song text changes', () => {
    const { rerender } = render(<SongViewer songText={basicSong} />);
    
    expect(screen.getByText('[Verse 1]')).toBeInTheDocument();
    
    const newSong = '[Bridge]\nD       A\nNew lyrics';
    rerender(<SongViewer songText={newSong} />);
    
    expect(screen.getByText('[Bridge]')).toBeInTheDocument();
    expect(screen.getByText('New lyrics')).toBeInTheDocument();
  });

  it('should apply compact mode class to content', () => {
    const { container } = render(
      <SongViewer songText={basicSong} isDoubleColumn={true} />
    );
    
    const content = container.querySelector('.song-content');
    expect(content).toHaveClass('compact-grid');
  });
});

