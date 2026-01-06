import React from "react";
import Link from "next/link";
import Image from "next/image";
import PropTypes from "prop-types";
import { formatPrice } from "@/lib/priceUtils";

export default function RelatedProducts({ products = [] }) {
  if (!Array.isArray(products)) products = [];

  return (
    <div>
      <h3 className="text-sm font-medium mb-3">More Tombstones from this Manufacturer</h3>
      {products.length > 0 ? (
        products.slice(0, 3).map((product) => (
          <Link key={product.documentId} href={`/tombstones-for-sale/${product.documentId}`} className="block">
            <div 
              className="flex border-b border-gray-200 py-3 hover:bg-gray-50 transition"
              onContextMenu={(e) => e.preventDefault()}
              onDragStart={(e) => e.preventDefault()}
            >
              <div className="relative h-20 w-20 flex-shrink-0">
                <Image
                  src={product.mainImageUrl || "/placeholder.svg"}
                  alt={product.title}
                  fill
                  className="object-contain"
                />
              </div>
              <div className="ml-3 flex-grow">
                <div className="text-blue-600 font-medium">{formatPrice(product.price)}</div>
                <div className="text-sm">{product.title}</div>
                <div className="text-xs text-gray-600">
                  {product?.productDetails?.stoneType?.[0]?.value || "N/A"}
                </div>
              </div>
            </div>
          </Link>
        ))
      ) : (
        <div className="text-sm text-gray-600">No similar products available.</div>
      )}
      <div className="mt-3">
        <Link href="#" className="text-blue-600 hover:underline text-sm">
          View All Products from this Manufacturer &gt;
        </Link>
      </div>
    </div>
  );
}

RelatedProducts.propTypes = {
  products: PropTypes.arrayOf(PropTypes.object),
};