// "use client"

// import Image from "next/image"
// import Link from "next/link"
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

// export default function FeaturedProducts() {
//   const products = [
//     {
//       id: "c14",
//       name: "CATHEDRAL C14",
//       price: "R 8 820",
//       image: "/placeholder.svg?height=200&width=300",
//       description: "Black and brown granite tombstone with elegant design",
//       material: "Granite",
//       location: "Durban North, KZN",
//     },
//     {
//       id: "m22",
//       name: "MEMORIAL M22",
//       price: "R 12 500",
//       image: "/placeholder.svg?height=200&width=300",
//       description: "Premium black granite with gold lettering",
//       material: "Granite",
//       location: "Durban North, KZN",
//     },
//     {
//       id: "t08",
//       name: "TRIBUTE T08",
//       price: "R 9 750",
//       image: "/placeholder.svg?height=200&width=300",
//       description: "Modern design with customizable engraving options",
//       material: "Marble",
//       location: "Durban North, KZN",
//     },
//   ]

//   return (
//     <section className="space-y-6">
//       <h2 className="text-2xl font-bold text-gray-800">Featured Products</h2>

//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         {products.map((product) => (
//           <div key={product.id} className="bg-white border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
//             {/* Image Container */}
//             <div className="relative h-56 bg-gray-100">
//               <Image src={product.image || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
//             </div>
            
//             {/* Content */}
//             <div className="p-4">
//               {/* Price and Material Row */}
//               <div className="flex justify-between items-center mb-3">
//                 <p className="font-bold text-blue-600 text-lg">{product.price}</p>
//                 <span className="text-sm text-gray-600">{product.material}</span>
//               </div>
              
//               {/* Product Title */}
//               <h4 className="font-bold text-gray-800 mb-2 text-sm uppercase">
//                 {product.name}
//               </h4>
              
//               {/* Product Description */}
//               <p className="text-xs text-gray-600 mb-2">
//                 {product.description}
//               </p>
              
//               {/* Location */}
//               <p className="text-xs text-gray-600">
//                 {product.location}
//               </p>
              
//               {/* Action Buttons */}
//               <div className="flex justify-between mt-4 pt-3 border-t border-gray-100">
//                 <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground text-sm hover:text-blue-500">
//                   View Details
//                 </button>
//                 <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-red-600 hover:bg-red-700 text-white text-sm">
//                   Contact
//                 </button>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>

//       <div className="text-center mt-8">
//         <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-11 rounded-md px-8 text-sm hover:text-blue-500">
//           View All Products
//         </button>
//       </div>
//     </section>
//   )
// } 
