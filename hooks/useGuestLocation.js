import { useState, useEffect, useCallback } from "react";

export const useGuestLocation = () => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Prefer saved location from localStorage; fallback to Geolocation API
  useEffect(() => {
    if (typeof window === "undefined") {
      setLoading(false);
      return;
    }

    // 1) Try localStorage first
    try {
      const savedGuest = localStorage.getItem("guestLocation");
      const savedUser = localStorage.getItem("userLocation");
      const raw = savedGuest || savedUser;

      if (raw) {
        const parsed = JSON.parse(raw);
        // Support both {lat,lng} and {latitude,longitude} shapes
        const lat = Number(parsed.lat ?? parsed.latitude);
        const lng = Number(parsed.lng ?? parsed.longitude);

        if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
          setLocation({ lat, lng });
          setLoading(false);
          return; // Skip geolocation if we have a stored location
        }
      }
    } catch (_) {
      // Ignore JSON parse errors and continue to geolocation
    }

    // 2) Fallback to Geolocation API
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );
  }, []);

  // ✅ Calculate distance via backend API
  const calculateDistanceFrom = useCallback(
    async (destLat, destLng) => {
      if (!location) {
        console.warn("User location not yet detected.");
        return null;
      }

      try {
       
        const res = await fetch("/api/distance", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userLat: location.lat,
            userLng: location.lng,
            destLat: destLat.lat,
            destLng: destLat.lng,
          }),
        });

        if (!res.ok) {
          throw new Error(`Distance API error: HTTP ${res.status}`);
        }

        const data = await res.json();
        return data;
      } catch (err) {
        console.error("Error calculating distance:", err);
        return null;
      }
    },
    [location]
  );

  return { location, error, loading, calculateDistanceFrom };
};
