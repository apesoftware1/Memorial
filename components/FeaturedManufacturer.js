import Image from 'next/image'
import Link from 'next/link'
import { cloudinaryOptimized } from '@/lib/cloudinary'

// Removed the old import for ProductCard
// import { ProductCard } from '@/components/product-card'
import { useState, useRef, useEffect } from 'react'
import { useQuery } from '@apollo/client';
import { GET_LISTINGS_BY_COMPANY_NAME } from '@/graphql/queries/getListingsByManufacturer';
import FeaturedListings from './FeaturedListings';
import { PageLoader } from '@/components/ui/loader';

const FeaturedManufacturer = ({ manufacturer }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollContainerRef = useRef(null);

  const { data, loading, error } = useQuery(GET_LISTINGS_BY_COMPANY_NAME, {
    variables: { name: manufacturer?.name },
    skip: !manufacturer?.name,
  });

  if (loading) return <PageLoader text="Loading manufacturer listings..." />;
  if (error) return (
    <div className="text-center py-8">
      <p className="text-red-600 font-medium mb-4">Error loading listings</p>
      <button 
        onClick={() => window.location.reload()} 
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Refresh Page
      </button>
    </div>
  );

  const products = data?.listings || [];

  // Create an array of featured listings (where isFeatured is true)
  const featuredProducts = products.filter(product => product.isFeatured);
  const topFeaturedProducts = featuredProducts.slice(0, 3);

  // Function to handle scroll and update active index
  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const scrollLeft = scrollContainerRef.current.scrollLeft;
      const cardWidth = 320; // Adjusted for mobile card width
      const newIndex = Math.round(scrollLeft / cardWidth);
      setActiveIndex(Math.min(newIndex, topFeaturedProducts.length - 1));
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => {
        container.removeEventListener('scroll', handleScroll);
      };
    }
  }, [handleScroll]);

  // Function to scroll to specific card
  const scrollToCard = (index) => {
    if (scrollContainerRef.current) {
      const cardWidth = 320;
      scrollContainerRef.current.scrollTo({
        left: index * cardWidth,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="py-4">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-center text-gray-600 mb-2">Featured Manufacturer</h3>
          <p className="text-center text-xs text-gray-500 mb-4">*Sponsored</p>

          <div 
            className="border border-gray-300 rounded bg-white p-4 mb-4 hover:shadow-md transition-shadow"
            onContextMenu={(e) => e.preventDefault()}
            onDragStart={(e) => e.preventDefault()}
          >
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0">
              <div>
                <h4 className="font-bold text-gray-800 text-xl mb-1 leading-tight">{manufacturer.name}</h4>
              </div>
              <div>
                <Image
                  src={cloudinaryOptimized(manufacturer.logo, 100) || "/placeholder.svg?height=80&width=80"}
                  alt={`${manufacturer.name} Logo`}
                  width={80}
                  height={80}
                  className="rounded-full"
                  unoptimized
                />
              </div>
            </div>
            <Link
              href={manufacturer.link || "#"}
              className="text-blue-600 text-sm hover:text-blue-700 hover:underline transition-colors inline-block mt-2"
            >
              View more matching tombstones
            </Link>
          </div>

          {/* Mobile: Horizontal scrolling cards */}
          <div className="md:hidden">
            <div 
              ref={scrollContainerRef}
              className="flex overflow-x-auto gap-4 snap-x snap-mandatory scrollbar-hide"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {topFeaturedProducts.map((product, index) => (
                <div key={product.documentId || index} className="flex-shrink-0 w-80 snap-start">
                  <FeaturedListings listing={product} />
                </div>
              ))}
            </div>
            {/* Pagination Dots - Mobile only */}
            <div className="flex justify-center mt-4 space-x-2">
              {topFeaturedProducts.map((_, index) => (
                <button
                  key={index} 
                  onClick={() => scrollToCard(index)}
                  className={`w-3 h-3 rounded-full transition-colors duration-200 ${
                    index === activeIndex ? 'bg-blue-500' : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to card ${index + 1}`}
                ></button>
              ))}
            </div>
          </div>

          {/* Desktop: Grid layout */}
          <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {topFeaturedProducts.map((product, index) => (
              <FeaturedListings key={product.documentId || index} listing={product} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

const ProductCard = ({ product }) => (
  <div className="bg-white border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
    {/* Image Container */}
    <div className="relative h-56 bg-gray-100">
      <Image
        src={cloudinaryOptimized(product.image, 400) || "/placeholder.svg"}
        alt={product.title}
        fill
        className="object-cover"
        unoptimized
      />
    </div>

    {/* Content */}
    <div className="p-4">
      {/* Price and Tag Row */}
      <div className="flex justify-between items-center mb-3">
        <p className="font-bold text-blue-600 text-lg">{product.price}</p>
        {product.tag && (
          <span className={`text-xs px-2 py-1 rounded ${product.tag === 'Low Price' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
            {product.tag}
          </span>
        )}
      </div>
      
      {/* Product Title */}
      <h4 className="font-bold text-gray-800 mb-2 text-sm uppercase">
        {product.title}
      </h4>
      
      {/* Product Details */}
      <p className="text-xs text-gray-600">
        {product.details}
      </p>
    </div>
  </div>
)

export default FeaturedManufacturer
