import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend";

export async function POST(_request: Request, context: { params: Promise<{ user: string }> }) {
  const cookieStore = await cookies();
  const currentToken = cookieStore.get("gaspronal_access_token")?.value;
  const impersonatorToken = cookieStore.get("gaspronal_impersonator_token")?.value;

  if (!currentToken) {
    return NextResponse.json({ message: "No autenticado." }, { status: 401 });
  }

  if (impersonatorToken) {
    return NextResponse.json({ message: "Ya existe una sesión de suplantación activa." }, { status: 409 });
  }

  const { user } = await context.params;
  const response = await backendFetch(`/security/users/${user}/impersonate`, {
    method: "POST",
    headers: { Authorization: `Bearer ${currentToken}` },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    return NextResponse.json(data, { status: response.status });
  }

  const nextResponse = NextResponse.json({ ok: true, user: data.user ?? null });

  nextResponse.cookies.set("gaspronal_impersonator_token", currentToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: data.expires_in,
  });

  nextResponse.cookies.set("gaspronal_access_token", data.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: data.expires_in,
  });

  return nextResponse;
}
