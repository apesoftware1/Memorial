// app/api/distance/route.js

export async function POST(req) {
  try {
    const { userLat, userLng, destLat, destLng } = await req.json();

    if (!userLat || !userLng || !destLat || !destLng) {
      return new Response(JSON.stringify({ error: "Missing coordinates" }), { status: 400 });
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
            location: { latLng: { latitude: parseFloat(userLat), longitude: parseFloat(userLng) } },
          },
          destination: {
            location: { latLng: { latitude: parseFloat(destLat), longitude: parseFloat(destLng) } },
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

    return new Response(
      JSON.stringify({
        distance: { text: `${(route.distanceMeters / 1000).toFixed(1)} km`, value: route.distanceMeters },
        duration: { text: `${Math.round(parseInt(route.duration) / 60)} mins`, value: parseInt(route.duration) },
      }),
      { status: 200 }
    );
  } catch (err) {
    console.error("Distance API error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}