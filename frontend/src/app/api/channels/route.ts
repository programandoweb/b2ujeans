import { NextResponse } from "next/server";
import { authenticatedUser, realtimeFetch } from "@/lib/agents-server";

export async function GET() {
  const auth = await authenticatedUser();
  if (!auth) return NextResponse.json({ message: "No autenticado." }, { status: 401 });

  const response = await realtimeFetch("/api/channels");
  return new NextResponse(await response.text(), {
    status: response.status,
    headers: { "Content-Type": response.headers.get("content-type") ?? "application/json" },
  });
}
