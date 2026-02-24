# Performance Fix Plan for tombstonesfinder.co.za

## 1. Goals

- Keep current behaviour and layout intact (“don’t break things”).
- Improve:
  - LCP (especially hero image on the SINGLE tab)
  - Speed Index
  - Render-blocking CSS
  - Forced reflow / layout thrash
- Make changes incremental and safe (small, testable steps).

## 2. Current Signals

- Speed Index ≈ 2.6 s.
- LCP element: hero image on SINGLE:
  - `<img alt="SINGLE" fetchpriority="high" decoding="async" data-nimg="fill" class="object-cover" src="/2560(w)x400px(h)_Banner_OldYoungCouple.jpg" style="position: absolute; height: 100%; width: 100%; inset: 0px;">`
- LCP timing breakdown:
  - Time to first byte: 0 ms
  - Resource load delay: **3,820 ms** (main problem)
  - Resource load duration: 580 ms
  - Element render delay: 100 ms
- Render-blocking requests:
  - HTML: ~20 KiB
  - CSS 1: ~1.2 KiB (`7e7d96b1e6991756.css`)
  - CSS 2: ~18.7 KiB (`a6abf4dc29561727.css`)
- Forced reflow: 37 ms (from JS reading layout after writes).
- Preconnect:
  - Preconnects to Strapi media and Cloudinary.
  - Cloudinary preconnect is currently unused on the home page.

## 3. Issue 1 – LCP Resource Load Delay (~3.8 s)

### Symptom

- The hero image is the LCP, but the browser doesn’t start loading it for ~3.8 s.
- HTML and CSS are relatively small, so something in the critical path is delaying the image request.

### Likely causes

- The LCP image is only requested after:
  - All CSS is loaded, and
  - Some JavaScript (hydration or layout JS) runs.
- Possible extra delay if the hero is controlled by React/Next (conditional render, client-side routing, state gating).

### Fix strategy

#### 3.1 Ensure the LCP image is requested as early as possible

- Keep the hero image as a direct `<Image />` / `<img>` in the initial markup, not created only after client-side state is ready.
- Avoid wrapping the hero in conditions that wait for client data (e.g. location, user state) before rendering the image tag.

#### 3.2 Preload the LCP image

- In the main `<Head>` of the homepage, add a preload for the hero image:
  - Preload should match the exact URL actually used by the hero.
  - Include `as="image"` and, if applicable, `imagesrcset`/`imagesizes` so the browser can reuse it.
- This moves the image request earlier in the network dependency tree and reduces the “resource load delay” portion of LCP.

#### 3.3 Double-check priority flags

- Keep `fetchpriority="high"` or `priority` (Next.js) on the LCP image.
- Ensure it’s **not lazy-loaded**:
  - For Next.js, only the first LCP hero should have `priority`.
  - The image should be visible in the initial viewport; if CSS pushes it below, the effective LCP will change.

#### 3.4 Reduce the LCP image cost without changing the look

- Make sure the hero asset is:
  - Properly compressed (WebP/AVIF if possible).
  - Sized close to what’s actually displayed on desktop (no need for full 2560px width if the container is narrower).
- Keep the visual dimensions the same to avoid layout shifts; just optimize the file behind the current URL.

## 4. Issue 2 – Render-Blocking CSS (≈120 ms)

### Symptom

- Two CSS bundles block initial render:
  - `a6abf4dc29561727.css` (~18.7 KiB).
  - `7e7d96b1e6991756.css` (~1.2 KiB).
- Lighthouse reports potential ~120 ms savings.

### Fix strategy

#### 4.1 Audit CSS scope

- Identify which parts of those CSS files are actually used above-the-fold on the home page (hero, header, nav).
- If global CSS includes styles only used deeper in the site, consider moving those to more scoped, per-page or per-component styles (e.g. CSS modules).

#### 4.2 Inline critical CSS (only if necessary and safe)

- Extract a minimal set of critical styles for the hero and header.
- Inline those in a `<style>` block in `<head>` and defer or split the rest of the CSS bundle.
- Keep the layout identical; only change where the CSS is loaded from.

#### 4.3 Avoid chaining CSS dependencies

- Ensure CSS doesn’t import other CSS in a way that delays the hero (e.g. nested `@import` chains).
- Aim for a flat set of critical CSS resources.

## 5. Issue 3 – Forced Reflow (37 ms)

### Symptom

- JavaScript code reads layout (e.g. `offsetWidth`, `getBoundingClientRect`, `scrollTop`) after DOM changes, forcing reflows.

### Likely locations

- Components that:
  - Adjust heights or widths after render.
  - Implement sticky headers, carousels, or grid shuffles.
  - Listen to scroll/resize and measure DOM every event.

### Fix strategy

#### 5.1 Batch reads and writes

- Pattern:
  - Read layout values in one pass.
  - Update styles (writes) in a separate pass (ideally inside `requestAnimationFrame`).
