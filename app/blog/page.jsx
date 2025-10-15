"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import { useQuery, ApolloProvider } from "@apollo/client";
import { GET_BLOGS } from "@/graphql/queries/getBlogs";
import client from "@/lib/apolloClient";

// Fallback posts in case of error or for initial loading
const fallbackPosts = [
  {
    id: "1",
    title: "How to Choose the Right Tombstone in South Africa",
    href: "/blog/placeholder-1",
    date: "Aug 9, 2024",
    readingTime: "6 min read",
    excerpt: "Selecting a tombstone is a moment rich in meaning. Here's how to make the best choice for a lasting memorial.",
    image: "/2560(w)x400px(h)_Banner_OldYoungCouple.jpg",
  },
  // Other fallback posts removed for brevity
];

function BlogCard({ post }) {
  return (
    <div className="group block overflow-hidden rounded-lg border border-gray-200 hover:shadow-md transition-shadow bg-white">
      <Link href={`/blog/${post.documentId || post.id}`}>
        <div className="aspect-[16/9] relative">
          <Image 
            src={post.coverImage?.url || post.image || "/placeholder.jpg"} 
            alt={post.title} 
            fill 
            className="object-cover" 
            sizes="(max-width: 768px) 100vw, 33vw" 
          />
        </div>
      </Link>
      <div className="p-4">
        <Link href={`/blog/${post.documentId || post.id}`}>
          <h3 className="text-sm font-semibold text-gray-900 group-hover:text-amber-600 line-clamp-2">{post.title}</h3>
        </Link>
        <p className="mt-1 text-xs text-gray-500 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {post.publishedAt 
            ? new Date(post.publishedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })
            : post.date} 
          {post.readingTime && ` • ${post.readingTime}`}
        </p>
        <p className="mt-2 text-sm text-gray-600 line-clamp-2">{post.excerpt}</p>
        <div className="mt-3">
          <Link href={`/blog/${post.documentId || post.id}`} className="inline-flex items-center text-xs font-medium text-amber-600 hover:text-amber-700">
            Read More
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}

// Loading skeleton component for blog cards
function BlogCardSkeleton() {
  return (
    <div className="block overflow-hidden rounded-lg border border-gray-200 bg-white">
      <div className="aspect-[16/9] relative bg-gray-200 animate-pulse"></div>
      <div className="p-4">
        <div className="h-5 bg-gray-200 rounded animate-pulse mb-2"></div>
        <div className="h-3 bg-gray-200 rounded animate-pulse w-1/3 mb-2 flex items-center">
          <div className="h-3 w-3 bg-gray-200 rounded-full animate-pulse mr-1"></div>
          <div className="flex-1"></div>
        </div>
        <div className="h-4 bg-gray-200 rounded animate-pulse mt-2"></div>
        <div className="h-4 bg-gray-200 rounded animate-pulse mt-1 w-2/3"></div>
        <div className="mt-3">
          <div className="h-3 bg-gray-200 rounded animate-pulse w-20"></div>
        </div>
      </div>
    </div>
  );
}

// Error component
function ErrorDisplay({ message }) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center">
      <h3 className="text-lg font-medium text-red-800">Error Loading Blogs</h3>
      <p className="mt-2 text-sm text-red-600">{message || "Failed to load blog posts. Please try again later."}</p>
    </div>
  );
}

export default function BlogPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  return (
    <ApolloProvider client={client}>
      <BlogContent />
    </ApolloProvider>
  );
}

