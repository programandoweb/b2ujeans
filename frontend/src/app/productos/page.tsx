import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Search, ShoppingBag } from "lucide-react";
import ManagedHero from "@/components/public/ManagedHero";
import { getManagedHero } from "@/lib/public-hero";
import AddToCartButton from "@/components/public/AddToCartButton";

export const metadata: Metadata = {
  title: "Nueva Colección",
  description:
    "Descubre la colección B2U Jeans y explora los estilos disponibles por categoría.",
  alternates:{canonical:"/productos"},
  robots:{index:true,follow:true},
  openGraph:{title:"Nueva colección | B2U Jeans",description:"Descubre el denim femenino y las últimas colecciones B2U Jeans.",url:"/productos",siteName:"B2U Jeans",locale:"es_VE",type:"website",images:[{url:"/opengraph-image",width:1200,height:630,alt:"B2U Jeans · Nueva colección"}]},
  twitter:{card:"summary_large_image",images:["/opengraph-image"]},
};

type Category = {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  products_count: number;
};

type Product = {
  id: number;
  commercial_price?: string | number | null;
  price_currency?: string | null;
  name: string;
  slug: string;
  reference?: string | null;
  short_description?: string | null;
  og_image?: string | null;
  gallery?: string[] | null;
  category?: {
    id: number;
    name: string;
    slug: string;
  } | null;
};

type PaginatedProducts = {
  data: Product[];
  current_page: number;
  last_page: number;
  total: number;
};

const backendUrl = process.env.LARAVEL_API_URL ?? "http://127.0.0.1:8000";

async function getCatalog(category?: string, search?: string, page = 1) {
  const productParams = new URLSearchParams({
    per_page: "24",
    page: String(page),
  });

  if (category) productParams.set("category", category);
  if (search) productParams.set("search", search);

  const [productsResponse, categoriesResponse] = await Promise.all([
    fetch(`${backendUrl}/api/v1/catalog/public/items?${productParams.toString()}`, {
      next: { revalidate: 300 },
      headers: { Accept: "application/json" },
    }),
    fetch(`${backendUrl}/api/v1/catalog/public/categories`, {
      next: { revalidate: 300 },
      headers: { Accept: "application/json" },
    }),
  ]);

  const products: PaginatedProducts = productsResponse.ok
    ? await productsResponse.json()
    : { data: [], current_page: 1, last_page: 1, total: 0 };

  const categoriesPayload = categoriesResponse.ok
    ? await categoriesResponse.json()
    : { data: [] };

  return {
    products,
    categories: (categoriesPayload.data ?? []) as Category[],
  };
}

