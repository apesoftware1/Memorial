"use client";

import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useQuery, useApolloClient } from "@apollo/client";
import React, { useState, useEffect, useMemo } from 'react';
import { GET_LISTING_BY_ID_LIGHT } from '@/graphql/queries/getListingByIdLight';
import Image from "next/image";
import { useRouter } from "next/navigation";
import { uploadToCloudinary } from "@/lib/cloudinary";
import pricingAdFlasher from '../../../../../pricingAdFlasher.json';
import { useToast } from "../../../../../hooks/use-toast";
import { useListingCategories } from '@/hooks/use-ListingCategories';
import { desiredOrder } from '@/lib/categories';
import styles from "../UpdateListing.module.css";
import { 
  CATEGORY_ICON_MAP, 
  MANUFACTURING_LEAD_TIME_OPTIONS, 
  formatManufacturingLeadTimeText, 
  ICON_PATHS,
  STYLE_OPTIONS,
  SLAB_STYLE_OPTIONS,
  COLOR_OPTIONS,
  STONE_TYPE_OPTIONS,
  CUSTOMIZATION_OPTIONS,
  TRANSPORT_OPTIONS,
  FOUNDATION_OPTIONS,
  WARRANTY_OPTIONS
} from "../constants/updateListingConstants";

function isMobile() {
  if (typeof window === 'undefined') return false;
  return window.innerWidth <= 768;
}

