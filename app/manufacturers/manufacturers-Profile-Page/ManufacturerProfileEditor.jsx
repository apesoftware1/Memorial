import Image from "next/image";
import Link from "next/link";
import { Star, MapPin, Edit2, Upload, Lock } from "lucide-react";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PremiumListingCard } from "@/components/premium-listing-card";
import Header from "@/components/Header";
import ViewInquiriesModal from "@/components/ViewInquiriesModal";
import CreateSpecialModal from "@/components/CreateSpecialModal";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { useManufacturerLocation } from "@/hooks/useManufacturerLocation";
import ManufacturerLocationModal from "@/components/ManufacturerLocationModal";
import { updateCompanyField } from "@/graphql/mutations/updateCompany";
import { toast } from "@/hooks/use-toast";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { useApolloClient } from '@apollo/client';
import { GET_LISTING_BY_ID } from '@/graphql/queries/getListingById';
import { GET_LISTING_CATEGORY } from '@/graphql/queries/getListingCategory';
import CreateBranchModal from "@/components/CreatebranchModal";
import BranchSelector from "@/components/BranchSelector";
import CompanyMediaUpload from "@/components/CompanyMediaUpload";
import BranchSelectionModal from "@/components/BranchSelectionModal";
import OperatingHoursModal from "@/components/OperatingHoursModal";
import { updateBranch } from "@/graphql/mutations/updateBranch";
import { useGuestLocation } from "@/hooks/useGuestLocation";

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

