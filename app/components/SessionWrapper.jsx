"use client";
import { SessionProvider } from 'next-auth/react';
import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { trackAnalyticsEvent } from "@/lib/analytics";

export default function SessionWrapper({ children }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    try {
      if (!pathname) return;
      trackAnalyticsEvent("page_view", null, { pagePath: pathname });
    } catch {
    }
  }, [pathname, searchParams]);

  return (
    <SessionProvider
      refetchInterval={0} // Disable automatic refetching to prevent errors
    >
      {children}
    </SessionProvider>
  );
} 
