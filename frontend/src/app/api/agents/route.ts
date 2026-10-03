import { NextResponse } from "next/server";
import { authenticatedUser, realtimeFetch } from "@/lib/agents-server";

export async function GET() {
  if (!await authenticatedUser()) {
    return NextResponse.json({ message: "No autenticado." }, { status: 401 });
  }

  const response = await realtimeFetch("/api/agents");
  return new NextResponse(await response.text(), {
    status: response.status,
    headers: { "Content-Type": response.headers.get("content-type") ?? "application/json" },
  });
}
