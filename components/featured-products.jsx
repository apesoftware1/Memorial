"use client"

import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function FeaturedProducts() {
  const products = [
    {
      id: "c14",
      name: "CATHEDRAL C14",
      price: "R 8 820",
      image: "/placeholder.svg?height=200&width=300",
      description: "Black and brown granite tombstone with elegant design",
      material: "Granite",
      location: "Durban North, KZN",
    },
    {
      id: "m22",
      name: "MEMORIAL M22",
      price: "R 12 500",
      image: "/placeholder.svg?height=200&width=300",
      description: "Premium black granite with gold lettering",
      material: "Granite",
      location: "Durban North, KZN",
    },
    {
      id: "t08",
      name: "TRIBUTE T08",
      price: "R 9 750",
      image: "/placeholder.svg?height=200&width=300",
      description: "Modern design with customizable engraving options",
      material: "Marble",
      location: "Durban North, KZN",
    },
  ]

  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Featured Products</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <Card key={product.id} className="overflow-hidden border border-gray-200">
            <div className="relative h-48 w-full border-b border-gray-200">
              <Image src={product.image || "/placeholder.svg"} alt={product.name} fill className="object-contain" />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-bold text-gray-800">{product.name}</CardTitle>
              <CardDescription className="text-sm text-gray-600">{product.description}</CardDescription>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="flex justify-between items-center">
                <p className="text-xl font-bold text-blue-600">{product.price}</p>
                <span className="text-sm text-gray-600">{product.material}</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">{product.location}</p>
            </CardContent>
            <CardFooter className="flex justify-between pt-2 border-t border-gray-200">
              <Button variant="outline" className="text-sm hover:text-blue-500">
                View Details
              </Button>
              <Button className="bg-red-600 hover:bg-red-700 text-white text-sm">
                Contact
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="text-center mt-8">
        <Button variant="outline" size="lg" className="text-sm hover:text-blue-500">
          View All Products
        </Button>
      </div>
    </section>
  )
} 