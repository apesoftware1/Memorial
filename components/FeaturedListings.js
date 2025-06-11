import Image from 'next/image'
import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'

const FeaturedListings = ({ listings }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollContainerRef = useRef(null);

  // Function to handle scroll and update active index
  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const scrollLeft = scrollContainerRef.current.scrollLeft;
      const cardWidth = 264; // w-64 (256px) + gap-4 (16px) = 272px, but some padding etc may reduce the effective width.
      // Adjust this value if cards are not aligning correctly
      const newIndex = Math.round(scrollLeft / cardWidth);
      setActiveIndex(newIndex);
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

  return (
    <section className="pt-0 pb-4">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-xs text-gray-500 mb-4">*Sponsored</p>

          <div 
            ref={scrollContainerRef}
            className="flex overflow-x-auto gap-4 sm:grid sm:grid-cols-2 md:grid-cols-3 scrollbar-hide snap-x snap-mandatory"
          >
            {listings.map((product, index) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          {/* Pagination Dots */}
          <div className="flex justify-center mt-4 space-x-2 md:hidden">
            {listings.map((_, index) => (
              <div 
                key={index} 
                className={`w-4 h-4 rounded-full transition-colors duration-200 ${index === activeIndex ? 'bg-blue-500' : 'border border-gray-400'}`}
              ></div>
            ))}
          </div>
          <div className="text-center text-xs text-gray-500 mt-2">
          </div>
        </div>
      </div>
    </section>
  )
}

const ProductCard = ({ product }) => (
  <div className="border border-gray-300 rounded bg-white p-2 shadow-md transition-shadow flex-shrink-0 w-64 sm:w-auto snap-start">
    <Image
      src={product.image || "/placeholder.svg"}
      alt={product.title}
      width={300}
      height={200}
      className="mb-2 rounded relative object-cover w-full"
    />

    <div className="p-2">
      <p className="text-blue-600 font-bold text-lg">{product.price}</p>
      {product.tag && (
        <span className={`text-xs px-2 py-0.5 rounded ${product.tag === 'Low Price' ? 'bg-amber-400 text-black' : 'bg-green-100 text-green-700'}`}>
          {product.tag}
        </span>
      )}
      <h4 className="font-semibold text-gray-800 mt-1 text-sm">{product.title}</h4>
      <p className="text-gray-600 text-xs mt-1">{product.details}</p>
    </div>
  </div>
)

export default FeaturedListings 