import Link from "next/link";

export const revalidate = 60;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://tombstonesfinder.co.za";
const FAQS_LIVE_INDEX =
  process.env.FAQS_LIVE_API_URL ||
  "https://api.tombstonesfinder.co.za/api/faqs-live/index?base=/faqs";

function toAbsoluteUrl(pathname) {
  return `${SITE_URL}${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
}

function isLikelyJson(text) {
  if (typeof text !== "string") return false;
  const t = text.trim();
  return t.startsWith("{") || t.startsWith("[");
}

function readString(obj, keys, fallback = "") {
  if (!obj || typeof obj !== "object") return fallback;
  for (const k of keys) {
    const segs = String(k).split(".");
    let cur = obj;
    let ok = true;
    for (const seg of segs) {
      if (cur == null || typeof cur !== "object") {
        ok = false;
        break;
      }
      cur = cur[seg];
    }
    if (ok && typeof cur === "string" && cur.trim()) return cur.trim();
    if (ok && cur != null && typeof cur !== "object") return String(cur).trim();
  }
  return fallback;
}

function extractInlineStylesFromHtml(html) {
  if (typeof html !== "string") return { html, css: "" };
  const blocks = html.match(/<style[^>]*>([\s\S]*?)<\/style>/gi);
  if (!blocks || blocks.length === 0) return { html, css: "" };
  const css = blocks
    .map((b) => b.replace(/^<style[^>]*>/i, "").replace(/<\/style>$/i, ""))
    .join("\n");
  const stripped = html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");
  return { html: stripped, css };
}

function normalizeCategoryListPayload(rawText, contentType) {
  if (typeof rawText !== "string" || !rawText.trim()) {
    return { mode: "empty" };
  }
  const ct = typeof contentType === "string" ? contentType.toLowerCase() : "";
  const looksJson = isLikelyJson(rawText);
  const treatAsJson = looksJson && !ct.includes("text/html");

  if (treatAsJson) {
    let payload;
    try {
      payload = JSON.parse(rawText);
    } catch {
      // fall through to raw-HTML mode
    }
    if (payload != null && typeof payload === "object") {
      const data = payload.data && typeof payload.data === "object" ? payload.data : payload;

      const htmlField = readString(
        data,
        ["html", "renderedHtml", "body", "content", "rendered", "page"],
        ""
      );
      if (htmlField) {
        const cssField = readString(data, ["css", "styles", "inlineCss"], "");
        const trimmed = htmlField.replace(/\s+/g, " ").trim();
        if (trimmed.length >= 20) {
          const { html, css } = extractInlineStylesFromHtml(htmlField);
          return {
            mode: "html",
            html,
            css: cssField ? `${cssField}\n${css}` : css,
          };
        }
      }

      const arrayCandidates = [
        Array.isArray(data) ? data : null,
        Array.isArray(data.items) ? data.items : null,
        Array.isArray(data.categories) ? data.categories : null,
        Array.isArray(data.list) ? data.list : null,
        Array.isArray(data.faqs) ? data.faqs : null,
        Array.isArray(data.data) ? data.data : null,
        Array.isArray(payload.data) ? payload.data : null,
      ].filter(Boolean);

      for (const arr of arrayCandidates) {
        if (Array.isArray(arr) && arr.length > 0) {
          const mapped = arr
            .map((row) => {
              const attrs = (row && typeof row === "object" && row.attributes) || row || {};
              const slug =
                readString(attrs, ["slug"]) ||
                readString(row, ["slug"]) ||
                readString(attrs, ["canonicalSlug"]);
              const title =
                readString(attrs, ["title", "question", "heading", "name", "label"]) ||
                readString(row, ["title", "question", "heading", "name", "label"]) ||
                slug;
              return { slug, title };
            })
            .filter((r) => r.slug);
          if (mapped.length > 0) return { mode: "list", items: mapped };
        }
      }
    }
  }

  const { html, css } = extractInlineStylesFromHtml(rawText);
  const trimmed = html.replace(/\s+/g, " ").trim();
  if (trimmed.length >= 20) return { mode: "html", html, css };
  return { mode: "empty" };
}

async function getFaqCategories() {
  try {
    const baseUrl = new URL(FAQS_LIVE_INDEX);
    const siteId =
      typeof process.env.FAQS_LIVE_SITE_ID === "string"
        ? process.env.FAQS_LIVE_SITE_ID.trim()
        : "";
    if (siteId) baseUrl.searchParams.set("site", siteId);

    const finalUrl = baseUrl.toString();
    const res = await fetch(finalUrl, {
      headers: { Accept: "application/json, text/html;q=0.9, */*;q=0.8" },
      next: { revalidate: 60 },
    });

    if (res.status === 404 || res.status === 410) return null;
    if (!res.ok) {
      console.error(`[faqs-index] Upstream ${finalUrl} returned HTTP ${res.status}`);
      return null;
    }

    const contentType = res.headers.get("content-type") || "";
    const text = await res.text();
    return normalizeCategoryListPayload(text, contentType);
  } catch (err) {
    console.error("Failed to fetch FAQ categories:", err);
    return null;
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

export default async function FaqIndexPage() {
  const data = await getFaqCategories();
  const hasRenderedHtml = data && data.mode === "html" && data.html;
  const hasList = data && data.mode === "list" && Array.isArray(data.items) && data.items.length > 0;

  return (
    <main className="container mx-auto px-4 py-8">
      {hasRenderedHtml ? (
        <>
          {data.css ? (
            <style data-faqs-live-categories dangerouslySetInnerHTML={{ __html: data.css }} />
          ) : null}
          <div
            className="faqs-live-categories-payload"
            dangerouslySetInnerHTML={{ __html: data.html }}
          />
        </>
      ) : hasList ? (
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Frequently Asked Questions
          </h1>
          <p className="text-slate-600 mb-8">
            Answers to common questions about tombstone buying, installation, pricing, delivery,
            and working with verified manufacturers across South Africa.
          </p>
          <div className="grid gap-4">
            {data.items.map((faq) => (
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
        </div>
      ) : (
        <div className="text-center py-12 max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Frequently Asked Questions</h1>
          <p className="text-gray-600">Unable to load FAQ categories at this time.</p>
          <p className="mt-4 text-sm text-gray-500">
            Please check back in a few minutes, or browse the rest of the site in the meantime.
          </p>
        </div>
      )}
    </main>
  );
}
