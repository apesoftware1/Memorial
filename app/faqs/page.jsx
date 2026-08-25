import Link from "next/link";

export const revalidate = 300;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://tombstonesfinder.co.za";
const STRAPI_API_BASE =
  process.env.NEXT_PUBLIC_STRAPI_API_URL ||
  `${process.env.STRAPI_API_URL || "https://api.tombstonesfinder.co.za"}/api`;

function toAbsoluteUrl(pathname) {
  return `${SITE_URL}${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
}

function unwrapFaq(row) {
  const attrs = row?.attributes || row || {};
  return {
    id: row?.id ?? attrs?.id ?? null,
    documentId:
      (typeof row?.documentId === "string" && row.documentId.trim()) ||
      (typeof attrs?.documentId === "string" && attrs.documentId.trim()) ||
      null,
    slug:
      (typeof attrs?.slug === "string" && attrs.slug.trim()) ||
      (typeof row?.slug === "string" && row.slug.trim()) ||
      "",
    question:
      (typeof attrs?.question === "string" && attrs.question.trim()) ||
      (typeof row?.question === "string" && row.question.trim()) ||
      "",
    answer:
      attrs?.answer ?? row?.answer ?? "",
    publishedAt: attrs?.publishedAt || row?.publishedAt || null,
    updatedAt: attrs?.updatedAt || row?.updatedAt || null,
  };
}

async function fetchAllFaqs() {
  try {
    const url = new URL(`${STRAPI_API_BASE}/faqs`);
    url.searchParams.set("populate", "*");
    url.searchParams.set("pagination[page]", "1");
    url.searchParams.set("pagination[pageSize]", "500");
    url.searchParams.set("sort[0]", "publishedAt:desc");

    const res = await fetch(url.toString(), { next: { revalidate: 300 } });
    if (!res.ok) return [];
    const json = await res.json();
    const rows = Array.isArray(json?.data) ? json.data : [];
    return rows
      .map(unwrapFaq)
      .filter((f) => f.slug && f.publishedAt && f.question);
  } catch (e) {
    console.warn("FAQs index: failed to fetch", e);
    return [];
  }
}

export async function generateMetadata() {
  const canonical = toAbsoluteUrl("/faqs");
  return {
    title: "Frequently Asked Questions | TombstoneFinder",
    description:
      "Frequently asked questions about tombstones, installation, pricing, delivery, and manufacturers in South Africa.",
    alternates: { canonical },
    robots: { index: true, follow: true },
  };
}

export default async function FaqsPage() {
  const faqs = await fetchAllFaqs();

  return (
    <main className="w-full max-w-6xl mx-auto px-4 py-10 md:py-16">
      <header className="mb-10">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
          Frequently Asked Questions
        </h1>
        <p className="text-slate-600 max-w-2xl">
          Answers to common questions about tombstone buying, installation, pricing, delivery,
          and working with verified manufacturers across South Africa.
        </p>
      </header>

      <section aria-label="FAQ list">
        {faqs.length === 0 ? (
          <div className="p-10 rounded-2xl border border-slate-200 bg-slate-50 text-slate-600">
            No frequently asked questions are available right now. Please check back soon.
          </div>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2">
            {faqs.map((faq) => (
              <li key={faq.documentId || faq.slug}>
                <Link
                  href={`/faqs/${encodeURIComponent(faq.slug)}`}
                  className="group flex flex-col h-full p-6 rounded-2xl border border-slate-200 bg-white hover:border-slate-400 hover:shadow-md transition"
                >
                  <h2 className="text-lg font-semibold text-slate-900 group-hover:text-slate-700 leading-snug">
                    {faq.question}
                  </h2>
                  <div className="mt-3 text-sm text-slate-500">
                    {faq.updatedAt ? (
                      <time dateTime={faq.updatedAt}>
                        Updated {new Date(faq.updatedAt).toLocaleDateString("en-ZA")}
                      </time>
                    ) : null}
                  </div>
                  <span className="mt-4 inline-flex items-center text-sm font-medium text-slate-700 group-hover:text-slate-900">
                    Read answer
                    <svg
                      aria-hidden="true"
                      className="ml-1 w-4 h-4 transition-transform group-hover:translate-x-0.5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 12h14" />
                      <path d="m13 5 7 7-7 7" />
                    </svg>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
