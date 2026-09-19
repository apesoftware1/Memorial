# TombstonesFinder — Store-Scoped Listing URLs (Solution 1) Implementation Plan

## Task 0: Extend GraphQL Query Fragments to Include company.slug (Data Prep)
- **Status**: `pending`
- **Priority**: high
- **Depends On**: None
- **Description**:
  - Every resolver/card query that returns listings used by `buildListingCanonicalHref(listing)` MUST include `company { documentId slug name location }` so the helper can build the `/tombstones/<companySlug>/<slug>` scoped path.
  - Verify & patch the following GQL queries if `company.slug` is missing:
    - `graphql/queries/getListings.ts` list-page SSR queries
    - `app/tombstones/[slug]/page.tsx` → `LISTING_RESULT_FRAGMENT` used in `fetchListingByCodePrefix` (currently used companyFilterFragment but returned result needs full company for scoped URLs)
    - `app/tombstones/[slug]/page.tsx` → `fetchListingsByIds` L849 (currently returns company w/ documentId, name, location, logoUrl fields but NO `slug`); ADD `slug` field.
    - `graphql/queries/2026Queries/homepage2026.ts` Featured/Premium carousel queries if company.slug missing.
    - `app/tombstones-for-sale/[slug]/page.js` → `fetchListingById` L24 — ensure returns `company.slug`.
    - `app/tombstones-on-special/[id]/page.js` → same if its fetchListingById cousin query is separate.
    - `app/listing/[slug]/page.jsx` → same pattern.
  - If any query returns a nested `listing.company` object WITHOUT slug, append to the GraphQL selection set (minimal one-line edits per query; no other structural changes).
  - Add a new helper `buildListingCompanySlug(listing): string | null` to `lib/slugs.js` so all callers read company.slug → company.documentId fallback consistently:
    ```ts
    export function buildListingCompanySlug(listing) {
      const s = String(listing?.company?.slug ?? "").trim();
      if (s) return normalizeManufacturerSlugSafe(s);
      const doc = String(listing?.company?.documentId ?? "").trim();
      return doc || null;
    }
    ```
    (Create normalizeManufacturerSlugSafe inline using existing normalize logic from manufacturer-seo-page L42-49.)
- **Acceptance Criteria Addressed**: AC-3, AC-7 (dependency for T1 link generator to not crash)
- **Test Requirements**:
  - `rule` TR-0.1: GetDiagnostics on `lib/slugs.js` + every modified GraphQL query file → 0 new errors.
  - `rule` TR-0.2: `buildListingCompanySlug(listing)` returns non-null normalized slug for 100% of listings objects returned by patched queries.
- **Notes**: This is a prerequisite for T1 because the URL generator helper cannot emit company scope if company.slug is absent on the listing objects the helper receives.

## Task 1: Rewrite Single Source-of-Truth `buildListingCanonicalHref` + Company-Scoped Helpers
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 0
- **Description**:
  - Extend `lib/slugs.js`:
    - Add `buildScopedListingSlug(listing)` → returns `{ companySlug: string|null, productSlug: string|null }`.
    - Modify `buildListingCanonicalHref(listing)` at L315:
      ```
      { companySlug, productSlug } = buildScopedListingSlug(listing)
      if (!companySlug || !productSlug) return null
      return `/tombstones/${companySlug}/${productSlug}`
      ```
    - Add a `buildScopedListingAbsoluteHref(listing, searchParams?)` helper that calls `withSearchParams` on the path, and a URL-safe scoped redirect helper that appends `?branch=` if present.
  - Keep existing functions `buildListingCanonicalSlug` / `buildListingCanonicalSegments` / `cleanListingSlug` / `normalizeListingSlug` / `extractUrlTownSegment` UNCHANGED (they only compute the product-slug portion, not the company prefix).
  - Update all callers of `buildListingCanonicalHref` that do string post-processing like `canonicalSlug = canonicalRoute.replace(/^\/tombstones\//, "")` to understand the new TWO-SEGMENT prefix `/tombstones/<companySlug>/<productSlug>` — especially `app/sitemap.js` L185.
