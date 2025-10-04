import Image from 'next/image';
import Link from 'next/link';
import { formatPrice } from '@/lib/priceUtils';

// Helper to map listing category fields to a user-friendly label
function getCategoryLabel(listing) {
  if (!listing) return 'Full Tombstone';
  const candidates = [
    listing.categoryTab,
    listing.categorytab,
    listing.category,
    listing.bodyType,
    listing.productType,
    listing.type,
    listing?.productDetails?.bodyType?.[0]?.value,
    listing?.productDetails?.bodyType,
  ].filter(Boolean);

  const raw = candidates.find((v) => typeof v === 'string' && v.trim() !== '');
  if (!raw) return 'Full Tombstone';
  const s = raw.toLowerCase();
  if (s.includes('single')) return 'Single Tombstone';
  if (s.includes('double')) return 'Double Tombstone';
  if (s.includes('headstone') && !s.includes('double')) return 'Headstone';
  if (s.includes('full')) return 'Full Tombstone';
  if (s.includes('cremation')) return 'Cremation Memorial';
  if (s.includes('family')) return 'Family Monument';
  if (s.includes('child')) return 'Child Memorial';
  if (s.includes('custom')) return 'Custom Design';
  return raw.replace(/\b\w/g, (ch) => ch.toUpperCase());
}

const FeaturedListings = ({ listing }) => (
  <Link href={`/tombstones-for-sale/${listing.documentId}`} className="block group">
    <div className="bg-white border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Image Container */}
      <div className="relative h-56 bg-gray-100">
        <Image
          src={listing.mainImageUrl || '/placeholder.svg'}
          alt={listing.title}
          fill
          className="object-cover"
        />
      </div>
      
      {/* Content */}
      <div className="p-4">
        {/* Price and Tag Row */}
        <div className="flex justify-between items-center mb-3">
          <p className="font-bold text-blue-600 text-lg">{formatPrice(listing.price)}</p>
          <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded">
            {listing.adFlasher || "Great Price"}
          </span>
        </div>
        
        {/* Product Title */}
        <h4 className="font-bold text-gray-800 mb-2 text-sm uppercase">
          {listing.title}
        </h4>
        
        {/* Product Details */}
        <p className="text-xs text-gray-600">
          <strong>{listing.listing_category?.name || getCategoryLabel()}</strong>
          {listing.productDetails?.stoneType && Array.isArray(listing.productDetails.stoneType) && listing.productDetails.stoneType.length > 0 && listing.productDetails.stoneType[0]?.value && (
            <> | {listing.productDetails.stoneType[0].value}</>
          )}
          {listing.productDetails?.style && Array.isArray(listing.productDetails.style) && listing.productDetails.style.length > 0 && listing.productDetails.style[0]?.value && (
            <> | {listing.productDetails.style[0].value}</>
          )}
        </p>
      </div>
    </div>
  </Link>
);

export default FeaturedListings;