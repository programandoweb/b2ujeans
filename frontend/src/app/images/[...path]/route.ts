import { NextRequest, NextResponse } from "next/server";

const backendUrl = process.env.LARAVEL_API_URL ?? "http://127.0.0.1:8000";

function safePath(parts: string[]) {
  return parts
    .filter((part) => part && part !== "." && part !== "..")
    .map((part) => encodeURIComponent(decodeURIComponent(part)))
    .join("/");
}

async function proxyImage(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  const relativePath = safePath(path ?? []);

  if (!relativePath) {
    return NextResponse.json({ message: "Imagen no encontrada." }, { status: 404 });
  }

  const target = `${backendUrl.replace(/\/$/, "")}/images/${relativePath}`;

  try {
    const upstream = await fetch(target, {
      method: request.method,
      cache: "no-store",
      headers: {
        Accept: request.headers.get("accept") ?? "image/*,*/*;q=0.8",
      },
    });

    if (!upstream.ok) {
      return NextResponse.json(
        { message: "Imagen no encontrada." },
        { status: upstream.status === 404 ? 404 : 502 },
      );
    }

    const headers = new Headers();
    const contentType = upstream.headers.get("content-type");
    const contentLength = upstream.headers.get("content-length");
    const lastModified = upstream.headers.get("last-modified");
    const etag = upstream.headers.get("etag");

    if (contentType) headers.set("Content-Type", contentType);
    if (contentLength) headers.set("Content-Length", contentLength);
    if (lastModified) headers.set("Last-Modified", lastModified);
    if (etag) headers.set("ETag", etag);

    headers.set("Cache-Control", "public, max-age=86400, stale-while-revalidate=604800");
    headers.set("X-Content-Type-Options", "nosniff");

    if (request.method === "HEAD") {
      return new NextResponse(null, { status: 200, headers });
    }

    return new NextResponse(upstream.body, {
      status: 200,
      headers,
    });
  } catch {
    return NextResponse.json(
      { message: "No fue posible obtener la imagen." },
      { status: 502 },
    );
  }
}

export const GET = proxyImage;
export const HEAD = proxyImage;
