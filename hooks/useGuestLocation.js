import { useState, useEffect, useCallback, useRef } from "react";

export const useGuestLocation = () => {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const mounted = useRef(false);

  const readStoredLocation = useCallback(() => {
    if (typeof window === "undefined") return null;
    try {
      const savedGuest =
        localStorage.getItem("guestLocation") ||
        localStorage.getItem("GuestLocation");
      const savedUser = localStorage.getItem("userLocation");
      const raw = savedGuest || savedUser;

      if (!raw) return null;
      const parsed = JSON.parse(raw);
      const lat = Number(parsed?.lat ?? parsed?.latitude);
      const lng = Number(parsed?.lng ?? parsed?.longitude);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
      return { lat, lng };
    } catch {
      return null;
    }
  }, []);

  const persistLocation = useCallback((next) => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(
        "guestLocation",
        JSON.stringify({ ...next, updatedAt: Date.now() })
      );
    } catch {
    }

    try {
      window.dispatchEvent(new Event("guestLocation:updated"));
    } catch {
    }
  }, []);

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
    const stored = readStoredLocation();
    if (stored) {
      setLocation(stored);
      setError(null);
      setLoading(false);
      return; // Skip geolocation if we have a stored location
    }

    // 2) Fallback to Geolocation API
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const next = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setLocation(next);
        setError(null);
        persistLocation(next);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const syncFromStorage = () => {
      const stored = readStoredLocation();
      if (stored) {
        setLocation(stored);
        setError(null);
        setLoading(false);
      }
    };

    const onStorage = (e) => {
      if (!e || (e.key !== "guestLocation" && e.key !== "GuestLocation" && e.key !== "userLocation")) return;
      syncFromStorage();
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener("guestLocation:updated", syncFromStorage);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("guestLocation:updated", syncFromStorage);
    };
  }, [readStoredLocation]);

  const refreshLocation = useCallback(() => {
    if (typeof window === "undefined") return;
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setError("Geolocation is not supported in this browser.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const next = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setLocation(next);
        setError(null);
        persistLocation(next);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  }, [persistLocation]);

  const setGuestLocation = useCallback(
    (next) => {
      const lat = Number(next?.lat ?? next?.latitude);
      const lng = Number(next?.lng ?? next?.longitude);
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
      const normalized = { lat, lng };
      setLocation(normalized);
      setError(null);
      setLoading(false);
      persistLocation(normalized);
    },
    [persistLocation]
  );

  const clearGuestLocation = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem("guestLocation");
      localStorage.removeItem("GuestLocation");
      localStorage.removeItem("userLocation");
    } catch {
    }
    setLocation(null);
    setError(null);
    setLoading(false);
    try {
      window.dispatchEvent(new Event("guestLocation:updated"));
    } catch {
    }
  }, []);

  const calculateDistanceFrom = useCallback(
    async (destination) => {
      if (!location) {
        return null;
      }

      const detourFactor =
        typeof window !== "undefined" && typeof process !== "undefined"
          ? Number(process?.env?.NEXT_PUBLIC_DISTANCE_DETOUR_FACTOR)
          : NaN;
      const effectiveDetourFactor = Number.isFinite(detourFactor) && detourFactor > 0
        ? detourFactor
        : 1.25;

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

      const kmStraight = haversineKm(location.lat, location.lng, destLat, destLng);
      const km = kmStraight * effectiveDetourFactor;
      
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

  return {
    location,
    error,
    loading,
    calculateDistanceFrom,
    refreshLocation,
    setGuestLocation,
    clearGuestLocation,
  };
};
