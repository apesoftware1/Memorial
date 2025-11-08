import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001";
  const url = `${base}/tombstones-on-special/${params.id}`;
  const title = "Tombstone Special Offer";
  const description = "View details of this special tombstone offer and contact the manufacturer.";
  return {
    title,
    description,
    alternates: { canonical: `/tombstones-on-special/${params.id}` },
    openGraph: { title, description, url, type: "article" },
    twitter: { card: "summary", title, description },
  };
}

export default function SpecialLayout({ children }: { children: React.ReactNode }) {
  return children;
}