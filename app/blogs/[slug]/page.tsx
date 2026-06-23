import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import BlogHeader from "../blog-header";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://tombstonesfinder.co.za";
const GRAPHQL_URL =
  process.env.NEXT_PUBLIC_STRAPI_GRAPHQL_URL ||
  `${process.env.STRAPI_API_URL || "https://api.tombstonesfinder.co.za"}/graphql`;

type BlogPost = {
  documentId?: string | null;
  slug?: string | null;
  title?: string | null;
  excerpt?: string | null;
  content?: string | null;
  coverImageUrl?: string | null;
  publishedAt?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
};

function toAbsoluteUrl(pathname: string) {
  return `${SITE_URL}${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
}

async function fetchGraphQL<TData>(query: string, variables?: Record<string, unknown>) {
  const res = await fetch(GRAPHQL_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: 3600 },
  });
  if (!res.ok) return null;
  const json = await res.json();
  if (json?.errors?.length) return null;
  return (json?.data as TData) ?? null;
}

async function fetchBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const data = await fetchGraphQL<{ blogPostBySlug?: BlogPost | null }>(
    `
      query BlogPostBySlug($slug: String!) {
        blogPostBySlug(slug: $slug) {
          documentId
          slug
          title
          excerpt
          content
          coverImageUrl
          publishedAt
          seoTitle
          seoDescription
          metaTitle
          metaDescription
        }
      }
    `,
    { slug }
  );
  return data?.blogPostBySlug ?? null;
}

function formatDate(value?: string | null) {
  if (!value) return null;
  const t = Date.parse(value);
  if (!Number.isFinite(t)) return null;
  return new Date(t).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const slug = (await params)?.slug;
  if (!slug) return {};
  const post = await fetchBlogPostBySlug(slug);
  if (!post) return {};

  const title = post.metaTitle || post.seoTitle || post.title || "Blog";
  const description = post.metaDescription || post.seoDescription || post.excerpt || "";
  const canonical = toAbsoluteUrl(`/blogs/${slug}`);

  return {
    title,
    description,
    alternates: { canonical },
  };
}

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const slug = (await params)?.slug;
  if (!slug) notFound();

  const post = await fetchBlogPostBySlug(slug);
  if (!post) notFound();

  const title = typeof post.title === "string" ? post.title : "Blog";
  const semanticTitle =
    typeof post.title === "string" && post.title.trim() ? post.title : "Blog Article";
  const excerpt = typeof post.excerpt === "string" ? post.excerpt : "";
  const content = typeof post.content === "string" ? post.content : "";
  const cover =
    typeof post.coverImageUrl === "string" && post.coverImageUrl.trim() ? post.coverImageUrl.trim() : null;
  const dateLabel = formatDate(post.publishedAt);

  return (
    <>
      <h1 className="sr-only">{semanticTitle}</h1>
      <BlogHeader />
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10">
        <Link href="/blogs" className="inline-flex items-center text-sm text-gray-600 hover:text-amber-600">
          <span className="mr-2">←</span> Back to Blogs
        </Link>

        <article className="mt-6">
          {cover ? (
            <div className="relative aspect-[16/9] mb-8 overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
              <Image src={cover} alt={title} fill className="object-cover" priority sizes="(max-width: 768px) 100vw, 768px" />
            </div>
          ) : null}

          <h1 className="text-3xl font-bold text-gray-900 mb-3">{title}</h1>
          {dateLabel ? <p className="text-gray-500 mb-4">{dateLabel}</p> : null}
          {excerpt ? <p className="text-gray-700 mb-8">{excerpt}</p> : null}

          <div className="prose prose-amber max-w-none">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        </article>
      </div>
    </>
  );
}
