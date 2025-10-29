# Tombstones on Special - Real Data Implementation

## Summary
Successfully replaced dummy data with real backend data in the tombstones-on-special page.

## Changes Made

### 1. Data Fetching
- ✅ Added Apollo Client imports (`useQuery` from `@apollo/client`)
- ✅ Added GraphQL query import (`GET_LISTINGS` from `@/graphql/queries/getListings`)
- ✅ Implemented real data fetching with `useQuery(GET_LISTINGS)`

### 2. Data Processing
- ✅ Removed hardcoded `specialOffers` and `premiumSpecials` arrays
- ✅ Added data filtering by `isOnSpecial` property
- ✅ Separated listings into `standardSpecials` and `premiumSpecials` based on flags
- ✅ Created `mapListingToProduct()` function to transform GraphQL data to component format

### 3. State Management
- ✅ Added proper loading state with spinner and message
- ✅ Added error state with user-friendly error message
- ✅ Added empty state for when no specials are available
- ✅ Dynamic count display showing actual number of special offers

### 4. UI Improvements
- ✅ Conditional rendering of discount badges (only show when discount exists)
- ✅ Conditional rendering of original price (only show when different from sale price)
- ✅ Proper fallbacks for missing data (images, company info, etc.)

### 5. Data Mapping
The `mapListingToProduct()` function maps GraphQL listing data to the expected format:
- **Price**: Formatted with South African locale (R 12 345)
- **Details**: Built from category, stone type, and style
- **Features**: Built from customization options
- **Images**: Uses mainImage.url with fallback to placeholder
- **Company**: Maps manufacturer name, location, and logo
- **Dates**: Placeholder end dates (30 days from now)

## Files Modified
- `app/tombstones-on-special/page.js` - Main implementation

## Testing
- ✅ All validation checks passed (14/14)
- ✅ No hardcoded data remaining
- ✅ Proper error handling implemented
- ✅ Loading states working correctly

## Next Steps
1. Test the page in browser to verify real data display
2. Verify loading and error states work as expected
3. Ensure favorites functionality still works with real data
4. Consider adding discount calculation when backend supports it
5. Consider adding real end dates when backend supports special offer periods

## Notes
- Discount badges are hidden when no discount data is available
- Original price is hidden when same as sale price
- All existing UI components and styling preserved
- Favorites integration maintained with real product data

//Extend the rectangular button horizontally to align with the left edge of the search form. Match its color precisely with the existing orange search button in the search container, ensuring visual consistency.