- **Acceptance Criteria Addressed**: AC-1 (URL generation consistency), AC-3 (internal links), AC-4 (sitemap dedupe)
- **Test Requirements**:
  - `rule` TR-1.1: For a listing object with company.slug="maphinda" + canonical productSlug="gcb8-ob-childs-comfort-tombstone-richards-bay" → `buildListingCanonicalHref(listing)` returns exactly `/tombstones/maphinda/gcb8-ob-childs-comfort-tombstone-richards-bay`.
  - `rule` TR-1.2: For a listing object missing both company.slug AND company.documentId → `buildListingCanonicalHref(listing)` returns `null` (sentinel fallback, never empty or flat).
  - `rule` TR-1.3: Build exit 0 after changes (AC-7).
- **Notes**: This task makes 90% of link generators in the app emit scoped URLs "automatically" because they call `buildListingCanonicalHref` — verified in exploration call sites: StandardListings.jsx, FeaturedListings.js, product-showcase.jsx, ListingCardItem.jsx. No individual card Link edits required after this helper change; the tasks below fix only the BARE FALLBACK string literals that bypass the helper.

## Task 2: Create New Scoped Product Route `/tombstones/[companySlug]/[slug]/page.tsx`
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 1 (to emit redirect targets correctly), Task 0 (to read company.slug from resolver results)
- **Description**:
  - Create new file `app/tombstones/[companySlug]/[slug]/page.tsx` as a Server Component (async default export + async generateMetadata), modeled exactly after existing `app/tombstones/[slug]/page.tsx` but with the following key differences:
    - Route params destructured: `{ params: Promise<{ companySlug: string; slug: string }>, searchParams }` — Next.js 15 async await style.
    - **Step 0 (NEW, mandatory)**: Company existence check + canonical slug normalization.
      1. `fetchGraphQL` companies query: `companies(filters:{slug:{eqi:$companySlug}}, pagination:{page:1, pageSize:1}) { documentId slug name }`
      2. If result 0 rows → `notFound()` (immediately, no resolver work attempted, impossible cross-over by structure).
      3. If the returned canonical `company.slug` (case-insensitive match) differs from URL `companySlug` when normalized → `permanentRedirect(withSearchParams("/tombstones/<canonicalCompanySlug>/" + rawProductSlug, searchParams))`.
    - **Step 1**: Call `fetchListingByNormalizedSlug(rawSlug, canonicalCompanySlug)` passing the canonical company slug as `targetCompanySlug` — this propagates the company constraint through all 7 tiers (Tier 1 bySaved, Tier 2 bySavedOriginal, Tier 2b byCodePrefix, Tier 3 namePrefix, Tier 4 title, Tier 5 combined, Tier 6 fuzzy, Tier 7 last-resort prefix search).
    - **Step 2 (Belt & Braces Guard, NEW)**: After resolver resolves a listing, verify `normalizeLower(listing.company.slug) === normalizeLower(canonicalCompanySlug)` OR `listing.company.documentId === resolvedCompanyDocumentId`; if mismatch → `notFound()`, never redirect to another company's URL (this deliberately prevents any residual fuzzy crossover from defeating scoping).
    - **Step 3**: Compute canonical redirects EXACTLY as before (slug normalization mismatch → redirect to normalized; town mismatch redirect to normalized canonical town; redirectSlug path → redirect) — BUT every redirect target now uses the SCOPED path `/tombstones/<canonicalCompanySlug>/<targetSlug>` via the helpers from Task 1.
    - **Step 4**: Render body via `ProductShowcase` Client Component import exactly same as old route, with same props passed (listing, similar products fetched via fetchListingsByIds, etc).
    - **Step 5**: `generateMetadata` returns title/description/alternates.canonical — canonical URL is absolute URL of `/tombstones/<canonicalCompanySlug>/<canonicalProductSlug>`.
  - Keep the existing resolver function `fetchListingByNormalizedSlug` in old file; new route imports it from old route. If the resolver code currently lives in old `/tombstones/[slug]/page.tsx`, REFACTOR it into `lib/listings-resolver.ts` (new file) so both old redirector route and new scoped route can import it WITHOUT duplicate code. This single refactor prevents divergence and is allowed as part of T2.
  - Resolver helpers in refactored `lib/listings-resolver.ts`: confirm `fetchListingBySavedSlug`, `fetchListingByCodePrefix`, `fetchListingsByNamePrefix`, `fetchListingsByTitleNormalized`, `fetchListingsBySimplePrefixSearch` ALL:
    1. Have `companySlug?: string` in signature.
    2. When `companySlug` is provided, wrap filters in an AND-clause: `filters: { AND: [ { company: { slug: { eqi: $companySlug } } }, { or: $or } ] }`
    3. Add `$companySlug: String!` to the GraphQL variable definitions when used.
  - If any tier is missing the company filter, add it (e.g. `fetchListingBySavedSlug` may not yet have it — this is the most common source of residual crossovers after scoping).
