import { NextRequest, NextResponse } from "next/server";

const backendUrl = process.env.LARAVEL_API_URL ?? "http://127.0.0.1:8000";

export async function proxy(request: NextRequest) {
  try {
    const response = await fetch(
      `${backendUrl}/api/v1/seo/redirects/resolve?path=${encodeURIComponent(request.nextUrl.pathname)}`,
      { headers: { Accept: "application/json" }, cache: "no-store" },
    );

    if (response.ok) {
      const payload = await response.json();
      const redirect = payload?.data;

      if (redirect?.target_path) {
        const destination = new URL(redirect.target_path, request.url);
        return NextResponse.redirect(destination, redirect.status_code ?? 301);
      }
    }
  } catch {
    // Redirect lookup must never take the public website down.
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/2019/:path*"],
};
