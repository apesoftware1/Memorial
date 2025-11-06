import { useCallback, useEffect, useMemo, useState } from "react";
import { trackAnalyticsEvent } from "@/lib/analytics";
import { useGuestLocation } from "@/hooks/useGuestLocation";

export function getFirstValue(arr) {
  return Array.isArray(arr) && arr.length > 0 ? arr[0]?.value : undefined;
}

export function getAllValues(arr) {
  return Array.isArray(arr) ? arr.map((item) => item?.value) : [];
}

function getFirstIcon(arr) {
  // If array exists and has items
  if (Array.isArray(arr) && arr.length > 0) {
    // First try to get icon from first item
    if (arr[0]?.icon) {
      return arr[0].icon;
    }
    // If no icon property but value exists, try to construct icon path
    if (arr[0]?.value) {
      const value = arr[0].value.toLowerCase().replace(/\s+/g, '-');
      return `/last_icons/${value}-icon.svg`;
    }
  }
  // Default icon path for each type
  return `/last_icons/default-icon.svg`;
}

function buildAllImages(listing) {
  const mainImageUrl = listing?.mainImageUrl || listing?.image || "/placeholder.svg";
  const thumbnails = Array.isArray(listing?.thumbnailUrls)
    ? listing.thumbnailUrls.filter((url) => url && url !== mainImageUrl)
    : [];
  return [mainImageUrl, ...thumbnails];
}

export function useProductShowcaseLogic(listing) {
  // Analytics: once per listing id
  useEffect(() => {
    if (listing?.documentId) {
      trackAnalyticsEvent("listing_view", listing.documentId);
    }
  }, [listing?.documentId]);

  // Images and selected index
  const allImages = useMemo(() => buildAllImages(listing), [listing]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Contact toggle
  const [showContact, setShowContact] = useState(false);
  const handleShowContact = useCallback(() => setShowContact((v) => !v), []);

  // Product details and icons
  const productDetails = listing?.productDetails || {};
  const additionalDetails = listing?.additionalProductDetails || {};
  const icons = useMemo(() => {
    return {
      stoneTypeIcon: getFirstIcon(productDetails.stoneType),
      headStyleIcon: getFirstIcon(productDetails.style),
      slabStyleIcon: getFirstIcon(productDetails.slabStyle),
      colourIcon: getFirstIcon(productDetails.color),
      customIcon: getFirstIcon(productDetails.customization),
    };
  }, [productDetails]);

  // Company location
  const companyLocation = useMemo(
    () => ({
      lat: Number(listing?.company?.latitude) ,
      lng: Number(listing?.company?.longitude),
    }),
    [listing?.company?.latitude, listing?.company?.longitude]
  );

  // Distance from guest
  const { error, loading, calculateDistanceFrom, refreshLocation } = useGuestLocation();
  const [distanceInfo, setDistanceInfo] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const fetchDistance = async () => {
      if (!companyLocation.lat || !companyLocation.lng) return;
      const result = await calculateDistanceFrom(companyLocation);
      if (!cancelled) setDistanceInfo(result);
    };
    fetchDistance();
    return () => {
      cancelled = true;
    };
  }, [companyLocation.lat, companyLocation.lng, calculateDistanceFrom]);

  // Manufacturer/company info previously built in component
  const info = useMemo(
    () => ({
      logo: listing?.company?.logoUrl || "/placeholder-logo.svg",
      rating: listing?.company?.googleRating || 4.7,
      hours: [],
    }),
    [listing?.company?.logoUrl, listing?.company?.googleRating]
  );

  return {
    // images
    allImages,
    selectedImageIndex,
    setSelectedImageIndex,
    // details
    productDetails,
    additionalDetails,
    icons,
    getFirstValue,
    getAllValues,
    // contact toggle
    showContact,
    handleShowContact,
    // distance/location
    distanceInfo,
    loading,
    error,
    refreshLocation,
    // add this
    info,
  };
}