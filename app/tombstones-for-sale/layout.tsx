import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tombstones for Sale",
  description: "Browse tombstones for sale, compare prices, and contact local manufacturers.",
  alternates: {
    canonical: "/tombstones-for-sale",
  },
  openGraph: {
    title: "Tombstones for Sale",
    description: "Browse tombstones for sale, compare prices, and contact local manufacturers.",
    url: (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001") + "/tombstones-for-sale",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Tombstones for Sale",
    description: "Browse tombstones for sale, compare prices, and contact local manufacturers.",
  },
};

export default function TombstonesForSaleLayout({ children }: { children: React.ReactNode }) {
  return children;
}