import assert from "node:assert/strict";
import { buildAnalyticsEventData } from "../lib/analytics-event-builder.mjs";

const baseContext = {
  pagePath: "/search",
  pageUrl: "https://example.com/search?city=durban",
  referrer: "https://google.com/",
  utmSource: "google",
  utmMedium: "cpc",
  utmCampaign: "winter-sale",
  utmTerm: "tombstone",
  deviceType: "mobile",
  userAgent: "Mozilla/5.0",
  sessionId: "abc123",
};

{
  const data = buildAnalyticsEventData({
    eventType: "page_view",
    listingDocumentId: null,
    options: {},
    context: baseContext,
  });

  assert.equal(data.eventType, "page_view");
  assert.equal(data.pagePath, "/search");
  assert.ok(typeof data.pageUrl === "string" && data.pageUrl.includes("/search"));
  assert.ok(typeof data.sessionId === "string" && data.sessionId.length > 0);
  assert.ok(!("listing" in data));
}

{
  const data = buildAnalyticsEventData({
    eventType: "search",
    listingDocumentId: null,
    options: {
      pagePath: "/search",
      searchQuery: "tombstone",
      metadata: { filters: { city: ["durban"] } },
    },
    context: baseContext,
  });

  assert.equal(data.eventType, "search");
  assert.equal(data.pagePath, "/search");
  assert.equal(data.searchQuery, "tombstone");
  assert.deepEqual(data.metadata, { filters: { city: ["durban"] } });
  assert.ok(!("listing" in data));
}

{
  const data = buildAnalyticsEventData({
    eventType: "filter_apply",
    listingDocumentId: null,
    options: {
      pagePath: "/search",
      metadata: {
        filters: { province: "KwaZulu_Natal", city: "Durban", town: null, price: { min: "R 5,000", max: null } },
        paired: ["KwaZulu_Natal > Durban", "price:R 5,000-any"],
      },
    },
    context: baseContext,
  });

  assert.equal(data.eventType, "filter_apply");
  assert.equal(data.pagePath, "/search");
  assert.ok(data.metadata && typeof data.metadata === "object");
  assert.ok(!("listing" in data));
}

{
  const data = buildAnalyticsEventData({
    eventType: "listing_view",
    listingDocumentId: "listing-123",
    options: { pagePath: "/tombstones-for-sale/listing-123" },
    context: baseContext,
  });

  assert.equal(data.eventType, "listing_view");
  assert.ok(data.listing);
  assert.equal(data.listing.connect[0].documentId, "listing-123");
}

console.log("analytics.test.mjs: OK");
