// "use client"

// import Image from "next/image"
// import Link from "next/link"
// import { FavoriteButton } from "./favorite-button"
// import type { FavoriteProduct } from "@/context/favorites-context.jsx"

// type ProductCardProps = {
//   product: FavoriteProduct
//   href?: string
// }

// export function ProductCard({ product, href = "#" }: ProductCardProps) {
//   // Ensure product has an id
//   const productWithId = {
//     ...product,
//     id: product.id || product.title.replace(/\s+/g, "-").toLowerCase(),
//   }

//   return (
//     <div className="bg-white border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
//       <Link href={href} className="block">
//         {/* Image Container */}
//         <div className="relative h-56 bg-gray-100">
//           <Image 
//             src={product.image || "/placeholder.svg"} 
//             alt={product.title} 
//             fill 
//             className="object-cover" 
//           />
//           <div className="absolute top-2 right-2">
//             <FavoriteButton product={productWithId} />
//           </div>
//         </div>
        
//         {/* Content */}
//         <div className="p-4">
//           {/* Price and Tag Row */}
//           <div className="flex justify-between items-center mb-3">
//             <p className="font-bold text-blue-600 text-lg">{product.price}</p>
//             <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded">
//               {product.tag || "Great Price"}
//             </span>
//           </div>
          
//           {/* Product Title */}
//           <h4 className="font-bold text-gray-800 mb-2 text-sm uppercase">
//             {product.title}
//           </h4>
          
//           {/* Product Details */}
//           <p className="text-xs text-gray-600">
//             {product.details}
//           </p>
          
//           {/* Colors (if available) */}
//           {product.colour && Object.keys(product.colour).some(key => product.colour?.[key]) && (
//             <p className="text-xs text-gray-600 mt-1">
//               Colors: {Object.keys(product.colour)
//                 .filter(key => product.colour?.[key])
//                 .map(color => color.charAt(0).toUpperCase() + color.slice(1))
//                 .join(', ')}
//             </p>
//           )}
//         </div>
//       </Link>
//     </div>
//   )
// }
