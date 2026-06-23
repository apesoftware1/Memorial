"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import { useQuery } from "@apollo/client";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Loader2, LogOut, Search, Upload, ImagePlus } from "lucide-react";
import { GET_BLOGS_ADMIN } from "@/graphql/queries/getBlogs";
import { cloudinaryOptimized } from "@/lib/cloudinary";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

function formatDate(value) {
  if (!value) return "Unpublished";
  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed)) return "Unpublished";
  return new Date(parsed).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function normalizeImageUrl(raw) {
  const value = typeof raw === "string" ? raw.trim() : "";
  if (!value) return "";
  if (value.startsWith("http://") || value.startsWith("https://") || value.startsWith("/")) return value;
  return "";
}

export default function BlogsManagerClient() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const fileInputRefs = useRef({});
  const [search, setSearch] = useState("");
  const [uploadingId, setUploadingId] = useState("");
  const [localImages, setLocalImages] = useState({});

  const { data, loading, error, refetch } = useQuery(GET_BLOGS_ADMIN, {
    fetchPolicy: "cache-and-network",
  });

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      router.push("/manufacturers/login-page");
      return;
    }
    if (status === "authenticated" && session && !session.user?.isAdmin) {
      router.push("/manufacturers/manufacturers-Profile-Page");
    }
  }, [status, session, router]);

  const blogs = Array.isArray(data?.blogPosts) ? data.blogPosts : [];

  const filteredBlogs = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return blogs;
    return blogs.filter((post) => {
      const title = typeof post?.title === "string" ? post.title.toLowerCase() : "";
      const slug = typeof post?.slug === "string" ? post.slug.toLowerCase() : "";
      return title.includes(term) || slug.includes(term);
    });
  }, [blogs, search]);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/", redirect: true });
  };

  const uploadBlogImageToCloudinary = async (file) => {
    const cloudName =
      process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dtymvjhjq";
    const uploadPreset =
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "listings";

    const uploadData = new FormData();
    uploadData.append("file", file);
    uploadData.append("upload_preset", uploadPreset);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body: uploadData,
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "Upload failed");
    }

    const data = await res.json();
    if (data?.error?.message) throw new Error(data.error.message);
    return data;
  };

  const handleFileSelect = async (event, blog) => {
    const file = event.target.files?.[0];
    if (!file || !blog?.documentId) return;

    try {
      setUploadingId(blog.documentId);

      const uploaded = await uploadBlogImageToCloudinary(file);
      if (!uploaded?.secure_url) {
        throw new Error("Image upload failed");
      }

      const response = await fetch(`/api/blog-posts/${blog.documentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          coverImageUrl: uploaded.secure_url,
          coverImagePublicId: uploaded.public_id || "",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save blog image");
      }

      setLocalImages((prev) => ({
        ...prev,
        [blog.documentId]: uploaded.secure_url,
      }));

      toast({
        title: "Blog image updated",
        description: `Cover image saved for "${blog.title || "Untitled blog"}".`,
      });

      await refetch();
    } catch (uploadError) {
      console.error(uploadError);
      toast({
        title: "Upload failed",
        description: "Could not upload and save the blog cover image.",
        variant: "destructive",
      });
    } finally {
      setUploadingId("");
      if (event.target) event.target.value = "";
    }
  };

  if (status === "loading" || (loading && blogs.length === 0)) {
    return (
      <div className="min-h-screen bg-background text-foreground p-6">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center gap-3 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading blog manager...</span>
          </div>
        </div>
      </div>
    );
  }

  if (status === "authenticated" && session && !session.user?.isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-6xl p-6 space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <Link
              href="/regan-dashboard"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to dashboard
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Manage Blogs</h1>
              <p className="text-muted-foreground">
                Upload and replace blog cover images used on the public blog pages.
              </p>
            </div>
          </div>

          <Button variant="outline" onClick={handleSignOut} className="w-full md:w-auto">
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Blog Cover Images</CardTitle>
            <CardDescription>
              Search blog posts, preview the current cover image, and upload a replacement image.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by blog title or slug"
                className="pl-9"
              />
            </div>

            {error ? (
              <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                Failed to load blogs: {error.message}
              </div>
            ) : null}

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {filteredBlogs.map((blog) => {
                const rawImageUrl = localImages[blog.documentId] || blog.coverImageUrl || "";
                const imageUrl = normalizeImageUrl(rawImageUrl);
                const isUploading = uploadingId === blog.documentId;

                return (
                  <Card key={blog.documentId} className="overflow-hidden">
                    <div className="flex flex-col">
                      <div className="relative aspect-[16/9] bg-muted">
                        {imageUrl ? (
                          <Image
                            src={cloudinaryOptimized(imageUrl, 1000)}
                            alt={blog.title || "Blog cover image"}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-muted-foreground">
                            <div className="flex flex-col items-center gap-2 text-sm">
                              <ImagePlus className="h-8 w-8" />
                              <span>{rawImageUrl ? "Invalid cover image URL" : "No cover image"}</span>
                            </div>
                          </div>
                        )}

                        {isUploading ? (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                            <Loader2 className="h-8 w-8 animate-spin text-white" />
                          </div>
                        ) : null}
                      </div>

                      <div className="p-5 space-y-4">
                        <div className="space-y-1">
                          <h2 className="text-lg font-semibold leading-tight">{blog.title || "Untitled blog"}</h2>
                          <p className="text-sm text-muted-foreground">Slug: {blog.slug || "No slug"}</p>
                          <p className="text-sm text-muted-foreground">Published: {formatDate(blog.publishedAt)}</p>
                        </div>

                        {blog.excerpt ? (
                          <p className="line-clamp-3 text-sm text-muted-foreground">{blog.excerpt}</p>
                        ) : null}

                        <input
                          ref={(el) => {
                            fileInputRefs.current[blog.documentId] = el;
                          }}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(event) => handleFileSelect(event, blog)}
                        />

                        <div className="flex flex-col gap-3 sm:flex-row">
                          <Button
                            onClick={() => fileInputRefs.current[blog.documentId]?.click()}
                            disabled={isUploading}
                            className="sm:w-auto"
                          >
                            {isUploading ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <Upload className="mr-2 h-4 w-4" />
                            )}
                            {imageUrl ? "Replace cover image" : "Upload cover image"}
                          </Button>

                          {blog.slug ? (
                            <Button variant="outline" asChild>
                              <Link href={`/blogs/${blog.slug}`} target="_blank">
                                View live page
                              </Link>
                            </Button>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            {!loading && filteredBlogs.length === 0 ? (
              <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
                No blogs found for that search.
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
