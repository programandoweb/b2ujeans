import { createHmac, timingSafeEqual } from "node:crypto";

type SocketTokenPayload = { sub: string; exp: number };

export function verifySocketToken(token: string, secret: string): SocketTokenPayload {
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) throw new Error("Token Socket.IO inválido.");

  const expected = createHmac("sha256", secret).update(encoded).digest("base64url");
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) throw new Error("Token Socket.IO inválido.");

  const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as SocketTokenPayload;
  if (!payload.sub || !payload.exp || payload.exp < Math.floor(Date.now() / 1000)) {
    throw new Error("Token Socket.IO expirado.");
  }

  return payload;
}
