# admin role system implementation complete

## summary
implemented hardcoded admin role system using email-based authentication
- admin email: `donagheupeter@googlemail.com`
- full crud access to all songs via ui and api
- admin dashboard for user and song management
- bulk delete capability for orphaned songs

## changes made

### 1. environment configuration
**`.env.local`**
- added `VITE_ADMIN_EMAIL=donagheupeter@googlemail.com`
- added `ADMIN_EMAIL=donagheupeter@googlemail.com` (backend)

### 2. authentication context
**`src/context/AuthContext.jsx`**
- added `isAdmin` state
- checks `user.email === VITE_ADMIN_EMAIL` on auth
- exposes `isAdmin` in context value

### 3. api authentication
**`api/_auth.js`**
- added `isAdmin(email)` helper function
- updated `authenticateRequest` to return `{ userId, email, isAdmin }`

### 4. admin api endpoints
**`api/admin/users.js`** (new)
- `GET /api/admin/users` - lists all users with song counts
- aggregates songs by userId
- requires admin authentication

**`api/admin/songs.js`** (new)
- `GET /api/admin/songs` - lists all songs
- `DELETE /api/admin/songs?id=<songId>` - deletes any song
- requires admin authentication

**`api/songs/[id].js`** (updated)
- delete endpoint now allows admin OR owner
- checks `isOwner || isAdmin` before deletion

### 5. admin dashboard
**`src/pages/AdminPage.jsx`** (new)
- three tabs: users, all songs, orphaned songs
- user table with song counts and "view songs" action
- all songs table with filtering, sorting, bulk select
- orphaned songs detection and bulk delete
- proper loading states and error handling

**`src/pages/AdminPage.css`** (new)
- responsive table layouts
- admin-specific styling with orange/peach accents
- mobile-optimized views

### 6. routing
**`src/App.jsx`**
- updated `ProtectedRoute` to accept `requireAdmin` prop
- added `/admin` route with admin protection
- imported `AdminPage` component

### 7. user interface
**`src/components/UserMenu.jsx`**
- added `isAdmin` from auth context
- displays "Admin" badge in dropdown header
- added "⚡ Admin Panel" menu item for admins only
- special gradient styling for admin menu item

**`src/components/UserMenu.css`**
- added `.admin-badge` styling
- added `.admin-menu-item` gradient background

**`src/components/SongList.jsx`**
- updated delete permissions: `isOwner || isAdmin`
- added `isAdmin` badge on non-owned songs when viewing as admin
- passes `isAdmin` prop to `SongCard` component

**`src/components/SongList.css`**
- added `.song-card-admin-badge` styling with gradient and shadow

## features implemented

### admin dashboard
1. **users tab**
   - lists all users by email and userId
   - shows song count per user
   - click "view songs" to filter songs by user

2. **all songs tab**
   - displays every song in database
   - sortable and filterable
   - bulk selection with checkboxes
   - "select all" / "deselect all" actions
   - "delete selected" bulk action
   - individual delete and view buttons

3. **orphaned songs tab**
   - auto-detects songs with missing/invalid userId
   - bulk delete all orphaned songs button
   - helps clean up test data

### song list permissions
- admin can delete any song (not just owned songs)
- visual "⚡ admin" badge shows on non-owned songs
- regular users unaffected (can only delete own songs)

### security
- frontend checks (`isAdmin`) for ux only
- backend enforces all permissions
- jwt token validated before checking admin email
- admin endpoints return 403 for non-admin users
- regular song endpoints check ownership OR admin

## testing checklist
- [x] environment variables configured
- [x] auth context includes `isAdmin`
- [x] api endpoints created and secured
- [x] admin page component created
- [x] admin route added with protection
- [x] user menu shows admin panel option
- [x] song list shows admin badges
- [x] song list allows admin delete
- [ ] **requires vite server restart** to pick up new env var
- [ ] verify admin panel visible in user menu
- [ ] test admin dashboard loads users
- [ ] test admin dashboard loads songs
- [ ] test admin can delete any song
- [ ] test non-admin cannot access /admin
- [ ] test non-admin cannot delete others' songs
- [ ] test bulk delete functionality
- [ ] test orphaned songs detection

## next steps for user
1. **restart vite dev server** to load new `VITE_ADMIN_EMAIL`
2. refresh browser
3. check user menu dropdown for "⚡ admin panel" option
4. navigate to `/admin` route
5. verify users and songs tables load
6. test delete permissions on songs you don't own
7. test bulk delete on orphaned songs

## files modified
- `.env.local` (admin email config)
- `src/context/AuthContext.jsx` (isAdmin state)
- `src/services/auth.js` (no changes needed)
- `src/App.jsx` (admin route, protected route)
- `src/components/UserMenu.jsx` (admin menu item)
- `src/components/UserMenu.css` (admin badge styles)
- `src/components/SongList.jsx` (admin delete perms)
- `src/components/SongList.css` (admin badge styles)
- `api/_auth.js` (isAdmin helper)
- `api/songs/[id].js` (admin delete allowed)

## files created
- `src/pages/AdminPage.jsx` (admin dashboard)
- `src/pages/AdminPage.css` (dashboard styles)
- `api/admin/users.js` (users endpoint)
- `api/admin/songs.js` (admin songs endpoint)

## deployment notes
**critical:** when deploying to vercel, add environment variable:
```
ADMIN_EMAIL=donagheupeter@googlemail.com
```

without this backend env var, admin api endpoints will not recognize admin user

