import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const base = process.env.LARAVEL_API_URL ?? "http://127.0.0.1:8000";
  const body = await request.text();
  if (body.length > 20000) return NextResponse.json({ message: "Solicitud demasiado grande." }, { status: 413 });
  try {
    const response = await fetch(`${base}/api/v1/cart/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body,
      cache: "no-store",
    });
    return new NextResponse(await response.text(), {
      status: response.status,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    });
  } catch {
    return NextResponse.json({ message: "No fue posible registrar tu solicitud. Intenta nuevamente." }, { status: 503 });
  }
}
