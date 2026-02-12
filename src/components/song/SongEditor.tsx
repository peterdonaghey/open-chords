import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import LoginModal from '../auth/LoginModal';
import SongViewer from './SongViewer';
import './SongEditor.css';
import type { Song } from '../../types/song';

interface SongEditorProps {
  song?: Song | null;
  onSave: (songData: Song) => void;
  onCancel?: () => void;
}

/**
 * SongEditor component - create/edit songs with live preview
 */
function SongEditor({ song, onSave, onCancel }: SongEditorProps) {
  const { user, isAuthenticated } = useAuth();
  const [title, setTitle] = useState(song?.title ?? '');
  const [artist, setArtist] = useState(song?.artist ?? '');
  const [type, setType] = useState<'chords' | 'tabs'>(song?.type ?? 'chords');
  const [content, setContent] = useState(song?.content ?? '');
  const [showPreview, setShowPreview] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const songData: Song = {
      id: song?.id ?? Date.now().toString(),
      title: title.trim(),
      artist: artist.trim(),
      type,
      content,
      updatedAt: new Date().toISOString(),
    };

    onSave(songData);
  };

  return (
    <div className="song-editor">
      <div className="editor-header">
        <div className="editor-title-group">
          <h2>{song ? 'Edit Song' : 'New Song'}</h2>
          <div className="editor-user-badge">
            <span className="user-label">Creating as:</span>
            {isAuthenticated ? (
              <span className="user-name authenticated">{user?.email}</span>
            ) : (
              <span className="user-name anonymous">
                Anonymous
                <button
                  type="button"
                  className="login-link"
                  onClick={() => setIsLoginModalOpen(true)}
                >
                  (Sign in to claim)
                </button>
              </span>
            )}
          </div>
        </div>
        <button
          type="button"
          className="preview-toggle"
          onClick={() => setShowPreview(!showPreview)}
          disabled={!content.trim()}
        >
          {showPreview ? 'Edit' : 'Preview'}
        </button>
      </div>

      {!showPreview ? (
        <form onSubmit={handleSubmit} className="editor-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="title">Title *</label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="Song title"
              />
            </div>

            <div className="form-group">
              <label htmlFor="artist">Artist *</label>
              <input
                type="text"
                id="artist"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                required
                placeholder="Artist name"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="type">Type</label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value as 'chords' | 'tabs')}
            >
              <option value="chords">Chords</option>
              <option value="tabs">Tabs</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="content">
              Song Content *
              <span className="help-text">
                Enter chords above lyrics, use [Section] for sections
              </span>
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              placeholder={`[Verse 1]\nC       G       Am      F\nThis is the lyric line below the chords\n\n[Chorus]\nC       G       F\nChorus lyrics here`}
              rows={20}
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary">
              Save Song
            </button>
            {onCancel && (
              <button type="button" className="btn-secondary" onClick={onCancel}>
                Cancel
              </button>
            )}
          </div>
        </form>
      ) : (
        <div className="preview-container">
          <SongViewer songText={content} title={title} artist={artist} />
        </div>
      )}

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={() => setIsLoginModalOpen(false)}
      />
    </div>
  );
}

export default SongEditor;
