import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { readPageVisibilityConfig, writePageVisibilityConfig } from "@/lib/pageVisibility";

export async function GET() {
  const config = await readPageVisibilityConfig();
  return NextResponse.json(config, {
    headers: {
      "cache-control": "no-store",
    },
  });
}

export async function POST(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const hidden = Array.isArray(body?.hidden) ? body.hidden : [];
    const config = await writePageVisibilityConfig({ hidden });
    return NextResponse.json(config, {
      headers: {
        "cache-control": "no-store",
      },
    });
  } catch {
    const config = await readPageVisibilityConfig();
    return NextResponse.json(config, { status: 400 });
  }
}

