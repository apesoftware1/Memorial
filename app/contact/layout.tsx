import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact TombstoneFinder",
  description: "Get in touch for listings, support, or partnership inquiries.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact TombstoneFinder",
    description: "Get in touch for listings, support, or partnership inquiries.",
    url: (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001") + "/contact",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Contact TombstoneFinder",
    description: "Get in touch for listings, support, or partnership inquiries.",
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}