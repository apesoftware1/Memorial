"use client";

import Image from "next/image";
import { useEffect } from "react";

export default function SpecialOfferModal({ isOpen, onClose, logoSrc }) {
  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", handleEsc);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded bg-white shadow-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative border-b bg-[#F7F2D5] px-6 py-4 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            ✕
          </button>
          <div className="flex items-center gap-4">
            <div className="text-4xl leading-none">🔥</div>
            <div className="leading-tight">
              <div className="text-4xl font-extrabold text-[#0D7C99]">Special Offer</div>
              <div className="text-xl font-semibold text-[#0D7C99]">
                Get more value with your purchase
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-6 overflow-y-auto flex-1">
          <div className="mx-auto max-w-md text-center">
            {logoSrc ? (
              <div className="mx-auto mb-4 flex justify-center">
                <div className="relative h-20 w-56">
                  <Image
                    src={logoSrc}
                    alt="Special offer logo"
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>
              </div>
            ) : null}

            <div className="text-2xl font-extrabold text-gray-900">What You Get</div>
            <div className="mt-4 text-lg text-gray-900">
              <div className="flex items-start justify-center gap-2">
                <span className="mt-1">👕</span>
                <div className="text-left">
                  <span className="font-semibold">Free T-shirt</span> when you spend R5,000 or more
                </div>
              </div>
              <div className="mt-2 flex items-start justify-center gap-2">
                <span className="mt-1">💰</span>
                <div className="text-left">
                  <span className="font-semibold">5% cashback</span> on your purchase
                </div>
              </div>
            </div>

            <div className="mt-7 text-sm font-extrabold text-gray-900">How it works</div>
            <div className="mt-2 text-sm text-gray-800">
              <div>Choose your tombstone</div>
              <div>Spend R5,000 or more</div>
              <div>Receive your free T-shirt</div>
              <div className="mt-2">Cashback is paid after full payment is completed</div>
            </div>

            <div className="mx-auto mt-6 h-px w-full bg-gray-200" />

            <div className="mt-4 text-[11px] font-semibold text-gray-700">Terms &amp; Conditions</div>
            <div className="mt-2 text-[10px] leading-snug text-gray-600">
              <div>Offer applies to qualifying purchases only</div>
              <div>Cashback is only valid on completed payments</div>
              <div>Free T-shirt subject to availability</div>
              <div>Offer may be withdrawn at any time</div>
              <div>Additional supplier terms may apply</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

