import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Instagram, MapPin, ShieldCheck, ShoppingBag, Truck } from "lucide-react";
import PublicHeader from "@/components/public/PublicHeader";
import ManagedHero from "@/components/public/ManagedHero";
import { GASPRONAL_WHATSAPP_HREF } from "@/lib/public-contact";
import { getManagedHero } from "@/lib/public-hero";

type Product = {
  id: number;
  name: string;
  slug: string;
  reference?: string | null;
  short_description?: string | null;
  og_image?: string | null;
  gallery?: string[] | null;
  category?: { id: number; name: string; slug: string } | null;
};

type Category = {
  id: number;
  name: string;
  slug: string;
  products_count?: number;
};

const backendUrl = process.env.LARAVEL_API_URL ?? "http://127.0.0.1:8000";

export const metadata: Metadata = {
  title: "B2U Jeans | Nueva Colección",
  description:
    "Explora el universo B2U Jeans: nueva colección, denim femenino y estilos pensados para acompañarte todos los días.",
};

async function getStorefront() {
  try {
    const [productsResponse, categoriesResponse] = await Promise.all([
      fetch(`${backendUrl}/api/v1/catalog/public/items?per_page=8&page=1`, {
        next: { revalidate: 300 },
        headers: { Accept: "application/json" },
      }),
      fetch(`${backendUrl}/api/v1/catalog/public/categories`, {
        next: { revalidate: 300 },
        headers: { Accept: "application/json" },
      }),
    ]);

    const productsPayload = productsResponse.ok ? await productsResponse.json() : { data: [] };
    const categoriesPayload = categoriesResponse.ok ? await categoriesResponse.json() : { data: [] };

    return {
      products: (productsPayload.data ?? []) as Product[],
      categories: (categoriesPayload.data ?? []) as Category[],
    };
  } catch {
    return { products: [] as Product[], categories: [] as Category[] };
  }
}

function productImage(product: Product) {
  return product.og_image || product.gallery?.[0] || null;
}

