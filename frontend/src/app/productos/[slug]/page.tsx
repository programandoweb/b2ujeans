import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Check, MessageCircle, ShoppingBag } from "lucide-react";
import { notFound } from "next/navigation";

type Product = {
  id: number;
  name: string;
  slug: string;
  reference?: string | null;
  short_description?: string | null;
  description?: string | null;
  specifications?: Record<string, unknown> | unknown[] | null;
  gallery?: string[] | null;
  applications?: string | string[] | null;
  og_image?: string | null;
  whatsapp_message?: string | null;
  seo_title?: string | null;
  seo_description?: string | null;
  category?: { id: number; name: string; slug: string } | null;
};

const backendUrl = process.env.LARAVEL_API_URL ?? "http://127.0.0.1:8000";

async function getProduct(slug: string): Promise<Product | null> {
  const response = await fetch(
    `${backendUrl}/api/v1/catalog/public/items/${encodeURIComponent(slug)}`,
    {
      next: { revalidate: 300 },
      headers: { Accept: "application/json" },
    },
  );
  if (!response.ok) return null;
  const payload = await response.json();
  return payload.data ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Producto no encontrado" };

  return {
    title: product.seo_title || product.name,
    description:
      product.seo_description ||
      product.short_description ||
      `Conoce ${product.name} de B2U Jeans.`,
    alternates: { canonical: `/productos/${product.slug}` },
    robots: { index: true, follow: true },
    openGraph: {
      title: product.seo_title || product.name,
      description:
        product.seo_description ||
        product.short_description ||
        `Conoce ${product.name} de B2U Jeans.`,
      images: product.og_image ? [product.og_image] : undefined,
      type: "website",
    },
  };
}

function normalizeApplications(value: Product["applications"]) {
  if (Array.isArray(value)) return value.filter(Boolean).map(String);
  if (typeof value === "string") {
    return value.split(/\r?\n|•|;/).map((item) => item.trim()).filter(Boolean);
  }
  return [];
}

function normalizeSpecs(value: Product["specifications"]) {
  if (!value) return [] as Array<[string, string]>;
  if (Array.isArray(value)) {
    return value.map((item, index) => [`Detalle ${index + 1}`, String(item)] as [string, string]);
  }
  return Object.entries(value).map(([key, val]) => [
    key,
    typeof val === "string" || typeof val === "number" ? String(val) : JSON.stringify(val),
  ] as [string, string]);
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const gallery = Array.from(
    new Set([product.og_image, ...(product.gallery ?? [])].filter(Boolean) as string[]),
  );
  const applications = normalizeApplications(product.applications);
  const specs = normalizeSpecs(product.specifications);
  const whatsappText =
    product.whatsapp_message ||
    `Hola B2U Jeans, quiero información sobre ${product.name}${product.reference ? ` (${product.reference})` : ""}.`;
  const whatsappHref = `https://wa.me/584123694856?text=${encodeURIComponent(whatsappText)}`;

  return (
    <main className="min-h-screen bg-white text-black">
      <header className="border-b border-black/10 bg-white">
        <div className="mx-auto flex min-h-[96px] max-w-[1480px] items-center justify-between px-4 sm:px-6 lg:px-10">
          <Link href="/" aria-label="B2U Jeans - Inicio">
            <img src="/b2u/logo-b2u.svg" alt="B2U Jeans" className="w-[145px]" />
          </Link>
          <Link href="/productos" className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[.14em]">
            <ArrowLeft size={15} /> Nueva colección
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-[1480px] px-4 pt-7 sm:px-6 lg:px-10">
        <nav className="flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-[.12em] text-neutral-500">
          <Link href="/">Inicio</Link><span>/</span>
          <Link href="/productos">Productos</Link>
          {product.category ? (
            <><span>/</span><Link href={`/productos/categoria/${product.category.slug}`}>{product.category.name}</Link></>
          ) : null}
        </nav>
      </div>

      <section className="mx-auto grid max-w-[1480px] gap-10 px-4 py-8 sm:px-6 lg:grid-cols-[1.08fr_.92fr] lg:px-10 lg:py-14">
        <div>
          <div className="overflow-hidden bg-[#f2f1ed]">
            {gallery[0] ? (
              <img src={gallery[0]} alt={product.name} className="aspect-[3/4] h-full w-full object-cover" />
            ) : (
              <div className="flex aspect-[3/4] items-center justify-center text-neutral-400">
                <ShoppingBag size={60} strokeWidth={1.1} />
              </div>
            )}
          </div>

          {gallery.length > 1 ? (
            <div className="mt-3 grid grid-cols-4 gap-3">
              {gallery.slice(1, 5).map((image) => (
                <div key={image} className="overflow-hidden bg-[#f2f1ed]">
                  <img src={image} alt="" className="aspect-[3/4] h-full w-full object-cover" loading="lazy" />
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div className="lg:sticky lg:top-28 lg:self-start lg:py-5">
          {product.category ? (
            <Link
              href={`/productos/categoria/${product.category.slug}`}
              className="text-[10px] font-semibold uppercase tracking-[.16em] text-neutral-500"
            >
              {product.category.name}
            </Link>
          ) : null}

          <h1 className="b2u-serif mt-3 text-4xl leading-[.98] tracking-[-.045em] sm:text-6xl">
            {product.name}
          </h1>

          {product.reference ? (
            <p className="mt-4 text-[11px] font-semibold uppercase tracking-[.14em] text-neutral-500">
              Ref. {product.reference}
            </p>
          ) : null}

          {product.short_description ? (
            <p className="mt-6 max-w-xl text-base leading-7 text-neutral-600">{product.short_description}</p>
          ) : null}

          <div className="mt-8 border-y border-black/10 py-6">
            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="flex min-h-13 w-full items-center justify-center gap-3 bg-black px-6 text-[11px] font-bold uppercase tracking-[.14em] text-white transition hover:bg-neutral-800"
            >
              <MessageCircle size={17} />
              Consultar por WhatsApp
            </a>
          </div>

          {applications.length > 0 ? (
            <div className="mt-8">
              <h2 className="text-[11px] font-bold uppercase tracking-[.16em]">Detalles</h2>
              <div className="mt-4 grid gap-3">
                {applications.map((item) => (
                  <div key={item} className="flex items-start gap-3 text-sm leading-6 text-neutral-600">
                    <Check size={15} className="mt-1 shrink-0" /> {item}
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {product.description ? (
        <section className="border-t border-black/10 bg-[#f3f2ee]">
          <div className="mx-auto max-w-[1480px] px-4 py-14 sm:px-6 lg:px-10 lg:py-20">
            <div className="max-w-4xl">
              <p className="text-[11px] font-bold uppercase tracking-[.16em] text-neutral-500">Descripción</p>
              <div className="mt-5 whitespace-pre-line text-base leading-8 text-neutral-700">{product.description}</div>
            </div>
          </div>
        </section>
      ) : null}

      {specs.length > 0 ? (
        <section className="border-t border-black/10 bg-white">
          <div className="mx-auto max-w-[1480px] px-4 py-14 sm:px-6 lg:px-10 lg:py-20">
            <h2 className="b2u-serif text-3xl tracking-[-.035em]">Características</h2>
            <div className="mt-7 max-w-4xl border-t border-black/10">
              {specs.map(([label, value], index) => (
                <div key={`${label}-${index}`} className="grid gap-2 border-b border-black/10 py-4 sm:grid-cols-[.35fr_.65fr]">
                  <strong className="text-[11px] uppercase tracking-[.1em]">{label}</strong>
                  <span className="text-sm leading-6 text-neutral-600">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}
