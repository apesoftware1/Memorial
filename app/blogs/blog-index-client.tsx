"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";

type BlogIndexPost = {
  documentId?: string | null;
  slug?: string | null;
  title?: string | null;
  excerpt?: string | null;
  coverImageUrl?: string | null;
  publishedAt?: string | null;
};

const fallbackPosts: BlogIndexPost[] = [
  {
    slug: "how-to-choose-the-right-tombstone-in-south-africa",
    title: "How to Choose the Right Tombstone in South Africa",
    excerpt:
      "Selecting a tombstone is a moment rich in meaning. Here's how to make the best choice for a lasting memorial.",
    coverImageUrl: "/2560(w)x400px(h)_Banner_OldYoungCouple.jpg",
    publishedAt: "2024-08-09",
  },
];

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

function BlogCard({ post }: { post: BlogIndexPost }) {
  const slug = typeof post.slug === "string" ? post.slug.trim() : "";
  const href = slug ? `/blogs/${slug}` : "/blogs";
  const title = typeof post.title === "string" ? post.title : "Blog post";
  const excerpt = typeof post.excerpt === "string" ? post.excerpt : "";
  const imageSrc =
    (typeof post.coverImageUrl === "string" && post.coverImageUrl.trim()) || "/placeholder.svg";
  const dateLabel = formatDate(post.publishedAt);

  return (
    <div className="group block overflow-hidden rounded-lg border border-gray-200 hover:shadow-md transition-shadow bg-white">
      <Link href={href}>
        <div className="aspect-[16/9] relative">
          <Image
            src={imageSrc}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        </div>
      </Link>
      <div className="p-4">
        <Link href={href}>
          <h3 className="text-sm font-semibold text-gray-900 group-hover:text-amber-600 line-clamp-2">
            {title}
          </h3>
        </Link>
        {dateLabel ? (
          <p className="mt-1 text-xs text-gray-500 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3 w-3 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {dateLabel}
          </p>
        ) : null}
        {excerpt ? <p className="mt-2 text-sm text-gray-600 line-clamp-2">{excerpt}</p> : null}
        <div className="mt-3">
          <Link
            href={href}
            className="inline-flex items-center text-xs font-medium text-amber-600 hover:text-amber-700"
          >
            Read More
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-3 w-3 ml-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function BlogIndexClient({ posts }: { posts: BlogIndexPost[] }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileDropdown, setMobileDropdown] = useState<string | null>(null);
  const [showAllBlogs, setShowAllBlogs] = useState(false);

  const handleMobileMenuToggle = () => setMobileMenuOpen(!mobileMenuOpen);
  const handleMobileDropdownToggle = (dropdown: string) => {
    setMobileDropdown(mobileDropdown === dropdown ? null : dropdown);
  };

  const safePosts = Array.isArray(posts) && posts.length > 0 ? posts : fallbackPosts;
  const featured = safePosts[0];
  const sidebar = safePosts.slice(1, 5);
  const grid = safePosts.slice(1);

  const featuredSlug = typeof featured?.slug === "string" ? featured.slug.trim() : "";
  const featuredHref = featuredSlug ? `/blogs/${featuredSlug}` : "/blogs";
  const featuredTitle = typeof featured?.title === "string" ? featured.title : "Blog post";
  const featuredExcerpt = typeof featured?.excerpt === "string" ? featured.excerpt : "";
  const featuredImage =
    (typeof featured?.coverImageUrl === "string" && featured.coverImageUrl.trim()) ||
    "/2560(w)x400px(h)_Banner_OldYoungCouple.jpg";
  const featuredDate = formatDate(featured?.publishedAt);

  return (
    <>
      <Header
        mobileMenuOpen={mobileMenuOpen}
        handleMobileMenuToggle={handleMobileMenuToggle}
        mobileDropdown={mobileDropdown}
        handleMobileDropdownToggle={handleMobileDropdownToggle}
        onMobileFilterClick={undefined}
      />

      <div
        className="h-64 bg-cover bg-center bg-no-repeat relative"
        style={{ backgroundImage: "url('/2560(w)x400px(h)_Banner_OldYoungCouple.jpg')" }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="relative z-10 flex items-center justify-center h-full">
          <div className="text-center text-white">
            <h1 className="text-5xl font-bold mb-4">Insights Guides and Blogs</h1>
            <p className="text-xl max-w-2xl mx-auto">
              Helpful guides on choosing tombstones, understanding costs, and creating a meaningful memorial.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 max-w-4xl py-6 sm:py-8">
          <section className="grid lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
            {featured ? (
              <Link href={featuredHref} className="lg:col-span-2 group">
                <article className="h-full overflow-hidden rounded-xl border border-gray-200 bg-white hover:shadow-lg transition-shadow">
                  <div className="relative aspect-[16/9]">
                    <Image
                      src={featuredImage}
                      alt={featuredTitle}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 66vw"
                    />
                  </div>
                  <div className="p-5">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 group-hover:text-amber-600">
                      {featuredTitle}
                    </h2>
                    {featuredDate ? <p className="mt-1 text-xs text-gray-500">{featuredDate}</p> : null}
                    {featuredExcerpt ? <p className="mt-2 text-gray-700 text-sm">{featuredExcerpt}</p> : null}
                  </div>
                </article>
              </Link>
            ) : null}

            <aside className="space-y-3">
              {sidebar.map((p) => {
                const slug = typeof p.slug === "string" ? p.slug.trim() : "";
                const href = slug ? `/blogs/${slug}` : "/blogs";
                const title = typeof p.title === "string" ? p.title : "Blog post";
                const image =
                  (typeof p.coverImageUrl === "string" && p.coverImageUrl.trim()) || "/placeholder.svg";
                const date = formatDate(p.publishedAt);
                return (
                  <Link
                    href={href}
                    key={slug || p.documentId || title}
                    className="flex gap-3 items-start p-2 rounded-lg hover:bg-white/60"
                  >
                    <div className="relative w-24 h-16 flex-shrink-0 rounded-md overflow-hidden border border-gray-200">
                      <Image src={image} alt={title} fill className="object-cover" sizes="96px" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 hover:text-amber-600">
                        {title}
                      </h3>
                      {date ? <p className="mt-0.5 text-xs text-gray-500">{date}</p> : null}
                    </div>
                  </Link>
                );
              })}
            </aside>
          </section>

          <section className="mb-10">
            <div className="mb-4">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-700">Memorial Guides & Insights</h2>
                <p className="text-xs sm:text-sm text-slate-600">
                  Practical advice and compassionate insights for choosing the right tombstone
                </p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              {grid.slice(0, showAllBlogs ? grid.length : 6).map((p) => (
                <BlogCard key={(p.slug || p.documentId || p.title || "post").toString()} post={p} />
              ))}
            </div>

            {grid.length > 6 ? (
              <div className="mt-8 text-center">
                <button
                  onClick={() => setShowAllBlogs(!showAllBlogs)}
                  className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium text-white bg-amber-600 hover:bg-amber-700"
                  type="button"
                >
                  {showAllBlogs ? "Show Less" : "View all articles"}
                </button>
              </div>
            ) : null}
          </section>
        </div>
      </div>
    </>
  );
}
