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
          <Card key={product.id} className="overflow-hidden">
            <div className="relative h-48 w-full">
              <Image src={product.image || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
            </div>
            <CardHeader>
              <CardTitle>{product.name}</CardTitle>
              <CardDescription>{product.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold">{product.price}</p>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Details</Button>
              <Button>Contact</Button>
            </CardFooter>
          </Card>
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