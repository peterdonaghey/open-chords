import { useState, useEffect } from 'react';
import { parseUGFormat } from '../services/parser';
import './SongViewer.css';

/**
 * SongViewer component - displays a song with chords above lyrics
 * Uses monospace font for proper alignment
 */
function SongViewer({ songText, title, artist }) {
  const [parsedLines, setParsedLines] = useState([]);

  useEffect(() => {
    if (songText) {
      const parsed = parseUGFormat(songText);
      setParsedLines(parsed);
    }
  }, [songText]);

  if (!songText) {
    return (
      <div className="song-viewer-empty">
        <p>No song selected</p>
      </div>
    );
  }

  return (
    <div className="song-viewer">
      {(title || artist) && (
        <div className="song-header">
          {title && <h1 className="song-title">{title}</h1>}
          {artist && <h2 className="song-artist">{artist}</h2>}
        </div>
      )}

      <div className="song-content">
        {parsedLines.map((line, index) => (
          <div key={index} className={`song-line song-line-${line.type}`}>
            {line.type === 'section' && (
              <div className="section-marker">{line.content}</div>
            )}

            {line.type === 'chord-line' && (
              <div className="chord-lyric-block">
                <div className="chord-line">
                  {renderChordLine(line.chords, line.lyrics.length)}
                </div>
                <div className="lyric-line">{line.lyrics}</div>
              </div>
            )}

            {line.type === 'lyric' && (
              <div className="lyric-only">{line.content}</div>
            )}

            {line.type === 'empty' && <div className="empty-line">&nbsp;</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Render a chord line with proper spacing
 */
function renderChordLine(chords, minLength) {
  if (!chords || chords.length === 0) return null;

  // Calculate the required line length
  const maxPosition = Math.max(
    ...chords.map(c => c.position + c.chord.length),
    minLength
  );

  // Create an array of spaces
  const line = new Array(maxPosition).fill(' ');

  // Place chords at their positions
  chords.forEach(({ chord, position }) => {
    for (let i = 0; i < chord.length; i++) {
      line[position + i] = chord[i];
    }
  });

  return <span>{line.join('')}</span>;
}

export default SongViewer;
