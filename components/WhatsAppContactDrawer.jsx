import React, { useState } from "react";
import Image from "next/image";

export default function WhatsAppContactDrawer({
  reps = [],
  defaultPhone = "",
  listingTitle = "",
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const phoneForLink = (p) => {
    // Keep raw digits; ensure it starts with country code if needed
    if (!p) return "";
    const digits = ("" + p).replace(/[^\d+]/g, "");
    return digits;
  };

  const message = listingTitle
    ? `Hi, I'm interested in: ${listingTitle}`
    : "Hi, I'm interested in your listing";

  return (
    <div className={className}>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full inline-flex items-center justify-center gap-2 rounded-md bg-green-600 hover:bg-green-700 text-white px-4 py-3 font-semibold"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="20" height="20" fill="currentColor" aria-hidden="true">
          <path d="M19.11 17.06c-.3-.15-1.77-.87-2.05-.97-.28-.1-.49-.15-.7.15-.2.3-.8.97-.98 1.17-.18.2-.36.22-.66.07-.3-.15-1.28-.47-2.44-1.5-.9-.8-1.5-1.78-1.68-2.08-.18-.3-.02-.46.13-.61.13-.13.3-.33.45-.5.15-.17.2-.3.3-.5.1-.2.05-.38-.03-.53-.08-.15-.7-1.68-.96-2.3-.25-.6-.52-.52-.7-.53h-.6c-.2 0-.53.08-.8.38-.28.3-1.07 1.05-1.07 2.56 0 1.5 1.1 2.95 1.25 3.16.15.2 2.18 3.33 5.28 4.66.74.32 1.33.51 1.78.65.75.24 1.44.2 1.98.12.6-.09 1.77-.72 2.03-1.43.25-.7.25-1.3.18-1.43-.07-.13-.26-.2-.55-.35zM26.66 5.34C23.73 2.41 19.97.9 16 .9 8.08.9 1.9 7.08 1.9 15c0 2.47.65 4.88 1.88 7l-1.23 4.47 4.57-1.2c2.07 1.13 4.41 1.73 6.78 1.73h.01c7.92 0 14.1-6.18 14.1-14.1 0-3.76-1.47-7.52-4.45-10.46zM16 25.88h-.01c-2.12 0-4.2-.57-6.01-1.64l-.43-.26-2.71.71.72-2.64-.28-.43A10.36 10.36 0 0 1 3.1 15c0-7.12 5.8-12.9 12.9-12.9 3.45 0 6.69 1.35 9.12 3.79 2.42 2.43 3.78 5.67 3.78 9.12 0 7.12-5.78 12.9-12.9 12.9z"/>
        </svg>
        <span>WhatsApp</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} />
          <aside className="absolute right-0 top-0 h-full w-[90%] sm:w-[420px] bg-white shadow-xl flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <h2 className="text-lg sm:text-xl font-semibold">Contact Sales Representatives</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <ul className="divide-y">
                {(reps && reps.length ? reps : [{ name: "Sales", phone: defaultPhone, avatarUrl: "" }]).map((r, idx) => {
                  const wa = phoneForLink(r.phone || defaultPhone);
                  const waHref = wa ? `https://wa.me/${wa}?text=${encodeURIComponent(message)}` : undefined;
                  const telHref = wa ? `tel:${wa}` : undefined;
                  return (
                    <li key={idx} className="flex items-center gap-3 px-5 py-4">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                        {r.avatarUrl ? (
                          <Image src={r.avatarUrl} width={40} height={40} alt={r.name || "Rep"} />
                        ) : (
                          <span className="text-sm text-gray-500">IMG</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium truncate">{r.name || "Representative"}</span>
                          <span className="text-green-600" aria-hidden>
                            <span aria-label="available">❤</span>
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {waHref ? (
                          <a
                            href={waHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-green-600 hover:text-green-700"
                            aria-label="WhatsApp"
                            title="WhatsApp"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="22" height="22" fill="currentColor"><path d="M19.11 17.06c-.3-.15-1.77-.87-2.05-.97-.28-.1-.49-.15-.7.15-.2.3-.8.97-.98 1.17-.18.2-.36.22-.66.07-.3-.15-1.28-.47-2.44-1.5-.9-.8-1.5-1.78-1.68-2.08-.18-.3-.02-.46.13-.61.13-.13.3-.33.45-.5.15-.17.2-.3.3-.5.1-.2.05-.38-.03-.53-.08-.15-.7-1.68-.96-2.3-.25-.6-.52-.52-.7-.53h-.6c-.2 0-.53.08-.8.38-.28.3-1.07 1.05-1.07 2.56 0 1.5 1.1 2.95 1.25 3.16.15.2 2.18 3.33 5.28 4.66.74.32 1.33.51 1.78.65.75.24 1.44.2 1.98.12.6-.09 1.77-.72 2.03-1.43.25-.7.25-1.3.18-1.43-.07-.13-.26-.2-.55-.35zM26.66 5.34C23.73 2.41 19.97.9 16 .9 8.08.9 1.9 7.08 1.9 15c0 2.47.65 4.88 1.88 7l-1.23 4.47 4.57-1.2c2.07 1.13 4.41 1.73 6.78 1.73h.01c7.92 0 14.1-6.18 14.1-14.1 0-3.76-1.47-7.52-4.45-10.46zM16 25.88h-.01c-2.12 0-4.2-.57-6.01-1.64l-.43-.26-2.71.71.72-2.64-.28-.43A10.36 10.36 0 0 1 3.1 15c0-7.12 5.8-12.9 12.9-12.9 3.45 0 6.69 1.35 9.12 3.79 2.42 2.43 3.78 5.67 3.78 9.12 0 7.12-5.78 12.9-12.9 12.9z"/></svg>
                          </a>
                        ) : (
                          <span className="text-gray-300" title="No WhatsApp">—</span>
                        )}
                        {telHref ? (
                          <a href={telHref} className="text-blue-600 hover:text-blue-700" aria-label="Call" title="Call">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.01-.24c1.11.37 2.31.57 3.58.57a1 1 0 0 1 1 1V21a1 1 0 0 1-1 1C10.85 22 2 13.15 2 2a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.27.2 2.47.57 3.58a1 1 0 0 1-.25 1.01l-2.2 2.2z"/></svg>
                          </a>
                        ) : (
                          <span className="text-gray-300" title="No phone">—</span>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}