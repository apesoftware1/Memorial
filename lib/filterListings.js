import { checkListingLocation } from "./locationHelpers";

// Helper: safely get array of values from productDetails field
export const getDetailValues = (listing, key) => {
  const arr = listing?.productDetails?.[key];
  if (Array.isArray(arr)) {
    return arr
      .map((item) => (item?.value || "").toString().toLowerCase())
      .filter(Boolean);
  }
  return [];
};

const parsePrice = (priceStr) => {
  if (!priceStr) return 0;
  if (typeof priceStr === "number") return priceStr;
  if (typeof priceStr === "string") {
    return Number(priceStr.replace(/[^\d]/g, ""));
  }
  try {
    const str = String(priceStr);
    return Number(str.replace(/[^\d]/g, ""));
  } catch {
    return 0;
  }
};

/**
 * Filter listings based on various criteria
 * @param {Array} sourceListings - Array of listing objects
 * @param {Object} filters - Filter criteria
 * @param {Array} categories - Array of category objects
 * @param {number} activeTab - Index of the active category tab
 * @returns {Array} - Filtered listings
 */
export function filterListings(sourceListings, filters, categories, activeTab) {
  if (!Array.isArray(sourceListings) || sourceListings.length === 0)
    return [];

  const f = filters || {};
  
  // Determine selected category from tabs
  let selectedCategoryName = "";
  if (Array.isArray(categories) && categories.length > 0 && activeTab !== undefined) {
    const desiredOrder = [
      "SINGLE",
      "DOUBLE",
      "CHILD",
      "HEAD",
      "PLAQUES",
      "CREMATION",
    ];
    const sortedCategories = desiredOrder
      .map((name) =>
        categories.find(
          (cat) => cat?.name && cat.name.toUpperCase() === name
        )
      )
      .filter(Boolean);
    const selectedCategoryObj = sortedCategories[activeTab];
    selectedCategoryName = selectedCategoryObj?.name || "";
  }

  return (
    sourceListings
      // Search content (against title, company name, ID, and documentId)
      .filter((listing) => {
        if (!f.search || f.search === "") return true;
        
        const searchQuery = String(f.search).toLowerCase();
        const title = (listing?.title || "").toLowerCase();
        const companyName = (listing?.company?.name || "").toLowerCase();
        const documentId = (listing?.documentId || "").toLowerCase();
        const id = (listing?.id || "").toString().toLowerCase();
        const productId = (listing?.productDetails?.id || "").toLowerCase();
        const listingSlug = (listing?.slug || "").toLowerCase();

        return (
          title.includes(searchQuery) ||
          companyName.includes(searchQuery) ||
          documentId.includes(searchQuery) ||
          id.includes(searchQuery) ||
          productId.includes(searchQuery) ||
          listingSlug.includes(searchQuery)
        );
      })
      // Category
      .filter((listing) =>
        selectedCategoryName
          ? (listing?.listing_category?.name || "").toLowerCase().trim() ===
            selectedCategoryName.toLowerCase().trim()
          : true
      )
      // Location (partial)
      .filter((listing) =>
        f.location &&
        f.location !== "All" &&
        f.location !== "Any" &&
        f.location !== ""
          ? checkListingLocation(listing, f.location)
          : true
      )
      // Stone Type (partial)
      .filter((listing) => {
        const filterVal = f.stoneType;
        if (
          !filterVal ||
          filterVal === "All" ||
          filterVal === "Any" ||
          filterVal === ""
        )
          return true;
        const itemVal = (listing?.productDetails?.stoneType?.[0]?.value || "").toLowerCase();
        if (Array.isArray(filterVal)) return filterVal.some(v => itemVal.includes(String(v).toLowerCase()));
        return itemVal.includes(String(filterVal).toLowerCase());
      })
      // Colour/Color (partial)
      .filter((listing) => {
        const query = f.color || f.colour;
        if (
          !query ||
          query === "All" ||
          query === "Any" ||
          query === ""
        )
          return true;
        const colour = (listing?.productDetails?.color?.[0]?.value || "").toLowerCase();
        if (Array.isArray(query)) return query.some(v => colour.includes(String(v).toLowerCase()));
        return colour.includes(String(query).toLowerCase());
      })
      // Head style (partial)
      .filter((listing) => {
        const filterVal = f.style;
        if (
          !filterVal ||
          filterVal === "All" ||
          filterVal === "Any" ||
          filterVal === ""
        )
          return true;
        const itemVal = (listing?.productDetails?.style?.[0]?.value || "").toLowerCase();
        if (Array.isArray(filterVal)) return filterVal.some(v => itemVal.includes(String(v).toLowerCase()));
        return itemVal.includes(String(filterVal).toLowerCase());
      })
      // Slab style (partial)
      .filter((listing) => {
        const filterVal = f.slabStyle;
        if (
          !filterVal ||
          filterVal === "All" ||
          filterVal === "Any" ||
          filterVal === ""
        )
          return true;
        const itemVal = (listing?.productDetails?.slabStyle?.[0]?.value || "").toLowerCase();
        if (Array.isArray(filterVal)) return filterVal.some(v => itemVal.includes(String(v).toLowerCase()));
        return itemVal.includes(String(filterVal).toLowerCase());
      })
      // Customization (partial)
      .filter((listing) => {
        const filterVal = f.custom;
        if (
          !filterVal ||
          filterVal === "All" ||
          filterVal === "Any" ||
          filterVal === ""
        )
          return true;
        const itemVal = (listing?.productDetails?.customization?.[0]?.value || "").toLowerCase();
        if (Array.isArray(filterVal)) return filterVal.some(v => itemVal.includes(String(v).toLowerCase()));
        return itemVal.includes(String(filterVal).toLowerCase());
      })
      // Min Price
      .filter((listing) => {
        if (!f.minPrice || f.minPrice === "Min Price" || f.minPrice === "") {
          return true;
        }
        const min = parsePrice(f.minPrice);
        if (!listing.price) return false;
        return parsePrice(listing.price) >= min;
      })
      // Max Price
      .filter((listing) => {
        if (!f.maxPrice || f.maxPrice === "Max Price" || f.maxPrice === "") {
          return true;
        }
        const max = parsePrice(f.maxPrice);
        if (!listing.price) return false;
        return parsePrice(listing.price) <= max;
      })
  );
}
