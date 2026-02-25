"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import Header from "@/components/Header.jsx"
import { useQuery, ApolloProvider } from "@apollo/client"
import { GET_BLOG_BY_ID } from "@/graphql/queries/getBlogs"
import client from "@/lib/apolloClient"
import ReactMarkdown from "react-markdown";

// Loading skeleton component
function BlogSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/4 mb-8"></div>
      <div className="h-64 bg-gray-200 rounded mb-6"></div>
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      </div>
    </div>
  );
}

// Error component
function ErrorDisplay({ message }) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
      <h3 className="text-xl font-medium text-red-800">Error Loading Blog</h3>
      <p className="mt-2 text-red-600">{message || "Failed to load blog post. Please try again later."}</p>
      <Link href="/blog" className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700">
        Return to Blog List
      </Link>
    </div>
  );
}

export default function BlogPage({ params }) {
  return (
    <ApolloProvider client={client}>
      <BlogContent params={params} />
    </ApolloProvider>
  );
}

function BlogContent({ params }) {
  const { id } = params;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Fetch blog post using GraphQL
  const { loading, error, data } = useQuery(GET_BLOG_BY_ID, {
    variables: { documentId: id },
    fetchPolicy: "cache-first",
  });

  // Handle loading state
  if (loading) {
    return (
      <>
        <Header 
          mobileMenuOpen={mobileMenuOpen}
          handleMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
        />
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
          <BlogSkeleton />
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
          handleMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
        />
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
          <ErrorDisplay message={error.message} />
        </div>
      </>
    );
  }

  // Get the blog post data
  const blogPost = data?.blogPost;
   
  // Handle not found state
  if (!blogPost) {
    return (
      <>
        <Header 
          mobileMenuOpen={mobileMenuOpen}
          handleMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
        />
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">Blog Post Not Found</h1>
            <p className="mt-4 text-gray-600">The blog post you're looking for doesn't exist.</p>
            <Link href="/blog" className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700">
              Return to Blog List
            </Link>
          </div>
        </div>
      </>
    );
  }
  
  // Format date
  const formattedDate = blogPost.publishedAt 
    ? new Date(blogPost.publishedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : '';
  
  return (
    <>
      <Header 
        mobileMenuOpen={mobileMenuOpen}
        handleMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
      />
      <div className="bg-white min-h-screen">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
          {/* Breadcrumbs */}
          <nav className="flex mb-8" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2">
              <li>
                <Link href="/" className="text-gray-500 hover:text-gray-700">Home</Link>
              </li>
              <li className="flex items-center">
                <span className="mx-2 text-gray-400">/</span>
                <Link href="/blog" className="text-gray-500 hover:text-gray-700">Blog</Link>
              </li>
              <li className="flex items-center">
                <span className="mx-2 text-gray-400">/</span>
                <span className="text-gray-900 font-medium truncate max-w-xs">{blogPost.title}</span>
              </li>
            </ol>
          </nav>
          
          {/* Back button */}
          <Link href="/blog" className="inline-flex items-center text-amber-600 hover:text-amber-700 mb-6">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to all posts
          </Link>
          
          {/* Blog content */}
          <article>
            {blogPost.coverImage?.url && (
              <div className="relative aspect-[16/9] mb-8 overflow-hidden rounded-lg">
                <Image 
                  src={blogPost.coverImage.url} 
                  alt={blogPost.title} 
                  fill 
                  className="object-cover" 
                  priority
                />
              </div>
            )}
            
            <h1 className="text-3xl font-bold text-gray-900 mb-3">{blogPost.title}</h1>
            
            {formattedDate && (
              <p className="text-gray-500 mb-8">{formattedDate}</p>
            )}
            
            <div 
              className="prose prose-amber max-w-none"
              // dangerouslySetInnerHTML={{ __html: blogPost.content }}
              children={<ReactMarkdown>{blogPost.content}</ReactMarkdown>}
            />
          </article>
        </div>
      </div>
    </>
  );
}
