import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const base = process.env.LARAVEL_API_URL ?? "http://127.0.0.1:8000";
  const payload = await request.json().catch(() => ({}));
  const number = typeof payload.number === "string" ? payload.number.trim() : "";
  const email = typeof payload.email === "string" ? payload.email.trim() : "";
  if (!number || !email || number.length > 40 || email.length > 190) {
    return NextResponse.json({ message: "Número y correo electrónico requeridos." }, { status: 422 });
  }
  try {
    const response = await fetch(`${base}/api/v1/cart/status`, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({ number, email }), cache: "no-store",
    });
    return new NextResponse(await response.text(), {
      status: response.status,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    });
  } catch {
    return NextResponse.json({ message: "No se pudo consultar el estado." }, { status: 503 });
  }
}
