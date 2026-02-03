import { useState, useEffect, useCallback, useRef } from "react";

export const useGuestLocation = () => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const mounted = useRef(false);

  // ✅ Prefer saved location from localStorage; fallback to Geolocation API
  useEffect(() => {
    // Prevent double-invocation in Strict Mode or re-mounts if undesired
    if (mounted.current) return; 
    mounted.current = true;

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

  const calculateDistanceFrom = useCallback(
    async (destination) => {
      if (!location) {
        return null;
      }

      const destLat = Number(destination?.lat);
      const destLng = Number(destination?.lng);

      if (Number.isNaN(destLat) || Number.isNaN(destLng)) {
        return null;
      }

      // Use Haversine client-side calculation to prevent 429 API storms
      const haversineKm = (lat1, lon1, lat2, lon2) => {
        const R = 6371;
        const toRad = (v) => (v * Math.PI) / 180;
        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(toRad(lat1)) *
            Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
      };

      const km = haversineKm(location.lat, location.lng, destLat, destLng);
      
      if (!km || !Number.isFinite(km)) {
        return null;
      }
      
      const valueMeters = Math.round(km * 1000);
      return {
        distance: {
          value: valueMeters,
          text: `${Math.round(km)} km`,
        },
        origin: { lat: location.lat, lng: location.lng },
        destination: { lat: destLat, lng: destLng },
        source: "haversine-local",
      };
      
      /* 
       * DISABLED: API Call to prevent 429 errors during mass listing
       * 
      try {
        const res = await fetch("/api/distance", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userLat: location.lat,
            userLng: location.lng,
            destLat,
            destLng,
          }),
        });

        if (!res.ok) {
          throw new Error(`Distance API error: HTTP ${res.status}`);
        }

        const data = await res.json();
        return data;
      } catch (err) {
        console.error("Error calculating distance:", err);
        const km = haversineKm(location.lat, location.lng, destLat, destLng);
        if (!km || !Number.isFinite(km)) {
          return null;
        }
        const valueMeters = Math.round(km * 1000);
        return {
          distance: {
            value: valueMeters,
            text: `${Math.round(km)} km`,
          },
          origin: { lat: location.lat, lng: location.lng },
          destination: { lat: destLat, lng: destLng },
          source: "haversine",
        };
      }
      */
    },
    [location]
  );

  return { location, error, loading, calculateDistanceFrom };
};
