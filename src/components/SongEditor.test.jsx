import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../test/utils/test-utils';
import userEvent from '@testing-library/user-event';
import SongEditor from './SongEditor';

describe('SongEditor component', () => {
  const mockOnSave = vi.fn();
  const mockOnCancel = vi.fn();

  const defaultProps = {
    onSave: mockOnSave,
    onCancel: mockOnCancel,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render new song form', () => {
    render(<SongEditor {...defaultProps} />);
    
    expect(screen.getByText('New Song')).toBeInTheDocument();
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/artist/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/key/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/song content/i)).toBeInTheDocument();
  });

  it('should render edit song form with existing data', () => {
    const existingSong = {
      id: '1',
      title: 'Existing Song',
      artist: 'Existing Artist',
      key: 'G',
      type: 'chords',
      content: 'G D Em C\nTest lyrics',
    };
    
    render(<SongEditor {...defaultProps} song={existingSong} />);
    
    expect(screen.getByText('Edit Song')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Existing Song')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Existing Artist')).toBeInTheDocument();
    // Check content is present (may have textarea value attribute issue)
    expect(screen.getByLabelText(/song content/i).value).toContain('G D Em C');
  });

  it('should update title field', async () => {
    const user = userEvent.setup();
    render(<SongEditor {...defaultProps} />);
    
    const titleInput = screen.getByLabelText(/title/i);
    await user.type(titleInput, 'New Song Title');
    
    expect(titleInput).toHaveValue('New Song Title');
  });

  it('should update artist field', async () => {
    const user = userEvent.setup();
    render(<SongEditor {...defaultProps} />);
    
    const artistInput = screen.getByLabelText(/artist/i);
    await user.type(artistInput, 'New Artist');
    
    expect(artistInput).toHaveValue('New Artist');
  });

  it('should update content field', async () => {
    const user = userEvent.setup();
    render(<SongEditor {...defaultProps} />);
    
    const contentInput = screen.getByLabelText(/song content/i);
    await user.type(contentInput, 'C G Am F');
    
    expect(contentInput).toHaveValue('C G Am F');
  });

  it('should change key selection', async () => {
    const user = userEvent.setup();
    render(<SongEditor {...defaultProps} />);
    
    const keySelect = screen.getByLabelText(/key/i);
    await user.selectOptions(keySelect, 'G');
    
    expect(keySelect).toHaveValue('G');
  });

  it('should call onSave with song data on submit', async () => {
    const user = userEvent.setup();
    render(<SongEditor {...defaultProps} />);
    
    await user.type(screen.getByLabelText(/title/i), 'Test Song');
    await user.type(screen.getByLabelText(/artist/i), 'Test Artist');
    await user.type(screen.getByLabelText(/song content/i), 'C G Am F\nLyrics');
    
    await user.click(screen.getByText('Save Song'));
    
    expect(mockOnSave).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Test Song',
        artist: 'Test Artist',
        content: 'C G Am F\nLyrics',
        key: 'C',
      })
    );
  });

  it('should call onCancel when cancel button clicked', async () => {
    const user = userEvent.setup();
    render(<SongEditor {...defaultProps} />);
    
    await user.click(screen.getByText('Cancel'));
    
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('should toggle preview mode', async () => {
    const user = userEvent.setup();
    render(<SongEditor {...defaultProps} />);
    
    await user.type(screen.getByLabelText(/song content/i), 'C G Am F\nLyrics');
    
    const previewButton = screen.getByText('Preview');
    await user.click(previewButton);
    
    expect(screen.getByText('Edit')).toBeInTheDocument();
  });

  it('should disable preview when content is empty', () => {
    render(<SongEditor {...defaultProps} />);
    
    const previewButton = screen.getByText('Preview');
    expect(previewButton).toBeDisabled();
  });

  it('should show anonymous user badge when not authenticated', () => {
    render(<SongEditor {...defaultProps} />);
    
    expect(screen.getByText('Anonymous')).toBeInTheDocument();
    expect(screen.getByText('(Sign in to claim)')).toBeInTheDocument();
  });

  it('should generate unique ID for new songs', async () => {
    const user = userEvent.setup();
    render(<SongEditor {...defaultProps} />);
    
    await user.type(screen.getByLabelText(/title/i), 'Test');
    await user.type(screen.getByLabelText(/artist/i), 'Test');
    await user.type(screen.getByLabelText(/song content/i), 'Test');
    await user.click(screen.getByText('Save Song'));
    
    expect(mockOnSave).toHaveBeenCalledWith(
      expect.objectContaining({
        id: expect.any(String),
      })
    );
  });

  it('should preserve song ID when editing', async () => {
    const user = userEvent.setup();
    const existingSong = {
      id: 'existing-id',
      title: 'Old Title',
      artist: 'Old Artist',
      key: 'C',
      type: 'chords',
      content: 'Old content',
    };
    
    render(<SongEditor {...defaultProps} song={existingSong} />);
    
    await user.clear(screen.getByLabelText(/title/i));
    await user.type(screen.getByLabelText(/title/i), 'New Title');
    await user.click(screen.getByText('Save Song'));
    
    expect(mockOnSave).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'existing-id',
        title: 'New Title',
      })
    );
  });

  it('should show all key options in dropdown', () => {
    render(<SongEditor {...defaultProps} />);
    
    const keySelect = screen.getByLabelText(/key/i);
    const options = keySelect.querySelectorAll('option');
    
    // Should have major and minor keys
    expect(options.length).toBeGreaterThan(12);
    expect(screen.getByRole('option', { name: 'C' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Am' })).toBeInTheDocument();
  });

  it('should not show cancel button when onCancel not provided', () => {
    render(<SongEditor onSave={mockOnSave} />);
    
    expect(screen.queryByText('Cancel')).not.toBeInTheDocument();
  });
});

