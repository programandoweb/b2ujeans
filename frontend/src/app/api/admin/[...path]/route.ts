import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend";

async function proxy(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const token = (await cookies()).get("gaspronal_access_token")?.value;
  if (!token) return NextResponse.json({ message: "No autenticado." }, { status: 401 });

  const { path } = await context.params;
  const url = new URL(request.url);
  const body = ["GET", "HEAD"].includes(request.method) ? undefined : await request.text();

  const response = await backendFetch("/" + path.join("/") + url.search, {
    method: request.method,
    headers: { Authorization: `Bearer ${token}` },
    body: body || undefined,
  });

  return new NextResponse(await response.text(), {
    status: response.status,
    headers: { "Content-Type": response.headers.get("content-type") ?? "application/json" },
  });
}

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
