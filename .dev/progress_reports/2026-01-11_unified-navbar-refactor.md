# Unified Navigation Bar Refactor

## Problem
The view song page had TWO separate navigation bars fighting each other:
1. A compact auto-hiding header (logo, theme, edit, back, user menu)
2. A separate Toolbar (transpose, auto-scroll, compact toggle)

Both were visible at the same time, causing layout conflicts and confusion.

## Solution
Created a **single unified navigation bar** (`UnifiedNavBar`) that consolidates ALL controls into ONE bar.

### Features
- **Two modes**:
  - `normal`: Always visible, simple (logo + user menu)
  - `song-view`: Auto-hiding, full controls (everything in one bar)
  
- **Auto-hide behavior** (song-view mode):
  - Hidden by default
  - Shows when mouse moves to top 80px of screen
  - Hides after 2 seconds of inactivity OR when mouse moves away
  
- **All controls in one place**:
  - Logo (clickable to home)
  - Transpose controls (-, display, +)
  - Auto-scroll controls (play/pause, slider, speed display)
  - Compact mode toggle
  - Keyboard shortcuts indicator
  - Theme selector
  - Edit button
  - Back button
  - User menu

### Files Changed
- **Created**: `src/components/UnifiedNavBar.jsx` - New unified component
- **Created**: `src/components/UnifiedNavBar.css` - Styling for unified navbar
- **Modified**: `src/App.jsx` - Replaced all old headers and Toolbar with UnifiedNavBar
- **Modified**: `src/App.css` - Added page-content padding and cleaned up old styles

### Technical Details
- Fixed positioning with z-index: 1000
- Flexbox layout: left (logo), center (controls), right (actions)
- Transform-based show/hide animation
- Backdrop blur for visual polish
- Responsive design (hides some elements on mobile)

## Testing
Run `npm run dev` and visit http://localhost:5173/songs, click any song to see the auto-hiding navbar in action.

## Deploy When Ready
```bash
./deploy.sh
```

---
*Last updated: 2026-01-11*

