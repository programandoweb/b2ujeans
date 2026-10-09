import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const base = process.env.LARAVEL_API_URL ?? "http://127.0.0.1:8000";
  const number = request.nextUrl.searchParams.get("number")?.trim() || "";
  const email = request.nextUrl.searchParams.get("email")?.trim() || "";
  if (!number || !email || number.length > 40 || email.length > 190) {
    return NextResponse.json({ message: "Número y correo electrónico requeridos." }, { status: 422 });
  }
  try {
    const params = new URLSearchParams({ number, email });
    const response = await fetch(`${base}/api/v1/cart/status?${params}`, {
      headers: { Accept: "application/json" }, cache: "no-store",
    });
    return new NextResponse(await response.text(), {
      status: response.status,
      headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
    });
  } catch {
    return NextResponse.json({ message: "No se pudo consultar el estado." }, { status: 503 });
  }
}
