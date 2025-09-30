"use client";

import { useEffect } from "react";

export default function MapModal({ isOpen, onClose, mapUrl }) {
    const fallbackUrl =
    "https://www.openstreetmap.org/export/embed.html?bbox=28.0,-26.4,28.3,-26.1&layer=mapnik";
    
  // Close modal when ESC key is pressed
  useEffect(() => {

    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg overflow-hidden shadow-lg w-[90%] md:w-[70%] lg:w-[50%] h-[80%]"
        onClick={(e) => e.stopPropagation()} // Prevent modal close when clicking inside
      >
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">Manufacturer’s Location</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
       
        {/* Google Maps iframe */}
        <iframe
          src={mapUrl || fallbackUrl}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </div>
    </div>
  );
}