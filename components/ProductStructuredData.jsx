"use client";

import React from "react";

export default function ProductStructuredData({ listing }) {
  try {
    const attrs = listing?.data?.attributes || listing?.attributes || listing || {};
    const company = attrs.company || listing?.company || {};

    const name = attrs.title || attrs.name || listing?.title || "Memorial Product";
    const description = attrs.description || listing?.description || undefined;
    const price = (attrs.price || listing?.price || undefined);
    const currency = attrs.currency || "ZAR";
    const image =
      attrs.featureImage?.url ||
      attrs.image?.url ||
      (Array.isArray(attrs.images) ? attrs.images[0]?.url || attrs.images[0] : undefined) ||
      listing?.image || undefined;
    const sku = attrs.sku || attrs.documentId || listing?.documentId || undefined;
    const brandName = company?.name || attrs.brand || undefined;

    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name,
      description,
      image,
      sku,
      brand: brandName ? { '@type': 'Brand', name: brandName } : undefined,
      offers: price ? {
        '@type': 'Offer',
        price: String(price),
        priceCurrency: currency,
        availability: 'https://schema.org/InStock',
        url: typeof window !== 'undefined' ? window.location.href : undefined,
      } : undefined,
    };

    return (
      <script
        type="application/ld+json"
        // JSON.stringify drops undefined fields, which is desired
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
    );
  } catch (e) {
    // Fail silently to avoid breaking the page
    return null;
  }
}