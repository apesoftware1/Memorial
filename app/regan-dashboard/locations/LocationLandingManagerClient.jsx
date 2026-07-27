"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ImagePlus, Loader2, LogOut, MapPinned, Search, Upload } from "lucide-react";
import { cloudinaryOptimized } from "@/lib/cloudinary";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

function normalizeImageUrl(raw) {
  const value = typeof raw === "string" ? raw.trim() : "";
  if (!value) return "";
  if (value.startsWith("http://") || value.startsWith("https://") || value.startsWith("/")) return value;
  return "";
}

function normalizeText(raw) {
  return typeof raw === "string" ? raw.trim() : "";
}

function slugifySegment(value) {
  const text = normalizeText(value);
  if (!text) return "";

  return encodeURIComponent(
    text
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .replace(/-{2,}/g, "-")
  );
}

function buildLocationHref(entry) {
  const province = normalizeText(entry?.province);
  const city = normalizeText(entry?.cityContext);
  const town = normalizeText(entry?.locationValue);

  if (!province || !town) return null;

  const provinceSlug = slugifySegment(province);
  const townSlug = slugifySegment(town);
  const citySlug = slugifySegment(city);

  if (!provinceSlug || !townSlug) return null;
  if (citySlug && citySlug !== townSlug) {
    return `/locations/${provinceSlug}/${citySlug}/${townSlug}`;
  }

  return `/locations/${provinceSlug}/${townSlug}`;
}

async function uploadLocationImageToCloudinary(file) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dtymvjhjq";
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "listings";

  const uploadData = new FormData();
  uploadData.append("file", file);
  uploadData.append("upload_preset", uploadPreset);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: uploadData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Upload failed");
  }

  const data = await response.json();
  if (data?.error?.message) throw new Error(data.error.message);
  return data;
}

export default function LocationLandingManagerClient() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const fileInputRefs = useRef({});
  const [search, setSearch] = useState("");
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [uploadingId, setUploadingId] = useState("");
  const [localImages, setLocalImages] = useState({});

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      router.push("/manufacturers/login-page");
      return;
    }
    if (status === "authenticated" && session && !session.user?.isAdmin) {
      router.push("/manufacturers/manufacturers-Profile-Page");
    }
  }, [router, session, status]);

  const loadEntries = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/location-landing-seos", {
        cache: "no-store",
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error || "Failed to load location landing pages");
      }

      const rows = Array.isArray(payload?.data) ? payload.data : [];
      setEntries(rows);
    } catch (loadError) {
      console.error(loadError);
      setError(loadError?.message || "Failed to load location landing pages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated" && session?.user?.isAdmin) {
      loadEntries();
    }
  }, [session, status]);

  const filteredEntries = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return entries;

    return entries.filter((entry) => {
      const title = normalizeText(entry?.title).toLowerCase();
      const province = normalizeText(entry?.province).toLowerCase();
      const town = normalizeText(entry?.locationValue).toLowerCase();
      const city = normalizeText(entry?.cityContext).toLowerCase();
      return title.includes(term) || province.includes(term) || town.includes(term) || city.includes(term);
    });
  }, [entries, search]);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/", redirect: true });
  };

  const handleFileSelect = async (event, entry) => {
    const file = event.target.files?.[0];
    if (!file || !entry?.documentId) return;

    try {
      setUploadingId(entry.documentId);

      const uploaded = await uploadLocationImageToCloudinary(file);
      if (!uploaded?.secure_url) {
        throw new Error("Image upload failed");
      }

      const response = await fetch(`/api/location-landing-seos/${entry.documentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          heroImageUrl: uploaded.secure_url,
          heroImagePublicId: uploaded.public_id || "",
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.error || "Failed to save location page image");
      }

      setLocalImages((prev) => ({
        ...prev,
        [entry.documentId]: uploaded.secure_url,
      }));

      toast({
        title: "Location page image updated",
        description: `Hero image saved for "${entry.title || entry.locationValue || "location page"}".`,
      });

      await loadEntries();
    } catch (uploadError) {
      console.error(uploadError);
      toast({
        title: "Upload failed",
        description: "Could not upload and save the location page image.",
        variant: "destructive",
      });
    } finally {
      setUploadingId("");
      if (event.target) event.target.value = "";
    }
  };

  if (status === "loading" || (loading && entries.length === 0)) {
    return (
      <div className="min-h-screen bg-background text-foreground p-6">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center gap-3 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading location page manager...</span>
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
              <h1 className="text-3xl font-bold tracking-tight">Manage Location Pages</h1>
              <p className="text-muted-foreground">
                Upload and replace town/location hero images used on the public location landing pages.
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
            <CardTitle>Location Page Images</CardTitle>
            <CardDescription>
              Search towns or provinces, preview the current hero image, and upload a replacement image for each
              location page entry.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by town, province, city, or title"
                className="pl-9"
              />
            </div>

            {error ? (
              <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
            ) : null}

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {filteredEntries.map((entry) => {
                const documentId = normalizeText(entry?.documentId);
                const title = normalizeText(entry?.title) || normalizeText(entry?.locationValue) || "Untitled location page";
                const province = normalizeText(entry?.province) || "No province";
                const town = normalizeText(entry?.locationValue) || "No town";
                const city = normalizeText(entry?.cityContext);
                const routeHref = buildLocationHref(entry);
                const rawImageUrl = localImages[documentId] || entry?.heroImageUrl || "";
                const imageUrl = normalizeImageUrl(rawImageUrl);
                const isUploading = uploadingId === documentId;

                return (
                  <Card key={documentId || `${province}-${town}`} className="overflow-hidden">
                    <div className="flex flex-col">
                      <div className="relative aspect-[16/9] bg-muted">
                        {imageUrl ? (
                          <Image
                            src={cloudinaryOptimized(imageUrl, 1200)}
                            alt={title}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-muted-foreground">
                            <div className="flex flex-col items-center gap-2 text-sm">
                              <ImagePlus className="h-8 w-8" />
                              <span>{rawImageUrl ? "Invalid hero image URL" : "No hero image"}</span>
                            </div>
                          </div>
                        )}

                        {isUploading ? (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                            <Loader2 className="h-8 w-8 animate-spin text-white" />
                          </div>
                        ) : null}
                      </div>

                      <div className="space-y-4 p-5">
                        <div className="space-y-1">
                          <h2 className="text-lg font-semibold leading-tight">{title}</h2>
                          <p className="text-sm text-muted-foreground">
                            {town}
                            {city && city.toLowerCase() !== town.toLowerCase() ? `, ${city}` : ""}
                            {province ? `, ${province}` : ""}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Type: {normalizeText(entry?.locationType) || "location"}
                          </p>
                        </div>

                        {normalizeText(entry?.intro) ? (
                          <p className="line-clamp-4 text-sm text-muted-foreground">{normalizeText(entry.intro)}</p>
                        ) : null}

                        <input
                          ref={(element) => {
                            fileInputRefs.current[documentId] = element;
                          }}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(event) => handleFileSelect(event, entry)}
                        />

                        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                          <Button
                            onClick={() => fileInputRefs.current[documentId]?.click()}
                            disabled={isUploading}
                            className="sm:w-auto"
                          >
                            {isUploading ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <Upload className="mr-2 h-4 w-4" />
                            )}
                            {imageUrl ? "Replace hero image" : "Upload hero image"}
                          </Button>

                          {routeHref ? (
                            <Button variant="outline" asChild>
                              <Link href={routeHref} target="_blank">
                                <MapPinned className="mr-2 h-4 w-4" />
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

            {!loading && filteredEntries.length === 0 ? (
              <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
                No location pages found for that search.
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
