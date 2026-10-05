"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { useMemo, useRef } from "react";

export type UseCaseProduct = {
  id: number;
  name: string;
  slug: string;
  reference?: string | null;
  short_description?: string | null;
  description?: string | null;
  applications?: string | string[] | null;
  og_image?: string | null;
  gallery?: string[] | null;
  category?: {
    id: number;
    name: string;
    slug: string;
  } | null;
};

function imageFor(product: UseCaseProduct) {
  return product.og_image || product.gallery?.[0] || null;
}

function useCaseText(product: UseCaseProduct) {
  if (Array.isArray(product.applications)) {
    const first = product.applications.find(Boolean);
    if (first) return String(first);
  }

  if (typeof product.applications === "string" && product.applications.trim()) {
    return product.applications
      .split(/\r?\n|•|;/)
      .map((item) => item.trim())
      .find(Boolean) ?? product.applications.trim();
  }

  return product.short_description || product.description || "Solución para operación industrial y producción de alimentos.";
}

export default function ProductUseCasesCarousel({
  products,
}: {
  products: UseCaseProduct[];
}) {
  const trackRef = useRef<HTMLDivElement>(null);

  const items = useMemo(() => products.filter((product) => imageFor(product)).slice(0, 8), [products]);

  function move(direction: "prev" | "next") {
    const track = trackRef.current;
    if (!track) return;

    const amount = Math.max(track.clientWidth * 0.82, 320);
    track.scrollBy({
      left: direction === "next" ? amount : -amount,
      behavior: "smooth",
    });
  }

  if (items.length < 4) return null;

  return (
    <section className="overflow-hidden bg-[#0d2b40] py-20 text-white sm:py-24">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#ff9a5b]">
              Casos de uso
            </p>
            <h2 className="mt-4 max-w-4xl text-4xl font-black tracking-[-0.05em] sm:text-6xl">
              Equipos Gaspronal en escenarios reales de operación.
            </h2>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => move("prev")}
              className="grid size-12 place-items-center rounded-full border border-white/15 bg-white/5 transition hover:bg-white/10"
              aria-label="Caso anterior"
            >
              <ArrowLeft size={20} />
            </button>
            <button
              type="button"
              onClick={() => move("next")}
              className="grid size-12 place-items-center rounded-full border border-white/15 bg-white/5 transition hover:bg-white/10"
              aria-label="Caso siguiente"
            >
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </div>

      <div
        ref={trackRef}
        className="mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-3 [scrollbar-width:none] sm:px-6 lg:px-10 [&::-webkit-scrollbar]:hidden"
      >
        {items.map((product, index) => {
          const image = imageFor(product);
          if (!image) return null;

          return (
            <article
              key={product.id}
              className="group relative min-h-[520px] w-[88vw] shrink-0 snap-start overflow-hidden rounded-[2rem] border border-white/10 bg-[#15364d] sm:w-[68vw] lg:w-[44vw] xl:w-[36vw]"
            >
              <img
                src={image}
                alt={product.name}
                loading={index < 2 ? "eager" : "lazy"}
                className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.035]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/38 to-black/10" />

              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                {product.category ? (
                  <span className="inline-flex rounded-full border border-white/20 bg-black/20 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.12em] text-white/85 backdrop-blur">
                    {product.category.name}
                  </span>
                ) : null}

                {product.reference ? (
                  <p className="mt-5 text-xs font-black uppercase tracking-[0.14em] text-[#ff9a5b]">
                    {product.reference}
                  </p>
                ) : null}

                <h3 className="mt-2 max-w-xl text-3xl font-black leading-[1] tracking-[-0.04em] sm:text-4xl">
                  {product.name}
                </h3>

                <div className="mt-5 flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 shrink-0 text-[#ff9a5b]" size={19} />
                  <p className="line-clamp-3 max-w-xl text-sm leading-6 text-white/80 sm:text-base">
                    {useCaseText(product)}
                  </p>
                </div>

                <Link
                  href={`/productos/${product.slug}`}
                  className="mt-6 inline-flex items-center gap-2 text-sm font-black text-white transition group-hover:gap-3"
                >
                  Ver solución
                  <ArrowRight size={17} />
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
