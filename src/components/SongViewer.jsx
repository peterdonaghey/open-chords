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
      
      // Get the actual available height of the content container
      const containerHeight = contentRef.current.clientHeight;
      
      if (containerHeight < 50) {
        // Container not rendered yet, try again shortly
        setTimeout(measureHeight, 50);
        return;
      }
      
      // Create a temporary element to measure actual line height
      const tempLine = document.createElement('div');
      tempLine.className = 'song-line';
      tempLine.style.visibility = 'hidden';
      tempLine.style.position = 'absolute';
      tempLine.innerHTML = '<div class="chord-lyric-block"><div class="chord-line">Em</div><div class="lyric-line">Test line</div></div>';
      contentRef.current.appendChild(tempLine);
      
      const measuredLineHeight = tempLine.offsetHeight;
      contentRef.current.removeChild(tempLine);
      
      // Use measured height, with a small safety margin
      const lineHeight = measuredLineHeight > 0 ? measuredLineHeight : 24;
      
      // Calculate how many lines fit per column (with 10% safety margin)
      const linesPerColumn = Math.floor((containerHeight * 0.95) / lineHeight);
      
      if (linesPerColumn < 1) return;
      
      // Split parsedLines into columns
      const cols = [];
      for (let i = 0; i < parsedLines.length; i += linesPerColumn) {
        cols.push(parsedLines.slice(i, i + linesPerColumn));
      }
      
      setColumns(cols);
    };

    // Delay initial measurement to ensure DOM is ready
    setTimeout(measureHeight, 100);
    
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
       {!isDoubleColumn && (title || artist) && (
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
               {/* Add title/artist to first column only */}
               {colIndex === 0 && (title || artist) && (
                 <>
                   {title && <div className="song-line song-line-compact-title">{title}</div>}
                   {artist && <div className="song-line song-line-compact-artist">{artist}</div>}
                 </>
               )}
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
