import { useState, useEffect, useRef } from 'react';
import { parseUGFormat } from '../services/parser';
import './SongViewer.css';

/**
 * SongViewer component - displays a song with chords above lyrics
 * Uses monospace font for proper alignment
 */
function SongViewer({ songText, title, artist, isDoubleColumn = false }) {
  const [parsedLines, setParsedLines] = useState([]);
  const [columns, setColumns] = useState([]);
  const contentRef = useRef(null);

  useEffect(() => {
    if (songText) {
      const parsed = parseUGFormat(songText);
      setParsedLines(parsed);
    }
  }, [songText]);

  // Calculate columns when in compact mode
  useEffect(() => {
    if (!isDoubleColumn || parsedLines.length === 0) {
      setColumns([]);
      return;
    }

    // Measure line height and available height
    const measureHeight = () => {
      if (!contentRef.current) return;
      
      // Get available height (viewport - header - toolbar - padding)
      const availableHeight = window.innerHeight - 180; // Adjust based on your header/toolbar height
      
      // Approximate line height (using a reasonable estimate)
      const lineHeight = 24; // Adjust if needed
      
      // Calculate how many lines fit per column
      const linesPerColumn = Math.floor(availableHeight / lineHeight);
      
      if (linesPerColumn < 1) return;
      
      // Split parsedLines into columns
      const cols = [];
      for (let i = 0; i < parsedLines.length; i += linesPerColumn) {
        cols.push(parsedLines.slice(i, i + linesPerColumn));
      }
      
      setColumns(cols);
    };

    measureHeight();
    window.addEventListener('resize', measureHeight);
    return () => window.removeEventListener('resize', measureHeight);
  }, [isDoubleColumn, parsedLines]);

  if (!songText) {
    return (
      <div className="song-viewer-empty">
        <p>No song selected</p>
      </div>
    );
  }

  // Render lines helper
  const renderLines = (lines) => {
    return lines.map((line, index) => (
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
    ));
  };

  return (
    <div className={`song-viewer ${isDoubleColumn ? 'compact-mode' : ''}`}>
      {(title || artist) && (
        <div className="song-header">
          {title && <h1 className="song-title">{title}</h1>}
          {artist && <h2 className="song-artist">{artist}</h2>}
        </div>
      )}

      <div 
        ref={contentRef}
        className={`song-content ${isDoubleColumn ? 'compact-grid' : ''}`}
      >
        {isDoubleColumn && columns.length > 0 ? (
          // Render columns in compact mode
          columns.map((columnLines, colIndex) => (
            <div key={colIndex} className="song-column">
              {renderLines(columnLines)}
            </div>
          ))
        ) : (
          // Normal single column mode
          renderLines(parsedLines)
        )}
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
