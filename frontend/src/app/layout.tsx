import type { Metadata, Viewport } from "next";
import { Source_Sans_3 } from "next/font/google";
import PublicWhatsAppButton from "@/components/public/PublicWhatsAppButton";
import "./globals.css";

const b2uFont = Source_Sans_3({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-b2u",
});

export const viewport: Viewport = {
  themeColor: "#111111",
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://demo.pereira.expert"),
  applicationName: "B2U Jeans",
  authors: [{ name: "B2U Jeans" }],
  creator: "B2U Jeans",
  publisher: "B2U Jeans",
  title: {
    default: "B2U Jeans | Denim hecho para ti",
    template: "%s | B2U Jeans",
  },
  description:
    "B2U Jeans. Nueva colección, denim para mujer y catálogo de estilos B2U.",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    title: "B2U Jeans | Denim hecho para ti",
    description: "Descubre la nueva colección y los estilos B2U Jeans.",
    siteName: "B2U Jeans",
    locale: "es_VE",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body className={b2uFont.variable}>
        {children}
        <PublicWhatsAppButton />
      </body>
    </html>
  );
}
