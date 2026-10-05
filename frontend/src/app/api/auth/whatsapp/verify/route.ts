import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend";

export async function POST(request: Request) {
  const payload = await request.json();
  const response = await backendFetch("/auth/whatsapp/verify", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    return NextResponse.json(data, { status: response.status });
  }

  const nextResponse = NextResponse.json({ ok: true });
  nextResponse.cookies.set("gaspronal_access_token", data.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: data.expires_in,
  });

  return nextResponse;
}
