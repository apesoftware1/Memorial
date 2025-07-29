import Image from "next/image";
import Link from "next/link";
import { Star, MapPin, Edit2 } from "lucide-react";
import React, { useState, useEffect, useRef } from 'react';
import { PremiumListingCard } from "@/components/premium-listing-card";
import Header from "@/components/Header";
import ViewInquiriesModal from '@/components/ViewInquiriesModal';
import CreateSpecialModal from '@/components/CreateSpecialModal';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu'
// import { useManufacturerLocation } from '@/hooks/useManufacturerLocation'
// import ManufacturerLocationModal from '@/components/ManufacturerLocationModal';

// SVG Settings (gear) icon component
const SettingsIcon = (props) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path fillRule="evenodd" clipRule="evenodd" d="M14.2788 2.15224C13.9085 2 13.439 2 12.5 2C11.561 2 11.0915 2 10.7212 2.15224C10.2274 2.35523 9.83509 2.74458 9.63056 3.23463C9.53719 3.45834 9.50065 3.7185 9.48635 4.09799C9.46534 4.65568 9.17716 5.17189 8.69017 5.45093C8.20318 5.72996 7.60864 5.71954 7.11149 5.45876C6.77318 5.2813 6.52789 5.18262 6.28599 5.15102C5.75609 5.08178 5.22018 5.22429 4.79616 5.5472C4.47814 5.78938 4.24339 6.1929 3.7739 6.99993C3.30441 7.80697 3.06967 8.21048 3.01735 8.60491C2.94758 9.1308 3.09118 9.66266 3.41655 10.0835C3.56506 10.2756 3.77377 10.437 4.0977 10.639C4.57391 10.936 4.88032 11.4419 4.88029 12C4.88026 12.5581 4.57386 13.0639 4.0977 13.3608C3.77372 13.5629 3.56497 13.7244 3.41645 13.9165C3.09108 14.3373 2.94749 14.8691 3.01725 15.395C3.06957 15.7894 3.30432 16.193 3.7738 17C4.24329 17.807 4.47804 18.2106 4.79606 18.4527C5.22008 18.7756 5.75599 18.9181 6.28589 18.8489C6.52778 18.8173 6.77305 18.7186 7.11133 18.5412C7.60852 18.2804 8.2031 18.27 8.69012 18.549C9.17714 18.8281 9.46533 19.3443 9.48635 19.9021C9.50065 20.2815 9.53719 20.5417 9.63056 20.7654C9.83509 21.2554 10.2274 21.6448 10.7212 21.8478C11.0915 22 11.561 22 12.5 22C13.439 22 13.9085 22 14.2788 21.8478C14.7726 21.6448 15.1649 21.2554 15.3694 20.7654C15.4628 20.5417 15.4994 20.2815 15.5137 19.902C15.5347 19.3443 15.8228 18.8281 16.3098 18.549C16.7968 18.2699 17.3914 18.2804 17.8886 18.5412C18.2269 18.7186 18.4721 18.8172 18.714 18.8488C19.2439 18.9181 19.7798 18.7756 20.2038 18.4527C20.5219 18.2105 20.7566 17.807 21.2261 16.9999C21.6956 16.1929 21.9303 15.7894 21.9827 15.395C22.0524 14.8691 21.9088 14.3372 21.5835 13.9164C21.4349 13.7243 21.2262 13.5628 20.9022 13.3608C20.4261 13.0639 20.1197 12.558 20.1197 11.9999C20.1197 11.4418 20.4261 10.9361 20.9022 10.6392C21.2263 10.4371 21.435 10.2757 21.5836 10.0835C21.9089 9.66273 22.0525 9.13087 21.9828 8.60497C21.9304 8.21055 21.6957 7.80703 21.2262 7C20.7567 6.19297 20.522 5.78945 20.2039 5.54727C19.7799 5.22436 19.244 5.08185 18.7141 5.15109C18.4722 5.18269 18.2269 5.28136 17.8887 5.4588C17.3915 5.71959 16.7969 5.73002 16.3099 5.45096C15.8229 5.17191 15.5347 4.65566 15.5136 4.09794C15.4993 3.71848 15.4628 3.45833 15.3694 3.23463C15.1649 2.74458 14.7726 2.35523 14.2788 2.15224ZM12.5 15C14.1695 15 15.5228 13.6569 15.5228 12C15.5228 10.3431 14.1695 9 12.5 9C10.8305 9 9.47716 10.3431 9.47716 12C9.47716 13.6569 10.8305 15 12.5 15Z" fill="#fff"/>
  </svg>
);

