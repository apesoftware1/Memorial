import { notFound } from "next/navigation";
import Link from "next/link";
import FaqsLayout from "../faqs-layout-client";

export const revalidate = 300;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://tombstonesfinder.co.za";
const FAQS_LIVE_ENDPOINT = "https://api.tombstonesfinder.co.za/api/faqs-live/render";

function toAbsoluteUrl(pathname) {
  return `${SITE_URL}${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
}

function stripHtml(htmlish) {
  if (typeof htmlish !== "string") return "";
  return htmlish
    .replace(/<head[\s\S]*?<\/head>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/(h[1-6]|li|div|section|article)>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\u00a0/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function extractFirstHeadingText(html) {
  if (typeof html !== "string") return "";
  const h = html.match(/<h[1-2][^>]*>([\s\S]*?)<\/h[1-2]>/i);
  return h ? stripHtml(h[1]) : "";
}

function stripBackToFaqsLink(html) {
  if (typeof html !== "string") return html;
  const arrowChars = "(?:←|←|&larr;|&#8592;)?";
  const spaces = "\\s*";
  const labelPattern = `${spaces}${arrowChars}${spaces}Back\\s+to\\s+all\\s+FAQs${spaces}`;
  const pattern = new RegExp(
    `<a\\b[^>]*href=["'][^"']*\\/faqs[^"']*["'][^>]*>\\s*${labelPattern}\\s*<\\/a>`,
    "gi"
  );
  let next = html.replace(pattern, "");
  next = next.replace(/<div[^>]*>\s*(?:<p[^>]*>\s*<\/p>|<br\s*\/?>|)\s*<\/div>/gi, "");
  next = next.replace(/(<br\s*\/?>\s*){2,}/gi, "<br />");
  next = next.replace(/(\s*\n){3,}/g, "\n\n");
  return next;
}

function isLikelyJson(text) {
  if (typeof text !== "string") return false;
  const t = text.trim();
  return t.startsWith("{") || t.startsWith("[");
}

function readMetaField(obj, keys, fallback = "") {
  if (!obj || typeof obj !== "object") return fallback;
  for (const k of keys) {
    const segments = String(k).split(".");
    let cursor = obj;
    let ok = true;
    for (const seg of segments) {
      if (cursor == null || typeof cursor !== "object") {
        ok = false;
        break;
      }
      cursor = cursor[seg];
    }
    if (ok && typeof cursor === "string" && cursor.trim()) {
      return cursor.trim();
    }
    if (ok && cursor != null && typeof cursor !== "object") {
      return String(cursor).trim();
    }
  }
  return fallback;
}

function normalizeRenderPayload(rawText, contentType, slug) {
  if (typeof rawText !== "string" || !rawText.trim()) {
    return { ok: false, empty: true };
  }

  const looksJson = isLikelyJson(rawText);
  const ct = typeof contentType === "string" ? contentType.toLowerCase() : "";
  let treatAsJson = looksJson && !ct.includes("text/html");

  let html = "";
  let css = "";
  let meta = {
    slug,
    canonicalSlug: slug,
    question: "",
    title: "",
    description: "",
    publishedAt: null,
    updatedAt: null,
    answerPlainText: "",
  };

  if (treatAsJson) {
    let payload;
    try {
      payload = JSON.parse(rawText);
    } catch {
      treatAsJson = false;
    }
    if (treatAsJson && payload && typeof payload === "object") {
      const data = payload.data && typeof payload.data === "object" ? payload.data : payload;

      html =
        typeof data.html === "string"
          ? data.html
          : typeof data.renderedHtml === "string"
            ? data.renderedHtml
            : typeof data.body === "string"
              ? data.body
              : typeof data.content === "string"
                ? data.content
                : typeof data.rendered === "string"
                  ? data.rendered
                  : "";

      css =
        typeof data.css === "string"
          ? data.css
          : typeof data.styles === "string"
            ? data.styles
            : typeof data.inlineCss === "string"
              ? data.inlineCss
              : "";

      meta.slug = readMetaField(data, ["slug", "meta.slug"], slug) || slug;
      meta.canonicalSlug = readMetaField(data, ["canonicalSlug", "meta.canonicalSlug", "slug", "meta.slug"], slug) || slug;
      meta.question = readMetaField(data, ["question", "titleQuestion", "heading", "meta.question", "meta.heading"]);
      meta.title = readMetaField(data, ["title", "metaTitle", "seoTitle", "meta.title", "meta.seoTitle"]);
      meta.description = readMetaField(data, ["description", "metaDescription", "seoDescription", "summary", "excerpt", "meta.description", "meta.seoDescription"]);
      meta.publishedAt = readMetaField(data, ["publishedAt", "meta.publishedAt"], null) || null;
      meta.updatedAt = readMetaField(data, ["updatedAt", "meta.updatedAt", "modifiedAt"], null) || null;
      meta.answerPlainText = readMetaField(data, ["answerPlainText", "answerText", "plainText", "plainBody"]);

      if (!html && typeof data.page === "string") html = data.page;
      if (!html && typeof payload.html === "string") html = payload.html;
      if (!css && typeof payload.css === "string") css = payload.css;
    }
  }

  if (!html) {
    html = rawText;
    const styleMatches = rawText.match(/<style[^>]*>([\s\S]*?)<\/style>/gi);
    if (styleMatches && styleMatches.length > 0) {
      css = styleMatches
        .map((block) => block.replace(/^<style[^>]*>/i, "").replace(/<\/style>$/i, ""))
        .join("\n");
      html = html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");
    }
  }

  if (!meta.question) {
    meta.question = extractFirstHeadingText(html);
  }
  if (!meta.title) {
    meta.title = meta.question ? `${meta.question} | FAQ | TombstoneFinder` : `FAQ | TombstoneFinder`;
  }
  if (!meta.description) {
    const plain = meta.answerPlainText || stripHtml(html);
    meta.description = plain ? plain.slice(0, 180) : "Frequently asked question about tombstones in South Africa.";
  }
  if (!meta.answerPlainText) {
    meta.answerPlainText = stripHtml(html).slice(0, 4000);
  }

  const strippedHtml = html.replace(/\s+/g, " ").trim();
  if (!strippedHtml || strippedHtml.length < 20) {
    return { ok: false, empty: true };
  }

  return { ok: true, html, css, meta };
}

