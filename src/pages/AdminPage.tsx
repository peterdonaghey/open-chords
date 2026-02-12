import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getIdToken } from '../services/auth';
import './AdminPage.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

interface AdminUser {
  userId: string;
  email: string;
  role: string;
  songCount?: number;
  createdAt?: string;
}

interface AdminSong {
  id: string;
  title: string;
  artist: string;
  ownerEmail?: string;
  userId?: string;
  createdAt: string;
}

/**
 * Admin Page - Manage users and songs
 */
function AdminPage() {
  const navigate = useNavigate();
  const { user, isAdmin, isLoading } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [allSongs, setAllSongs] = useState<AdminSong[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedSongs, setSelectedSongs] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'users' | 'songs' | 'orphaned'>('users');

  const [resetPasswordModal, setResetPasswordModal] = useState({ isOpen: false, userEmail: '' });
  const [deleteUserModal, setDeleteUserModal] = useState({ isOpen: false, userEmail: '', songCount: 0 });
  const [newPassword, setNewPassword] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      navigate('/songs');
    }
  }, [isAdmin, isLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      loadData();
    }
  }, [isAdmin]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      await Promise.all([loadUsers(), loadAllSongs()]);
    } catch (err) {
      setError('Failed to load admin data');
      console.error('Error loading admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    const token = await getIdToken();
    const response = await fetch(`${API_BASE}/admin/users`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch users: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    setUsers(data);
  };

  const loadAllSongs = async () => {
    const token = await getIdToken();
    const response = await fetch(`${API_BASE}/admin/songs`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to fetch songs: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    setAllSongs(data);
  };

  const handleDeleteSong = async (songId: string) => {
    if (!window.confirm('Are you sure you want to delete this song?')) return;

    try {
      const token = await getIdToken();
      const response = await fetch(`${API_BASE}/admin/songs?id=${songId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to delete song');

      await loadData();
      setSelectedSongs(new Set());
    } catch (err) {
      alert('Failed to delete song: ' + (err instanceof Error ? err.message : String(err)));
      console.error('Error deleting song:', err);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedSongs.size === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedSongs.size} songs?`)) return;

    try {
      const token = await getIdToken();
      await Promise.all(
        Array.from(selectedSongs).map(songId =>
          fetch(`${API_BASE}/admin/songs?id=${songId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
          })
        )
      );
      await loadData();
      setSelectedSongs(new Set());
    } catch (err) {
      alert('Failed to delete some songs: ' + (err instanceof Error ? err.message : String(err)));
      console.error('Error bulk deleting songs:', err);
    }
  };

  const toggleSongSelection = (songId: string) => {
    const newSelection = new Set(selectedSongs);
    if (newSelection.has(songId)) {
      newSelection.delete(songId);
    } else {
      newSelection.add(songId);
    }
    setSelectedSongs(newSelection);
  };

  const getFilteredSongs = (): AdminSong[] => {
    if (!selectedUserId) return allSongs;
    return allSongs.filter(song => song.userId === selectedUserId);
  };

  const getOrphanedSongs = (): AdminSong[] => {
    return allSongs.filter(song =>
      !song.userId ||
      song.userId === 'anonymous' ||
      song.ownerEmail === 'unknown'
    );
  };

  const selectAllSongs = () => {
    const filtered = getFilteredSongs();
    setSelectedSongs(new Set(filtered.map(s => s.id)));
  };

  const deselectAllSongs = () => setSelectedSongs(new Set());

  const handleRoleChange = async (email: string, newRole: string) => {
    if (email === user?.email) {
      alert('You cannot change your own role');
      return;
    }
    if (!window.confirm(`Change user role to ${newRole}?`)) return;

    try {
      setActionLoading(true);
      const token = await getIdToken();
      const response = await fetch(`${API_BASE}/admin/update-role`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, role: newRole }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error ?? 'Failed to update role');
      }
      await loadUsers();
      alert('User role updated successfully');
    } catch (err) {
      alert('Failed to update role: ' + (err instanceof Error ? err.message : String(err)));
      console.error('Error updating role:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 8) {
      alert('Password must be at least 8 characters');
      return;
    }

    try {
      setActionLoading(true);
      const token = await getIdToken();
      const response = await fetch(`${API_BASE}/admin/reset-password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: resetPasswordModal.userEmail, newPassword }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error ?? 'Failed to reset password');
      }
      alert('Password reset successfully');
      setResetPasswordModal({ isOpen: false, userEmail: '' });
      setNewPassword('');
    } catch (err) {
      alert('Failed to reset password: ' + (err instanceof Error ? err.message : String(err)));
      console.error('Error resetting password:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    try {
      setActionLoading(true);
      const token = await getIdToken();
      const response = await fetch(`${API_BASE}/admin/delete-user`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: deleteUserModal.userEmail }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error ?? 'Failed to delete user');
      }
      alert('User deleted successfully');
      setDeleteUserModal({ isOpen: false, userEmail: '', songCount: 0 });
      await loadData();
    } catch (err) {
      alert('Failed to delete user: ' + (err instanceof Error ? err.message : String(err)));
      console.error('Error deleting user:', err);
    } finally {
      setActionLoading(false);
    }
  };

  if (isLoading || loading) {
    return (
      <div className="admin-page">
        <header className="app-header">
          <h1 onClick={() => navigate('/songs')}>Open Chords</h1>
        </header>
        <div className="loading">Loading admin panel...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-page">
        <header className="app-header">
          <h1 onClick={() => navigate('/songs')}>Open Chords</h1>
        </header>
        <div className="error">{error}</div>
        <button onClick={loadData} className="btn-primary">Retry</button>
      </div>
    );
  }

  const filteredSongs = getFilteredSongs();
  const orphanedSongs = getOrphanedSongs();

  return (
    <div className="admin-page">
      <header className="app-header">
        <h1 onClick={() => navigate('/songs')}>Open Chords</h1>
        <div className="header-actions">
          <button onClick={() => navigate('/songs')} className="btn-secondary">
            Back to Library
          </button>
        </div>
      </header>

      <div className="admin-container">
        <div className="admin-header">
          <h1>Admin Panel</h1>
          <div className="admin-tabs">
            <button
              className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              Users ({users.length})
            </button>
            <button
              className={`tab-btn ${activeTab === 'songs' ? 'active' : ''}`}
              onClick={() => setActiveTab('songs')}
            >
              All Songs ({allSongs.length})
            </button>
            {orphanedSongs.length > 0 && (
              <button
                className={`tab-btn ${activeTab === 'orphaned' ? 'active' : ''}`}
                onClick={() => setActiveTab('orphaned')}
              >
                Orphaned ({orphanedSongs.length})
              </button>
            )}
          </div>
        </div>

        {activeTab === 'users' && (
          <div className="admin-section">
            <h2>Users</h2>
            <table className="users-table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>User ID</th>
                  <th>Role</th>
                  <th>Songs</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(userRow => (
                  <tr key={userRow.userId}>
                    <td>{userRow.email}</td>
                    <td><code>{userRow.userId.substring(0, 8)}...</code></td>
                    <td>
                      <select
                        value={userRow.role}
                        onChange={(e) => handleRoleChange(userRow.email, e.target.value)}
                        disabled={actionLoading || userRow.email === user?.email}
                        className="role-select"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td>
                      <button
                        onClick={() => {
                          setSelectedUserId(userRow.userId);
                          setActiveTab('songs');
                        }}
                        className="btn-link"
                      >
                        {userRow.songCount ?? 0}
                      </button>
                    </td>
                    <td>
                      {userRow.createdAt ? new Date(userRow.createdAt).toLocaleDateString() : '-'}
                    </td>
                    <td>
                      <div className="user-actions">
                        <button
                          onClick={() => setResetPasswordModal({ isOpen: true, userEmail: userRow.email })}
                          className="btn-action"
                          disabled={actionLoading}
                          title="Reset password"
                        >
                          🔑
                        </button>
                        <button
                          onClick={() => setDeleteUserModal({
                            isOpen: true,
                            userEmail: userRow.email,
                            songCount: userRow.songCount ?? 0,
                          })}
                          className="btn-action btn-danger"
                          disabled={actionLoading || userRow.email === user?.email}
                          title="Delete user"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'songs' && (
          <div className="admin-section">
            <div className="section-header">
              <h2>
                {selectedUserId ? `Songs for ${users.find(u => u.userId === selectedUserId)?.email}` : 'All Songs'}
              </h2>
              <div className="bulk-actions">
                {selectedSongs.size > 0 && (
                  <>
                    <span className="selection-count">{selectedSongs.size} selected</span>
                    <button onClick={deselectAllSongs} className="btn-secondary">Deselect All</button>
                    <button onClick={handleBulkDelete} className="btn-danger">Delete Selected</button>
                  </>
                )}
                {selectedSongs.size === 0 && filteredSongs.length > 0 && (
                  <button onClick={selectAllSongs} className="btn-secondary">Select All</button>
                )}
                {selectedUserId && (
                  <button onClick={() => setSelectedUserId(null)} className="btn-secondary">Show All</button>
                )}
              </div>
            </div>

            <table className="all-songs-table">
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      checked={filteredSongs.length > 0 && selectedSongs.size === filteredSongs.length}
                      onChange={(e) => e.target.checked ? selectAllSongs() : deselectAllSongs()}
                    />
                  </th>
                  <th>Title</th>
                  <th>Artist</th>
                  <th>Owner</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSongs.map(song => (
                  <tr key={song.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedSongs.has(song.id)}
                        onChange={() => toggleSongSelection(song.id)}
                      />
                    </td>
                    <td>{song.title}</td>
                    <td>{song.artist}</td>
                    <td><span className="owner-email">{song.ownerEmail}</span></td>
                    <td>{new Date(song.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button onClick={() => navigate(`/song/view/${song.id}`)} className="btn-view">View</button>
                      <button onClick={() => handleDeleteSong(song.id)} className="btn-delete">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'orphaned' && (
          <div className="admin-section">
            <div className="section-header">
              <h2>Orphaned Songs</h2>
              <p className="section-description">These songs have invalid or missing user information</p>
            </div>

            <table className="all-songs-table">
              <thead>
                <tr>
                  <th>
                    <input
                      type="checkbox"
                      checked={orphanedSongs.length > 0 && orphanedSongs.every(s => selectedSongs.has(s.id))}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedSongs(new Set(orphanedSongs.map(s => s.id)));
                        } else {
                          setSelectedSongs(new Set());
                        }
                      }}
                    />
                  </th>
                  <th>Title</th>
                  <th>Artist</th>
                  <th>User ID</th>
                  <th>Owner Email</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orphanedSongs.map(song => (
                  <tr key={song.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedSongs.has(song.id)}
                        onChange={() => toggleSongSelection(song.id)}
                      />
                    </td>
                    <td>{song.title}</td>
                    <td>{song.artist}</td>
                    <td><code>{song.userId ?? 'missing'}</code></td>
                    <td>{song.ownerEmail ?? 'unknown'}</td>
                    <td>
                      <button onClick={() => navigate(`/song/view/${song.id}`)} className="btn-view">View</button>
                      <button onClick={() => handleDeleteSong(song.id)} className="btn-delete">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {orphanedSongs.length > 0 && (
              <div className="bulk-actions-bottom">
                <button
                  onClick={() => {
                    setSelectedSongs(new Set(orphanedSongs.map(s => s.id)));
                    handleBulkDelete();
                  }}
                  className="btn-danger"
                >
                  Delete All Orphaned Songs
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {resetPasswordModal.isOpen && (
        <div className="modal-overlay" onClick={() => setResetPasswordModal({ isOpen: false, userEmail: '' })}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Reset Password</h3>
            <p>Reset password for: <strong>{resetPasswordModal.userEmail}</strong></p>
            <div className="form-group">
              <label htmlFor="newPassword">New Password</label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
                disabled={actionLoading}
              />
            </div>
            <div className="modal-actions">
              <button
                onClick={handleResetPassword}
                className="btn-primary"
                disabled={actionLoading || !newPassword || newPassword.length < 8}
              >
                {actionLoading ? 'Resetting...' : 'Reset Password'}
              </button>
              <button
                onClick={() => { setResetPasswordModal({ isOpen: false, userEmail: '' }); setNewPassword(''); }}
                className="btn-secondary"
                disabled={actionLoading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteUserModal.isOpen && (
        <div className="modal-overlay" onClick={() => setDeleteUserModal({ isOpen: false, userEmail: '', songCount: 0 })}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Delete User</h3>
            <p>Are you sure you want to delete: <strong>{deleteUserModal.userEmail}</strong>?</p>
            {deleteUserModal.songCount > 0 && (
              <p className="warning-text">
                ⚠️ This user has {deleteUserModal.songCount} song(s). The songs will become orphaned.
              </p>
            )}
            <div className="modal-actions">
              <button onClick={handleDeleteUser} className="btn-danger" disabled={actionLoading}>
                {actionLoading ? 'Deleting...' : 'Delete User'}
              </button>
              <button
                onClick={() => setDeleteUserModal({ isOpen: false, userEmail: '', songCount: 0 })}
                className="btn-secondary"
                disabled={actionLoading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPage;
