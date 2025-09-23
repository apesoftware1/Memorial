import Image from "next/image";
import Link from "next/link";
import { Star, MapPin, Edit2, Upload, Lock } from "lucide-react";
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { PremiumListingCard } from "@/components/premium-listing-card";
import Header from "@/components/Header";
import ViewInquiriesModal from '@/components/ViewInquiriesModal';
import CreateSpecialModal from '@/components/CreateSpecialModal';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { useManufacturerLocation } from '@/hooks/useManufacturerLocation'
import ManufacturerLocationModal from '@/components/ManufacturerLocationModal';
import { updateCompanyField } from '@/graphql/mutations/updateCompany';
import { toast } from "@/hooks/use-toast";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { useApolloClient } from '@apollo/client';
import { GET_LISTING_BY_ID } from '@/graphql/queries/getListingById';
import { GET_LISTING_CATEGORY } from '@/graphql/queries/getListingCategory';
import CreateBranchModal from "@/components/CreatebranchModal";


// SVG Settings (gear) icon component
const SettingsIcon = (props) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path fillRule="evenodd" clipRule="evenodd" d="M14.2788 2.15224C13.9085 2 13.439 2 12.5 2C11.561 2 11.0915 2 10.7212 2.15224C10.2274 2.35523 9.83509 2.74458 9.63056 3.23463C9.53719 3.45834 9.50065 3.7185 9.48635 4.09799C9.46534 4.65568 9.17716 5.17189 8.69017 5.45093C8.20318 5.72996 7.60864 5.71954 7.11149 5.45876C6.77318 5.2813 6.52789 5.18262 6.28599 5.15102C5.75609 5.08178 5.22018 5.22429 4.79616 5.5472C4.47814 5.78938 4.24339 6.1929 3.7739 6.99993C3.30441 7.80697 3.06967 8.21048 3.01735 8.60491C2.94758 9.1308 3.09118 9.66266 3.41655 10.0835C3.56506 10.2756 3.77377 10.437 4.0977 10.639C4.57391 10.936 4.88032 11.4419 4.88029 12C4.88026 12.5581 4.57386 13.0639 4.0977 13.3608C3.77372 13.5629 3.56497 13.7244 3.41645 13.9165C3.09108 14.3373 2.94749 14.8691 3.01725 15.395C3.06957 15.7894 3.30432 16.193 3.7738 17C4.24329 17.807 4.47804 18.2106 4.79606 18.4527C5.22008 18.7756 5.75599 18.9181 6.28589 18.8489C6.52778 18.8173 6.77305 18.7186 7.11133 18.5412C7.60852 18.2804 8.2031 18.27 8.69012 18.549C9.17714 18.8281 9.46533 19.3443 9.48635 19.9021C9.50065 20.2815 9.53719 20.5417 9.63056 20.7654C9.83509 21.2554 10.2274 21.6448 10.7212 21.8478C11.0915 22 11.561 22 12.5 22C13.439 22 13.9085 22 14.2788 21.8478C14.7726 21.6448 15.1649 21.2554 15.3694 20.7654C15.4628 20.5417 15.4994 20.2815 15.5137 19.902C15.5347 19.3443 15.8228 18.8281 16.3098 18.549C16.7968 18.2699 17.3914 18.2804 17.8886 18.5412C18.2269 18.7186 18.4721 18.8172 18.714 18.8488C19.2439 18.9181 19.7798 18.7756 20.2038 18.4527C20.5219 18.2105 20.7566 17.807 21.2261 16.9999C21.6956 16.1929 21.9303 15.7894 21.9827 15.395C22.0524 14.8691 21.9088 14.3372 21.5835 13.9164C21.4349 13.7243 21.2262 13.5628 20.9022 13.3608C20.4261 13.0639 20.1197 12.558 20.1197 11.9999C20.1197 11.4418 20.4261 10.9361 20.9022 10.6392C21.2263 10.4371 21.435 10.2757 21.5836 10.0835C21.9089 9.66273 22.0525 9.13087 21.9828 8.60497C21.9304 8.21055 21.6957 7.80703 21.2262 7C20.7567 6.19297 20.522 5.78945 20.2039 5.54727C19.7799 5.22436 19.244 5.08185 18.7141 5.15109C18.4722 5.18269 18.2269 5.28136 17.8887 5.4588C17.3915 5.71959 16.7969 5.73002 16.3099 5.45096C15.8229 5.17191 15.5347 4.65566 15.5136 4.09794C15.4993 3.71848 15.4628 3.45833 15.3694 3.23463C15.1649 2.74458 14.7726 2.35523 14.2788 2.15224ZM12.5 15C14.1695 15 15.5228 13.6569 15.5228 12C15.5228 10.3431 14.1695 9 12.5 9C10.8305 9 9.47716 10.3431 9.47716 12C9.47716 13.6569 10.8305 15 12.5 15Z" fill="#fff"/>
  </svg>
);