export default async function HomePage() {
  const [{ products, categories }, heroSlides] = await Promise.all([
    getStorefront(),
    getManagedHero("home.hero"),
  ]);

  return (
    <main className="min-h-screen bg-white text-black">
      <div className="bg-[#d8c2ad] px-4 py-2.5 text-center text-[11px] font-semibold uppercase tracking-[.18em] text-[#29221e]">
        B2U JEANS  ·  DESCUBRE TU PRÓXIMO LOOK  ·  ENVÍOS NACIONALES
      </div>

      <PublicHeader whatsappHref={GASPRONAL_WHATSAPP_HREF} />

      {heroSlides.length ? <ManagedHero slides={heroSlides} /> : (
      <section className="relative min-h-[68vh] overflow-hidden bg-neutral-900 lg:min-h-[76vh]">
        <img
          src="https://www.b2ujean.com/wp-content/uploads/2026/03/Gemini_Generated_Image_kil2xzkil2xzkil2-scaled-1-1024x576.jpg"
          alt="Tienda B2U Jeans"
          className="absolute inset-0 h-full w-full object-cover object-center opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/20 to-transparent" />
        <div className="relative mx-auto flex min-h-[68vh] max-w-[1480px] items-end px-5 pb-14 pt-28 sm:px-8 lg:min-h-[76vh] lg:px-12 lg:pb-20">
          <div className="max-w-2xl text-white">
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[.26em]">B2U Jeans · 2026</p>
            <h1 className="b2u-serif text-5xl leading-[.94] tracking-[-.045em] sm:text-7xl lg:text-[92px]">
              Nueva<br />Colección
            </h1>
            <p className="mt-6 max-w-md text-sm leading-6 text-white/80 sm:text-base">
              Denim contemporáneo, siluetas femeninas y piezas hechas para acompañarte todos los días.
            </p>
            <Link
              href="/productos"
              className="mt-8 inline-flex min-h-12 items-center gap-3 bg-white px-6 text-[12px] font-bold uppercase tracking-[.14em] text-black transition hover:bg-neutral-200"
            >
              Descubrir colección <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
      )}


      <section className="bg-[#faf6f2] px-4 py-16 text-center sm:py-24">
        <p className="text-[11px] font-semibold uppercase tracking-[.3em] text-[#8e6f61]">B2U Jeans · Style edit</p>
        <h2 className="b2u-serif mx-auto mt-4 max-w-3xl text-4xl leading-tight tracking-tight text-[#332a29] sm:text-6xl">Tu outfit perfecto comienza aquí.</h2>
        <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-[#75655d]">Descubre siluetas, tendencias y prendas que expresan tu personalidad. Una selección de denim para cada momento.</p>
        <Link href="/productos" className="mt-8 inline-flex items-center gap-3 rounded-full bg-[#332a29] px-8 py-4 text-xs font-bold uppercase tracking-[.15em] text-white transition hover:bg-[#805d50]">Comprar la colección <ArrowRight size={16}/></Link>
      </section>

      <section className="mx-auto grid max-w-[1480px] gap-4 px-4 py-12 sm:grid-cols-3 sm:px-6 lg:px-10">
        {[
          { title: "Mom Jeans", subtitle: "El clásico que vuelve", href: "/productos", image: "https://www.b2ujean.com/wp-content/uploads/2026/03/Gemini_Generated_Image_yuh0d4yuh0d4yuh0-1.jpg" },
          { title: "Nueva colección", subtitle: "Looks para inspirarte", href: "/productos", image: "https://www.b2ujean.com/wp-content/uploads/2026/03/Gemini_Generated_Image_kil2xzkil2xzkil2-scaled-1-1024x576.jpg" },
          { title: "Denim B2U", subtitle: "Encuentra tu fit", href: "/productos", image: "https://www.b2ujean.com/wp-content/uploads/2026/03/Gemini_Generated_Image_yuh0d4yuh0d4yuh0-1.jpg" },
        ].map((item) => (
          <Link key={item.title} href={item.href} className="group relative block min-h-[420px] overflow-hidden bg-[#eee2da] sm:min-h-[490px]">
            <img src={item.image} alt={item.title} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"/>
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"/>
            <div className="absolute bottom-0 left-0 p-7 text-white"><p className="text-[10px] uppercase tracking-[.2em]">{item.subtitle}</p><h3 className="b2u-serif mt-2 text-4xl">{item.title}</h3><span className="mt-5 inline-flex items-center gap-2 border-b border-white pb-1 text-xs uppercase tracking-widest">Explorar <ArrowRight size={14}/></span></div>
          </Link>
        ))}
      </section>
      <section className="border-b border-[#e6d9ce] bg-[#faf6f2]">
        <div className="mx-auto grid max-w-[1480px] grid-cols-2 lg:grid-cols-4">
          {[
            ["Mom Jeans", "Clásicos de B2U"],
            ["Wide Leg", "Volumen y caída"],
            ["Flared Jeans", "Silueta icónica"],
            ["Cargo Jeans", "Actitud urbana"],
          ].map(([name, detail], index) => (
            <Link
              key={name}
              href="/productos"
              className={`group border-black/10 px-5 py-8 transition hover:bg-neutral-50 sm:px-8 ${index < 3 ? "border-r" : ""}`}
            >
              <span className="block text-[11px] font-semibold uppercase tracking-[.16em] text-neutral-500">{detail}</span>
              <span className="mt-2 flex items-center justify-between text-xl font-semibold tracking-[-.03em]">
                {name} <ArrowRight size={17} className="transition group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1480px] px-4 py-16 sm:px-6 lg:px-10 lg:py-24">
        <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[.22em] text-neutral-500">Elige tu estilo</p>
            <h2 className="b2u-serif mt-3 text-4xl tracking-[-.04em] sm:text-5xl">Lo más nuevo</h2>
          </div>
          <Link href="/productos" className="inline-flex items-center gap-2 text-[12px] font-bold uppercase tracking-[.14em]">
            Ver todo <ArrowRight size={15} />
          </Link>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-2 gap-x-3 gap-y-9 sm:gap-x-5 lg:grid-cols-4">
            {products.slice(0, 8).map((product) => {
              const image = productImage(product);
              return (
                <article key={product.id} className="group">
                  <Link href={`/productos/${product.slug}`} className="block">
                    <div className="relative overflow-hidden rounded-t-[90px] bg-[#f2eae4]">
                      {image ? (
                        <img
                          src={image}
                          alt={product.name}
                          className="b2u-product-image h-full w-full object-cover transition duration-500 group-hover:scale-[1.045]"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex aspect-[3/4] items-center justify-center text-neutral-400">
                          <ShoppingBag size={44} strokeWidth={1.2} />
                        </div>
                      )}
                      <span className="absolute left-3 top-3 rounded-full bg-white px-3 py-1.5 text-[9px] font-bold uppercase tracking-[.14em]">
                        Nuevo
                      </span>
                    </div>
                    <div className="pt-4">
                      {product.category ? (
                        <p className="text-[10px] font-semibold uppercase tracking-[.13em] text-neutral-500">{product.category.name}</p>
                      ) : null}
                      <h3 className="mt-1 text-sm font-semibold uppercase tracking-[.035em] sm:text-base">{product.name}</h3>
                      <span className="mt-2 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[.12em] text-neutral-600">
                        Ver producto <ArrowRight size={13} />
                      </span>
                    </div>
                  </Link>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {["Wide Leg", "Flared", "Mom Jeans", "Cargo Jeans"].map((name) => (
              <div key={name} className="aspect-[3/4] bg-[#f2f1ed] p-6">
                <span className="text-xs font-semibold uppercase tracking-[.14em]">{name}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section id="b2u" className="grid bg-[#f2e5dd] lg:grid-cols-2">
        <div className="min-h-[440px] lg:min-h-[640px]">
          <img
            src="https://www.b2ujean.com/wp-content/uploads/2026/03/Gemini_Generated_Image_yuh0d4yuh0d4yuh0-1.jpg"
            alt="B2U Jeans"
            className="h-full w-full object-cover"
          />
        </div>
        <div className="flex items-center px-6 py-14 sm:px-10 lg:px-16">
          <div className="max-w-xl">
            <p className="text-[11px] font-semibold uppercase tracking-[.22em] text-neutral-500">Desde Venezuela</p>
            <h2 className="b2u-serif mt-4 text-4xl leading-[1.02] tracking-[-.04em] sm:text-6xl">
              La prenda perfecta para la mujer venezolana.
            </h2>
            <p className="mt-6 text-base leading-7 text-neutral-600">
              B2U Jeans nació en 2015 con una idea clara: crear denim con identidad propia, calidad y siluetas que conectan con la mujer actual.
            </p>
            <Link href="/productos" className="mt-8 inline-flex items-center gap-3 border-b border-black pb-1 text-[12px] font-bold uppercase tracking-[.14em]">
              Explorar B2U <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {categories.length > 0 ? (
        <section className="mx-auto max-w-[1480px] px-4 py-16 sm:px-6 lg:px-10 lg:py-24">
          <p className="text-center text-[11px] font-semibold uppercase tracking-[.22em] text-neutral-500">Explora por categoría</p>
          <div className="mt-8 flex flex-wrap justify-center gap-x-8 gap-y-4">
            {categories.slice(0, 12).map((category) => (
              <Link
                key={category.id}
                href={`/productos/categoria/${category.slug}`}
                className="b2u-serif text-2xl tracking-[-.03em] transition hover:opacity-45 sm:text-3xl"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="border-y border-[#e6d9ce] bg-[#faf6f2]">
        <div className="mx-auto grid max-w-[1480px] divide-y divide-black/10 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {[
            [Truck, "Envío seguro", "Tus compras en buenas manos."],
            [ShieldCheck, "Compras seguras", "Atención directa y confiable."],
            [ShoppingBag, "Calidad B2U", "Denim pensado para ti."],
          ].map(([Icon, title, text]) => {
            const FeatureIcon = Icon as typeof Truck;
            return (
              <div key={String(title)} className="px-6 py-10 text-center">
                <FeatureIcon className="mx-auto" size={24} strokeWidth={1.5} />
                <h3 className="mt-4 text-[12px] font-bold uppercase tracking-[.15em]">{String(title)}</h3>
                <p className="mt-2 text-sm text-neutral-500">{String(text)}</p>
              </div>
            );
          })}
        </div>
      </section>

      <footer id="contacto" className="bg-[#332a29] text-white">
        <div className="mx-auto grid max-w-[1480px] gap-10 px-5 py-14 sm:px-8 lg:grid-cols-[1fr_.8fr_.8fr] lg:px-10">
          <div>
            <img src="/b2u/logo-b2u.svg" alt="B2U Jeans" className="w-[150px] invert" />
            <p className="mt-5 max-w-sm text-sm leading-6 text-white/60">
              Tienda en línea B2U Jeans. Denim hecho para ti.
            </p>
          </div>
          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-[.18em]">Contacto</h3>
            <div className="mt-5 space-y-3 text-sm text-white/65">
              <p className="flex gap-2"><MapPin size={17} className="mt-0.5 shrink-0" /> Caracas, Venezuela</p>
              <a href={GASPRONAL_WHATSAPP_HREF} target="_blank" rel="noreferrer" className="block hover:text-white">
                Atención por WhatsApp
              </a>
            </div>
          </div>
          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-[.18em]">Síguenos</h3>
            <a href="https://www.instagram.com/" target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 text-sm text-white/65 hover:text-white">
              <Instagram size={18} /> Instagram
            </a>
          </div>
        </div>
        <div className="border-t border-white/10 px-5 py-5 text-center text-[10px] uppercase tracking-[.14em] text-white/40">
          B2U Jeans · Automatización y experiencia digital
        </div>
      </footer>
    </main>
  );
}