function BlogContent() {
  // Fetch blog posts using GraphQL
  const { loading, error, data } = useQuery(GET_BLOGS);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileDropdown, setMobileDropdown] = useState(null);
  const [showAllBlogs, setShowAllBlogs] = useState(false);
  
  const handleMobileMenuToggle = () => setMobileMenuOpen(!mobileMenuOpen);
  const handleMobileDropdownToggle = (dropdown) => {
    setMobileDropdown(mobileDropdown === dropdown ? null : dropdown);
  };
  
  // Handle loading state
  if (loading) {
    return (
      <>
        <Header 
          mobileMenuOpen={mobileMenuOpen}
          handleMobileMenuToggle={handleMobileMenuToggle}
          mobileDropdown={mobileDropdown}
          handleMobileDropdownToggle={handleMobileDropdownToggle}
        />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-8">Blog</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <BlogCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </>
    );
  }
  
  // Handle error state
  if (error) {
    return (
      <>
        <Header 
          mobileMenuOpen={mobileMenuOpen}
          handleMobileMenuToggle={handleMobileMenuToggle}
          mobileDropdown={mobileDropdown}
          handleMobileDropdownToggle={handleMobileDropdownToggle}
        />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-8">Blog</h1>
          <ErrorDisplay message={error.message} />
        </div>
      </>
    );
  }
  
  // Process the data when available
  const posts = data?.blogPosts || fallbackPosts;
  
  // Set up featured and sidebar posts
  const featured = posts[0];
  const sidebar = posts.slice(1, 5);
  const grid = posts.slice(1);

  return (
    <>
      <Header 
        mobileMenuOpen={mobileMenuOpen}
        handleMobileMenuToggle={handleMobileMenuToggle}
        mobileDropdown={mobileDropdown}
        handleMobileDropdownToggle={handleMobileDropdownToggle}
      />
      
      {/* Background Image Section */}
      <div 
        className="h-64 bg-cover bg-center bg-no-repeat relative"
        style={{
          backgroundImage: "url('/2560(w)x400px(h)_Banner_OldYoungCouple.jpg')"
        }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="relative z-10 flex items-center justify-center h-full">
          <div className="text-center text-white">
            <h1 className="text-5xl font-bold mb-4">Insights, Guides & Blogs</h1>
            <p className="text-xl max-w-2xl mx-auto">
              Helpful guides on choosing tombstones, understanding costs, and creating a meaningful memorial.
            </p>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 max-w-4xl py-6 sm:py-8">
          {/* Error state */}
          {error && <ErrorDisplay message={error.message} />}

          {/* Featured + Sidebar */}
          <section className="grid lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
            {/* Featured - Show skeleton while loading */}
            {loading ? (
              <div className="lg:col-span-2">
                <BlogCardSkeleton />
              </div>
            ) : (
              featured && (
                <Link href={`/blog/${featured.documentId || featured.id}`} className="lg:col-span-2 group">
                  <article className="h-full overflow-hidden rounded-xl border border-gray-200 bg-white hover:shadow-lg transition-shadow">
                    <div className="relative aspect-[16/9]">
                      <Image 
                        src={featured.coverImage?.url || featured.image || "/placeholder.jpg"} 
                        alt={featured.title} 
                        fill 
                        className="object-cover" 
                        sizes="(max-width: 1024px) 100vw, 66vw" 
                      />
                    </div>
                    <div className="p-5">
                      <h2 className="text-lg sm:text-xl font-bold text-gray-900 group-hover:text-amber-600">
                        {featured.title}
                      </h2>
                      <p className="mt-1 text-xs text-gray-500">
                        {featured.publishedAt 
                          ? new Date(featured.publishedAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })
                          : featured.date} 
                        {featured.readingTime && ` • ${featured.readingTime}`}
                      </p>
                      <p className="mt-2 text-gray-700 text-sm">{featured.excerpt}</p>
                    </div>
                  </article>
                </Link>
              )
            )}

            {/* Sidebar list - Show skeletons while loading */}
            <aside className="space-y-3">
              {loading ? (
                Array(4).fill(0).map((_, i) => (
                  <div key={i} className="flex gap-3 items-start p-2">
                    <div className="w-24 h-16 bg-gray-200 animate-pulse rounded-md"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded animate-pulse mb-1"></div>
                      <div className="h-3 bg-gray-200 rounded animate-pulse w-1/3"></div>
                    </div>
                  </div>
                ))
              ) : (
                sidebar.map((p) => (
                  <Link href={`/blog/${p.documentId || p.id}`} key={p.documentId || p.id} className="flex gap-3 items-start p-2 rounded-lg hover:bg-white/60">
                    <div className="relative w-24 h-16 flex-shrink-0 rounded-md overflow-hidden border border-gray-200">
                      <Image 
                        src={p.coverImage?.url || p.image || "/placeholder.jpg"} 
                        alt={p.title} 
                        fill 
                        className="object-cover" 
                        sizes="96px" 
                      />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 hover:text-amber-600">{p.title}</h3>
                      <p className="mt-0.5 text-xs text-gray-500">
                        {p.publishedAt 
                          ? new Date(p.publishedAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })
                          : p.date} 
                        {p.readingTime && ` • ${p.readingTime}`}
                      </p>
                    </div>
                  </Link>
                ))
              )}
            </aside>
          </section>

          {/* Grid Section */}
          <section className="mb-10">
            <div className="mb-4">
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-700">Memorial Guides & Insights</h2>
                <p className="text-xs sm:text-sm text-slate-600">Practical advice and compassionate insights for choosing the right tombstone</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              {loading ? (
                // Show skeleton cards while loading
                Array(6).fill(0).map((_, i) => <BlogCardSkeleton key={i} />)
              ) : (
                // Show actual blog posts when loaded
                grid.slice(0, showAllBlogs ? grid.length : 6).map((p) => <BlogCard key={p.documentId || p.id} post={p} />)
              )}
            </div>

            {!loading && grid.length > 6 && (
              <div className="mt-8 text-center">
                <button 
                  onClick={() => setShowAllBlogs(!showAllBlogs)} 
                  className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium text-white bg-amber-600 hover:bg-amber-700"
                >
                  {showAllBlogs ? "Show Less" : "View all articles"}
                </button>
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  );
}