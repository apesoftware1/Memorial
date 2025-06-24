"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, MapPin, Edit2, ChevronRight } from "lucide-react";
import { useEffect, useState } from 'react';
import React from 'react';

function isMobile() {
  if (typeof window === 'undefined') return false;
  return window.innerWidth <= 768;
}

export default function ManufacturerProfileEditor() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    setMobile(isMobile());
    const handleResize = () => setMobile(isMobile());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  if (mobile) return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#fffbe6',
      animation: 'fadeIn 1.2s',
    }}>
      <div style={{
        background: '#ffe066',
        color: '#b26a00',
        fontWeight: 700,
        fontSize: 22,
        padding: '32px 40px',
        borderRadius: 16,
        boxShadow: '0 2px 16px rgba(255, 224, 102, 0.18)',
        textAlign: 'center',
        letterSpacing: 1,
        animation: 'fadeIn 1.2s',
      }}>
        Page not available for mobile use!
      </div>
      <style>{`@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>
    </div>
  );

  // Demo data for the manufacturer
  const manufacturer = {
    name: "Example Tombstone Co.",
    logo: "/placeholder.svg", // Replace with actual logo path
    website: "www.PeacefulRestMemorials.com",
    socials: [
      { name: "facebook", url: "#" },
      { name: "instagram", url: "#" },
      { name: "youtube", url: "#" },
      { name: "telegram", url: "#" },
      { name: "x", url: "#" },
      { name: "whatsapp", url: "#" },
      { name: "messenger", url: "#" },
    ],
    rating: 4.7,
    location: "KZN, Durban North",
    hours: [
      { day: "Monday to Friday", time: "09:00 - 16:00" },
      { day: "Saturdays", time: "08:30 - 14:00" },
      { day: "Sundays", time: "Closed" },
      { day: "Public Holidays", time: "08:30 - 14:00" },
    ],
    description:
      "Welcome to [Company Name], where we specialize in crafting timeless tributes that honor and celebrate the lives of your loved ones. As a premier provider of custom tombstones and memorials, we understand the importance of creating lasting legacies. Our expert craftsmen combine artistic skill with compassionate service to deliver personalized solutions tailored to your unique preferences. Whether you seek a traditional headstone or a modern memorial, we guide you through every step with care and respect. At [Company Name], we're dedicated to preserving memories and helping families find solace through beautifully crafted tributes.",
    promo: "Company Promo 30 Sec. Example Tombstone Co.",
    package: "BRONZE - Premium",
    listingsCount: 20,
  };

  // Demo product listings
  const listings = [
    {
      id: 1,
      price: "R 8 820",
      tag: "Unique Design",
      tagColor: "#e54d26",
      title: "CATHEDRAL C14",
      design: "Full Tombstone | Granite | Cross Theme",
      vendor: "Example Tombstone Co.",
      location: "Durban North, KZN",
      image: "/placeholder.svg",
      thumbnails: ["/placeholder.svg", "/placeholder.svg"],
    },
    {
      id: 2,
      price: "R 18 550",
      tag: "Great Price",
      tagColor: "#28a745",
      title: "BIG BIBLE B12",
      design: "Full Tombstone | Granite | Bible Theme",
      vendor: "Example Tombstone Co.",
      location: "Durban North, KZN",
      image: "/placeholder.svg",
      thumbnails: ["/placeholder.svg", "/placeholder.svg"],
    },
    {
      id: 3,
      price: "R 18 500",
      tag: "Subtle Design",
      tagColor: "#e54d26",
      title: "GOLD MEMORY G14",
      design: "Full Tombstone | Granite | Cross Theme",
      vendor: "Example Tombstone Co.",
      location: "Durban North, KZN",
      image: "/placeholder.svg",
      thumbnails: ["/placeholder.svg", "/placeholder.svg"],
    },
    {
      id: 4,
      price: "R 18 550",
      tag: "Great Price",
      tagColor: "#28a745",
      title: "MARBLE MAGIC M29",
      design: "Full Tombstone | Granite | Cross Theme",
      vendor: "Example Tombstone Co.",
      location: "Durban North, KZN",
      image: "/placeholder.svg",
      thumbnails: ["/placeholder.svg", "/placeholder.svg"],
    },
  ];

  // In the socials vertical list, use the SVGs for each social icon
  const socialIconMap = {
    facebook: '/new files/newIcons/Social Media Icons/Advert Set-Up-03.svg',
    instagram: '/new files/newIcons/Social Media Icons/Advert Set-Up-04.svg',
    youtube: '/new files/newIcons/Social Media Icons/Advert Set-Up-05.svg',
    telegram: '/new files/newIcons/Social Media Icons/Advert Set-Up-06.svg',
    whatsapp: '/new files/newIcons/Social Media Icons/Advert Set-Up-07.svg',
    messenger: '/new files/newIcons/Social Media Icons/Advert Set-Up-07.svg',
    x: '/new files/newIcons/Social Media Icons/Advert Set-Up-06.svg',
  };

  return (
    <div style={{ fontFamily: "Arial, sans-serif", background: "#f9f9f9", minHeight: "100vh", color: "#333" }}>
      {/* Create Listing Button */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 0 0 0", display: "flex", justifyContent: "flex-end" }}>
        <a
          href="/manufacturers/manufacturers-Profile-Page/advert-creator"
          style={{
            background: "#005bac",
            color: "#fff",
            borderRadius: 8,
            padding: "12px 28px",
            fontWeight: 700,
            fontSize: 15,
            textDecoration: "none",
            boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
            transition: "background 0.2s",
            marginBottom: 16,
            display: "inline-block"
          }}
        >
          + Create Listing
        </a>
      </div>

      {/* Header */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e0e0e0", padding: "16px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontWeight: 700, fontSize: 20, letterSpacing: -1 }}>
            Memorial<span style={{ color: "#007bff" }}>Hub</span>
          </span>
          <Link href="#" style={{ color: "#007bff", fontSize: 14, marginLeft: 12 }}>&lt; Return to.</Link>
        </div>
      </div>

      {/* Profile Section - further refined to match new screenshot */}
      <div style={{ background: '#fff', borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.07)', padding: 20, maxWidth: 1200, margin: '24px auto 0 auto', display: 'flex', flexDirection: 'row', gap: 32, alignItems: 'flex-start' }}>
        {/* Left Column */}
        <div style={{ flex: 2, minWidth: 0 }}>
          {/* Company Name Label */}
          <div style={{ fontSize: 11, color: '#888', fontWeight: 700, marginBottom: 2 }}>Company Name</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ fontWeight: 700, fontSize: 18 }}>{manufacturer.name}</span>
            <button style={{ background: 'none', border: 'none', marginLeft: 2, cursor: 'pointer' }}><Edit2 style={{ width: 16, height: 16, color: '#888' }} /></button>
          </div>
          {/* Google Rating Label */}
          <div style={{ fontSize: 11, color: '#888', fontWeight: 700, marginBottom: 2 }}>Google Rating</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ color: '#00baff', fontWeight: 700, fontSize: 16, textDecoration: 'underline', cursor: 'pointer' }}>Current Google Rating: {manufacturer.rating} out of 5</span>
            <button style={{ background: 'none', border: 'none', marginLeft: 2, cursor: 'pointer' }}><Edit2 style={{ width: 16, height: 16, color: '#888' }} /></button>
          </div>
          {/* Store Location Label */}
          <div style={{ fontSize: 11, color: '#888', fontWeight: 700, marginBottom: 2 }}>Store Location</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ color: '#00baff', fontWeight: 700, fontSize: 16, textDecoration: 'underline', cursor: 'pointer' }}>{manufacturer.location}</span>
            <MapPin style={{ display: 'inline', width: 18, height: 18, marginLeft: 2, color: '#00baff' }} />
            <button style={{ background: 'none', border: 'none', marginLeft: 2, cursor: 'pointer' }}><Edit2 style={{ width: 16, height: 16, color: '#888' }} /></button>
          </div>
          {/* Operating Hours Label */}
          <div style={{ fontSize: 11, color: '#888', fontWeight: 700, marginBottom: 2 }}>Operating Hours</div>
          <div style={{ fontSize: 15, margin: '0 0 8px 0', display: 'grid', gridTemplateColumns: 'auto auto', rowGap: 2, columnGap: 16 }}>
            {manufacturer.hours.map((h, i) => (
              <React.Fragment key={i}>
                <div style={{ fontWeight: 700 }}>{h.day}</div>
                <div>{h.time}</div>
              </React.Fragment>
            ))}
            <button style={{ gridColumn: '2/3', justifySelf: 'start', background: 'none', border: 'none', marginLeft: 2, cursor: 'pointer', marginTop: 2 }}><Edit2 style={{ width: 16, height: 16, color: '#888' }} /></button>
          </div>
        </div>
        {/* Right Column - Company Logo */}
        <div style={{ flex: 1, minWidth: 220, alignSelf: 'flex-start', textAlign: 'right' }}>
          <div style={{ fontSize: 11, color: '#888', fontWeight: 700, marginBottom: 2, textAlign: 'left' }}>Company Logo</div>
          <div style={{ border: '2px solid #00baff', borderRadius: 8, background: '#fff', padding: 8, display: 'inline-block', position: 'relative', minWidth: 240, minHeight: 120 }}>
            <Image src={manufacturer.logo} alt="Company Logo" width={220} height={110} style={{ objectFit: 'contain', display: 'block', margin: '0 auto' }} />
            <button style={{ position: 'absolute', bottom: 8, right: 8, background: 'none', border: 'none', cursor: 'pointer' }}><Edit2 style={{ width: 16, height: 16, color: '#888' }} /></button>
          </div>
        </div>
      </div>

      {/* Listings Header */}
      <div style={{ background: "#fff", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #e0e0e0", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ fontSize: 13, color: "#888" }}>
          Current Package: <span style={{ color: "#28a745", fontWeight: 700 }}>{manufacturer.package}</span> &nbsp; <Link href="#" style={{ color: "#007bff", fontWeight: 700 }}>Click here to UPGRADE</Link>
        </div>
        <div style={{ fontSize: 15, fontWeight: 700 }}>{manufacturer.listingsCount} Active Listings</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 13, color: "#888" }}>Sort by:</span>
          <select style={{ fontSize: 13, border: "1px solid #e0e0e0", borderRadius: 4, padding: "2px 8px" }}>
            <option>Price</option>
            <option>Listing Date</option>
          </select>
        </div>
      </div>

      {/* Product Grid */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "16px 8px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          {listings.map((listing) => (
            <div key={listing.id} style={{ background: "#f5f5f5", borderRadius: 4, boxShadow: "0 1px 3px rgba(0,0,0,0.1)", padding: 16, display: "flex", flexDirection: "column", position: "relative" }}>
              <div style={{ position: "absolute", top: 12, left: 12, background: listing.tagColor, color: "#fff", fontSize: 12, fontWeight: 700, padding: "4px 8px", borderRadius: 4 }}>
                {listing.tag}
              </div>
              <div style={{ fontWeight: 700, color: "#007bff", fontSize: 18, marginBottom: 4 }}>{listing.price}</div>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 4 }}>{listing.title}</div>
              <div style={{ fontSize: 13, color: "#888", marginBottom: 4 }}>{listing.design}</div>
              <div style={{ fontSize: 13, color: "#888", marginBottom: 4 }}>{listing.vendor}</div>
              <div style={{ fontSize: 13, color: "#888", marginBottom: 4 }}>
                <MapPin style={{ display: "inline", width: 14, height: 14, marginRight: 4 }} /> {listing.location}
              </div>
              <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
                {listing.thumbnails.map((thumb, i) => (
                  <Image key={i} src={thumb} alt="Thumbnail" width={40} height={40} style={{ borderRadius: 4, border: "1px solid #e0e0e0" }} />
                ))}
              </div>
              <button style={{ position: "absolute", top: 12, right: 12, background: "none", border: "none", color: "#007bff", fontSize: 12, display: "flex", alignItems: "center", gap: 2, cursor: "pointer" }}>
                Edit Advert <Edit2 style={{ width: 14, height: 14, marginLeft: 2 }} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 