# offline support - fix and deploy

## what was broken
- deployment failed after initial push
- user reported "nothing worked and everything's broken"

## fixes applied
1. **IndexedDB guards** - `songCache.ts` now checks `typeof indexedDB !== 'undefined'` before any access
2. **Cache error handling** - storage.ts wraps all cache save/read in try/catch, cache failures don't break app
3. **Defensive fallbacks** - when cache read fails, throw clear "Offline: no cached songs" message

## verification
- `npm run build` - passes
- `npm run test:unit` - 131 tests pass
- `vercel --prod` - deploy succeeded
- `curl https://open-chords.org/api/songs` - 200, returns song data
- pushed fix commit 219e092 to main

## deployment
- fix pushed to main
- Vercel auto-deploys from main
- open-chords.org should now serve working build
