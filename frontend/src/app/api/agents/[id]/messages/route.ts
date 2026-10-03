import { NextResponse } from "next/server";
import { authenticatedUser, realtimeFetch } from "@/lib/agents-server";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!await authenticatedUser()) {
    return NextResponse.json({ message: "No autenticado." }, { status: 401 });
  }

  const { id } = await context.params;
  const body = await request.text();
  const response = await realtimeFetch(`/api/agents/${encodeURIComponent(id)}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  });

  return new NextResponse(await response.text(), {
    status: response.status,
    headers: { "Content-Type": response.headers.get("content-type") ?? "application/json" },
  });
}
