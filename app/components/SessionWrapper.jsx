"use client";
import { SessionProvider } from 'next-auth/react';
import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { trackAnalyticsEvent } from "@/lib/analytics";
import { useReportWebVitals } from "next/web-vitals";

export default function SessionWrapper({ children }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const pathnameRef = useRef(null);

  useEffect(() => {
    try {
      if (!pathname) return;
      pathnameRef.current = pathname;
      trackAnalyticsEvent("page_view", null, { pagePath: pathname });
    } catch {
    }
  }, [pathname, searchParams]);

  useReportWebVitals((metric) => {
    try {
      const p = pathnameRef.current;
      if (!p) return;
      trackAnalyticsEvent("page_view", null, {
        pagePath: p,
        dedupeKey: `webvital:${metric?.name || ""}`,
        metadata: {
          webVital: {
            name: metric?.name ?? null,
            value: typeof metric?.value === "number" ? metric.value : null,
            rating: metric?.rating ?? null,
            delta: typeof metric?.delta === "number" ? metric.delta : null,
            id: metric?.id ?? null,
            navigationType: metric?.navigationType ?? null,
          },
        },
      });
    } catch {
    }
  });

  return (
    <SessionProvider
      refetchInterval={0} // Disable automatic refetching to prevent errors
    >
      {children}
    </SessionProvider>
  );
} 
