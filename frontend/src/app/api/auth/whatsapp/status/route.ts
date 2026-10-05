import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend";

export async function GET() {
  const response = await backendFetch("/auth/whatsapp/status");
  const data = await response.json().catch(() => ({ enabled: false }));
  return NextResponse.json(data, { status: response.status });
}
