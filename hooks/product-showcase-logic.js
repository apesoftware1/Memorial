import { useCallback, useEffect, useMemo, useState } from "react";
import { trackAnalyticsEvent } from "@/lib/analytics";
import { useGuestLocation } from "@/hooks/useGuestLocation";
import { ICON_PATHS } from "@/app/manufacturers/manufacturers-Profile-Page/update-listing/constants/updateListingConstants";

export function getFirstValue(arr) {
  return Array.isArray(arr) && arr.length > 0 ? arr[0]?.value : undefined;
}

export function getAllValues(arr) {
  return Array.isArray(arr) ? arr.map((item) => item?.value) : [];
}

function getFirstIcon(arr) {
  if (!Array.isArray(arr) || arr.length === 0) return null;
  return arr[0]?.icon || null;
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

  const fixIconPath = useCallback((path) => {
    if (!path) return null;
    let fixedPath = path;

    fixedPath = fixedPath.replace(/:\d+\//, "/");
    if (!fixedPath.startsWith("/")) fixedPath = `/${fixedPath}`;

    fixedPath = fixedPath
      .replace("/last icons/", "/last_icons/")
      .replace("/Adv_vpe_Icon_", "/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icon_")
      .replace("/public/", "/")
      .replace(/\/{2,}/g, "/")
      .replace(/_Mausoleum\.svg$/i, "_Mausolean.svg");

    if (
      fixedPath.includes("/AdvertCreator_StoneType_Icons/") &&
      !fixedPath.includes("/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icons/")
    ) {
      fixedPath = fixedPath.replace(
        "/AdvertCreator_StoneType_Icons/",
        "/AdvertCreator_StoneType_Icons/AdvertCreator_StoneType_Icons/"
      );
    }

    if (
      fixedPath.includes("/AdvertCreator_Head_Style_Icons/") &&
      !fixedPath.includes("/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/")
    ) {
      fixedPath = fixedPath.replace(
        "/AdvertCreator_Head_Style_Icons/",
        "/AdvertCreator_Head_Style_Icons/AdvertCreator_Head_Style_Icons/"
      );
    }

    if (
      fixedPath.includes("/AdvertCreator_SlabStyle_Icons/") &&
      !fixedPath.includes("/AdvertCreator_SlabStyle_Icons/AdvertCreator_SlabStyle_Icons/")
    ) {
      fixedPath = fixedPath.replace(
        "/AdvertCreator_SlabStyle_Icons/",
        "/AdvertCreator_SlabStyle_Icons/AdvertCreator_SlabStyle_Icons/"
      );
    }

    if (
      fixedPath.includes("/AdvertCreator_Icons_Customisation_Icons/") &&
      !fixedPath.includes(
        "/AdvertCreator_Icons_Customisation_Icons/AdvertCreator_Icons_Customisation_Icons/"
      )
    ) {
      fixedPath = fixedPath.replace(
        "/AdvertCreator_Icons_Customisation_Icons/",
        "/AdvertCreator_Icons_Customisation_Icons/AdvertCreator_Icons_Customisation_Icons/"
      );
    }

    if (fixedPath.includes("/AdvertCreator_Colour_Icons/") && !fixedPath.includes("/6_Colour_Icons/")) {
      fixedPath = fixedPath.replace("/AdvertCreator_Colour_Icons/", "/AdvertCreator_Colour_Icons/6_Colour_Icons/");
    }

    return fixedPath;
  }, []);

  const resolveIcon = useCallback(
    (key, arr) => {
      const value = getFirstValue(arr);
      const mapped = value ? ICON_PATHS?.[key]?.[value] : null;
      const raw = mapped || getFirstIcon(arr);
      return fixIconPath(raw);
    },
    [fixIconPath]
  );

  const icons = useMemo(() => {
    return {
      stoneTypeIcon: resolveIcon("stoneType", productDetails.stoneType),
      overallStyleIcon: resolveIcon("overallStyle", productDetails.overallStyle),
      headStyleIcon: resolveIcon("style", productDetails.style),
      slabStyleIcon: resolveIcon("slabStyle", productDetails.slabStyle),
      colourIcon: resolveIcon("color", productDetails.color),
      customIcon: resolveIcon("customization", productDetails.customization),
    };
  }, [productDetails, resolveIcon]);

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
