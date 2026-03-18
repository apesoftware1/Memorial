# Updates: Technical Fixes, Security Patches & Improvements

Date: March 18, 2026
Project: TombstoneFinder

## Executive Summary
This document outlines recent technical interventions aimed at stabilizing the application, resolving critical build/deployment failures on Vercel, patching security vulnerabilities, and enhancing the user interface. All identified issues have been resolved, and the application is now stable for both development and production.

## Key Achievements

### 0. Performance & SEO: First Listings Rendered in Initial HTML (New)
*   **Issue:** The homepage and the "Tombstones for Sale" page showed a "Loading listings..." gate on first load because listings were fetched only after client-side JavaScript loaded.
*   **Resolution:** Implemented a Pattern A approach:
    *   Server-rendered a small initial set of listings and categories into the HTML for the homepage (`/`) and `/tombstones-for-sale`.
    *   Preserved existing client-side progressive queries for background hydration after mount.
*   **Impact:** Faster first paint, better perceived performance, and improved crawlability (initial HTML contains real listings content).

### 0.1 UI: Horizontal Side-Scrolling Removed (New)
*   **Issue:** The site could scroll horizontally due to layout overflow.
*   **Resolution:** Removed the overflowing layout pattern in FAQ sections and added a safe global guard against horizontal overflow.
*   **Impact:** No more "scrolling to the sides" across affected pages and viewports.

### 1. Frontend Security & Bot Protection (New)
*   **Issue:** The frontend was vulnerable to automated scraping, DDoS attacks via rendering exhaustion, and API quota theft.
*   **Resolution:** Implemented **Arcjet** security middleware (`middleware.ts`).
    *   **Bot Detection:** Automatically blocks known automated scrapers while allowing legitimate search engines (Google, Bing).
    *   **Rate Limiting:** Enforced a sliding window limit of 100 requests per minute per IP to prevent abuse.
    *   **Shield:** Activated protection against common web attacks (SQL injection, XSS patterns).
*   **Impact:** Significantly reduced risk of data scraping and resource exhaustion attacks.

### 2. Configuration Modernization & Build Fixes (New)
*   **Issue:** The `next.config.js` file contained deprecated keys (`eslint`, `images.domains`) and lacked configuration for the new Turbopack bundler, causing warning noise and potential future build failures.
*   **Resolution:**
    *   **Migrated Images Config:** Replaced deprecated `domains` array with the secure `remotePatterns` object.
    *   **Turbopack Support:** Added experimental `turbo` configuration to support alias resolution (`@/`).
    *   **Cleanup:** Removed invalid `eslint` config block that is no longer supported in Next.js 16.
*   **Impact:** Clean build logs, future-proof configuration, and full compatibility with Next.js 16's Turbopack.

### 3. Security & Infrastructure Hardening (Updated)
*   **Issue:** Vercel flagged and blocked deployments when a vulnerable Next.js version was detected (CVE-2025-66478 / React Server Components protocol).
*   **Resolution:** Standardized the project to use a patched Next.js release line and ensured the lockfile resolves to the secure version during `npm install`.
*   **Impact:** Restored successful builds and unblocked deployments under Vercel's security enforcement.

### 4. Critical Build & Deployment Fixes
*   **Issue:** The application was failing to build on Vercel and locally due to dependency conflicts and deprecated configurations.
*   **Resolution:**
    *   **Dependency Management:** Implemented `overrides` in `package.json` to force compatibility between core libraries.
    *   **Configuration Cleanup:** Removed invalid `eslint` settings causing build errors.
    *   **Deployment Strategy:** Created a `vercel.json` file to standardize the build command.
*   **Impact:** Restored the ability to deploy updates to production and run the project locally without errors.

### 5. UI/UX Redesign & Functional Enhancements
*   **Overview:** A comprehensive redesign of key interface elements was undertaken to modernize the look and feel while improving usability.
*   **Key Updates:**
    *   **Visual Overhaul:** Refined the application's aesthetic with a modern design language.
    *   **Functional Improvements:** Enhanced various interactive elements for smoother user workflows.
    *   **Filter System Fix:** Specifically corrected the "Colour" filter dropdown on the "Tombstones for Sale" page where icons were invisible. Modified the component (`TombstonesForSaleFilters.tsx`) to correctly display color swatches without incorrect monochrome filters.
