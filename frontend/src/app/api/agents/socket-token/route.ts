import { NextResponse } from "next/server";
import { authenticatedUser, createSocketToken } from "@/lib/agents-server";

export async function GET() {
  const auth = await authenticatedUser();
  if (!auth) return NextResponse.json({ message: "No autenticado." }, { status: 401 });

  try {
    return NextResponse.json({
      token: createSocketToken(String(auth.user.id)),
      realtime_url: process.env.NEXT_PUBLIC_REALTIME_URL ?? "",
      expires_in: 300,
    });
  } catch (error) {
    return NextResponse.json({
      message: error instanceof Error ? error.message : "No fue posible generar el token Socket.IO.",
    }, { status: 503 });
  }
}
