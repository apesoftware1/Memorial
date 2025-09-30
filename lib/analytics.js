// utils/analytics.js

export async function trackAnalyticsEvent(eventType, listingDocumentId) {
  const storageKey = `analytics_${eventType}_${listingDocumentId}`;
  const lastSent = localStorage.getItem(storageKey);
  const now = Date.now();

  // Block repeated tracking within 30 seconds
  if (lastSent && now - parseInt(lastSent, 10) < 30 * 1000) {
    console.log(`Event "${eventType}" recently tracked, skipping...`);
    return;
  }

  try {
    // Mark as sent immediately to avoid double-count in StrictMode/dev re-renders
    localStorage.setItem(storageKey, now.toString());

    const today = new Date().toISOString().split("T")[0]; // yyyy-MM-dd

    const res = await fetch("https://typical-car-e0b66549b3.strapiapp.com/api/analytics-events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: {
          eventType, // 'contact_view', 'inquiry_click', 'listing_view', 'map_view'
          timestamp: today,
          // IMPORTANT: use the correct relation field name
          listing: {
            connect: [{ documentId: listingDocumentId }],
          },
        },
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error("Analytics POST failed", res.status, res.statusText, text);
      return;
    }

    console.log(`Tracked event: ${eventType} for listing ${listingDocumentId}`);
    // Save timestamp locally to avoid duplicate spam
    localStorage.setItem(storageKey, now.toString());

  } catch (error) {
    console.error("Error tracking analytics:", error);
  }
}