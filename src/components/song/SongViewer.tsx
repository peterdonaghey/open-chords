import { useState, useEffect, useRef } from 'react';
import { parseUGFormat } from '../../services/parser';
import './SongViewer.css';
import type { ParsedLine, ParsedChordLine, ChordPosition } from '../../types/song';

interface SongViewerProps {
  songText: string;
  title?: string;
  artist?: string;
  isDoubleColumn?: boolean;
}

/**
 * SongViewer component - displays a song with chords above lyrics
 * Uses monospace font for proper alignment
 */
function SongViewer({ songText, title, artist, isDoubleColumn = false }: SongViewerProps) {
  const [parsedLines, setParsedLines] = useState<ParsedLine[]>([]);
  const [columns, setColumns] = useState<ParsedLine[][]>([]);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (songText) {
      const parsed = parseUGFormat(songText);
      setParsedLines(parsed);
    }
  }, [songText]);

  useEffect(() => {
    if (!isDoubleColumn || parsedLines.length === 0) {
      setColumns([]);
      return;
    }

    const measureHeight = () => {
      if (!contentRef.current) return;

      const containerHeight = contentRef.current.clientHeight;

      if (containerHeight < 50) {
        setTimeout(measureHeight, 50);
        return;
      }

      const tempLine = document.createElement('div');
      tempLine.className = 'song-line';
      tempLine.style.visibility = 'hidden';
      tempLine.style.position = 'absolute';
      tempLine.innerHTML = '<div class="chord-lyric-block"><div class="chord-line">Em</div><div class="lyric-line">Test line</div></div>';
      contentRef.current.appendChild(tempLine);

      const measuredLineHeight = tempLine.offsetHeight;
      contentRef.current.removeChild(tempLine);

      const lineHeight = measuredLineHeight > 0 ? measuredLineHeight : 24;
      const linesPerColumn = Math.floor((containerHeight * 0.95) / lineHeight);

      if (linesPerColumn < 1) return;

      const cols: ParsedLine[][] = [];
      for (let i = 0; i < parsedLines.length; i += linesPerColumn) {
        cols.push(parsedLines.slice(i, i + linesPerColumn));
      }

      setColumns(cols);
    };

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

  const renderChordLine = (chords: ChordPosition[], minLength: number) => {
    if (!chords || chords.length === 0) return null;

    const maxPosition = Math.max(
      ...chords.map(c => c.position + c.chord.length),
      minLength
    );

    const line = new Array(maxPosition).fill(' ');

    chords.forEach(({ chord, position }) => {
      for (let i = 0; i < chord.length; i++) {
        line[position + i] = chord[i];
      }
    });

    return <span>{line.join('')}</span>;
  };

  const renderLines = (lines: ParsedLine[]) => {
    return lines.map((line, index) => (
      <div key={index} className={`song-line song-line-${line.type}`}>
        {line.type === 'section' && (
          <div className="section-marker">{line.content}</div>
        )}

        {line.type === 'chord-line' && (
          <div className="chord-lyric-block">
            <div className="chord-line">
              {renderChordLine((line as ParsedChordLine).chords, (line as ParsedChordLine).lyrics.length)}
            </div>
            <div className="lyric-line">{(line as ParsedChordLine).lyrics}</div>
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
    <div className="song-viewer-container">
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
            columns.map((columnLines, colIndex) => (
              <div key={colIndex} className="song-column">
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
            renderLines(parsedLines)
          )}
        </div>
      </div>
    </div>
  );
}

export default SongViewer;
