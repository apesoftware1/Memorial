import Image from "next/image"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function FeaturedProducts() {
  const products = [
    {
      id: "c14",
      name: "CATHEDRAL C14",
      price: "R 8,820",
      image: "/placeholder.svg?height=200&width=300",
      description: "Black and brown granite tombstone with elegant design",
    },
    {
      id: "m22",
      name: "MEMORIAL M22",
      price: "R 12,500",
      image: "/placeholder.svg?height=200&width=300",
      description: "Premium black granite with gold lettering",
    },
    {
      id: "t08",
      name: "TRIBUTE T08",
      price: "R 9,750",
      image: "/placeholder.svg?height=200&width=300",
      description: "Modern design with customizable engraving options",
    },
  ]

  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-bold">Featured Products</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div key={product.id} className="bg-white border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            {/* Image Container */}
            <div className="relative h-56 bg-gray-100">
              <Image src={product.image || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
            </div>
            
            {/* Content */}
            <div className="p-4">
              {/* Product Title */}
              <h4 className="font-bold text-gray-800 mb-2 text-sm uppercase">
                {product.name}
              </h4>
              
              {/* Product Description */}
              <p className="text-xs text-gray-600 mb-3">
                {product.description}
              </p>
              
              {/* Price */}
              <p className="font-bold text-blue-600 text-lg mb-4">
                {product.price}
              </p>
              
              {/* Action Buttons */}
              <div className="flex justify-between">
                <Button variant="outline" className="text-sm">
                  Details
                </Button>
                <Button className="text-sm">
                  Contact
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center mt-8">
        <Button variant="outline" size="lg">
          View All Products
        </Button>
      </div>
    </section>
  )
} 