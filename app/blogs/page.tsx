import type { Metadata } from "next";
import BlogIndexClient from "./blog-index-client";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://tombstonesfinder.co.za";
const GRAPHQL_URL =
  process.env.NEXT_PUBLIC_STRAPI_GRAPHQL_URL ||
  `${process.env.STRAPI_API_URL || "https://api.tombstonesfinder.co.za"}/graphql`;

type BlogIndexSeo = {
  seoTitle?: string | null;
  seoDescription?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
};

type BlogIndexPost = {
  documentId?: string | null;
  slug?: string | null;
  title?: string | null;
  excerpt?: string | null;
  coverImageUrl?: string | null;
  publishedAt?: string | null;
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

async function fetchBlogIndexSeo(): Promise<BlogIndexSeo | null> {
  const data = await fetchGraphQL<{ blogIndexSeo?: BlogIndexSeo | null }>(`
    query BlogIndexSeo {
      blogIndexSeo {
        seoTitle
        seoDescription
        metaTitle
        metaDescription
      }
    }
  `);
  return data?.blogIndexSeo ?? null;
}

async function fetchBlogPosts(): Promise<BlogIndexPost[]> {
  const data = await fetchGraphQL<{ blogPosts?: BlogIndexPost[] }>(`
    query BlogPostsIndex {
      blogPosts(sort: "publishedAt:desc") {
        documentId
        slug
        title
        excerpt
        coverImageUrl
        publishedAt
      }
    }
  `);
  return Array.isArray(data?.blogPosts) ? data!.blogPosts! : [];
}

export async function generateMetadata(): Promise<Metadata> {
  const seo = await fetchBlogIndexSeo();
  const title = seo?.metaTitle || seo?.seoTitle || "Blogs";
  const description =
    seo?.metaDescription ||
    seo?.seoDescription ||
    "Insights, guides and articles to help you choose the right tombstone.";
  const canonical = toAbsoluteUrl("/blogs");

  return {
    title,
    description,
    alternates: { canonical },
  };
}

export default async function BlogsPage() {
  const posts = await fetchBlogPosts();
  return <BlogIndexClient posts={posts} />;
}