- Avoid back-to-back read → write → read cycles in the same frame.

#### 5.2 Use CSS instead of JS where possible

- Prefer CSS flexbox, grid, `aspect-ratio`, and transitions for layout and animations instead of JS measuring and setting sizes.
- Ensure cards and hero images use CSS rules for sizing rather than JavaScript adjusting heights.

#### 5.3 Throttle expensive listeners

- For scroll/resize handlers:
  - Use throttling or debouncing.
  - Add early-exit checks (if element is off-screen, skip work).

## 6. Issue 4 – Preconnect / Preload Hygiene

### Symptom

- Current preconnects:
  - Strapi media origin (used).
  - Cloudinary origin (`res.cloudinary.com`) which appears unused on the home page.
- Lighthouse flags the Cloudinary preconnect as unused.

### Fix strategy

#### 6.1 Keep only essential preconnects

- On the home page:
  - Keep preconnect to origins used **above the fold** and early (e.g. Strapi media).
  - Remove or move the Cloudinary preconnect to a page/layout that actually uses Cloudinary immediately.

#### 6.2 Use preconnect + preload together for critical origins

- For the hero image origin, keep:
  - `preconnect` to reduce connection setup.
  - `preload` for the LCP image itself.
- Avoid adding more than about four preconnects total.

## 7. Safe Implementation Order

When implementing, do this in small, testable steps:

1. **Hero image / LCP**
   - Add `<link rel="preload" as="image" …>` for the hero.
   - Confirm in devtools that the hero is requested earlier and the LCP “resource load delay” drops.

2. **Preconnect cleanup**
   - Remove unused Cloudinary preconnect from the homepage (or move it where it’s needed).
   - Re-run Lighthouse and confirm no regressions.

3. **CSS audit**
   - Identify and move non-critical CSS out of render-blocking bundles when possible.
   - Only when confident, consider inlining a small set of critical CSS for the hero and header.

4. **Forced reflow audit**
   - Use performance tools to find the biggest layout-thrashing scripts.
   - Refactor those spots to batch reads/writes or move work to CSS.

Each step should be followed by a Lighthouse run to measure impact and catch regressions early.

http://localhost:3001/manufacturers/manufacturers-Profile-Page/phj4bgyrcyzqv37t7z2yb3wg

61
98
61
Performance
98
Accessibility
61
FCP
+10
LCP
+25
TBT
+0
CLS
+25
SI
+1
Performance
Values are estimated and may vary. The performance score is calculated directly from these metrics.See calculator.
0–49
50–89
90–100
Final Screenshot

Metrics
Collapse view
First Contentful Paint
0.3 s
First Contentful Paint marks the time at which the first text or image is painted. Learn more about the First Contentful Paint metric.
Largest Contentful Paint
0.4 s
Largest Contentful Paint marks the time at which the largest text or image is painted. Learn more about the Largest Contentful Paint metric
Total Blocking Time
2,300 ms
Sum of all time periods between FCP and Time to Interactive, when task length exceeded 50ms, expressed in milliseconds. Learn more about the Total Blocking Time metric.
Cumulative Layout Shift
0
Cumulative Layout Shift measures the movement of visible elements within the viewport. Learn more about the Cumulative Layout Shift metric.
Speed Index
4.4 s
Speed Index shows how quickly the contents of a page are visibly populated. Learn more about the Speed Index metric.
View Treemap
Screenshot
Screenshot
Screenshot
Screenshot
Screenshot
Screenshot
Screenshot
Screenshot
Show audits relevant to:

All

FCP

LCP

