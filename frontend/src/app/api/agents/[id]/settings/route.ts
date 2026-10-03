import { NextResponse } from "next/server";
import { authenticatedUser } from "@/lib/agents-server";
import { backendFetch } from "@/lib/backend";

async function proxy(request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await authenticatedUser();
  if (!auth) return NextResponse.json({ message: "No autenticado." }, { status: 401 });

  const { id } = await context.params;
  const body = request.method === "GET" ? undefined : await request.text();
  const response = await backendFetch(`/agents/${encodeURIComponent(id)}/settings`, {
    method: request.method,
    headers: {
      Authorization: `Bearer ${auth.token}`,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body,
  });

  return new NextResponse(await response.text(), {
    status: response.status,
    headers: { "Content-Type": response.headers.get("content-type") ?? "application/json" },
  });
}

export const GET = proxy;
export const PUT = proxy;
