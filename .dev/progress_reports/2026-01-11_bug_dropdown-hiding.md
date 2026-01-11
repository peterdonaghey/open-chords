# Fix: Dropdown Menus Hiding on Hover

## Problem
When viewing a song, the navbar auto-hides when mouse moves away from the top 80px. This caused dropdowns (Theme selector and User menu) to immediately close when the mouse moved over them, making them completely unusable.

## Root Cause
The auto-hide logic would hide the navbar immediately when `e.clientY > 80`, but the dropdowns extend below 80px. Moving the mouse to select a theme or menu item would trigger the hide logic.

## Solution

### 1. Track Dropdown State
- Added `hasDropdownOpen` state to `ViewSongPage`
- Pass `onDropdownChange` callback to `UnifiedNavBar`
- UnifiedNavBar passes it to `ThemeSelector` and `UserMenu`
- Both components notify parent when dropdown opens/closes

### 2. Expanded Detection Area
- Changed from `e.clientY < 80` to `e.clientY < 400`
- This covers the navbar + dropdown area
- Navbar stays visible when mouse is anywhere in this region

### 3. Prevent Hide When Dropdown Open
- Check `hasDropdownOpen` before hiding navbar
- If any dropdown is open, navbar stays visible
- Increased hide timeout from 2s to 3s for better UX

### 4. Higher Z-Index
- Theme dropdown: `z-index: 9999`
- User menu dropdown: `z-index: 9999`
- Ensures dropdowns are above all other content

## Code Changes

### App.jsx
```jsx
const [hasDropdownOpen, setHasDropdownOpen] = useState(false);

// In handleMouseMove:
if (hasDropdownOpen) {
  setIsNavVisible(true);
  return;
}

if (e.clientY < 400) { // Expanded area
  setIsNavVisible(true);
  // Hide after 3s if no dropdown open
  hideTimeout = setTimeout(() => {
    if (!hasDropdownOpen) {
      setIsNavVisible(false);
    }
  }, 3000);
}
```

### UnifiedNavBar.jsx
```jsx
<ThemeSelector onDropdownChange={onDropdownChange} />
<UserMenu onDropdownChange={onDropdownChange} />
```

### ThemeSelector.jsx & UserMenu.jsx
```jsx
useEffect(() => {
  if (onDropdownChange) {
    onDropdownChange(isOpen);
  }
}, [isOpen, onDropdownChange]);
```

## Testing
1. Open a song in view mode
2. Move mouse to top → navbar appears
3. Click theme selector → dropdown opens, navbar stays visible
4. Hover over theme options → navbar doesn't hide
5. Select theme → dropdown closes, navbar auto-hides after 3s
6. Same behavior for user menu dropdown

## Result
✅ Dropdowns are now fully usable in song view mode
✅ Navbar stays visible while interacting with dropdowns
✅ Auto-hide still works when dropdowns are closed
✅ Pin button still works to keep navbar always visible

---
*Last updated: 2026-01-11*

