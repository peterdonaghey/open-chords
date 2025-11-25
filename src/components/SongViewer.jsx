import { useState, useEffect, useRef } from 'react';
import { parseUGFormat } from '../services/parser';
import './SongViewer.css';

/**
 * SongViewer component - displays a song with chords above lyrics
 * Uses monospace font for proper alignment
 */
function SongViewer({ songText, title, artist, isDoubleColumn = false }) {
  const [parsedLines, setParsedLines] = useState([]);
  const contentRef = useRef(null);
  const [columnCount, setColumnCount] = useState(1);

  useEffect(() => {
    if (songText) {
      const parsed = parseUGFormat(songText);
      setParsedLines(parsed);
    }
  }, [songText]);

  useEffect(() => {
    if (!isDoubleColumn || !contentRef.current) {
      setColumnCount(1);
      return;
    }

    const calculateColumns = () => {
      const viewportHeight = window.innerHeight;
      const toolbarHeight = 60; // Approximate toolbar height
      const headerHeight = 70; // Approximate header height
      const padding = 100; // Padding and margins
      const availableHeight = viewportHeight - toolbarHeight - headerHeight - padding;

      // Get natural content height (single column)
      const tempDiv = contentRef.current.cloneNode(true);
      tempDiv.style.position = 'absolute';
      tempDiv.style.visibility = 'hidden';
      tempDiv.style.columnCount = '1';
      tempDiv.style.height = 'auto';
      document.body.appendChild(tempDiv);
      const contentHeight = tempDiv.scrollHeight;
      document.body.removeChild(tempDiv);

      // Calculate number of columns needed
      const minColumnWidth = 400; // Minimum width to prevent chord wrapping
      const viewportWidth = window.innerWidth;
      const maxColumns = Math.floor(viewportWidth / minColumnWidth);
      
      // Calculate how many columns we need to fit all content
      let neededColumns = Math.ceil(contentHeight / availableHeight);
      
      // Cap at max columns that can fit
      neededColumns = Math.min(neededColumns, maxColumns);
      neededColumns = Math.max(1, neededColumns); // At least 1 column

      setColumnCount(neededColumns);
    };

    calculateColumns();
    window.addEventListener('resize', calculateColumns);
    
    return () => window.removeEventListener('resize', calculateColumns);
  }, [isDoubleColumn, parsedLines]);

  if (!songText) {
    return (
      <div className="song-viewer-empty">
        <p>No song selected</p>
      </div>
    );
  }

  return (
    <div className={`song-viewer ${isDoubleColumn ? 'viewport-fit' : ''}`}>
      {(title || artist) && (
        <div className="song-header">
          {title && <h1 className="song-title">{title}</h1>}
          {artist && <h2 className="song-artist">{artist}</h2>}
        </div>
      )}

      <div 
        ref={contentRef}
        className={`song-content ${isDoubleColumn ? 'multi-column' : ''}`}
        style={isDoubleColumn ? { columnCount: columnCount } : {}}
      >
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
