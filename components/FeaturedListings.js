import Image from 'next/image';
import Link from 'next/link';

const FeaturedListings = ({ listing }) => (
  <Link href={`/tombstones-for-sale/${listing.documentId}`} className="block group">
    <div className="rounded-sm shadow-sm border border-gray-200 transition-all duration-300 h-full flex flex-col hover:border-b-2 hover:border-[#0090e0] hover:shadow-md hover:shadow-gray-300 items-center w-72 bg-white p-2 group-hover:bg-gray-50">
      <Image
        src={listing.mainImage?.url || '/placeholder.svg'}
        alt={listing.title}
        width={300}
        height={200}
        className="mb-2 rounded relative object-cover w-full"
      />
      <div className="p-2">
        <p className="text-blue-600 font-bold text-lg">R{listing.price}</p>
        <span className="text-xs px-2 py-0.5 rounded bg-green-100 text-green-700">Great Price</span>
        <h4 className="font-semibold text-gray-800 mt-1 text-sm truncate uppercase">{listing.title}</h4>
        <p className="text-gray-600 text-xs mt-1 whitespace-nowrap">
          <strong>Full Tombstone</strong>
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