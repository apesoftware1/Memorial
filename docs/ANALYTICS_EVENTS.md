# Analytics Events (Frontend Integration)

## Goals

- Keep analytics payloads consistent across the site.
- Ensure website-level events do not attach listing relations.
- Ensure listing-level events attach listing relations when a listing document id is available.

## Event Types

### Website-Level Events (must not include `listing`)

- `page_view`
- `search`
- `filter_apply`

### Listing-Level Events (may include `listing`)

- `listing_view`
- `map_view`
- `contact_view`
- `inquiry_click`
- `whatsapp_tracker`
- `rep_call_tracker`
- `phone_click`
- `website_click`

## Payload Rules

### 1) Event Categorization Rule

- Website-level events must omit `listing` entirely.
- Listing-level events should include `listing` only when the listing document id is known.

### 2) Website-Level Payload Requirements

#### `page_view`

- `eventType="page_view"`
- Required fields:
  - `pagePath`
  - `pageUrl`
  - `referrer`
  - `deviceType`
  - `sessionId`
  - relevant UTM parameters (`utmSource`, `utmMedium`, `utmCampaign`, `utmTerm`)

#### `search`

- `eventType="search"`
- `pagePath="/search"`
- Required fields:
  - `searchQuery` (user’s search term)
  - `metadata.filters` (object containing all active filters)

#### `filter_apply`

- `eventType="filter_apply"`
- `pagePath="/search"`
- Required fields:
  - `metadata.filters` including (when applicable): `province`, `city`, `town`, and `price` range
  - `metadata.paired` as an array describing combined selections

### 3) Listing-Level Payload Requirement

#### `listing_view`

- `eventType="listing_view"`
- Must include the `listing` relation connected via listing document id.
- May include `pagePath` and other context fields.

## Implementation Notes (Frontend)

- Builder: `buildAnalyticsEventData` in `Memorial/lib/analytics-event-builder.mjs` (re-exported via `Memorial/lib/analytics.js`)
- Sender: `trackAnalyticsEvent` in `Memorial/lib/analytics.js`
- Unit tests: `Memorial/scripts/analytics.test.mjs` (run with `npm run test:analytics`)
