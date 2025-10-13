// "use client";
// import { useState, useEffect } from "react";

// export function useFavorites() {
//   const [favorites, setFavorites] = useState([]);

//   useEffect(() => {
//     const stored = localStorage.getItem("favorites");
//     if (stored) {
//       setFavorites(JSON.parse(stored));
//     }
//   }, []);

//   useEffect(() => {
//     localStorage.setItem("favorites", JSON.stringify(favorites));
//   }, [favorites]);

//   const addFavorite = (listing) => {
//     setFavorites((prev) => {
//       const exists = prev.some((item) => item.documentId === listing.documentId);
//       if (!exists) {
//         return [...prev, listing];
//       }
//       return prev;
//     });
//   };

//   const removeFavorite = (documentId) => {
//     setFavorites((prev) => prev.filter((item) => item.documentId !== documentId));
//   };

//   const isFavorite = (documentId) => {
//     return favorites.some((item) => item.documentId === documentId);
//   };

//   return { favorites, addFavorite, removeFavorite, isFavorite };
// }