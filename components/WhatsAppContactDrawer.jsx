import React, { useState } from "react";
import Image from "next/image";
import { trackAnalyticsEvent } from "@/lib/analytics";
import { sendInquiryRest } from "@/graphql/queries/sendInquiry";
import { formatPhoneNumber } from "@/lib/formatPhoneNumber";

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

  const phoneForDisplay = (p) => {
    if (!p) return "";
    const digits = ("" + p).replace(/[^\d]/g, "");
    if (digits.length === 10) return `${digits.slice(0,3)} ${digits.slice(3,6)} ${digits.slice(6)}`;
    if (digits.length === 11) return `${digits.slice(0,3)} ${digits.slice(3,7)} ${digits.slice(7)}`;
    return ("" + p).trim();
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
    setShowPhoneIndex(null);
    setView("form");
  };

  const closeForm = () => {
    setView("list");
    setSelectedRepIndex(null);
    setFullName("");
    setEmail("");
    setUserPhone("");
    setErrors({});
    setShowPhoneIndex(null);
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
      const link = `https://wa.me/${formatPhoneNumber(waNumber)}?text=${encodeURIComponent(buildMessage())}`;
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
        <svg 
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill="currentColor" 
          xmlns="http://www.w3.org/2000/svg"
          className="text-white"
        >
          <path 
            fillRule="evenodd" 
            clipRule="evenodd" 
            d="M20.4539 3.54618C18.2122 1.30204 15.2488 0.0488281 12.0941 0.0488281C5.46637 0.0488281 0.0678711 5.44733 0.0678711 12.0751C0.0678711 14.2333 0.648871 16.3335 1.75637 18.1577L0 24.0488L6.05371 22.3264C7.80637 23.3329 9.92704 23.8599 12.0941 23.8599C18.7218 23.8599 24.1203 18.4614 24.1203 11.8336C24.1203 8.67888 22.8671 5.71551 20.4539 3.54618ZM12.0941 21.8469C10.1391 21.8469 8.22637 21.3199 6.55371 20.3134L6.22704 20.1544L2.69371 21.1609L3.70021 17.7116L3.54121 17.3849C2.41371 15.6543 1.84471 13.6993 1.84471 11.7026C1.84471 6.45381 6.36621 2.06181 12.0941 2.06181C14.7218 2.06181 17.1911 3.06831 19.0881 4.96531C20.9851 6.86231 22.1126 9.33161 22.1126 11.9593C22.1126 17.3849 17.5911 21.8469 12.0941 21.8469ZM17.5911 14.5599C17.2644 14.4009 15.7999 13.6993 15.5314 13.5403C15.2629 13.3813 15.0458 13.3813 14.8288 13.7079C14.6118 14.0346 14.0428 14.6771 13.8258 14.8941C13.6088 15.1111 13.3918 15.1111 13.0651 14.9521C11.2858 14.0346 10.0996 13.3813 8.91337 11.3683C8.59887 10.8413 9.17204 10.8413 9.70287 9.77981C9.78237 9.56281 9.70287 9.40381 9.62337 9.24481C9.54387 9.08581 8.97071 7.62131 8.67037 6.96781C8.37004 6.31431 8.06971 6.45381 7.85271 6.45381C7.63571 6.45381 7.41871 6.45381 7.20171 6.45381C6.98471 6.45381 6.63204 6.53331 6.36621 6.85998C6.10037 7.18665 5.31887 7.88831 5.31887 9.35265C5.31887 10.817 6.42154 12.2815 6.57637 12.4985C6.73537 12.7155 8.91337 16.0649 12.2531 17.3849C14.2661 18.2444 15.0458 18.3254 16.0523 18.1664C16.6836 18.0869 17.8691 17.4649 18.1691 16.7049C18.4691 15.9449 18.4691 15.2914 18.3896 15.1111C18.3101 14.9308 18.0931 14.8513 17.7664 14.6923L17.5911 14.5599Z"
          />
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
              setShowPhoneIndex(null);
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
                <div className="flex items-center">
                  <button
                    type="button"
                    onClick={closeForm}
                    className="text-gray-700 hover:text-gray-900 mr-4"
                    aria-label="Back"
                    title="Back"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none">
                      <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  <div className="flex flex-col">
                    <h2 className="text-lg font-semibold text-black">Chat on WhatsApp</h2>
                    <div className="flex items-center gap-1">
                      {typeof selectedRepIndex === "number" && reps[selectedRepIndex] ? (
                        <>
                          {reps[selectedRepIndex]?.avatar?.url ? (
                            <div className="w-6 h-6 rounded-full overflow-hidden mr-1">
                              <Image 
                                src={reps[selectedRepIndex].avatar.url} 
                                width={24} 
                                height={24} 
                                alt={reps[selectedRepIndex]?.name || "Representative"} 
                                className="rounded-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center mr-1">
                              <span className="text-gray-500 text-xs">
                                {(reps[selectedRepIndex]?.name || "M").charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          <span className="text-base font-semibold text-black">{reps[selectedRepIndex]?.name || "Moruti"}</span>
                        </>
                      ) : (
                        <span className="text-base font-semibold text-black">Moruti</span>
                      )}
                      <span className="text-green-500">💚</span>
                    </div>
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
                      <li key={idx} className="pl-5 pr-0 py-4">
                        <div className="flex-end gap-8">
                          <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                              {avatarUrl ? (
                                <Image src={avatarUrl} width={40} height={40} alt={r?.name || "Rep"} />
                              ) : (
                                <span className="text-sm text-gray-500">IMG</span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div>
                                <div className="flex items-center gap-1">
                                  <span className="font-medium truncate text-black">{r?.name || "Representative"}</span>
                                  <span className="text-green-600" title="Preferred rep">💚</span>
                                </div>
                              </div>
                              {telNumber && showPhoneIndex === idx && (
                                <a href={telHref} className="block text-sm flex-item-start font-semibold text-blue-600 mt-0.5">
                                  {phoneForDisplay(r?.call || "")}
                                </a>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mr-4">
                              {waNumber ? (
                                <button type="button" onClick={() => openFormForRep(idx)} className="text-green-600 hover:text-green-700" aria-label="WhatsApp" title="WhatsApp">
                                  <svg 
                                    width="20" 
                                    height="20" 
                                    viewBox="0 0 24 24" 
                                    fill="currentColor" 
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <path 
                                      fillRule="evenodd" 
                                      clipRule="evenodd" 
                                      d="M20.4539 3.54618C18.2122 1.30204 15.2488 0.0488281 12.0941 0.0488281C5.46637 0.0488281 0.0678711 5.44733 0.0678711 12.0751C0.0678711 14.2333 0.648871 16.3335 1.75637 18.1577L0 24.0488L6.05371 22.3264C7.80637 23.3329 9.92704 23.8599 12.0941 23.8599C18.7218 23.8599 24.1203 18.4614 24.1203 11.8336C24.1203 8.67888 22.8671 5.71551 20.4539 3.54618ZM12.0941 21.8469C10.1391 21.8469 8.22637 21.3199 6.55371 20.3134L6.22704 20.1544L2.69371 21.1609L3.70021 17.7116L3.54121 17.3849C2.41371 15.6543 1.84471 13.6993 1.84471 11.7026C1.84471 6.45381 6.36621 2.06181 12.0941 2.06181C14.7218 2.06181 17.1911 3.06831 19.0881 4.96531C20.9851 6.86231 22.1126 9.33161 22.1126 11.9593C22.1126 17.3849 17.5911 21.8469 12.0941 21.8469ZM17.5911 14.5599C17.2644 14.4009 15.7999 13.6993 15.5314 13.5403C15.2629 13.3813 15.0458 13.3813 14.8288 13.7079C14.6118 14.0346 14.0428 14.6771 13.8258 14.8941C13.6088 15.1111 13.3918 15.1111 13.0651 14.9521C11.2858 14.0346 10.0996 13.3813 8.91337 11.3683C8.59887 10.8413 9.17204 10.8413 9.70287 9.77981C9.78237 9.56281 9.70287 9.40381 9.62337 9.24481C9.54387 9.08581 8.97071 7.62131 8.67037 6.96781C8.37004 6.31431 8.06971 6.45381 7.85271 6.45381C7.63571 6.45381 7.41871 6.45381 7.20171 6.45381C6.98471 6.45381 6.63204 6.53331 6.36621 6.85998C6.10037 7.18665 5.31887 7.88831 5.31887 9.35265C5.31887 10.817 6.42154 12.2815 6.57637 12.4985C6.73537 12.7155 8.91337 16.0649 12.2531 17.3849C14.2661 18.2444 15.0458 18.3254 16.0523 18.1664C16.6836 18.0869 17.8691 17.4649 18.1691 16.7049C18.4691 15.9449 18.4691 15.2914 18.3896 15.1111C18.3101 14.9308 18.0931 14.8513 17.7664 14.6923L17.5911 14.5599Z"
                                    />
                                  </svg>
                                </button>
                              ) : (
                                <span className="text-gray-300">—</span>
                              )}
                              {telNumber ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    try { trackAnalyticsEvent("rep_call_tracker", listing_id); } catch {}
                                    setShowPhoneIndex(idx);
                                  }}
                                  className="text-blue-600 hover:text-blue-700"
                                  aria-label="Call"
                                  title="Call"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
                                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.86 19.86 0 0 1 3.11 5.18 2 2 0 0 1 5.11 3h3a2 2 0 0 1 2 1.72 12.44 12.44 0 0 0 .7 2.57 2 2 0 0 1-.45 2.11L9.09 10.91a16 16 0 0 0 6 6l1.51-1.27a2 2 0 0 1 2.11-.45 12.44 12.44 0 0 0 2.57.7A2 2 0 0 1 22 16.92z"></path>
                                  </svg>
                                </button>
                              ) : (
                                <span className="text-gray-300">—</span>
                              )}
                            </div>
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
                        className="w-full rounded-lg border border-gray-300 px-3 py-3 text-sm text-black placeholder-gray-500 focus:ring-2 focus:ring-green-600"
                        placeholder="Full name"
                      />
                      {errors.fullName && <p className="mt-1 text-xs text-red-600">{errors.fullName}</p>}
                    </div>
                    <div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-3 py-3 text-sm text-black placeholder-gray-500 focus:ring-2 focus:ring-green-600"
                        placeholder="Email (optional)"
                      />
                      {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
                    </div>
                    <div>
                      <input
                        type="tel"
                        value={userPhone}
                        onChange={(e) => setUserPhone(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-3 py-3 text-sm text-black placeholder-gray-500 focus:ring-2 focus:ring-green-600"
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
                      {submitting ? (
                        "Opening..."
                      ) : (
                        <>
                          <Image src="/new files/Social Media Icons/Social Media Icons/whatsapp.svg" alt="WhatsApp" width={18} height={18} />
                          <span>Start WhatsApp chat</span>
                        </>
                      )}
                    </button>
                    <p className="mt-3 text-center text-xs text-gray-600">
                      By continuing I understand and agree to our
                      {" "}
                      <a href="/terms" className="text-blue-600 underline">Terms &amp; Conditions</a>
                      {" "}and{" "}
                      <a href="/privacy" className="text-blue-600 underline">Privacy Policy</a>.
                    </p>
                    {errors.general && <p className="text-xs text-red-600">{errors.general}</p>}
                  </div>
                </div>
              )}
            </div>
          </aside>
          {/* Bottom sheet for phone call */}
          {showPhoneIndex !== null && (() => {
            const rep = reps?.[showPhoneIndex];
            const tel = phoneForLink(rep?.call || "");
            const telHref = tel ? `tel:${tel}` : null;
            const telDisplay = rep?.call || tel;
            return (
              <div className="absolute inset-y-0 right-0 w-[90%] sm:w-[420px] z-50">
                <div className="absolute inset-0 bg-black/20" onClick={() => setShowPhoneIndex(null)} />
                <div className="absolute left-0 right-0 bottom-0 p-4">
                  <div className="mx-2 space-y-2">
                    <button
                      type="button"
                      onClick={() => { if (telHref) window.location.href = telHref; setShowPhoneIndex(null); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-blue-600 bg-white rounded-2xl shadow-2xl hover:bg-gray-50"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.86 19.86 0 0 1 3.11 5.18 2 2 0 0 1 5.11 3h3a2 2 0 0 1 2 1.72 12.44 12.44 0 0 0 .7 2.57 2 2 0 0 1-.45 2.11L9.09 10.91a16 16 0 0 0 6 6l1.51-1.27a2 2 0 0 1 2.11-.45 12.44 12.44 0 0 0 2.57.7A2 2 0 0 1 22 16.92z"></path>
                      </svg>
                      <span className="font-semibold">Call {phoneForDisplay(telDisplay)}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowPhoneIndex(null)}
                      className="w-full px-4 py-3 text-blue-600 font-semibold bg-white rounded-2xl shadow-2xl hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}