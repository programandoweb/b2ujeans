import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Gaspronal | Equipos industriales y soluciones a gas",
    template: "%s | Gaspronal",
  },
  description:
    "Fabricación de equipos industriales en acero inoxidable, redes de gas, extracción industrial, mantenimiento y soluciones especiales a medida.",
  openGraph: {
    title: "Gaspronal | Equipos industriales y soluciones a gas",
    description:
      "Fabricación, instalación y servicio técnico para cocinas profesionales, industria de alimentos, redes de gas y extracción.",
    siteName: "Gaspronal",
    locale: "es_CO",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
