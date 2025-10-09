// "use client"

// import { useEffect, useState } from "react"
// import { Heart } from "lucide-react"
// import Link from "next/link"
// import { useFavorites } from "@/context/favorites-context"

// export function FavoritesCount() {
//   const { totalFavorites } = useFavorites()
//   const [count, setCount] = useState(0)

//   // Update count on client side only
//   useEffect(() => {
//     setCount(totalFavorites)
//   }, [totalFavorites])

//   if (count === 0) return null

//   return (
//     <Link href="/favorites" className="relative flex items-center justify-center">
//       <Heart className="h-6 w-6 text-amber-500" />
//       <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-white">
//         {count}
//       </span>
//     </Link>
//   )
// }
