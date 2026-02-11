import Image from "next/image";
import Link from "next/link";
import { Star, MapPin, Edit2, Upload, Lock, RefreshCw, Activity, Trash2, X } from "lucide-react";
import React, { useState, useEffect, useRef, useCallback, useMemo, forwardRef } from "react";
import { Virtuoso, VirtuosoGrid } from 'react-virtuoso';
import { useRouter, useSearchParams } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { PremiumListingCard } from "@/components/premium-listing-card";
import Header from "@/components/Header";
import dynamic from 'next/dynamic';

const ViewInquiriesModal = dynamic(() => import("@/components/ViewInquiriesModal"), { ssr: false });
const CreateSpecialModal = dynamic(() => import("@/components/CreateSpecialModal"), { ssr: false });
const ManufacturerLocationModal = dynamic(() => import("@/components/ManufacturerLocationModal"), { ssr: false });
const CreateBranchModal = dynamic(() => import("@/components/CreatebranchModal"), { ssr: false });
const BranchSelector = dynamic(() => import("@/components/BranchSelector"), { ssr: false });
const BranchSelectionModal = dynamic(() => import("@/components/BranchSelectionModal"), { ssr: false });
const OperatingHoursModal = dynamic(() => import("@/components/OperatingHoursModal"), { ssr: false });

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useManufacturerLocation } from "@/hooks/useManufacturerLocation";
import { updateCompanyField } from "@/graphql/mutations/updateCompany";
import { toast } from "@/hooks/use-toast";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { useApolloClient } from '@apollo/client';
import { GET_LISTING_BY_ID } from '@/graphql/queries/getListingById';
import { GET_LISTING_CATEGORY } from '@/graphql/queries/getListingCategory';
import CompanyMediaUpload from "@/components/CompanyMediaUpload";
import { updateBranch } from "@/graphql/mutations/updateBranch";
import { useGuestLocation } from "@/hooks/useGuestLocation";
import ListingCardItem from "./ListingCardItem";
import { getIconPath, OPERATING_DAY_ORDER, SOCIAL_ICON_MAP } from "./constants";
import { useDebounce } from "@/hooks/useDebounce";

  // Helper function to find a branch by name
const findBranchByName = (branchName, branches) => {
  if (!branchName || !branches || !branches.length) return null;
  return branches.find(branch => branch.name === branchName) || null;
};


// SVG Settings (gear) icon component
const SettingsIcon = (props) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M14.2788 2.15224C13.9085 2 13.439 2 12.5 2C11.561 2 11.0915 2 10.7212 2.15224C10.2274 2.35523 9.83509 2.74458 9.63056 3.23463C9.53719 3.45834 9.50065 3.7185 9.48635 4.09799C9.46534 4.65568 9.17716 5.17189 8.69017 5.45093C8.20318 5.72996 7.60864 5.71954 7.11149 5.45876C6.77318 5.2813 6.52789 5.18262 6.28599 5.15102C5.75609 5.08178 5.22018 5.22429 4.79616 5.5472C4.47814 5.78938 4.24339 6.1929 3.7739 6.99993C3.30441 7.80697 3.06967 8.21048 3.01735 8.60491C2.94758 9.1308 3.09118 9.66266 3.41655 10.0835C3.56506 10.2756 3.77377 10.437 4.0977 10.639C4.57391 10.936 4.88032 11.4419 4.88029 12C4.88026 12.5581 4.57386 13.0639 4.0977 13.3608C3.77372 13.5629 3.56497 13.7244 3.41645 13.9165C3.09108 14.3373 2.94749 14.8691 3.01725 15.395C3.06957 15.7894 3.30432 16.193 3.7738 17C4.24329 17.807 4.47804 18.2106 4.79606 18.4527C5.22008 18.7756 5.75599 18.9181 6.28589 18.8489C6.52778 18.8173 6.77305 18.7186 7.11133 18.5412C7.60852 18.2804 8.2031 18.27 8.69012 18.549C9.17714 18.8281 9.46533 19.3443 9.48635 19.9021C9.50065 20.2815 9.53719 20.5417 9.63056 20.7654C9.83509 21.2554 10.2274 21.6448 10.7212 21.8478C11.0915 22 11.561 22 12.5 22C13.439 22 13.9085 22 14.2788 21.8478C14.7726 21.6448 15.1649 21.2554 15.3694 20.7654C15.4628 20.5417 15.4994 20.2815 15.5137 19.902C15.5347 19.3443 15.8228 18.8281 16.3098 18.549C16.7968 18.2699 17.3914 18.2804 17.8886 18.5412C18.2269 18.7186 18.4721 18.8172 18.714 18.8488C19.2439 18.9181 19.7798 18.7756 20.2038 18.4527C20.5219 18.2105 20.7566 17.807 21.2261 16.9999C21.6956 16.1929 21.9303 15.7894 21.9827 15.395C22.0524 14.8691 21.9088 14.3372 21.5835 13.9164C21.4349 13.7243 21.2262 13.5628 20.9022 13.3608C20.4261 13.0639 20.1197 12.558 20.1197 11.9999C20.1197 11.4418 20.4261 10.9361 20.9022 10.6392C21.2263 10.4371 21.435 10.2757 21.5836 10.0835C21.9089 9.66273 22.0525 9.13087 21.9828 8.60497C21.9304 8.21055 21.6957 7.80703 21.2262 7C20.7567 6.19297 20.522 5.78945 20.2039 5.54727C19.7799 5.22436 19.244 5.08185 18.7141 5.15109C18.4722 5.18269 18.2269 5.28136 17.8887 5.4588C17.3915 5.71959 16.7969 5.73002 16.3099 5.45096C15.8229 5.17191 15.5347 4.65566 15.5136 4.09794C15.4993 3.71848 15.4628 3.45833 15.3694 3.23463C15.1649 2.74458 14.7726 2.35523 14.2788 2.15224ZM12.5 15C14.1695 15 15.5228 13.6569 15.5228 12C15.5228 10.3431 14.1695 9 12.5 9C10.8305 9 9.47716 10.3431 9.47716 12C9.47716 13.6569 10.8305 15 12.5 15Z"
      fill="#fff"
    />
  </svg>
);

// SVG Notification (bell) icon component
const NotificationIcon = (props) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M10.3 21a1.94 1.94 0 0 0 3.4 0"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// SVG Branch Options icon component
const BranchOptionsIcon = (props) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M6 3v12"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle
      cx="6"
      cy="18"
      r="3"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle
      cx="18"
      cy="6"
      r="3"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M18 9v6a3 3 0 0 1-3 3H6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

