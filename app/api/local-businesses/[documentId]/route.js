import { NextResponse } from "next/server";

export async function PUT(request, { params }) {
  try {
    const { documentId } = params;
    const body = await request.json();

    if (!documentId) {
      return NextResponse.json({ error: "Local business documentId is required" }, { status: 400 });
    }

    const data = {};

    if (Object.prototype.hasOwnProperty.call(body, "logoUrl")) {
      data.logoUrl = typeof body.logoUrl === "string" ? body.logoUrl : "";
    }
    if (Object.prototype.hasOwnProperty.call(body, "logoPublicId")) {
      data.logoPublicId = typeof body.logoPublicId === "string" ? body.logoPublicId : "";
    }
    if (Object.prototype.hasOwnProperty.call(body, "imageUrls")) {
      data.imageUrls = Array.isArray(body.imageUrls) ? body.imageUrls : [];
    }
    if (Object.prototype.hasOwnProperty.call(body, "imagePublicIds")) {
      data.imagePublicIds = Array.isArray(body.imagePublicIds) ? body.imagePublicIds : [];
    }

    const strapiPayload = { data };

    const baseUrl = process.env.STRAPI_API_URL || "https://api.tombstonesfinder.co.za";
    const response = await fetch(`${baseUrl}/api/local-businesses/${documentId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(strapiPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Strapi local business update error:", errorText);
      return NextResponse.json(
        { error: `Failed to update business: ${response.status}` },
        { status: response.status }
      );
    }

    const payload = await response.json();
    return NextResponse.json(payload);
  } catch (error) {
    console.error("Error updating business:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

