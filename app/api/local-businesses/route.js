import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const baseUrl = process.env.STRAPI_API_URL || "https://api.tombstonesfinder.co.za";
    const { searchParams } = new URL(request.url);
    const term = (searchParams.get("search") || "").trim();

    const params = new URLSearchParams();
    params.set("pagination[pageSize]", "500");
    params.set("sort[0]", "province:asc");
    params.set("sort[1]", "town:asc");
    params.set("sort[2]", "displayOrder:asc");
    params.set("sort[3]", "name:asc");

    if (term) {
      params.set("filters[$or][0][name][$containsi]", term);
      params.set("filters[$or][1][town][$containsi]", term);
      params.set("filters[$or][2][province][$containsi]", term);
      params.set("filters[$or][3][businessType][$containsi]", term);
    }

    const response = await fetch(`${baseUrl}/api/local-businesses?${params.toString()}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Strapi local business list error:", errorText);
      return NextResponse.json(
        { error: `Failed to fetch businesses: ${response.status}` },
        { status: response.status }
      );
    }

    const payload = await response.json();
    return NextResponse.json(payload);
  } catch (error) {
    console.error("Error fetching businesses:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

