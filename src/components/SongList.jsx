import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './SongList.css';

/**
 * SongList component - browse and search songs
 */
function SongList({ songs, onSelectSong, onNewSong, onDeleteSong }) {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredSongs, setFilteredSongs] = useState(songs);
  const [sortBy, setSortBy] = useState('title'); // title, artist, updatedAt

  useEffect(() => {
    let filtered = songs.filter(song => {
      const searchLower = searchTerm.toLowerCase();
      return (
        song.title.toLowerCase().includes(searchLower) ||
        song.artist.toLowerCase().includes(searchLower)
      );
    });

    // Sort songs
    filtered = filtered.sort((a, b) => {
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      } else if (sortBy === 'artist') {
        return a.artist.localeCompare(b.artist);
      } else if (sortBy === 'updatedAt') {
        return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0);
      }
      return 0;
    });

    setFilteredSongs(filtered);
  }, [songs, searchTerm, sortBy]);

  const groupByArtist = () => {
    const grouped = {};
    filteredSongs.forEach(song => {
      if (!grouped[song.artist]) {
        grouped[song.artist] = [];
      }
      grouped[song.artist].push(song);
    });
    return grouped;
  };

  const groupedSongs = sortBy === 'artist' ? groupByArtist() : null;

  return (
    <div className="song-list">
      <div className="song-list-header">
        <h2>Song Library</h2>
        <button className="btn-new-song" onClick={onNewSong}>
          + New Song
        </button>
      </div>

      <div className="song-list-controls">
        <input
          type="text"
          placeholder="Search songs or artists..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select
          className="sort-select"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="title">Sort by Title</option>
          <option value="artist">Sort by Artist</option>
          <option value="updatedAt">Sort by Recent</option>
        </select>
      </div>

      <div className="song-count">
        {filteredSongs.length} {filteredSongs.length === 1 ? 'song' : 'songs'}
      </div>

      {filteredSongs.length === 0 && (
        <div className="empty-state">
          <p>
            {searchTerm
              ? 'No songs found matching your search'
              : 'No songs yet. Click "New Song" to add one!'}
          </p>
        </div>
      )}

      {sortBy === 'artist' && groupedSongs ? (
        <div className="song-list-grouped">
          {Object.entries(groupedSongs).map(([artist, artistSongs]) => (
            <div key={artist} className="artist-group">
              <h3 className="artist-name">{artist}</h3>
              <div className="artist-songs">
                {artistSongs.map(song => (
                  <SongCard
                    key={song.id || song.path}
                    song={song}
                    onSelect={() => onSelectSong(song)}
                    onDelete={() => onDeleteSong(song)}
                    currentUser={user}
                    isAuthenticated={isAuthenticated}
                    isAdmin={isAdmin}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="song-list-items">
          {filteredSongs.map(song => (
            <SongCard
              key={song.id || song.path}
              song={song}
              onSelect={() => onSelectSong(song)}
              onDelete={() => onDeleteSong(song)}
              currentUser={user}
              isAuthenticated={isAuthenticated}
              isAdmin={isAdmin}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * SongCard component - individual song item
 */
function SongCard({ song, onSelect, onDelete, currentUser, isAuthenticated, isAdmin }) {
  const [showMenu, setShowMenu] = useState(false);

  // Check if user can delete this song (owner OR admin)
  const isOwner = isAuthenticated && currentUser && song.userId === currentUser.userId;
  const canDelete = isOwner || isAdmin;

  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm(`Delete "${song.title}" by ${song.artist}?`)) {
      onDelete();
    }
    setShowMenu(false);
  };

  return (
    <div className="song-card" onClick={onSelect}>
      <div className="song-card-content">
        <h3 className="song-card-title">{song.title}</h3>
        <p className="song-card-artist">{song.artist}</p>
        <div className="song-card-meta">
          {song.ownerEmail && song.ownerEmail !== 'anonymous' && (
            <span className="song-card-owner">
              {isOwner ? '👤 You' : `👤 ${song.ownerEmail}`}
            </span>
          )}
          {isAdmin && !isOwner && song.userId && song.userId !== 'anonymous' && (
            <span className="song-card-admin-badge">⚡ Admin</span>
          )}
        </div>
      </div>

      {canDelete && (
        <div className="song-card-actions">
          <button
            className="song-menu-btn"
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
          >
            ⋮
          </button>

          {showMenu && (
            <div className="song-menu">
              <button onClick={handleDelete} className="menu-item-delete">
                Delete
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SongList;
