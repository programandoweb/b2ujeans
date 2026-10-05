import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  const cookieStore = await cookies();
  const impersonatorToken = cookieStore.get("gaspronal_impersonator_token")?.value;

  if (!impersonatorToken) {
    return NextResponse.json({ message: "No hay una suplantación activa." }, { status: 409 });
  }

  const response = NextResponse.json({ ok: true });

  response.cookies.set("gaspronal_access_token", impersonatorToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 120,
  });
  response.cookies.delete("gaspronal_impersonator_token");

  return response;
}
