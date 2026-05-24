// utils/analytics.js

import { buildAnalyticsEventData } from "./analytics-event-builder.mjs";

export { buildAnalyticsEventData };

/**
 * @param {string} eventType
 * @param {string | null | undefined} listingDocumentId
 * @param {Record<string, any> | null | undefined} options
 */
export async function trackAnalyticsEvent(eventType, listingDocumentId, options = null) {
  if (typeof window === "undefined") return;

  const analyticsDebug =
    typeof process !== "undefined" &&
    typeof process.env?.NEXT_PUBLIC_ANALYTICS_DEBUG === "string" &&
    ["1", "true", "yes"].includes(process.env.NEXT_PUBLIC_ANALYTICS_DEBUG.toLowerCase());

  const opts = options && typeof options === "object" ? options : {};

  const safeId = listingDocumentId ? String(listingDocumentId) : "global";
  const pagePathForKey =
    typeof opts.pagePath === "string"
      ? opts.pagePath
      : typeof window.location?.pathname === "string"
        ? window.location.pathname
        : "";
  const searchForKey = typeof opts.searchQuery === "string" ? opts.searchQuery.trim() : "";
  const dedupeKey = opts.dedupeKey ? String(opts.dedupeKey) : `${pagePathForKey}|${searchForKey}`;
  const storageKey = `analytics_${eventType}_${safeId}_${dedupeKey}`;
  const now = Date.now();

  try {
    const lastSent = window.localStorage.getItem(storageKey);
    if (lastSent && now - parseInt(lastSent, 10) < 30 * 1000) return;
  } catch {
  }

  const getSessionId = () => {
    try {
      const key = "analytics_session_id";
      const existing = window.localStorage.getItem(key);
      if (existing) return existing;
      const next =
        typeof window.crypto?.randomUUID === "function"
          ? window.crypto.randomUUID()
          : `${Date.now()}_${Math.random().toString(16).slice(2)}`;
      window.localStorage.setItem(key, next);
      return next;
    } catch {
      return null;
    }
  };

  const detectDeviceType = () => {
    try {
      const ua = String(navigator?.userAgent || "");
      if (/ipad|tablet/i.test(ua)) return "tablet";
      if (/mobi|android|iphone/i.test(ua)) return "mobile";
      return "desktop";
    } catch {
      return null;
    }
  };

  const readUtmParams = () => {
    try {
      const params = new URLSearchParams(window.location.search || "");
      const pick = (k) => {
        const v = params.get(k);
        return v && v.trim() ? v.trim() : null;
      };
      return {
        utmSource: pick("utm_source"),
        utmMedium: pick("utm_medium"),
        utmCampaign: pick("utm_campaign"),
        utmTerm: pick("utm_term"),
      };
    } catch {
      return { utmSource: null, utmMedium: null, utmCampaign: null, utmTerm: null };
    }
  };

  const pagePath =
    typeof opts.pagePath === "string"
      ? opts.pagePath
      : typeof window.location?.pathname === "string"
        ? window.location.pathname
        : null;
  const pageUrl =
    typeof opts.pageUrl === "string"
      ? opts.pageUrl
      : typeof window.location?.href === "string"
        ? window.location.href
        : null;
  const referrer =
    typeof opts.referrer === "string"
      ? opts.referrer
      : typeof document?.referrer === "string" && document.referrer.trim()
        ? document.referrer.trim()
        : null;
  const { utmSource, utmMedium, utmCampaign, utmTerm } = readUtmParams();
  const deviceType = detectDeviceType();
  const userAgent = typeof navigator?.userAgent === "string" ? navigator.userAgent : null;
  const sessionId = getSessionId();

  try {
    try {
      window.localStorage.setItem(storageKey, now.toString());
    } catch {
    }

    const baseUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL || "https://api.tombstonesfinder.co.za/api";
    const data = buildAnalyticsEventData({
      eventType,
      listingDocumentId,
      options: opts,
      context: {
        pagePath,
        pageUrl,
        referrer,
        utmSource,
        utmMedium,
        utmCampaign,
        utmTerm,
        deviceType,
        userAgent,
        sessionId,
      },
    });

    const res = await fetch(`${baseUrl}/analytics-events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data }),
    });

    if (!res.ok) {
      if (analyticsDebug) {
        const text = await res.text().catch(() => "");
        console.error("Analytics POST failed", res.status, res.statusText, text);
      }
      return;
    }

    try {
      window.localStorage.setItem(storageKey, now.toString());
    } catch {
    }
  } catch (error) {
    if (analyticsDebug) {
      console.error("Error tracking analytics:", error);
    }
  }
}
