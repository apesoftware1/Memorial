import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tombstone Manufacturers in South Africa | Compare Suppliers",
  description: "Compare verified tombstone manufacturers across South Africa. View branches, products, ratings and contact details.",
  alternates: { canonical: "/manufacturers" },
  openGraph: {
    title: "Tombstone Manufacturers in South Africa | Compare Suppliers",
    description: "Compare verified tombstone manufacturers across South Africa. View branches, products, ratings and contact details.",
    url: (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001") + "/manufacturers",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Tombstone Manufacturers in South Africa | Compare Suppliers",
    description: "Compare verified tombstone manufacturers across South Africa. View branches, products, ratings and contact details.",
  },
};

export default function ManufacturersLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      {children}
    </div>
  );
}
