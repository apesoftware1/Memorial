import Image from 'next/image'
import Link from 'next/link'
// Removed the old import for ProductCard
// import { ProductCard } from '@/components/product-card'
import { useState, useRef, useEffect } from 'react'

const FeaturedManufacturer = ({ manufacturer, products }) => {
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
    <section className="py-4">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-center text-gray-600 mb-2">Featured Manufacturer</h3>
          <p className="text-center text-xs text-gray-500 mb-4">*Sponsored</p>

          <div className="border border-gray-300 rounded bg-white p-4 mb-4 hover:shadow-md transition-shadow">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0">
              <div>
                <h4 className="font-bold text-gray-800 text-xl mb-1">{manufacturer.name}</h4>
              </div>
              <div>
                <Image
                  src={manufacturer.logo || "/placeholder.svg?height=80&width=80"}
                  alt={`${manufacturer.name} Logo`}
                  width={80}
                  height={80}
                  className="rounded-full"
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

          <div 
            ref={scrollContainerRef}
            className="flex overflow-x-auto gap-4 sm:grid sm:grid-cols-2 md:grid-cols-3 scrollbar-hide snap-x snap-mandatory"
          >
            {products.map((product, index) => (
              <ProductCard key={index} product={product} />
            ))}
          </div>
          {/* Pagination Dots */}
          <div className="flex justify-center mt-4 space-x-2 md:hidden">
            {products.map((_, index) => (
              <div 
                key={index} 
                className={`w-5 h-5 rounded-full transition-colors duration-200 ${index === activeIndex ? 'bg-blue-500' : 'border border-gray-400'}`}
              ></div>
            ))}
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

export default FeaturedManufacturer