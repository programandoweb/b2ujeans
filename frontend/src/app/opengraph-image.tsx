import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "B2U Jeans — Denim hecho para ti · Nueva colección";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: "#efe3da", color: "#2d2524", overflow: "hidden", fontFamily: "sans-serif" }}>
        <div style={{ position: "absolute", right: -100, top: -160, width: 710, height: 940, borderRadius: "48%", background: "#cfac96", transform: "rotate(-20deg)" }} />
        <div style={{ position: "absolute", right: 20, top: 95, width: 460, height: 440, border: "3px solid #f9eee8", borderRadius: "50%" }} />
        <div style={{ position: "absolute", left: 75, top: 66, fontSize: 31, fontWeight: 800, letterSpacing: 9 }}>B2U JEANS</div>
        <div style={{ position: "absolute", left: 74, top: 207, display: "flex", flexDirection: "column", maxWidth: 775 }}>
          <div style={{ fontSize: 94, fontWeight: 800, letterSpacing: -5, lineHeight: 1.01 }}>Denim hecho</div>
          <div style={{ fontSize: 94, fontWeight: 800, letterSpacing: -5, lineHeight: 1.01 }}>para ti.</div>
          <div style={{ marginTop: 30, fontSize: 27, color: "#654c43", letterSpacing: 1 }}>NUEVA COLECCIÓN · MODA FEMENINA</div>
        </div>
        <div style={{ position: "absolute", bottom: 44, left: 76, fontSize: 21, letterSpacing: 3 }}>DESCUBRE TU PRÓXIMO LOOK</div>
      </div>
    ),
    { ...size },
  );
}
