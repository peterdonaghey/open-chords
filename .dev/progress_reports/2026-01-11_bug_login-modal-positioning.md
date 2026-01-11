# Fix: Login Modal Off-Screen

## Problem
The login modal was appearing half off the right side of the screen instead of being centered.

## Root Cause
The LoginModal was being rendered inside the UserMenu component, which has `position: relative`. This constrained the modal's positioning context, preventing the `position: fixed` overlay from working correctly relative to the viewport.

## Solution

### 1. Use React Portal
Changed LoginModal to render using `createPortal(component, document.body)`:
- Renders modal directly as a child of `<body>`
- Breaks out of parent positioning context
- Ensures `position: fixed` works relative to the viewport

### 2. Increase Z-Index
Changed modal overlay z-index from `1000` to `10000`:
- Higher than navbar dropdowns (9999)
- Ensures modal is always on top

## Code Changes

### LoginModal.jsx
```jsx
import { createPortal } from 'react-dom';

// ...

return createPortal(
  <div className="modal-overlay" onClick={handleBackdropClick}>
    {/* modal content */}
  </div>,
  document.body // Render at root, not inside parent component
);
```

### LoginModal.css
```css
.modal-overlay {
  z-index: 10000; /* Higher than all other elements */
}
```

## How Portals Work
```
Before (broken):
<div class="user-menu" style="position: relative">
  <div class="modal-overlay" style="position: fixed">
    ❌ Fixed positioning relative to parent, not viewport
  </div>
</div>

After (fixed):
<div class="user-menu" style="position: relative">
  {/* Portal renders elsewhere */}
</div>
<body>
  <div class="modal-overlay" style="position: fixed">
    ✅ Fixed positioning relative to viewport
  </div>
</body>
```

## Result
✅ Modal now perfectly centered on screen
✅ Works regardless of where UserMenu is positioned
✅ Higher z-index ensures it's always on top
✅ Backdrop blur covers entire viewport

---
*Last updated: 2026-01-11*

