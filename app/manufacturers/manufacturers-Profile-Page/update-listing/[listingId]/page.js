"use client";

import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useQuery } from "@apollo/client";
import { GET_LISTING_BY_ID } from '@/graphql/queries/getListingById';
import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

function isMobile() {
  if (typeof window === 'undefined') return false;
  return window.innerWidth <= 768;
}

export default function UpdateListingPage() {
  const { listingId } = useParams();
  const { data: session, status } = useSession();
  const router = useRouter();
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
  
  // Additional product details state
  const [transport, setTransport] = useState("");
  const [foundation, setFoundation] = useState("");
  const [warranty, setWarranty] = useState("");
  const [price, setPrice] = useState("");
  const [flasher, setFlasher] = useState("");
  const [manufacturingTimeframe, setManufacturingTimeframe] = useState("1");
  
  // Loading and success states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [showMessage, setShowMessage] = useState(false);

  const listing = data?.listing;

  // After data is loaded, update state
  useEffect(() => {
    if (listing) {
      setTitle(listing.title || "");
      setDescription(listing.description || "");
      setImages([
        listing.mainImageUrl ? listing.mainImageUrl : null,
        ...(listing.thumbnailUrls || [])
      ]);
      setSelectedStyle((listing.productDetails?.style || []).map(s => s.value));
      setSelectedColour((listing.productDetails?.color || []).map(c => c.value));
      setSelectedStoneType((listing.productDetails?.stoneType || []).map(st => st.value));
      setSelectedCulture((listing.productDetails?.culture || []).map(cu => cu.value));
      setSelectedCustomisation((listing.productDetails?.customization || []).map(cu => cu.value));
      
      // Set additional product details
      setTransport(listing.additionalProductDetails?.transportAndInstallation?.value || "");
      setFoundation(listing.additionalProductDetails?.foundationOptions?.value || "");
      setWarranty(listing.additionalProductDetails?.warrantyOrGuarantee?.value || "");
      setPrice(listing.price?.toString() || "");
      setFlasher(listing.adFlasher || "");
      setManufacturingTimeframe(listing.manufacturingTimeframe || "1");
    }
  }, [listing]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!listing?.documentId) {
      setSubmitMessage("Error: Listing ID not found");
      setShowMessage(true);
      return;
    }

    setIsSubmitting(true);
    setShowMessage(false);

    try {
      const payload = {
        data: {
          title: title, // string
          description: description, // string
          price: parseFloat(price), // number
          adFlasher: flasher, // string
          manufacturingTimeframe: manufacturingTimeframe, // string
          productDetails: {
            color: selectedColour.map(color => ({ value: color })),
            style: selectedStyle.map(style => ({ value: style })),
            stoneType: selectedStoneType.map(stone => ({ value: stone })),
            customization: selectedCustomisation.map(custom => ({ value: custom })),
          },
          additionalProductDetails: {
            transportAndInstallation: transport ? [{ value: transport }] : [],
            foundationOptions: foundation ? [{ value: foundation }] : [],
            warrantyOrGuarantee: warranty ? [{ value: warranty }] : [],
          }
        }
      };
console.log(payload);
      const response = await fetch(`https://balanced-sunrise-2fce1c3d37.strapiapp.com/api/listings/${listing.documentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setSubmitMessage("Listing updated successfully!");
      setShowMessage(true);
      
      // Redirect to profile page after successful update
      setTimeout(() => {
        router.push('/manufacturers/manufacturers-Profile-Page');
      }, 2000);

    } catch (error) {
      console.error('Error updating listing:', error);
      setSubmitMessage(`Error updating listing: ${error.message}`);
      setShowMessage(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckboxChange = (selected, setSelected, value, max) => {
    if (selected.includes(value)) {
      setSelected(selected.filter(x => x !== value));
    } else if (selected.length < max) {
      setSelected([...selected, value]);
    } else {
      setModalMsg(`You can only add ${max} characteristics.`);
      setModalOpen(true);
    }
  };

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
      
      {/* Additional Product Details Content */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 32 }}>
      {/* Transport */}
        <div>
          <label style={{ fontSize: 12, marginBottom: 4, display: "block", fontWeight: 600, color: "#555" }}>Transport & Installation</label>
          <select 
            style={{ 
              width: "100%", 
              border: "1px solid #ccc", 
              borderRadius: 4, 
              padding: "8px 12px", 
              outline: "none",
              fontSize: 13,
              background: "#fff"
            }} 
            value={transport} 
            onChange={e => setTransport(e.target.value)}
          >
            <option value="">Select transport option</option>
            <option value="Free delivery within 50km">Free delivery within 50km</option>
            <option value="Free delivery within 100km">Free delivery within 100km</option>
            <option value="Delivery included in price">Delivery included in price</option>
            <option value="Delivery at additional cost">Delivery at additional cost</option>
            <option value="Self-collection only">Self-collection only</option>
            <option value="Installation included">Installation included</option>
            <option value="Installation at additional cost">Installation at additional cost</option>
          </select>
        </div>
        
        {/* Foundation */}
        <div>
          <label style={{ fontSize: 12, marginBottom: 4, display: "block", fontWeight: 600, color: "#555" }}>Foundation Options</label>
          <select 
            style={{ 
              width: "100%", 
              border: "1px solid #ccc", 
              borderRadius: 4, 
              padding: "8px 12px", 
              outline: "none",
              fontSize: 13,
              background: "#fff"
            }} 
            value={foundation} 
            onChange={e => setFoundation(e.target.value)}
          >
            <option value="">Select foundation option</option>
            <option value="Concrete base included">Concrete base included</option>
            <option value="Concrete base at additional cost">Concrete base at additional cost</option>
            <option value="No foundation provided">No foundation provided</option>
            <option value="Foundation preparation included">Foundation preparation included</option>
            <option value="Site clearing included">Site clearing included</option>
            <option value="Custom foundation design">Custom foundation design</option>
          </select>
        </div>
        
        {/* Warranty */}
        <div>
          <label style={{ fontSize: 12, marginBottom: 4, display: "block", fontWeight: 600, color: "#555" }}>Warranty or Guarantee</label>
          <select 
            style={{ 
              width: "100%", 
              border: "1px solid #ccc", 
              borderRadius: 4, 
              padding: "8px 12px", 
              outline: "none",
              fontSize: 13,
              background: "#fff"
            }} 
            value={warranty} 
            onChange={e => setWarranty(e.target.value)}
          >
            <option value="">Select warranty option</option>
            <option value="1-year warranty">1-year warranty</option>
            <option value="2-year warranty">2-year warranty</option>
            <option value="3-year warranty">3-year warranty</option>
            <option value="5-year warranty">5-year warranty</option>
            <option value="10-year warranty">10-year warranty</option>
            <option value="Lifetime warranty">Lifetime warranty</option>
            <option value="No warranty">No warranty</option>
            <option value="Guarantee against defects">Guarantee against defects</option>
          </select>
        </div>
        
        {/* Price */}
        <div>
          <label style={{ fontSize: 12, marginBottom: 4, display: "block", fontWeight: 600, color: "#555" }}>Price (R)</label>
          <input 
            style={{ 
              width: "100%", 
              border: "1px solid #ccc", 
              borderRadius: 4, 
              padding: "8px 12px", 
              outline: "none",
              fontSize: 13
            }} 
            value={price} 
            onChange={e => setPrice(e.target.value)}
            placeholder="e.g., 8600"
            type="number"
          />
      </div>
       
        {/* Flasher */}
        <div>
          <label style={{ fontSize: 12, marginBottom: 4, display: "block", fontWeight: 600, color: "#555" }}>Ad Flasher</label>
          <select 
            style={{ 
              width: "100%", 
              border: "1px solid #ccc", 
              borderRadius: 4, 
              padding: "8px 12px", 
              outline: "none",
              fontSize: 13,
              background: "#fff"
            }} 
            value={flasher} 
            onChange={e => setFlasher(e.target.value)}
          >
            <option value="">Select ad flasher</option>
            <option value="Special offer">Special offer</option>
            <option value="Limited time deal">Limited time deal</option>
            <option value="New arrival">New arrival</option>
            <option value="Best seller">Best seller</option>
            <option value="Premium quality">Premium quality</option>
            <option value="Handcrafted">Handcrafted</option>
            <option value="Custom design">Custom design</option>
            <option value="Exclusive">Exclusive</option>
            <option value="Trending">Trending</option>
            <option value="Popular choice">Popular choice</option>
          </select>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 32 }}>
        <button 
          type="submit"
          disabled={isSubmitting}
          onClick={handleSubmit}
          style={{
            background: isSubmitting ? "#ccc" : "#005bac",
            color: "#fff",
            padding: "12px 24px",
            borderRadius: 8,
            border: "none",
            cursor: isSubmitting ? "not-allowed" : "pointer",
            fontSize: 14,
            fontWeight: "bold",
            textTransform: "uppercase",
            letterSpacing: 0.5,
            transition: "background-color 0.2s ease"
          }}
          onMouseOver={(e) => !isSubmitting && (e.target.style.background = "#004a8c")}
          onMouseOut={(e) => !isSubmitting && (e.target.style.background = "#005bac")}
        >
          {isSubmitting ? "Updating..." : "Save Changes"}
        </button>
        <button 
          onClick={() => {
            // Reset form to original values
            if (listing) {
              setTitle(listing.title || "");
              setDescription(listing.description || "");
              setTransport(listing.additionalProductDetails?.transportAndInstallation?.value || "");
              setFoundation(listing.additionalProductDetails?.foundationOptions?.value || "");
              setWarranty(listing.additionalProductDetails?.warrantyOrGuarantee?.value || "");
              setPrice(listing.price?.toString() || "");
              setFlasher(listing.adFlasher || "");
              setManufacturingTimeframe(listing.manufacturingTimeframe || "1");
            }
            router.push('/manufacturers/manufacturers-Profile-Page');
          }}
          disabled={isSubmitting}
          style={{
            background: isSubmitting ? "#eee" : "#ccc",
            color: "#333",
            padding: "12px 24px",
            borderRadius: 8,
            border: "none",
            cursor: isSubmitting ? "not-allowed" : "pointer",
            fontSize: 14,
            fontWeight: "bold",
            textTransform: "uppercase",
            letterSpacing: 0.5,
            transition: "background-color 0.2s ease"
          }}
          onMouseOver={(e) => !isSubmitting && (e.target.style.background = "#bbb")}
          onMouseOut={(e) => !isSubmitting && (e.target.style.background = "#ccc")}
        >
          Cancel
        </button>
      </div>

      {/* Success/Error Message */}
      {showMessage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          padding: '16px 24px',
          borderRadius: '8px',
          color: '#fff',
          fontWeight: 'bold',
          zIndex: 1000,
          background: submitMessage.includes('Error') ? '#dc3545' : '#28a745',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          animation: 'slideIn 0.3s ease'
        }}>
          {submitMessage}
        </div>
      )}
    </div>
  );
} 