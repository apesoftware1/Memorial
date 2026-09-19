# TombstonesFinder — Store-Scoped Listing URLs (Solution 1) Product Requirements Document

## Overview
- **Summary**: Replace the flat listing URL structure `/tombstones/[slug]` with a manufacturer-scoped structure `/tombstones/[companySlug]/[slug]`, make every internal `Link href` generator write the scoped URL, and make every resolver enforce `company.slug eqi $companySlug` as a mandatory PRIMARY filter before any fuzzy/slug lookups. Add backward-compatibility permanentRedirect routes so that every legacy flat URL (plus legacy `/tombstones-for-sale/[id]` and `/tombstones-on-special/[id]` entry routes) resolves to the correct canonical scoped URL, eliminating cross-manufacturer collisions deterministically.
- **Purpose**: Eliminate permanent cross-manufacturer listing collisions for shared model codes like MFG09/GCB8-OB/GCB6-OB, where two manufacturers re-use identical `mfgCode`/slug/title text fragments, the current flat resolver returns the first tie-break row (always the newest-updated row, MTHOFI GROUP over Maphinda, or vice-versa) even though every listing has a globally unique `documentId` (which is never used as the primary key in a flat slug URL). Scoping by `companySlug` deterministically narrows the fuzzy candidate set by 100% to one manufacturer *before* applying any OR-filtered fuzzy tier matching.
- **Target Users**:
  1. End users: find shared model codes under the correct manufacturer (MFG09 / GCB8-OB child's comfort — Maphinda user lands on Maphinda listing, MTHOFI user lands on MTHOFI listing, never a cross-over).
  2. SEO crawlers: `/tombstones/<company>/<code-title-town>` clearly scoped per manufacturer, one unique canonical URL per actual listing, no duplicate-content or wrong-company issues.
  3. Admin/editor (owner profile page): links generated from the manufacturers index, favorites, editor listings, public profile page, and for-sale/special pages all now include the correct manufacturer scope.

## Goals
1. **Zero cross-over between manufacturers for any shared code (mfgCode, title tokens, product segment slugs).** If a user navigates `/tombstones/maphinda/<mfgCode-slug>`, the resolved listing *must* belong to Maphinda, never MTHOFI; and vice versa for `/tombstones/mthofi-group/<same-code>`.
2. **Backward compatibility for legacy flat URLs, legacy for-sale URLs, and legacy on-special URLs.** All previously-crawled / bookmarked / shared flat listing URLs must 308 `permanentRedirect` to the new scoped canonical, without breaking search engine index coverage.
3. **Every internal link generator consistently writes `/tombstones/<companySlug>/<productSlug>`.** No component, card, or modal is allowed to continue writing flat URLs.
4. **SEO canonical tags, sitemap, alternates, and metadata all match the new scoped structure exactly.**
5. **Existing branch-query sync (`?branch=`), town-segment in slug, manufacturer crossover guard (?company=), favorites, pagination, and owner editor count fixes remain functional.** No regressions to any prior fixed feature in this repository.

## Non-Goals
1. Do NOT implement Solution 2 (documentId-suffixed slugs like `/tombstones/childs-comfort-65a7c8f9e1b2d3a4c5f6e7b8`). This PR scopes exclusively to Solution 1 per user request.
2. Do NOT change the manufacturer profile URL structure (`/manufacturers/[slug]` remains unchanged).
3. Do NOT change the branch URL mechanism (`?branch=<branchName>` querystring sync across listing clicks remains exactly as-is).
4. Do NOT modify or "clean up" legacy listing slugs in the Strapi database / CMS via this PR (slug normalization remains as implemented in `lib/slugs.js`).
5. Do NOT change the listing "owner count" / pagination fixes completed in the prior session — they must remain working after this URL restructure.
6. Do NOT remove the existing 7-tier fuzzy fallback resolver tier chain *inside* a scoped company context. It remains valid for resolving alternate town variants / mis-ordered title segments *within* a single manufacturer candidate set only, after the mandatory company-slug primary filter has already eliminated cross-over.

## Background & Context
Verified facts driving this spec:
- Two manufacturers in Strapi (Maphinda 76 listings, MTHOFI GROUP 134 listings, Granite Components 112 listings) independently created listings with identical `mfgCode` values (shared generic SKU/model codes like `GCB8-OB` = "8-tomb grey-dark child's comfort").
- Current flat `/tombstones/[slug]` resolver (L537–L596 in `app/tombstones/[slug]/page.tsx`) builds 14+ OR-filters against non-unique text fields (`mfgCode: eqi, slug: containsi, title: containsi, slug: startsWith, slug: eq, documentId eq headToken`), then sorts returned rows `updatedAt:desc` and returns the FIRST match in iteration order — so MTHOFI GROUP's newest-modified row for GCB8-OB always wins, even when the user is browsing from the Maphinda profile page.
- The existing cross-over guard at `page.tsx` L1218 only fires if the incoming URL carries `?company=<slug>` querystring context (added for listing-card clicks inside a manufacturer profile). Direct entry, global search, favorites, old bookmarks, and Google-indexed URLs don't carry that context, so the guard is no-op for the majority of crossover-prone traffic.
- `documentId` is globally unique per listing, but the resolver cannot select by `documentId` in the primary path because the SEO URL contains only human-readable text — not a 24-char hex id. The fix is to select by `company.slug eq X` (unique per manufacturer, enforced via `/manufacturers/<slug>` routing) + then apply the existing fuzzy chain within that narrowed candidate set.
- Prior session verified manufacturers index card counts: GRANITE COMPONENTS → 112, USIZO → 93, MTHOFI GROUP → 134, MAPHINDA → 76, with public profile pagination showing "1 - 20 of 134 Active Listings" correctly; these values must not regress.
- Prior session verified Apollo persistent cache version `2026-09-16-1`; only bump if required by query schema change in resolvers.
- Canonical URL helper `buildListingCanonicalHref(listing)` in `lib/slugs.js` L315 currently writes flat `/tombstones/<slug>`; it is the single callable used by card generators (StandardListings.jsx L11, FeaturedListings.js, PremiumListings.jsx, product-showcase.jsx L159/L179/L1079, ListingCardItem.jsx, ManufacturerCard, RelatedProducts). Changing this one helper + fixing bare `/tombstones-for-sale/<id>` fallback patterns will harmonize the majority of link generators.

## Functional Requirements
### FR-1: New Scoped Product Route
Create a new Next.js nested dynamic route handler at `/tombstones/[companySlug]/[slug]/page.tsx`.
- Route params: `{ params: Promise<{ companySlug: string; slug: string }>, searchParams: Promise<Record<string, string|string[]|undefined>> }` (Next.js 15 async-params style, matches existing page.tsx signature style).
- Mandatory primary filter: first resolve `companyDocumentId` and `company` object via exact `companies(filters:{slug:{eqi:$companySlug}}, pagination:{page:1 pageSize:1})` — if zero rows, call `notFound()` immediately.
- If company is found but the company.slug canonical normalization differs from URL `companySlug` (e.g. uppercase, underscore), 308 `permanentRedirect` to the canonical company slug + same listing slug.
- Call the existing listing resolver chain but WITH the mandatory `targetCompanySlug` argument passed as the non-empty company-slug value — so every GraphQL query in the resolver includes the company filter fragment (`company: { slug: { eqi: $companySlug } }` in filter AND `$companySlug: String!` variable) which is already implemented in Tier 2b `fetchListingByCodePrefix` L578 and propagates through all other tier functions that accept a `companySlug` optional parameter.
- After resolution, if the resolver returns a listing whose `listing.company.slug !== companySlug` even after scoping, call `notFound()` (belt-and-braces guard, redundant but eliminates any residual bug in filter-application).
- Generate metadata (`generateMetadata`) with canonical `toAbsoluteUrl("/tombstones/<canonicalCompanySlug>/<canonicalListingSlug>")`.
- Render body via the same existing `ProductShowcase` component used by `/tombstones/[slug]` (full backward compat for all product-showcase internal modals; no change to ProductShowcase itself required).

### FR-2: All Resolver Tiers Accept & Apply Mandatory Company-Slug Constraint
- `fetchListingByNormalizedSlug(rawSlug, targetCompanySlug)` L654: when `targetCompanySlug` is provided, pass it to EVERY inner function: `fetchListingBySavedSlug(normalized, targetCompanySlug)`, `fetchListingBySavedSlug(rawSlug, targetCompanySlug)`, `fetchListingByCodePrefix(rawSlug, normalized, targetCompanySlug)`, `fetchListingsByNamePrefix(..., targetCompanySlug)`, `fetchListingsByTitleNormalized(normalized, targetCompanySlug)`, `fetchListingsBySimplePrefixSearch(fallbackPrefixes, targetCompanySlug)`. All already accept a `companySlug` parameter.
- For any tier helper that does NOT yet propagate `companySlug` into the GraphQL variables/filters (verify and fix if any gaps), ensure the GraphQL filter shape becomes `filters: { AND: [ { company: { slug: { eqi: $companySlug } } }, { or: $or } ] }` — cross-manufacturer rows are 100% excluded *before* any fuzzy text-OR evaluation occurs, so the result size for Tier 2b is at most one manufacturer's listings (Maphinda 76, MTHOFI 134), eliminating the tiebreak.
- Tier 2b `fetchListingByCodePrefix` L578 already has `companyFilterFragment` string — confirm it uses `eqi` (case-insensitive) and passes variable correctly; if any mismatch in the GraphQL query template literal, fix exactly once.
- If `targetCompanySlug` is provided and the resolver resolves a listing successfully, the returned object MUST carry `listing.company.slug === targetCompanySlug`; if a listing from outside company is returned anywhere, call `notFound()` rather than redirecting to another company's scoped URL (prevents accidental cross-silo navigation that defeats the point of scoping).

### FR-3: Flat Legacy URL → Scoped Canonical Permanent Redirect
- Keep existing `/tombstones/[slug]/page.tsx` but REPLACE its resolver + render body behavior so that:
  1. It calls the legacy flat resolver WITHOUT companySlug constraint to identify the single best-fit listing (the same behavior as before for backward compat only).
  2. If it finds zero rows → `notFound()` exactly as before.
  3. If it finds ONE row → extract `listing.company.slug` canonical + `canonicalListingSlug = buildListingCanonicalSlug(listing) || cleanListingSlug(listing.slug, listing.title)` → 308 `permanentRedirect(withSearchParams("/tombstones/<canonicalCompanySlug>/<canonicalListingSlug>", searchParams))` (preserves `?branch=` exactly).
  4. If flat resolver returns multiple ambiguous candidate rows from different manufacturers (tie without scoping) — break the tie by picking the one whose `company.slug + "-" + canonicalListingSlug` URL when scoped has the most URL-token overlap with incoming flat slug; THEN redirect as in (3). This path is hit only for old legacy flat-indexed URLs, not for new internal navigation (FR-4).
  5. Delete the old `ProductShowcase` render body from `/tombstones/[slug]/page.tsx` — this route becomes redirect-only, never rendering a product page directly. Keep `generateMetadata` returning redirect metatags with canonical when redirectSlug exists.

### FR-4: All Link Generators Write Scoped URLs Consistently
Single source of truth: modify `buildListingCanonicalHref(listing)` in `lib/slugs.js` L315-L319 to return `/tombstones/<companySlug>/<listingSlug>` where `companySlug = listing.company?.slug || listing.company?.documentId` (fallback to documentId if company.slug missing on Strapi row), and `listingSlug = buildListingCanonicalSlug(listing)`.
- If company.slug AND company.documentId are both missing on the listing object → return `null` (so callers fall back exactly as before).
- All callers of `buildListingCanonicalHref` (StandardListings.jsx, FeaturedListings.js, PremiumListings.jsx, product-showcase.jsx, ListingCardItem.jsx, related-products components, sitemap) now automatically emit scoped URLs with zero code change in each caller because they call this helper.
- Additionally fix ALL BARE FALLBACK patterns that bypass `buildListingCanonicalHref` and directly write flat `/tombstones-for-sale/<documentId>` or `/tombstones/<slug>` as fallback strings:
  - `components/premium-listing-card.tsx` L104 `baseProductUrl = href || /tombstones-for-sale/${listing.documentId}` → change to `buildListingCanonicalHref(listing)` first, then fallback to `/tombstones-for-sale/<documentId>` (already present, just needs ordering verification).
  - `components/product-showcase.jsx` L159/L179/L1079 prev/next navigation patterns → confirm they already use `buildListingCanonicalHref` per L159/L179 search matches.
  - `components/StandardListings.jsx` L12 fallback `/tombstones-for-sale/${listing.documentId}` → change to scoped URL pattern when company info is present, only drop to /tombstones-for-sale if truly no company context available.
  - `app/tombstones-for-sale/[slug]/page.js` L276/L336: entry redirect currently writes `/tombstones/${cleanSlug}` (flat) — must resolve `listing.company.slug` first and write `/tombstones/<companySlug>/${cleanSlug}` (scoped).
  - `app/tombstones-on-special/[id]/page.js` (if it has the same pattern): same fix as tombstones-for-sale above.
  - `app/listing/[slug]/page.jsx` L295/L296/L305/L338/L342: redirect to `/tombstones/<slug>` (flat) — change to resolve company and emit scoped redirect.
  - `app/tombstones/[slug]/page.tsx` itself L992/L995/L1066/L1078/L1087/L1152/L1167/L1225/L1252 flat URL permanentRedirect call sites → change to emit scoped URLs via new helper (this route will be redirect-only per FR-3 so these literals will be replaced with scoped redirect target computation).
- Preserve `?branch=<branchName>` querystring exactly as current — use existing `withSearchParams` / append branch the same way current code does it on PremiumListingCard L104 area.

### FR-5: Canonical URL & Metadata Consistency
- Every route (new scoped, old flat redirector, old entry routes tombstones-for-sale, tombstones-on-special, listing/[slug]) when rendering metadata:
  - `alternates.canonical` → absolute URL of the scoped `/tombstones/<canonicalCompanySlug>/<canonicalListingSlug>`.
  - `title`, `description`, `robots` tags → computed from resolved listing, same formulas as before with just the new scoped canonical path.
- Structured data (`ProductStructuredData` breadcrumbs in product-showcase, JSON-LD product schema on page) must include the scoped URL as `@id` / `url` field value.

### FR-6: Sitemap Updates
- `app/sitemap.js` L176-L190: currently writes entries from `buildListingCanonicalHref(l)` which after FR-4 returns scoped `/tombstones/<company>/<slug>` path — so no code change required for this helper path; but verify explicitly that the dedupe Map `seenSlugs` key uses the FULL scoped route path, not just the legacy flat suffix `canonicalSlug = canonicalRoute.replace(/^\/tombstones\//, "")` — if still splitting only flat suffix, fix to use the full scoped route as unique dedupe key (otherwise two companies' same canonical product slugs after dedupe would incorrectly drop one entry).
- Province/city SEO pages: L370/L378 `route = /tombstones/${p.slug}` — these are NOT listing routes, they are location-landing URLs. Leave these URLs as flat (they don't resolve individual listings; they resolve via `fetchLocationSeoPage` which returns a landing page). The scoped structure applies ONLY to individual listing URLs, not location aggregate landing URLs.

### FR-7: Favorites, Crossover Guard, Pagination Remain Working
- Existing favorites listing cards when clicked → must navigate to scoped URLs via `buildListingCanonicalHref` (FR-4 already guarantees this, no favorites code change needed).
- Existing crossover guard `?company=` L1218 in `tombstones/[slug]/page.tsx`: this will become dead code because the route is redirect-only (FR-3); replace guard behavior with equivalent logic: if flat resolver resolves a listing but `?company=<target>` querystring is present AND `listing.company.slug !== target` → call `notFound()` before redirecting (prevents an attacker from forcing crossover via crafted legacy URL).
- Public manufacturer profile pagination (already fixed to 134 MTHOFI / 112 GC / 76 Maphinda) remains unchanged; listing card hrefs in profile page pagination are already scoped by virtue of FR-4 helper change.
- Owner dashboard editor count fixes applied in prior session (LISTING_COUNT_SCOPED_QUERY wired in manufacturers-Profile-Page/page.js L78-L95 with underscore `listings_connection.pageInfo.total` response path) remain unaffected because product URL structure change does not touch listing count queries.

### FR-8: Entry-Route Permanent Redirects
- `/tombstones-for-sale/[slug]/page.js`: originally entry route that resolves listing via fast ID lookup then `permanentRedirect` to flat `/tombstones/<slug>`. After this spec, it must resolve the listing, compute companySlug + canonicalListingSlug, `permanentRedirect` to `/tombstones/<companySlug>/<canonicalListingSlug>` (scoped).
- `/tombstones-on-special/[id]/page.js`: identical treatment.
- `/listing/[slug]/page.jsx`: identical treatment (redirect to scoped canonical, with `?branch=` preserved).

## Non-Functional Requirements
### NFR-1: Zero Performance Regression on Resolver
Mandatory company-slug filter before OR-based fuzzy text filters should REDUCE resolver latency (fewer candidates returned by Strapi, smaller sort/iter sets). The new scoped `/tombstones/<company>/<slug>` resolver response time at p95 must be <= legacy flat `/tombstones/<slug>` resolver response time.
Evidence source: Next.js server component `[Resolved ...]` timestamps in dev server logs for equivalent query depth.

### NFR-2: No Breaking TypeScript Compile Errors
Strict TS compile via `npm run build` (which runs lint + compile) must exit with code 0 exactly as before (build succeeded pre-change; must remain pass post-change). Unused import hints are allowed; errors (red) are not.
Evidence source: GetDiagnostics on changed files + build exit 0.

### NFR-3: SEO / Crawl Safety
- All 4 legacy routes emit `permanentRedirect` (HTTP 308), never 307, and never silently render duplicate content via 200 OK.
- Metadata `alternates.canonical` on EVERY route that renders a product page OR emits a redirect metadata header points to the scoped URL (never flat).
- `/sitemap.xml` emits scoped URLs only (no remaining flat listing URL entries pointing to old flat `/tombstones/<code-slug>` paths without company scope).
Evidence source: curl `HEAD` legacy URL → 308 with Location header pointing to scoped path; inspect sitemap via `http://localhost:3001/sitemap.xml` in browser.

### NFR-4: Developer & Admin Ergonomics
- Only ONE function writes canonical listing hrefs (the helper `buildListingCanonicalHref`) — no copy-paste URL template literals scattered across 15+ call sites after this change (the helper becomes the single source of truth; fallbacks to string literal are only for no-company-info data-shape edge cases and must be clearly commented).
- Query filter shape for company-slug scoping remains consistent across all tier resolver helpers (the same `$companySlug: String!` + `company: { slug: { eqi: $companySlug } }` fragment, or AND-wrapped with OR, applied identically across all 7 tiers).

## Constraints
- **Technical**: Next.js 15.5.12 mixed server/client components; new route MUST be a Server Component matching existing `/tombstones/[slug]/page.tsx` style (async `generateMetadata` + async `default` export, uses `fetchGraphQL` from `lib/serverGraphql`, `permanentRedirect/notFound` from `next/navigation`, `ProductShowcase` as Client Component body). No client-side-only resolver code.
- **Technical**: GraphQL prod endpoint: `https://api.tombstonesfinder.co.za/graphql` (Strapi 5). Only `*_connection` queries return true unclamped totals; `limit:-1` silently falls to server default 50, NEVER mix offset (`limit/start`) + page (`page/pageSize`) per Strapi pagination rules (ACTIVE rule from prior sessions). All queries within scoped resolver use pure page-mode pagination (`page/pageSize` only).
- **Business**: Old URLs indexed by Google MUST not 404 — they must 308 to the new scoped canonical with `?branch=` preserved. No loss of organic search traffic.
- **Business**: Existing active `?branch=<name>` user flow (select branch → click card → destination page shows same branch context) must continue exactly as-is without user-visible change.
- **Dependencies**: `buildListingCanonicalHref` / `buildListingCanonicalSlug` / `cleanListingSlug` / `normalizeListingSlug` helpers live in `lib/slugs.js`; do NOT rewrite them or change their internal tokenization logic, just add the company-scope prefix wrapper.

## Assumptions
1. Every listing row returned by GraphQL queries that `buildListingCanonicalHref(listing)` operates on WILL include `listing.company` shape with at least one of `slug` or `documentId`. This was verified in prior sessions for: FeaturedListings, StandardListings, product-showcase next/prev, related products queries, manufacturer profile page listing queries, listing-by-id queries, sitemap queries. If any query is missing `listing.company.slug` (e.g. `fetchListingsByIds` L849 in page.tsx was found to include `company { documentId name location logoUrl latitude longitude }` but NO `slug` field), add `slug` into that GQL fragment once so the helper has the needed scope data.
2. Manufacturer `company.slug` values in Strapi are globally unique (enforced implicitly by `/manufacturers/[slug]` routing, and verified on runtime manufacturers index page with 5 cards each with unique URL paths mthofi-group, granite-components, usizo-tombstones, maphinda, isisa).
3. Town segments embedded in the canonical product slug (e.g. "richards-bay", "jozini") remain valid in scoped URLs — full scoped path becomes `/tombstones/maphinda/gcb8-ob-childs-comfort-tombstone-richards-bay` and this is the canonical, matching public profile page navigation.
4. The existing `LISTING_RESULT_FRAGMENT` used in `fetchListingByCodePrefix` already includes company fields; if not, extend once with `company { documentId slug name location }` so Tier 2b resolved rows can build scoped URLs immediately.

## Open Questions
- [ ] None currently. User explicitly chose Solution 1, scoped URL structure, no further clarification required for scope.

## Acceptance Criteria

### AC-1: Zero Cross-Manufacturer Crossover for Shared SKU
- **Type**: `rule`
- **Given**: Two manufacturer rows exist in Strapi with matching `mfgCode` (e.g. MTHOFI GROUP has a listing with mfgCode="MFG09" and Maphinda has a DIFFERENT listing (unique documentId) with mfgCode="MFG09").
- **When**: a user navigates to `/tombstones/maphinda/mfg09-childs-comfort` (or any scoped URL variant that within Tier 2b resolves to the Maphinda row).
- **Then**: the resolver returns ONLY the Maphinda listing (company.slug="maphinda"), never the MTHOFI row; if the scoped company is MTHOFI GROUP (`/tombstones/mthofi-group/mfg09-...`) it returns ONLY the MTHOFI row; neither URL ever renders the other manufacturer's listing.
- **Pass Condition**: Resolver result `listing.company.documentId === expectedCompanyDocumentId` for both cases, verified via browser DOM snapshot (company logo, company name in ProductShowcase breadcrumb, and browser page source title match the scoped manufacturer name).
- **Evidence**: Browser snapshot of both scoped URLs (Maphinda MFG09 + MTHOFI MFG09) side-by-side showing distinct company names/logos + distinct listing documentIds (or at minimum distinct listing details); plus server console `[RESOLVER]` logs showing candidate set size narrowed to 1 manufacturer only (no MTHOFI rows in candidate set when Maphinda scope is active).

### AC-2: Legacy Flat URL → Scoped Canonical 308 PermanentRedirect
- **Type**: `rule`
- **Given**: An old indexed flat URL `/tombstones/<mfgCode-slug-town>` (no company scope) that previously resolved to e.g. MTHOFI GROUP listing via tiebreak.
- **When**: User or crawler visits the flat URL.
- **Then**: Server returns HTTP 308 status with `Location: /tombstones/<correctCompanySlug>/<canonicalScopedSlug>` (correct = matches the actual listing company), and all querystrings (branch, company if present) are preserved.
- **Pass Condition**: Network tab for flat URL GET shows status 308, Location header starts with `/tombstones/<companySlug>/`, redirect chain terminates in 200 with scoped page rendering matching `companySlug`.
- **Evidence**: `curl -I -L localhost:3001/tombstones/<flatSlug>` output showing 308 then 200 with correct final URL path.

### AC-3: All Internal Link Generators Emit Scoped URLs
- **Type**: `rule`
- **Given**: User visits ANY page with listing cards: homepage (Featured/Premium/Standard), manufacturers index cards (manufacturer listings grid), manufacturer profile page (pagination grid), for-sale list page, on-special list page, favorites page, product page related-products grid, product-showcase prev/next buttons.
- **When**: Hovering (or inspecting href) of any listing card Link element OR clicking prev/next navigation buttons that navigate to a listing.
- **Then**: the href attribute or window.location navigated-to starts with `/tombstones/<companySlug>/` (scoped); no remaining Link href anywhere in app points to flat `/tombstones/<slug>` or non-scoped fallback unless it is a legacy redirector entry route that is explicitly listed in FR-8 to emit scoped 308 redirect.
- **Pass Condition**: DOM snapshot of every listing card page (home Featured/Premium, profile page grid, favorites) — sample 5 card hrefs per page, and 100% are scoped `/tombstones/<company>/<slug>` format (preserving `?branch=`).
- **Evidence**: Browser snapshot HTML output with hrefs visible (or grep across compiled `.next/static/chunks/pages` for any remaining literal `/tombstones-for-sale/<` string outside explicitly-allowed redirector entry routes).

### AC-4: Sitemap + Canonical Metadata Consistency
- **Type**: `rule`
- **Given**: Fresh build + fresh dev server running.
- **When**: Visit `/sitemap.xml`, and visit 5 sampled scoped product pages + inspect view-source `<link rel="canonical">` + JSON-LD Product `url` field.
- **Then**: All sitemap listing entries are scoped `/tombstones/<company>/<slug>`, no legacy flat `/tombstones/<code-slug>` entries (except the explicitly preserved province/city location landing URLs, which resolve to landing pages not individual listings). Canonical on every rendered scoped product page matches the browser URL path exactly. JSON-LD Product `url` matches canonical URL.
- **Pass Condition**: Count of sitemap entries: sitemap list entries count equals `sum(company listing counts)` (Maphinda 76 + MTHOFI 134 + GC 112 + Usizo 93 + Isisa 39 + The Tombstones 2 = 456+), zero duplicate scoped entries.
- **Evidence**: (a) Sitemap raw XML downloaded via curl, grep for `<loc>`; (b) view-source of 5 scoped pages grep canonical href.

### AC-5: Branch Query Sync Preserved
- **Type**: `rule`
- **Given**: User is on `/manufacturers/maphinda?branch=Durban` (branch selected in dropdown at top).
- **When**: User clicks ANY listing card on that page.
- **Then**: The destination page URL is `/tombstones/maphinda/<canonicalSlug>?branch=Durban` — scoped company + canonical slug + original branch query preserved. Product-showcase renders branch context correctly (branch button shows Durban, prices reflect that branch's pricing if different).
- **Pass Condition**: Network tab click → destination URL includes scoped company prefix AND `?branch=Durban`; inspect ProductShowcase BranchButton component label matches the branch name.
- **Evidence**: Browser click snapshot → URL bar screenshot shows `?branch=Durban` preserved.

### AC-6: No Regressions in Count / Pagination / Owner Editor
- **Type**: `rule`
- **Given**: Logged in as Granite Components owner (user from screenshot in prior session) OR visit public `/manufacturers/granite-components` profile page.
- **When**: Load page, scroll down below listings grid, then click a listing card in the grid.
- **Then**: Profile header shows "1 - 20 of 112 Active Listings", pagination control bar (Prev/Next / per-page 10/20/50/100 / "Showing 1 - 20 of 112 listings") is visible BELOW listings grid, card click navigates to scoped `/tombstones/granite-components/<canonicalSlug>` 200 OK page with correct GC logo & name.
- **Pass Condition**: Counts match exact values verified in prior session (GC 112, Usizo 93, MTHOFI 134, Maphinda 76); no values revert to flat 50 cap.
- **Evidence**: Browser DOM snapshot of header counter + pagination bar below grid + scoped URL navigation result after card click.

### AC-7: Build Passes Cleanly
- **Type**: `rule`
- **Given**: Spec implementation code applied to changed files.
- **When**: `cd Memorial && npm run build` executed.
- **Then**: Process exits with code 0. No new TS errors introduced.
- **Pass Condition**: Exit code 0, and GetDiagnostics on each modified file report zero new `error` severity entries (pre-existing unused-symbol Hints may remain).
- **Evidence**: Build log tail exit code output + GetDiagnostics results for each of: `lib/slugs.js`, `app/tombstones/[companySlug]/[slug]/page.tsx` (new file), `app/tombstones/[slug]/page.tsx`, `app/sitemap.js`, `app/tombstones-for-sale/[slug]/page.js`, `app/tombstones-on-special/[id]/page.js`, `app/listing/[slug]/page.jsx`, `components/premium-listing-card.tsx`, `components/StandardListings.jsx`, `components/product-showcase.jsx`.

### AC-8: Fuzzy Resolver Within Single Company Still Works for Alternate Town Variants
- **Type**: `rubric`
- **Dimension**: Resolver correctness *within* a single manufacturer candidate set (after narrowing).
- **Scale**: 1-5
  - 1 = scoped resolver fails frequently, requires exact slug tokens.
  - 3 = scoped resolver works for exact canonical slugs only; mis-ordered title slug variants 404 within a company scope.
  - 5 = scoped resolver resolves alternate town URLs (e.g. `/tombstones/maphinda/gcb8-ob-<wrongTown>` redirects correctly to `/tombstones/maphinda/gcb8-ob-<canonicalTown>` via the existing wrong-town redirect paths) just as before; only the cross-manufacturer rows are eliminated.
- **Pass Threshold**: >= 4
- **Evidence**: Test 3 URLs within Maphinda scope: (a) exact canonical slug → 200, (b) swapped town segment → 308 redirect to canonical scoped, (c) title tokens jumbled order → resolves correct listing or redirects to canonical scoped.

## Open Questions
- [none remaining]