- **Acceptance Criteria Addressed**: AC-1 (crossover zero — primary mechanism), AC-5 (branch sync via searchParams preservation), AC-6 (no count/pagination regressions since listing queries unchanged except narrower candidate set), AC-7 (build pass)
- **Test Requirements**:
  - `rule` TR-2.1: Visiting `/tombstones/maphinda/<shared-slug>` where shared-slug also exists in MTHOFI manufacturer resolver candidate set → final rendered page shows Maphinda company info (logo, breadcrumb company name), product matches Maphinda listing.
  - `rule` TR-2.2: Visiting `/tombstones/mthofi-group/<shared-slug>` → page shows MTHOFI GROUP info, different listing (or at least different company context) vs TR-2.1 result.
  - `rule` TR-2.3: Scoped route with non-existent companySlug (e.g. `/tombstones/does-not-exist/<any-slug>`) → `notFound()` 404 page rendered in < 500ms (no resolver attempt, no extra GQL work visible in server console logs).
  - `rule` TR-2.4: `?branch=<name>` preserved across all 4 types of scoped-route redirects (companySlug canonicalization, productSlug canonicalization, town canonicalization, resolver redirectSlug path) → final URL bar shows correct scoped path + branch query preserved.
  - `rule` TR-2.5: Build exit 0, GetDiagnostics 0 new errors on new file + refactored resolver file.
- **Notes**: This task is the heart of the fix. It enforces the scoping that eliminates cross-over forever. The refactor to `lib/listings-resolver.ts` is required because old redirector route (T3) needs the same resolver functions without duplicating 800 lines of code.

## Task 3: Rewrite Old Flat Route `/tombstones/[slug]/page.tsx` as Redirect-Only
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 2 (needs resolver + scoped URL helpers)
- **Description**:
  - Keep file at `app/tombstones/[slug]/page.tsx` for Next.js legacy URL backward compatibility.
  - DELETE the old `ProductShowcase` render body (old route never renders a product directly again).
  - New route behavior (Server Component only, redirect-only):
    1. Await params/searchParams (Next.js 15 style).
    2. Call refactored resolver `fetchListingByNormalizedSlug(rawSlug)` WITHOUT `targetCompanySlug` (legacy flat mode; no narrowing, exactly like old route to find best fit).
    3. **If no resolve**: `notFound()` exactly as before.
    4. **If resolved**:
       - Compute `canonicalCompanySlug = buildListingCompanySlug(listing)` (from T0).
       - Compute `canonicalProductSlug = buildListingCanonicalSlug(listing) || cleanListingSlug(listing.slug, listing.title)`.
       - If resolver returned a listing with `__redirectSlug`, use `__redirectSlug` as productSlug instead.
       - Compute target path = `/tombstones/${canonicalCompanySlug}/${canonicalProductSlug}`.
       - **Crossover guard equivalent (NEW, preserves old ?company= semantics)**: If `searchParams.company` exists AND `normalizeLower(searchParams.company) !== normalizeLower(canonicalCompanySlug)` → `notFound()` — DO NOT redirect to another company.
       - Else: `permanentRedirect(withSearchParams(targetPath, searchParams))` (preserves `?branch=`).
    5. In `generateMetadata`:
       - If redirect target known → return `alternates: { canonical: toAbsoluteUrl(targetScopedPath) }`.
       - Else: standard NotFound metadata.
  - The old crossover guard code block at L1216–L1222 is REPLACED by the `?company` check in step 4 (equivalent safety for legacy ?company= links).
