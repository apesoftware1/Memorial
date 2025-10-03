"use client";

import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useQuery } from "@apollo/client";
import React, { useState, useEffect, useMemo } from 'react';
import { GET_LISTING_BY_ID } from '@/graphql/queries/getListingById';
import Image from "next/image";
import { useRouter } from "next/navigation";
import { uploadToCloudinary } from "@/lib/cloudinary"; // moved from bottom to top
import pricingAdFlasher from '../../../../../pricingAdFlasher.json';

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
  // Product Details state
  const [selectedStyle, setSelectedStyle] = useState([]);
  const [selectedColour, setSelectedColour] = useState([]);
  const [selectedStoneType, setSelectedStoneType] = useState([]);
  const [selectedCulture, setSelectedCulture] = useState([]);
  const [selectedCustomisation, setSelectedCustomisation] = useState([]);
  const [selectedSlabStyle, setSelectedSlabStyle] = useState([]);
  const [modalMsg, setModalMsg] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  
  // Additional product details state (arrays to match Advert Creator)
  const [selectedTransport, setSelectedTransport] = useState([]);
  const [selectedFoundation, setSelectedFoundation] = useState([]);
  const [selectedWarranty, setSelectedWarranty] = useState([]);
  const [price, setPrice] = useState("");
  const [flasher, setFlasher] = useState("");
  const [manufacturingTimeframe, setManufacturingTimeframe] = useState("1");

  // Manufacturing Lead Time options and helpers
  const manufacturingLeadTimeOptions = [1, 2, 3, 7, 10, 14, 21];
  const formatManufacturingLeadTimeText = (days) => {
    if (days === 1) return "X1 WORKING DAY AFTER POP (Proof of Payment)";
    return `X${days} WORKING DAYS AFTER POP (Proof of Payment)`;
  };
  const handleManufacturingLeadTimeToggle = (days) => {
    const str = String(days);
    setManufacturingTimeframe((prev) => (prev === str ? "" : str));
  };

  // PRICING & ADFLASHER state and helpers (added)
  const [expandedAdFlasherCategory, setExpandedAdFlasherCategory] = useState(null);
  const [badgeCategoryKey, setBadgeCategoryKey] = useState(null);

  const PRICING_ADFLASHER = pricingAdFlasher?.PRICING_ADFLASHER || {};
  const adFlasherOptionsMap = PRICING_ADFLASHER?.AD_FLASHER || {};
  const priceRuleText = PRICING_ADFLASHER?.PRICE_RULE || "";

  const selectedAdFlasherCategoryKey = useMemo(() => {
    if (!flasher) return null;
    for (const [cat, cfg] of Object.entries(adFlasherOptionsMap)) {
      const options = Array.isArray(cfg) ? cfg : (cfg?.options || []);
      if (options.includes(flasher)) return cat;
    }
    return null;
  }, [flasher, adFlasherOptionsMap]);

  const effectiveAdFlasherCategoryKey = useMemo(() => {
    return badgeCategoryKey || selectedAdFlasherCategoryKey;
  }, [badgeCategoryKey, selectedAdFlasherCategoryKey]);

  const selectedAdFlasherColor = useMemo(() => {
    if (!effectiveAdFlasherCategoryKey) return "#005bac";
    const cfg = adFlasherOptionsMap[effectiveAdFlasherCategoryKey];
    if (cfg && !Array.isArray(cfg) && cfg.color) return cfg.color;
    if (Array.isArray(cfg) && cfg.color) return cfg.color;
    return "#005bac";
  }, [effectiveAdFlasherCategoryKey, adFlasherOptionsMap]);

  const handleToggleAdFlasherCategory = (category) => {
    setExpandedAdFlasherCategory((prev) => (prev === category ? null : category));
    setBadgeCategoryKey(category);
  };

  const handleSelectAdFlasher = (category, option) => {
    setFlasher(option);
    setExpandedAdFlasherCategory(category);
    setBadgeCategoryKey(category);
  };

  const handlePriceChange = (e) => {
    // allow digits and a single dot; limit to 2 decimals
    const raw = e.target.value.replace(/[^0-9.]/g, "");
    const parts = raw.split(".");
    let normalized = parts[0];
    if (parts.length > 1) {
      normalized += "." + parts[1].slice(0, 2);
    }
    setPrice(normalized);
  };

  const handlePriceBlur = () => {
    if (price === "") return;
    const num = Number(price);
    if (!Number.isNaN(num)) {
      setPrice(num.toFixed(2));
    }
  };

  // Loading and success states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [showMessage, setShowMessage] = useState(false);

  // Moved these two hooks up here (unconditional)
  const [imageFiles, setImageFiles] = useState(Array(11).fill(null));
  const [existingPublicIds, setExistingPublicIds] = useState({ main: null, thumbs: [] });

  const listing = data?.listing;

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
      setSelectedSlabStyle((listing.productDetails?.slabStyle || []).map(s => s.value));

      // Set additional product details (arrays)
      setSelectedTransport((listing.additionalProductDetails?.transportAndInstallation || []).map(o => o.value));
      setSelectedFoundation((listing.additionalProductDetails?.foundationOptions || []).map(o => o.value));
      setSelectedWarranty((listing.additionalProductDetails?.warrantyOrGuarantee || []).map(o => o.value));
      setPrice(listing.price?.toString() || "");
      setFlasher(listing.adFlasher || "");
      setManufacturingTimeframe(listing.manufacturingTimeframe || "1");

      setExistingPublicIds({
        main: listing?.mainImagePublicId || null,
        thumbs: Array.isArray(listing?.thumbnailPublicIds) ? listing.thumbnailPublicIds : [],
      });
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
      const folderName = listing?.company?.name || undefined;

      // detect replacements
      const replacingMain = Boolean(imageFiles[0]);
      const thumbFilesToUpload = [];
      for (let idx = 1; idx <= 5; idx++) {
        if (imageFiles[idx]) thumbFilesToUpload.push({ idx, file: imageFiles[idx] });
      }

      // Main image (upload if replacing)
      let mainImageUrl = listing?.mainImageUrl || null;
      let mainImagePublicId = existingPublicIds.main || null;
      if (replacingMain) {
        const uploaded = await uploadToCloudinary(imageFiles[0], folderName);
        mainImageUrl = uploaded?.url || uploaded?.secure_url || mainImageUrl;
        mainImagePublicId = uploaded?.public_id || mainImagePublicId;
      }

      // Thumbnails (upload if any replacement provided)
      const finalThumbUrls = [];
      const finalThumbPublicIds = [];
      if (thumbFilesToUpload.length > 0) {
        const uploadedThumbs = await Promise.all(
          thumbFilesToUpload.map(({ file }) => uploadToCloudinary(file, folderName))
        );
        uploadedThumbs.forEach(u => {
          if (u?.url || u?.secure_url) {
            finalThumbUrls.push(u.url || u.secure_url);
            finalThumbPublicIds.push(u.public_id || null);
          }
        });
      } else {
        // keep existing if none supplied
        (Array.isArray(listing?.thumbnailUrls) ? listing.thumbnailUrls : []).forEach(u => finalThumbUrls.push(u));
        (Array.isArray(listing?.thumbnailPublicIds) ? listing.thumbnailPublicIds : []).forEach(pid => finalThumbPublicIds.push(pid));
      }

      const payload = {
        data: {
          title,
          description,
          price: parseFloat(price),
          adFlasher: flasher,
          adFlasherColor: selectedAdFlasherColor, // NEW: persist color on update
          manufacturingTimeframe: manufacturingTimeframe,
          mainImageUrl: mainImageUrl || null,
          mainImagePublicId: mainImagePublicId || null,
          thumbnailUrls: finalThumbUrls,
          thumbnailPublicIds: finalThumbPublicIds,
          productDetails: {
            color: selectedColour.map((value) => ({
              value,
              icon: getIconPath('color', value),
            })),
            style: selectedStyle.map((value) => ({
              value,
              icon: getIconPath('style', value),
            })),
            slabStyle: selectedSlabStyle.map((value) => ({
              value,
              icon: getIconPath('slabStyle', value),
            })),
            stoneType: selectedStoneType.map((value) => ({
              value,
              icon: getIconPath('stoneType', value),
            })),
            customization: selectedCustomisation.map((value) => ({
              value,
              icon: getIconPath('customization', value),
            })),
          },
          additionalProductDetails: {
            transportAndInstallation: selectedTransport.map((value) => ({ value })),
            foundationOptions: selectedFoundation.map((value) => ({ value })),
            warrantyOrGuarantee: selectedWarranty.map((value) => ({ value })),
          }
        }
      };

      const response = await fetch(`https://typical-car-e0b66549b3.strapiapp.com/api/listings/${listing.documentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Cleanup old Cloudinary assets only if they were replaced
      try {
        const publicIdsToDelete = [];
        if (replacingMain && existingPublicIds.main) {
          publicIdsToDelete.push(existingPublicIds.main);
        }
        if (thumbFilesToUpload.length > 0 && Array.isArray(existingPublicIds.thumbs) && existingPublicIds.thumbs.length) {
          publicIdsToDelete.push(...existingPublicIds.thumbs);
        }
        if (publicIdsToDelete.length > 0) {
          await fetch('/api/cloudinary/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ publicIds: publicIdsToDelete }),
          });
        }
      } catch (cleanupErr) {
        console.warn('Cloudinary cleanup failed:', cleanupErr);
      }

      const result = await response.json();
      setSubmitMessage("Listing updated successfully!");
      setShowMessage(true);
      setTimeout(() => {
        router.push('/manufacturers/manufacturers-Profile-Page');
      }, 2000);

    } catch (error) {
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
  
  // Function to get the appropriate icon path for each attribute
  const getIconPath = (type, value) => {
    // Base path for icons
    const basePath = "/last_icons";
    
    // Map of icon paths by type and value
    const iconPaths = {
      color: {
        "Black": `${basePath}/AdvertCreator_Colour_Icons/6_Colour_Icons/Colour_Icon_Black.svg`,
        "White": `${basePath}/AdvertCreator_Colour_Icons/6_Colour_Icons/Colour_Icon_White.svg`,
        "Grey": `${basePath}/AdvertCreator_Colour_Icons/6_Colour_Icons/Colour_Icon_Grey-Dark.svg`,
        "Light Grey": `${basePath}/AdvertCreator_Colour_Icons/6_Colour_Icons/Colour_Icon_Grey-Light.svg`,
        "Brown": `${basePath}/AdvertCreator_Colour_Icons/6_Colour_Icons/Colour_Icon_Maroon.svg`,
        "Red": `${basePath}/AdvertCreator_Colour_Icons/6_Colour_Icons/Colour_Icon_Red.svg`,
        "Blue": `${basePath}/AdvertCreator_Colour_Icons/6_Colour_Icons/Colour_Icon_Blue.svg`,
        "Green": `${basePath}/AdvertCreator_Colour_Icons/6_Colour_Icons/Colour_Icon_Green.svg`,
        "Multi-colored": `${basePath}/AdvertCreator_Colour_Icons/6_Colour_Icons/Colour_Icon_Mixed.svg`,
        "Pearl": `${basePath}/AdvertCreator_Colour_Icons/6_Colour_Icons/Colour_Icon_Pearl.svg`,
      },
      style: {
        "Modern": `${basePath}/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_Plain.svg`,
        "Traditional": `${basePath}/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_Traditional.svg`,
        "Classic": `${basePath}/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_Plain.svg`,
        "Contemporary": `${basePath}/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_Abstract.svg`,
        "Minimalist": `${basePath}/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_Plain.svg`,
        "Ornate": `${basePath}/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_Scroll.svg`,
        "Religious": `${basePath}/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_ChristianCross.svg`,
        "Cultural": `${basePath}/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_TraditionalAfrican.svg`,
        "Heart": `${basePath}/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_Heart.svg`,
        "Angel": `${basePath}/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_Angel.svg`,
        "Bible": `${basePath}/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_Bible.svg`,
        "Praying Hands": `${basePath}/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_PrayingHands.svg`,
      },
      stoneType: {
        "Granite": `${basePath}/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Granite.svg`,
        "Marble": `${basePath}/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Marble.svg`,
        "Bronze": `${basePath}/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Brass.svg`,
        "Slate": `${basePath}/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Slate.svg`,
        "Limestone": `${basePath}/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Limestone.svg`,
        "Sandstone": `${basePath}/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Sandstone.svg`,
        "Concrete": `${basePath}/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Concrete.svg`,
        "Glass": `${basePath}/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Glass.svg`,
        "Wood": `${basePath}/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Wood.svg`,
        "Composite": `${basePath}/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Composite.svg`,
        "Ceramic": `${basePath}/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Ceramic_Porcelain.svg`,
        "Steel": `${basePath}/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Steel.svg`,
        "Stone": `${basePath}/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Stone.svg`,
        "Other": `${basePath}/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Stone.svg`,
      },
      slabStyle: {
        "Flat": `${basePath}/AdvertCreator_SlabStyle_Icons/AdvertCreator_SlabStyle_Icons/AdvertCreator_SlabStyle_Icons_FullSlab.svg`,
        "Slant": `${basePath}/AdvertCreator_SlabStyle_Icons/AdvertCreator_SlabStyle_Icons/AdvertCreator_SlabStyle_Icons_Stepped.svg`,
        "Bevel": `${basePath}/AdvertCreator_SlabStyle_Icons/AdvertCreator_SlabStyle_Icons/AdvertCreator_SlabStyle_Icons_FullSlab.svg`,
        "Pillow": `${basePath}/AdvertCreator_SlabStyle_Icons/AdvertCreator_SlabStyle_Icons/AdvertCreator_SlabStyle_Icons_FullSlab.svg`,
        "Sculpted": `${basePath}/AdvertCreator_SlabStyle_Icons/AdvertCreator_SlabStyle_Icons/AdvertCreator_SlabStyle_Icons_FullSlab.svg`,
        "Curved": `${basePath}/AdvertCreator_SlabStyle_Icons/AdvertCreator_SlabStyle_Icons/AdvertCreator_SlabStyle_Icons_CurvedSlab.svg`,
        "Composite": `${basePath}/AdvertCreator_SlabStyle_Icons/AdvertCreator_SlabStyle_Icons/AdvertCreator_SlabStyle_Icons_FramewithInfill.svg`,
        "Custom": `${basePath}/AdvertCreator_SlabStyle_Icons/AdvertCreator_SlabStyle_Icons/AdvertCreator_SlabStyle_Icons_FullSlab.svg`,
        "Half Slab": `${basePath}/AdvertCreator_SlabStyle_Icons/AdvertCreator_SlabStyle_Icons/AdvertCreator_SlabStyle_Icons_HalfSlab.svg`,
        "Glass Slab": `${basePath}/AdvertCreator_SlabStyle_Icons/AdvertCreator_SlabStyle_Icons/AdvertCreator_SlabStyle_Icons_GlassSlab.svg`,
        "Tiled": `${basePath}/AdvertCreator_SlabStyle_Icons/AdvertCreator_SlabStyle_Icons/AdvertCreator_SlabStyle_Icons_Tiled.svg`,
      },
      customization: {
        "Engraving": `${basePath}/AdvertCreator_Icons_Customisation_Icons/AdvertCreator_Icons_Customisation_Icons/AdvertCreator_Customisation_Icon_GoldLettering.svg`,
        "Etching": `${basePath}/AdvertCreator_Icons_Customisation_Icons/AdvertCreator_Icons_Customisation_Icons/AdvertCreator_Customisation_Icon_PhotoLaserEdginhg.svg`,
        "Carving": `${basePath}/AdvertCreator_Icons_Customisation_Icons/AdvertCreator_Icons_Customisation_Icons/AdvertCreator_Customisation_Icon_PhotoLaserEdginhg.svg`,
        "Inlay": `${basePath}/AdvertCreator_Icons_Customisation_Icons/AdvertCreator_Icons_Customisation_Icons/AdvertCreator_Customisation_Icon_InlaidGlass.svg`,
        "Photo": `${basePath}/AdvertCreator_Icons_Customisation_Icons/AdvertCreator_Icons_Customisation_Icons/AdvertCreator_Customisation_Icon_CeramicPhotoPlaque.svg`,
        "Laser": `${basePath}/AdvertCreator_Icons_Customisation_Icons/AdvertCreator_Icons_Customisation_Icons/AdvertCreator_Customisation_Icon_PhotoLaserEdginhg.svg`,
        "Plaque": `${basePath}/AdvertCreator_Icons_Customisation_Icons/AdvertCreator_Icons_Customisation_Icons/AdvertCreator_Customisation_Icon_BronzeStainless Plaque.svg`,
        "QR Code": `${basePath}/AdvertCreator_Icons_Customisation_Icons/AdvertCreator_Icons_Customisation_Icons/AdvertCreator_Customisation_Icon_QR Code.svg`,
        "Flower Vase": `${basePath}/AdvertCreator_Icons_Customisation_Icons/AdvertCreator_Icons_Customisation_Icons/AdvertCreator_Customisation_Icon_FlowerVase.svg`,
        "None": `${basePath}/AdvertCreator_Icons_Customisation_Icons/AdvertCreator_Icons_Customisation_Icons/AdvertCreator_Customisation_Icon_GoldLettering.svg`,
      },
      culture: {
        "Christian": `${basePath}/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_ChristianCross.svg`,
        "Jewish": `${basePath}/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_Plain.svg`,
        "Islamic": `${basePath}/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_Plain.svg`,
        "Buddhist": `${basePath}/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_Plain.svg`,
        "Hindu": `${basePath}/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_Plain.svg`,
        "Secular": `${basePath}/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_Plain.svg`,
        "African": `${basePath}/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_TraditionalAfrican.svg`,
        "Other": `${basePath}/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_Plain.svg`,
      }
    };
    
    // Return the icon path if it exists, otherwise return a default icon
    return iconPaths[type]?.[value] || `${basePath}/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_Plain.svg`;
  };

  if (status === "loading") return <div>Loading session...</div>;
  if (!session) return <div>You must be logged in to update a listing.</div>;
  if (loading) return <div>Loading listing data...</div>;
  if (error) return <div>Error loading listing data.</div>;
  if (!listing) return <div>Listing not found.</div>;

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
                    const file = e.target.files?.[0];
                    if (!file) return;

                    const newImages = [...images];
                    newImages[0] = URL.createObjectURL(file);
                    setImages(newImages);

                    const newFiles = [...imageFiles];
                    newFiles[0] = file;
                    setImageFiles(newFiles);
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
                      background: idx > 5 ? "#e0e0e0" : "#fafbfc",
                      cursor: idx > 5 ? "not-allowed" : "pointer",
                      position: "relative",
                      opacity: idx > 5 ? 0.6 : 1,
                    }}
                    onClick={() => idx <= 5 && document.getElementById(`img-upload-${idx}`).click()}
                  >
                    {images[idx] ? (
                      <img src={images[idx]} alt="" style={{ width: 40, height: 40, borderRadius: 8 }} />
                    ) : (
                      <span style={{ color: idx > 5 ? "#999" : "#bbb", fontSize: 22, fontWeight: 700 }}>
                        {idx > 5 ? "×" : "+"}
                      </span>
                    )}
                    <input
                      id={`img-upload-${idx}`}
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={e => {
                        if (idx <= 5) {
                          const file = e.target.files?.[0];
                          if (!file) return;

                          const newImages = [...images];
                          newImages[idx] = URL.createObjectURL(file);
                          setImages(newImages);

                          const newFiles = [...imageFiles];
                          newFiles[idx] = file;
                          setImageFiles(newFiles);
                        }
                      }}
                      disabled={idx > 5}
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
      {/* Product Details Grid with Icons (copied style from Advert Creator) */}
      {(() => {
        // Options from Advert Creator
        const styleOptions = [
          'Christian Cross','Heart','Bible','Pillars','Traditional African','Abstract',
          'Praying Hands','Scroll','Angel','Mausoleum','Obelisk','Plain','Teddy Bear','Butterfly','Car','Bike','Sports',
        ];
        const slabStyleOptions = [
          'Curved Slab','Frame with Infill','Full Slab','Glass Slab','Half Slab','Stepped Slab','Tiled Slab',
        ];
        const colorOptions = [
          'Black','Blue','Green','Grey-Dark','Grey-Light','Maroon','Pearl','Red','White','Mixed',
        ];
        const stoneTypeOptions = [
          'Biodegradable','Brass','Ceramic/Porcelain','Composite','Concrete','Copper','Glass','Granite',
          'Limestone','Marble','Perspex','Quartzite','Sandstone','Slate','Steel','Stone','Tile','Wood',
        ];
        const customizationOptions = [
          'Bronze/Stainless Plaques','Ceramic Photo Plaques','Flower Vases','Gold Lettering','Inlaid Glass','Photo Laser-Edging','QR Code',
        ];
      
        return (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 24, marginBottom: 32 }}>
            {/* HEAD STYLE (max 2) */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
                <Image src="/new files/newIcons/Styles_Icons/Styles_Icons-11.svg" alt="Head Style" width={18} height={18} style={{ marginRight: 6 }} />
                Head Style
              </div>
              <div style={{ fontSize: 11, color: '#666', marginBottom: 8 }}>Can choose up to X2 HEAD STYLE Options</div>
              {styleOptions.map((s) => {
                const icon = getIconPath('style', s);
                return (
                  <label key={s} style={{ display: "flex", alignItems: "center", fontSize: 13, marginBottom: 6 }}>
                    <input
                      type="checkbox"
                      checked={selectedStyle.includes(s)}
                      onChange={() => handleCheckboxChange(selectedStyle, setSelectedStyle, s, 2)}
                      style={{ marginRight: 8 }}
                    />
                    {icon && <Image src={icon} alt={`${s} icon`} width={22} height={22} style={{ marginRight: 8, objectFit: 'contain' }} />}
                    <span>{s}</span>
                  </label>
                );
              })}
            </div>
      
            {/* SLAB STYLE (max 1) */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
                <Image src="/new files/newIcons/Styles_Icons/Styles_Icons-11.svg" alt="Slab Style" width={18} height={18} style={{ marginRight: 6 }} />
                Slab Style
              </div>
              <div style={{ fontSize: 11, color: '#666', marginBottom: 8 }}>Can choose up to X1 Slab Style Option</div>
              {slabStyleOptions.map((s) => {
                const icon = getIconPath('slabStyle', s);
                return (
                  <label key={s} style={{ display: "flex", alignItems: "center", fontSize: 13, marginBottom: 6 }}>
                    <input
                      type="checkbox"
                      checked={selectedSlabStyle.includes(s)}
                      onChange={() => handleCheckboxChange(selectedSlabStyle, setSelectedSlabStyle, s, 1)}
                      style={{ marginRight: 8 }}
                    />
                    {icon && <Image src={icon} alt={`${s} icon`} width={22} height={22} style={{ marginRight: 8, objectFit: 'contain' }} />}
                    <span>{s}</span>
                  </label>
                );
              })}
            </div>
      
            {/* COLOUR (max 2) */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
                <Image src="/new files/newIcons/Colour_Icons/Colour_Icons-28.svg" alt="Colour" width={18} height={18} style={{ marginRight: 6 }} />
                Colour
              </div>
              <div style={{ fontSize: 11, color: '#666', marginBottom: 8 }}>Can choose up to X2 Colour Options</div>
              {colorOptions.map((c) => {
                const icon = getIconPath('color', c);
                return (
                  <label key={c} style={{ display: "flex", alignItems: "center", fontSize: 13, marginBottom: 6 }}>
                    <input
                      type="checkbox"
                      checked={selectedColour.includes(c)}
                      onChange={() => handleCheckboxChange(selectedColour, setSelectedColour, c, 2)}
                      style={{ marginRight: 8 }}
                    />
                    {icon && <Image src={icon} alt={`${c} icon`} width={22} height={22} style={{ marginRight: 8, objectFit: 'contain' }} />}
                    <span>{c}</span>
                  </label>
                );
              })}
            </div>
      
            {/* STONE TYPE (max 2) */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
                <Image src="/new files/newIcons/Material_Icons/Material_Icons-39.svg" alt="Stone Type" width={18} height={18} style={{ marginRight: 6 }} />
                Stone Type
              </div>
              <div style={{ fontSize: 11, color: '#666', marginBottom: 8 }}>Can choose up to X2 Material Options</div>
              {stoneTypeOptions.map((st) => {
                const icon = getIconPath('stoneType', st);
                return (
                  <label key={st} style={{ display: "flex", alignItems: "center", fontSize: 13, marginBottom: 6 }}>
                    <input
                      type="checkbox"
                      checked={selectedStoneType.includes(st)}
                      onChange={() => handleCheckboxChange(selectedStoneType, setSelectedStoneType, st, 2)}
                      style={{ marginRight: 8 }}
                    />
                    {icon && <Image src={icon} alt={`${st} icon`} width={22} height={22} style={{ marginRight: 8, objectFit: 'contain' }} />}
                    <span>{st}</span>
                  </label>
                );
              })}
            </div>
      
            {/* CUSTOMISATION (max 3) */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
                <Image src="/new files/newIcons/Custom_Icons/Custom_Icons-54.svg" alt="Customisation" width={18} height={18} style={{ marginRight: 6 }} />
                Customisation
              </div>
              <div style={{ fontSize: 11, color: '#666', marginBottom: 8 }}>Can choose up to X3 Custom Options</div>
              {customizationOptions.map((cu) => {
                const icon = getIconPath('customization', cu);
                return (
                  <label key={cu} style={{ display: "flex", alignItems: "center", fontSize: 13, marginBottom: 6 }}>
                    <input
                      type="checkbox"
                      checked={selectedCustomisation.includes(cu)}
                      onChange={() => handleCheckboxChange(selectedCustomisation, setSelectedCustomisation, cu, 3)}
                      style={{ marginRight: 8 }}
                    />
                    {icon && <Image src={icon} alt={`${cu} icon`} width={22} height={22} style={{ marginRight: 8, objectFit: 'contain' }} />}
                    <span>{cu}</span>
                  </label>
                );
              })}
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

      {/* Additional Product Details Content (updated to checkbox groups) */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 32 }}>
        {/* 1. TRANSPORT AND INSTALLATION (max 2) */}
        <div>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>1. TRANSPORT AND INSTALLATION</div>
          <div style={{ fontSize: 12, color: "#555", marginBottom: 8 }}>(Can choose up to X2 Transport and Installation Options)</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {[
              "FREE TRANSPORT AND INSTALLATION WITHIN 5KM OF FACTORY",
              "FREE TRANSPORT AND INSTALLATION WITHIN 20KM OF FACTORY",
              "FREE TRANSPORT AND INSTALLATION WITHIN 50KM OF FACTORY",
              "FREE TRANSPORT AND INSTALLATION WITHIN 100KM OF FACTORY",
              "FREE TRANSPORT AND INSTALLATION",
              "DISCOUNTED TRANSPORT AND INSTALLATION COST INCLUDED IN SALE",
              "FINAL TRANSPORT AND INSTALLATION COST TO BE CONFIRMED BY MANUFACTURER",
            ].map((option) => (
              <label key={option} style={{ display: "block", fontSize: 13 }}>
                <input
                  type="checkbox"
                  checked={selectedTransport.includes(option)}
                  onChange={() => handleCheckboxChange(selectedTransport, setSelectedTransport, option, 2)}
                  style={{ marginRight: 6 }}
                />
                {option}
              </label>
            ))}
          </div>
        </div>

        {/* 2. FOUNDATION OPTIONS (max 3) */}
        <div>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>2. FOUNDATION OPTIONS</div>
          <div style={{ fontSize: 12, color: "#555", marginBottom: 8 }}>(Can choose up to X3 Foundation Options)</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {[
              "NO FOUNDATION COSTS INCLUDED IN PRICE",
              "GRAVESITE CLEARING COST NOT INCLUDED IN PRICE",
              "GRAVESITE CLEARING COST INCLUDED IN PRICE",
              "CEMENT FOUNDATION COST NOT INCLUDED IN PRICE",
              "CEMENT FOUNDATION COST INCLUDED IN PRICE",
              "BRICK FOUNDATION COST NOT INCLUDED IN PRICE",
              "BRICK FOUNDATION COST INCLUDED IN PRICE",
              "X1 LAYER BRICK FOUNDATION COST INCLUDED IN PRICE",
              "X2 LAYER BRICK FOUNDATION COST INCLUDED IN PRICE",
              "X3 LAYER BRICK FOUNDATION COST INCLUDED IN PRICE",
            ].map((option) => (
              <label key={option} style={{ display: "block", fontSize: 13 }}>
                <input
                  type="checkbox"
                  checked={selectedFoundation.includes(option)}
                  onChange={() => handleCheckboxChange(selectedFoundation, setSelectedFoundation, option, 3)}
                  style={{ marginRight: 6 }}
                />
                {option}
              </label>
            ))}
          </div>
        </div>

        {/* 3. WARRANTY/GUARANTEE (max 1) */}
        <div>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>3. WARRANTY/GUARANTEE</div>
          <div style={{ fontSize: 12, color: "#555", marginBottom: 8 }}>(Can choose up to X1 Warranty/Guarantee Options)</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {[
              "5   YEAR MANUFACTURES WARRANTY",
              "5   YEAR MANUFACTURES GUARANTEE",
              "10 YEAR MANUFACTURES WARRANTY",
              "10 YEAR MANUFACTURES GUARANTEE",
              "15 YEAR MANUFACTURES WARRANTY",
              "15 YEAR MANUFACTURES GUARANTEE",
              "20 YEAR MANUFACTURES WARRANTY",
              "20 YEAR MANUFACTURES GUARANTEE",
              "LIFETIME MANUFACTURERS WARRANTY",
              "LIFETIME MANUFACTURERS GUARANTEE",
            ].map((option) => (
              <label key={option} style={{ display: "block", fontSize: 13 }}>
                <input
                  type="checkbox"
                  checked={selectedWarranty.includes(option)}
                  onChange={() => handleCheckboxChange(selectedWarranty, setSelectedWarranty, option, 1)}
                  style={{ marginRight: 6 }}
                />
                {option}
              </label>
            ))}
          </div>
        </div>

        {/* 4. MANUFACTURING LEAD TIME (single select via checkbox) */}
        <div>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>4. MANUFACTURING LEAD TIME</div>
          <div style={{ fontSize: 12, color: "#555", marginBottom: 8 }}>(Can choose up to X1 Manufacturing Lead Time)</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {manufacturingLeadTimeOptions.map((days) => {
              const str = String(days);
              const checked = manufacturingTimeframe === str;
              return (
                <label key={str} style={{ display: "block", fontSize: 13 }}>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => handleManufacturingLeadTimeToggle(days)}
                    style={{ marginRight: 6 }}
                  />
                  {formatManufacturingLeadTimeText(days)}
                </label>
              );
            })}
          </div>
        </div>
      </div>
 
      {/* PRICING & ADFLASHER state and helpers */}
      {/* PRICING & ADFLASHER */}
      <div style={{ background: "#ededed", fontWeight: 700, fontSize: 13, padding: "6px 12px ", marginTop: 0, marginBottom: 0, letterSpacing: 0.5, display: 'flex', alignItems: 'center' }}>
        <span style={{ marginRight: 8 }}>PRICING & ADFLASHER</span>
      </div>
      <div style={{ height: 12 }} />
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 32 }}>
        {/* LEFT: ADVERT FLASHER */}
        <div>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>ADVERT FLASHER</div>
          <div style={{ fontSize: 12, color: '#555', marginBottom: 8 }}>(Can only choose X1 Advert Flasher per Ad)</div>

          {/* Categories grid: [name | arrow] */}
          <div style={{ display: "grid", gridTemplateColumns: "max-content 16px", columnGap: 8, rowGap: 6, alignItems: "start" }}>
            {Object.entries(adFlasherOptionsMap).map(([category, cfg]) => {
              const options = Array.isArray(cfg) ? cfg : (cfg?.options || []);

              return (
                <React.Fragment key={category}>
                  <button
                    type="button"
                    onClick={() => handleToggleAdFlasherCategory(category)}
                    aria-expanded={expandedAdFlasherCategory === category}
                    aria-controls={`adflasher-panel-${category}`}
                    style={{ display: "contents" }}
                  >
                    {/* Column 1: name */}
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#222", alignSelf: "start" }}>
                      {category.replace(/_/g, " ")}
                    </span>
                    {/* Column 2: arrow */}
                    <span
                      style={{
                        fontSize: 12,
                        color: "#111",
                        lineHeight: 1,
                        alignSelf: "start",
                        justifySelf: "end",
                        display: "inline-block",
                        width: 16,
                        textAlign: "center",
                      }}
                    >
                      {expandedAdFlasherCategory === category ? "▼" : "▶"}
                    </span>
                  </button>

                  {/* Expanded options for this category */}
                  {expandedAdFlasherCategory === category && (
                    <div
                      id={`adflasher-panel-${category}`}
                      style={{ gridColumn: "1 / -1", padding: "4px 0 8px 18px" }}
                    >
                      {options.map((option) => (
                        <label
                          key={option}
                          style={{ display: "flex", alignItems: "center", fontSize: 13, marginBottom: 6 }}
                        >
                          <input
                            type="radio"
                            name="adFlasherRadio"
                            checked={flasher === option}
                            onChange={() => handleSelectAdFlasher(category, option)}
                            style={{ marginRight: 8 }}
                          />
                          <span>{option}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Selection preview box (always visible; color updates by category) */}
          <div
            style={{
              marginTop: 12,
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 10px",
              border: "1px dashed #C8C8C8",
              borderRadius: 8,
              background: "#fff",
            }}
          >
            <span style={{ fontSize: 12, color: "#444" }}>Selection</span>
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "#fff",
                background: selectedAdFlasherColor,
                padding: "4px 10px",
                borderRadius: 999,
              }}
            >
              {flasher || "None"}
            </span>
          </div>
        </div>

        {/* RIGHT: ADVERTISED PRICE */}
        <div>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>ADVERTISED PRICE</div>
          {/* Removed helper rule text */}
          <input
            type="text"
            name="price"
            placeholder="12500.00"
            value={price}
            onChange={handlePriceChange}
            onBlur={handlePriceBlur}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: 8,
              border: '1px solid #ccc',
              fontSize: 14,
              outline: 'none'
            }}
          />
        </div>
      </div>
      
      {/* Action Buttons */}
      <div style={{ maxWidth: 1000, margin: "0 auto", display: "flex", justifyContent: "flex-end", gap: 12, padding: "12px 0 24px 0" }}>
        <button
          type="button"
          onClick={(e) => handleSubmit(e)}
          disabled={isSubmitting}
          style={{
            background: "#005bac",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "10px 16px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: 0.5,
            cursor: "pointer",
            opacity: isSubmitting ? 0.7 : 1
          }}
        >
          {isSubmitting ? "SAVING..." : "SAVE CHANGES"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/manufacturers/manufacturers-Profile-Page")}
          style={{
            background: "#d9d9d9",
            color: "#333",
            border: "none",
            borderRadius: 8,
            padding: "10px 16px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: 0.5,
            cursor: "pointer"
          }}
        >
          CANCEL
        </button>
      </div>
    </div>
  );
}


// Icon maps copied from Advert Creator
const COLOR_ICON_MAP = {
  Black: "/last icons/AdvertCreator_Colour_Icons/6_Colour_Icons/Colour_Icon_Black.svg",
  Blue: "/last icons/AdvertCreator_Colour_Icons/6_Colour_Icons/Colour_Icon_Blue.svg",
  Green: "/last icons/AdvertCreator_Colour_Icons/6_Colour_Icons/Colour_Icon_Green.svg",
  "Grey-Dark": "/last icons/AdvertCreator_Colour_Icons/6_Colour_Icons/Colour_Icon_Grey-Dark.svg",
  "Grey-Light": "/last icons/AdvertCreator_Colour_Icons/6_Colour_Icons/Colour_Icon_Grey-Light.svg",
  Maroon: "/last icons/AdvertCreator_Colour_Icons/6_Colour_Icons/Colour_Icon_Maroon.svg",
  Pearl: "/last icons/AdvertCreator_Colour_Icons/6_Colour_Icons/Colour_Icon_Pearl.svg",
  Red: "/last icons/AdvertCreator_Colour_Icons/6_Colour_Icons/Colour_Icon_Red.svg",
  White: "/last icons/AdvertCreator_Colour_Icons/6_Colour_Icons/Colour_Icon_White.svg",
  Mixed: "/last icons/AdvertCreator_Colour_Icons/6_Colour_Icons/Colour_Icon_Mixed.svg",
};

const HEAD_STYLE_ICON_MAP = {
  "Christian Cross": "/last icons/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_ChristianCross.svg",
  "Heart": "/last icons/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_Heart.svg",
  "Bible": "/last icons/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_Bible.svg",
  "Pillars": "/last icons/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_Pillars.svg",
  "Traditional African": "/last icons/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_TraditionalAfrican.svg",
  "Abstract": "/last icons/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_Abstract.svg",
  "Praying Hands": "/last icons/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_PrayingHands.svg",
  "Scroll": "/last icons/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_Scroll.svg",
  "Angel": "/last icons/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_Angel.svg",
  "Mausoleum": "/last icons/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_Mausolean.svg",
  "Obelisk": "/last icons/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_Obelisk.svg",
  "Plain": "/last icons/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_Plain.svg",
  "Teddy Bear": "/last icons/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_TeddyBear.svg",
  "Butterfly": "/last icons/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_Butterfly.svg",
  "Car": "/last icons/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_Car.svg",
  "Bike": "/last icons/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_Bike.svg",
  "Sports": "/last icons/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_Sport.svg",
};

const STONE_TYPE_ICON_MAP = {
  "Biodegradable": "/last icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Biodegradable.svg",
  "Brass": "/last icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Brass.svg",
  "Ceramic/Porcelain": "/last icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Ceramic_Porcelain.svg",
  "Composite": "/last icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Composite.svg",
  "Concrete": "/last icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Concrete.svg",
  "Copper": "/last icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Copper.svg",
  "Glass": "/last icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Glass.svg",
  "Granite": "/last icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Granite.svg",
  "Limestone": "/last icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Limestone.svg",
  "Marble": "/last icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Marble.svg",
  "Perspex": "/last icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Perspex.svg",
  "Quartzite": "/last icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Quartzite.svg",
  "Sandstone": "/last icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Sandstone.svg",
  "Slate": "/last icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Slate.svg",
  "Steel": "/last icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Steel.svg",
  "Stone": "/last icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Stone.svg",
  "Tile": "/last icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Tile.svg",
  "Wood": "/last icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Wood.svg",
};

const CUSTOMIZATION_ICON_MAP = {
  "Bronze/Stainless Plaques": "/last icons/AdvertCreator_Icons_Customisation_Icons/AdvertCreator_Icons_Customisation_Icons/AdvertCreator_Customisation_Icon_BronzeStainless Plaque.svg",
  "Ceramic Photo Plaques": "/last icons/AdvertCreator_Icons_Customisation_Icons/AdvertCreator_Icons_Customisation_Icons/AdvertCreator_Customisation_Icon_CeramicPhotoPlaque.svg",
  "Flower Vases": "/last icons/AdvertCreator_Icons_Customisation_Icons/AdvertCreator_Icons_Customisation_Icons/AdvertCreator_Customisation_Icon_FlowerVase.svg",
  "Gold Lettering": "/last icons/AdvertCreator_Icons_Customisation_Icons/AdvertCreator_Icons_Customisation_Icons/AdvertCreator_Customisation_Icon_GoldLettering.svg",
  "Inlaid Glass": "/last icons/AdvertCreator_Icons_Customisation_Icons/AdvertCreator_Icons_Customisation_Icons/AdvertCreator_Customisation_Icon_InlaidGlass.svg",
  "Photo Laser-Edging": "/last icons/AdvertCreator_Icons_Customisation_Icons/AdvertCreator_Icons_Customisation_Icons/AdvertCreator_Customisation_Icon_PhotoLaserEdginhg.svg",
  "QR Code": "/last icons/AdvertCreator_Icons_Customisation_Icons/AdvertCreator_Icons_Customisation_Icons/AdvertCreator_Customisation_Icon_QR Code.svg",
};

const SLAB_STYLE_ICON_MAP = {
  "Curved Slab": "/last icons/AdvertCreator_SlabStyle_Icons/AdvertCreator_SlabStyle_Icons/AdvertCreator_SlabStyle_Icons_CurvedSlab.svg",
  "Frame with Infill": "/last icons/AdvertCreator_SlabStyle_Icons/AdvertCreator_SlabStyle_Icons/AdvertCreator_SlabStyle_Icons_FramewithInfill.svg",
  "Full Slab": "/last icons/AdvertCreator_SlabStyle_Icons/AdvertCreator_SlabStyle_Icons/AdvertCreator_SlabStyle_Icons_FullSlab.svg",
  "Glass Slab": "/last icons/AdvertCreator_SlabStyle_Icons/AdvertCreator_SlabStyle_Icons/AdvertCreator_SlabStyle_Icons_GlassSlab.svg",
  "Half Slab": "/last icons/AdvertCreator_SlabStyle_Icons/AdvertCreator_SlabStyle_Icons/AdvertCreator_SlabStyle_Icons_HalfSlab.svg",
  "Stepped Slab": "/last icons/AdvertCreator_SlabStyle_Icons/AdvertCreator_SlabStyle_Icons/AdvertCreator_SlabStyle_Icons_Stepped.svg",
  "Tiled Slab": "/last icons/AdvertCreator_SlabStyle_Icons/AdvertCreator_SlabStyle_Icons/AdvertCreator_SlabStyle_Icons_Tiled.svg",
};

const getIconPath = (type, value) => {
  switch (type) {
    case 'color': {
      const key = String(value).trim();
      return COLOR_ICON_MAP[key] || null;
    }
    case 'style': {
      const key = String(value).trim();
      return HEAD_STYLE_ICON_MAP[key] || '/new files/newIcons/Styles_Icons/Styles_Icons-11.svg';
    }
    case 'slabStyle': {
      const key = String(value).trim();
      return SLAB_STYLE_ICON_MAP[key] || '/new files/newIcons/Styles_Icons/Styles_Icons-11.svg';
    }
    case 'stoneType': {
      const key = String(value).trim();
      return STONE_TYPE_ICON_MAP[key] || null;
    }
    case 'customization': {
      const key = String(value).trim();
      return CUSTOMIZATION_ICON_MAP[key] || '/new files/newIcons/Custom_Icons/Custom_Icons-54.svg';
    }
    default:
      return null;
  }
};
