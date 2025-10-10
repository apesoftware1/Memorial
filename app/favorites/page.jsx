import Link from "next/link"
import { FavoritesClientContent } from "./favorites-client.jsx"

export const metadata = {
  title: "Your Favorites | MemorialHub",
  description: "View and manage your favorite tombstones",
}

export default function FavoritesPage() {
  return <FavoritesClientContent />
}