- **Acceptance Criteria Addressed**: AC-2 (legacy flat URL → scoped 308), AC-5 (?branch= preserved), AC-4 (canonical tags point to scoped)
- **Test Requirements**:
  - `rule` TR-3.1: Visiting legacy flat `/tombstones/<product-slug>` for a listing belonging to MTHOFI GROUP → status 308, Location header equals `/tombstones/mthofi-group/<canonicalProductSlug>`.
  - `rule` TR-3.2: Same but listing belongs to Maphinda → Location starts with `/tombstones/maphinda/`.
  - `rule` TR-3.3: Legacy flat URL + `?company=wrong-company` (e.g. actual listing is MTHOFI but URL says `?company=maphinda`) → `notFound()` (404).
  - `rule` TR-3.4: Legacy flat URL + `?branch=Durban` preserved in final Location header of redirect.
  - `rule` TR-3.5: Build exit 0, GetDiagnostics clean.
- **Notes**: This route is a permanent "upgrade" redirector for the next ~1 year as Google re-indexes. It will never show a product page again, but never breaks old links.

## Task 4: Fix Entry-Route Redirects (for-sale / on-special / listing)
- **Status**: `pending`
- **Priority**: high
- **Depends On**: Task 1 (scoped href helper), Task 0 (company.slug in listing fetch result)
- **Description**:
  - Three entry routes exist that all currently redirect to flat `/tombstones/<slug>`. Change each to redirect to SCOPED `/tombstones/<companySlug>/<canonicalProductSlug>`:
    1. `app/tombstones-for-sale/[slug]/page.js`: L276/L336/L339 — `fetchListingById` → compute companySlug + canonicalProductSlug via helpers T0/T1 → `permanentRedirect(scoped path)` + preserve searchParams. Also update metadata canonical to scoped path.
    2. `app/tombstones-on-special/[id]/page.js`: Exactly same treatment if its shape matches (read file, find equivalent `permanentRedirect` calls).
    3. `app/listing/[slug]/page.jsx`: L295/L296/L305/L338/L342 — identical refactor to compute scoped target, redirect with searchParams preserved, canonical absolute URL points to scoped URL.
  - If any of these routes currently have a fallthrough path that renders `ProductShowcase` directly without redirect (e.g. cleanSlug is identical so no redirect needed) → keep render but change the `canonical` metadata to scoped URL absolute.
  - Ensure no bare literal `/tombstones/${cleanSlug}` or `/tombstones-for-sale/${documentId}` string remains as a redirect/canonical target — use helpers.
- **Acceptance Criteria Addressed**: AC-2 (308 chains terminate in scoped), AC-4 (canonicals consistent), AC-5 (branch preserved)
- **Test Requirements**:
  - `rule` TR-4.1: `/tombstones-for-sale/<existing-listing-documentId>` → 308 chain terminates at 200 scoped URL `/tombstones/<companySlug>/<canonicalProductSlug>`.
  - `rule` TR-4.2: `/tombstones-on-special/<id>` → same scoped URL target shape.
  - `rule` TR-4.3: `/listing/<legacy-slug>` → same scoped URL target shape.
  - `rule` TR-4.4: All three entry routes preserve `?branch=` query in final 200 URL bar.
  - `rule` TR-4.5: Build exit 0, GetDiagnostics clean.
- **Notes**: Small surface area, mostly 1-2 line string-to-helper substitutions per file.

