"use client"

import { useState, useEffect } from "react";
import { X, AlertTriangle } from "lucide-react";

export default function MaintenanceBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const load = async () => {
      try {
        const res = await fetch("/api/maintenance-mode", { method: "GET" });
        if (!res.ok) return;
        const data = await res.json();
        setEnabled(!!data?.enabled);
        if (data?.enabled) {
          const hidden = localStorage.getItem("maintenance-banner-hidden");
          if (hidden !== "true") {
            const timer = setTimeout(() => {
              setIsVisible(true);
            }, 30000);
            return () => clearTimeout(timer);
          }
        }
      } catch {
      }
    };

    const cleanup = load();
    return () => {
      if (typeof cleanup === "function") cleanup();
    };
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem("maintenance-banner-hidden", "true");
  };

  if (!isMounted || !enabled || !isVisible) return null;

  return (
    <div className="w-full bg-yellow-500 text-black px-4 py-3 relative z-[100]">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <p className="font-medium text-sm md:text-base">
            <span className="font-bold">Under Maintenance:</span> We are currently
            updating our website to improve your experience. Some pages may be
            temporarily unavailable. We apologize for the inconvenience.
          </p>
        </div>
        <button 
            onClick={handleDismiss}
            className="p-1 hover:bg-yellow-600 rounded-full transition-colors ml-4 shrink-0"
            aria-label="Dismiss maintenance banner"
        >
            <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