export default function ManufacturerProfileEditor({
  isOwner,
  company: initialCompany,
  listings,
  onVideoClick,
  branchButton,
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mobile, setMobile] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const sortModalRef = useRef();
  const [sortBy, setSortBy] = useState("Price");
  const isMounted = useRef(false);

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
  // Single-step Operating Hours editor state
  const OPERATING_DAY_ORDER = [
    "monToFri",
    "saturday",
    "sunday",
    "publicHoliday",
  ];
  const [operatingDayIndex, setOperatingDayIndex] = useState(0); // 0..3
  const [operatingPhase, setOperatingPhase] = useState("idle"); // 'idle' | 'open' | 'close' | 'review'
  const [tempOpenTime, setTempOpenTime] = useState(null); // holds selected open time before choosing close
  // Day-type filters; when empty, all are active
  const [selectedDayFilters, setSelectedDayFilters] = useState([]); // array of fields
  const activeDayOrder = selectedDayFilters.length
    ? selectedDayFilters
    : OPERATING_DAY_ORDER;
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
  // Profile picture upload state + Video modal
  const profilePicInputRef = useRef(null);
  const [isUploadingProfilePic, setIsUploadingProfilePic] = useState(false);
  const [showVideoSlotModal, setShowVideoSlotModal] = useState(false);
  const [showCreateBranchModal, setShowCreateBranchModal] = useState(false);
  const [showBranchSelectorModal, setShowBranchSelectorModal] = useState(false);
  const [showBranchSelectionModal, setShowBranchSelectionModal] = useState(false);
  const [selectedListingForBranch, setSelectedListingForBranch] = useState(null);
  const [showOperatingHoursModal, setShowOperatingHoursModal] = useState(false);

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
            // Try multiple possible category field structures
            const categoryName = listing.listing_category?.name
            return categoryName === categoryFilter;
          });
        }
        
        setFilteredListings(branchListings);
        setSelectedBranch(branch);
      } else {
        let filteredByCategory = listings;
        if (categoryFilter !== "All Categories") {
          filteredByCategory = listings.filter(listing => {
            // Try multiple possible category field structures
            const categoryName =  listing.listing_category?.name

            return categoryName === categoryFilter;
          });
        }
        setFilteredListings(filteredByCategory);
      }
    } else {
      let filteredByCategory = listings;
      if (categoryFilter !== "All Categories") {
        filteredByCategory = listings.filter(listing => {
          // Try multiple possible category field structures
          const categoryName = listing.listing_category?.name
            
          return categoryName === categoryFilter;
        });
      }
      setFilteredListings(filteredByCategory);
    }
    
    // Also update companyListings with category filter for consistency
    let filteredCompanyListings = listings || [];
    if (categoryFilter !== "All Categories") {
      filteredCompanyListings = filteredCompanyListings.filter(listing => {
        const categoryName = listing.listing_category?.name;
        return categoryName === categoryFilter;
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
  const slugify = (s) =>
    String(s || "")
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");

  async function handleDuplicate(listing) {
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

      // 2) Icon maps + resolver (mirrors Advert Creator)
      const COLOR_ICON_MAP = {
        Black:
          "/last_icons/AdvertCreator_Colour_Icons/6_Colour_Icons/Colour_Icon_Black.svg",
        Blue: "/last_icons/AdvertCreator_Colour_Icons/6_Colour_Icons/Colour_Icon_Blue.svg",
        Green:
          "/last_icons/AdvertCreator_Colour_Icons/6_Colour_Icons/Colour_Icon_Green.svg",
        "Grey-Dark":
          "/last_icons/AdvertCreator_Colour_Icons/6_Colour_Icons/Colour_Icon_Grey-Dark.svg",
        "Grey-Light":
          "/last_icons/AdvertCreator_Colour_Icons/6_Colour_Icons/Colour_Icon_Grey-Light.svg",
        Maroon:
          "/last_icons/AdvertCreator_Colour_Icons/6_Colour_Icons/Colour_Icon_Maroon.svg",
        Pearl:
          "/last_icons/AdvertCreator_Colour_Icons/6_Colour_Icons/Colour_Icon_Pearl.svg",
        White:
          "/last_icons/AdvertCreator_Colour_Icons/6_Colour_Icons/Colour_Icon_White.svg",
        Mixed:
          "/last_icons/AdvertCreator_Colour_Icons/6_Colour_Icons/Colour_Icon_Mixed.svg",
      };
      const HEAD_STYLE_ICON_MAP = {
        "Christian Cross":
          "/last icons/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_ChristianCross.svg",
        Heart:
          "/last icons/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_Heart.svg",
        Bible:
          "/last icons/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_Bible.svg",
        Pillars:
          "/last icons/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_Pillars.svg",
        "Traditional African":
          "/last icons/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_TraditionalAfrican.svg",
        Abstract:
          "/last icons/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_Abstract.svg",
        "Praying Hands":
          "/last icons/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_PrayingHands.svg",
        Scroll:
          "/last icons/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_Scroll.svg",
        Angel:
          "/last icons/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_Angel.svg",
        Mausoleum:
          "/last icons/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_Mausolean.svg",
        Obelisk:
          "/last icons/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_Obelisk.svg",
        Plain:
          "/last icons/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_Plain.svg",
        "Teddy Bear":
          "/last icons/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_TeddyBear.svg",
        Butterfly:
          "/last icons/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_Butterfly.svg",
        Car: "/last icons/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_Car.svg",
        Bike: "/last icons/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_Bike.svg",
        Sports:
          "/last icons/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/AdvertCreator_HeadStyle_Icon_Sport.svg",
      };
      const STONE_TYPE_ICON_MAP = {
        Biodegradable:
          "/last icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Biodegradable.svg",
        Brass:
          "/last icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Brass.svg",
        "Ceramic/Porcelain":
          "/last icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Ceramic_Porcelain.svg",
        Composite:
          "/last icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Composite.svg",
        Concrete:
          "/last icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Concrete.svg",
        Copper:
          "/last icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Copper.svg",
        Glass:
          "/last icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Glass.svg",
        Granite:
          "/last icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Granite.svg",
        Limestone:
          "/last icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Limestone.svg",
        Marble:
          "/last icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Marble.svg",
        Perspex:
          "/last icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Perspex.svg",
        Quartzite:
          "/last icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Quartzite.svg",
        Sandstone:
          "/last icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Sandstone.svg",
        Slate:
          "/last icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Slate.svg",
        Steel:
          "/last icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Steel.svg",
        Stone:
          "/last icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Stone.svg",
        Tile: "/last icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Tile.svg",
        Wood: "/last icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_Wood.svg",
      };
      const CUSTOMIZATION_ICON_MAP = {
        "Bronze/Stainless Plaques":
          "/last icons/AdvertCreator_Icons_Customisation_Icons/AdvertCreator_Icons_Customisation_Icons/AdvertCreator_Customisation_Icon_BronzeStainless Plaque.svg",
        "Ceramic Photo Plaques":
          "/last icons/AdvertCreator_Icons_Customisation_Icons/AdvertCreator_Icons_Customisation_Icons/AdvertCreator_Customisation_Icon_CeramicPhotoPlaque.svg",
        "Flower Vases":
          "/last icons/AdvertCreator_Icons_Customisation_Icons/AdvertCreator_Icons_Customisation_Icons/AdvertCreator_Customisation_Icon_FlowerVase.svg",
        "Gold Lettering":
          "/last icons/AdvertCreator_Icons_Customisation_Icons/AdvertCreator_Icons_Customisation_Icons/AdvertCreator_Customisation_Icon_GoldLettering.svg",
        "Inlaid Glass":
          "/last icons/AdvertCreator_Icons_Customisation_Icons/AdvertCreator_Icons_Customisation_Icons/AdvertCreator_Customisation_Icon_InlaidGlass.svg",
        "Photo Laser-Edging":
          "/last icons/AdvertCreator_Icons_Customisation_Icons/AdvertCreator_Icons_Customisation_Icons/AdvertCreator_Customisation_Icon_PhotoLaserEdginhg.svg",
        "QR Code":
          "/last icons/AdvertCreator_Icons_Customisation_Icons/AdvertCreator_Icons_Customisation_Icons/AdvertCreator_Customisation_Icon_QR Code.svg",
      };
      const getIconPath = (type, value) => {
        const key = String(value || "").trim();
        switch (type) {
          case "color":
            return COLOR_ICON_MAP[key] || null;
          case "style":
            return (
              HEAD_STYLE_ICON_MAP[key] ||
              "/new files/newIcons/Styles_Icons/Styles_Icons-11.svg"
            );
          case "stoneType":
            return STONE_TYPE_ICON_MAP[key] || null;
          case "customization":
            return (
              CUSTOMIZATION_ICON_MAP[key] ||
              "/new files/newIcons/Custom_Icons/Custom_Icons-54.svg"
            );
          default:
            return null;
        }
      };

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
          fetchPolicy: "network-only",
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

      // 7) Navigate to edit the duplicated listing immediately
      if (newDocId) {
        router.push(
          `/manufacturers/manufacturers-Profile-Page/update-listing/${newDocId}`
        );
      }
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
  }

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

  // Social icon map - using proper named icons
  const socialIconMap = {
    website: "/new files/newIcons/Social Media Icons/Advert Set-Up-03.svg", // Website icon (using generic)
    facebook: "/new files/Social Media Icons/Social Media Icons/facebook.svg",
    instagram: "/new files/newIcons/Social Media Icons/Advert Set-Up-04.svg", // Instagram icon
    tiktok: "/new files/newIcons/Social Media Icons/Advert Set-Up-07.svg", // TikTok icon (using generic for now)
    youtube: "/new files/newIcons/Social Media Icons/Advert Set-Up-05.svg", // YouTube icon
    x: "/new files/Social Media Icons/Social Media Icons/twitter.svg", // Using twitter.svg for X
    whatsapp: "/new files/Social Media Icons/Social Media Icons/whatsapp.svg",
    messenger:
      "/new files/Social Media Icons/Social Media Icons/Advert Set-Up-06.svg", // Messenger icon (confirmed)
  };

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
          const baseUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL || "https://api.tombstonesfinder.co.za/api";
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
    setViewInquiriesModalOpen(true);
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
                  onClick={() => setShowBranchSelectorModal(true)}
                >
                  Switch Branch
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setShowCreateBranchModal(true)}
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
            margin: "24px auto 0 auto",
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
                  onClick={() => setShowOperatingHoursModal(true)}
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
              isOpen={showCreateBranchModal}
              onClose={() => setShowCreateBranchModal(false)}
            />
            
            {/* Branch Selector Modal */}
            <Dialog open={showBranchSelectorModal} onOpenChange={setShowBranchSelectorModal}>
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
                      setShowBranchSelectorModal(false);
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
            {showVideoSlotModal && (
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
                onClick={() => setShowVideoSlotModal(false)}
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
                      onClick={() => setShowVideoSlotModal(false)}
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
                        src={socialIconMap[social.name] || ""}
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
                          src={socialIconMap[social.name] || ""}
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
          <div style={{ fontSize: 15, fontWeight: 700 }}>
            {companyListings.length} Active Listings
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
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

        {/* Product Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: mobile ? "1fr" : "1fr 1fr",
            gap: mobile ? 20 : 40,
            maxWidth: 1200,
            margin: "0 auto",
            alignItems: "stretch",
          }}
        >
          {/* Display branch information if filtering by branch */}
          {branchFromUrl && <BranchLocationInfo />}
          
          {/* Display exact count of listings for the branch */}
          {branchFromUrl && (
            <div className="col-span-full mb-4">
              <p className="text-gray-600">
                Showing {filteredListings.length} listing{filteredListings.length !== 1 ? 's' : ''} for {branchFromUrl.name} branch
              </p>
            </div>
          )}
          
          {[...(branchFromUrl ? filteredListings : companyListings)]
            .sort((a, b) => {
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
            })
            .map((listing, idx) => (
              <div
                key={listing.documentId || listing.id}
                style={{ width: "100%", height: "100%", position: "relative" }}
              >
                <PremiumListingCard
                  listing={{
                    ...listing,
                    company: {
                      name: company.name,
                      logoUrl:
                        company.logoUrl ||
                        company.logo ||
                        "/placeholder-logo.svg",
                      location: company.location || "location not set",
                      latitude:
                        branchFromUrl?.location?.latitude ??
                        branchFromUrl?.location?.coordinates?.latitude ??
                        company.latitude,
                      longitude:
                        branchFromUrl?.location?.longitude ??
                        branchFromUrl?.location?.coordinates?.longitude ??
                        company.longitude,
                      slug: company.slug,
                    },
                    manufacturer: company.name,
                    enquiries: listing.inquiries?.length || 0,
                  }}
                  isFirstCard={idx === 0}
                  href={`/tombstones-for-sale/${
                    listing.documentId || listing.id
                  }`}
                  isOwner={isOwner}
                />
                {isOwner && (
                  <div style={{ position: 'absolute', top: 40, right: 16, zIndex: 2 }}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          style={{
                            background: "#808080",
                            border: "none",
                            borderRadius: 6,
                            padding: "6px 12px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                          }}
                        >
                          <SettingsIcon />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() =>
                            (window.location.href = `/manufacturers/manufacturers-Profile-Page/update-listing/${
                              listing.documentId || listing.id
                            }`)
                          }
                        >
                          Edit Listing
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDuplicate(listing)}
                          disabled={isDuplicating}
                          style={{
                            opacity: isDuplicating ? 0.6 : 1,
                            cursor: isDuplicating ? "not-allowed" : "pointer",
                          }}
                        >
                          {isDuplicating
                            ? "Duplicating..."
                            : "Duplicate Listing"}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setListingToDelete(listing);
                            setShowConfirmDialog(true);
                          }}
                          disabled={isDeleting}
                          style={{
                            opacity: isDeleting ? 0.6 : 1,
                            cursor: isDeleting ? "not-allowed" : "pointer",
                          }}
                        >
                          {isDeleting ? "Deleting..." : "Delete Listing"}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedListing(listing);
                            setCreateSpecialModalOpen(true);
                          }}
                        >
                          Create Special
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            if (company.branches?.length > 0) {
                              setSelectedListingForBranch(listing);
                              setShowBranchSelectionModal(true);
                            }
                          }}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <span>Add to Branch</span>
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            style={{ marginLeft: "8px" }}
                          >
                            <path
                              d="M9 18l6-6-6-6"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
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
                    <button
                      onClick={async () => {
                        if (!selectedBranchIdToDisconnect) return;
                        setDisconnecting(true);
                        setDisconnectError("");
                        setDisconnectSuccess(false);
                        try {
                          await updateBranch(selectedBranchIdToDisconnect, { listings: { disconnect: [listingToDelete.documentId] } });
                          setDisconnectSuccess(true);
                          // Reload the page after successful removal
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
                        padding: "8px 12px",
                        border: "1px solid #fca5a5",
                        borderRadius: "8px",
                        backgroundColor: disconnecting ? "#fecaca" : "#fff",
                        color: "#dc2626",
                        fontSize: "14px",
                        fontWeight: 500,
                        cursor: !selectedBranchIdToDisconnect || disconnecting ? "not-allowed" : "pointer",
                      }}
                    >
                      {disconnecting ? "Removing…" : "Remove From Branch"}
                    </button>
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
                  gap: "12px",
                  justifyContent: "flex-end",
                }}
              >
                <button
                  onClick={() => {
                    setShowConfirmDialog(false);
                    setListingToDelete(null);
                  }}
                  style={{
                    padding: "10px 20px",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    backgroundColor: "#fff",
                    color: "#374151",
                    fontSize: "14px",
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
                  onClick={() => {
                    setShowConfirmDialog(false);
                    if (listingToDelete) {
                      handleDelete(listingToDelete.documentId);
                    }
                    setListingToDelete(null);
                  }}
                  style={{
                    padding: "10px 20px",
                    border: "none",
                    borderRadius: "8px",
                    backgroundColor: "#dc2626",
                    color: "#fff",
                    fontSize: "14px",
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
          isOpen={showBranchSelectionModal}
          onClose={() => setShowBranchSelectionModal(false)}
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
          isOpen={showOperatingHoursModal}
          onClose={() => setShowOperatingHoursModal(false)}
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