## Task 5: Fix Remaining Bare Fallback String Literals That Bypass buildListingCanonicalHref
- **Status**: `pending`
- **Priority**: medium
- **Depends On**: Task 1 (scoped helper exists, so callers can use it)
- **Description**:
  - Based on exploration, these files contain explicit string templates that bypass the helper. Rewrite each to prefer scoped helper first, fall back to entry-route pattern only when scoped impossible:
    1. `components/premium-listing-card.tsx` L104: `baseProductUrl = href || /tombstones-for-sale/${listing.documentId}` → change order to:
       ```ts
       const baseProductUrl = href
         || buildListingCanonicalHref(listing)
         || `/tombstones-for-sale/${listing.documentId}`;
       ```
       (prioritize scoped helper over legacy fallback).
    2. `components/StandardListings.jsx` L12: same precedence pattern as premium-listing-card.
    3. `components/product-showcase.jsx` L159/L179 (prev/next navigation): confirm they already use `buildListingCanonicalHref`; if any uses fallback literal `/tombstones-for-sale/<id>`, reorder same as (1).
    4. `components/product-showcase.jsx` L1079 (related products in "you may also like" section): same priority ordering.
  - Do a broad grep `grep -rn '`/tombstones/'` + `grep -rn '"/tombstones/'` across `Memorial/components` to catch any other remaining literal that produces a flat URL; replace each with helper-first ordering.
  - Do NOT touch the explicitly allowed province/city location-landing `/tombstones/${p.slug}` strings in `app/sitemap.js` (they are aggregate SEO, not individual listing renderers).
- **Acceptance Criteria Addressed**: AC-3 (100% of internal listing links emit scoped URLs when company info present)
- **Test Requirements**:
  - `rule` TR-5.1: In a browser snapshot of the homepage, hover over 10 Featured/Premium/Standard listing cards → every href starts with `/tombstones/<companySlug>/`.
  - `rule` TR-5.2: In favorites page, manufacturer profile grid pages, for-sale list — sample 5 cards each → 100% hrefs are scoped `/tombstones/<companySlug>/`.
  - `rule` TR-5.3: Product-showcase prev/next button click → `window.location.href` after navigation starts with `/tombstones/<companySlug>/`.
  - `rule` TR-5.4: Build exit 0, GetDiagnostics clean.
- **Notes**: Low risk because T1 already changes all helper callers; this task only fixes the 2-5 code paths that skip the helper entirely and write a raw string template.

## Task 6: Sitemap & Metadata Canonical Tag Updates
- **Status**: `pending`
- **Priority**: medium
- **Depends On**: Task 1 (changed helper)
- **Description**:
  - `app/sitemap.js` updates:
    1. L185 dedupe key: OLD = `canonicalSlug = canonicalRoute.replace(/^\/tombstones\//, "")` (single-segment legacy split). Since canonicalRoute after T1 is `/tombstones/<companySlug>/<productSlug>`, change the `seenSlugs` Map key to use `canonicalRoute` (the FULL path) as the key. This way Maphinda/mfg09 and MTHOFI/mfg09 both appear correctly in sitemap (2 separate entries for distinct scoped URLs).
    2. L176-L190: verify that after T1, `buildListingCanonicalHref(l)` returns scoped paths for every listing object passed in — we wrote the helper to depend on `company.slug`/`company.documentId` existing on each listing object; `fetchAllListings` query in sitemap generator must include `company { documentId slug name }` in returned listing shape (if missing, add via T0).
    3. Province/city location landing `/tombstones/${p.slug}` URLs (L370/L378) — leave these alone; NOT listing URLs. Add comment labeling them as SEO landing aggregate URLs to prevent accidental scoping.
  - Search all files for every `alternates: { canonical: toAbsoluteUrl(...) }` that points to `/tombstones/<...>` and ensure each one uses scoped path:
    - `app/tombstones-for-sale/[slug]/page.js` (covered in T4).
    - `app/listing/[slug]/page.jsx` (covered in T4).
    - Old `/tombstones/[slug]/page.tsx` generateMetadata (covered in T3).
    - New `/tombstones/[companySlug]/[slug]/page.tsx` generateMetadata (covered in T2).
  - Search for JSON-LD Product `url` field: verify that product-showcase.jsx (if it emits Product schema) OR `app/tombstones/.../page.tsx` jsonLd variables now use scoped absolute URL as `@id` and `url`.
