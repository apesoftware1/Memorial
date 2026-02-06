"use client";

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Upload } from "lucide-react";
import { useListingCategories } from "@/hooks/use-ListingCategories";
import { uploadToCloudinary, cloudinaryOptimized } from "@/lib/cloudinary";
import { useToast } from "@/hooks/use-toast";

export default function ListingCategoryManager() {
  const { categories, loading, error } = useListingCategories();
  const [uploadingId, setUploadingId] = useState(null);
  const fileInputRefs = useRef({});
  const { toast } = useToast();

  const handleFileSelect = async (e, category) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingId(category.documentId);
      
      // Upload to Cloudinary
      // We use "ListingCategories" as the folder name
      const uploadedImage = await uploadToCloudinary(file, "ListingCategories");
      
      if (!uploadedImage || !uploadedImage.secure_url) {
        throw new Error("Upload failed");
      }

      // Update via API
      const response = await fetch(`/api/listing-categories/${category.documentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl: uploadedImage.secure_url,
          imagePublicId: uploadedImage.public_id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update category");
      }

      toast({
        title: "Success",
        description: "Category background updated successfully",
        variant: "default", // or success if configured
      });

      // Reload page to show changes
      window.location.reload();

    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to update category background",
        variant: "destructive",
      });
    } finally {
      setUploadingId(null);
    }
  };

  if (loading) return <div>Loading categories...</div>;
  if (error) return <div>Error loading categories</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Listing Categories</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => {
            const bgUrl = category.imageUrl || category.backgroundImage?.url;
            
            return (
              <Card key={category.documentId} className="overflow-hidden">
                <div className="relative h-48 bg-gray-100">
                  {bgUrl ? (
                    <Image
                      src={cloudinaryOptimized(bgUrl, 600)}
                      alt={category.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      No Image
                    </div>
                  )}
                  {uploadingId === category.documentId && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Loader2 className="w-8 h-8 text-white animate-spin" />
                    </div>
                  )}
                </div>
                <CardHeader>
                  <CardTitle>{category.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={(el) => (fileInputRefs.current[category.documentId] = el)}
                    onChange={(e) => handleFileSelect(e, category)}
                  />
                  <Button 
                    className="w-full" 
                    variant="outline"
                    disabled={uploadingId === category.documentId}
                    onClick={() => fileInputRefs.current[category.documentId]?.click()}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {bgUrl ? "Change Background" : "Upload Background"}
                  </Button>
                </CardContent>
              </Card>
            );
        })}
      </div>
    </div>
  );
}
