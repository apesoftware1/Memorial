[OPEN]

# Debug Session: locations-500-dev

## Symptom
- Visiting `/locations/kwazulu-natal/bhamshela` returns 500
- Errors include:
  - ENOENT: missing `.next/routes-manifest.json`
  - MODULE_NOT_FOUND: missing `./vendor-chunks/next-auth.js` referenced from compiled `.next/server/app/locations/[...segments]/page.js`

## Current Hypotheses
1. Server is running in production mode (`next start`) without a successful `next build`, so required `.next/*` build artifacts are missing.
2. `.next/` build output exists but is corrupted / partially written (e.g., interrupted build or cache corruption), causing missing manifest and vendor chunks.
3. Running process is pointing at stale `.next/` output from a different dependency graph (e.g., after dependency change), leading to missing vendor chunks.
4. Filesystem race / permissions issue prevents webpack/Next from writing `.next/` cache files (rename ENOENT), cascading into missing artifacts.
5. A production build (`next build`) ran while a dev server (`next dev`) was running, replacing `.next/server` (and removing `vendor-chunks`) and causing dev requests to crash with ENOENT.

## Evidence To Collect
- Whether the user started `npm run dev` or `npm run start`
- Existence of `.next/routes-manifest.json` at runtime
- Whether a fresh `npm run build` recreates the missing files

## Evidence Collected
- Confirmed `.next/routes-manifest.json` was missing in the broken state (ENOENT reproduced).
- After deleting `.next/` and running `npm run build`, `.next/routes-manifest.json` is generated again.
- After restarting `npm run dev` and requesting `/locations/kwazulu-natal/bhamshela`, the route returns HTTP 200.
- Observed dev-only files like `.next/server/vendor-chunks/*` can be missing after a production build, which matches the ENOENT errors for `vendor-chunks/next.js`.