*   **Impact:** Significantly improved user experience, visual appeal, and navigational clarity.

### 6. Image System Stability
*   **Issue:** Images from external content systems (Strapi and Cloudinary) were failing to load.
*   **Resolution:** Updated `next.config.js` security patterns to explicitly authorize these image providers.
*   **Impact:** All product images and media assets now load reliably.

### 7. Build Error Resolution & UI Cleanup (New)
*   **Issue:** The build failed due to an invalid CSS pseudo-class `:contains()` in `globals.css`. Additionally, the "Available at X Branches" text was causing visual clutter and needed to be removed globally.
*   **Resolution:**
    *   **CSS Fix:** Removed the invalid `:contains()` selector from `globals.css` that was causing the build failure.
    *   **Component Logic:** Restored the "Available at X Branches" logic in `premium-listing-card.tsx` and "Available at this branch" in `BranchCard.jsx` as it provides valuable user information.
*   **Impact:** Resolved the build error while preserving the branch availability indicators.

### 8. Runtime Image Error Resolution (New)
*   **Issue:** A runtime error occurred because `next/image` encountered an HTTP URL for `res.cloudinary.com`, but only HTTPS was configured.
*   **Resolution:** Added `http` protocol configuration for `res.cloudinary.com` in `next.config.js`.
*   **Impact:** Fixed the "Invalid src prop" runtime error, allowing images with HTTP URLs to load correctly.

### 9. Search Dropdown Icon Completion (New)
*   **Issue:** Several dropdown options in the search/filter UI had missing icons.
*   **Resolution:** Added missing icon mappings and assets across:
    *   Head Style: Arch, Church, House, Organic, Square, Wave
    *   Colour: Gold, Pink, Yellow
    *   Customisation: Bronze/Stainless Plaques, QR Code
    *   Slab Style: Double (with corrected lighter icon styling)
*   **Impact:** Consistent, complete dropdown visuals and improved usability.

### 10. Build-Time Runtime Fixes for API Routes (New)
*   **Issue:** Some API routes required the Node.js runtime during builds/deploys.
*   **Resolution:** Explicitly set Node.js runtime for affected API routes to prevent build/runtime failures in serverless environments.
*   **Impact:** More reliable deployments and fewer environment-specific failures.

## Technical Summary (For Development Team)

| Component | Change Description | File(s) Modified |
| :--- | :--- | :--- |
| **Config (New)** | Added `http` protocol for `res.cloudinary.com` to fix runtime error | `next.config.js` |
| **Build Fix (New)** | Removed invalid CSS `:contains` pseudo-class | `globals.css` |
| **UI (New)** | Restored "Available at" logic (Fixed CSS error) | `premium-listing-card.tsx`, `BranchCard.jsx` |
| **Security (New)** | Added Arcjet Middleware (Bot protection, Rate limiting) | `middleware.ts`, `.env.local` |
| **Config (New)** | Fixed `next.config.js` deprecations & added Turbopack support | `next.config.js` |
| Security | Pinned patched Next.js version to satisfy CVE enforcement | `package.json`, `package-lock.json` |
| Config | Removed `eslint` block; Added `http` protocol for remote patterns | `next.config.js` |
| CI/CD | Created build configuration to force `npm run build` | `vercel.json` |
| UI | Conditional CSS class to exclude `brightness-0 invert` on color icons | `components/TombstonesForSaleFilters.tsx` |
| Performance | Server-rendered initial listings for homepage and for-sale pages | `app/page.js`, `app/home-client.jsx`, `app/tombstones-for-sale/page.js`, `app/tombstones-for-sale/for-sale-client.jsx` |
| UI | Completed dropdown icon coverage (styles/colour/customisation/slab) | `components/FilterDropdown.js`, `public/last_icons/**` |

---
*Prepared by ape softwares team*
