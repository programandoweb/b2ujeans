import { NextRequest, NextResponse } from "next/server";
import { authenticatedUser, realtimeFetch } from "@/lib/agents-server";

async function proxy(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const auth = await authenticatedUser();
  if (!auth) return NextResponse.json({ message: "No autenticado." }, { status: 401 });

  const { path } = await context.params;
  const body = ["GET", "HEAD"].includes(request.method) ? undefined : await request.text();
  const response = await realtimeFetch("/api/channels/" + path.join("/"), {
    method: request.method,
    headers: { "Content-Type": "application/json" },
    body: body || undefined,
  });

  return new NextResponse(await response.text(), {
    status: response.status,
    headers: { "Content-Type": response.headers.get("content-type") ?? "application/json" },
  });
}

export const GET = proxy;
export const POST = proxy;
