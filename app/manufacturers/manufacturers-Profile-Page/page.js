"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, MapPin, Edit2, ChevronRight } from "lucide-react";
import { useEffect, useState, useRef } from 'react';
import React from 'react';
import { PremiumListingCard } from "@/components/premium-listing-card";
import { premiumListings } from "@/lib/data";

function isMobile() {
  if (typeof window === 'undefined') return false;
  return window.innerWidth <= 768;
}

export default function ManufacturerProfileEditor({ isOwner = false, manufacturerName, listings }) {
  const [mobile, setMobile] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const sortModalRef = useRef();

  // Set company info based on manufacturerName
  const companyInfo = {
    "Swiss Stone Masons": {
      name: "Swiss Stone Masons",
      logo: "/new files/company logos/Tombstone Manufacturer Logo-SwissStone.svg",
      rating: 4.7,
      location: "KZN, Durban North",
      hours: [
        { day: "Monday to Friday", time: "09:00 - 16:00" },
        { day: "Saturdays", time: "08:30 - 14:00" },
        { day: "Sundays", time: "Closed" },
        { day: "Public Holidays", time: "08:30 - 14:00" },
      ],
      description: "Welcome to Swiss Stone Masons, where we specialize in crafting timeless tributes that honor and celebrate the lives of your loved ones. As a premier provider of custom tombstones and memorials, we understand the importance of creating lasting legacies. Our expert craftsmen combine artistic skill with compassionate service to deliver personalized solutions tailored to your unique preferences. Whether you seek a traditional headstone or a modern memorial, we guide you through every step with care and respect. At Swiss Stone Masons, we're dedicated to preserving memories and helping families find solace through beautifully crafted tributes.",
      promo: "Company Promo 30 Sec. Swiss Stone Masons.",
      website: "www.SwissStoneMasons.com",
    },
    "Acme Inc.": {
      name: "Acme Inc.",
      logo: "/placeholder-logo.svg",
      rating: 4.5,
      location: "Gauteng, Johannesburg",
      hours: [
        { day: "Monday to Friday", time: "08:00 - 17:00" },
        { day: "Saturdays", time: "09:00 - 13:00" },
        { day: "Sundays", time: "Closed" },
        { day: "Public Holidays", time: "09:00 - 13:00" },
      ],
      description: "Welcome to Acme Inc., your trusted partner for innovative memorial solutions. We combine modern technology with traditional craftsmanship to deliver unique, lasting tributes. Our team is dedicated to helping families create meaningful memorials with care and respect.",
      promo: "Company Promo 30 Sec. Acme Inc.",
      website: "www.AcmeInc.com",
    },
  };
  const info = companyInfo[manufacturerName] || companyInfo["Swiss Stone Masons"];

  const [companyName, setCompanyName] = useState(info.name);
  const [companyRating, setCompanyRating] = useState(info.rating);
  const [companyLocation, setCompanyLocation] = useState(info.location);
  const [companyHours, setCompanyHours] = useState(info.hours);
  const [companyDescription, setCompanyDescription] = useState(info.description);
  const [companyPromo, setCompanyPromo] = useState(info.promo);
  const [companyLogo, setCompanyLogo] = useState(info.logo);
  const [companyWebsite, setCompanyWebsite] = useState(info.website);
  const [companySocials, setCompanySocials] = useState([
    { name: "facebook", url: "#" },
    { name: "instagram", url: "#" },
    { name: "youtube", url: "#" },
    { name: "telegram", url: "#" },
    { name: "x", url: "#" },
    { name: "whatsapp", url: "#" },
    { name: "messenger", url: "#" },
  ]);
  const [sortBy, setSortBy] = useState('Price');
  useEffect(() => {
    setMobile(isMobile());
    const handleResize = () => setMobile(isMobile());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  useEffect(() => {
    if (!showSortDropdown) return;
    function handleClick(e) {
      if (sortModalRef.current && !sortModalRef.current.contains(e.target)) {
        setShowSortDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showSortDropdown]);
  if (mobile && isOwner) {
    return (
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
  }

  // Use passed-in listings or fallback to demo
  const filteredListings = listings || [];

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
      {/* Create Listing Button (only for owner) */}
      {isOwner && (
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
      )}

      {/* Combined Profile Card - all info in one card */}
      <div style={{ background: '#fff', borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.07)', padding: 20, maxWidth: 1200, margin: '24px auto 0 auto', display: 'flex', flexDirection: 'row', gap: 32, alignItems: 'flex-start' }}>
        {/* Left Column */}
        <div style={{ flex: 2, minWidth: 0 }}>
          {/* Company Name Label */}
          <div style={{ fontSize: 11, color: '#888', fontWeight: 700, marginBottom: 2 }}>Company Name</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            {editingField === 'name' ? (
              <>
                <input
                  value={editValue}
                  onChange={e => setEditValue(e.target.value)}
                  style={{ fontWeight: 700, fontSize: 18, padding: 2, borderRadius: 4, border: '1px solid #ccc' }}
                />
                <button onClick={() => { setCompanyName(editValue); setEditingField(null); }} style={{ marginLeft: 4, color: '#28a745', fontWeight: 700, border: 'none', background: 'none', cursor: 'pointer' }}>Save</button>
                <button onClick={() => setEditingField(null)} style={{ marginLeft: 2, color: '#888', fontWeight: 700, border: 'none', background: 'none', cursor: 'pointer' }}>Cancel</button>
              </>
            ) : (
              <>
                <span style={{ fontWeight: 700, fontSize: 18 }}>{companyName}</span>
                {isOwner && (
                  <button
                    style={{ background: 'none', border: 'none', marginLeft: 2, cursor: 'pointer' }}
                    onClick={() => { setEditingField('name'); setEditValue(companyName); }}
                  >
                    <Edit2 style={{ width: 16, height: 16, color: '#888' }} />
                  </button>
                )}
              </>
            )}
          </div>
          {/* Google Rating Label */}
          <div style={{ fontSize: 11, color: '#888', fontWeight: 700, marginBottom: 2 }}>Google Rating</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            {editingField === 'rating' ? (
              <>
                <input
                  type="number"
                  value={editValue}
                  onChange={e => setEditValue(e.target.value)}
                  style={{ fontWeight: 700, fontSize: 16, padding: 2, borderRadius: 4, border: '1px solid #ccc', width: 60 }}
                  min={0} max={5} step={0.1}
                />
                <button onClick={() => { setCompanyRating(editValue); setEditingField(null); }} style={{ marginLeft: 4, color: '#28a745', fontWeight: 700, border: 'none', background: 'none', cursor: 'pointer' }}>Save</button>
                <button onClick={() => setEditingField(null)} style={{ marginLeft: 2, color: '#888', fontWeight: 700, border: 'none', background: 'none', cursor: 'pointer' }}>Cancel</button>
              </>
            ) : (
              <>
                <span style={{ color: '#00baff', fontWeight: 700, fontSize: 16, textDecoration: 'underline', cursor: 'pointer' }}>Current Google Rating: {companyRating} out of 5</span>
                {isOwner && (
                  <button
                    style={{ background: 'none', border: 'none', marginLeft: 2, cursor: 'pointer' }}
                    onClick={() => { setEditingField('rating'); setEditValue(companyRating); }}
                  >
                    <Edit2 style={{ width: 16, height: 16, color: '#888' }} />
                  </button>
                )}
              </>
            )}
          </div>
          {/* Store Location Label */}
          <div style={{ fontSize: 11, color: '#888', fontWeight: 700, marginBottom: 2 }}>Store Location</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            {editingField === 'location' ? (
              <>
                <input
                  value={editValue}
                  onChange={e => setEditValue(e.target.value)}
                  style={{ fontWeight: 700, fontSize: 16, padding: 2, borderRadius: 4, border: '1px solid #ccc' }}
                />
                <button onClick={() => { setCompanyLocation(editValue); setEditingField(null); }} style={{ marginLeft: 4, color: '#28a745', fontWeight: 700, border: 'none', background: 'none', cursor: 'pointer' }}>Save</button>
                <button onClick={() => setEditingField(null)} style={{ marginLeft: 2, color: '#888', fontWeight: 700, border: 'none', background: 'none', cursor: 'pointer' }}>Cancel</button>
              </>
            ) : (
              <>
                <span style={{ color: '#00baff', fontWeight: 700, fontSize: 16, textDecoration: 'underline', cursor: 'pointer' }}>{companyLocation}</span>
            <MapPin style={{ display: 'inline', width: 18, height: 18, marginLeft: 2, color: '#00baff' }} />
                {isOwner && (
                  <button
                    style={{ background: 'none', border: 'none', marginLeft: 2, cursor: 'pointer' }}
                    onClick={() => { setEditingField('location'); setEditValue(companyLocation); }}
                  >
                    <Edit2 style={{ width: 16, height: 16, color: '#888' }} />
                  </button>
                )}
              </>
            )}
          </div>
          {/* Operating Hours Label */}
          <div style={{ fontSize: 11, color: '#888', fontWeight: 700, marginBottom: 2 }}>Operating Hours</div>
          <div style={{ fontSize: 15, margin: '0 0 8px 0', display: 'grid', gridTemplateColumns: 'auto auto', rowGap: 2, columnGap: 16 }}>
            {companyHours.map((h, i) => (
              isOwner && editingField === `hours-${i}` ? (
                <React.Fragment key={i}>
                  <input
                    value={editValue}
                    onChange={e => setEditValue(e.target.value)}
                    style={{ fontWeight: 700, padding: 2, borderRadius: 4, border: '1px solid #ccc' }}
                  />
                  <button onClick={() => {
                    const newHours = [...companyHours];
                    newHours[i].time = editValue;
                    setCompanyHours(newHours);
                    setEditingField(null);
                  }} style={{ marginLeft: 4, color: '#28a745', fontWeight: 700, border: 'none', background: 'none', cursor: 'pointer' }}>Save</button>
                  <button onClick={() => setEditingField(null)} style={{ marginLeft: 2, color: '#888', fontWeight: 700, border: 'none', background: 'none', cursor: 'pointer' }}>Cancel</button>
                </React.Fragment>
              ) : (
                <React.Fragment key={i}>
                  <div style={{ fontWeight: 700 }}>{h.day}</div>
                  <div>{h.time}</div>
                  {isOwner && (
                    <button style={{ gridColumn: '2/3', justifySelf: 'start', background: 'none', border: 'none', marginLeft: 2, cursor: 'pointer', marginTop: 2 }} onClick={() => { setEditingField(`hours-${i}`); setEditValue(h.time); }}><Edit2 style={{ width: 16, height: 16, color: '#888' }} /></button>
                  )}
                </React.Fragment>
              )
            ))}
          </div>
          {/* Company Profile Label */}
          <div style={{ fontSize: 11, color: '#888', fontWeight: 700, marginBottom: 2 }}>Company Profile</div>
          <div style={{ border: '1px solid #e0e0e0', borderRadius: 8, background: '#fafbfc', padding: 14, fontSize: 15, marginBottom: 8, position: 'relative' }}>
            {editingField === 'description' ? (
              <>
                <textarea
                  value={editValue}
                  onChange={e => setEditValue(e.target.value)}
                  style={{ width: '100%', minHeight: 60, fontSize: 15, padding: 4, borderRadius: 4, border: '1px solid #ccc' }}
                />
                <button onClick={() => { setCompanyDescription(editValue); setEditingField(null); }} style={{ marginLeft: 4, color: '#28a745', fontWeight: 700, border: 'none', background: 'none', cursor: 'pointer' }}>Save</button>
                <button onClick={() => setEditingField(null)} style={{ marginLeft: 2, color: '#888', fontWeight: 700, border: 'none', background: 'none', cursor: 'pointer' }}>Cancel</button>
              </>
            ) : (
              <>
                <span>{companyDescription}</span>
                {isOwner && (
                  <button style={{ position: 'absolute', top: 8, right: 8, background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => { setEditingField('description'); setEditValue(companyDescription); }}><Edit2 style={{ width: 16, height: 16, color: '#888' }} /></button>
                )}
              </>
            )}
          </div>
          {/* Promo Label */}
          <div style={{ fontSize: 11, color: '#888', fontWeight: 700, marginBottom: 2 }}>Company Promo 30 Second Video - Only valid for Premium Customers</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            {editingField === 'promo' ? (
              <>
                <input
                  value={editValue}
                  onChange={e => setEditValue(e.target.value)}
                  style={{ fontSize: 15, padding: 2, borderRadius: 4, border: '1px solid #ccc' }}
                />
                <button onClick={() => { setCompanyPromo(editValue); setEditingField(null); }} style={{ marginLeft: 4, color: '#28a745', fontWeight: 700, border: 'none', background: 'none', cursor: 'pointer' }}>Save</button>
                <button onClick={() => setEditingField(null)} style={{ marginLeft: 2, color: '#888', fontWeight: 700, border: 'none', background: 'none', cursor: 'pointer' }}>Cancel</button>
              </>
            ) : (
              <>
                <div style={{ background: '#f5f5f5', border: '1px solid #e0e0e0', borderRadius: 20, padding: '4px 16px', fontSize: 15, color: '#333', display: 'inline-block' }}>{companyPromo}</div>
                {isOwner && (
                  <button style={{ background: 'none', border: 'none', marginLeft: 2, cursor: 'pointer' }} onClick={() => { setEditingField('promo'); setEditValue(companyPromo); }}><Edit2 style={{ width: 16, height: 16, color: '#888' }} /></button>
                )}
              </>
            )}
          </div>
        </div>
        {/* Right Column */}
        <div style={{ flex: 1, minWidth: 220, alignSelf: 'flex-start', textAlign: mobile ? 'left' : 'right', paddingLeft: mobile ? 8 : undefined, boxSizing: 'border-box' }}>
          <div style={{ fontSize: 11, color: '#888', fontWeight: 700, marginBottom: 6, textAlign: 'center', width: '100%' }}>Company Logo</div>
          <div style={{ border: '2px solid #00baff', borderRadius: 8, background: '#fff', padding: 8, display: 'inline-block', position: 'relative', minWidth: 240, minHeight: 120, marginBottom: 16 }}>
            <Image src={companyLogo} alt="Company Logo" width={220} height={110} style={{ objectFit: 'contain', display: 'block', margin: '0 auto' }} />
            {editingField === 'logo' ? (
              <>
                <input
                  value={editValue}
                  onChange={e => setEditValue(e.target.value)}
                  style={{ fontSize: 13, padding: 2, borderRadius: 4, border: '1px solid #ccc', width: '80%' }}
                  placeholder="Logo URL"
                />
                <button onClick={() => { setCompanyLogo(editValue); setEditingField(null); }} style={{ marginLeft: 4, color: '#28a745', fontWeight: 700, border: 'none', background: 'none', cursor: 'pointer' }}>Save</button>
                <button onClick={() => setEditingField(null)} style={{ marginLeft: 2, color: '#888', fontWeight: 700, border: 'none', background: 'none', cursor: 'pointer' }}>Cancel</button>
              </>
            ) : (
              isOwner && (
                <button style={{ position: 'absolute', bottom: 8, right: 8, background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => { setEditingField('logo'); setEditValue(companyLogo); }}><Edit2 style={{ width: 16, height: 16, color: '#888' }} /></button>
              )
            )}
          </div>
          {/* Website with edit */}
          <div id="website-row" style={{ fontSize: 13, marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}>
            {editingField === 'website' ? (
              <>
                <input
                  value={editValue}
                  onChange={e => setEditValue(e.target.value)}
                  style={{ fontSize: 15, padding: 2, borderRadius: 4, border: '1px solid #ccc', width: '70%' }}
                />
                <button onClick={() => { setCompanyWebsite(editValue); setEditingField(null); }} style={{ marginLeft: 4, color: '#28a745', fontWeight: 700, border: 'none', background: 'none', cursor: 'pointer' }}>Save</button>
                <button onClick={() => setEditingField(null)} style={{ marginLeft: 2, color: '#888', fontWeight: 700, border: 'none', background: 'none', cursor: 'pointer' }}>Cancel</button>
              </>
            ) : (
              <>
                <Link href="#" style={{ color: '#00baff', textDecoration: 'underline', fontWeight: 700, fontSize: 15 }}>{companyWebsite}</Link>
                {isOwner && (
                  <button style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => { setEditingField('website'); setEditValue(companyWebsite); }}><Edit2 style={{ width: 16, height: 16, color: '#888' }} /></button>
                )}
              </>
            )}
          </div>
          {/* Socials label */}
          <div style={{ fontSize: 11, color: '#888', fontWeight: 700, marginBottom: 2, marginLeft: 80, textAlign: 'left' }}>Company Social Media Links</div>
          {/* Socials vertical list with icons and edit */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: 4,
              width: '100%',
              marginLeft: 80,
              paddingLeft: 0,
            }}
          >
            {companySocials.map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%' }}>
                <span style={{ width: 18, height: 18, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Image src={socialIconMap[s.name] || ''} alt={s.name} width={18} height={18} />
                </span>
                {editingField === `social-${i}` ? (
                  <>
                    <input
                      value={editValue}
                      onChange={e => setEditValue(e.target.value)}
                      style={{ fontSize: 15, padding: 2, borderRadius: 4, border: '1px solid #ccc', minWidth: 70 }}
                    />
                    <button onClick={() => {
                      const newSocials = [...companySocials];
                      newSocials[i].url = editValue;
                      setCompanySocials(newSocials);
                      setEditingField(null);
                    }} style={{ marginLeft: 4, color: '#28a745', fontWeight: 700, border: 'none', background: 'none', cursor: 'pointer' }}>Save</button>
                    <button onClick={() => setEditingField(null)} style={{ marginLeft: 2, color: '#888', fontWeight: 700, border: 'none', background: 'none', cursor: 'pointer' }}>Cancel</button>
                  </>
                ) : (
                  <>
                    <Link href={s.url} style={{ color: '#00baff', fontSize: 15, fontWeight: 700, textDecoration: 'underline', display: 'inline-block', minWidth: 70 }}>{s.name.replace('_', ' ')}</Link>
                    {isOwner && (
                      <button style={{ background: 'none', border: 'none', cursor: 'pointer', marginLeft: '16' }} onClick={() => { setEditingField(`social-${i}`); setEditValue(s.url); }}><Edit2 style={{ width: 14, height: 14, color: '#888', marginLeft: 24, textAlign: 'right:18' }} /></button>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Listings Header */}
      <div style={{ background: "#fff", padding: "12px 16px ", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #e0e0e0", maxWidth: 1200, margin: "32px auto 28px auto" }}>
        <div style={{ fontSize: 13, color: "#888" }}>
          Current Package: <span style={{ color: "#28a745", fontWeight: 700 }}>Premium</span> &nbsp; <Link href="#" style={{ color: "#007bff", fontWeight: 700 }}>Click here to UPGRADE</Link>
        </div>
        <div style={{ fontSize: 15, fontWeight: 700 }}>{filteredListings.length} Active Listings</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Mobile Sort Button */}
          <div className="sm:hidden flex items-center text-blue-600 font-semibold cursor-pointer select-none" onClick={() => setShowSortDropdown(!showSortDropdown)}>
            <span className="mr-1">Sort</span>
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5" stroke="#2196f3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          {/* Mobile Sort Modal */}
          {showSortDropdown && (
            <div className="fixed inset-0 z-50 flex items-end justify-center bg-black bg-opacity-40 sm:hidden">
              <div ref={sortModalRef} className="w-full max-w-md mx-auto rounded-t-2xl bg-[#232323] p-4 pb-8 animate-slide-in-up">
                {["Price", "Listing Date"].map(option => (
                  <div
                    key={option}
                    className={`flex items-center justify-between px-2 py-4 text-lg border-b border-[#333] last:border-b-0 cursor-pointer ${sortBy === option ? 'text-white font-bold' : 'text-gray-200'}`}
                    onClick={() => { setSortBy(option); setShowSortDropdown(false); }}
                  >
                    <span>{option}</span>
                    <span className={`ml-2 w-6 h-6 flex items-center justify-center rounded-full border-2 ${sortBy === option ? 'border-blue-500' : 'border-gray-500'}`}
                          style={{ background: sortBy === option ? '#2196f3' : 'transparent' }}>
                      {sortBy === option && <span className="block w-3 h-3 bg-white rounded-full"></span>}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {/* Desktop Sort Dropdown */}
          <div className="hidden sm:flex items-center">
            <span style={{ fontSize: 13, color: "#888" }}>Sort by:</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              style={{ fontSize: 13, border: "1px solid #e0e0e0", borderRadius: 4, padding: "2px 8px" }}
            >
              <option value="Price">Price</option>
              <option value="Listing Date">Listing Date</option>
            </select>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, maxWidth: 1200, margin: '0 auto', alignItems: 'stretch' }}>
        {filteredListings
          .sort((a, b) => {
            if (sortBy === 'Price') {
              const priceA = parseFloat((a.price || '').replace(/[^\d.]/g, ''));
              const priceB = parseFloat((b.price || '').replace(/[^\d.]/g, ''));
              return priceA - priceB;
            }
            return 0;
          })
          .map((listing, idx) => (
            <div key={listing.id} style={{ width: '100%', height: '100%' }}>
              <PremiumListingCard listing={listing} isFirstCard={idx === 0} href={`/tombstones-for-sale/${listing.id}`} />
            </div>
          ))}
      </div>
    </div>
  );
} 