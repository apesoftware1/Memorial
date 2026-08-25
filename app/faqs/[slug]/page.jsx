import { notFound } from "next/navigation";
import Link from "next/link";

export const revalidate = 300;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://tombstonesfinder.co.za";
const STRAPI_API_BASE =
  process.env.NEXT_PUBLIC_STRAPI_API_URL ||
  `${process.env.STRAPI_API_URL || "https://api.tombstonesfinder.co.za"}/api`;

function toAbsoluteUrl(pathname) {
  return `${SITE_URL}${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
}

function stripHtml(htmlish) {
  if (typeof htmlish !== "string") return "";
  return htmlish
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function answerToPlainText(answer) {
  if (answer == null) return "";
  if (typeof answer === "string") return stripHtml(answer);
  if (Array.isArray(answer)) {
    const parts = [];
    const walk = (node) => {
      if (!node) return;
      if (typeof node === "string") return parts.push(node);
      if (node?.text) parts.push(String(node.text));
      if (Array.isArray(node?.children)) node.children.forEach(walk);
    };
    answer.forEach(walk);
    return stripHtml(parts.join(" "));
  }
  if (typeof answer === "object") {
    try {
      return stripHtml(JSON.stringify(answer));
    } catch {
      return "";
    }
  }
  return "";
}

function answerToReact(answer) {
  if (answer == null) return null;
  if (typeof answer === "string") {
    if (/<[a-z][\s\S]*>/i.test(answer)) {
      return (
        <div
          className="prose prose-slate max-w-none"
          dangerouslySetInnerHTML={{ __html: answer }}
        />
      );
    }
    return (
      <div className="prose prose-slate max-w-none whitespace-pre-wrap leading-relaxed">
        {answer}
      </div>
    );
  }
  if (Array.isArray(answer)) {
    try {
      const html = JSON.stringify(answer);
      return (
        <div
          className="prose prose-slate max-w-none"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );
    } catch {
      return null;
    }
  }
  return null;
}

function unwrapFaq(row) {
  const attrs = row?.attributes || row || {};
  const slug =
    (typeof attrs?.slug === "string" && attrs.slug.trim()) ||
    (typeof row?.slug === "string" && row.slug.trim()) ||
    "";
  const question =
    (typeof attrs?.question === "string" && attrs.question.trim()) ||
    (typeof row?.question === "string" && row.question.trim()) ||
    "";
  const answer = attrs?.answer ?? row?.answer ?? "";
  const publishedAt = attrs?.publishedAt || row?.publishedAt || null;
  const updatedAt = attrs?.updatedAt || row?.updatedAt || null;
  return {
    id: row?.id ?? attrs?.id ?? null,
    documentId:
      (typeof row?.documentId === "string" && row.documentId.trim()) ||
      (typeof attrs?.documentId === "string" && attrs.documentId.trim()) ||
      null,
    slug,
    question,
    answer,
    publishedAt,
    updatedAt,
    metaTitle:
      (typeof attrs?.metaTitle === "string" && attrs.metaTitle.trim()) ||
      (typeof row?.metaTitle === "string" && row.metaTitle.trim()) ||
      "",
    metaDescription:
      (typeof attrs?.metaDescription === "string" && attrs.metaDescription.trim()) ||
      (typeof row?.metaDescription === "string" && row.metaDescription.trim()) ||
      "",
    seoTitle:
      (typeof attrs?.seoTitle === "string" && attrs.seoTitle.trim()) ||
      (typeof row?.seoTitle === "string" && row.seoTitle.trim()) ||
      "",
    seoDescription:
      (typeof attrs?.seoDescription === "string" && attrs.seoDescription.trim()) ||
      (typeof row?.seoDescription === "string" && row.seoDescription.trim()) ||
      "",
  };
}

async function fetchFaqBySlug(slug) {
  if (!slug) return null;
  try {
    const url = new URL(`${STRAPI_API_BASE}/faqs`);
    url.searchParams.set("populate", "*");
    url.searchParams.set("pagination[page]", "1");
    url.searchParams.set("pagination[pageSize]", "1");
    url.searchParams.set("filters[slug][$eq]", slug);

    const res = await fetch(url.toString(), { next: { revalidate: 300 } });
    if (!res.ok) return null;
    const json = await res.json();
    const rows = Array.isArray(json?.data) ? json.data : [];
    if (rows.length === 0) return null;
    return unwrapFaq(rows[0]);
  } catch (e) {
    console.warn(`FAQ single: failed to fetch slug=${slug}`, e);
    return null;
  }
}

function isPublished(faq) {
  return !!(faq && faq.slug && faq.question && faq.publishedAt);
}

export async function generateMetadata({ params }) {
  const rawSlug = (await params)?.slug;
  const slug = typeof rawSlug === "string" ? decodeURIComponent(rawSlug) : "";
  const canonical = slug ? toAbsoluteUrl(`/faqs/${encodeURIComponent(slug)}`) : toAbsoluteUrl("/faqs");

  const fallback = {
    title: "FAQ | TombstoneFinder",
    description: "Frequently asked question.",
    alternates: { canonical },
    robots: { index: true, follow: true },
  };

  if (!slug) return fallback;

  const faq = await fetchFaqBySlug(slug);
  if (!isPublished(faq)) {
    return {
      title: "FAQ Not Found | TombstoneFinder",
      description: "This FAQ could not be found.",
      alternates: { canonical },
      robots: { index: false, follow: false },
    };
  }

  const plainAnswer = answerToPlainText(faq.answer).slice(0, 180);
  const title = faq.metaTitle || faq.seoTitle || `${faq.question} | FAQ | TombstoneFinder`;
  const description =
    faq.metaDescription ||
    faq.seoDescription ||
    (plainAnswer ? plainAnswer : "Read the answer to this frequently asked question.");

  return {
    title,
    description,
    alternates: { canonical },
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "article",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

function FaqStructuredData({ faq, canonical }) {
  try {
    const questionText = typeof faq?.question === "string" ? faq.question.trim() : "";
    const answerText = answerToPlainText(faq?.answer);
    if (!questionText || !answerText) return null;

    const structured = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: questionText,
          acceptedAnswer: {
            "@type": "Answer",
            text: answerText,
            url: canonical || undefined,
          },
        },
      ],
    };

    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structured) }}
      />
    );
  } catch {
    return null;
  }
}

export default async function FaqPage({ params }) {
  const rawSlug = (await params)?.slug;
  const slug = typeof rawSlug === "string" ? decodeURIComponent(rawSlug) : "";

  if (!slug) return notFound();

  const faq = await fetchFaqBySlug(slug);
  if (!isPublished(faq)) return notFound();

  const canonical = toAbsoluteUrl(`/faqs/${encodeURIComponent(faq.slug)}`);

  return (
    <main className="w-full max-w-4xl mx-auto px-4 py-10 md:py-16">
      <FaqStructuredData faq={faq} canonical={canonical} />

      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-slate-500">
        <Link href="/faqs" className="hover:text-slate-800">
          All FAQs
        </Link>
        <span aria-hidden="true" className="mx-2">
          /
        </span>
        <span className="text-slate-700">Question</span>
      </nav>

      <article>
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight mb-4">
            {faq.question}
          </h1>
          <div className="text-sm text-slate-500">
            {faq.publishedAt ? (
              <time dateTime={faq.publishedAt}>
                Published {new Date(faq.publishedAt).toLocaleDateString("en-ZA")}
              </time>
            ) : null}
            {faq.updatedAt && faq.updatedAt !== faq.publishedAt ? (
              <>
                {" · "}
                <time dateTime={faq.updatedAt}>
                  Updated {new Date(faq.updatedAt).toLocaleDateString("en-ZA")}
                </time>
              </>
            ) : null}
          </div>
        </header>

        <section className="prose prose-slate max-w-none text-slate-800">
          {answerToReact(faq.answer) || (
            <p className="text-slate-500 italic">No answer content available yet.</p>
          )}
        </section>

        <footer className="mt-12 pt-8 border-t border-slate-200">
          <Link
            href="/faqs"
            className="inline-flex items-center text-sm font-medium text-slate-700 hover:text-slate-900"
          >
            <svg
              aria-hidden="true"
              className="mr-1.5 w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5" />
              <path d="m12 19-7-7 7-7" />
            </svg>
            Back to all FAQs
          </Link>
        </footer>
      </article>
    </main>
  );
}