function isMobile() {
  if (typeof window === "undefined") return false;
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

import { addListingToBranchListing, addListingToBranch } from "@/lib/addListingToBranch";

// Helper to slugify text
const slugify = (s) =>
  String(s || "")
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

export default function ManufacturerProfileEditor({
  isOwner,
  company: initialCompany,
  listings,
  onVideoClick,
  branchButton,
  onRefresh,
  isRefreshing,
  autoRefreshEnabled,
  onToggleAutoRefresh,
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mobile, setMobile] = useState(false);
  const [showBannerAdUpdate, setShowBannerAdUpdate] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const sortModalRef = useRef();
  const [sortBy, setSortBy] = useState("Price");
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const isMounted = useRef(false);

  const gridComponents = useMemo(() => ({
    List: forwardRef(({ style, children, fixedItemHeight, ...props }, ref) => (
      <div
        ref={ref}
        style={{
          ...style,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 40,
          alignItems: "stretch",
        }}
        {...props}
      >
        {children}
      </div>
    )),
    Item: forwardRef(({ fixedItemHeight, ...props }, ref) => (
      <div {...props} ref={ref} />
    ))
  }), []);

  // Load persisted sort option on mount
  useEffect(() => {
    const savedSort = localStorage.getItem("manufacturerProfileSortBy");
    if (savedSort) {
      setSortBy(savedSort);
    }
    // Mark as mounted after checking storage
    setTimeout(() => {
      isMounted.current = true;
    }, 0);
  }, []);

  // Persist sort option when changed - but only after initial mount
  useEffect(() => {
    if (isMounted.current) {
      localStorage.setItem("manufacturerProfileSortBy", sortBy);
    }
  }, [sortBy]);

  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState("");
  
  const [selectedBranch, setSelectedBranch] = useState(null);
  const handleBranchSelect = (branch) => {
    setSelectedBranch(branch);
  };
  const [branchFromUrl, setBranchFromUrl] = useState(null);
  const [filteredListings, setFilteredListings] = useState(listings);
  const [companyListings, setCompanyListings] = useState(listings || []);
  const [notificationCount, setNotificationCount] = useState(0);
  // Single-step Operating Hours editor state

  const [operatingDayIndex, setOperatingDayIndex] = useState(0); // 0..3
  const [operatingPhase, setOperatingPhase] = useState("idle"); // 'idle' | 'open' | 'close' | 'review'
  const [tempOpenTime, setTempOpenTime] = useState(null); // holds selected open time before choosing close
  // Day-type filters; when empty, all are active
  const [selectedDayFilters, setSelectedDayFilters] = useState([]); // array of fields
  const activeDayOrder = selectedDayFilters.length
    ? selectedDayFilters
    : OPERATING_DAY_ORDER;
  const [editingSocialLinks, setEditingSocialLinks] = useState({});
  const [modals, setModals] = useState({
    createSpecial: false,
    viewInquiries: false,
    createBranch: false,
    branchSelector: false,
    branchSelection: false,
    operatingHours: false,
    videoSlot: false,
    confirmDelete: false,
  });
  const toggleModal = useCallback((name, value) => setModals(prev => ({ ...prev, [name]: value })), []);

  const [selectedListing, setSelectedListing] = useState(null);
  // Bulk selection state
  const [selectedListingIds, setSelectedListingIds] = useState(new Set());
  const [selectionMode, setSelectionMode] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  
  const [visibleCount, setVisibleCount] = useState(Infinity);

  // Delete success message state
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState("");
  const [showDeleteMessage, setShowDeleteMessage] = useState(false);

  // Custom confirmation dialog state - consolidated
  const [listingToDelete, setListingToDelete] = useState(null);
// --- Added local state for removing listing from a branch ---
const [selectedBranchIdToDisconnect, setSelectedBranchIdToDisconnect] = useState("");
const [disconnecting, setDisconnecting] = useState(false);
const [disconnectError, setDisconnectError] = useState("");
const [disconnectSuccess, setDisconnectSuccess] = useState(false);

  // Mobile menu state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileDropdown, setMobileDropdown] = useState(null);

  // Mobile menu toggle function
  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Mobile dropdown toggle function
  const handleMobileDropdownToggle = (dropdown) => {
    setMobileDropdown(mobileDropdown === dropdown ? null : dropdown);
  };

  // Logo upload state
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  // Banner Ad upload state
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const bannerInputRef = useRef(null);
  // Profile picture upload state + Video modal
  const profilePicInputRef = useRef(null);
  const [isUploadingProfilePic, setIsUploadingProfilePic] = useState(false);
  const [selectedListingForBranch, setSelectedListingForBranch] = useState(null);
  const [isBulkAssigning, setIsBulkAssigning] = useState(false);

  // Company state management
  const [company, setCompany] = useState(initialCompany);
  // Ensure branches appear immediately after login without requiring a prior reload
  useEffect(() => {
    setCompany(initialCompany);
  }, [initialCompany]);
  
  // Handle saving operating hours
  const handleSaveOperatingHours = async ({ operatingHours }) => {
    if (!company?.documentId) {
      console.error("Company ID not found");
      return;
    }
    
    try {
      // Create the payload with the exact structure required by the backend
      const updatePayload = {
        operatingHours: {
          monToFri: operatingHours.monToFri || "",
          saturday: operatingHours.saturday || "",
          sunday: operatingHours.sunday || "",
          publicHoliday: operatingHours.publicHoliday || ""
        }
      };
      
     
      
      // Call the updateCompanyField function
      const result = await updateCompanyField(company.documentId, updatePayload);
      
      if (result) {
        // Update local state with the new operating hours
        setCompany(prev => ({
          ...prev,
          operatingHours: updatePayload.operatingHours
        }));
        
        return result;
      } else {
        throw new Error("Failed to update operating hours");
      }
    } catch (error) {
      console.error("Error updating operating hours:", error);
      throw error;
    }
  };
  
  // Extract branch parameter from URL and filter listings
  useEffect(() => {
    const branchParam = searchParams.get('branch');
    if (branchParam && company?.branches?.length) {
      const branch = company.branches.find(b => b.name === branchParam || b.documentId === branchParam);
      if (branch) {
        setBranchFromUrl(branch);
        // Filter listings to show only those associated with this branch
        let branchListings = listings.filter(listing => 
          listing.branches?.some(b => b.documentId === branch.documentId)
        );

        // Override price with branch specific price if available
        branchListings = branchListings.map(listing => {
          const branchListing = listing.branch_listings?.find(bl => 
            bl.branch?.documentId === branch.documentId
          );
          if (branchListing?.price) {
            return { ...listing, price: branchListing.price };
          }
          return listing;
        });
        
        // Apply category filter
        if (categoryFilter !== "All Categories") {
          branchListings = branchListings.filter(listing => {
            const categoryName = listing.listing_category?.name || listing.category;
            return (categoryName || "").toLowerCase() === categoryFilter.toLowerCase();
          });
        }
        
        setFilteredListings(branchListings);
        setSelectedBranch(branch);
      } else {
        let filteredByCategory = listings;
        if (categoryFilter !== "All Categories") {
          filteredByCategory = listings.filter(listing => {
            const categoryName = listing.listing_category?.name || listing.category;
            return (categoryName || "").toLowerCase() === categoryFilter.toLowerCase();
          });
        }
        setFilteredListings(filteredByCategory);
      }
    } else {
      let filteredByCategory = listings;
      if (categoryFilter !== "All Categories") {
        filteredByCategory = listings.filter(listing => {
          const categoryName = listing.listing_category?.name || listing.category;
          return (categoryName || "").toLowerCase() === categoryFilter.toLowerCase();
        });
      }
      setFilteredListings(filteredByCategory);
    }
    
    // Also update companyListings with category filter for consistency
    let filteredCompanyListings = listings || [];
    if (categoryFilter !== "All Categories") {
      filteredCompanyListings = filteredCompanyListings.filter(listing => {
        const categoryName = listing.listing_category?.name || listing.category;
        return (categoryName || "").toLowerCase() === categoryFilter.toLowerCase();
      });
    }
    setCompanyListings(filteredCompanyListings);
  }, [searchParams, company, listings, categoryFilter]);
  
  // Branch location display component
  const BranchLocationInfo = () => {
    if (!branchFromUrl) return null;

    const { location, calculateDistanceFrom } = useGuestLocation();
    const [distanceText, setDistanceText] = React.useState(null);

    // Local haversine fallback if API distance isn’t available
    const haversineKm = (lat1, lon1, lat2, lon2) => {
      const R = 6371;
      const toRad = (v) => (v * Math.PI) / 180;
      const dLat = toRad(lat2 - lat1);
      const dLon = toRad(lon2 - lon1);
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    React.useEffect(() => {
      const destLat = Number(
        branchFromUrl?.location?.latitude ??
          branchFromUrl?.location?.coordinates?.latitude ??
          company?.latitude
      );
      const destLng = Number(
        branchFromUrl?.location?.longitude ??
          branchFromUrl?.location?.coordinates?.longitude ??
          company?.longitude
      );

      if (!location || Number.isNaN(destLat) || Number.isNaN(destLng)) return;

      (async () => {
        try {
          const result = await calculateDistanceFrom({ lat: destLat, lng: destLng });
          const txt = result?.distance?.text || null;
          if (txt) {
            setDistanceText(txt);
            return;
          }
        } catch (_) {
          // fall through to haversine
        }

        // Fallback: approximate straight-line distance
        const km = haversineKm(location.lat, location.lng, destLat, destLng);
        if (km && Number.isFinite(km)) setDistanceText(`${Math.round(km)} km`);
      })();
    }, [location, branchFromUrl?.location?.latitude, branchFromUrl?.location?.longitude, company?.latitude, company?.longitude]);

    return (
      <div className="bg-white rounded-lg shadow-md p-4 mb-2">
        <h3 className="text-lg font-semibold flex items-center">
          <MapPin className="w-5 h-5 mr-2 text-primary" />
          {branchFromUrl.location.address}
          {distanceText && (
            <span className="ml-2 text-sm text-gray-600">- {distanceText} away from you</span>
          )}
        </h3>
      </div>
    );
  };

  const client = useApolloClient();
  const [isDuplicating, setIsDuplicating] = useState(false);
  const handleDuplicate = useCallback(async (listing) => {
    if (!listing?.documentId) {
      toast({
        title: "Duplicate failed",
        description: "Listing ID not found.",
        variant: "destructive",
      });
      return;
    }
    try {
      setIsDuplicating(true);

      // 1) Load full listing details so we can mirror Advert Creator payload
      const { data } = await client.query({
        query: GET_LISTING_BY_ID,
        variables: { documentID: listing.documentId },
        fetchPolicy: "network-only",
      });
      const full = data?.listing;
      if (!full) throw new Error("Full listing details not found.");

      // 3) Compute unique slug and duplicated title
      const baseSlug = slugify(full.slug || full.title || "listing");
      const uniqueSlug = `${baseSlug}-copy-${Date.now().toString(36)}`;
      const duplicatedTitle = `${full.title || "Listing"} 1`;

      // 4) Resolve category documentId using live categories (match by name)
      const thisListing = (full.company?.listings || []).find(
        (l) => l.documentId === full.documentId
      );
      const categoryName = (thisListing?.listing_category?.name || "")
        .trim()
        .toLowerCase();
      let categoryDocId = undefined;
      try {
        const categoriesResp = await client.query({
          query: GET_LISTING_CATEGORY,
          fetchPolicy: "cache-first",
        });
        const categories = categoriesResp?.data?.listingCategories || [];
        const matched = categories.find(
          (c) => String(c.name).trim().toLowerCase() === categoryName
        );
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
          thumbnailUrls: Array.isArray(full.thumbnailUrls)
            ? full.thumbnailUrls
            : [],
          thumbnailPublicIds: Array.isArray(full.thumbnailPublicIds)
            ? full.thumbnailPublicIds
            : [],

          company: full.company?.documentId
            ? { connect: [{ documentId: full.company.documentId }] }
            : undefined,
          categoryRef: categoryDocId
            ? { connect: [{ documentId: categoryDocId }] }
            : undefined,
          listing_category: categoryDocId
            ? { connect: [{ documentId: categoryDocId }] }
            : undefined,
          branches: full.branches?.length
            ? { connect: full.branches.map((b) => ({ documentId: b.documentId })) }
            : undefined,

          productDetails: {
            color: (full.productDetails?.color || []).map(({ value }) => ({
              value,
              icon: getIconPath("color", value),
            })),
            style: (full.productDetails?.style || []).map(({ value }) => ({
              value,
              icon: getIconPath("style", value),
            })),
            stoneType: (full.productDetails?.stoneType || []).map(
              ({ value }) => ({ value, icon: getIconPath("stoneType", value) })
            ),
            customization: (full.productDetails?.customization || []).map(
              ({ value }) => ({
                value,
                icon: getIconPath("customization", value),
              })
            ),
          },

          additionalProductDetails: {
            transportAndInstallation: (
              full.additionalProductDetails?.transportAndInstallation || []
            ).map(({ value }) => ({ value })),
            foundationOptions: (
              full.additionalProductDetails?.foundationOptions || []
            ).map(({ value }) => ({ value })),
            warrantyOrGuarantee: (
              full.additionalProductDetails?.warrantyOrGuarantee || []
            ).map(({ value }) => ({ value })),
          },
        },
      };

      const baseUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL || "https://api.tombstonesfinder.co.za/api";
      const res = await fetch(
        `${baseUrl}/listings`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Create failed (${res.status}). ${text}`);
      }

      const created = await res.json();
      const newDocId = created?.data?.documentId || created?.data?.id;
      toast({
        title: "Listing duplicated",
        description: `"${duplicatedTitle}" created successfully.`,
      });

      // 7) Optimistically update the cache instead of refetching the whole list
      // This prevents the "Last Get" (fetching all 150+ listings) which causes 429 errors.
      
      // A. Fetch only the SINGLE new listing (cheap)
      const { data: newData } = await client.query({
        query: GET_LISTING_BY_ID,
        variables: { documentID: newDocId },
        fetchPolicy: "network-only",
      });
      const newListing = newData?.listing;

      if (newListing) {
        // B. Manually update the GET_COMPANY_BY_USER cache
        // We need the user's documentId which is passed in the query variables.
        // We can access the user ID from the company object if available: company.user.documentId
        
        if (company?.user?.documentId) {
            try {
                const queryVars = { documentId: company.user.documentId };
                // Attempt to read the exact query from cache
                // Note: Apollo readQuery throws if data is missing, so we wrap in try/catch
                const companyData = client.readQuery({
                    query: GET_COMPANY_BY_USER,
                    variables: queryVars,
                });

                if (companyData?.companies?.[0]) {
                    // Ensure branch_listings exists to prevent UI crashes
                    const safeNewListing = {
                        ...newListing,
                        branch_listings: newListing.branch_listings || [],
                        branches: newListing.branches || [],
                        // Ensure other required fields are present to match query shape
                        listing_category: newListing.listing_category || null,
                        productDetails: newListing.productDetails || null,
                        additionalProductDetails: newListing.additionalProductDetails || null,
                        inquiries_c: newListing.inquiries_c || [],
                    };

                    const updatedCompany = {
                        ...companyData.companies[0],
                        listings: [...(companyData.companies[0].listings || []), safeNewListing],
                    };

                    client.writeQuery({
                        query: GET_COMPANY_BY_USER,
                        variables: queryVars,
                        data: {
                            companies: [updatedCompany],
                        },
                    });
                    
                    // Also update the local state to reflect changes immediately
                    // This handles the "filteredListings" state used for rendering
                    setFilteredListings((prev) => [...prev, safeNewListing]);
                    
                    // Also update the main "companyListings" state if it exists
                    setCompanyListings((prev) => [...prev, safeNewListing]);
                    
                    // Update the "company" prop if possible/needed (but props are read-only)
                    // The parent component might re-render if it subscribes to the cache
                }
            } catch (cacheErr) {
                console.warn("Could not update cache optimistically:", cacheErr);
                // Fallback to full refresh if cache update fails
                if (onRefresh) onRefresh();
            }
        } else {
             // Fallback if we can't find the user ID
             if (onRefresh) onRefresh();
        }
      }
      
      // Optional: If we wanted to navigate, we would use:
      // if (newDocId) {
      //   router.push(`/manufacturers/manufacturers-Profile-Page/update-listing/${newDocId}`);
      // }
    } catch (err) {
      console.error(err);
      toast({
        title: "Duplicate failed",
        description: err.message || String(err),
        variant: "destructive",
      });
    } finally {
      setIsDuplicating(false);
    }
  }, [client, company, toast, setFilteredListings, setCompanyListings, onRefresh]);

  // Bulk Selection Handlers
  const toggleSelectionMode = () => {
    if (selectionMode) {
      setSelectedListingIds(new Set());
    }
    setSelectionMode(!selectionMode);
  };

  const toggleListingSelection = useCallback((id) => {
    setSelectedListingIds(prev => {
      const newSelected = new Set(prev);
      if (newSelected.has(id)) {
        newSelected.delete(id);
      } else {
        newSelected.add(id);
      }
      return newSelected;
    });
  }, []);



  const handleBulkAssignToBranch = async (branchId, branchName) => {
    if (!branchId || selectedListingIds.size === 0) return;
    
    // Filter listings to determine which ones need assignment vs. which are duplicates
    const ids = Array.from(selectedListingIds);
    const listingsToAssign = [];
    const skippedListings = [];

    ids.forEach(id => {
        const listing = companyListings.find(l => (l.documentId || l.id) === id);
        if (!listing) return;

        const isAlreadyInBranch = listing.branches?.some(b => 
            (b.documentId || b.id) === branchId
        );

        if (isAlreadyInBranch) {
            skippedListings.push(listing);
        } else {
            listingsToAssign.push(listing);
        }
    });

    // Case 1: All selected listings already exist in the target branch -> Block
    if (listingsToAssign.length === 0) {
        toast({
            title: "Operation Blocked",
            description: "One or more selected listings already exist in branches and cannot be reassigned.",
            variant: "destructive"
        });
        return;
    }

    setIsBulkAssigning(true);
    
    try {
      const BATCH_SIZE = 5;
      
      let successCount = 0;
      let errorCount = 0;
      
      for (let i = 0; i < listingsToAssign.length; i += BATCH_SIZE) {
        const batch = listingsToAssign.slice(i, i + BATCH_SIZE);
        await Promise.all(batch.map(async (listing) => {
          const listingId = listing.documentId || listing.id;
          try {
             const price = listing ? Number(listing.price) : 0;
             
             // Step 1: Create the direct relationship (branches.listings)
             await addListingToBranch(branchId, listingId);

             // Step 2: Create the pricing entry (branch_listings)
             await addListingToBranchListing({
               listingDocumentId: listingId,
               branchDocumentId: branchId,
               price: price
             });
             successCount++;
          } catch (err) {
             console.error(`Failed to assign listing ${listingId} to branch ${branchId}`, err);
             errorCount++;
          }
        }));
      }
      
      let description = `Assigned ${successCount} listings to ${branchName}.`;
      if (skippedListings.length > 0) {
        description += ` ${skippedListings.length} listings were skipped as they already exist in this branch.`;
      }
      if (errorCount > 0) {
        description += ` ${errorCount} failed.`;
      }

      toast({
          title: "Assignment Complete",
          description: description,
          variant: errorCount > 0 ? "destructive" : "default" 
      });
      
      setSelectedListingIds(new Set());
      setSelectionMode(false);
      
      // Refresh
      if (onRefresh) onRefresh();
      
    } catch (error) {
       console.error("Bulk assign error:", error);
       toast({
           title: "Error",
           description: "Failed to perform bulk assignment.",
           variant: "destructive"
       });
    } finally {
       setIsBulkAssigning(false);
    }
  };

  const handleBulkAssignToAllBranches = async () => {
    if (!company.branches || company.branches.length === 0 || selectedListingIds.size === 0) return;

    const listingIds = Array.from(selectedListingIds);
    const branches = company.branches;
    const tasks = [];
    let totalPossibleAssignments = 0;
      
    // Create a task for every valid listing-branch combination
    for (const branch of branches) {
        const branchId = branch.documentId || branch.id;
        for (const listingId of listingIds) {
             totalPossibleAssignments++;
             const listing = companyListings.find(l => (l.documentId || l.id) === listingId);
             
             // Check for duplicate in this specific branch
             const isAlreadyInBranch = listing?.branches?.some(b => 
                (b.documentId || b.id) === branchId
             );

             if (!isAlreadyInBranch) {
                 tasks.push({ listingId, branchId, listing });
             }
        }
    }

    // If no tasks generated, it means all selected listings are already in all branches
    if (tasks.length === 0) {
        toast({
            title: "Operation Blocked",
            description: "One or more selected listings already exist in branches and cannot be reassigned.",
            variant: "destructive"
        });
        return;
    }

    setIsBulkAssigning(true);

    try {
      const BATCH_SIZE = 5;
      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < tasks.length; i += BATCH_SIZE) {
        const batch = tasks.slice(i, i + BATCH_SIZE);
        await Promise.all(batch.map(async ({ listingId, branchId, listing }) => {
          try {
             const price = listing ? Number(listing.price) : 0;

             // Step 1: Create the direct relationship (branches.listings)
             await addListingToBranch(branchId, listingId);

             // Step 2: Create the pricing entry (branch_listings)
             await addListingToBranchListing({
               listingDocumentId: listingId,
               branchDocumentId: branchId,
               price: price
             });
             successCount++;
          } catch (err) {
             console.error(`Failed to assign listing ${listingId} to branch ${branchId}`, err);
             errorCount++;
          }
        }));
      }

      const skippedCount = totalPossibleAssignments - tasks.length;
      let description = `Assigned ${successCount} listings across ${branches.length} branches.`;
      if (skippedCount > 0) {
        description += ` ${skippedCount} assignments were skipped as duplicates.`;
      }
      
      toast({
          title: "Bulk Assignment Complete",
          description: description,
          variant: errorCount > 0 ? "destructive" : "default"
      });

      setSelectedListingIds(new Set());
      setSelectionMode(false);
      
      if (onRefresh) onRefresh();

    } catch (error) {
       console.error("Bulk assign all error:", error);
       toast({
           title: "Error",
           description: "Failed to perform bulk assignment to all branches.",
           variant: "destructive"
       });
    } finally {
       setIsBulkAssigning(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedListingIds.size === 0) return;
    
    if (!window.confirm(`Are you sure you want to delete ${selectedListingIds.size} listings? This cannot be undone.`)) {
        return;
    }

    setIsBulkDeleting(true);
    try {
        const ids = Array.from(selectedListingIds);
        const baseUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'https://api.tombstonesfinder.co.za/api';
        
        // Process in batches of 5 to avoid overwhelming the server
        const BATCH_SIZE = 5;
        for (let i = 0; i < ids.length; i += BATCH_SIZE) {
            const batch = ids.slice(i, i + BATCH_SIZE);
            await Promise.all(batch.map(async (id) => {
                 try {
                     const res = await fetch(`${baseUrl}/listings/${id}`, {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                     });
                     if (!res.ok) {
                         console.error(`Failed to delete listing ${id}: ${res.status}`);
                     }
                 } catch (err) {
                     console.error(`Error deleting listing ${id}:`, err);
                 }
            }));
        }

        // Optimistic update
        const remainingIds = new Set(ids); // Ideally check which ones actually succeeded
        
        setCompanyListings(prev => prev.filter(l => !remainingIds.has(l.documentId || l.id)));
        setFilteredListings(prev => prev.filter(l => !remainingIds.has(l.documentId || l.id)));
        
        // Clear selection
        setSelectedListingIds(new Set());
        setSelectionMode(false);
        
        toast({
            title: "Bulk Delete Successful",
            description: `Selected listings have been deleted.`,
            variant: "default", 
        });
        
        // Trigger refresh to sync with server fully
        if (onRefresh) onRefresh();

    } catch (error) {
        console.error("Bulk delete error:", error);
        toast({
            title: "Bulk Delete Failed",
            description: "An error occurred while deleting listings.",
            variant: "destructive",
        });
    } finally {
        setIsBulkDeleting(false);
    }
  };

  const toggleDayOpen = (key) => {
    setDailyHours((prev) => ({
      ...prev,
      [key]: { ...prev[key], open: !prev[key].open },
    }));
  };

  const updateDayTime = (key, field, value) => {
    setDailyHours((prev) => ({
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



  // Add CSS animation for slideIn effect
  useEffect(() => {
    const style = document.createElement("style");
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
    const allInquiries = (
      Array.isArray(companyListings) ? companyListings : []
    ).flatMap((listing) =>
      (listing.inquiries || listing.inquiries_c || []).map((inq) => ({
        ...inq,
        // If GraphQL returns these, they’ll be truthy/falsy as stored in DB
        isRead: inq.isRead !== undefined ? inq.isRead : false,
        isNew: inq.isNew !== undefined ? inq.isNew : false,
      }))
    );

    const unreadCount = allInquiries.filter(
      (inq) => inq.isRead !== true
    ).length;
    setNotificationCount(unreadCount);
  }, [companyListings]);

  // Memoize sorted and filtered listings to avoid expensive re-sorting on every render
  const sortedAndFilteredListings = useMemo(() => {
    let baseListings = branchFromUrl ? filteredListings : companyListings;

    // Apply category filter
    if (categoryFilter !== "All Categories") {
      baseListings = baseListings.filter(listing => {
        const catName = listing.listing_category?.name || listing.category;
        return (catName || "").toLowerCase() === categoryFilter.toLowerCase();
      });
    }

    // Apply search filter
    if (debouncedSearchQuery) {
      const lowerQuery = debouncedSearchQuery.toLowerCase();
      baseListings = baseListings.filter(listing => 
        (listing.title || "").toLowerCase().includes(lowerQuery) ||
        (listing.slug || "").toLowerCase().includes(lowerQuery)
      );
    }

    return [...baseListings].sort((a, b) => {
      if (sortBy === "Price") {
        return parsePrice(a.price) - parsePrice(b.price);
      }
      if (sortBy === "Listing Date") {
        // Use createdAt as the listing date field, ascending order (oldest first)
        return new Date(a.createdAt) - new Date(b.createdAt);
      }
      if (sortBy === "Alphabetical Order") {
        return (a.title || "").localeCompare(b.title || "");
      }
      return 0;
    });
  }, [branchFromUrl, filteredListings, companyListings, sortBy, debouncedSearchQuery, categoryFilter]);

  const handleSelectAll = useCallback((checked) => {
    if (checked) {
      if (!selectionMode) setSelectionMode(true);
      const allIds = new Set(sortedAndFilteredListings.map(l => l.documentId || l.id));
      setSelectedListingIds(allIds);
    } else {
      setSelectedListingIds(new Set());
    }
  }, [selectionMode, sortedAndFilteredListings]);

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
    isLocationSet,
  } = useManufacturerLocation(company, locationUpdateCallback);

  useEffect(() => {
    setMobile(isMobile());
    const handleResize = () => setMobile(isMobile());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!showSortDropdown) return;
    function handleClick(e) {
      if (sortModalRef.current && !sortModalRef.current.contains(e.target)) {
        setShowSortDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showSortDropdown]);

  if (!company) return <div>No company data found.</div>;

  // Convert social links from GraphQL structure to display format - always show all platforms
  const socialLinks = [
    {
      name: "website",
      url: company.socialLinks?.website || "",
      displayName: "Website",
    },
    {
      name: "facebook",
      url: company.socialLinks?.facebook || "",
      displayName: "Facebook",
    },
    {
      name: "instagram",
      url: company.socialLinks?.instagram || "",
      displayName: "Instagram",
    },
    {
      name: "tiktok",
      url: company.socialLinks?.tiktok || "",
      displayName: "TikTok",
    },
    {
      name: "youtube",
      url: company.socialLinks?.youtube || "",
      displayName: "YouTube",
    },
    {
      name: "x",
      url: company.socialLinks?.x || "",
      displayName: "X (Twitter)",
    },
    {
      name: "whatsapp",
      url: company.socialLinks?.whatsapp || "",
      displayName: "WhatsApp",
    },
    {
      name: "messenger",
      url: company.socialLinks?.messenger || "",
      displayName: "Messenger",
    },
  ];



  if (mobile && isOwner) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#fffbe6",
          animation: "fadeIn 1.2s",
        }}
      >
        <div
          style={{
            background: "#ffe066",
            color: "#b26a00",
            fontWeight: 700,
            fontSize: 22,
            padding: "32px 40px",
            borderRadius: 16,
            boxShadow: "0 2px 16px rgba(255, 224, 102, 0.18)",
            textAlign: "center",
            letterSpacing: 1,
            animation: "fadeIn 1.2s",
          }}
        >
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
      const baseUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL || "https://api.tombstonesfinder.co.za/api";
      const res = await fetch(
        `${baseUrl}/listings/${documentId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            // If using JWT:
            // Authorization: Bearer ${yourToken},
          },
        }
      );

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
    setCompanyListings((prevListings) =>
      prevListings.map((listing) => {
        // Update inquiries in this listing
        const updatedListingInquiries = (
          listing.inquiries ||
          listing.inquiries_c ||
          []
        ).map((inq) => {
          const updatedInq = updatedInquiries.find(
            (updated) =>
              updated.id === inq.id || updated.documentId === inq.documentId
          );
          return updatedInq || inq;
        });

        return {
          ...listing,
          inquiries: listing.inquiries ? updatedListingInquiries : undefined,
          inquiries_c: listing.inquiries_c
            ? updatedListingInquiries
            : undefined,
        };
      })
    );
  }, []);

  // Handle notification button click - mark all inquiries as "not new"
  const handleNotificationClick = useCallback(async () => {
    const allInquiries = (
      Array.isArray(companyListings) ? companyListings : []
    ).flatMap((listing) =>
      (listing.inquiries || listing.inquiries_c || []).map((inq) => ({
        ...inq,
        listingId: listing.documentId,
      }))
    );

    // Find all "new" inquiries
    const newInquiries = allInquiries.filter((inq) => inq.isNew === true);

    if (newInquiries.length > 0) {
      for (const inquiry of newInquiries) {
        try {
          const inquiryId = inquiry.documentId || inquiry.id;
          const baseUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL;
          await fetch(
            `${baseUrl}/inquiries/${inquiryId}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                data: {
                  isNew: false, // Only update isNew, keep isRead as is
                },
              }),
            }
          );
        } catch (error) {}
      }

      // Update local state - mark all inquiries as not new
      const updatedInquiries = allInquiries.map((inq) => ({
        ...inq,
        isNew: false, // Set all to not new
      }));

      handleInquiriesRead(updatedInquiries);
    }

    // Open the modal
    toggleModal("viewInquiries", true);
  }, [companyListings, handleInquiriesRead]);

  // Function to navigate to advert creator with company data
  const handleCreateListing = () => {
    // Store company data in sessionStorage to pass to advert creator
    sessionStorage.setItem("advertCreatorCompany", JSON.stringify(company));
    router.push("/manufacturers/manufacturers-Profile-Page/advert-creator");
  };

  // Function to handle saving field changes and updating local state
  const handleSaveField = async (field, value) => {
    try {
      // Update the field in the API
      const updatedData = await updateCompanyField(company.documentId, {
        [field]: value,
      });

      if (updatedData) {
        // Update local state with the new value
        setCompany((prevCompany) => ({
          ...prevCompany,
          [field]: value,
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
        messenger: formatUrl(socialLinksData.messenger) || "#",
      };

      const socialLinksUpdate = {
        socialLinks: socialLinksPayload,
      };

      // Update the field in the API
      const updatedData = await updateCompanyField(
        company.documentId,
        socialLinksUpdate
      );

      if (updatedData) {
        // Update local state with the new values
        setCompany((prevCompany) => ({
          ...prevCompany,
          socialLinks: socialLinksPayload,
        }));

        // Close edit mode
        setEditingField(null);

        // Optional: Show success message
      } else {
        // Handle error

        alert("Failed to update social links. Please try again.");
      }
    } catch (error) {
      alert("Error updating social links. Please try again.");
    }
  };

  // Function to handle logo upload
  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setIsUploading(true);

      // Upload to Cloudinary using shared util (with folder by company)
      const uploadedImage = await uploadToCloudinary(file, company?.name);

      // Update company with new logo information
      const logoUpdate = {
        logoUrl: uploadedImage.secure_url,
        logoUrlPublicId: uploadedImage.public_id,
      };

      // Update the field in the API
      const updatedData = await updateCompanyField(
        company.documentId,
        logoUpdate
      );

      if (updatedData) {
        // Update local state with the new logo
        setCompany((prevCompany) => ({
          ...prevCompany,
          logoUrl: uploadedImage.secure_url,
          logoUrlPublicId: uploadedImage.public_id,
        }));

        toast({
          title: "Logo updated successfully",
          description: "Your company logo has been updated.",
          variant: "success",
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
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error updating logo",
        description: "An error occurred while updating your logo.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Function to handle banner ad upload
  const handleBannerAdUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setIsUploadingBanner(true);

      // Upload to Cloudinary using shared util (with folder by company)
      const uploadedImage = await uploadToCloudinary(file, company?.name);

      // Update company with new banner information
      const bannerUpdate = {
        bannerAdUrl: uploadedImage.secure_url,
        bannerAdPublicId: uploadedImage.public_id,
      };

      // Update the field in the API
      const updatedData = await updateCompanyField(
        company.documentId,
        bannerUpdate
      );

      if (updatedData) {
        // Update local state with the new banner
        setCompany((prevCompany) => ({
          ...prevCompany,
          bannerAdUrl: uploadedImage.secure_url,
          bannerAdPublicId: uploadedImage.public_id,
        }));
        
        setShowBannerAdUpdate(false);

        toast({
          title: "Banner Ad updated successfully",
          description: "Your company banner ad has been updated.",
          variant: "success",
        });

        // Auto-refresh the page to display the updated banner
        setTimeout(() => {
          window.location.reload();
        }, 1500); // Wait 1.5 seconds to show the success message before refreshing
      } else {
        // Handle error
        toast({
          title: "Failed to update banner ad",
          description: "Please try again later.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error updating banner ad",
        description: "An error occurred while updating your banner ad.",
        variant: "destructive",
      });
    } finally {
      setIsUploadingBanner(false);
    }
  };
  const handleEditListing = useCallback((listing) => {
    window.location.href = `/manufacturers/manufacturers-Profile-Page/update-listing/${listing.documentId || listing.id}`;
  }, []);

  const handleDeleteListing = useCallback((listing) => {
    setListingToDelete(listing);
    toggleModal("confirmDelete", true);
  }, []);

  const handleCreateSpecial = useCallback((listing) => {
    setSelectedListing(listing);
    toggleModal("createSpecial", true);
  }, []);

  const handleAddToBranch = useCallback((listing) => {
    if (company.branches?.length > 0) {
      setSelectedListingForBranch(listing);
      toggleModal("branchSelection", true);
    }
  }, [company.branches]);

  const branchobj = findBranchByName(selectedBranch?.name || "" , company.branches);
  return (
    <>
      <Header 
        showLogout={isOwner} 
        mobileMenuOpen={mobileMenuOpen}
        handleMobileMenuToggle={handleMobileMenuToggle}
        mobileDropdown={mobileDropdown}
        handleMobileDropdownToggle={handleMobileDropdownToggle}
      />
      
      {/* Branch Button Container - Positioned directly beneath header */}
      {branchButton && (
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "16px 16px 0 16px",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          {branchButton}
        </div>
      )}
      <div
        style={{
          fontFamily: "Arial, sans-serif",
          background: "#f9f9f9",
          minHeight: "100vh",
          color: "#333",
        }}
      >
        {/* Settings and Notification Buttons (only for owner) */}
        {isOwner && (
          <div
            style={{
              maxWidth: 1200,
              margin: "0 auto",
              padding: "16px 0 0 0",
              display: "flex",
              justifyContent: "flex-end",
              gap: "12px",
            }}
          >
            {/* Auto Refresh Toggle */}
            <button
              onClick={onToggleAutoRefresh}
              title={autoRefreshEnabled ? "Disable Auto-Refresh" : "Enable Auto-Refresh"}
              style={{
                background: autoRefreshEnabled ? "#28a745" : "#808080",
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
              }}
            >
              <Activity size={18} />
            </button>

            {/* Manual Refresh Button */}
            <button
              onClick={() => onRefresh()}
              disabled={isRefreshing}
              title="Refresh Data"
              style={{
                background: "#808080",
                color: "#fff",
                borderRadius: 8,
                padding: "12px 16px",
                fontWeight: 700,
                fontSize: 15,
                border: "none",
                cursor: isRefreshing ? "not-allowed" : "pointer",
                boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
                transition: "background 0.2s",
                marginBottom: 8,
                display: "flex",
                alignItems: "center",
                gap: "8px",
                opacity: isRefreshing ? 0.7 : 1,
              }}
            >
              <RefreshCw size={18} className={isRefreshing ? "animate-spin" : ""} />
            </button>

            {/* Notification Button */ }
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
                position: "relative",
              }}
            >
              <NotificationIcon />
              {notificationCount > 0 && (
                <span
                  style={{
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
                    border: "2px solid #fff",
                  }}
                >
                  {notificationCount > 99 ? "99+" : notificationCount}
                </span>
              )}
            </button>

            {/* Branch Options Button */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  style={{
                    background: "#4a6cf7",
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
                    marginRight: 8,
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <BranchOptionsIcon />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setModalOpen(true)}>
                  Update Branch
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => toggleModal("branchSelector", true)}
                >
                  Switch Branch
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => toggleModal("createBranch", true)}
                >
                  Create Branch
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

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
                    gap: "8px",
                  }}
                >
                  <SettingsIcon />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() =>
                    (window.location.href = `/manufacturers/manufacturers-Profile-Page`)
                  }
                >
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleCreateListing}>
                  + Create Listing
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowBannerAdUpdate(true)}>
                  Update Banner Ad
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
        {/* Combined Profile Card - all info in one card */}
        <div
          style={{
            background: "#fff",
            borderRadius: 10,
            boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
            padding: 20,
            maxWidth: 1200,
            margin: (mobile && !isOwner) ? "24px 16px" : "24px auto 0 auto",
            display: "flex",
            flexDirection: mobile ? "column" : "row",
            gap: mobile ? 16 : 32,
            alignItems: mobile ? "stretch" : "flex-start",
          }}
        >
          {/* Left Column */}
          <div style={{ flex: 2, minWidth: 0, order: mobile ? 0 : 0 }}>
            {/* Company Name Label */}
            {isOwner && (
              <div
                style={{
                  fontSize: 11,
                  color: "#888",
                  fontWeight: 700,
                  marginBottom: 2,
                }}
              >
                Company Name
              </div>
            )}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 8,
              }}
            >
              {editingField === "name" ? (
                <>
                  <input
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    style={{
                      fontWeight: 700,
                      fontSize: 18,
                      padding: 2,
                      borderRadius: 4,
                      border: "1px solid #ccc",
                    }}
                  />
                  <button
                    onClick={() => handleSaveField("name", editValue)}
                    style={{
                      marginLeft: 4,
                      color: "#28a745",
                      fontWeight: 700,
                      border: "none",
                      background: "none",
                      cursor: "pointer",
                    }}
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingField(null)}
                    style={{
                      marginLeft: 2,
                      color: "#888",
                      fontWeight: 700,
                      border: "none",
                      background: "none",
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <span style={{ fontWeight: 700, fontSize: 18 }}>
                    {company.name}
                  </span>
                  {isOwner && (
                    <button
                      style={{
                        background: "none",
                        border: "none",
                        marginLeft: 2,
                        cursor: "pointer",
                      }}
                      onClick={() => {
                        setEditingField("name");
                        setEditValue(company.name);
                      }}
                    >
                      <Edit2 style={{ width: 16, height: 16, color: "#888" }} />
                    </button>
                  )}
                </>
              )}
            </div>
            {/* MOBILE-ONLY: Logo directly under Company Name */}
            {mobile && (
              <div>
                {isOwner && (
                  <div
                    style={{
                      fontSize: 11,
                      color: "#888",
                      fontWeight: 700,
                      marginBottom: 6,
                    }}
                  >
                    Company Logo
                  </div>
                )}
                <div
                  style={{
                    border: isOwner ? "2px solid #00baff" : " #e0e0e0",
                    borderRadius: 8,
                    background: "#fff",
                    padding: 8,
                    position: "relative",
                    width: "100%",
                    height: 140,
                    marginBottom: 12,
                    cursor: isOwner ? "pointer" : "default",
                    overflow: "hidden",
                  }}
                  onClick={() => isOwner && fileInputRef.current?.click()}
                >
                  <div
                    style={{
                      position: "relative",
                      width: "100%",
                      height: "100%",
                    }}
                  >
                    <Image
                      src={`${
                        company.logoUrl || "/placeholder-logo.svg"
                      }?t=${Date.now()}`}
                      alt="Company Logo"
                      fill
                      key={company.logoUrl}
                      style={{ objectFit: "contain" }}
                      sizes="100vw"
                      priority
                    />
                    {isOwner && isUploading && (
                      <div
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: "rgba(0,0,0,0.3)",
                        }}
                      >
                        <Upload
                          style={{ width: 24, height: 24, color: "white" }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            {/* Google Rating Label */}
            <div
              style={{
                fontSize: 11,
                color: "#888",
                fontWeight: 700,
                marginBottom: 2,
              }}
            >
              Google Rating
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 8,
              }}
            >
              <span
                style={{
                  color: "#00baff",
                  fontWeight: 700,
                  fontSize: 16,
                  textDecoration: "underline",
                  cursor: "pointer",
                }}
              >
                Current Google Rating: {company.googleRating || "N/A"} out of 5
              </span>
            </div>
            {isOwner && (
              <button
                style={{
                  background: "none",
                  border: "none",
                  marginLeft: 2,
                  cursor: "pointer",
                }}
              >
                <Edit2 style={{ width: 16, height: 16, color: "#888" }} />
              </button>
            )}
            {/* Store Location Label */}
            <div
              style={{
                fontSize: 11,
                color: "#888",
                fontWeight: 700,
                marginBottom: 2,
              }}
            >
              Store Location
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 8,
              }}
            >
              <span
                style={{
                  color: isLocationSet ? "#00baff" : "#ff6b6b",
                  fontWeight: 700,
                  fontSize: 16,
                  textDecoration: "underline",
                  cursor: "pointer",
                }}
                onClick={isOwner ? openLocationModal : undefined}
                title={isOwner ? "Click to update store location" : undefined}
              >
                {branchobj?.location?.address || company?.location || "Location not set"}
              </span>
              <MapPin
                style={{
                  display: "inline",
                  width: 18,
                  height: 18,
                  marginLeft: 2,
                  color: isLocationSet ? "#00baff" : "#ff6b6b",
                }}
              />
            </div>
            {isOwner && (
              <button
                style={{
                  background: "none",
                  border: "none",
                  marginLeft: 2,
                  cursor: "pointer",
                }}
                onClick={openLocationModal}
              >
                <Edit2 style={{ width: 16, height: 16, color: "#888" }} />
              </button>
            )}
            {/* Operating Hours Label */}
            <div
              style={{
                fontSize: 11,
                color: "#888",
                fontWeight: 700,
                marginBottom: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between"
              }}
            >
              <span>Operating Hours</span>
              {isOwner && (
                <button
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                  }}
                  onClick={() => toggleModal("operatingHours", true)}
                  title="Edit operating hours"
                >
                  <Edit2 style={{ width: 16, height: 16, color: "#888" }} />
                </button>
              )}
            </div>

            {/* Operating hours display */}
            <div
              style={{
                padding: "12px",
                background: "#ffffff",
                border: "#e0e0e0",
                borderRadius: "8px",
               
                marginBottom: 16,
              }}
            >
              {company.operatingHours && (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div style={{ fontWeight: "600" }}>Monday to Friday</div>
                    <div style={{ color: company.operatingHours.monToFri === "closed" ? "#e53e3e" : "#3182ce" }}>
                      {company.operatingHours.monToFri || "Not specified"}
                    </div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div style={{ fontWeight: "600" }}>Saturdays</div>
                    <div style={{ color: company.operatingHours.saturday === "closed" ? "#e53e3e" : "#3182ce" }}>
                      {company.operatingHours.saturday || "Not specified"}
                    </div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div style={{ fontWeight: "600" }}>Sundays</div>
                    <div style={{ color: company.operatingHours.sunday === "closed" ? "#e53e3e" : "#3182ce" }}>
                      {company.operatingHours.sunday || "Not specified"}
                    </div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div style={{ fontWeight: "600" }}>Public Holidays</div>
                    <div style={{ color: company.operatingHours.publicHoliday === "closed" ? "#e53e3e" : "#3182ce" }}>
                      {company.operatingHours.publicHoliday || "Not specified"}
                    </div>
                  </div>
                </div>
              )}
            </div>


            {/* Company Profile Label */}
            {isOwner && (
              <div
                style={{
                  fontSize: 11,
                  color: "#888",
                  fontWeight: 700,
                  marginBottom: 2,
                }}
              >
                Company Profile
              </div>
            )}
            {editingField === "description" ? (
              <div style={{ marginBottom: 8 }}>
                <textarea
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  style={{
                    width: "100%",
                    minHeight: "120px",
                    padding: "12px",
                    borderRadius: 8,
                    border: "#e0e0e0",
                    fontSize: 15,
                    fontFamily: "Arial, sans-serif",
                    resize: "vertical",
                  }}
                  placeholder="Enter company description..."
                />
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  <button
                    onClick={() => handleSaveField("description", editValue)}
                    style={{
                      color: "#28a745",
                      fontWeight: 700,
                      border: "none",
                      background: "none",
                      cursor: "pointer",
                      fontSize: 14,
                    }}
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingField(null)}
                    style={{
                      color: "#888",
                      fontWeight: 700,
                      border: "none",
                      background: "none",
                      cursor: "pointer",
                      fontSize: 14,
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div
                  style={{
                    border: "#e0e0e0",
                    borderRadius: 8,
                    background: "#fff",
                    padding: 14,
                    fontSize: 15,
                    marginBottom: 8,
                  }}
                >
                  <span>
                    {company.description || "No company description provided."}
                  </span>
                </div>
                {isOwner && (
                  <button
                    style={{
                      background: "none",
                      border: "none",
                      marginLeft: 2,
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      setEditingField("description");
                      setEditValue(company.description || "");
                    }}
                  >
                    <Edit2 style={{ width: 16, height: 16, color: "#888" }} />
                  </button>
                )}
              </>
            )}
            {/* Profile Photo & Promo Video (replacing old promo section) */}
            {isOwner && (
              <div
                style={{
                  fontSize: 11,
                  color: "#888",
                  fontWeight: 700,
                  marginBottom: 6,
                }}
              >
                Profile Photo 
              </div>
            )}
           
            {/* CreateBranchModal is conditionally rendered based on state */}
            <CreateBranchModal
              documentId={company.documentId}
              isOpen={modals.createBranch}
              onClose={() => toggleModal("createBranch", false)}
            />
            
            {/* Branch Selector Modal */}
            <Dialog open={modals.branchSelector} onOpenChange={(open) => toggleModal("branchSelector", open)}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Switch Branch</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                  <BranchSelector
                    companyId={company.documentId}
                    branches={company.branches}
                    onBranchSelect={(branch) => {
                      handleBranchSelect(branch);
                      toggleModal("branchSelector", false);
                    }}
                  />
                </div>
              </DialogContent>
            </Dialog>
            <div
              style={{
                display: "flex",
                gap: 12,
                flexWrap: "wrap",
                alignItems: "stretch",
                marginBottom: 8,
              }}
            >
              {/* Profile Picture Box */}
              <div
                  style={{
                    border: isOwner ? "2px solid #00baff" : " #e0e0e0",
                    borderRadius: 8,
                    background: "#fff",
                    padding: 8,
                    position: "relative",
                    minWidth: 240,
                    minHeight: 120,
                    flex: "1 1 280px",
                  }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 8,
                    left: 8,
                    fontSize: 11,
                    color: "#888",
                    fontWeight: 700,
                  }}
                >
                  
                </div>
                {isOwner ? (
                  <CompanyMediaUpload company={company} type="image" />
                ) : (
                  <div
                    style={{
                      position: "relative",
                      width: "100%",
                      height: "100%",
                    }}
                  >
                    <Image
                      src={`${
                        company.profilePicUrl || "/placeholder-logo.svg"
                      }?t=${Date.now()}`}
                      alt="Profile Picture"
                      width={220}
                      height={110}
                      style={{
                        objectFit: "cover",
                        width: "100%",
                        height: "100%",
                        borderRadius: 6,
                      }}
                      loading="lazy"
                    />
                  </div>
                )}
              </div>

              {/* Promo Video Box - Locked */}
              <div
                style={{
                  border: isOwner ? "2px solid #00baff" : " #e0e0e0",
                  borderRadius: 8,
                  background: "#fff",
                  padding: 8,
                  position: "relative",
                  minWidth: 240,
                  minHeight: 120,
                  flex: "1 1 280px",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 8,
                    left: 8,
                    fontSize: 11,
                    color: "#888",
                    fontWeight: 700,
                  }}
                >
              
                </div>
                {isOwner ? (
                  <CompanyMediaUpload company={company} type="video" />
                ) : (
                  company.videoUrl ? (
                    <div 
                      onClick={onVideoClick}
                      style={{ cursor: "pointer", width: "100%", height: "100%" }}
                    >
                      <video
                        src={company.videoUrl}
                        controls
                        style={{ 
                          width: "100%", 
                          height: "100%", 
                         borderRadius: 6 
                       }}
                     />
                    </div>
                  ) : null
                )}
              </div>
            </div>

            {/* Warning Modal */}
            {modals.videoSlot && (
              <div
                style={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: "rgba(0,0,0,0.5)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 9999,
                }}
                onClick={() => toggleModal("videoSlot", false)}
              >
                <div
                  style={{
                    background: "#fff",
                    padding: 20,
                    borderRadius: 8,
                    maxWidth: 420,
                    width: "90%",
                    textAlign: "center",
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div
                    style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}
                  >
                    Promo Video Slot
                  </div>
                  <div
                    style={{ fontSize: 14, color: "#444", marginBottom: 16 }}
                  >
                    Contact TombstonesFinder to purchase a video slot.
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      gap: 8,
                    }}
                  >
                    <a
                      href="mailto:info@tombstonesfinder.com"
                      style={{
                        background: "#00baff",
                        color: "#fff",
                        padding: "8px 12px",
                        borderRadius: 6,
                        textDecoration: "none",
                        fontWeight: 700,
                      }}
                    >
                      Contact
                    </a>
                    <button
                      onClick={() => toggleModal("videoSlot", false)}
                      style={{
                        padding: "8px 12px",
                        borderRadius: 6,
                        border: "1px solid #ccc",
                        background: "#f5f5f5",
                        fontWeight: 700,
                      }}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
          {/* Right Column */}
          <div
            style={{
              flex: 1,
              minWidth: 220,
              alignSelf: "flex-start",
              textAlign: mobile ? "left" : "right",
              paddingLeft: mobile ? 8 : undefined,
              boxSizing: "border-box",
              order: mobile ? 1 : 1,
            }}
          >
            {isOwner && (
              <div
                style={{
                  fontSize: 11,
                  color: "#888",
                  fontWeight: 700,
                  marginBottom: 6,
                  textAlign: "center",
                  width: "100%",
                  display: mobile ? "none" : "block",
                }}
              >
                Company Logo
              </div>
            )}
            <div
              style={{
                border: isOwner ? "2px solid #00baff" : "#e0e0e0",
                borderRadius: 8,
                background: "#fff",
                padding: 8,
                display: mobile ? "none" : "inline-block",
                position: "relative",
                minWidth: 240,
                minHeight: 120,
                marginBottom: 16,
                cursor: isOwner ? "pointer" : "default",
              }}
              onClick={() => isOwner && fileInputRef.current?.click()}
            >
              <div
                style={{ position: "relative", width: "100%", height: "100%" }}
              >
                <Image
                  src={`${
                    company.logoUrl || "/placeholder-logo.svg"
                  }?t=${Date.now()}`}
                  alt="Company Logo"
                  width={220}
                  height={110}
                  key={company.logoUrl}
                  style={{
                    objectFit: "contain",
                    display: "block",
                    margin: "0 auto",
                  }}
                />
                {isOwner && isUploading && (
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: "rgba(0,0,0,0.3)",
                    }}
                  >
                    <Upload style={{ width: 24, height: 24, color: "white" }} />
                  </div>
                )}
              </div>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: "none" }}
                accept="image/*"
                onChange={handleLogoUpload}
              />
            </div>
            {isOwner && !mobile && (
              <div
                style={{
                  textAlign: "center",
                  fontSize: 12,
                  color: "#666",
                  marginBottom: 8,
                }}
              >
                {isUploading ? "Uploading..." : "Click to update logo"}
              </div>
            )}

            {/* Banner Ad Section */}
            {((!isOwner && !mobile) || (isOwner && showBannerAdUpdate)) && (
              <>
                {isOwner && (
                  <div
                    style={{
                      fontSize: 11,
                      color: "#888",
                      fontWeight: 700,
                      marginBottom: 6,
                      textAlign: "center",
                      width: "100%",
                      display: "block",
                      marginTop: 16,
                    }}
                  >
                    Banner Ad
                  </div>
                )}
                <div
                  style={{
                    border: isOwner ? "2px solid #00baff" : "#e0e0e0",
                    borderRadius: 8,
                    background: "#fff",
                    padding: 8,
                    display: "inline-block",
                    position: "relative",
                    minWidth: 240,
                    minHeight: 120,
                    marginBottom: 16,
                    cursor: isOwner ? "pointer" : "default",
                  }}
                  onClick={() => isOwner && bannerInputRef.current?.click()}
                >
                  {isOwner && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowBannerAdUpdate(false);
                      }}
                      style={{
                        position: "absolute",
                        top: -12,
                        right: -12,
                        background: "#ff4444",
                        borderRadius: "50%",
                        border: "2px solid #fff",
                        width: 28,
                        height: 28,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        zIndex: 100,
                        boxShadow: "0 2px 6px rgba(0,0,0,0.3)"
                      }}
                    >
                      <X size={16} color="#fff" />
                    </button>
                  )}
                  <div
                    style={{ position: "relative", width: "100%", height: "100%" }}
                  >
                    <Image
                      src={`${
                        company.bannerAdUrl || company.bannerAd?.url || "/placeholder-logo.svg"
                      }?t=${Date.now()}`}
                      alt="Banner Ad"
                      width={220}
                      height={110}
                      key={company.bannerAdUrl || company.bannerAd?.url}
                      style={{
                        objectFit: "contain",
                        display: "block",
                        margin: "0 auto",
                      }}
                    />
                    {isOwner && isUploadingBanner && (
                      <div
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: "rgba(0,0,0,0.3)",
                        }}
                      >
                        <Upload style={{ width: 24, height: 24, color: "white" }} />
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    ref={bannerInputRef}
                    style={{ display: "none" }}
                    accept="image/*"
                    onChange={handleBannerAdUpload}
                  />
                </div>
                {isOwner && (
                  <div
                    style={{
                      textAlign: "center",
                      fontSize: 12,
                      color: "#666",
                      marginBottom: 8,
                    }}
                  >
                    {isUploadingBanner ? "Uploading..." : "Click to update banner ad"}
                  </div>
                )}
              </>
            )}

            {/* Socials label - conditionally show */}
            {(isOwner || socialLinks.some(social => social.url && social.url !== "#")) && (
              <div
                style={{
                  fontSize: 11,
                  color: "#888",
                  fontWeight: 700,
                  marginBottom: 2,
                  marginLeft: 140,
                  textAlign: "left",
                }}
              >
                Website & Social Media Links
              </div>
            )}
            {editingField === "socialLinks" ? (
              <div style={{ marginLeft: mobile ? 0 : 80, marginBottom: 8 }}>
                {socialLinks.map((social) => (
                  <div
                    key={social.name}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 8,
                    }}
                  >
                    <span
                      style={{
                        width: 18,
                        height: 18,
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Image
                        src={SOCIAL_ICON_MAP[social.name] || ""}
                        alt={social.name}
                        width={18}
                        height={18}
                      />
                    </span>
                    <div
                      style={{ minWidth: 80, fontSize: 14, fontWeight: 700 }}
                    >
                      {social.displayName}:
                    </div>
                    <input
                      value={editingSocialLinks[social.name] || ""}
                      onChange={(e) =>
                        setEditingSocialLinks((prev) => ({
                          ...prev,
                          [social.name]: e.target.value,
                        }))
                      }
                      style={{
                        flex: 1,
                        padding: "4px 8px",
                        borderRadius: 4,
                        border: "1px solid #ccc",
                        fontSize: 14,
                        fontFamily: "Arial, sans-serif",
                      }}
                      placeholder={`Enter ${social.displayName} URL`}
                    />
                  </div>
                ))}
                <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                  <button
                    onClick={() => handleSaveSocialLinks(editingSocialLinks)}
                    style={{
                      color: "#28a745",
                      fontWeight: 700,
                      border: "none",
                      background: "none",
                      cursor: "pointer",
                      fontSize: 14,
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
                      color: "#888",
                      fontWeight: 700,
                      border: "none",
                      background: "none",
                      cursor: "pointer",
                      fontSize: 14,
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Socials vertical list with icons - conditionally show platforms */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    gap: 4,
                    width: "100%",
                    marginLeft: mobile ? 0 : 140,
                    paddingLeft: 0,
                  }}
                >
                  {socialLinks
                    .filter((social) => {
                      // If user is owner, show all platforms (including not set ones)
                      if (isOwner) return true;
                      // If user is not owner, only show platforms that have URLs set
                      return social.url && social.url !== "#";
                    })
                    .map((social, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        width: "100%",
                      }}
                    >
                      <span
                        style={{
                          width: 18,
                          height: 18,
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Image
                          src={SOCIAL_ICON_MAP[social.name] || ""}
                          alt={social.name}
                          width={18}
                          height={18}
                        />
                      </span>
                      {social.url && social.url !== "#" ? (
                        <Link
                          href={social.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            color: "#00baff",
                            fontSize: 15,
                            fontWeight: 700,
                            textDecoration: "underline",
                            display: "inline-block",
                            minWidth: 70,
                          }}
                        >
                          {social.displayName}
                        </Link>
                      ) : (
                        <span
                          style={{
                            color: "#888",
                            fontSize: 15,
                            fontWeight: 700,
                            display: "inline-block",
                            minWidth: 70,
                            fontStyle: "italic",
                          }}
                        >
                          {social.displayName} (not set)
                        </span>
                      )}
                    </div>
                  ))}
                </div>
                {isOwner && (
                  <button
                    style={{
                      background: "none",
                      border: "none",
                      marginLeft: 0,
                      marginTop: 4,
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      setEditingField("socialLinks");
                      // Initialize editing state with current values
                      setEditingSocialLinks({
                        website: company.socialLinks?.website || "",
                        facebook: company.socialLinks?.facebook || "",
                        instagram: company.socialLinks?.instagram || "",
                        tiktok: company.socialLinks?.tiktok || "",
                        youtube: company.socialLinks?.youtube || "",
                        x: company.socialLinks?.x || "",
                        whatsapp: company.socialLinks?.whatsapp || "",
                        messenger: company.socialLinks?.messenger || "",
                      });
                    }}
                  >
                    <Edit2 style={{ width: 16, height: 16, color: "#888" }} />
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Listings Header */}
        <div
          style={{
            background: "#fff",
            padding: "12px 16px ",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid #e0e0e0",
            maxWidth: 1200,
            margin: "32px auto 28px auto",
            position: "sticky",
            top: 65, // Below the 64px header + 1px border
            zIndex: 40,
          }}
        >
          {isOwner && (
            <div style={{ fontSize: 13, color: "#888" }}>
              Current Package:{" "}
              <span
                style={{
                  color: "#28a745",
                  fontWeight: 700,
                  textTransform: "uppercase",
                }}
              >
                {company.packageType || "Premium"}
              </span>{" "}
              &nbsp;{" "}
              <Link href="#" style={{ color: "#007bff", fontWeight: 700 }}>
                Click here to UPGRADE
              </Link>
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>

            <div style={{ fontSize: 15, fontWeight: 700 }}>
              {companyListings.length} Active Listings
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {/* Mobile Selection Button */}
            {isOwner && (
                <div className="sm:hidden flex items-center mr-2">
                    {!selectionMode ? (
                        <div
                            className="flex items-center text-gray-600 font-semibold cursor-pointer select-none"
                            onClick={toggleSelectionMode}
                        >
                            <span className="mr-1">Select</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <span 
                                className="text-gray-500 text-sm" 
                                onClick={toggleSelectionMode}
                            >
                                Cancel
                            </span>
                            {selectedListingIds.size > 0 && (
                                <span 
                                    className="text-red-600 font-bold text-sm flex items-center" 
                                    onClick={handleBulkDelete}
                                >
                                    Delete ({selectedListingIds.size})
                                </span>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Mobile Sort Button */}
            <div
              className="sm:hidden flex items-center text-blue-600 font-semibold cursor-pointer select-none"
              onClick={() => setShowSortDropdown(!showSortDropdown)}
            >
              <span className="mr-1">Sort</span>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                <path
                  d="M7 10l5 5 5-5"
                  stroke="#2196f3"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            {/* Mobile Category Filter Button */}
            <div
              className="sm:hidden flex items-center text-green-600 font-semibold cursor-pointer select-none"
              onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
            >
              <span className="mr-1">Filter</span>
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                <path
                  d="M3 6h18M7 12h10M11 18h2"
                  stroke="#10b981"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            {/* Mobile Sort Modal */}
            {showSortDropdown && (
              <div className="fixed inset-0 z-50 flex items-end justify-center bg-black bg-opacity-40 sm:hidden">
                <div
                  ref={sortModalRef}
                  className="w-full max-w-md mx-auto rounded-t-2xl bg-[#232323] p-4 pb-8 animate-slide-in-up"
                >
                  {["Price", "Listing Date", "Alphabetical Order"].map((option) => (
                    <div
                      key={option}
                      className={`flex items-center justify-between px-2 py-4 text-lg border-b border-[#333] last:border-b-0 cursor-pointer ${
                        sortBy === option
                          ? "text-white font-bold"
                          : "text-gray-200"
                      }`}
                      onClick={() => {
                        setSortBy(option);
                        setShowSortDropdown(false);
                      }}
                    >
                      <span>{option}</span>
                      <span
                        className={`ml-2 w-6 h-6 flex items-center justify-center rounded-full border-2 ${
                          sortBy === option
                            ? "border-blue-500"
                            : "border-gray-500"
                        }`}
                        style={{
                          background:
                            sortBy === option ? "#2196f3" : "transparent",
                        }}
                      >
                        {sortBy === option && (
                          <span className="block w-3 h-3 bg-white rounded-full"></span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Mobile Category Filter Modal */}
            {showCategoryDropdown && (
              <div className="fixed inset-0 z-50 flex items-end justify-center bg-black bg-opacity-40 sm:hidden">
                <div
                  className="w-full max-w-md mx-auto rounded-t-2xl bg-[#232323] p-4 pb-8 animate-slide-in-up"
                >
                  {["All Categories", "SINGLE", "DOUBLE", "CHILD", "HEAD", "PLAQUES", "CREMATION"].map((option) => (
                    <div
                      key={option}
                      className={`flex items-center justify-between px-2 py-4 text-lg border-b border-[#333] last:border-b-0 cursor-pointer ${
                        categoryFilter === option
                          ? "text-white font-bold"
                          : "text-gray-200"
                      }`}
                      onClick={() => {
                        setCategoryFilter(option);
                        setShowCategoryDropdown(false);
                      }}
                    >
                      <span>{option}</span>
                      <span
                        className={`ml-2 w-6 h-6 flex items-center justify-center rounded-full border-2 ${
                          categoryFilter === option
                            ? "border-green-500"
                            : "border-gray-500"
                        }`}
                        style={{
                          background:
                            categoryFilter === option ? "#10b981" : "transparent",
                        }}
                      >
                        {categoryFilter === option && (
                          <span className="block w-3 h-3 bg-white rounded-full"></span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
              {/* Search moved */}

            {/* Desktop Bulk Selection */}
            {isOwner && (
              <div className="hidden sm:flex items-center mr-4">
                  <button
                      onClick={toggleSelectionMode}
                      style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          border: selectionMode ? '1px solid #2196f3' : '1px solid #e0e0e0',
                          backgroundColor: selectionMode ? '#e3f2fd' : 'white',
                          cursor: 'pointer',
                          fontSize: '13px',
                          fontWeight: 600,
                          color: selectionMode ? '#2196f3' : '#555',
                          marginRight: '8px'
                      }}
                  >
                      {selectionMode ? 'Cancel Selection' : 'Select Listings'}
                  </button>
                  
                  {selectionMode && selectedListingIds.size > 0 && (
                    <>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                              disabled={isBulkAssigning}
                              style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  padding: '4px 10px',
                                  borderRadius: '6px',
                                  border: '1px solid #2196f3',
                                  backgroundColor: '#2196f3',
                                  cursor: isBulkAssigning ? 'not-allowed' : 'pointer',
                                  fontSize: '13px',
                                  fontWeight: 600,
                                  color: 'white',
                                  marginRight: '8px',
                                  opacity: isBulkAssigning ? 0.7 : 1
                              }}
                          >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 18l6-6-6-6"/>
                              </svg>
                              {isBulkAssigning ? 'Assigning...' : 'Assign to Branch'} ({selectedListingIds.size})
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                          {company?.branches?.length > 0 ? (
                            <>
                                <DropdownMenuItem 
                                    onClick={handleBulkAssignToAllBranches}
                                    style={{ fontWeight: 'bold', borderBottom: '1px solid #eee' }}
                                >
                                    Assign to All Branches
                                </DropdownMenuItem>
                                {company.branches.map((branch) => (
                                    <DropdownMenuItem
                                        key={branch.documentId || branch.id}
                                        onClick={() => handleBulkAssignToBranch(branch.documentId || branch.id, branch.name)}
                                    >
                                        {branch.name}
                                    </DropdownMenuItem>
                                ))}
                            </>
                          ) : (
                            <DropdownMenuItem disabled>No branches available</DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>

                      <button
                          onClick={handleBulkDelete}
                          disabled={isBulkDeleting}
                          style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '4px 10px',
                              borderRadius: '6px',
                              border: '1px solid #dc3545',
                              backgroundColor: '#dc3545',
                              cursor: isBulkDeleting ? 'not-allowed' : 'pointer',
                              fontSize: '13px',
                              fontWeight: 600,
                              color: 'white',
                              opacity: isBulkDeleting ? 0.7 : 1
                          }}
                      >
                          <Trash2 size={14} />
                          Delete ({selectedListingIds.size})
                      </button>
                    </>
                  )}
              </div>
            )}
            
            {/* Desktop Sort Dropdown */}
            <div className="hidden sm:flex items-center">
              <span style={{ fontSize: 13, color: "#888" }}>Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  fontSize: 13,
                  border: "1px solid #e0e0e0",
                  borderRadius: 4,
                  padding: "2px 8px",
                }}
              >
                <option value="Price">Price</option>
                <option value="Listing Date">Listing Date</option>
                <option value="Alphabetical Order">Alphabetical Order</option>
              </select>
            </div>
            {/* Desktop Category Filter Dropdown */}
            <div className="hidden sm:flex items-center ml-4">
              <span style={{ fontSize: 13, color: "#888" }}>Filter by:</span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                style={{
                  fontSize: 13,
                  border: "1px solid #e0e0e0",
                  borderRadius: 4,
                  padding: "2px 8px",
                }}
              >
                 <option value="All Categories">All Categories</option>
                 <option value="SINGLE">SINGLE</option>
                 <option value="DOUBLE">DOUBLE</option>
                 <option value="CHILD">CHILD</option>
                 <option value="HEAD">HEAD</option>
                 <option value="PLAQUES">PLAQUES</option>
                 <option value="CREMATION">CREMATION</option>
               </select>
            </div>
          </div>
        </div>

        {/* Search Input - Moved below toolbar */}
        <div style={{ maxWidth: 1200, margin: "0 auto 20px auto", padding: "0 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
           <div>
             {isOwner && (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <Checkbox 
                    id="select-all-search"
                    checked={selectionMode && selectedListingIds.size === sortedAndFilteredListings.length && sortedAndFilteredListings.length > 0}
                    onCheckedChange={handleSelectAll}
                    style={{ marginRight: 8 }}
                  />
                  <label htmlFor="select-all-search" style={{ fontSize: 13, cursor: 'pointer', userSelect: 'none', color: '#555', fontWeight: 600 }}>
                    Select All
                  </label>
                </div>
             )}
           </div>
           <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title..."
            className="focus:outline-none focus:ring-1 focus:ring-blue-500"
            style={{
              fontSize: 14,
              border: "1px solid #e0e0e0",
              borderRadius: 4,
              padding: "8px 12px",
              width: "100%",
              maxWidth: "300px"
            }}
          />
        </div>

        {/* Product Grid - Virtualized */}
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: mobile && !isOwner ? "0 16px" : 0 }}>
          {/* Display branch information if filtering by branch */}
          {branchFromUrl && (
            <>
              <BranchLocationInfo />
              <div className="col-span-full mb-4">
                <p className="text-gray-600">
                  Showing {filteredListings.length} listing{filteredListings.length !== 1 ? 's' : ''} for {branchFromUrl.name} branch
                </p>
              </div>
            </>
          )}

          {mobile ? (
            <Virtuoso
              useWindowScroll
              totalCount={sortedAndFilteredListings.length}
              itemContent={(index) => {
                const listing = sortedAndFilteredListings[index];
                return (
                  <ListingCardItem
                    key={listing.documentId || listing.id}
                    listing={listing}
                    isFirstCard={index === 0}
                    selectionMode={selectionMode}
                    isSelected={selectedListingIds.has(listing.documentId || listing.id)}
                    onToggleSelection={toggleListingSelection}
                    company={company}
                    branchFromUrl={branchFromUrl}
                    isOwner={isOwner}
                    isDuplicating={isDuplicating}
                    isDeleting={isDeleting}
                    onDuplicate={handleDuplicate}
                    onDelete={handleDeleteListing}
                    onEdit={handleEditListing}
                    onCreateSpecial={handleCreateSpecial}
                    onAddToBranch={handleAddToBranch}
                    fixedHeight={false}
                  />
                );
              }}
            />
          ) : (
            <VirtuosoGrid
            useWindowScroll
            totalCount={sortedAndFilteredListings.length}
            components={gridComponents}
            itemContent={(index) => {
              const listing = sortedAndFilteredListings[index];
              return (
                <ListingCardItem
                  key={listing.documentId || listing.id}
                  listing={listing}
                  isFirstCard={index === 0}
                  selectionMode={selectionMode}
                  isSelected={selectedListingIds.has(listing.documentId || listing.id)}
                  onToggleSelection={toggleListingSelection}
                  company={company}
                  branchFromUrl={branchFromUrl}
                  isOwner={isOwner}
                  isDuplicating={isDuplicating}
                  isDeleting={isDeleting}
                  onDuplicate={handleDuplicate}
                  onDelete={handleDeleteListing}
                  onEdit={handleEditListing}
                  onCreateSpecial={handleCreateSpecial}
                  onAddToBranch={handleAddToBranch}
                  fixedHeight={true}
                />
              );
            }}
          />
          )}
        </div>



        {/* Create Special Modal */}
        <CreateSpecialModal
          isOpen={modals.createSpecial}
          onClose={() => {
            toggleModal("createSpecial", false);
            setSelectedListing(null);
          }}
          listing={selectedListing}
        />

        {/* View Inquiries Modal */}
        <ViewInquiriesModal
          open={modals.viewInquiries}
          onClose={() => toggleModal("viewInquiries", false)}
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
        {modals.confirmDelete && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="deleteDialogTitle"
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
            }}
          >
            <div
              style={{
                background: "#fff",
                borderRadius: "12px",
                padding: "24px",
                maxWidth: "400px",
                width: "90%",
                boxShadow: "0 10px 25px rgba(0, 0, 0, 0.2)",
                animation: "slideIn 0.3s ease",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "16px",
                }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    backgroundColor: "#fef3c7",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: "16px",
                  }}
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                      stroke="#f59e0b"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div>
                  <h3
                    id="deleteDialogTitle"
                    style={{
                      margin: 0,
                      fontSize: "18px",
                      fontWeight: "600",
                      color: "#1f2937",
                    }}
                  >
                    Delete Listing
                  </h3>
                  <p
                    style={{
                      margin: "4px 0 0 0",
                      fontSize: "14px",
                      color: "#6b7280",
                    }}
                  >
                    This action cannot be undone
                  </p>
                </div>
              </div>

              <p
                style={{
                  margin: "0 0 24px 0",
                  fontSize: "16px",
                  color: "#374151",
                  lineHeight: "1.5",
                }}
              >
                Are you sure you want to delete{" "}
                <strong>"{listingToDelete?.title || "this listing"}"</strong>?
                This action cannot be undone.
              </p>

              {/* --- Added: Remove listing from a branch section --- */}
              {listingToDelete?.documentId && Array.isArray(company?.branches) && company.branches.length > 0 && (
                <div style={{ marginTop: "12px" }}>
                  <label style={{ display: "block", fontSize: "14px", fontWeight: 600, color: "#374151", marginBottom: "8px" }}>
                    Remove listing from a branch
                  </label>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <select
                      value={selectedBranchIdToDisconnect}
                      onChange={(e) => setSelectedBranchIdToDisconnect(e.target.value)}
                      style={{
                        padding: "8px 12px",
                        border: "1px solid #d1d5db",
                        borderRadius: "8px",
                        backgroundColor: "#fff",
                        fontSize: "14px",
                        color: "#111827",
                        outline: "none",
                      }}
                    >
                      <option value="">Select a branch</option>
                      {company.branches.map((b) => (
                        <option key={b?.documentId || b?.id} value={b?.documentId || b?.id}>
                          {b?.name || b?.branchName || "Unnamed Branch"}
                        </option>
                      ))}
                    </select>
                  </div>
                  {disconnectError && (
                    <p style={{ fontSize: "13px", color: "#dc2626", marginTop: "8px" }}>{disconnectError}</p>
                  )}
                  {disconnectSuccess && (
                    <p style={{ fontSize: "13px", color: "#16a34a", marginTop: "8px" }}>Listing removed from branch.</p>
                  )}
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  justifyContent: "flex-end",
                  marginTop: "20px",
                }}
              >
                <button
                  onClick={() => {
                    toggleModal("confirmDelete", false);
                    setListingToDelete(null);
                  }}
                  style={{
                    padding: "6px 14px",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    backgroundColor: "#fff",
                    color: "#374151",
                    fontSize: "13px",
                    fontWeight: "500",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                  onMouseOver={(e) => {
                    e.target.style.backgroundColor = "#f9fafb";
                    e.target.style.borderColor = "#9ca3af";
                  }}
                  onMouseOut={(e) => {
                    e.target.style.backgroundColor = "#fff";
                    e.target.style.borderColor = "#d1d5db";
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    if (!selectedBranchIdToDisconnect) return;
                    setDisconnecting(true);
                    setDisconnectError("");
                    setDisconnectSuccess(false);
                    try {
                      await updateBranch(selectedBranchIdToDisconnect, { listings: { disconnect: [listingToDelete.documentId] } });
                      setDisconnectSuccess(true);
                      setTimeout(() => {
                        if (typeof window !== "undefined") {
                          window.location.reload();
                        }
                      }, 500);
                    } catch (err) {
                      setDisconnectError(err?.message || "Failed to remove listing from branch");
                    } finally {
                      setDisconnecting(false);
                    }
                  }}
                  disabled={!selectedBranchIdToDisconnect || disconnecting}
                  style={{
                    padding: "6px 14px",
                    border: "1px solid #fca5a5",
                    borderRadius: "6px",
                    backgroundColor: disconnecting ? "#fecaca" : "#fff",
                    color: "#dc2626",
                    fontSize: "13px",
                    fontWeight: 500,
                    cursor: !selectedBranchIdToDisconnect || disconnecting ? "not-allowed" : "pointer",
                    transition: "all 0.2s ease",
                  }}
                  onMouseOver={(e) => {
                    if (!selectedBranchIdToDisconnect || disconnecting) return;
                    e.target.style.backgroundColor = "#fee2e2";
                  }}
                  onMouseOut={(e) => {
                    e.target.style.backgroundColor = disconnecting ? "#fecaca" : "#fff";
                  }}
                >
                  {disconnecting ? "Removing…" : "Remove From Branch"}
                </button>
                <button
                  onClick={() => {
                    toggleModal("confirmDelete", false);
                    if (listingToDelete) {
                      handleDelete(listingToDelete.documentId);
                    }
                    setListingToDelete(null);
                  }}
                  style={{
                    padding: "6px 14px",
                    border: "none",
                    borderRadius: "6px",
                    backgroundColor: "#dc2626",
                    color: "#fff",
                    fontSize: "13px",
                    fontWeight: "500",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                  onMouseOver={(e) => {
                    e.target.style.backgroundColor = "#b91c1c";
                  }}
                  onMouseOut={(e) => {
                    e.target.style.backgroundColor = "#dc2626";
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
          <div
            style={{
              position: "fixed",
              top: "20px",
              right: "20px",
              padding: "16px 24px",
              borderRadius: "8px",
              color: "#fff",
              fontWeight: "bold",
              zIndex: 1000,
              background:
                deleteMessage.includes("Error") ||
                deleteMessage.includes("Failed")
                  ? "#dc3545"
                  : "#28a745",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              animation: "slideIn 0.3s ease",
            }}
          >
            {deleteMessage}
          </div>
        )}

        {/* Branch Selection Modal */}
        <BranchSelectionModal
          isOpen={modals.branchSelection}
          onClose={() => toggleModal("branchSelection", false)}
          branches={company.branches || []}
          listingId={selectedListingForBranch?.documentId}
          onSuccess={(branch) => {
            toast({
              title: "Success",
              description: `Listing added to ${branch.name} branch`,
              status: "success",
            });
          }}
        />

        {/* Operating Hours Modal */}
        <OperatingHoursModal
          isOpen={modals.operatingHours}
          onClose={() => toggleModal("operatingHours", false)}
          initialData={company?.operatingHours || {
            monToFri: "",
            saturday: "",
            sunday: "",
            publicHoliday: ""
          }}
          onSave={handleSaveOperatingHours}
        />


      </div>
    </>
  );
}
