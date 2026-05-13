import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"
import {
  readCompanySpecialOfferVisibilityConfig,
  writeCompanySpecialOfferVisibilityConfig,
} from "@/lib/companySpecialOfferVisibility"

export async function GET() {
  const config = await readCompanySpecialOfferVisibilityConfig()
  return NextResponse.json(config, {
    headers: {
      "cache-control": "no-store",
    },
  })
}

export async function POST(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  if (!token?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const hiddenCompanyDocumentIds = Array.isArray(body?.hiddenCompanyDocumentIds)
      ? body.hiddenCompanyDocumentIds
      : []

    const config = await writeCompanySpecialOfferVisibilityConfig({
      hiddenCompanyDocumentIds,
    })

    return NextResponse.json(config, {
      headers: {
        "cache-control": "no-store",
      },
    })
  } catch {
    const config = await readCompanySpecialOfferVisibilityConfig()
    return NextResponse.json(config, { status: 400 })
  }
}
