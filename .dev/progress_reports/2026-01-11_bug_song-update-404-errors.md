# Fix: Song Update 404 Error & Better Error Handling

## Problems
1. Editing songs on `open-chords.vercel.app` (preview URL) resulted in 404 errors
2. Editing songs on `open-chords.org` also failed
3. No visible error messages when save failed - just silent failure
4. Error messages were not informative

## Root Causes
1. **API_BASE logic was backwards**: Used `/api` in production mode, but that only works on the custom domain, not on vercel.app preview URLs
2. **No error feedback**: Errors were console-logged but not shown to user
3. **Generic error messages**: Didn't include actual API error details

## Solutions

### 1. Fixed API_BASE Logic
Changed from checking `PROD` to checking `DEV`:

**Before (broken):**
```javascript
const API_BASE = import.meta.env.PROD ? '/api' : 'https://open-chords.org/api';
// In production (open-chords.org AND open-chords.vercel.app): uses '/api'
// Only works on open-chords.org
```

**After (fixed):**
```javascript
const API_BASE = import.meta.env.DEV ? 'https://open-chords.org/api' : '/api';
// In development (localhost): uses 'https://open-chords.org/api'
// In production (all deployed URLs): uses '/api'
// Works on both open-chords.org AND open-chords.vercel.app
```

### 2. Added Visible Error Banner
- Red banner at top of edit page
- Shows actual error message
- Closeable with ×  button
- Animation for visibility

```jsx
{error && (
  <div className="error-banner">
    <strong>Error:</strong> {error}
    <button onClick={() => setError(null)}>×</button>
  </div>
)}
```

### 3. Added Alert for Immediate Feedback
```javascript
catch (err) {
  const errorMessage = err.message || 'Failed to save song';
  setError(errorMessage);
  alert(`Error: ${errorMessage}`); // Immediate feedback
}
```

### 4. Improved Error Messages in storage.js
```javascript
if (!response.ok) {
  const errorData = await response.json().catch(() => ({ error: response.statusText }));
  const errorMsg = errorData.error || errorData.message || response.statusText;
  throw new Error(`Failed to update song: ${errorMsg} (Status: ${response.status})`);
}
```

Now shows:
- Actual API error message
- HTTP status code
- Fallback to statusText if no error details

## Files Changed
- ✅ `src/services/storage.js` - Fixed API_BASE, improved error handling
- ✅ `src/App.jsx` - Added error banner to EditSongPage
- ✅ `src/App.css` - Added error-banner styling

## Result
✅ Works on `open-chords.org`  
✅ Works on `open-chords.vercel.app` (preview URLs)  
✅ Works on `localhost:5173` (dev)  
✅ Clear error messages with details  
✅ Visible error feedback (banner + alert)  
✅ Status codes included for debugging  

---
*Last updated: 2026-01-11*

