import { NextResponse } from "next/server";

export async function GET() {
  try {
    const baseUrl = process.env.STRAPI_API_URL || "https://api.tombstonesfinder.co.za";
    const response = await fetch(
      `${baseUrl}/api/location-landing-seos?pagination[pageSize]=500&sort[0]=province:asc&sort[1]=cityContext:asc&sort[2]=locationValue:asc`,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Strapi location landing seo list error:", errorText);
      return NextResponse.json(
        { error: `Failed to fetch location landing SEO entries: ${response.status}` },
        { status: response.status }
      );
    }

    const payload = await response.json();
    return NextResponse.json(payload);
  } catch (error) {
    console.error("Error fetching location landing SEO entries:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
