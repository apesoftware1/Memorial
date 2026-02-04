# Cloudinary Image Optimization Plan & Documentation

## Overview
This document outlines the implementation of frontend-side Cloudinary image optimization to ensure sharp images across all devices and resolutions. The goal is to avoid blurry images caused by stretching small Strapi-generated formats (thumbnail, small) and instead use the original Cloudinary URL with render-time transformations.

## Implementation Details

### 1. Utility Function
A reusable utility function `cloudinaryOptimized` is located in `lib/cloudinary.js`.

```javascript
export const cloudinaryOptimized = (url, width = 1600) => {
  if (!url || typeof url !== 'string' || !url.includes('/upload/')) return url;
  
  // Prevent double optimization if already present
  if (url.includes('f_auto,q_auto')) return url;

  return url.replace(
    '/upload/',
    `/upload/f_auto,q_auto,w_${width}/`
  );
};
```

### 2. Usage Guidelines
When rendering images from Strapi (which stores them in Cloudinary), follow these rules:

1.  **Use the Original URL**: Always use `image.url` (the original high-res URL) as the source. Do NOT use `image.formats.thumbnail.url` or `image.formats.small.url`.
2.  **Apply Optimization**: Wrap the URL with `cloudinaryOptimized(url, width)`.
    *   `width`: Specify the target width (e.g., `1600` for hero images, `800` for cards, `100` for avatars).
3.  **Next.js `<Image />` Component**:
    *   Use the `unoptimized` prop to prevent Next.js from attempting to re-optimize the already optimized Cloudinary URL (which saves processing and avoids double-compression).
    *   Example:
        ```jsx
        <Image 
          src={cloudinaryOptimized(imageUrl, 800)} 
          width={800} 
          height={600} 
          alt="Description" 
          unoptimized 
        />
        ```

### 3. Optimized Components
The following key components have been updated to use this pattern:

*   **Hero Sections**:
    *   `app/page.js` (Home Page Hero)
*   **Listings & Cards**:
    *   `components/StandardListingCard.tsx`
    *   `components/PremiumListingCard.tsx`
    *   `components/FeaturedListings.js`
    *   `components/ProductGallery.jsx`
    *   `components/RelatedProducts.jsx`
    *   `app/components/ManufacturerCard.jsx`
*   **Banners & Ads**:
    *   `components/BannerAd.js`
*   **Sales Representatives**:
    *   `components/WhatsAppContactDrawer.jsx` (Avatars)

## Maintenance
*   **New Components**: Any new component rendering dynamic images from Strapi/Cloudinary must use the `cloudinaryOptimized` helper.
*   **Audit**: Periodically check for direct usages of `image.formats` or raw `/upload/` URLs without parameters.
*   **Performance**: Adjust the `width` parameter to match the maximum display size of the image container to minimize file size while maintaining quality.

## Troubleshooting
*   **Images still blurry?** Check if the source image in Cloudinary is high resolution. If the original is small, optimization cannot fix it. Ensure `width` parameter is sufficient for the container.
*   **Images not loading?** Verify the URL contains `/upload/`. The helper only works with standard Cloudinary upload URLs.
