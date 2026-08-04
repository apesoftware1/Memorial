"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ImagePlus, Loader2, LogOut, Search, Upload } from "lucide-react";
import { cloudinaryOptimized } from "@/lib/cloudinary";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeImageUrl(raw) {
  const value = typeof raw === "string" ? raw.trim() : "";
  if (!value) return "";
  if (value.startsWith("http://") || value.startsWith("https://") || value.startsWith("/")) return value;
  return "";
}

async function uploadBusinessLogoToCloudinary(file) {
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

export default function BusinessesManagerClient() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const fileInputRefs = useRef({});
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [uploadingId, setUploadingId] = useState("");
  const [localLogos, setLocalLogos] = useState({});

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

      const response = await fetch("/api/local-businesses", { cache: "no-store" });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error || "Failed to load businesses");
      }

      const rows = Array.isArray(payload?.data) ? payload.data : [];
      setEntries(rows);
    } catch (loadError) {
      console.error(loadError);
      setError(loadError?.message || "Failed to load businesses");
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
      const name = normalizeText(entry?.name).toLowerCase();
      const type = normalizeText(entry?.businessType).toLowerCase();
      const town = normalizeText(entry?.town).toLowerCase();
      const province = normalizeText(entry?.province).toLowerCase();
      return name.includes(term) || type.includes(term) || town.includes(term) || province.includes(term);
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

      const uploaded = await uploadBusinessLogoToCloudinary(file);
      if (!uploaded?.secure_url) {
        throw new Error("Upload failed");
      }

      const response = await fetch(`/api/local-businesses/${entry.documentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          logoUrl: uploaded.secure_url,
          logoPublicId: uploaded.public_id || "",
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.error || "Failed to save logo");
      }

      setLocalLogos((prev) => ({ ...prev, [entry.documentId]: uploaded.secure_url }));

      toast({
        title: "Business logo updated",
        description: `Logo saved for "${entry.name || "Local business"}".`,
      });

      await loadEntries();
    } catch (uploadError) {
      console.error(uploadError);
      toast({
        title: "Upload failed",
        description: "Could not upload and save the business logo.",
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
            <span>Loading businesses...</span>
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
              <h1 className="text-3xl font-bold tracking-tight">Manage Businesses</h1>
              <p className="text-muted-foreground">Upload and replace logos shown in the Nearby Businesses section.</p>
            </div>
          </div>

          <Button variant="outline" onClick={handleSignOut} className="w-full md:w-auto">
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Business Logos</CardTitle>
            <CardDescription>Search businesses, preview the current logo, and upload a replacement.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, town, province" className="pl-9" />
            </div>

            {error ? (
              <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                Failed to load businesses: {error}
              </div>
            ) : null}

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {filteredEntries.map((entry) => {
                const id = entry?.documentId || "";
                const rawImageUrl = localLogos[id] || entry?.logoUrl || "";
                const imageUrl = normalizeImageUrl(rawImageUrl);
                const name = normalizeText(entry?.name) || "Local business";
                const businessType = normalizeText(entry?.businessType);
                const town = normalizeText(entry?.town);
                const province = normalizeText(entry?.province);
                const subtitle = [businessType, town, province].filter(Boolean).join(" · ");
                const isUploading = uploadingId === id;

                return (
                  <Card key={id || name} className="overflow-hidden">
                    <div className="flex items-stretch gap-4 p-5">
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden border border-slate-200 bg-slate-100">
                        {imageUrl ? (
                          <Image
                            src={cloudinaryOptimized(imageUrl, 400)}
                            alt={name}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                            <ImagePlus className="h-7 w-7" />
                          </div>
                        )}
                        {isUploading ? (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                            <Loader2 className="h-6 w-6 animate-spin text-white" />
                          </div>
                        ) : null}
                      </div>

                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="min-w-0">
                          <h2 className="truncate text-base font-semibold">{name}</h2>
                          <p className="truncate text-sm text-muted-foreground">{subtitle || "—"}</p>
                        </div>

                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                          <input
                            type="file"
                            accept="image/*"
                            ref={(node) => {
                              if (id) fileInputRefs.current[id] = node;
                            }}
                            onChange={(e) => handleFileSelect(e, entry)}
                            className="hidden"
                          />
                          <Button
                            type="button"
                            variant="default"
                            size="sm"
                            disabled={!id || isUploading}
                            onClick={() => fileInputRefs.current[id]?.click()}
                          >
                            <Upload className="mr-2 h-4 w-4" />
                            Upload logo
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            {!filteredEntries.length && !loading ? (
              <div className="rounded-md border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
                No businesses found.
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

