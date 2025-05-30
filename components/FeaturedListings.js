import Image from 'next/image'
import Link from 'next/link'

const FeaturedListings = ({ listings }) => {
  return (
    <section className="py-4">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-center text-gray-600 border-b border-gray-300 pb-2 mb-4">FEATURED LISTINGS</h3>
          <p className="text-center text-xs text-gray-500 mb-4">*Sponsored</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {listings.map((product) => (
              <ProductCard key={product.id} product={product} />
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
  <div className="border border-gray-300 rounded bg-white p-4 hover:shadow-md transition-shadow">
    <Image
      src={product.image || "/placeholder.svg"}
      alt={product.title}
      width={300}
      height={200}
      className="mb-2 rounded"
    />
    <h4 className="font-semibold text-gray-800">{product.title}</h4>
    <p className="text-gray-600 text-sm">{product.details}</p>
    <p className="text-gray-900 font-bold">{product.price}</p>
    {product.tag && (
      <div className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full inline-block mt-2">
        {product.tag}
      </div>
    )}
  </div>
)

export default FeaturedListings 