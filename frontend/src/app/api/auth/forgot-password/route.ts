import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/backend";

export async function POST(request: Request) {
  const payload = await request.json();
  const response = await backendFetch("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => ({
    success: false,
    message: "No fue posible procesar la solicitud. Inténtalo nuevamente.",
  }));
  return NextResponse.json(data, { status: response.status });
}
