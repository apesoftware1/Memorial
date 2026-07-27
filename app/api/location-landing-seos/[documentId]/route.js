import { NextResponse } from "next/server";

export async function PUT(request, { params }) {
  try {
    const { documentId } = await params;
    const body = await request.json();

    if (!documentId) {
      return NextResponse.json({ error: "Location landing SEO documentId is required" }, { status: 400 });
    }

    const strapiPayload = {
      data: {
        heroImageUrl: body.heroImageUrl || "",
        heroImagePublicId: body.heroImagePublicId || "",
      },
    };

    const baseUrl = process.env.STRAPI_API_URL || "https://api.tombstonesfinder.co.za";
    const response = await fetch(`${baseUrl}/api/location-landing-seos/${documentId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(strapiPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Strapi location landing SEO update error:", errorText);
      return NextResponse.json(
        { error: `Failed to update location landing SEO entry: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error updating location landing SEO entry:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
