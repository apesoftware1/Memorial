import Link from "next/link";

export const revalidate = 300;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://tombstonesfinder.co.za";

function toAbsoluteUrl(pathname) {
  return `${SITE_URL}${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
}

async function fetchFaqList() {
  try {
    const res = await fetch("https://api.tombstonesfinder.co.za/api/faqs-pages", {
      headers: { Accept: "application/json" },
      next: { revalidate: 300 },
    });

    if (!res.ok) return [];

    const json = await res.json();
    const items = Array.isArray(json) ? json : Array.isArray(json?.data) ? json.data : [];

    return items
      .map((item) => {
        const attrs = (item && typeof item === "object" && item.attributes) || item || {};
        const rawSlug =
          (typeof attrs?.slug === "string" && attrs.slug.trim()) ||
          (typeof item?.slug === "string" && item.slug.trim()) ||
          "";
        const rawTitle =
          (typeof attrs?.title === "string" && attrs.title.trim()) ||
          (typeof attrs?.question === "string" && attrs.question.trim()) ||
          (typeof attrs?.name === "string" && attrs.name.trim()) ||
          rawSlug;
        return { slug: rawSlug, title: rawTitle || rawSlug };
      })
      .filter((faq) => Boolean(faq.slug));
  } catch (error) {
    console.error("[faqs-index] Error fetching FAQ list:", error);
    return [];
  }
}

export async function generateMetadata() {
  const canonical = toAbsoluteUrl("/faqs");
  return {
    title: "Frequently Asked Questions | TombstoneFinder",
    description:
      "Answers to common questions about tombstones, installation, pricing, delivery, and verified manufacturers across South Africa.",
    alternates: { canonical },
    robots: { index: true, follow: true },
  };
}

export default async function FaqsIndexPage() {
  const faqs = await fetchFaqList();

  return (
    <main className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Frequently Asked Questions
        </h1>
        <p className="text-slate-600 mb-8">
          Answers to common questions about tombstone buying, installation, pricing, delivery,
          and working with verified manufacturers across South Africa.
        </p>

        {faqs.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center text-slate-500 border border-slate-200">
            No frequently asked questions are available right now. Please check back soon.
          </div>
        ) : (
          <div className="grid gap-4">
            {faqs.map((faq) => (
              <Link
                key={faq.slug}
                href={`/faqs/${encodeURIComponent(faq.slug)}`}
                className="block p-6 bg-white rounded-xl border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all"
              >
                <h2 className="text-lg font-semibold text-slate-900 hover:text-emerald-600">
                  {faq.title || faq.slug}
                </h2>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
