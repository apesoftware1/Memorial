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
    const today = new Date().toISOString().split("T")[0]; // yyyy-MM-dd

    await fetch("https://typical-car-e0b66549b3.strapiapp.com/api/analytics-events", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: {
          eventType, // 'contact_view', 'inquiry_click', 'listing_view', 'map_view'
          timestamp: today,
          listing_id: {
            connect: [{ documentId: listingDocumentId }],
          },
        },
      }),
    });

    // Save timestamp locally to avoid duplicate spam
    localStorage.setItem(storageKey, now.toString());
    console.log(`Tracked event: ${eventType} for listing ${listingDocumentId}`);

  } catch (error) {
    console.error("Error tracking analytics:", error);
  }
}