function productImage(product: Product) {
  return product.og_image || product.gallery?.[0] || null;
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string; buscar?: string; pagina?: string }>;
}) {
  const params = await searchParams;
  const category = params.categoria?.trim() || undefined;
  const search = params.buscar?.trim() || undefined;
  const page = Math.max(Number(params.pagina || "1") || 1, 1);
  const [{ products, categories }, heroSlides] = await Promise.all([
    getCatalog(category, search, page),
    getManagedHero("productos.hero"),
  ]);

  return (
    <main className="min-h-screen bg-white text-black">
      <header className="border-b border-black/10 bg-white">
        <div className="mx-auto flex min-h-[96px] max-w-[1480px] items-center justify-between px-4 sm:px-6 lg:px-10">
          <Link href="/" aria-label="B2U Jeans - Inicio">
            <img src="/b2u/logo-b2u.svg" alt="B2U Jeans" className="w-[145px]" />
          </Link>
          <Link href="/" className="text-[11px] font-bold uppercase tracking-[.14em]">Inicio</Link>
        </div>
      </header>

      {heroSlides.length ? <ManagedHero slides={heroSlides} /> : (
      <section className="border-b border-black/10 bg-[#f3f2ee]">
        <div className="mx-auto max-w-[1480px] px-4 py-14 sm:px-6 sm:py-20 lg:px-10">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--accent)]">
            B2U Jeans
          </p>
          <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <h1 className="max-w-4xl text-4xl font-black tracking-[-0.05em] text-black sm:text-6xl">
                Nuestra Nueva Colección
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
                Explora los estilos B2U por categoría, referencia o colección.
              </p>
            </div>
            <div className="inline-flex w-fit items-center gap-2 border border-black/15 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[.1em]">
              <ShoppingBag size={16} />
              {products.total} productos publicados
            </div>
          </div>

          <form action="/productos" className="mt-9 flex max-w-3xl flex-col gap-3 sm:flex-row">
            {category ? <input type="hidden" name="categoria" value={category} /> : null}
            <label className="relative min-w-0 flex-1">
              <Search
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="search"
                name="buscar"
                defaultValue={search}
                placeholder="Buscar por nombre, referencia o categoría..."
                className="min-h-12 w-full border border-black/20 bg-white pl-11 pr-4 text-sm outline-none transition focus:border-black"
              />
            </label>
            <button
              type="submit"
              className="min-h-12 bg-black px-7 text-[11px] font-bold uppercase tracking-[.14em] text-white transition hover:bg-neutral-800"
            >
              Buscar
            </button>
          </form>
        </div>
      </section>
      )}

      <section className="mx-auto max-w-[1480px] px-4 py-8 sm:px-6 lg:px-10">
        <div className="flex gap-2 overflow-x-auto pb-2">
          <Link
            href="/productos"
            className={
              "whitespace-nowrap border-b border-transparent px-1 py-2 text-[11px] font-bold uppercase tracking-[.12em] transition " +
              (!category
                ? "border-black text-black"
                : "border-transparent text-neutral-500 hover:border-black hover:text-black")
            }
          >
            Todos
          </Link>
          {categories.map((item) => (
            <Link
              key={item.id}
              href={`/productos/categoria/${item.slug}`}
              className={
                "inline-flex whitespace-nowrap border-b border-transparent px-1 py-2 text-[11px] font-bold uppercase tracking-[.12em] transition " +
                (category === item.slug
                  ? "border-black text-black"
                  : "border-transparent text-neutral-500 hover:border-black hover:text-black")
              }
            >
              {item.name}
              <span className="ml-2 opacity-60">{item.products_count}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1480px] px-4 pb-20 sm:px-6 lg:px-10">
        {products.data.length > 0 ? (
          <>
            <div className="grid grid-cols-2 gap-x-3 gap-y-9 sm:gap-x-5 lg:grid-cols-4">
              {products.data.map((product) => {
                const image = productImage(product);

                return (
                  <article
                    key={product.id}
                    className="group bg-white"
                  >
                    <div className="relative aspect-[3/4] overflow-hidden bg-[#f2f1ed]">
                      {image ? (
                        <img
                          src={image}
                          alt={product.name}
                          loading="lazy"
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.025]"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-neutral-400"><ShoppingBag size={44} strokeWidth={1.2} /></div>
                      )}
                    </div>

                    <div className="pt-4">
                      {product.reference ? (
                        <p className="text-[10px] font-semibold uppercase tracking-[.12em] text-neutral-500">
                          {product.reference}
                        </p>
                      ) : null}
                      <h2 className="mt-1 text-sm font-semibold uppercase tracking-[.035em] sm:text-base">
                        {product.name}
                      </h2>

                      <Link
                        href={`/productos/${product.slug}`}
                        className="mt-2 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[.12em] text-neutral-600 transition group-hover:gap-3"
                      >
                        Ver producto
                        <ArrowRight size={16} />
                      </Link>
                      <div className="mt-3"><AddToCartButton product={{ id: product.id, name: product.name, slug: product.slug, image: image, price: product.commercial_price, currency: product.price_currency || "COP" }} /></div>
                    </div>
                  </article>
                );
              })}
            </div>

            {products.last_page > 1 ? (
              <nav className="mt-10 flex items-center justify-center gap-3" aria-label="Paginación">
                {products.current_page > 1 ? (
                  <Link
                    href={`/productos?${new URLSearchParams({
                      ...(category ? { categoria: category } : {}),
                      ...(search ? { buscar: search } : {}),
                      pagina: String(products.current_page - 1),
                    }).toString()}`}
                    className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700"
                  >
                    Anterior
                  </Link>
                ) : null}
                <span className="text-sm font-semibold text-slate-500">
                  Página {products.current_page} de {products.last_page}
                </span>
                {products.current_page < products.last_page ? (
                  <Link
                    href={`/productos?${new URLSearchParams({
                      ...(category ? { categoria: category } : {}),
                      ...(search ? { buscar: search } : {}),
                      pagina: String(products.current_page + 1),
                    }).toString()}`}
                    className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700"
                  >
                    Siguiente
                  </Link>
                ) : null}
              </nav>
            ) : null}
          </>
        ) : (
          <div className="border border-black/10 bg-white px-6 py-16 text-center">
            <ShoppingBag size={40} className="mx-auto text-neutral-400" />
            <h2 className="mt-5 text-2xl font-black text-black">No encontramos productos B2U</h2>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-600">
              Prueba otra búsqueda o elimina el filtro de categoría.
            </p>
            <Link
              href="/productos"
              className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-black px-5 text-sm font-bold text-white"
            >
              Ver todo el catálogo
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