// SVG Notification (bell) icon component
const NotificationIcon = (props) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
  const router = useRouter();
  const [mobile, setMobile] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const sortModalRef = useRef();
  const [sortBy, setSortBy] = useState('Price');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [editingOperatingHours, setEditingOperatingHours] = useState({});
  // Single-step Operating Hours editor state
  const OPERATING_DAY_ORDER = ['monToFri', 'saturday', 'sunday', 'publicHoliday'];
  const [operatingDayIndex, setOperatingDayIndex] = useState(0);        // 0..3
  const [operatingPhase, setOperatingPhase] = useState('idle');         // 'idle' | 'open' | 'close' | 'review'
  const [tempOpenTime, setTempOpenTime] = useState(null);               // holds selected open time before choosing close
  // Day-type filters; when empty, all are active
  const [selectedDayFilters, setSelectedDayFilters] = useState([]);     // array of fields
  const activeDayOrder = selectedDayFilters.length ? selectedDayFilters : OPERATING_DAY_ORDER;
  const [editingSocialLinks, setEditingSocialLinks] = useState({});
  const [createSpecialModalOpen, setCreateSpecialModalOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);
  const [viewInquiriesModalOpen, setViewInquiriesModalOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(Infinity);
  
  // Delete success message state
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState("");
  const [showDeleteMessage, setShowDeleteMessage] = useState(false);
  
  // Custom confirmation dialog state
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [listingToDelete, setListingToDelete] = useState(null);
  
  // Logo upload state
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  // Profile picture upload state + Video modal
  const profilePicInputRef = useRef(null);
  const [isUploadingProfilePic, setIsUploadingProfilePic] = useState(false);
  const [showVideoSlotModal, setShowVideoSlotModal] = useState(false);
  
  // Company state management
  const [company, setCompany] = useState(initialCompany);
  
  // New per-day Operating Hours editor state
  const defaultDailyHours = {
    sunday:        { open: false, openTime: "09:00 AM", closeTime: "05:00 PM" },
    monday:        { open: true,  openTime: "09:00 AM", closeTime: "05:00 PM" },
    tuesday:       { open: true,  openTime: "09:00 AM", closeTime: "05:00 PM" },
    wednesday:     { open: true,  openTime: "09:00 AM", closeTime: "05:00 PM" },
    thursday:      { open: true,  openTime: "09:00 AM", closeTime: "05:00 PM" },
    friday:        { open: true,  openTime: "09:00 AM", closeTime: "05:00 PM" },
    saturday:      { open: false, openTime: "09:00 AM", closeTime: "05:00 PM" },
    publicHoliday: { open: false, openTime: "09:00 AM", closeTime: "02:00 PM" },
  };

  const [dailyHours, setDailyHours] = useState(() => {
    // Prefer company.operatingHoursDaily if present, otherwise derive sensible defaults
    const saved = initialCompany?.operatingHoursDaily;
    if (saved && typeof saved === "object") {
      return { ...defaultDailyHours, ...saved };
    }
    return defaultDailyHours;
  });

  // Keep local state in sync when company changes
  useEffect(() => {
    const saved = initialCompany?.operatingHoursDaily;
    if (saved && typeof saved === "object") {
      setDailyHours(prev => ({ ...prev, ...saved }));
    }
  }, [initialCompany]);

  // Time options in 30-minute increments (12-hour format)
  const timeOptions = (() => {
    const times = [];
    let h = 6; // 6 AM
    let m = 0;
    while (h < 21 || (h === 20 && m === 30)) { // up to 8:30 PM
      const hour12 = ((h + 11) % 12) + 1;
      const ampm = h < 12 ? "AM" : "PM";
      const mm = m.toString().padStart(2, "0");
      times.push(`${hour12}:${mm} ${ampm}`);
      m += 30;
      if (m >= 60) {
        m = 0;
        h += 1;
      }
    }
    return times;
  })();

  const client = useApolloClient();
  const [isDuplicating, setIsDuplicating] = useState(false);
  const slugify = (s) => String(s || "")
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

  async function handleDuplicate(listing) {
    if (!listing?.documentId) {
      toast({ title: "Duplicate failed", description: "Listing ID not found.", variant: "destructive" });
      return;
    }
    try {
      setIsDuplicating(true);

      // 1) Load full listing details so we can mirror Advert Creator payload
      const { data } = await client.query({
        query: GET_LISTING_BY_ID,
        variables: { documentID: listing.documentId },
        fetchPolicy: 'network-only'
      });
      const full = data?.listing;
      if (!full) throw new Error("Full listing details not found.");

      // 2) Icon maps + resolver (mirrors Advert Creator)
      const COLOR_ICON_MAP = {
        Black: "/last icons/AdvertCreator_Colour_Icons/6_Colour_Icons/Colour_Icon_Black.svg",
        Blue: "/last icons/AdvertCreator_Colour_Icons/6_Colour_Icons/Colour_Icon_Blue.svg",
        Green: "/last icons/AdvertCreator_Colour_Icons/6_Colour_Icons/Colour_Icon_Green.svg",
        "Grey-Dark": "/last icons/AdvertCreator_Colour_Icons/6_Colour_Icons/Colour_Icon_Grey-Dark.svg",
        "Grey-Light": "/last icons/AdvertCreator_Colour_Icons/6_Colour_Icons/Colour_Icon_Grey-Light.svg",
        Maroon: "/last icons/AdvertCreator_Colour_Icons/6_Colour_Icons/Colour_Icon_Maroon.svg",
        Pearl: "/last icons/AdvertCreator_Colour_Icons/6_Colour_Icons/Colour_Icon_Pearl.svg",
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
      const getIconPath = (type, value) => {
        const key = String(value || "").trim();
        switch (type) {
          case 'color': return COLOR_ICON_MAP[key] || null;
          case 'style': return HEAD_STYLE_ICON_MAP[key] || '/new files/newIcons/Styles_Icons/Styles_Icons-11.svg';
          case 'stoneType': return STONE_TYPE_ICON_MAP[key] || null;
          case 'customization': return CUSTOMIZATION_ICON_MAP[key] || '/new files/newIcons/Custom_Icons/Custom_Icons-54.svg';
          default: return null;
        }
      };

      // 3) Compute unique slug and duplicated title
      const baseSlug = slugify(full.slug || full.title || "listing");
      const uniqueSlug = `${baseSlug}-copy-${Date.now().toString(36)}`;
      const duplicatedTitle = `${full.title || "Listing"} 1`;

      // 4) Resolve category documentId using live categories (match by name)
      const thisListing = (full.company?.listings || []).find(l => l.documentId === full.documentId);
      const categoryName = (thisListing?.listing_category?.name || "").trim().toLowerCase();
      let categoryDocId = undefined;
      try {
        const categoriesResp = await client.query({
          query: GET_LISTING_CATEGORY,
          fetchPolicy: 'network-only'
        });
        const categories = categoriesResp?.data?.listingCategories || [];
        const matched = categories.find(c => String(c.name).trim().toLowerCase() === categoryName);
        categoryDocId = matched?.documentId;
      } catch {
        // If categories fetch fails, fall back to leaving category unset
        categoryDocId = undefined;
      }

      // 5) Build payload mirroring Advert Creator (using existing images—no reupload)
      const payload = {
        data: {
          title: duplicatedTitle,
          slug: uniqueSlug,
          description: full.description || "",
          price: Number(full.price) || 0,
          adFlasher: full.adFlasher || "",
          isPremium: Boolean(full.isPremium),
          isFeatured: Boolean(full.isFeatured),
          isOnSpecial: false,
          isStandard: Boolean(full.isStandard),
          manufacturingTimeframe: full.manufacturingTimeframe || "1",

          mainImageUrl: full.mainImageUrl || null,
          mainImagePublicId: full.mainImagePublicId || null,
          thumbnailUrls: Array.isArray(full.thumbnailUrls) ? full.thumbnailUrls : [],
          thumbnailPublicIds: Array.isArray(full.thumbnailPublicIds) ? full.thumbnailPublicIds : [],

          company: full.company?.documentId ? { connect: [{ documentId: full.company.documentId }] } : undefined,
          categoryRef: categoryDocId ? { connect: [{ documentId: categoryDocId }] } : undefined,
          listing_category: categoryDocId ? { connect: [{ documentId: categoryDocId }] } : undefined,

          productDetails: {
            color: (full.productDetails?.color || []).map(({ value }) => ({ value, icon: getIconPath('color', value) })),
            style: (full.productDetails?.style || []).map(({ value }) => ({ value, icon: getIconPath('style', value) })),
            stoneType: (full.productDetails?.stoneType || []).map(({ value }) => ({ value, icon: getIconPath('stoneType', value) })),
            customization: (full.productDetails?.customization || []).map(({ value }) => ({ value, icon: getIconPath('customization', value) })),
          },

          additionalProductDetails: {
            transportAndInstallation: (full.additionalProductDetails?.transportAndInstallation || []).map(({ value }) => ({ value })),
            foundationOptions: (full.additionalProductDetails?.foundationOptions || []).map(({ value }) => ({ value })),
            warrantyOrGuarantee: (full.additionalProductDetails?.warrantyOrGuarantee || []).map(({ value }) => ({ value })),
          }
        }
      };

      // 6) Create duplicate
      const res = await fetch('https://typical-car-e0b66549b3.strapiapp.com/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Create failed (${res.status}). ${text}`);
      }

      const created = await res.json();
      const newDocId = created?.data?.documentId || created?.data?.id;
      toast({ title: "Listing duplicated", description: `"${duplicatedTitle}" created successfully.` });

      // 7) Navigate to edit the duplicated listing immediately
      if (newDocId) {
        router.push(`/manufacturers/manufacturers-Profile-Page/update-listing/${newDocId}`);
      }
    } catch (err) {
      console.error(err);
      toast({ title: "Duplicate failed", description: err.message || String(err), variant: "destructive" });
    } finally {
      setIsDuplicating(false);
    }
  }

  const toggleDayOpen = (key) => {
    setDailyHours(prev => ({
      ...prev,
      [key]: { ...prev[key], open: !prev[key].open },
    }));
  };

  const updateDayTime = (key, field, value) => {
    setDailyHours(prev => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }));
  };

  // Helpers to convert 12h to 24h for legacy summary fields
  const to24h = (t) => {
    // e.g., "9:00 AM" -> "09:00"
    if (!t) return "";
    const match = t.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (!match) return t;
    let [_, hh, mm, ap] = match;
    let H = parseInt(hh, 10);
    if (ap.toUpperCase() === "AM") {
      if (H === 12) H = 0;
    } else {
      if (H !== 12) H += 12;
    }
    return `${H.toString().padStart(2, "0")}:${mm}`;
  };

  const range24 = (openTime12, closeTime12) => {
    const o = to24h(openTime12);
    const c = to24h(closeTime12);
    if (!o || !c) return "";
    return `${o} - ${c}`;
  };

  // Derive legacy summary (monToFri/saturday/sunday/publicHoliday)
  const deriveLegacyOperatingHours = (dh) => {
    const weekdays = ["monday", "tuesday", "wednesday", "thursday", "friday"];
    const weekdayOpen = weekdays.every(d => dh[d].open);
    const sameTimes = new Set(
      weekdays.map(d => `${dh[d].openTime}__${dh[d].closeTime}`)
    ).size === 1;

    const monToFri = (weekdayOpen && sameTimes)
      ? range24(dh.monday.openTime, dh.monday.closeTime)
      : (weekdayOpen ? "Varies" : "Closed");

    const saturday = dh.saturday.open
      ? range24(dh.saturday.openTime, dh.saturday.closeTime)
      : "Closed";

    const sunday = dh.sunday.open
      ? range24(dh.sunday.openTime, dh.sunday.closeTime)
      : "Closed";

    const publicHoliday = dh.publicHoliday.open
      ? range24(dh.publicHoliday.openTime, dh.publicHoliday.closeTime)
      : "Closed";

    return { monToFri, saturday, sunday, publicHoliday };
  };
  
  // Add CSS animation for slideIn effect
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);
  
  // Notification state management
  const [companyListings, setCompanyListings] = useState(listings || []);
  const [notificationCount, setNotificationCount] = useState(0);
  
  // Update company state when initialCompany changes
  useEffect(() => {
    setCompany(initialCompany);
  }, [initialCompany]);
  
  // Update listings when props change
  useEffect(() => {
    setCompanyListings(listings || []);
  }, [listings]);

  // Reset visible count when listings or sort changes
  useEffect(() => {
    setVisibleCount(Infinity);
  }, [companyListings, sortBy]);
  
  // Calculate notification count from unread inquiries
  useEffect(() => {
    const allInquiries = (Array.isArray(companyListings) ? companyListings : []).flatMap(listing =>
      (listing.inquiries || listing.inquiries_c || []).map(inq => ({ 
        ...inq, 
        // If GraphQL returns these, they’ll be truthy/falsy as stored in DB
        isRead: inq.isRead !== undefined ? inq.isRead : false,
        isNew: inq.isNew !== undefined ? inq.isNew : false
      }))
    );

    const unreadCount = allInquiries.filter(inq => inq.isRead !== true).length;
    setNotificationCount(unreadCount);
  }, [companyListings]);
  
  // Location check hook with company update callback
  const locationUpdateCallback = useCallback((updatedCompany) => {
    // Update the company state with the new location data
    setCompany(updatedCompany);
  }, []);

  const {
    showLocationModal,
    openLocationModal,
    closeLocationModal,
    handleLocationUpdate,
    isLocationSet
  } = useManufacturerLocation(company, locationUpdateCallback);

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

  // Convert operating hours from GraphQL structure to display format with field mapping
  const operatingHours = company.operatingHours ? [
    { day: "Monday to Friday", time: company.operatingHours.monToFri || "09:00 - 16:00", field: "monToFri" },
    { day: "Saturdays", time: company.operatingHours.saturday || "08:30 - 14:00", field: "saturday" },
    { day: "Sundays", time: company.operatingHours.sunday || "Closed", field: "sunday" },
    { day: "Public Holidays", time: company.operatingHours.publicHoliday || "08:30 - 14:00", field: "publicHoliday" },
  ] : [];

  // Time slot options for selection (30-minute increments)
  const TIME_SLOTS = [
    "06:00","06:30","07:00","07:30","08:00","08:30","09:00","09:30",
    "10:00","10:30","11:00","11:30","12:00","12:30","13:00","13:30",
    "14:00","14:30","15:00","15:30","16:00","16:30","17:00","17:30",
    "18:00","18:30","19:00","19:30","20:00"
  ];

  const DEFAULT_RANGE = "09:00 - 16:00";

  function minutesFromStr(t) {
    if (!t) return 0;
    const [hh, mm] = String(t).split(":").map(Number);
    return (hh || 0) * 60 + (mm || 0);
  }

  function isAfter(a, b) {
    if (!a || !b) return false;
    return minutesFromStr(a) > minutesFromStr(b);
  }

  // Helpers to parse and format hour ranges
  function splitRange(val) {
    if (!val) return { open: "", close: "", closed: false };
    const lower = String(val).toLowerCase();
    if (lower === "closed") return { open: "", close: "", closed: true };
    const m = String(val).match(/(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/);
    if (m) return { open: m[1], close: m[2], closed: false };
    return { open: "", close: "", closed: false };
  }

  function formatRange(open, close, closed) {
    if (closed) return "Closed";
    if (open && close) return `${open} - ${close}`;
    return ""; // empty until both are chosen
  }

  // Convert social links from GraphQL structure to display format - always show all platforms
  const socialLinks = [
    { name: "website", url: company.socialLinks?.website || "", displayName: "Website" },
    { name: "facebook", url: company.socialLinks?.facebook || "", displayName: "Facebook" },
    { name: "instagram", url: company.socialLinks?.instagram || "", displayName: "Instagram" },
    { name: "tiktok", url: company.socialLinks?.tiktok || "", displayName: "TikTok" },
    { name: "youtube", url: company.socialLinks?.youtube || "", displayName: "YouTube" },
    { name: "x", url: company.socialLinks?.x || "", displayName: "X (Twitter)" },
    { name: "whatsapp", url: company.socialLinks?.whatsapp || "", displayName: "WhatsApp" },
    { name: "messenger", url: company.socialLinks?.messenger || "", displayName: "Messenger" },
  ];

  // Social icon map - using proper named icons
  const socialIconMap = {
    website: '/new files/newIcons/Social Media Icons/Advert Set-Up-03.svg', // Website icon (using generic)
    facebook: '/new files/Social Media Icons/Social Media Icons/facebook.svg',
    instagram: '/new files/newIcons/Social Media Icons/Advert Set-Up-04.svg', // Instagram icon
    tiktok: '/new files/newIcons/Social Media Icons/Advert Set-Up-07.svg', // TikTok icon (using generic for now)
    youtube: '/new files/newIcons/Social Media Icons/Advert Set-Up-05.svg', // YouTube icon
    x: '/new files/Social Media Icons/Social Media Icons/twitter.svg', // Using twitter.svg for X
    whatsapp: '/new files/Social Media Icons/Social Media Icons/whatsapp.svg',
    messenger: '/new files/Social Media Icons/Social Media Icons/Advert Set-Up-06.svg', // Messenger icon (confirmed)
  };

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
    setIsDeleting(true);
    setShowDeleteMessage(false);
    
    try {
      const res = await fetch(`https://typical-car-e0b66549b3.strapiapp.com/api/listings/${documentId}`, {
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
  
     
      
      // Show styled success message
      setDeleteMessage("Listing deleted successfully!");
      setShowDeleteMessage(true);
      setIsDeleting(false);
      
      // Auto-refresh the page after 2 seconds
      setTimeout(() => {
        window.location.reload();
      }, 2000);
  
    } catch (error) {
      
      setDeleteMessage("Failed to delete listing.");
      setShowDeleteMessage(true);
      setIsDeleting(false);
    }
  };

  const handleInquiriesRead = useCallback((updatedInquiries) => {
    // Update the listings with read status
    setCompanyListings(prevListings => 
      prevListings.map(listing => {
        // Update inquiries in this listing
        const updatedListingInquiries = (listing.inquiries || listing.inquiries_c || []).map(inq => {
          const updatedInq = updatedInquiries.find(updated => 
            (updated.id === inq.id) || (updated.documentId === inq.documentId)
          );
          return updatedInq || inq;
        });
        
        return {
          ...listing,
          inquiries: listing.inquiries ? updatedListingInquiries : undefined,
          inquiries_c: listing.inquiries_c ? updatedListingInquiries : undefined
        };
      })
    );
  }, []);

  // Handle notification button click - mark all inquiries as "not new"
  const handleNotificationClick = useCallback(async () => {
    const allInquiries = (Array.isArray(companyListings) ? companyListings : []).flatMap(listing =>
      (listing.inquiries || listing.inquiries_c || []).map(inq => ({ 
        ...inq, 
        listingId: listing.documentId
      }))
    );
    
    // Find all "new" inquiries
    const newInquiries = allInquiries.filter(inq => inq.isNew === true);
    
    if (newInquiries.length > 0) {

      
      // Update backend for each new inquiry
      for (const inquiry of newInquiries) {
        try {
          const inquiryId = inquiry.documentId || inquiry.id;
          await fetch(`https://typical-car-e0b66549b3.strapiapp.com/api/inquiries/${inquiryId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              data: {
                isNew: false // Only update isNew, keep isRead as is
              }
            })
          });
        } catch (error) {
         
        }
      }
      
      // Update local state - mark all inquiries as not new
      const updatedInquiries = allInquiries.map(inq => ({
        ...inq,
        isNew: false // Set all to not new
      }));
      
      handleInquiriesRead(updatedInquiries);
    }
    
    // Open the modal
    setViewInquiriesModalOpen(true);
  }, [companyListings, handleInquiriesRead]);

  // Function to navigate to advert creator with company data
  const handleCreateListing = () => {
    // Store company data in sessionStorage to pass to advert creator
    sessionStorage.setItem('advertCreatorCompany', JSON.stringify(company));
    router.push('/manufacturers/manufacturers-Profile-Page/advert-creator');
  };

  // Function to handle saving field changes and updating local state
  const handleSaveField = async (field, value) => {
    try {
      // Update the field in the API
      const updatedData = await updateCompanyField(company.documentId, { [field]: value });
      
      if (updatedData) {
        // Update local state with the new value
        setCompany(prevCompany => ({
          ...prevCompany,
          [field]: value
        }));
        
        // Close edit mode
        setEditingField(null);
        
        // Optional: Show success message
       
      } else {
        // Handle error
        
        alert(`Failed to update ${field}. Please try again.`);
      }
    } catch (error) {
      
      alert(`Error updating ${field}. Please try again.`);
    }
  };

  // Function to handle saving all operating hours changes
  const handleSaveAllOperatingHours = async () => {
    try {
      // Prepare both detailed daily structure and legacy summary
      const legacy = deriveLegacyOperatingHours(dailyHours);

      const operatingHoursUpdate = {
        operatingHoursDaily: dailyHours,
        operatingHours: legacy,
      };

      const updatedData = await updateCompanyField(company.documentId, operatingHoursUpdate);

      if (updatedData) {
        setCompany(prevCompany => ({
          ...prevCompany,
          operatingHoursDaily: dailyHours,
          operatingHours: legacy,
        }));

        // Close edit mode if you're using editingField pattern
        setEditingField(null);
        setEditingOperatingHours({});
      } else {
        alert('Failed to update operating hours. Please try again.');
      }
    } catch (error) {
      alert('Error updating operating hours. Please try again.');
    }
  };

  // Function to handle saving social links changes
  const handleSaveSocialLinks = async (socialLinksData) => {
    try {
      // Format URLs to ensure they have proper protocol
      const formatUrl = (url) => {
        if (!url || url === "#") return "#";
        // If URL doesn't start with http:// or https://, add https://
        return url.match(/^https?:\/\//i) ? url : `https://${url}`;
      };

      // Create the nested socialLinks object for the API with proper payload structure
      const socialLinksPayload = {
        facebook: formatUrl(socialLinksData.facebook) || "#",
        website: formatUrl(socialLinksData.website) || "#",
        instagram: formatUrl(socialLinksData.instagram) || "#",
        tiktok: formatUrl(socialLinksData.tiktok) || "#",
        youtube: formatUrl(socialLinksData.youtube) || "#",
        x: formatUrl(socialLinksData.x) || "#",
        whatsapp: formatUrl(socialLinksData.whatsapp) || "#",
        messenger: formatUrl(socialLinksData.messenger) || "#"
      };

      const socialLinksUpdate = {
        socialLinks: socialLinksPayload
      };
      
      // Update the field in the API
      const updatedData = await updateCompanyField(company.documentId, socialLinksUpdate);
      
      if (updatedData) {
        // Update local state with the new values
        setCompany(prevCompany => ({
          ...prevCompany,
          socialLinks: socialLinksPayload
        }));
        
        // Close edit mode
        setEditingField(null);
        
        // Optional: Show success message
   
      } else {
        // Handle error
        
        alert('Failed to update social links. Please try again.');
      }
    } catch (error) {
      
      alert('Error updating social links. Please try again.');
    }
  };



  // Function to handle logo upload
  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      setIsUploading(true);
      
      // Upload to Cloudinary using shared util (with folder by company)
      const uploadedImage = await uploadToCloudinary(file, company?.name)
      console.log(uploadedImage)
      // Update company with new logo information
      const logoUpdate = {
        logoUrl: uploadedImage.secure_url,
        logoUrlPublicId: uploadedImage.public_id
      };
      
      // Update the field in the API
      const updatedData = await updateCompanyField(company.documentId, logoUpdate);
      
      if (updatedData) {
        // Update local state with the new logo
        setCompany(prevCompany => ({
          ...prevCompany,
          logoUrl: uploadedImage.secure_url,
          logoUrlPublicId: uploadedImage.public_id
        }));
        
        toast({
          title: "Logo updated successfully",
          description: "Your company logo has been updated.",
          variant: "success"
        });
        
        // Auto-refresh the page to display the updated logo
        setTimeout(() => {
          window.location.reload();
        }, 1500); // Wait 1.5 seconds to show the success message before refreshing
      } else {
        // Handle error
        toast({
          title: "Failed to update logo",
          description: "Please try again later.",
          variant: "destructive"
        });
      }
    } catch (error) {
     
      toast({
        title: "Error updating logo",
        description: "An error occurred while updating your logo.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Function to handle profile picture upload
  const handleProfilePicUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setIsUploadingProfilePic(true);

      // Upload to Cloudinary using shared util (with folder by company)
      const uploadedImage = await uploadToCloudinary(file, company?.name);

      const update = {
        profilePicUrl: uploadedImage.secure_url,
        profilePicPublicId: uploadedImage.public_id,
      };

      // Update the field in the API
      const updatedData = await updateCompanyField(company.documentId, update);

      if (updatedData) {
        // Update local state with the new profile picture
        setCompany((prev) => ({
          ...prev,
          profilePicUrl: uploadedImage.secure_url,
          profilePicPublicId: uploadedImage.public_id,
        }));

        toast({
          title: "Profile picture updated",
          description: "Your profile photo has been updated.",
          variant: "success",
        });
      } else {
        toast({
          title: "Failed to update profile photo",
          description: "Please try again later.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error updating profile photo",
        description: "An error occurred while uploading your photo.",
        variant: "destructive",
      });
    } finally {
      setIsUploadingProfilePic(false);
    }
  };

  return (
    <>
      <Header showLogout={isOwner} />
      <div style={{ fontFamily: "Arial, sans-serif", background: "#f9f9f9", minHeight: "100vh", color: "#333" }}>
        {/* Settings and Notification Buttons (only for owner) */}
        {isOwner && (
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "16px 0 0 0", display: "flex", justifyContent: "flex-end", gap: "12px" }}>
            {/* Notification Button */}
            <button
              onClick={handleNotificationClick}
              style={{
                background: "#808080",
                color: "#fff",
                borderRadius: 8,
                padding: "12px 16px",
                fontWeight: 700,
                fontSize: 15,
                border: "none",
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
                transition: "background 0.2s",
                marginBottom: 8,
                display: "flex",
                alignItems: "center",
                gap: "8px",
                position: "relative"
              }}
            >
              <NotificationIcon />
              {notificationCount > 0 && (
                <span style={{
                  position: "absolute",
                  top: "-8px",
                  right: "-8px",
                  background: "#ff4444",
                  color: "#fff",
                  borderRadius: "50%",
                  width: "20px",
                  height: "20px",
                  fontSize: "12px",
                  fontWeight: "700",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "2px solid #fff"
                }}>
                  {notificationCount > 99 ? "99+" : notificationCount}
                </span>
              )}
            </button>
            
            {/* Settings Button */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  style={{
                    background: "#808080",
                    color: "#fff",
                    borderRadius: 8,
                    padding: "12px 16px",
                    fontWeight: 700,
                    fontSize: 15,
                    border: "none",
                    cursor: "pointer",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
                    transition: "background 0.2s",
                    marginBottom: 8,
                    display: "flex",
                    alignItems: "center",
                    gap: "8px"
                  }}
                >
                  <SettingsIcon />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => window.location.href = `/manufacturers/manufacturers-Profile-Page`}>
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleCreateListing}>
                  + Create Listing
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
        {/* Combined Profile Card - all info in one card */}
        <div style={{ background: '#fff', borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.07)', padding: 20, maxWidth: 1200, margin: '24px auto 0 auto', display: 'flex', flexDirection: mobile ? 'column' : 'row', gap: mobile ? 16 : 32, alignItems: mobile ? 'stretch' : 'flex-start' }}>
          {/* Left Column */}
          <div style={{ flex: 2, minWidth: 0, order: mobile ? 0 : 0 }}>
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
                  <button onClick={() => handleSaveField('name', editValue)} style={{ marginLeft: 4, color: '#28a745', fontWeight: 700, border: 'none', background: 'none', cursor: 'pointer' }}>Save</button>
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
            {/* MOBILE-ONLY: Logo directly under Company Name */}
            {mobile && (
              <div>
                <div style={{ fontSize: 11, color: '#888', fontWeight: 700, marginBottom: 6 }}>Company Logo</div>
                <div
                  style={{
                    border: '2px solid #00baff',
                    borderRadius: 8,
                    background: '#fff',
                    padding: 8,
                    position: 'relative',
                    width: '100%',
                    height: 140,
                    marginBottom: 12,
                    cursor: isOwner ? 'pointer' : 'default',
                    overflow: 'hidden',
                  }}
                  onClick={() => isOwner && fileInputRef.current?.click()}
                >
                  <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                    <Image
                      src={`${company.logoUrl || '/placeholder-logo.svg'}?t=${Date.now()}`}
                      alt="Company Logo"
                      fill
                      key={company.logoUrl}
                      style={{ objectFit: 'contain' }}
                      sizes="100vw"
                    />
                    {isOwner && isUploading && (
                      <div style={{
                        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        backgroundColor: 'rgba(0,0,0,0.3)'
                      }}>
                        <Upload style={{ width: 24, height: 24, color: 'white' }} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
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

            {/* Horizontal time slots row (owner-only) */}
            {isOwner && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'stretch',
                    gap: 12,
                    overflowX: 'auto',
                    padding: '8px 4px',
                    marginBottom: 8,
                  }}
                >
                  <div style={{ display: 'flex', gap: 12 }}>
                    {operatingHours.map((h) => (
                      <div
                        key={h.field}
                        style={{
                          padding: '10px 14px',
                          borderRadius: 9999,
                          background: '#ffffff',
                          border: '1px solid #eee',
                          boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
                          fontWeight: 700,
                          fontSize: 14,
                          color: '#222',
                          whiteSpace: 'nowrap',
                          minWidth: 72,
                          textAlign: 'center',
                          userSelect: 'none',
                        }}
                      >
                        {h.time}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {editingField === 'operatingHours' ? (
              <div className="mt-3">
                {(() => {
                  const currentKey = OPERATING_DAY_ORDER[Math.min(operatingDayIndex, OPERATING_DAY_ORDER.length - 1)];
                  const currentMeta = operatingHours.find(h => h.field === currentKey) || {};
                  const currentValue = editingOperatingHours[currentKey] ?? currentMeta.time;
                  const current = splitRange(currentValue);

                  const chipBase = {
                    padding: '10px 14px',
                    borderRadius: 9999,
                    background: '#ffffff',
                    border: '1px solid #eee',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
                    fontWeight: 700,
                    fontSize: 14,
                    color: '#222',
                    whiteSpace: 'nowrap',
                    userSelect: 'none',
                    cursor: 'pointer',
                    marginRight: 8,
                    marginBottom: 8,
                  };

                  const renderChip = (id, label, selected, onClick) => (
                    <div
                      key={id}
                      onClick={onClick}
                      style={{
                        ...chipBase,
                        background: selected ? '#2f55d4' : '#ffffff',
                        color: selected ? '#ffffff' : '#222222',
                        border: selected ? '1px solid #2f55d4' : '1px solid #eee',
                      }}
                      role="button"
                      aria-pressed={selected}
                      tabIndex={0}
                      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClick()}
                    >
                      {label}
                    </div>
                  );

                  const advanceToNextDay = () => {
                    if (operatingDayIndex < OPERATING_DAY_ORDER.length - 1) {
                      setOperatingDayIndex(operatingDayIndex + 1);
                      setTempOpenTime(null);
                      setOperatingPhase('open');
                    } else {
                      setOperatingPhase('review');
                      setTempOpenTime(null);
                    }
                  };

                  const handlePickOpen = (t) => {
                    setTempOpenTime(t);
                    setOperatingPhase('close');
                  };

                  const handlePickClose = (t) => {
                    const open = tempOpenTime || current.open || TIME_SLOTS[0];
                    setEditingOperatingHours(prev => ({
                      ...prev,
                      [currentKey]: formatRange(open, t, false),
                    }));
                    setTempOpenTime(null);
                    setOperatingPhase('open');
                    advanceToNextDay();
                  };

                  const handleMarkClosed = () => {
                    setEditingOperatingHours(prev => ({
                      ...prev,
                      [currentKey]: 'Closed',
                    }));
                    advanceToNextDay();
                  };

                  return (
                    <div style={{ borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', color: '#111827', padding: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <div style={{ fontSize: 14, fontWeight: 600 }}>
                          {operatingPhase === 'review'
                            ? 'Review & Save Operating Hours'
                            : `Set ${currentMeta.day || 'Operating Hours'}`}
                        </div>
                        <div style={{ fontSize: 12, color: '#6b7280' }}>
                          {operatingPhase === 'review'
                            ? 'All days set'
                            : `Step ${operatingDayIndex + 1} of ${OPERATING_DAY_ORDER.length}`}
                        </div>
                      </div>

                      {operatingPhase !== 'review' ? (
                        <div>
                          {operatingPhase === 'open' ? (
                            <>
                              <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>Pick open time or mark Closed</div>
                              <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                                {renderChip('closed-chip', 'Closed', current.closed === true, handleMarkClosed)}
                                {TIME_SLOTS.map((t) =>
                                  renderChip(`open-${t}`, t, t === current.open, () => handlePickOpen(t))
                                )}
                              </div>
                            </>
                          ) : (
                            <>
                              <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>Pick close time</div>
                              <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                                {(tempOpenTime ? TIME_SLOTS.filter(t => isAfter(t, tempOpenTime)) : TIME_SLOTS).map((t) =>
                                  renderChip(`close-${t}`, t, t === current.close, () => handlePickClose(t))
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {operatingHours.map((h) => (
                            <div key={h.field} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 14 }}>
                              <span style={{ color: '#6b7280' }}>{h.day}</span>
                              <span style={{ fontWeight: 600 }}>
                                {editingOperatingHours[h.field] ?? h.time}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingOperatingHours({});
                            setOperatingPhase('idle');
                            setTempOpenTime(null);
                            setOperatingDayIndex(0);
                            setEditingField(null);
                          }}
                          style={{ padding: '6px 12px', border: '1px solid #e5e7eb', borderRadius: 8, background: '#f3f4f6', color: '#111827', fontSize: 14, cursor: 'pointer' }}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveAllOperatingHours}
                          style={{ padding: '6px 12px', border: '1px solid #e5e7eb', borderRadius: 8, background: '#2563eb', color: '#fff', fontSize: 14, cursor: 'pointer' }}
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>
            ) : (
              <>
                <div style={{ fontSize: 15, margin: '0 0 8px 0', display: 'grid', gridTemplateColumns: 'auto auto', rowGap: 2, columnGap: 16 }}>
                  {operatingHours.map((h) => (
                    <React.Fragment key={h.field}>
                      <div style={{ fontWeight: 700 }}>{h.day}</div>
                      <div>{h.time}</div>
                    </React.Fragment>
                  ))}
                </div>
                {isOwner && (
                  <button 
                    style={{ background: 'none', border: 'none', marginLeft: 2, cursor: 'pointer' }}
                    onClick={() => {
                      setEditingField('operatingHours');
                      // Initialize editing state with current values
                      setEditingOperatingHours({
                        monToFri: company.operatingHours?.monToFri || "09:00 - 16:00",
                        saturday: company.operatingHours?.saturday || "08:30 - 14:00", 
                        sunday: company.operatingHours?.sunday || "Closed",
                        publicHoliday: company.operatingHours?.publicHoliday || "08:30 - 14:00"
                      });
                      setOperatingDayIndex(0);
                      setOperatingPhase('open');
                      setTempOpenTime(null);
                      setSelectedDayFilters([]); // start with "All"
                    }}
                  >
                    <Edit2 style={{ width: 16, height: 16, color: '#888' }} />
                  </button>
                )}
              </>
            )}
            {/* Company Profile Label */}
            <div style={{ fontSize: 11, color: '#888', fontWeight: 700, marginBottom: 2 }}>Company Profile</div>
            {editingField === 'description' ? (
              <div style={{ marginBottom: 8 }}>
                <textarea
                  value={editValue}
                  onChange={e => setEditValue(e.target.value)}
                  style={{ 
                    width: '100%',
                    minHeight: '120px',
                    padding: '12px', 
                    borderRadius: 8, 
                    border: '1px solid #ccc', 
                    fontSize: 15,
                    fontFamily: 'Arial, sans-serif',
                    resize: 'vertical'
                  }}
                  placeholder="Enter company description..."
                />
                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                  <button 
                    onClick={() => handleSaveField('description', editValue)}
                    style={{ 
                      color: '#28a745', 
                      fontWeight: 700, 
                      border: 'none', 
                      background: 'none', 
                      cursor: 'pointer',
                      fontSize: 14
                    }}
                  >
                    Save
                  </button>
                  <button 
                    onClick={() => setEditingField(null)}
                    style={{ 
                      color: '#888', 
                      fontWeight: 700, 
                      border: 'none', 
                      background: 'none', 
                      cursor: 'pointer',
                      fontSize: 14
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div style={{ border: '1px solid #e0e0e0', borderRadius: 8, background: '#fafbfc', padding: 14, fontSize: 15, marginBottom: 8 }}>
                  <span>{company.description || 'No company description provided.'}</span>
                </div>
                {isOwner && (
                  <button 
                    style={{ background: 'none', border: 'none', marginLeft: 2, cursor: 'pointer' }}
                    onClick={() => {
                      setEditingField('description');
                      setEditValue(company.description || '');
                    }}
                  >
                    <Edit2 style={{ width: 16, height: 16, color: '#888' }} />
                  </button>
                )}
              </>
            )}
            {/* Profile Photo & Promo Video (replacing old promo section) */}
            <div style={{ fontSize: 11, color: '#888', fontWeight: 700, marginBottom: 6 }}>
              Profile Photo & Promo Video
            </div>
           <div>
              <CreateBranchModal documentId={company.documentId }/>
           </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'stretch', marginBottom: 8 }}>
              {/* Profile Picture Box */}
              <div
                style={{
                  border: '2px solid #00baff',
                  borderRadius: 8,
                  background: '#fff',
                  padding: 8,
                  position: 'relative',
                  minWidth: 240,
                  minHeight: 120,
                  flex: '1 1 280px',
                  cursor: isOwner ? 'pointer' : 'default'
                }}
                onClick={() => isOwner && profilePicInputRef.current?.click()}
              >
                <div style={{ position: 'absolute', top: 8, left: 8, fontSize: 11, color: '#888', fontWeight: 700 }}>
                  Profile Picture
                </div>
                <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                  <Image
                    src={`${company.profilePicUrl || '/placeholder-logo.svg'}?t=${Date.now()}`}
                    alt="Profile Picture"
                    width={220}
                    height={110}
                    style={{ objectFit: 'cover', width: '100%', height: '100%', borderRadius: 6 }}
                  />
                  {isOwner && isUploadingProfilePic && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'rgba(0,0,0,0.3)'
                      }}
                    >
                      <Upload style={{ width: 24, height: 24, color: 'white' }} />
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  ref={profilePicInputRef}
                  style={{ display: 'none' }}
                  accept="image/*"
                  onChange={handleProfilePicUpload}
                />
              </div>

              {/* Promo Video Box - Locked */}
              <div
                style={{
                  border: '2px dashed #ccc',
                  borderRadius: 8,
                  background: '#fafafa',
                  padding: 8,
                  position: 'relative',
                  minWidth: 240,
                  minHeight: 120,
                  flex: '1 1 280px',
                  cursor: 'pointer'
                }}
                onClick={() => setShowVideoSlotModal(true)}
                title="Promo video slot is locked"
              >
                <div style={{ position: 'absolute', top: 8, left: 8, fontSize: 11, color: '#888', fontWeight: 700 }}>
                  Promo Video (Locked)
                </div>
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>
                  <Lock style={{ width: 24, height: 24, marginRight: 6 }} />
                  <span style={{ fontWeight: 700 }}>Contact TombstonesFinder</span>
                </div>
              </div>
            </div>

            {/* Warning Modal */}
            {showVideoSlotModal && (
              <div
                style={{
                  position: 'fixed',
                  top: 0, left: 0, right: 0, bottom: 0,
                  background: 'rgba(0,0,0,0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 9999
                }}
                onClick={() => setShowVideoSlotModal(false)}
              >
                <div
                  style={{ background: '#fff', padding: 20, borderRadius: 8, maxWidth: 420, width: '90%', textAlign: 'center' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>Promo Video Slot</div>
                  <div style={{ fontSize: 14, color: '#444', marginBottom: 16 }}>
                    Contact TombstonesFinder to purchase a video slot.
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
                    <a
                      href="mailto:info@tombstonesfinder.com"
                      style={{ background: '#00baff', color: '#fff', padding: '8px 12px', borderRadius: 6, textDecoration: 'none', fontWeight: 700 }}
                    >
                      Contact
                    </a>
                    <button
                      onClick={() => setShowVideoSlotModal(false)}
                      style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #ccc', background: '#f5f5f5', fontWeight: 700 }}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          {/* Right Column */}
          <div style={{ flex: 1, minWidth: 220, alignSelf: 'flex-start', textAlign: mobile ? 'left' : 'right', paddingLeft: mobile ? 8 : undefined, boxSizing: 'border-box', order: mobile ? 1 : 1 }}>
            <div style={{ fontSize: 11, color: '#888', fontWeight: 700, marginBottom: 6, textAlign: 'center', width: '100%', display: mobile ? 'none' : 'block' }}>Company Logo</div>
            <div 
              style={{ 
                border: '2px solid #00baff', 
                borderRadius: 8, 
                background: '#fff', 
                padding: 8, 
                display: mobile ? 'none' : 'inline-block', 
                position: 'relative', 
                minWidth: 240, 
                minHeight: 120, 
                marginBottom: 16,
                cursor: isOwner ? 'pointer' : 'default'
              }}
              onClick={() => isOwner && fileInputRef.current?.click()}
            >
              <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                <Image 
                  src={`${company.logoUrl || '/placeholder-logo.svg'}?t=${Date.now()}`} 
                  alt="Company Logo" 
                  width={220} 
                  height={110} 
                  key={company.logoUrl} 
                  style={{ objectFit: 'contain', display: 'block', margin: '0 auto' }} 
                />
                {isOwner && isUploading && (
                  <div style={{ 
                    position: 'absolute', 
                    top: 0, 
                    left: 0, 
                    right: 0, 
                    bottom: 0, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    backgroundColor: 'rgba(0,0,0,0.3)' 
                  }}>
                    <Upload style={{ width: 24, height: 24, color: 'white' }} />
                  </div>
                )}
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                style={{ display: 'none' }} 
                accept="image/*"
                onChange={handleLogoUpload}
              />
            </div>
            {isOwner && !mobile && (
              <div style={{ textAlign: 'center', fontSize: 12, color: '#666', marginBottom: 8 }}>
                {isUploading ? 'Uploading...' : 'Click to update logo'}
              </div>
            )}

            {/* Socials label */}
            <div style={{ fontSize: 11, color: '#888', fontWeight: 700, marginBottom: 2, marginLeft: mobile ? 0 : 80, textAlign: 'left' }}>Website & Social Media Links</div>
            {editingField === 'socialLinks' ? (
              <div style={{ marginLeft: mobile ? 0 : 80, marginBottom: 8 }}>
                {socialLinks.map((social) => (
                  <div key={social.name} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span style={{ width: 18, height: 18, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Image src={socialIconMap[social.name] || ''} alt={social.name} width={18} height={18} />
                    </span>
                    <div style={{ minWidth: 80, fontSize: 14, fontWeight: 700 }}>
                      {social.displayName}:
                    </div>
                    <input
                      value={editingSocialLinks[social.name] || ''}
                      onChange={e => setEditingSocialLinks(prev => ({
                        ...prev,
                        [social.name]: e.target.value
                      }))}
                      style={{ 
                        flex: 1,
                        padding: '4px 8px', 
                        borderRadius: 4, 
                        border: '1px solid #ccc', 
                        fontSize: 14,
                        fontFamily: 'Arial, sans-serif'
                      }}
                      placeholder={`Enter ${social.displayName} URL`}
                    />
                  </div>
                ))}
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  <button 
                    onClick={() => handleSaveSocialLinks(editingSocialLinks)}
                    style={{ 
                      color: '#28a745', 
                      fontWeight: 700, 
                      border: 'none', 
                      background: 'none', 
                      cursor: 'pointer',
                      fontSize: 14
                    }}
                  >
                    Save All
                  </button>
                  <button 
                    onClick={() => {
                      setEditingField(null);
                      setEditingSocialLinks({});
                    }}
                    style={{ 
                      color: '#888', 
                      fontWeight: 700, 
                      border: 'none', 
                      background: 'none', 
                      cursor: 'pointer',
                      fontSize: 14
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Socials vertical list with icons - always show all platforms */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: 4,
                    width: '100%',
                    marginLeft: mobile ? 0 : 80,
                    paddingLeft: 0,
                  }}
                >
                  {socialLinks.map((social, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%' }}>
                      <span style={{ width: 18, height: 18, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Image src={socialIconMap[social.name] || ''} alt={social.name} width={18} height={18} />
                      </span>
                      {social.url && social.url !== "#" ? (
                        <Link 
                          href={social.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{ color: '#00baff', fontSize: 15, fontWeight: 700, textDecoration: 'underline', display: 'inline-block', minWidth: 70 }}
                        >
                          {social.displayName}
                        </Link>
                      ) : (
                        <span style={{ color: '#888', fontSize: 15, fontWeight: 700, display: 'inline-block', minWidth: 70, fontStyle: 'italic' }}>
                          {social.displayName} (not set)
                        </span>
                      )}
                    </div>
                  ))}
                </div>
                {isOwner && (
                  <button 
                    style={{ background: 'none', border: 'none', marginLeft: mobile ? 0 : 82, marginTop: 4, cursor: 'pointer' }}
                    onClick={() => {
                      setEditingField('socialLinks');
                      // Initialize editing state with current values
                      setEditingSocialLinks({
                        website: company.socialLinks?.website || '',
                        facebook: company.socialLinks?.facebook || '',
                        instagram: company.socialLinks?.instagram || '',
                        tiktok: company.socialLinks?.tiktok || '',
                        youtube: company.socialLinks?.youtube || '',
                        x: company.socialLinks?.x || '',
                        whatsapp: company.socialLinks?.whatsapp || '',
                        messenger: company.socialLinks?.messenger || '',
                      });
                    }}
                  >
                    <Edit2 style={{ width: 16, height: 16, color: '#888' }} />
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Listings Header */}
        <div style={{ background: "#fff", padding: "12px 16px ", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #e0e0e0", maxWidth: 1200, margin: "32px auto 28px auto" }}>
          {isOwner && (
            <div style={{ fontSize: 13, color: "#888" }}>
              Current Package: <span style={{ color: "#28a745", fontWeight: 700 ,textTransform: 'uppercase' }}>{company.packageType || 'Premium'}</span> &nbsp; <Link href="#" style={{ color: "#007bff", fontWeight: 700 }}>Click here to UPGRADE</Link>
            </div>
          )}
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
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: mobile ? '1fr' : '1fr 1fr',
            gap: mobile ? 20 : 40,
            maxWidth: 1200,
            margin: '0 auto',
            alignItems: 'stretch'
          }}
        >
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
            .slice(0, visibleCount)
            .map((listing, idx) => (
              <div key={listing.documentId || listing.id} style={{ width: '100%', height: '100%', position: 'relative' }}>
                <PremiumListingCard 
                  listing={{
                    ...listing,
                    company: {
                      name: company.name,
                      logoUrl: company.logoUrl || company.logo || '/placeholder-logo.svg',
                      location: company.location || 'location not set',
                      latitude: company.latitude,
                      longitude: company.longitude,
                      slug: company.slug
                    },
                    manufacturer: company.name,
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
                        <button style={{ background: '#808080', border: 'none', borderRadius: 6, padding: '6px 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                          <SettingsIcon />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => window.location.href = `/manufacturers/manufacturers-Profile-Page/update-listing/${listing.documentId || listing.id}`}>Edit Listing</DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDuplicate(listing)}
                          disabled={isDuplicating}
                          style={{
                            opacity: isDuplicating ? 0.6 : 1,
                            cursor: isDuplicating ? 'not-allowed' : 'pointer'
                          }}
                        >
                          {isDuplicating ? "Duplicating..." : "Duplicate Listing"}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setListingToDelete(listing);
                            setShowConfirmDialog(true);
                          }}
                          disabled={isDeleting}
                          style={{
                            opacity: isDeleting ? 0.6 : 1,
                            cursor: isDeleting ? 'not-allowed' : 'pointer'
                          }}
                        >
                          {isDeleting ? "Deleting..." : "Delete Listing"}
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
          onInquiriesRead={handleInquiriesRead}
        />

        {/* Manufacturer Location Modal */}
        <ManufacturerLocationModal
          isOpen={showLocationModal}
          onClose={closeLocationModal}
          company={company}
          onLocationUpdate={handleLocationUpdate}
        />

        {/* Custom Confirmation Dialog */}
        {showConfirmDialog && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}>
            <div style={{
              background: '#fff',
              borderRadius: '12px',
              padding: '24px',
              maxWidth: '400px',
              width: '90%',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
              animation: 'slideIn 0.3s ease'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: '16px'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: '#fef3c7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '16px'
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <h3 style={{
                    margin: 0,
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#1f2937'
                  }}>
                    Delete Listing
                  </h3>
                  <p style={{
                    margin: '4px 0 0 0',
                    fontSize: '14px',
                    color: '#6b7280'
                  }}>
                    This action cannot be undone
                  </p>
                </div>
              </div>
              
              <p style={{
                margin: '0 0 24px 0',
                fontSize: '16px',
                color: '#374151',
                lineHeight: '1.5'
              }}>
                Are you sure you want to delete <strong>"{listingToDelete?.title || 'this listing'}"</strong>? This action cannot be undone.
              </p>
              
              <div style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'flex-end'
              }}>
                <button
                  onClick={() => {
                    setShowConfirmDialog(false);
                    setListingToDelete(null);
                  }}
                  style={{
                    padding: '10px 20px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    backgroundColor: '#fff',
                    color: '#374151',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.backgroundColor = '#f9fafb';
                    e.target.style.borderColor = '#9ca3af';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.backgroundColor = '#fff';
                    e.target.style.borderColor = '#d1d5db';
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowConfirmDialog(false);
                    if (listingToDelete) {
                      handleDelete(listingToDelete.documentId);
                    }
                    setListingToDelete(null);
                  }}
                  style={{
                    padding: '10px 20px',
                    border: 'none',
                    borderRadius: '8px',
                    backgroundColor: '#dc2626',
                    color: '#fff',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.backgroundColor = '#b91c1c';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.backgroundColor = '#dc2626';
                  }}
                >
                  Delete Listing
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Success/Error Message */}
        {showDeleteMessage && (
          <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '16px 24px',
            borderRadius: '8px',
            color: '#fff',
            fontWeight: 'bold',
            zIndex: 1000,
            background: deleteMessage.includes('Error') || deleteMessage.includes('Failed') ? '#dc3545' : '#28a745',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            animation: 'slideIn 0.3s ease'
          }}>
            {deleteMessage}
          </div>
        )}

      </div>
    </>
  );
}
