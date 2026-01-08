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
import { useToast } from "../../../../../hooks/use-toast";
import { useListingCategories } from '@/hooks/use-ListingCategories';
import { desiredOrder } from '@/lib/categories';


// Category icon map for Category Selection (Advert Creator)
const CATEGORY_ICON_MAP = {
  SINGLE: "/last_icons/MainCatergories_Icons_X6_AdvertCreator_Icons/MainCatergories_Icons_X6_AdvertCreator_Icons/Single.svg",
  DOUBLE: "/last_icons/MainCatergories_Icons_X6_AdvertCreator_Icons/MainCatergories_Icons_X6_AdvertCreator_Icons/MainCatergories_AdvertCreator_Icons_2_Double.svg",
  CHILD: "/last_icons/MainCatergories_Icons_X6_AdvertCreator_Icons/MainCatergories_Icons_X6_AdvertCreator_Icons/MainCatergories_AdvertCreator_Icons_3_Child.svg",
  HEAD: "/last_icons/MainCatergories_Icons_X6_AdvertCreator_Icons/MainCatergories_Icons_X6_AdvertCreator_Icons/MainCatergories_AdvertCreator_Icons_4_Head.svg",
  PLAQUES: "/last_icons/MainCatergories_Icons_X6_AdvertCreator_Icons/MainCatergories_Icons_X6_AdvertCreator_Icons/MainCatergories_AdvertCreator_Icons_5-Plaques.svg",
  CREMATION: "/last_icons/MainCatergories_Icons_X6_AdvertCreator_Icons/MainCatergories_Icons_X6_AdvertCreator_Icons/MainCatergories_AdvertCreator_Icons_6_Cremation.svg",
};

function isMobile() {
  if (typeof window === 'undefined') return false;
  return window.innerWidth <= 768;
}

