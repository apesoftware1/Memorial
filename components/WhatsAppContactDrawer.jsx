import React, { useState } from "react";
import Image from "next/image";
import { trackAnalyticsEvent } from "@/lib/analytics";
import { sendInquiryRest } from "@/graphql/queries/sendInquiry";

export default function WhatsAppContactDrawer({listing_id ,reps = [], className = "" }) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState("list"); // list | form
  const [selectedRepIndex, setSelectedRepIndex] = useState(null);
  const [showPhoneIndex, setShowPhoneIndex] = useState(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const phoneForLink = (p) => {
    if (!p) return "";
    return ("" + p).replace(/[^\d+]/g, ""); // only digits + optional +
  };

  const isValidPhone = (p) => /^\+?\d{7,15}$/.test(p);
  const isValidEmail = (e) => !e || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

  const buildMessage = () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    return `Hello, my name is ${fullName.trim()}. I'm interested in this listing: ${url}`;
  };

  const validateForm = () => {
    const e = {};
    if (!fullName.trim()) e.fullName = "Name is required";
    if (!userPhone.trim()) e.userPhone = "Mobile number is required";
    else if (!isValidPhone(userPhone.trim())) e.userPhone = "Enter a valid phone number";
    if (!isValidEmail(email)) e.email = "Enter a valid email address";
    return e;
  };

  const openFormForRep = (idx) => {
    setSelectedRepIndex(idx);
    setErrors({});
    setView("form");
  };

  const closeForm = () => {
    setView("list");
    setSelectedRepIndex(null);
    setFullName("");
    setEmail("");
    setUserPhone("");
    setErrors({});
  };

  // Build the backend inquiry payload
  function buildInquiryPayload() {
    return {
      name: fullName.trim(),
      mobileNumber: userPhone.trim(),
      email: (email || "").trim(),
      message: buildMessage(),
      documentId: listing_id,
    };
  }

  async function sendInquiryToBackend(payload) {
    try {
      //  (fetch/axios to backend)
      sendInquiryRest(payload)
      console.log("Sending inquiry:", payload);
    } catch (err) {
      console.error("Inquiry submission failed:", err);
    }
  }

  const handleSubmitForm = async (waNumber) => {
    const e = validateForm();
    setErrors(e);
    if (Object.keys(e).length) return;

    try {
      setSubmitting(true);

      // Send to backend
      await sendInquiryToBackend(buildInquiryPayload());

      // Track analytics
      trackAnalyticsEvent("whatsapp_tracker", listing_id);

      // Open WhatsApp chat
      const link = `https://wa.me/${waNumber}?text=${encodeURIComponent(buildMessage())}`;
      if (typeof window !== "undefined") {
        window.open(link, "_blank", "noopener");
      }

      closeForm();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={className}>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full inline-flex items-center justify-center gap-2 bg-green-900 hover:bg-green-700 text-white px-4 py-3 font-semibold rounded-b-lg"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="20" height="20" fill="currentColor">
          <path d="M19.11 17.06c-.3-.15-1.77-.87-2.05-.97-.28-.1-.49-.15-.7.15-.2.3-.8.97-.98 1.17-.18.2-.36.22-.66.07-.3-.15-1.28-.47-2.44-1.5-.9-.8-1.5-1.78-1.68-2.08-.18-.3-.02-.46.13-.61.13-.13.3-.33.45-.5.15-.17.2-.3.3-.5.1-.2.05-.38-.03-.53-.08-.15-.7-1.68-.96-2.3-.25-.6-.52-.52-.7-.53h-.6c-.2 0-.53.08-.8.38-.28.3-1.07 1.05-1.07 2.56 0 1.5 1.1 2.95 1.25 3.16.15.2 2.18 3.33 5.28 4.66.74.32 1.33.51 1.78.65.75.24 1.44.2 1.98.12.6-.09 1.77-.72 2.03-1.43.25-.7.25-1.3.18-1.43-.07-.13-.26-.2-.55-.35zM26.66 5.34C23.73 2.41 19.97.9 16 .9 8.08.9 1.9 7.08 1.9 15c0 2.47.65 4.88 1.88 7l-1.23 4.47 4.57-1.2c2.07 1.13 4.41 1.73 6.78 1.73h.01c7.92 0 14.1-6.18 14.1-14.1 0-3.76-1.47-7.52-4.45-10.46zM16 25.88h-.01c-2.12 0-4.2-.57-6.01-1.64l-.43-.26-2.71.71.72-2.64-.28-.43A10.36 10.36 0 0 1 3.1 15c0-7.12 5.8-12.9 12.9-12.9 3.45 0 6.69 1.35 9.12 3.79 2.42 2.43 3.78 5.67 3.78 9.12 0 7.12-5.78 12.9-12.9 12.9z" />
        </svg>
        <span>WhatsApp</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => {
              setOpen(false);
              setView("list");
            }}
          />
          <aside className="absolute right-0 top-0 h-full w-[90%] sm:w-[420px] bg-white shadow-xl flex flex-col">
            {/* Header */}
            {view === "list" ? (
              <div className="flex items-center justify-between px-5 py-4 border-b">
                <h2 className="text-lg sm:text-xl font-semibold text-black">Contact Sales Representatives</h2>
                <button type="button" onClick={() => setOpen(false)} className="text-gray-500 hover:text-gray-700" aria-label="Close">
                  ✕
                </button>
              </div>
            ) : (
              <div className="px-5 py-4 border-b">
                <div className="flex items-center gap-3">
                  <button type="button" onClick={closeForm} className="text-gray-700 hover:text-gray-900" aria-label="Back" title="Back">
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none">
                      <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  <div className="flex flex-col">
                    {typeof selectedRepIndex === "number" && reps[selectedRepIndex] && (
                      <span className="text-sm font-semibold text-black">{reps[selectedRepIndex]?.name || "Representative"}</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Body */}
            <div className="flex-1 overflow-y-auto">
              {view === "list" ? (
                <ul className="divide-y divide-gray-200">
                  {(reps || []).map((r, idx) => {
                    const telNumber = phoneForLink(r?.call || "");
                    const waNumber = phoneForLink(r?.whatsapp || "");
                    const telHref = telNumber ? `tel:${telNumber}` : undefined;
                    const avatarUrl = r?.avatar?.url || "";

                    return (
                      <li key={idx} className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                            {avatarUrl ? (
                              <Image src={avatarUrl} width={40} height={40} alt={r?.name || "Rep"} />
                            ) : (
                              <span className="text-sm text-gray-500">IMG</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="font-medium truncate text-black">{r?.name || "Representative"}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            {waNumber ? (
                              <button type="button" onClick={() => openFormForRep(idx)} className="text-green-600 hover:text-green-700" aria-label="WhatsApp">
                                💬
                              </button>
                            ) : (
                              <span className="text-gray-300">—</span>
                            )}
                            {telHref ? (
                              <a href={telHref} className="text-blue-600 hover:text-blue-700" aria-label="Call">
                                📞
                              </a>
                            ) : (
                              <span className="text-gray-300">—</span>
                            )}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="px-5 py-6">
                  <div className="space-y-3">
                    <div>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-3 py-3 text-sm focus:ring-2 focus:ring-green-600"
                        placeholder="Full name"
                      />
                      {errors.fullName && <p className="mt-1 text-xs text-red-600">{errors.fullName}</p>}
                    </div>
                    <div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-3 py-3 text-sm focus:ring-2 focus:ring-green-600"
                        placeholder="Email (optional)"
                      />
                      {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
                    </div>
                    <div>
                      <input
                        type="tel"
                        value={userPhone}
                        onChange={(e) => setUserPhone(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-3 py-3 text-sm focus:ring-2 focus:ring-green-600"
                        placeholder="Mobile number"
                      />
                      {errors.userPhone && <p className="mt-1 text-xs text-red-600">{errors.userPhone}</p>}
                    </div>
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={async () => {
                        const rep = typeof selectedRepIndex === "number" ? reps[selectedRepIndex] : null;
                        const wa = rep ? phoneForLink(rep.whatsapp || "") : "";
                        if (!wa) {
                          setErrors({ general: "This representative has no WhatsApp number." });
                          return;
                        }
                        await handleSubmitForm(wa);
                      }}
                      className="w-full inline-flex items-center justify-center gap-2 bg-green-700 hover:bg-green-800 text-white px-4 py-3 font-semibold rounded-lg disabled:opacity-60"
                    >
                      {submitting ? "Opening..." : "Start WhatsApp chat"}
                    </button>
                    {errors.general && <p className="text-xs text-red-600">{errors.general}</p>}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
