// app/api/distance/route.js

// Simple in-memory cache to reduce Google Maps API calls
// Keys: "userLat,userLng:destLat,destLng"
// Values: { distance, duration, timestamp }
const CACHE = new Map();
const CACHE_TTL_MS = 1000 * 60 * 60 * 24; // 24 hours cache duration
const MAX_CACHE_SIZE = 1000; // Prevent memory leaks

export async function POST(req) {
  try {
    const { userLat, userLng, destLat, destLng } = await req.json();

    if (!userLat || !userLng || !destLat || !destLng) {
      return new Response(JSON.stringify({ error: "Missing coordinates" }), { status: 400 });
    }

    // 1. Check Cache
    const cacheKey = `${Number(userLat).toFixed(4)},${Number(userLng).toFixed(4)}:${Number(destLat).toFixed(4)},${Number(destLng).toFixed(4)}`;
    
    if (CACHE.has(cacheKey)) {
      const entry = CACHE.get(cacheKey);
      if (Date.now() - entry.timestamp < CACHE_TTL_MS) {
        // Return cached result
        return new Response(JSON.stringify(entry.data), { status: 200 });
      } else {
        // Expired
        CACHE.delete(cacheKey);
      }
    }

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    const googleRes = await fetch(
      "https://routes.googleapis.com/directions/v2:computeRoutes",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask": "routes.distanceMeters,routes.duration",
        },
        body: JSON.stringify({
          origin: {
            location: { latLng: { latitude: userLat, longitude: userLng } },
          },
          destination: {
            location: { latLng: { latitude: destLat, longitude: destLng } },
          },
          travelMode: "DRIVE",
        }),
      }
    );

    if (!googleRes.ok) {
      const text = await googleRes.text();
      return new Response(JSON.stringify({ error: text }), { status: googleRes.status });
    }

    const data = await googleRes.json();
    const route = data.routes?.[0];

    if (!route) {
      return new Response(JSON.stringify({ error: "No route found" }), { status: 404 });
    }

    const result = {
      distance: { text: `${(route.distanceMeters / 1000).toFixed(1)} km`, value: route.distanceMeters },
      duration: { text: `${Math.round(parseInt(route.duration) / 60)} mins`, value: parseInt(route.duration) },
    };

    // 2. Update Cache
    if (CACHE.size >= MAX_CACHE_SIZE) {
      // Simple eviction: remove first key
      const firstKey = CACHE.keys().next().value;
      CACHE.delete(firstKey);
    }
    CACHE.set(cacheKey, { data: result, timestamp: Date.now() });

    return new Response(
      JSON.stringify(result),
      { status: 200 }
    );
  } catch (err) {
    console.error("Distance API error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}