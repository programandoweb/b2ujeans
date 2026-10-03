import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend";

async function accessToken() {
  return (await cookies()).get("gaspronal_access_token")?.value;
}

export async function GET() {
  const token = await accessToken();
  if (!token) return NextResponse.json({ message: "No autenticado." }, { status: 401 });

  const response = await backendFetch("/deployments", {
    headers: { Authorization: `Bearer ${token}` },
  });

  return NextResponse.json(await response.json(), { status: response.status });
}

export async function POST(request: Request) {
  const token = await accessToken();
  if (!token) return NextResponse.json({ message: "No autenticado." }, { status: 401 });

  const body = await request.json().catch(() => ({}));

  const response = await backendFetch("/deployments", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  return NextResponse.json(await response.json(), { status: response.status });
}