function isMobile() {
  if (typeof window === 'undefined') return false;
  return window.innerWidth <= 768;
}

// Helper to parse price as number from string or number
function parsePrice(val) {
  if (typeof val === "number") return val;
  if (typeof val === "string") {
    const num = Number(val.replace(/[^\d.]/g, ""));
    return isNaN(num) ? 0 : num;
  }
  return 0;
}

export default function ManufacturerProfileEditor({ isOwner, company: initialCompany, listings }) {
  const [mobile, setMobile] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const sortModalRef = useRef();
  const [sortBy, setSortBy] = useState('Price');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [createSpecialModalOpen, setCreateSpecialModalOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);
  const [viewInquiriesModalOpen, setViewInquiriesModalOpen] = useState(false);
  
  // Company state management
  const [company, setCompany] = useState(initialCompany);
  
  // Update company state when initialCompany changes
  useEffect(() => {
    setCompany(initialCompany);
  }, [initialCompany]);
  
  // Default value for isLocationSet since the hook is commented out
  const isLocationSet = company?.latitude && company?.longitude;
  
  // Default values for location modal functions since the hook is commented out
  const showLocationModal = false;
  const openLocationModal = () => {};
  const closeLocationModal = () => {};
  const handleLocationUpdate = () => {};
  
  // Location check hook with company update callback
  // const {
  //   showLocationModal,
  //   openLocationModal,
  //   closeLocationModal,
  //   handleLocationUpdate,
  //   isLocationSet
  // } = useManufacturerLocation(company, (updatedCompany) => {
  //   // Update the company state with the new location data
  //   setCompany(updatedCompany);
  // });

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

  if (!company) return <div>No company data found.</div>;

  // Convert operating hours from GraphQL structure to display format
  const operatingHours = company.operatingHours ? [
    { day: "Monday to Friday", time: company.operatingHours.monToFri || "09:00 - 16:00" },
    { day: "Saturdays", time: company.operatingHours.saturday || "08:30 - 14:00" },
    { day: "Sundays", time: company.operatingHours.sunday || "Closed" },
    { day: "Public Holidays", time: company.operatingHours.publicHoliday || "08:30 - 14:00" },
  ] : [];

  // Convert social links from GraphQL structure to display format
  const socialLinks = company.socialLinks ? [
    { name: "facebook", url: company.socialLinks.facebook || "#" },
    { name: "instagram", url: company.socialLinks.instagram || "#" },
    { name: "youtube", url: company.socialLinks.youtube || "#" },
    { name: "telegram", url: "#" },
    { name: "x", url: company.socialLinks.x || "#" },
    { name: "whatsapp", url: company.socialLinks.whatsapp || "#" },
    { name: "messenger", url: company.socialLinks.messenger || "#" },
  ].filter(social => social.url !== "#") : [];

  // Social icon map
  const socialIconMap = {
    facebook: '/new files/newIcons/Social Media Icons/Advert Set-Up-03.svg',
    instagram: '/new files/newIcons/Social Media Icons/Advert Set-Up-04.svg',
    youtube: '/new files/newIcons/Social Media Icons/Advert Set-Up-05.svg',
    telegram: '/new files/newIcons/Social Media Icons/Advert Set-Up-06.svg',
    whatsapp: '/new files/newIcons/Social Media Icons/Advert Set-Up-07.svg',
    messenger: '/new files/newIcons/Social Media Icons/Advert Set-Up-07.svg',
    x: '/new files/newIcons/Social Media Icons/Advert Set-Up-06.svg',
  };

  const companyListings = listings || [];

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

  const handleDelete = async (documentId) => {
    try {
      const res = await fetch(`https://balanced-sunrise-2fce1c3d37.strapiapp.com/api/listings/${documentId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          // If using JWT:
          // Authorization: Bearer ${yourToken},
        },
      });
  
      if (!res.ok) {
        throw new Error("Failed to delete listing");
      }
  
      // Only parse JSON if response has content
      const text = await res.text();
      const data = text ? JSON.parse(text) : null;
  
      console.log("Deleted:", data);
      alert("Listing deleted successfully.");
  
      // Optional: refresh listings, update state, navigate, etc.
    } catch (error) {
      console.error("Error deleting listing:", error);
      alert("Failed to delete listing.");
    }
  };

  return (
    <>
      <Header showLogout={isOwner} />
      <div style={{ fontFamily: "Arial, sans-serif", background: "#f9f9f9", minHeight: "100vh", color: "#333" }}>
        {/* Create Listing Button (only for owner) */}
        {isOwner && (
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 0 0 0", display: "flex", justifyContent: "flex-end" }}>
            <a
              href={`/manufacturers/manufacturers-Profile-Page/advert-creator?companyDocumentId=${company.documentId}`}
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
                  <button onClick={() => { /* save logic here */ setEditingField(null); }} style={{ marginLeft: 4, color: '#28a745', fontWeight: 700, border: 'none', background: 'none', cursor: 'pointer' }}>Save</button>
                  <button onClick={() => setEditingField(null)} style={{ marginLeft: 2, color: '#888', fontWeight: 700, border: 'none', background: 'none', cursor: 'pointer' }}>Cancel</button>
                </>
              ) : (
                <>
                  <span style={{ fontWeight: 700, fontSize: 18 }}>{company.name}</span>
                  {isOwner && (
                    <button
                      style={{ background: 'none', border: 'none', marginLeft: 2, cursor: 'pointer' }}
                      onClick={() => { setEditingField('name'); setEditValue(company.name); }}
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
              <span style={{ color: '#00baff', fontWeight: 700, fontSize: 16, textDecoration: 'underline', cursor: 'pointer' }}>Current Google Rating: {company.googleRating || 'N/A'} out of 5</span>
            </div>
            {isOwner && (
              <button style={{ background: 'none', border: 'none', marginLeft: 2, cursor: 'pointer' }}>
                <Edit2 style={{ width: 16, height: 16, color: '#888' }} />
              </button>
            )}
            {/* Store Location Label */}
            <div style={{ fontSize: 11, color: '#888', fontWeight: 700, marginBottom: 2 }}>Store Location</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span 
                style={{ 
                  color: isLocationSet ? '#00baff' : '#ff6b6b', 
                  fontWeight: 700, 
                  fontSize: 16, 
                  textDecoration: 'underline', 
                  cursor: 'pointer' 
                }}
                onClick={isOwner ? openLocationModal : undefined}
                title={isOwner ? 'Click to update store location' : undefined}
              >
                {company.location || 'Location not set'}
              </span>
              <MapPin style={{ display: 'inline', width: 18, height: 18, marginLeft: 2, color: isLocationSet ? '#00baff' : '#ff6b6b' }} />
            </div>
            {isOwner && (
              <button 
                style={{ background: 'none', border: 'none', marginLeft: 2, cursor: 'pointer' }}
                onClick={openLocationModal}
              >
                <Edit2 style={{ width: 16, height: 16, color: '#888' }} />
              </button>
            )}
            {/* Operating Hours Label */}
            <div style={{ fontSize: 11, color: '#888', fontWeight: 700, marginBottom: 2 }}>Operating Hours</div>
            <div style={{ fontSize: 15, margin: '0 0 8px 0', display: 'grid', gridTemplateColumns: 'auto auto', rowGap: 2, columnGap: 16 }}>
              {operatingHours.map((h, i) => (
                <React.Fragment key={i}>
                  <div style={{ fontWeight: 700 }}>{h.day}</div>
                  <div>{h.time}</div>
                </React.Fragment>
              ))}
            </div>
            {isOwner && (
              <button style={{ background: 'none', border: 'none', marginLeft: 2, cursor: 'pointer' }}>
                <Edit2 style={{ width: 16, height: 16, color: '#888' }} />
              </button>
            )}
            {/* Company Profile Label */}
            <div style={{ fontSize: 11, color: '#888', fontWeight: 700, marginBottom: 2 }}>Company Profile</div>
            <div style={{ border: '1px solid #e0e0e0', borderRadius: 8, background: '#fafbfc', padding: 14, fontSize: 15, marginBottom: 8 }}>
              <span>{company.description}</span>
            </div>
            {isOwner && (
              <button style={{ background: 'none', border: 'none', marginLeft: 2, cursor: 'pointer' }}>
                <Edit2 style={{ width: 16, height: 16, color: '#888' }} />
              </button>
            )}
            {/* Promo Label */}
            <div style={{ fontSize: 11, color: '#888', fontWeight: 700, marginBottom: 2 }}>Company Promo 30 Second Video - Only valid for Premium Customers</div>
            <div style={{ background: '#f5f5f5', border: '1px solid #e0e0e0', borderRadius: 20, padding: '4px 16px', fontSize: 15, color: '#333', display: 'inline-block' }}>{company.promo || 'Company Promo 30 Sec.'}</div>
            {isOwner && (
              <button style={{ background: 'none', border: 'none', marginLeft: 2, cursor: 'pointer' }}>
                <Edit2 style={{ width: 16, height: 16, color: '#888' }} />
              </button>
            )}
          </div>
          {/* Right Column */}
          <div style={{ flex: 1, minWidth: 220, alignSelf: 'flex-start', textAlign: mobile ? 'left' : 'right', paddingLeft: mobile ? 8 : undefined, boxSizing: 'border-box' }}>
            <div style={{ fontSize: 11, color: '#888', fontWeight: 700, marginBottom: 6, textAlign: 'center', width: '100%' }}>Company Logo</div>
            <div style={{ border: '2px solid #00baff', borderRadius: 8, background: '#fff', padding: 8, display: 'inline-block', position: 'relative', minWidth: 240, minHeight: 120, marginBottom: 16 }}>
              <Image src={company.logo?.url || '/placeholder-logo.svg'} alt="Company Logo" width={220} height={110} style={{ objectFit: 'contain', display: 'block', margin: '0 auto' }} />
            </div>
            {isOwner && (
              <button style={{ background: 'none', border: 'none', marginLeft: 2, cursor: 'pointer' }}>
                <Edit2 style={{ width: 16, height: 16, color: '#888' }} />
              </button>
            )}
            {/* Website */}
            <div id="website-row" style={{ fontSize: 13, marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}>
              <Link href={company.socialLinks?.website || "#"} style={{ color: '#00baff', textDecoration: 'underline', fontWeight: 700, fontSize: 15 }}>{company.socialLinks?.website || 'www.company.com'}</Link>
            </div>
            {isOwner && (
              <button style={{ background: 'none', border: 'none', marginLeft: 2, cursor: 'pointer' }}>
                <Edit2 style={{ width: 16, height: 16, color: '#888' }} />
              </button>
            )}
            {/* Socials label */}
            <div style={{ fontSize: 11, color: '#888', fontWeight: 700, marginBottom: 2, marginLeft: 80, textAlign: 'left' }}>Company Social Media Links</div>
            {/* Socials vertical list with icons */}
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
              {socialLinks.map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%' }}>
                  <span style={{ width: 18, height: 18, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Image src={socialIconMap[s.name] || ''} alt={s.name} width={18} height={18} />
                  </span>
                  <Link href={s.url} style={{ color: '#00baff', fontSize: 15, fontWeight: 700, textDecoration: 'underline', display: 'inline-block', minWidth: 70 }}>{s.name.replace('_', ' ')}</Link>
                </div>
              ))}
            </div>
            {isOwner && (
              <button style={{ background: 'none', border: 'none', marginLeft: 2, cursor: 'pointer' }}>
                <Edit2 style={{ width: 16, height: 16, color: '#888' }} />
              </button>
            )}
          </div>
        </div>

        {/* Listings Header */}
        <div style={{ background: "#fff", padding: "12px 16px ", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #e0e0e0", maxWidth: 1200, margin: "32px auto 28px auto" }}>
          <div style={{ fontSize: 13, color: "#888" }}>
            Current Package: <span style={{ color: "#28a745", fontWeight: 700 }}>{company.packageType || 'Premium'}</span> &nbsp; <Link href="#" style={{ color: "#007bff", fontWeight: 700 }}>Click here to UPGRADE</Link>
          </div>
          <div style={{ fontSize: 15, fontWeight: 700 }}>{companyListings.length} Active Listings</div>
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
          {[...companyListings]
            .sort((a, b) => {
              if (sortBy === 'Price') {
                return parsePrice(a.price) - parsePrice(b.price);
              }
              if (sortBy === 'Listing Date') {
                // Use createdAt as the listing date field, ascending order (oldest first)
                return new Date(a.createdAt) - new Date(b.createdAt);
              }
              return 0;
            })
            .map((listing, idx) => (
              <div key={listing.documentId || listing.id} style={{ width: '100%', height: '100%', position: 'relative' }}>
                <PremiumListingCard 
                  listing={{
                    ...listing,
                    company: {
                      name: company.name,
                      logo: company.logo
                    },
                    manufacturer: company.name,
                    location: company.location,
                    distance: '5km away',
                    enquiries: listing.inquiries?.length || 0
                  }} 
                  isFirstCard={idx === 0} 
                  href={`/tombstones-for-sale/${listing.documentId || listing.id}`}
                  isOwner={isOwner}
                />
                {isOwner && (
                  <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 2 }}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button style={{ background: '#005bac', border: 'none', borderRadius: 6, padding: '6px 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                          <SettingsIcon />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => window.location.href = `/manufacturers/manufacturers-Profile-Page/update-listing/${listing.documentId || listing.id}`}>Edit Listing</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setViewInquiriesModalOpen(true)}>View Inquiries</DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            if (
                              window.confirm(
                                "Are you sure you want to delete this listing? This action cannot be undone."
                              )
                            ) {
                              handleDelete(listing.documentId);
                            }
                          }}
                        >
                          Delete Listing
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          setSelectedListing(listing);
                          setCreateSpecialModalOpen(true);
                        }}>
                          Create Special
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
              </div>
            ))}
        </div>
        {/* Create Special Modal */}
        <CreateSpecialModal
          isOpen={createSpecialModalOpen}
          onClose={() => {
            setCreateSpecialModalOpen(false);
            setSelectedListing(null);
          }}
          listing={selectedListing}
        />

        {/* View Inquiries Modal */}
        <ViewInquiriesModal
          open={viewInquiriesModalOpen}
          onClose={() => setViewInquiriesModalOpen(false)}
          listings={companyListings}
        />

        {/* Manufacturer Location Modal */}
        {/* <ManufacturerLocationModal
          isOpen={showLocationModal}
          onClose={closeLocationModal}
          company={company}
          onLocationUpdate={handleLocationUpdate}
        /> */}

        {/* Floating View All Inquiries Button */}
        {isOwner && (
          <button
            onClick={() => setViewInquiriesModalOpen(true)}
            style={{
              position: 'fixed',
              bottom: '30px',
              right: '30px',
              background: "#005bac",
              color: "#fff",
              borderRadius: "25px",
              padding: "15px 25px",
              fontWeight: 700,
              fontSize: 14,
              border: "none",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(0,91,172,0.3)",
              transition: "all 0.2s ease",
              zIndex: 1000
            }}
            onMouseOver={(e) => {
              e.target.style.background = "#004a8c";
              e.target.style.transform = "scale(1.05)";
            }}
            onMouseOut={(e) => {
              e.target.style.background = "#005bac";
              e.target.style.transform = "scale(1)";
            }}
          >
            View All Inquiries
          </button>
        )}
      </div>
    </>
  );
} 