export default function UpdateListingPage() {
  const client = useApolloClient();
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
  
  const { data, loading, error, refetch } = useQuery(GET_LISTING_BY_ID_LIGHT, {
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

  // Function to get the appropriate icon path for each attribute
  const getIconPath = (type, value) => {
    return ICON_PATHS[type]?.[value] || ICON_PATHS.style["Plain"];
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
      const thumbUploadPromises = [];
      const thumbUploadIndices = [];

      for (let idx = 1; idx <= 10; idx++) {
        if (imageFiles[idx]) {
          // New file to upload
          thumbUploadIndices.push(idx);
          thumbUploadPromises.push(uploadToCloudinary(imageFiles[idx], folderName));
          
          // If there was an existing image at this slot, mark it for deletion
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

      const baseUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'https://api.tombstonesfinder.co.za/api';
      const response = await fetch(`${baseUrl}/listings/${listing.documentId}`, {
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
      
      // Invalidate this specific listing in Apollo cache to ensure fresh data
      if (listing?.documentId) {
        client.cache.evict({
          id: client.cache.identify({
            __typename: 'Listing',
            documentId: listing.documentId
          })
        });
      }

      // Also invalidate the company's listings array to force a refresh of the list
      if (listing?.company?.documentId) {
        client.cache.modify({
          id: client.cache.identify({
            __typename: 'Company',
            documentId: listing.company.documentId
          }),
          fields: {
            listings(existingListingsRefs, { readField }) {
              return undefined; // Force refetch
            }
          }
        });
      }

      // Force refetch of the current page data to ensure UI is in sync
      await refetch();
      
      client.cache.gc();
      
      // Clean up orphaned references
      client.cache.gc();
      
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

  if (status === "loading") return <div>Loading session...</div>;
  if (!session) return <div>You must be logged in to update a listing.</div>;
  if (loading) return <div>Loading listing data...</div>;
  if (error) return <div>Error loading listing data.</div>;
  if (!listing) return <div>Listing not found.</div>;

  return (
    <div className={styles.container}>
      {/* Custom Toast Notification */}
      {showMessage && (
        <div className={`${styles.toast} ${isSuccess ? styles.toastSuccess : styles.toastError}`}>
          <div>
            <p className={styles.toastMessage}>{message}</p>
          </div>
          <button 
            onClick={() => setShowMessage(false)}
            className={styles.toastClose}
          >
            ×
          </button>
        </div>
      )}
      {/* Return Link */}
      <div className={styles.returnLinkContainer}>
        <a href="/manufacturers/manufacturers-Profile-Page" className={styles.returnLink}>
          <span className={styles.returnLinkArrow}>&lt;</span> Return to Profile Page & Listings.
        </a>
      </div>
      {/* Header */}
      <div className={styles.header}>
        UPDATE LISTING
      </div>
      {/* Note */}
      <div className={styles.noteContainer}>
        <span className={styles.noteText}>All fields are required for updating a listing.</span>
      </div>
      {/* Category Selection Section Header */}
      <div className={styles.sectionHeader}>
        CATEGORY SELECTION
      </div>
      <div className={styles.spacer12} />
      
      {/* Category Selection Content */}
      <div className={styles.categorySelectionContainer}>
        <div className={styles.categorySelectionLabel}>Select a category for your listing:</div>
        
        {categoriesLoading && <div>Loading categories...</div>}
        {categoriesError && <div className={styles.errorMessage}>Error loading categories: {categoriesError.message}</div>}

        <div className={styles.categoryGrid}>
          {!categoriesLoading && !categoriesError && sortedCategories.map((category) => {
            return (
              <button
                key={category.documentId}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`${styles.categoryButton} ${selectedCategory?.documentId === category.documentId ? styles.categoryButtonActive : styles.categoryButtonInactive}`}
              >
                 {(CATEGORY_ICON_MAP[category.name?.toUpperCase()] || category.icon) && (
                  <Image 
                    src={CATEGORY_ICON_MAP[category.name?.toUpperCase()] || category.icon} 
                    alt={category.name} 
                    width={20} 
                    height={20} 
                    className={styles.categoryIcon}
                  />
                )}
                {category.name}
              </button>
            );
          })}
        </div>
        {selectedCategory && (
          <div className={styles.selectedCategoryText}>
            Selected: <strong>{selectedCategory.name}</strong>
          </div>
        )}
      </div>

      {/* Product Name, Description & Images Section Header */}
      <div className={styles.sectionHeaderGray}>
        PRODUCT NAME, DESCRIPTION & IMAGES
      </div>
      <div className={styles.spacer12} />
      {/* Product Name, Description & Images Content */}
      <div className={styles.productGrid}>
        {/* Left: Name & Description */}
        <div>
          <label className={styles.inputLabel}>Product Name</label>
          <input className={styles.inputField} value={title} onChange={e => setTitle(e.target.value)} />
          <label className={styles.inputLabel}>Product Description</label>
          <textarea className={styles.textAreaField} value={description} onChange={e => setDescription(e.target.value)} />
        </div>
        {/* Right: Images */}
        <div>
          <label className={styles.inputLabel}>Product Images</label>
          <div className={styles.imageGrid}>
            <div>
              <div className={styles.mainImageLabel}>Main Image</div>
              <div
                className={styles.mainImageUploadBox}
                onClick={() => document.getElementById(`img-upload-main`).click()}
              >
                {images[0] ? (
                  <>
                    <img src={images[0]} alt="Main" className={styles.mainImagePreview} />
                    <button
                      type="button"
                      onClick={(e) => handleRemoveImage(e, 0)}
                      className={styles.removeImageButton}
                    >
                      X
                    </button>
                  </>
                ) : (
                  <span className={styles.plusIcon}>+</span>
                )}
                <input
                  id={`img-upload-main`}
                  type="file"
                  accept="image/*"
                  className={styles.hiddenInput}
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
            <div className={styles.imageColumn}>
              <div className={styles.mainImageLabel}>Additional Images only for PREMIUM Packages</div>
              <div className={styles.thumbnailGrid}>
                {[1,2,3,4,5,6,7,8,9,10].map((idx) => (
                  <div
                    key={idx}
                    className={`${styles.thumbnailUploadBox} ${idx > 5 ? styles.thumbnailDisabled : styles.thumbnailActive}`}
                    onClick={() => idx <= 5 && document.getElementById(`img-upload-${idx}`).click()}
                  >
                    {images[idx] ? (
                      <>
                        <img src={images[idx]} alt="" className={styles.thumbnailPreview} />
                        <button
                          type="button"
                          onClick={(e) => handleRemoveImage(e, idx)}
                          className={styles.removeImageButton}
                        >
                          X
                        </button>
                      </>
                    ) : (
                      <span className={idx > 5 ? styles.thumbnailDisabledIcon : styles.thumbnailPlus}>
                        {idx > 5 ? "×" : "+"}
                      </span>
                    )}
                    <input
                      id={`img-upload-${idx}`}
                      type="file"
                      accept="image/*"
                      className={styles.hiddenInput}
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
      <div className={`${styles.sectionHeaderGray} ${styles.sectionHeaderFlex}`}>
        <span className={styles.sectionHeaderTitle}>PRODUCT DETAILS</span>
      </div>
      <div className={styles.spacer12} />
      {/* Product Details Grid with Icons */}
      <div className={styles.productDetailsGrid}>
        {/* HEAD STYLE (max 2) */}
        <div>
          <div className={styles.detailsHeader}>
            <Image src="/new files/newIcons/Styles_Icons/Styles_Icons-11.svg" alt="Head Style" width={18} height={18} className={styles.detailsIcon} />
            Head Style
          </div>
          <div className={styles.detailsSubHeader}>Can choose up to X2 HEAD STYLE Options</div>
          {STYLE_OPTIONS.map((s) => {
            const icon = getIconPath('style', s);
            return (
              <label key={s} className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={selectedStyle.includes(s)}
                  onChange={() => handleCheckboxChange(selectedStyle, setSelectedStyle, s, 2)}
                  className={styles.checkboxInput}
                />
                {icon && <Image src={icon} alt={`${s} icon`} width={22} height={22} className={styles.checkboxIcon} />}
                <span>{s}</span>
              </label>
            );
          })}
        </div>
  
        {/* SLAB STYLE (max 1) */}
        <div>
          <div className={styles.detailsHeader}>
            <Image src="/new files/newIcons/Styles_Icons/Styles_Icons-11.svg" alt="Slab Style" width={18} height={18} className={styles.detailsIcon} />
            Slab Style
          </div>
          <div className={styles.detailsSubHeader}>Can choose up to X1 Slab Style Option</div>
          {SLAB_STYLE_OPTIONS.map((s) => {
            const icon = getIconPath('slabStyle', s);
            return (
              <label key={s} className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={selectedSlabStyle.includes(s)}
                  onChange={() => handleCheckboxChange(selectedSlabStyle, setSelectedSlabStyle, s, 1)}
                  className={styles.checkboxInput}
                />
                {icon && <Image src={icon} alt={`${s} icon`} width={22} height={22} className={styles.checkboxIcon} />}
                <span>{s}</span>
              </label>
            );
          })}
        </div>
  
        {/* COLOUR (max 2) */}
        <div>
          <div className={styles.detailsHeader}>
            <Image src="/new files/newIcons/Colour_Icons/Colour_Icons-28.svg" alt="Colour" width={18} height={18} className={styles.detailsIcon} />
            Colour
          </div>
          <div className={styles.detailsSubHeader}>Can choose up to X2 Colour Options</div>
          {COLOR_OPTIONS.map((c) => {
            const icon = getIconPath('color', c);
            return (
              <label key={c} className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={selectedColour.includes(c)}
                  onChange={() => handleCheckboxChange(selectedColour, setSelectedColour, c, 2)}
                  className={styles.checkboxInput}
                />
                {icon && <Image src={icon} alt={`${c} icon`} width={22} height={22} className={styles.checkboxIcon} />}
                <span>{c}</span>
              </label>
            );
          })}
        </div>
  
        {/* STONE TYPE (max 2) */}
        <div>
          <div className={styles.detailsHeader}>
            <Image src="/new files/newIcons/Material_Icons/Material_Icons-39.svg" alt="Stone Type" width={18} height={18} className={styles.detailsIcon} />
            Stone Type
          </div>
          <div className={styles.detailsSubHeader}>Can choose up to X2 Material Options</div>
          {STONE_TYPE_OPTIONS.map((st) => {
            const icon = getIconPath('stoneType', st);
            return (
              <label key={st} className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={selectedStoneType.includes(st)}
                  onChange={() => handleCheckboxChange(selectedStoneType, setSelectedStoneType, st, 2)}
                  className={styles.checkboxInput}
                />
                {icon && <Image src={icon} alt={`${st} icon`} width={22} height={22} className={styles.checkboxIcon} />}
                <span>{st}</span>
              </label>
            );
          })}
        </div>
  
        {/* CUSTOMISATION (max 3) */}
        <div>
          <div className={styles.detailsHeader}>
            <Image src="/new files/newIcons/Custom_Icons/Custom_Icons-54.svg" alt="Customisation" width={18} height={18} className={styles.detailsIcon} />
            Customisation
          </div>
          <div className={styles.detailsSubHeader}>Can choose up to X3 Custom Options</div>
          {CUSTOMIZATION_OPTIONS.map((cu) => {
            const icon = getIconPath('customization', cu);
            return (
              <label key={cu} className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={selectedCustomisation.includes(cu)}
                  onChange={() => handleCheckboxChange(selectedCustomisation, setSelectedCustomisation, cu, 3)}
                  className={styles.checkboxInput}
                />
                {icon && <Image src={icon} alt={`${cu} icon`} width={22} height={22} className={styles.checkboxIcon} />}
                <span>{cu}</span>
              </label>
            );
          })}
        </div>
        {/* Modal for max selection warning */}
        {modalOpen && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
              <div className={styles.modalText}>{modalMsg}</div>
              <button onClick={() => setModalOpen(false)} className={styles.modalButton}>OK</button>
            </div>
          </div>
        )}
      </div>

      {/* Additional Product Details Section Header */}
      <div className={`${styles.sectionHeaderGray} ${styles.sectionHeaderFlex}`}>
        <span className={styles.sectionHeaderTitle}>ADDITIONAL PRODUCT DETAILS</span>
      </div>
      <div className={styles.spacer12} />

      {/* Additional Product Details Content */}
      <div className={styles.additionalDetailsGrid}>
        {/* 1. TRANSPORT AND INSTALLATION (max 2) */}
        <div>
          <div className={styles.additionalDetailsHeader}>1. TRANSPORT AND INSTALLATION</div>
          <div className={styles.additionalDetailsSubHeader}>(Can choose up to X2 Transport and Installation Options)</div>
          <div className={styles.checkboxGroup}>
            {TRANSPORT_OPTIONS.map((option) => (
              <label key={option} className={styles.checkboxBlockLabel}>
                <input
                  type="checkbox"
                  checked={selectedTransport.includes(option)}
                  onChange={() => handleCheckboxChange(selectedTransport, setSelectedTransport, option, 2)}
                  className={styles.checkboxInputSmallMargin}
                />
                {option}
              </label>
            ))}
          </div>
        </div>

        {/* 2. FOUNDATION OPTIONS (max 3) */}
        <div>
          <div className={styles.additionalDetailsHeader}>2. FOUNDATION OPTIONS</div>
          <div className={styles.additionalDetailsSubHeader}>(Can choose up to X3 Foundation Options)</div>
          <div className={styles.checkboxGroup}>
            {FOUNDATION_OPTIONS.map((option) => (
              <label key={option} className={styles.checkboxBlockLabel}>
                <input
                  type="checkbox"
                  checked={selectedFoundation.includes(option)}
                  onChange={() => handleCheckboxChange(selectedFoundation, setSelectedFoundation, option, 3)}
                  className={styles.checkboxInputSmallMargin}
                />
                {option}
              </label>
            ))}
          </div>
        </div>

        {/* 3. WARRANTY/GUARANTEE (max 1) */}
        <div>
          <div className={styles.additionalDetailsHeader}>3. WARRANTY/GUARANTEE</div>
          <div className={styles.additionalDetailsSubHeader}>(Can choose up to X1 Warranty/Guarantee Options)</div>
          <div className={styles.checkboxGroup}>
            {WARRANTY_OPTIONS.map((option) => (
              <label key={option} className={styles.checkboxBlockLabel}>
                <input
                  type="checkbox"
                  checked={selectedWarranty.includes(option)}
                  onChange={() => handleCheckboxChange(selectedWarranty, setSelectedWarranty, option, 1)}
                  className={styles.checkboxInputSmallMargin}
                />
                {option}
              </label>
            ))}
          </div>
        </div>

        {/* 4. MANUFACTURING LEAD TIME (single select via checkbox) */}
        <div>
          <div className={styles.additionalDetailsHeader}>4. MANUFACTURING LEAD TIME</div>
          <div className={styles.additionalDetailsSubHeader}>(Can choose up to X1 Manufacturing Lead Time)</div>
          <div className={styles.checkboxGroup}>
            {MANUFACTURING_LEAD_TIME_OPTIONS.map((days) => {
              const str = String(days);
              const checked = manufacturingTimeframe === str;
              return (
                <label key={str} className={styles.checkboxBlockLabel}>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => handleManufacturingLeadTimeToggle(days)}
                    className={styles.checkboxInputSmallMargin}
                  />
                  {formatManufacturingLeadTimeText(days)}
                </label>
              );
            })}
          </div>
        </div>
      </div>
 
      {/* PRICING & ADFLASHER */}
      <div className={`${styles.sectionHeaderGray} ${styles.sectionHeaderFlex} ${styles.marginTopZero}`}>
        <span className={styles.sectionHeaderTitle}>PRICING & ADFLASHER</span>
      </div>
      <div className={styles.spacer12} />
      
      <div className={styles.pricingGrid}>
        {/* LEFT: ADVERT FLASHER */}
        <div>
          <div className={styles.additionalDetailsHeader}>ADVERT FLASHER</div>
          <div className={styles.additionalDetailsSubHeader}>(Can only choose X1 Advert Flasher per Ad)</div>

          {/* Categories grid: [name | arrow] */}
          <div className={styles.adFlasherGrid}>
            {Object.entries(adFlasherOptionsMap).map(([category, cfg]) => {
              const options = Array.isArray(cfg) ? cfg : (cfg?.options || []);

              return (
                <React.Fragment key={category}>
                  <button
                    type="button"
                    onClick={() => handleToggleAdFlasherCategory(category)}
                    aria-expanded={expandedAdFlasherCategory === category}
                    aria-controls={`adflasher-panel-${category}`}
                    className={styles.adFlasherButton}
                  >
                    {/* Column 1: name */}
                    <span className={styles.adFlasherCategoryName}>
                      {category.replace(/_/g, " ")}
                    </span>
                    {/* Column 2: arrow */}
                    <span className={styles.adFlasherArrow}>
                      {expandedAdFlasherCategory === category ? "▼" : "▶"}
                    </span>
                  </button>

                  {/* Expanded options for this category */}
                  {expandedAdFlasherCategory === category && (
                    <div
                      id={`adflasher-panel-${category}`}
                      className={styles.adFlasherPanel}
                    >
                      {options.map((option) => (
                        <label
                          key={option}
                          className={styles.checkboxLabel}
                        >
                          <input
                            type="radio"
                            name="adFlasherRadio"
                            checked={flasher === option}
                            onChange={() => handleSelectAdFlasher(category, option)}
                            className={styles.checkboxInput}
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

          {/* Selection preview box */}
          <div className={styles.selectionPreview}>
            <span className={styles.selectionLabel}>Selection</span>
            <span
              className={styles.selectionValue}
              style={{ background: selectedAdFlasherColor }}
            >
              {flasher || "None"}
            </span>
          </div>
        </div>

        {/* RIGHT: ADVERTISED PRICE */}
        <div>
          <div className={styles.additionalDetailsHeader}>ADVERTISED PRICE</div>
          <input
            type="text"
            name="price"
            placeholder="12500.00"
            value={price}
            onChange={handlePriceChange}
            onBlur={handlePriceBlur}
            className={styles.priceInput}
          />
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className={styles.actionButtons}>
        <button
          type="button"
          onClick={(e) => handleSubmit(e)}
          disabled={isSubmitting}
          className={`${styles.saveButton} ${isSubmitting ? styles.saveButtonDisabled : ''}`}
        >
          {isSubmitting ? "SAVING..." : "SAVE CHANGES"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/manufacturers/manufacturers-Profile-Page")}
          className={styles.cancelButton}
        >
          CANCEL
        </button>
      </div>
    </div>
  );
}
