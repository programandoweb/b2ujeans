import { NextRequest, NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string; filename: string }> }
) {
  const { id, filename } = await context.params;

  const response = await backendFetch(
    `/catalog/items/${encodeURIComponent(id)}/media/${encodeURIComponent(filename)}`,
    { method: "GET" }
  );

  return new NextResponse(await response.arrayBuffer(), {
    status: response.status,
    headers: {
      "Content-Type": response.headers.get("content-type") ?? "application/octet-stream",
      "Cache-Control": response.headers.get("cache-control") ?? "public, max-age=31536000, immutable",
    },
  });
}
