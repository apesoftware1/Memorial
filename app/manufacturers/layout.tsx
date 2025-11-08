import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tombstone Manufacturers",
  description: "Find and compare tombstone manufacturers across South Africa.",
  alternates: { canonical: "/manufacturers" },
  openGraph: {
    title: "Tombstone Manufacturers",
    description: "Find and compare tombstone manufacturers across South Africa.",
    url: (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001") + "/manufacturers",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Tombstone Manufacturers",
    description: "Find and compare tombstone manufacturers across South Africa.",
  },
};

export default function ManufacturersLayout({ children }: { children: React.ReactNode }) {
  return children;
}