- **Acceptance Criteria Addressed**: AC-4 (sitemap + canonical consistency)
- **Test Requirements**:
  - `rule` TR-6.1: Download `/sitemap.xml` locally, grep -c "<loc>/tombstones/<companySlug>/" → count equals total known listings (sum counts: 76+134+112+93+39+2 = 456), matches manufacturers index total count page exactly.
  - `rule` TR-6.2: Sample 5 listings from Maphinda manufacturer → corresponding sitemap entries contain `/tombstones/maphinda/` in `<loc>`.
  - `rule` TR-6.3: View-source of scoped product page → `<link rel="canonical">` href matches browser URL exactly (both company + product segments scoped).
  - `rule` TR-6.4: View-source scoped page JSON-LD Product → `url` field equals canonical href (verified by view-source grep).
  - `rule` TR-6.5: Build exit 0.
- **Notes**: Sitemap dedupe key fix is CRITICAL. If we miss this, sitemap only has one MFG09 entry (Maphinda's) and MTHOFI's MFG09 is dropped from sitemap index coverage.

## Task 7: Final Validation, Crossover Stress Testing & Build Verification
- **Status**: `pending`
- **Priority**: high
- **Depends On**: T0–T6 completed
- **Description**:
  - Build `npm run build` → exit 0.
  - GetDiagnostics on all modified files → 0 new `error` severity entries (unused warnings OK).
  - Runtime verification plan:
    - Start dev server.
    - Stress test crossover zero (AC-1):
      1. `/tombstones/maphinda/gcb8-ob-childs-comfort-tombstone-richards-bay` → 200 Maphinda.
      2. `/tombstones/mthofi-group/gcb8-ob-childs-comfort-tombstone-richards-bay` → 200 MTHOFI GROUP.
      3. Save documentId of result 1 and 2 → must differ.
      4. Swap company scope (use Maphinda documentId slug under MTHOFI URL) → `notFound()` 404 not 307 cross-over.
    - Stress test legacy redirects (AC-2): find an old shared MFG09 flat slug that currently resolves to MTHOFI on tiebreak → verify it 308s to `mthofi-group/<scoped>` (correct because that was the actual listing it used).
    - Stress test branch preservation (AC-5): click a listing from `/manufacturers/maphinda?branch=Durban` → final URL contains `?branch=Durban` AND `/tombstones/maphinda/`.
    - Stress test count + pagination (AC-6): visit `/manufacturers/granite-components` → header shows 112, pagination bar shows pages. Click 1 card in grid → navigates to scoped GC listing.
    - Stress test sitemap + canonicals (AC-4): view 5 scoped pages source, download sitemap.
  - Fix any 1-2 line regressions found (likely minor string literal missed in T5 or a canonical mismatch).
- **Acceptance Criteria Addressed**: All ACs end-to-end verification: AC-1, AC-2, AC-3, AC-4, AC-5, AC-6, AC-7
- **Test Requirements**:
  - `rule` TR-7.1: Crossover zero tests pass (all 4 scenarios above).
  - `rule` TR-7.2: Legacy redirects test → 308 + scoped URL.
  - `rule` TR-7.3: Branch preserved in 2 sample clicks (Maphinda + MTHOFI) from profile page with ?branch= set.
  - `rule` TR-7.4: Manufacturers index GC card count still 112, profile pagination still 112 (no count regression).
  - `rule` TR-7.5: Owner dashboard GC still shows correct count (no count regressions visible to logged-in owner).
  - `rule` TR-7.6: Build exit 0, no new TS errors.
  - `rubric` TR-7.7: Resolver correctness within single company scope AC-8.
    - Dimension: within-company fuzzy resolution accuracy
    - Scale: 1–5 (per AC-8)
    - Pass Threshold: >= 4
    - Evidence: For Maphinda scope, (a) exact canonical slug 200; (b) swapped town segment redirects 308 to canonical; (c) jumbled-title tokens either 200 or redirect to canonical. Score:
      5 = all three scenarios work as expected
      4 = jumbled tokens 404 but exact+townswap work
      3 = exact only
      2 = multiple fails
      1 = resolver breaks entirely under scope
- **Notes**: Pure verification. Should surface the final 0-2 missed string literal paths that T5 didn't catch. No new features here.
