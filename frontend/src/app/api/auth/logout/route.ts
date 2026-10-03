import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend";

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get("gaspronal_access_token")?.value;

  if (token) {
    await backendFetch("/auth/logout", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.delete("gaspronal_access_token");

  return response;
}
