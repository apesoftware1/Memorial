import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://tombstonesfinder.co.za";

export const metadata: Metadata = {
  title: "Tombstone Manufacturers in South Africa", // Optimized to prevent snippet clipping
  description: "Compare verified tombstone manufacturers across South Africa. Find direct wholesale pricing, active branches, and reviews.",
  alternates: { canonical: `${SITE_URL}/manufacturers` },
  openGraph: {
    title: "Tombstone Manufacturers in South Africa",
    description: "Compare verified tombstone manufacturers across South Africa. Find direct wholesale pricing, active branches, and reviews.",
    url: `${SITE_URL}/manufacturers`,
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Tombstone Manufacturers in South Africa",
    description: "Compare verified tombstone manufacturers across South Africa.",
  },
};

export default function ManufacturersLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      {children}
    </div>
  );
}