"use client";

import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useQuery } from "@apollo/client";
import { GET_LISTING_BY_ID } from '@/graphql/queries/getListingById';
import { useState, useEffect } from "react";
import Image from "next/image";

function isMobile() {
  if (typeof window === 'undefined') return false;
  return window.innerWidth <= 768;
}

export default function UpdateListingPage() {
  const { listingId } = useParams();
  const { data: session, status } = useSession();
  const { data, loading, error } = useQuery(GET_LISTING_BY_ID, {
    variables: { documentID: listingId },
    skip: !listingId,
  });

  // Always call hooks at the top
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState(Array(11).fill(null));
  const [selectedStyle, setSelectedStyle] = useState([]);
  const [selectedColour, setSelectedColour] = useState([]);
  const [selectedStoneType, setSelectedStoneType] = useState([]);
  const [selectedCulture, setSelectedCulture] = useState([]);
  const [selectedCustomisation, setSelectedCustomisation] = useState([]);
  const [modalMsg, setModalMsg] = useState("");
  const [modalOpen, setModalOpen] = useState(false);

  const listing = data?.listing;

  // After data is loaded, update state
  useEffect(() => {
    if (listing) {
      setTitle(listing.title || "");
      setDescription(listing.description || "");
      setImages([
        listing.mainImage?.url ? listing.mainImage.url : null,
        ...(listing.thumbnails?.map(t => t.url) || [])
      ]);
      setSelectedStyle((listing.productDetails?.style || []).map(s => s.value));
      setSelectedColour((listing.productDetails?.color || []).map(c => c.value));
      setSelectedStoneType((listing.productDetails?.stoneType || []).map(st => st.value));
      setSelectedCulture((listing.productDetails?.culture || []).map(cu => cu.value));
      setSelectedCustomisation((listing.productDetails?.customization || []).map(cu => cu.value));
      // ...set other fields here...
    }
  }, [listing]);

  if (status === "loading") return <div>Loading session...</div>;
  if (!session) return <div>You must be logged in to update a listing.</div>;
  if (loading) return <div>Loading listing data...</div>;
  if (error) return <div>Error loading listing data.</div>;
  if (!listing) return <div>Listing not found.</div>;

  // ...rest of your component (form, UI, etc.)...

  return (
    <div style={{
      maxWidth: 1000,
      margin: "40px auto",
      background: "#f8f8f8",
      padding: 24,
      borderRadius: 16,
      fontFamily: "Arial, sans-serif",
      color: "#333",
    }}>
      {/* Return Link */}
      <div style={{ maxWidth: 1000, margin: "0 auto 8px auto", paddingLeft: 4 }}>
        <a href="/manufacturers/manufacturers-Profile-Page" style={{ color: "#005bac", fontSize: 13, textDecoration: "underline", display: "inline-flex", alignItems: "center" }}>
          <span style={{ fontSize: 18, marginRight: 4 }}>&lt;</span> Return to Profile Page & Listings.
        </a>
      </div>
      {/* Header */}
      <div style={{
        background: "#005bac",
        color: "#fff",
        fontWeight: "bold",
        fontSize: 18,
        padding: 16,
        textAlign: "center",
        borderRadius: 12,
        marginBottom: 32,
        textTransform: "uppercase",
        letterSpacing: 1,
      }}>
        UPDATE LISTING
      </div>
      {/* Note */}
      <div style={{ maxWidth: 1000, margin: "0 auto 8px auto", display: "flex", justifyContent: "flex-end" }}>
        <span style={{ fontSize: 12, color: "#888" }}>All fields are required for updating a listing.</span>
      </div>
      {/* Product Name, Description & Images Section Header */}
      <div style={{ background: "#ededed", fontWeight: 700, fontSize: 13, padding: "6px 12px", marginBottom: 0, letterSpacing: 0.5 }}>
        PRODUCT NAME, DESCRIPTION & IMAGES
      </div>
      <div style={{ height: 12 }} />
      {/* Product Name, Description & Images Content */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 32, marginBottom: 32 }}>
        {/* Left: Name & Description */}
        <div>
          <label style={{ fontSize: 12, marginBottom: 4, display: "block" }}>Product Name</label>
          <input style={{ width: "100%", border: "1px solid #ccc", borderRadius: 4, padding: "8px 12px", outline: "none", marginBottom: 16 }} value={title} onChange={e => setTitle(e.target.value)} />
          <label style={{ fontSize: 12, marginBottom: 4, display: "block" }}>Product Description</label>
          <textarea style={{ width: "100%", border: "1px solid #ccc", borderRadius: 4, padding: "8px 12px", outline: "none", minHeight: 80 }} value={description} onChange={e => setDescription(e.target.value)} />
        </div>
        {/* Right: Images */}
        <div>
          <label style={{ fontSize: 12, marginBottom: 4, display: "block" }}>Product Images</label>
          <div style={{ display: "flex", gap: 12 }}>
            <div>
              <div style={{ fontSize: 11, color: "#888", marginBottom: 2 }}>Main Image</div>
              <div
                style={{
                  width: 96,
                  height: 96,
                  border: "2px solid #ccc",
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "#fafbfc",
                  cursor: "pointer",
                  position: "relative",
                  marginBottom: 4,
                }}
                onClick={() => document.getElementById(`img-upload-main`).click()}
              >
                {images[0] ? (
                  <img src={images[0]} alt="Main" style={{ width: 88, height: 88, borderRadius: 8 }} />
                ) : (
                  <span style={{ color: "#bbb", fontSize: 36, fontWeight: 700 }}>+</span>
                )}
                <input
                  id={`img-upload-main`}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={e => {
                    const newImages = [...images];
                    newImages[0] = URL.createObjectURL(e.target.files[0]);
                    setImages(newImages);
                  }}
                />
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: "#888", marginBottom: 2 }}>Additional Images only for PREMIUM Packages</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
                {[1,2,3,4,5,6,7,8,9,10].map((idx) => (
                  <div
                    key={idx}
                    style={{
                      width: 48,
                      height: 48,
                      border: "2px solid #ccc",
                      borderRadius: 8,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "#fafbfc",
                      cursor: "pointer",
                      position: "relative",
                    }}
                    onClick={() => document.getElementById(`img-upload-${idx}`).click()}
                  >
                    {images[idx] ? (
                      <img src={images[idx]} alt="" style={{ width: 40, height: 40, borderRadius: 8 }} />
                    ) : (
                      <span style={{ color: "#bbb", fontSize: 22, fontWeight: 700 }}>+</span>
                    )}
                    <input
                      id={`img-upload-${idx}`}
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={e => {
                        const newImages = [...images];
                        newImages[idx] = URL.createObjectURL(e.target.files[0]);
                        setImages(newImages);
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Product Details Section Header */}
      <div style={{ background: "#ededed", fontWeight: 700, fontSize: 13, padding: "6px 12px ", marginBottom: 0, letterSpacing: 0.5, display: 'flex', alignItems: 'center' }}>
        <span style={{ marginRight: 8 }}>PRODUCT DETAILS</span>
      </div>
      <div style={{ height: 12 }} />
      {/* Product Details Grid with Icons */}
      {(() => {
        // Options
        const styleOptions = ["Christian Cross", "Heart", "Bible", "Pillars", "Traditional African", "Abstract", "Praying Hands", "Scroll", "Angel", "Mausoleum", "Obelisk", "Plain", "Teddy Bear", "Butterfly", "Car", "Bike", "Sports"];
        const colourOptions = ["Black", "Grey", "White", "Red", "Blue", "Mixed"];
        const stoneTypeOptions = ["Granite", "Marble", "Concrete", "Sandstone", "Limestone", "Bronze", "Quartz", "Glass", "Mixed"];
        const cultureOptions = ["Christian", "Jewish", "Muslim", "Hindu", "Traditional African", "Any"];
        const customisationOptions = ["Photo Engraving", "Photo Etching", "Gold Leaf", "Leather Finish", "Engraving", "Special Shape", "Lighting"];

        function handleCheckboxChange(selected, setSelected, value, max) {
          if (selected.includes(value)) {
            setSelected(selected.filter(x => x !== value));
          } else if (selected.length < max) {
            setSelected([...selected, value]);
          } else {
            setModalMsg(`You can only add ${max} characteristics.`);
            setModalOpen(true);
          }
        }

        return (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 24, marginBottom: 32 }}>
            {/* STYLE */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
                <Image src="/new files/newIcons/Styles_Icons/Styles_Icons-11.svg" alt="Style" width={18} height={18} style={{ marginRight: 6 }} />
                Style
              </div>
              {styleOptions.map((s) => (
                <label key={s} style={{ display: "block", fontSize: 13, marginBottom: 6 }}>
                  <input
                    type="checkbox"
                    checked={selectedStyle.includes(s)}
                    onChange={() => handleCheckboxChange(selectedStyle, setSelectedStyle, s, 2)}
                    style={{ marginRight: 6 }}
                  />
                  {s}
                </label>
              ))}
            </div>
            {/* COLOUR */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
                <Image src="/new files/newIcons/Colour_Icons/Colour_Icons-28.svg" alt="Colour" width={18} height={18} style={{ marginRight: 6 }} />
                Colour
              </div>
              {colourOptions.map((c) => (
                <label key={c} style={{ display: "block", fontSize: 13, marginBottom: 6 }}>
                  <input
                    type="checkbox"
                    checked={selectedColour.includes(c)}
                    onChange={() => handleCheckboxChange(selectedColour, setSelectedColour, c, 2)}
                    style={{ marginRight: 6 }}
                  />
                  {c}
                </label>
              ))}
            </div>
            {/* STONE TYPE */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
                <Image src="/new files/newIcons/Material_Icons/Material_Icons-39.svg" alt="Stone Type" width={18} height={18} style={{ marginRight: 6 }} />
                Stone Type
              </div>
              {stoneTypeOptions.map((st) => (
                <label key={st} style={{ display: "block", fontSize: 13, marginBottom: 6 }}>
                  <input
                    type="checkbox"
                    checked={selectedStoneType.includes(st)}
                    onChange={() => handleCheckboxChange(selectedStoneType, setSelectedStoneType, st, 2)}
                    style={{ marginRight: 6 }}
                  />
                  {st}
                </label>
              ))}
            </div>
            {/* CULTURE */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
                <Image src="/new files/newIcons/Culture_Icons/Culture_Icons-48.svg" alt="Culture" width={18} height={18} style={{ marginRight: 6 }} />
                Culture
              </div>
              {cultureOptions.map((cu) => (
                <label key={cu} style={{ display: "block", fontSize: 13, marginBottom: 6 }}>
                  <input
                    type="checkbox"
                    checked={selectedCulture.includes(cu)}
                    onChange={() => handleCheckboxChange(selectedCulture, setSelectedCulture, cu, 2)}
                    style={{ marginRight: 6 }}
                  />
                  {cu}
                </label>
              ))}
            </div>
            {/* CUSTOMISATION */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
                <Image src="/new files/newIcons/Custom_Icons/Custom_Icons-54.svg" alt="Customisation" width={18} height={18} style={{ marginRight: 6 }} />
                Customisation
              </div>
              {customisationOptions.map((cu) => (
                <label key={cu} style={{ display: "block", fontSize: 13, marginBottom: 6 }}>
                  <input
                    type="checkbox"
                    checked={selectedCustomisation.includes(cu)}
                    onChange={() => handleCheckboxChange(selectedCustomisation, setSelectedCustomisation, cu, 2)}
                    style={{ marginRight: 6 }}
                  />
                  {cu}
                </label>
              ))}
            </div>
            {/* Modal for max selection warning */}
            {modalOpen && (
              <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.3)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ background: '#fff', borderRadius: 12, padding: 32, minWidth: 260, boxShadow: '0 2px 16px rgba(0,0,0,0.18)', textAlign: 'center' }}>
                  <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 16 }}>{modalMsg}</div>
                  <button onClick={() => setModalOpen(false)} style={{ background: '#005bac', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 24px', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>OK</button>
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* Additional Product Details Section Header */}
      <div style={{ background: "#ededed", fontWeight: 700, fontSize: 13, padding: "6px 12px ", marginBottom: 0, letterSpacing: 0.5, display: 'flex', alignItems: 'center' }}>
        <span style={{ marginRight: 8 }}>ADDITIONAL PRODUCT DETAILS</span>
      </div>
      <div style={{ height: 12 }} />
      {/* ...repeat the logic for transport, foundation, warranty, pre-filling from listing.additionalProductDetails... */}
      {/* Transport */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <span style={{ fontSize: 12, marginRight: 8, color: "#555" }}>Transport:</span>
          <input style={{ width: "100%", border: "1px solid #ccc", borderRadius: 4, padding: "8px 12px", outline: "none" }} value={listing.additionalProductDetails?.transport || ""} onChange={e => {
            const newDetails = { ...listing.additionalProductDetails, transport: e.target.value };
            // This part of the logic needs to be updated to handle the full additionalProductDetails object
            // For now, we'll just update the state, which will be reflected in the next render
            // setListing(prev => ({ ...prev, additionalProductDetails: newDetails }));
          }} />
        </div>
        {/* Foundation */}
        <div style={{ display: "flex", alignItems: "center" }}>
          <span style={{ fontSize: 12, marginRight: 8, color: "#555" }}>Foundation:</span>
          <input style={{ width: "100%", border: "1px solid #ccc", borderRadius: 4, padding: "8px 12px", outline: "none" }} value={listing.additionalProductDetails?.foundation || ""} onChange={e => {
            const newDetails = { ...listing.additionalProductDetails, foundation: e.target.value };
            // This part of the logic needs to be updated to handle the full additionalProductDetails object
            // For now, we'll just update the state, which will be reflected in the next render
            // setListing(prev => ({ ...prev, additionalProductDetails: newDetails }));
          }} />
        </div>
        {/* Warranty */}
        <div style={{ display: "flex", alignItems: "center" }}>
          <span style={{ fontSize: 12, marginRight: 8, color: "#555" }}>Warranty:</span>
          <input style={{ width: "100%", border: "1px solid #ccc", borderRadius: 4, padding: "8px 12px", outline: "none" }} value={listing.additionalProductDetails?.warranty || ""} onChange={e => {
            const newDetails = { ...listing.additionalProductDetails, warranty: e.target.value };
            // This part of the logic needs to be updated to handle the full additionalProductDetails object
            // For now, we'll just update the state, which will be reflected in the next render
            // setListing(prev => ({ ...prev, additionalProductDetails: newDetails }));
          }} />
        </div>
      </div>

      {/* Pricing, Discount, Flasher, Dates, and Action Buttons */}
      {/* Pricing */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <span style={{ fontSize: 12, marginRight: 8, color: "#555" }}>Price:</span>
          <input style={{ width: "100%", border: "1px solid #ccc", borderRadius: 4, padding: "8px 12px", outline: "none" }} value={listing.price || ""} onChange={e => {
            // This part of the logic needs to be updated to handle the full listing object
            // For now, we'll just update the state, which will be reflected in the next render
            // setListing(prev => ({ ...prev, price: e.target.value }));
          }} />
        </div>
        {/* Discount */}
        <div style={{ display: "flex", alignItems: "center" }}>
          <span style={{ fontSize: 12, marginRight: 8, color: "#555" }}>Discount:</span>
          <input style={{ width: "100%", border: "1px solid #ccc", borderRadius: 4, padding: "8px 12px", outline: "none" }} value={listing.discount || ""} onChange={e => {
            // This part of the logic needs to be updated to handle the full listing object
            // For now, we'll just update the state, which will be reflected in the next render
            // setListing(prev => ({ ...prev, discount: e.target.value }));
          }} />
        </div>
        {/* Flasher */}
        <div style={{ display: "flex", alignItems: "center" }}>
          <span style={{ fontSize: 12, marginRight: 8, color: "#555" }}>Flasher:</span>
          <input style={{ width: "100%", border: "1px solid #ccc", borderRadius: 4, padding: "8px 12px", outline: "none" }} value={listing.flasher || ""} onChange={e => {
            // This part of the logic needs to be updated to handle the full listing object
            // For now, we'll just update the state, which will be reflected in the next render
            // setListing(prev => ({ ...prev, flasher: e.target.value }));
          }} />
        </div>
        {/* Dates */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <span style={{ fontSize: 12, marginRight: 8, color: "#555" }}>Start Date:</span>
            <input style={{ width: "100%", border: "1px solid #ccc", borderRadius: 4, padding: "8px 12px", outline: "none" }} value={listing.startDate || ""} onChange={e => {
              // This part of the logic needs to be updated to handle the full listing object
              // For now, we'll just update the state, which will be reflected in the next render
              // setListing(prev => ({ ...prev, startDate: e.target.value }));
            }} />
          </div>
          <div style={{ display: "flex", alignItems: "center" }}>
            <span style={{ fontSize: 12, marginRight: 8, color: "#555" }}>End Date:</span>
            <input style={{ width: "100%", border: "1px solid #ccc", borderRadius: 4, padding: "8px 12px", outline: "none" }} value={listing.endDate || ""} onChange={e => {
              // This part of the logic needs to be updated to handle the full listing object
              // For now, we'll just update the state, which will be reflected in the next render
              // setListing(prev => ({ ...prev, endDate: e.target.value }));
            }} />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
        <button style={{
          background: "#005bac",
          color: "#fff",
          padding: "10px 20px",
          borderRadius: 8,
          border: "none",
          cursor: "pointer",
          fontSize: 14,
          fontWeight: "bold",
          textTransform: "uppercase",
          letterSpacing: 0.5,
        }}>
          Save Changes
        </button>
        <button style={{
          background: "#ccc",
          color: "#333",
          padding: "10px 20px",
          borderRadius: 8,
          border: "none",
          cursor: "pointer",
          fontSize: 14,
          fontWeight: "bold",
          textTransform: "uppercase",
          letterSpacing: 0.5,
        }}>
          Cancel
        </button>
      </div>
    </div>
  );
} 