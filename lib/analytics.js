// utils/analytics.js

export async function trackAnalyticsEvent(eventType, listingDocumentId) {
    const storageKey = `analytics_${eventType}_${listingDocumentId}`;
  const lastSent = localStorage.getItem(storageKey);
  const now = Date.now();

  // Block repeated tracking within 30 seconds
  if (lastSent && now - parseInt(lastSent, 10) < 30 * 1000) {
    console.log('Event recently tracked, skipping...');
    return;
  }
    try {
      const today = new Date().toISOString().split('T')[0]; // Format: yyyy-MM-dd
  
      await fetch('https://typical-car-e0b66549b3.strapiapp.com/api/analytics-events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: {
            eventType,
            timestamp: today,
            listing_id: {
              connect: [{ documentId: listingDocumentId }],
            },
          },
        }),
      });
    } catch (error) {
      console.error('Error tracking analytics:', error);
    }
  };
// Example usage inside a component
// import { trackAnalyticsEvent } from './analytics';

{/* <button onClick={() => trackAnalyticsEvent('contact_view', listing.documentId)}>View Contact</button>
<button onClick={() => trackAnalyticsEvent('inquiry_click', listing.documentId)}>Send Inquiry</button> */}