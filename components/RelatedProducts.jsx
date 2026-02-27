import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { cloudinaryOptimized } from "@/lib/cloudinary";

export default function RelatedProducts({ currentProductId, categoryId }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRelated = async () => {
      if (!categoryId) return;

      try {
        // Fetch products from same category, excluding current one
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/listings?filters[category][id][$eq]=${categoryId}&filters[id][$ne]=${currentProductId}&populate=images&pagination[limit]=4`,
          { cache: "force-cache" }
        );
        const data = await response.json();
        
        const formattedProducts = data.data.map(item => ({
          id: item.id,
          title: item.attributes.title,
          price: item.attributes.price,
          // Get first image
          mainImageUrl: item.attributes.images?.data?.[0]?.attributes?.url
        }));

        setProducts(formattedProducts);
      } catch (error) {
        console.error("Error fetching related products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRelated();
  }, [currentProductId, categoryId]);

  if (loading || products.length === 0) return null;

  return (
    <div className="mt-12 border-t pt-8">
      <h2 className="text-2xl font-bold mb-6">Related Products</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map((product) => (
          <Link 
            key={product.id} 
            href={`/product/${product.id}`}
            className="group block border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="relative h-48 bg-gray-100">
              <Image
                src={cloudinaryOptimized(product.mainImageUrl, 400) || "/placeholder.svg"}
                alt={product.title}
                fill
                className="object-contain group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 50vw, 25vw"
                unoptimized
              />
            </div>
            <div className="p-4">
              <h3 className="font-medium truncate">{product.title}</h3>
              {product.price && (
                <p className="text-primary font-bold mt-1">
                  R {product.price.toLocaleString()}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}