export default function UpdateListingPage() {
  const { listingId } = useParams();
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const { categories, loading: categoriesLoading, error: categoriesError } = useListingCategories();
  const sortedCategories = Array.isArray(categories)
      ? desiredOrder
          .map(name => categories.find(cat => cat?.name && cat.name.toUpperCase() === name))
          .filter(Boolean)
      : [];

  const [selectedCategory, setSelectedCategory] = useState(null);
  
  // State for custom toast notification
  const [showMessage, setShowMessage] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(true);
  
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

  // Moved these two hooks up here (unconditional)
  const [imageFiles, setImageFiles] = useState(Array(11).fill(null));
  const [existingPublicIds, setExistingPublicIds] = useState({ main: null, thumbs: [] });

  const listing = data?.listing;

  useEffect(() => {
    if (listing) {
      setTitle(listing.title || "");
      setDescription(listing.description || "");
      if (listing.listing_category) {
        setSelectedCategory(listing.listing_category);
      }
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

  const handleRemoveImage = (e, index) => {
    e.stopPropagation();
    const newImages = [...images];
    newImages[index] = null;
    setImages(newImages);

    const newFiles = [...imageFiles];
    newFiles[index] = null;
    setImageFiles(newFiles);
  };

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

      // Prepare lists for final state and deletions
      let mainImageUrl = null;
      let mainImagePublicId = null;
      const finalThumbUrls = [];
      const finalThumbPublicIds = [];
      const publicIdsToDelete = [];

      // 1. Process Main Image (Index 0)
      if (imageFiles[0]) {
        // New file uploaded
        const uploaded = await uploadToCloudinary(imageFiles[0], folderName);
        mainImageUrl = uploaded?.url || uploaded?.secure_url;
        mainImagePublicId = uploaded?.public_id;
        
        // Mark old main image for deletion if it existed
        if (existingPublicIds.main) {
          publicIdsToDelete.push(existingPublicIds.main);
        }
      } else if (images[0]) {
        // Existing image kept
        mainImageUrl = images[0];
        mainImagePublicId = existingPublicIds.main;
      } else {
        // Image removed
        if (existingPublicIds.main) {
          publicIdsToDelete.push(existingPublicIds.main);
        }
      }

      // 2. Process Thumbnails (Indices 1-10)
      // We iterate through slots 1 to 10
      const thumbUploadPromises = [];
      const thumbUploadIndices = [];

      for (let idx = 1; idx <= 10; idx++) {
        if (imageFiles[idx]) {
          // New file to upload
          thumbUploadIndices.push(idx);
          thumbUploadPromises.push(uploadToCloudinary(imageFiles[idx], folderName));
          
          // If there was an existing image at this slot, mark it for deletion
          // Note: existingPublicIds.thumbs array corresponds to original slots if we assume order is preserved
          // However, listing.thumbnailUrls might have been fewer than 10.
          // existingPublicIds.thumbs[idx - 1] corresponds to the image loaded at that slot.
          if (existingPublicIds.thumbs && existingPublicIds.thumbs[idx - 1]) {
            publicIdsToDelete.push(existingPublicIds.thumbs[idx - 1]);
          }
        } else if (images[idx]) {
          // Existing image kept
          finalThumbUrls.push(images[idx]);
          // Keep the corresponding public ID
          if (existingPublicIds.thumbs && existingPublicIds.thumbs[idx - 1]) {
            finalThumbPublicIds.push(existingPublicIds.thumbs[idx - 1]);
          }
        } else {
          // Slot is empty (removed or never existed)
          // If there WAS an image here originally, mark it for deletion
          if (existingPublicIds.thumbs && existingPublicIds.thumbs[idx - 1]) {
            publicIdsToDelete.push(existingPublicIds.thumbs[idx - 1]);
          }
        }
      }

      // Wait for thumbnail uploads
      if (thumbUploadPromises.length > 0) {
        const results = await Promise.all(thumbUploadPromises);
        results.forEach(u => {
          if (u?.url || u?.secure_url) {
            finalThumbUrls.push(u.url || u.secure_url);
            finalThumbPublicIds.push(u.public_id || null);
          }
        });
      }

      const payload = {
        data: {
          title,
          description,
          price: parseFloat(price),
          adFlasher: flasher,
          adFlasherColor: selectedAdFlasherColor, // NEW: persist color on update
          manufacturingTimeframe: manufacturingTimeframe,
          listing_category: selectedCategory?.documentId,
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

      // Cleanup old Cloudinary assets
      try {
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
      
      // Show success message
      setMessage("Listing updated successfully!");
      setIsSuccess(true);
      setShowMessage(true);
      
      setSubmitMessage("Listing updated successfully!");
      
      // Auto-close the message after 5 seconds
      setTimeout(() => {
        setShowMessage(false);
      }, 5000);
      
      setTimeout(() => {
        router.push('/manufacturers/manufacturers-Profile-Page');
      }, 2000);

    } catch (error) {
      // Show error message
      setMessage(`Error updating listing: ${error.message}`);
      setIsSuccess(false);
      setShowMessage(true);
      
      setSubmitMessage(`Error updating listing: ${error.message}`);
      
      // Auto-hide error message after 5 seconds
      setTimeout(() => {
        setShowMessage(false);
      }, 5000);
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
        "Blue": `${basePath}/AdvertCreator_Colour_Icons/6_Colour_Icons/Colour_Icon_Blue.svg`,
        "Green": `${basePath}/AdvertCreator_Colour_Icons/6_Colour_Icons/Colour_Icon_Green.svg`,
        "Grey-Dark": `${basePath}/AdvertCreator_Colour_Icons/6_Colour_Icons/Colour_Icon_Grey-Dark.svg`,
        "Grey-Light": `${basePath}/AdvertCreator_Colour_Icons/6_Colour_Icons/Colour_Icon_Grey-Light.svg`,
        "Maroon": `${basePath}/AdvertCreator_Colour_Icons/6_Colour_Icons/Colour_Icon_Maroon.svg`,
        "Pearl": `${basePath}/AdvertCreator_Colour_Icons/6_Colour_Icons/Colour_Icon_Pearl.svg`,
        "Red": `${basePath}/AdvertCreator_Colour_Icons/6_Colour_Icons/Colour_Icon_Red.svg`,
        "White": `${basePath}/AdvertCreator_Colour_Icons/6_Colour_Icons/Colour_Icon_White.svg`,
        "Mixed": `${basePath}/AdvertCreator_Colour_Icons/6_Colour_Icons/Colour_Icon_Mixed.svg`,
      },
      style: {
        "Christian Cross": `${basePath}/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_ChristianCross.svg`,
        "Heart": `${basePath}/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_Heart.svg`,
        "Bible": `${basePath}/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_Bible.svg`,
        "Pillars": `${basePath}/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_Pillars.svg`,
        "Traditional African": `${basePath}/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_TraditionalAfrican.svg`,
        "Abstract": `${basePath}/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_Abstract.svg`,
        "Praying Hands": `${basePath}/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_PrayingHands.svg`,
        "Scroll": `${basePath}/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_Scroll.svg`,
        "Angel": `${basePath}/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_Angel.svg`,
        "Mausoleum": `${basePath}/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_Mausoleum.svg`,
        "Obelisk": `${basePath}/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_Obelisk.svg`,
        "Plain": `${basePath}/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_Plain.svg`,
        "Teddy Bear": `${basePath}/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_TeddyBear.svg`,
        "Butterfly": `${basePath}/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_Butterfly.svg`,
        "Car": `${basePath}/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_Car.svg`,
        "Bike": `${basePath}/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_Bike.svg`,
        "Sports": `${basePath}/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_Sports.svg`,
      },
      stoneType: {
        "Biodegradable": `${basePath}/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Stone.svg`,
        "Brass": `${basePath}/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Brass.svg`,
        "Ceramic/Porcelain": `${basePath}/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Ceramic_Porcelain.svg`,
        "Composite": `${basePath}/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Composite.svg`,
        "Concrete": `${basePath}/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Concrete.svg`,
        "Copper": `${basePath}/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Brass.svg`,
        "Glass": `${basePath}/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Glass.svg`,
        "Granite": `${basePath}/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Granite.svg`,
        "Limestone": `${basePath}/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Limestone.svg`,
        "Marble": `${basePath}/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Marble.svg`,
        "Perspex": `${basePath}/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Glass.svg`,
        "Quartzite": `${basePath}/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Stone.svg`,
        "Sandstone": `${basePath}/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Sandstone.svg`,
        "Slate": `${basePath}/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Slate.svg`,
        "Steel": `${basePath}/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Steel.svg`,
        "Stone": `${basePath}/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Stone.svg`,
        "Tile": `${basePath}/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Stone.svg`,
        "Wood": `${basePath}/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Wood.svg`,
      },
      slabStyle: {
        "Curved Slab": `${basePath}/AdvertCreator_SlabStyle_Icons/AdvertCreator_SlabStyle_Icons/AdvertCreator_SlabStyle_Icons_CurvedSlab.svg`,
        "Frame with Infill": `${basePath}/AdvertCreator_SlabStyle_Icons/AdvertCreator_SlabStyle_Icons/AdvertCreator_SlabStyle_Icons_FramewithInfill.svg`,
        "Full Slab": `${basePath}/AdvertCreator_SlabStyle_Icons/AdvertCreator_SlabStyle_Icons/AdvertCreator_SlabStyle_Icons_FullSlab.svg`,
        "Glass Slab": `${basePath}/AdvertCreator_SlabStyle_Icons/AdvertCreator_SlabStyle_Icons/AdvertCreator_SlabStyle_Icons_GlassSlab.svg`,
        "Half Slab": `${basePath}/AdvertCreator_SlabStyle_Icons/AdvertCreator_SlabStyle_Icons/AdvertCreator_SlabStyle_Icons_HalfSlab.svg`,
        "Stepped Slab": `${basePath}/AdvertCreator_SlabStyle_Icons/AdvertCreator_SlabStyle_Icons/AdvertCreator_SlabStyle_Icons_Stepped.svg`,
        "Tiled Slab": `${basePath}/AdvertCreator_SlabStyle_Icons/AdvertCreator_SlabStyle_Icons/AdvertCreator_SlabStyle_Icons_Tiled.svg`,
      },
      customization: {
        "Bronze/Stainless Plaques": `${basePath}/AdvertCreator_Icons_Customisation_Icons/AdvertCreator_Icons_Customisation_Icons/AdvertCreator_Customisation_Icon_BronzeStainless Plaque.svg`,
        "Ceramic Photo Plaques": `${basePath}/AdvertCreator_Icons_Customisation_Icons/AdvertCreator_Icons_Customisation_Icons/AdvertCreator_Customisation_Icon_CeramicPhotoPlaque.svg`,
        "Flower Vases": `${basePath}/AdvertCreator_Icons_Customisation_Icons/AdvertCreator_Icons_Customisation_Icons/AdvertCreator_Customisation_Icon_FlowerVase.svg`,
        "Gold Lettering": `${basePath}/AdvertCreator_Icons_Customisation_Icons/AdvertCreator_Icons_Customisation_Icons/AdvertCreator_Customisation_Icon_GoldLettering.svg`,
        "Inlaid Glass": `${basePath}/AdvertCreator_Icons_Customisation_Icons/AdvertCreator_Icons_Customisation_Icons/AdvertCreator_Customisation_Icon_InlaidGlass.svg`,
        "Photo Laser-Edging": `${basePath}/AdvertCreator_Icons_Customisation_Icons/AdvertCreator_Icons_Customisation_Icons/AdvertCreator_Customisation_Icon_PhotoLaserEdginhg.svg`,
        "QR Code": `${basePath}/AdvertCreator_Icons_Customisation_Icons/AdvertCreator_Icons_Customisation_Icons/AdvertCreator_Customisation_Icon_QR Code.svg`,
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
      position: "relative",
    }}>
      {/* Custom Toast Notification */}
      {showMessage && (
        <div 
          style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            zIndex: 1000,
            padding: "12px 16px",
            borderRadius: "4px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            minWidth: "300px",
            backgroundColor: isSuccess ? "#4CAF50" : "#F44336",
            color: "white",
          }}
        >
          <div>
            <p style={{ margin: 0, fontWeight: "500" }}>{message}</p>
          </div>
          <button 
            onClick={() => setShowMessage(false)}
            style={{
              background: "transparent",
              border: "none",
              color: "white",
              fontSize: "20px",
              cursor: "pointer",
              marginLeft: "12px",
            }}
          >
            ×
          </button>
        </div>
      )}
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
      {/* Category Selection Section Header */}
      <div style={{ background: "#005bac", color: "#fff", fontWeight: 700, fontSize: 13, padding: "6px 12px", marginBottom: 0, letterSpacing: 0.5 }}>
        CATEGORY SELECTION
      </div>
      <div style={{ height: 12 }} />
      
      {/* Category Selection Content */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 12, marginBottom: 8, color: "#555" }}>Select a category for your listing:</div>
        
        {categoriesLoading && <div>Loading categories...</div>}
        {categoriesError && <div style={{color: 'red'}}>Error loading categories: {categoriesError.message}</div>}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12 }}>
          {!categoriesLoading && !categoriesError && sortedCategories.map((category) => {
            return (
              <button
                key={category.documentId}
                type="button"
                onClick={() => setSelectedCategory(category)}
                style={{
                  padding: "12px 16px",
                  border: selectedCategory?.documentId === category.documentId ? "2px solid #005bac" : "1px solid #ccc",
                  borderRadius: 8,
                  background: selectedCategory?.documentId === category.documentId ? "#e6f3ff" : "#fff",
                  cursor: "pointer",
                  fontSize: 14,
                  fontWeight: selectedCategory?.documentId === category.documentId ? "600" : "400",
                  color: selectedCategory?.documentId === category.documentId ? "#005bac" : "#333",
                  transition: "all 0.2s ease",
                  textAlign: "center",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8
                }}
              >
                 {(CATEGORY_ICON_MAP[category.name?.toUpperCase()] || category.icon) && (
                  <Image 
                    src={CATEGORY_ICON_MAP[category.name?.toUpperCase()] || category.icon} 
                    alt={category.name} 
                    width={20} 
                    height={20} 
                    style={{ flexShrink: 0 }}
                  />
                )}
                {category.name}
              </button>
            );
          })}
        </div>
        {selectedCategory && (
          <div style={{ marginTop: 8, fontSize: 12, color: "#666" }}>
            Selected: <strong>{selectedCategory.name}</strong>
          </div>
        )}
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
                  overflow: "visible",
                }}
                onClick={() => document.getElementById(`img-upload-main`).click()}
              >
                {images[0] ? (
                  <>
                    <img src={images[0]} alt="Main" style={{ width: 88, height: 88, borderRadius: 8 }} />
                    <button
                      type="button"
                      onClick={(e) => handleRemoveImage(e, 0)}
                      style={{
                        position: "absolute",
                        top: -6,
                        right: -6,
                        background: "red",
                        color: "white",
                        border: "none",
                        borderRadius: "50%",
                        width: 20,
                        height: 20,
                        fontSize: 12,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 100,
                        boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                      }}
                    >
                      X
                    </button>
                  </>
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
                      overflow: "visible",
                    }}
                    onClick={() => idx <= 5 && document.getElementById(`img-upload-${idx}`).click()}
                  >
                    {images[idx] ? (
                      <>
                        <img src={images[idx]} alt="" style={{ width: 40, height: 40, borderRadius: 8 }} />
                        <button
                          type="button"
                          onClick={(e) => handleRemoveImage(e, idx)}
                          style={{
                            position: "absolute",
                            top: -6,
                            right: -6,
                            background: "red",
                            color: "white",
                            border: "none",
                            borderRadius: "50%",
                            width: 20,
                            height: 20,
                            fontSize: 12,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            zIndex: 100,
                            boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                          }}
                        >
                          X
                        </button>
                      </>
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
