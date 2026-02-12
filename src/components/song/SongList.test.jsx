import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../../test/utils/test-utils';
import userEvent from '@testing-library/user-event';
import SongList from './SongList';
import { allSongs } from '../../test/fixtures/songs';

describe('SongList component', () => {
  const mockOnSelectSong = vi.fn();
  const mockOnNewSong = vi.fn();
  const mockOnDeleteSong = vi.fn();

  const defaultProps = {
    songs: allSongs,
    onSelectSong: mockOnSelectSong,
    onNewSong: mockOnNewSong,
    onDeleteSong: mockOnDeleteSong,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render list of songs', () => {
    render(<SongList {...defaultProps} />);
    
    // Check that at least some songs are rendered
    expect(screen.getByText('Test Song')).toBeInTheDocument();
    // Note: Test Artist appears multiple times in fixture, so we just check it exists
    const artists = screen.getAllByText(/Test Artist/);
    expect(artists.length).toBeGreaterThan(0);
  });

  it('should call onNewSong when New Song button clicked', async () => {
    const user = userEvent.setup();
    render(<SongList {...defaultProps} />);
    
    const newButton = screen.getByText(/new song/i);
    await user.click(newButton);
    
    expect(mockOnNewSong).toHaveBeenCalled();
  });

  it('should call onSelectSong when song is clicked', async () => {
    const user = userEvent.setup();
    render(<SongList {...defaultProps} />);
    
    const song = screen.getByText('Test Song');
    await user.click(song);
    
    expect(mockOnSelectSong).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Test Song',
      })
    );
  });

  it('should show empty state when no songs', () => {
    render(<SongList {...defaultProps} songs={[]} />);
    
    expect(screen.getByText(/no songs/i)).toBeInTheDocument();
  });

  it('should display song count', () => {
    render(<SongList {...defaultProps} />);
    
    expect(screen.getByText(new RegExp(`${allSongs.length}.*song`, 'i'))).toBeInTheDocument();
  });
});

