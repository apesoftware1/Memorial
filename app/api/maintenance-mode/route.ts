import { NextResponse } from "next/server";

let maintenanceEnabled = false;

export function GET() {
  return NextResponse.json({ enabled: maintenanceEnabled });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    maintenanceEnabled = !!body?.enabled;
    return NextResponse.json({ enabled: maintenanceEnabled });
  } catch {
    return NextResponse.json({ enabled: maintenanceEnabled }, { status: 400 });
  }
}

