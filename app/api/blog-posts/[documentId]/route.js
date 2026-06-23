import { NextResponse } from "next/server";

export async function PUT(request, { params }) {
  try {
    const { documentId } = params;
    const body = await request.json();

    if (!documentId) {
      return NextResponse.json({ error: "Blog post documentId is required" }, { status: 400 });
    }

    const strapiPayload = {
      data: {
        coverImageUrl: body.coverImageUrl || "",
        coverImagePublicId: body.coverImagePublicId || "",
      },
    };

    const baseUrl = process.env.STRAPI_API_URL || "https://api.tombstonesfinder.co.za";
    const response = await fetch(`${baseUrl}/api/blog-posts/${documentId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(strapiPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Strapi blog update error:", errorText);
      return NextResponse.json(
        { error: `Failed to update blog post: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error updating blog post:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
