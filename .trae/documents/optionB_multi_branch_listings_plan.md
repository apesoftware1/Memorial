# Option B: Multi-Branch Listings (Canonical Slugs + Any-Branch Match) Implementation Plan

## Repository Research

### Current state (before Option B):
1. **[slugs.js](file:///Users/kelvin/Documents/my%20projects/Finder/Memorial/lib/slugs.js#L70-L144)**
   - `pickListingTown(listing)`: picks `branches[0].location.town` (or company.location fallback). Used as the default town for building canonical slugs.
   - `buildListingCanonicalSegments(listing)` → builds `[segName, segStone, segHead, "tombstone", segTown]`. 5-segment when `segHead` present, else 4-segment.
   - `buildListingCanonicalHref(listing)` → returns `/tombstones/<slug>` with the above.
   - Problem (Option B gap): Slug builder only knows about ONE canonical town (branches[0] / HQ). If a listing is available at 10 branches and a user visits `/tombstones/<code>-<...>-jozini` (alternate branch), the current strict resolver requires the full slug to match exactly. It cannot recognise that the prefix identifies the listing and the town is merely a secondary metadata segment that must be validated against ALL branches, not just the first one.

2. **[page.tsx](file:///Users/kelvin/Documents/my%20projects/Finder/Memorial/app/tombstones/[slug]/page.tsx#L437-L580) — `fetchListingByNormalizedSlug(rawSlug)`**
   - 7-tier matching flow: TIER 1 (saved-slug exact) → TIER 2 (raw saved-slug) → TIER 3a/b/c (name-prefix GQL candidates) → TIER 4 (title GQL candidates) → TIER 5a/b (combined exact) → TIER 6 (fuzzy scoring) → TIER 7 (simple-prefix last-resort).
   - **Current strictness**: TIERs 3a, 3b, 5a, 5b, 7a, 7b do `canonicalSlug(candidate) === normalized` or `cleanSlug(candidate) === normalized`. This means if the user's URL says town="jozini" but the listing's canonical one-town slug builder returned "richards-bay" as the primary town, the exact-equality checks miss the match. Then it falls through to fuzzy (tier 6 / prefix tiers 3c / 7c) with low likelihood.
   - Problem (Option B gap): Town treated as an invariant — the resolver has no concept of "match listing by name/material/style first, then verify town segment belongs to any of the listing's branches".
   - Problem (Option B gap #2): LISTING_RESULT_FRAGMENT **already** fetches `branches(pagination:{limit:25}){documentId name location{town city province address}}` (good) BUT `fetchListingBySavedSlug()` only fetches `branches(pagination:{limit:25}){documentId name}` (missing location fields). Similarly `fetchListingsByIds()` for similar-products section has NO branches and NO company.location structure. These gaps need standardising per the user's step 3.

3. **GraphQL queries coverage**
   - ✅ `getListingById.js`: FULL coverage of `branches(pagination:{limit:-1}){ documentId name sales_reps {...} location { address latitude longitude mapUrl town } }`. This is the most complete — used by Apollo on client pages (manufacturer profile / product showcase).
   - ⚠️ `LISTING_RESULT_FRAGMENT` (resolver): Already has `branches(pagination:{limit:25}){ documentId name location { town city province address } }` and full `company{ ... location ... }`. Great, but used only by the resolver's tier 3-7 queries — NOT by `fetchListingBySavedSlug()` (TIER 1/2).
   - ⚠️ `fetchListingBySavedSlug()` (TIER 1/2): branches[] selection has ONLY `{documentId name}`. Per user spec step 3, must add `location{town area city address}`.
   - ⚠️ `fetchListingsByIds()` (Similar products): Has NO branches[] and has `company{ documentId name location logoUrl hideStandardCompanyLogo latitude longitude }`. Needs `branches(limit:-1){ documentId name location{town city area address} }` AND full `company{...location, ...town?}`.
   - ✅ `homepage2026.ts`: Already added `branches(pagination:{limit:1}){documentId location{town city}}` (from earlier fix). OK but could expand to include `name, location.address, location.province, location.area`.
   - ✅ `FeaturedListings.js` & `PremiumListings.jsx` wrappers: They just call `buildListingCanonicalHref(listing)`. They depend on the *upstream* GQL result. So fixing the homepage GQL query + resolver fragments + get-by-ids query will automatically fix these wrappers (no card-wrapper code change needed).
   - ⚠️ `product-showcase.jsx` / `manufacturers-Profile-Page/ListingCardItem.jsx`: Already compute via `buildListingCanonicalHref(listing) || legacy`. Dependent on upstream data only.

4. **Key GQL `Listing` Type confirmation (from earlier introspection):**
   - `name` field DOES NOT exist on Listing (confirmed via `__type` introspection curl: 36 fields, no `name`). Do NOT re-add it, ever.
   - Listing title example `"GC29-FS"` (alphanumeric model code). This IS the product code. No separate "model code" field.
   - `productDetails.stoneType[]` → Granite, Marble, Sandstone…
   - `productDetails.style[]` → Pillars, Teddy Bear, Arch, Open Book, etc.
   - `branches[].location.town/city/address/province` exists.

5. **User's 3 requirements (VERBATIM, decomposed):**
   - **R1 (Slug Builder):** Default town = primary (HQ or branches[0].town). 5-segment format preserved. → Minimal code change, mostly already done; just need to ensure robustness (empty branches → fall back to company town cleanly, never return "south-africa" etc.).
   - **R2 (Resolver — this is the heart of Option B):**
     - a) Split slug → isolate product prefix (before stone/style/tombstone/town tokens) independently of the trailing town.
     - b) Resolve listing record first using that prefix (TIER 1 exact → TIER 3 name-prefix GQL as today).
     - c) Once listing record obtained, extract ALL branches (not just branches[0]).
     - d) Determine what "URL town segment" was provided (last meaningful segment or omitted).
     - e) Validate: URL-town ∈ any branch.town/city/area (or ∈ company.location tokens), OR URL-town segment was absent. If valid → HTTP 200, render listing. If invalid (town exists in URL AND doesn't match any branch) → only THEN should it 404 (or permanentRedirect to correct canonical).
   - **R3 (GraphQL fragments):**
     - Expand 3 key sites to consistent full `branches` shape + `company.location/city/town` (if available):
       (i) `fetchListingBySavedSlug` (page.tsx) — fix TIER 1/2 branches shape to match LISTING_RESULT_FRAGMENT.
       (ii) `LISTING_RESULT_FRAGMENT` (page.tsx) — add `location.area` if supported (see getListingById.js reference).
       (iii) `fetchListingsByIds` (page.tsx) — add branches[] & enrich company{}.
       (iv) `homepage2026.ts` Featured carousel query — enrich branches selection (was added earlier with min fields, now expand).
       Note: `FeaturedListings.js`, `PremiumListings.jsx`, `StandardListings.jsx` wrappers do NOT need code changes because they only compute `buildListingCanonicalHref(listing)` — fixing their upstream data (homepage2026.ts + list-page SSR queries + resolver fragments) is sufficient per user's R3 spirit.

---

## Files and Modules

| File | Expected change |
|---|---|
| [lib/slugs.js](file:///Users/kelvin/Documents/my%20projects/Finder/Memorial/lib/slugs.js) | **R1 + R2 helpers:** (1) Tighten `pickListingTown` primary selection (never return "south-africa"/province/numeric — current state after last session's fix does this already; small additional guard for HQ-vs-branches[0]). (2) Add new helper `extractUrlTownSegment(rawSlug)` → isolate trailing 1–2 segments (before/after `tombstone`). (3) Add new helper `listingAvailableAtTown(listing, urlTownSlug)` → checks if `urlTownSlug` matches any `branches[].location.town/city/area/address` (via `toSlugSegment`) OR any clean token of `company.location`. (4) Add new helper `buildAllCanonicalSlugsForListing(listing)` → returns array of slugs for EVERY branch town (used by resolver for cross-match + later by SEO/sitemap). (5) Preserve existing behavior of `buildListingCanonicalSlug` = primary town only (for default hrefs on cards). |
| [app/tombstones/[slug]/page.tsx](file:///Users/kelvin/Documents/my%20projects/Finder/Memorial/app/tombstones/[slug]/page.tsx) | **R2 (Resolver) + R3 (GQL fragments):** (1) Expand `fetchListingBySavedSlug` branches selection `{documentId name}` → `{documentId name location { town city province area address } }`. (2) Add `location.area` & `address` to `LISTING_RESULT_FRAGMENT.branches.location` & ensure company sub-selection matches user spec (city/town). (3) Expand `fetchListingsByIds`: add full `branches{}` same as fragment; keep company but confirm has city/town if shape allows. (4) Inside `fetchListingByNormalizedSlug(rawSlug)`, after every TIER returns a candidate `listing` (but BEFORE the 3a/3b/5a/5b exact-slug equality checks drop the match), run a new Option-B relaxed-matching gate: `listingAvailableAtTown(listing, extractUrlTownSegment(rawSlug)) === true`. If true AND the name/material/style prefix of the listing matches the URL's name/material/style prefix → ACCEPT even if full canonical slug differs (different town). (5) Additionally: if prefix matches but town doesn't AND listing actually exists → `permanentRedirect` to the primary-town canonical URL (better UX than 404). |
| [graphql/queries/2026Queries/homepage2026.ts](file:///Users/kelvin/Documents/my%20projects/Finder/Memorial/graphql/queries/2026Queries/homepage2026.ts) | **R3 GQL enrichment:** Expand `branches(pagination:{limit:1}){documentId location{town city}}` → add `name` and `location{town city province area address}` so FeaturedListings.js data parity with resolver fragments. |
| [graphql/queries/getListingById.js](file:///Users/kelvin/Documents/my%20projects/Finder/Memorial/graphql/queries/getListingById.js) | **R3 verification only (optional touch):** Currently branches has `{town}` only inside `location{}`; optionally add `city area province` to branches.location shape if not present (currently  `location { address, latitude, longitude, mapUrl, town }` — already has town; just add `city province area` for parity. Also confirm company.location is there (it is, scalar `location` string). NO functional change, just structural completeness per user's R3 goal. |

**Files that do NOT need code changes (verified):**
- `FeaturedListings.js` — purely relies on `buildListingCanonicalHref(listing)` from GQL data.
- `PremiumListings.jsx` — same pattern.
- `StandardListings.jsx` — same pattern.
- `manufacturers-Profile-Page/ListingCardItem.jsx` — same pattern.
- `PremiumListingCard.tsx`, `standard-listing-card.tsx`, `product-showcase.jsx` — unchanged since they consume href from above.

---

## Implementation Steps (Dependency Order)

### Step 1 — Slug Helpers (`lib/slugs.js`)
Prerequisites: None. Lowest-level change.
1. Add `extractUrlTownSegment(rawSlug: string): string`
   - Split `normalizeListingSlug(rawSlug)` on `-`.
   - If last meaningful non-empty segment is a keyword tombstone/stoneType we recognise → skip it (no town).
   - Otherwise: walk backwards past keywords (`granite`, `pillars`, `tombstone`, etc.) until first non-keyword segment → that is the `urlTownSegment`. If none, return `""`.
   - If segment equals a known country/province token (same list as in pickListingTown) → treat as absent (return `""`).
2. Add `normalizeTownCompare(v: string): string` — reuse `toSlugSegment` but also strip "south-africa"/kzn/gauteng etc.
3. Add `listingAvailableAtTown(listing: any, urlTownSlug: string): boolean`
   - If `urlTownSlug` is empty → return true (absent = matches).
   - Iterate `listing.branches[]`: for each branch, compute slugified segments of `b.location.town`, `.city`, `.area`, `.address` (last meaningful non-street segment). If ANY match `urlTownSlug` → true.
   - Additionally parse `listing.company?.location` CSV with same filter logic as pickListingTown; if any candidate token slugifies to match → true.
   - Additionally check `listing.location?.town/.city` scalar fields if present.
4. Add `buildAllCanonicalSlugsForListing(listing): string[]`
   - Take `buildListingCanonicalSegments(listing)` as template but replace the `segTown` with EACH unique town found by `listingAvailableAtTown` logic (union of all valid town candidates).
   - Dedupe; primary first.
5. Review `pickListingTown` — confirm it still returns branches[0] as primary and never returns country/province/numeric. (Current version in research already does this; keep as is unless any issue.)

### Step 2 — GQL Fragments (`app/tombstones/[slug]/page.tsx`)
Prerequisites: Step 1 (because Step 3 uses new data shape for new resolver logic).
1. `fetchListingBySavedSlug` → branches sub-selection: change from `{documentId name}` → `{documentId name location { town city province area address }}`. Also confirm company already has city/town fields (in research it has `location` scalar + `latitude/longitude`; leave as-is since city/town scalar may not exist on company type in GQL).
2. `LISTING_RESULT_FRAGMENT.branches.location` → currently has `{town city province address}`. Add `area` to that list: `{town city province area address}`.
3. `fetchListingsByIds` → currently NO branches[]; add full `branches(pagination: { limit: -1 }) { documentId name location { town city province area address } }` after `additionalProductDetails{}`. Also keep company scalar location (already there). No breaking changes.

### Step 3 — Resolver Option B logic (`app/tombstones/[slug]/page.tsx`)
Prerequisites: Step 2 (GQL enriched), Step 1 (helpers available).
1. Import new helpers from slugs.js: `extractUrlTownSegment`, `listingAvailableAtTown`, `buildAllCanonicalSlugsForListing` (already importing other slug utils; extend import line).
2. Inside `fetchListingByNormalizedSlug(rawSlug)`, BEFORE the 7-tier flow:
   - Compute `urlTown = extractUrlTownSegment(rawSlug)`.
   - Compute `productPrefix = extractListingNamePrefix(normalized)` (already done; reuse the var).
3. NEW validation gate. At each tier that currently returns with exact equality (`if (canonical === normalized) return c` etc.), keep as-is BUT additionally add **NEW relaxed equality helper** `isListingMatchForUrl(listing, normalized, urlTown)`:
   - Rule A: canonicalSlug(listing) OR cleanSlug(listing) === normalized → accept (existing strict path).
   - Rule B: (NEW) `productPrefix` of URL matches `extractListingNamePrefix(buildListingCanonicalSlug(listing))` (i.e., name+material+head segments match ignoring town) AND `listingAvailableAtTown(listing, urlTown)` → ACCEPT.
   - Rule C: (NEW) Rule B passes but `listingAvailableAtTown(listing, urlTown) === false` AND urlTown is non-empty → **reject this candidate** (listing exists but this URL town is wrong for it).
4. **Post-resolver redirect in `LocationTombstonesPage` and `generateMetadata`**:
   Today at L778 / L904:
   ```
   const canonicalListingSlug = cleanListingSlug(listing.slug, listing.title);
   if (canonicalListingSlug && normalized !== canonicalListingSlug) permanentRedirect(...);
   ```
   Change this to:
   ```
   const canonicalListingSlug = buildListingCanonicalSlug(listing) || cleanListingSlug(...);
   ```
   But importantly: **if the current URL town is valid for this listing (i.e., alternate-branch URL)**, we should serve it with a canonical tag pointing to the primary-town canonical (not 308-redirect). Reason: multi-branch URLs are alternate valid SEO URL forms that should all be crawlable but canonicalised to HQ. Add a helper: `shouldRedirectToPrimary(listing, rawSlug) → boolean` → only true if town segment actually does NOT belong to any branch (otherwise serve it, canonical tag set to primary).

### Step 4 — GQL Enrichment: homepage2026.ts & getListingById.js
Prerequisites: None (can parallel, but do after steps 1-3 to keep small batches).
1. **homepage2026.ts** (inside `homepageListings.nodes`):
   Expand from `branches(pagination: { limit: 1 }) { documentId location { town city } }` →
   ```graphql
   branches(pagination: { limit: 1 }) {
     documentId
     name
     location {
       town
       city
       province
       area
       address
     }
   }
   ```
2. **getListingById.js** (optional, for parity; user mentioned it):
   `branches(pagination: { limit: -1 }).location` currently has `{ address, latitude, longitude, mapUrl, town }` → add `city province area`. Confirm company.location still string scalar, keep.

---

## Dependencies and Considerations

- **Field `area` existence:** User explicitly mentions `branches { ... area }`. However `__type` introspection wasn't run for the `BranchLocation` type. If `area` does not exist as a GQL field, Apollo/GQL will return an error at query time (currently the `fetchGraphQL()` wrapper swallows errors with `if (json.errors.length) return null`). **Mitigation:** In Step 2/4, run a quick `__type(BranchLocation)` curl check AFTER applying GQL edits but BEFORE full resolver test. If `area` field missing, drop it from selection sets and log it. No harm, just feature-degrade.
- **`company.location` vs. `company.location.town/city` — scalar vs nested:** From research, `company.location` is a STRING scalar in all resolver fragments and getListingById.js, not a nested object. User spec R3 says "company { location city town }". Since this is actually a scalar location string (e.g. CSV "12 Main St, Durban, KZN, South Africa"), the "city/town" as direct nested fields likely DON'T exist on Strapi company.type. **Mitigation:** Do NOT add `company { city town }` — attempting would cause GQL error. We already parse the CSV scalar via pickListingTown helpers in Step 1, which covers the user spirit. Log this architectural note.
- **Redirect-vs-serve canonical alternates:** Option B says "if town segment matches any branch → HTTP 200, else fail". We DON'T want to permanentRedirect alternate-branch URLs because SEO alternates should all be reachable with a `<link rel=canonical>` to the primary. This is a considered UX & SEO choice — captured in Step 3.4.
- **7-tier ordering preserved:** Option B logic is an ADDITIONAL acceptance gate (relaxed exact-equality with town match verification). It NEVER replaces or removes existing TIER 1-7 hard paths. If any hard path fires first, it wins unchanged.
- **No Strapi mutations permitted** per earlier constraints — we only expand read-only selection sets; safe.

---

## Validation

| Step | Check |
|---|---|
| 1 (slugs.js helpers) | Quick node snippet `node -e` tests for `extractUrlTownSegment("gc29-fs-granite-pillars-tombstone-jozini")` should yield `"jozini"`; for `"gc29-fs-granite-pillars-tombstone-richards-bay"` → `"richards-bay"`; for `"gc29-fs-granite-pillars-tombstone-south-africa"` → `""` (country filtered); `listingAvailableAtTown({branches:[{location:{town:"Jozini"}}]}, "jozini")` → true. |
| 2 (GQL enrichment) | Dev server reload + curl check TIER 1 returns listing with `branches[0].location.town`, `.city`, `.province`, `.address` (all previously there; add `.area` if supported). |
| 3 (Resolver Option B) | Browse **alternate-branch URLs** to confirm HTTP 200. For GC29-FS, if branches = [Richards Bay HQ, Jozini, Empangeni], then: `curl -Lis http://localhost:3001/tombstones/gc29-fs-granite-pillars-tombstone-jozini` → HTTP 200 + body contains "gc29" 20+ times + no "Not Found \| TombstoneFinder". `curl -Lis .../gc29-fs-granite-pillars-tombstone-cape-town` → EITHER permanentRedirect to richards-bay (preferred) OR HTTP 404 (with canonical not-soft). Run 3 URLs per known multi-branch listing (GC29-FS, BBM1A, GCB3-OB). Confirm canonical `<link>` tag (if visible in body) always points to the primary-town URL, regardless of which branch URL was used. |
| 4 (homepage2026 GQL) | Reload homepage, Featured carousel entries should have same valid 5-segment URLs as before (no regressions). Confirm `branches[0].name`, `.location.area` (if field exists) come through. |
| Final sanity | Run `GetDiagnostics` → 0 TS/JS errors from new edits. Run existing curl-based acceptance from Test 1/2/3 again: GC29-FS primary URL HTTP 200, BBM1A HTTP 200, Manufacturer→GCB3-OB HTTP 200, Homepage cards all 5-segment canonical. 100% regression-free. |

---

## Risks

| Risk | Mitigation |
|---|---|
| GQL `branches.location.area` doesn't exist → error silently returned, queries become null | Run `__type(BranchLocation)` curl after edits; if `area` absent, strip `.area` from selection sets. |
| GQL `company.city/town` direct fields don't exist (confirmed likely scalar-string only) | DO NOT add them; rely on scalar `company.location` CSV parsing via slugs helpers. |
| `fetchGraphQL` silently returning `null` for enriched fragments is a debugging trap | Add console.log tier lines with fragment names (already has rich logging; keep). |
| Relaxed resolver gate in Step 3 could match wrong listing (prefix of GC29 matches GC29-FS but user typed GC29-XYZ) | Gate has 2 conditions: (name/material/style prefix match) AND (town match against branches). If the town segment is non-empty AND doesn't match branches, Rule C rejects. Name prefix mismatch also rejects. Combined, risk is low. |
| Too many duplicate canonical alternate URLs causing crawl dilution | Set `<link rel=canonical>` to primary-town slug regardless of which branch URL served (Step 3.4). No redirect needed, canonical handles crawl budget. |
| Dev server caching old compiled versions after edits | Always reload browser + confirm TIER logs changed shape after Step 2 fragments (branches.length count visible in log if needed; add log once if not visible). |
