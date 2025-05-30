import Image from 'next/image'
import Link from 'next/link'
import { ProductCard } from '@/components/product-card'

const FeaturedManufacturer = ({ manufacturer, products }) => {
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

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {products.map((product, index) => (
              <ProductCard key={index} product={product} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default FeaturedManufacturer 