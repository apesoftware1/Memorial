"use client";

import { useEffect } from "react";

export default function MapModal({ isOpen, onClose, mapUrl }) {
    const fallbackUrl =
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3603.9427874903186!2d28.280968512117834!3d-25.40672563187992!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1ebfc033740b848f%3A0x6d175e44dc261d2e!2sGalaletsang%20Guesthouse!5e0!3m2!1sen!2sza!4v1722208976053!5m2!1sen!2sza";
    
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