TBT
Insights
Document request latency Est savings of 4,110 ms
Your first network request is the most important. Reduce its latency by avoiding redirects, ensuring a fast server response, and enabling text compression.FCPLCPUnscored
Avoids redirects
Server responded slowly (observed 4205 ms)
Applies text compression
Render blocking requests Est savings of 30 ms
Requests are blocking the page's initial render, which may delay LCP. Deferring or inlining can move these network requests out of the critical path.FCPLCPUnscored
URL
Transfer Size
Duration
localhost 1st party
22.6 KiB	100 ms
…app/layout.css?v=177…(localhost)
22.6 KiB
100 ms
Forced reflow
A forced reflow occurs when JavaScript queries geometric properties (such as offsetWidth) after styles have been invalidated by a change to the DOM state. This can result in poor performance. Learn more about forced reflows and possible mitigations.Unscored
Top function call
Total reflow time
webpack-internal:///…r.development.js:15
11 ms
Source
Total reflow time
[unattributed]
54 ms
installHook.js:1
20 ms
LCP breakdown
Each subpart has specific improvement strategies. Ideally, most of the LCP time should be spent on loading the resources, not within delays.LCPUnscored
Subpart
Duration
Time to first byte
4,220 ms
Element render delay
700 ms
p.text-gray-600.font-medium
Network dependency tree
Legacy JavaScript Est savings of 10 KiB
3rd parties
These insights are also available in the Chrome DevTools Performance Panel - record a trace to view more detailed information.
Diagnostics
Minimize main-thread work 4.5 s
Consider reducing the time spent parsing, compiling and executing JS. You may find delivering smaller JS payloads helps with this. Learn how to minimize main-thread workTBTUnscored
Category
Time Spent
Script Evaluation
1,844 ms
Other
1,549 ms
Script Parsing & Compilation
862 ms
Garbage Collection
162 ms
Style & Layout
82 ms
Parse HTML & CSS
21 ms
Rendering
5 ms
Reduce JavaScript execution time 2.7 s
Consider reducing the time spent parsing, compiling, and executing JS. You may find delivering smaller JS payloads helps with this. Learn how to reduce Javascript execution time.TBTUnscored
URL
Total CPU Time
Script Evaluation
Script Parse
localhost 1st party
2,288 ms	1,043 ms	817 ms
…chunks/main-app.js?v=177…(localhost)
1,381 ms
1,009 ms
261 ms
…manufactu…/phj4bgyrcyzqv37t7z2yb3wg(localhost)
379 ms
31 ms
31 ms
…%5Bslug%5D/page.js(localhost)
358 ms
1 ms
356 ms
…app/layout.js(localhost)
171 ms
2 ms
169 ms
Unattributable
1,953 ms	618 ms	1 ms
Unattributable
1,258 ms
7 ms
0 ms
webpack-internal:///(app-pages-browser)/./node_modules/next/dist/compiled/scheduler/cjs/scheduler.development.js
607 ms
551 ms
1 ms
webpack-internal:///(app-pages-browser)/./node_modules/next/dist/compiled/next-devtools/index.js
88 ms
61 ms
0 ms
Google Tag Manager tag-manager 
186 ms	161 ms	22 ms
/gtag/js?id=G-R96RSDQTK2(www.googletagmanager.com)
186 ms
161 ms
22 ms
Minify JavaScript Est savings of 22 KiB
Minifying JavaScript files can reduce payload sizes and script parse time. Learn how to minify JavaScript.FCPLCPUnscored
URL
Transfer Size
Est Savings
localhost 1st party
27.6 KiB	22.0 KiB
…chunks/webpack.js?v=177…(localhost)
27.6 KiB
22.0 KiB
Reduce unused CSS Est savings of 21 KiB
Reduce unused rules from stylesheets and defer CSS not used for above-the-fold content to decrease bytes consumed by network activity. Learn how to reduce unused CSS.FCPLCPUnscored
URL
Transfer Size
Est Savings
localhost 1st party
22.2 KiB	21.5 KiB
…app/layout.css?v=177…(localhost)
22.2 KiB
21.5 KiB
Page prevented back/forward cache restoration 5 failure reasons
Many navigations are performed by going back to a previous page, or forwards again. The back/forward cache (bfcache) can speed up these return navigations. Learn more about the bfcacheUnscored
Failure reason
Failure type
Pages with cache-control:no-store header cannot enter back/forward cache.
Actionable
…manufactu…/phj4bgyrcyzqv37t7z2yb3wg(localhost)
Pages with WebSocket cannot enter back/forward cache.
Pending browser support
…manufactu…/phj4bgyrcyzqv37t7z2yb3wg(localhost)
Pages whose main resource has cache-control:no-store cannot enter back/forward cache.
Not actionable
…manufactu…/phj4bgyrcyzqv37t7z2yb3wg(localhost)
Back/forward cache is disabled because some JavaScript network request received resource with `Cache-Control: no-store` header.
Not actionable
…manufactu…/phj4bgyrcyzqv37t7z2yb3wg(localhost)
Back/forward cache is disabled because WebSocket has been used.
Not actionable
…manufactu…/phj4bgyrcyzqv37t7z2yb3wg(localhost)
Minify CSS Est savings of 7 KiB
Reduce unused JavaScript Est savings of 420 KiB
Avoid enormous network payloads Total size was 4,032 KiB
Avoid long main-thread tasks 13 long tasks found
User Timing marks and measures 1 user timing
More information about the performance of your application. These numbers don't directly affect the Performance score.
Passed audits (12)
Show
98
Accessibility
These checks highlight opportunities to improve the accessibility of your web app. Automatic detection can only detect a subset of issues and does not guarantee the accessibility of your web app, so manual testing is also encouraged.
Best practices
Document does not have a main landmark.
These items highlight common accessibility best practices.
Additional items to manually check (10)
Show
These items address areas which an automated testing tool cannot cover. Learn more in our guide on conducting an accessibility review.
Passed audits (17)
Show
Not applicable (42)
Show
Captured at Feb 22, 2026, 8:04 PM GMT+2
Emulated Desktop with Lighthouse 13.0.1
Single page session
Initial page load
Custom throttling
Using Chromium 145.0.0.0 with devtools
Generated by Lighthouse 13.0.1 | File an issue