async function fetchLiveFaqRender(rawSlug) {
  const slug = typeof rawSlug === "string" ? rawSlug : "";
  if (!slug) return { ok: false, empty: true };

  try {
    const url = new URL(FAQS_LIVE_ENDPOINT);
    url.searchParams.set("slug", slug);

    const res = await fetch(url.toString(), {
      next: { revalidate: 300 },
      headers: { Accept: "text/html, application/json;q=0.9, */*;q=0.8" },
    });

    if (res.status === 404 || res.status === 410) {
      return { ok: false, notFound: true, status: res.status };
    }
    if (!res.ok) {
      console.warn(`FAQ live render ${slug}: upstream HTTP ${res.status}`);
      return { ok: false, status: res.status, error: "upstream" };
    }

    const contentType = res.headers.get("content-type") || "";
    const text = await res.text();
    const normalized = normalizeRenderPayload(text, contentType, slug);

    if (!normalized.ok) {
      if (normalized.empty) return { ok: false, empty: true };
      return { ok: false, status: res.status, error: "parse" };
    }

    return normalized;
  } catch (e) {
    console.warn(`FAQ live render ${slug}: network/parse error`, e);
    return { ok: false, error: "network" };
  }
}

function FaqStructuredData({ render, canonical }) {
  try {
    const question = (render?.meta?.question || "").trim();
    const answer = (render?.meta?.answerPlainText || stripHtml(render?.html || "")).trim();
    if (!question || !answer) return null;

    const structured = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: question,
          acceptedAnswer: {
            "@type": "Answer",
            text: answer.slice(0, 8000),
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

  if (!slug) {
    return {
      title: "FAQ Not Found | TombstoneFinder",
      description: "This FAQ could not be found.",
      alternates: { canonical },
      robots: { index: false, follow: false },
    };
  }

  const render = await fetchLiveFaqRender(slug);
  if (!render.ok) {
    return {
      title: "FAQ Not Found | TombstoneFinder",
      description: "This FAQ could not be found.",
      alternates: { canonical },
      robots: { index: false, follow: false },
    };
  }

  const cleanedHtml = stripBackToFaqsLink(render.html || "");
  const canonicalSlug = render.meta?.canonicalSlug || slug;
  const canonicalMeta = toAbsoluteUrl(`/faqs/${encodeURIComponent(canonicalSlug)}`);
  const metaDescription =
    render.meta?.description ||
    (cleanedHtml ? stripHtml(cleanedHtml).slice(0, 180).trim() : "") ||
    fallback.description;
  const title =
    render.meta?.title ||
    (render.meta?.question ? `${render.meta.question} | FAQ | TombstoneFinder` : null) ||
    (cleanedHtml
      ? extractFirstHeadingText(cleanedHtml)
        ? `${extractFirstHeadingText(cleanedHtml)} | FAQ | TombstoneFinder`
        : null
      : null) ||
    fallback.title;

  return {
    title,
    description: metaDescription,
    alternates: { canonical: canonicalMeta },
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description: metaDescription,
      url: canonicalMeta,
      type: "article",
    },
    twitter: {
      card: "summary",
      title,
      description: metaDescription,
    },
  };
}

export default async function FaqPage({ params }) {
  const rawSlug = (await params)?.slug;
  const slug = typeof rawSlug === "string" ? decodeURIComponent(rawSlug) : "";

  if (!slug) return notFound();

  const render = await fetchLiveFaqRender(slug);
  if (!render.ok) return notFound();

  const cleanedHtml = stripBackToFaqsLink(render.html || "");
  const cleanedRender = { ...render, html: cleanedHtml };
  const canonicalSlug = render.meta?.canonicalSlug || slug;
  const canonical = toAbsoluteUrl(`/faqs/${encodeURIComponent(canonicalSlug)}`);
  const heading = render.meta?.question || extractFirstHeadingText(cleanedHtml) || "Frequently Asked Question";

  return (
    <FaqsLayout>
      <main className="w-full max-w-4xl mx-auto px-4 py-10 md:py-16">
        <FaqStructuredData render={cleanedRender} canonical={canonical} />

        {render.css ? (
          <style data-faqs-live dangerouslySetInnerHTML={{ __html: render.css }} />
        ) : null}

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
              {heading}
            </h1>
            <div className="text-sm text-slate-500">
              {render.meta?.publishedAt ? (
                <time dateTime={render.meta.publishedAt}>
                  Published {new Date(render.meta.publishedAt).toLocaleDateString("en-ZA")}
                </time>
              ) : null}
              {render.meta?.updatedAt && render.meta.updatedAt !== render.meta?.publishedAt ? (
                <>
                  {" · "}
                  <time dateTime={render.meta.updatedAt}>
                    Updated {new Date(render.meta.updatedAt).toLocaleDateString("en-ZA")}
                  </time>
                </>
              ) : null}
            </div>
          </header>

          <section className="prose prose-slate max-w-none text-slate-800 faqs-live-payload">
            <div dangerouslySetInnerHTML={{ __html: cleanedRender.html }} />
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
    </FaqsLayout>
  );
}
