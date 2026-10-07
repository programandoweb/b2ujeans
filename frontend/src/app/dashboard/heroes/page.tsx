"use client";

import { useEffect, useMemo, useState } from "react";
import { FiEye, FiEyeOff, FiImage, FiMaximize2, FiPlus, FiSave, FiTrash2, FiX } from "react-icons/fi";

type CardItem = { title: string; text: string };
type HeroSlide = {
  id: number;
  section_key: string;
  option: number;
  sort_order: number;
  is_active: boolean;
  interval_ms: number;
  image_url: string;
  background_position: string;
  eyebrow: string | null;
  title: string;
  accent: string | null;
  description: string | null;
  primary_label: string | null;
  primary_href: string | null;
  secondary_label: string | null;
  secondary_href: string | null;
  cards: CardItem[] | null;
};

const sectionPresets = [
  { key: "home.hero", label: "Home / Hero principal" },
  { key: "productos.hero", label: "Productos / Hero" },
  { key: "gaspro-notas.hero", label: "Gaspro-notas / Hero" },
] as const;
const emptyCards: CardItem[] = [
  { title: "Bloque 1", text: "Descripción" },
  { title: "Bloque 2", text: "Descripción" },
  { title: "Bloque 3", text: "Descripción" },
];

export default function HeroesPage() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [activeSection, setActiveSection] = useState("home.hero");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [canManage, setCanManage] = useState(false);
  const [activeSlideId, setActiveSlideId] = useState<number | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const response = await fetch("/api/admin/heroes", { cache: "no-store" });
    const json = await response.json().catch(() => ({}));
    setLoading(false);
    if (!response.ok) {
      setMessage(json.message ?? "No fue posible cargar los heroes.");
      return;
    }
    setSlides(json.data ?? []);
    setCanManage(Boolean(json.meta?.can_manage));
  }

  useEffect(() => {
    void load();
  }, []);

  const visibleSlides = useMemo(
    () => slides
      .filter((slide) => slide.section_key === activeSection && slide.option === 2)
      .sort((a, b) => a.sort_order - b.sort_order),
    [slides, activeSection]
  );

  useEffect(() => {
    if (visibleSlides.length === 0) {
      setActiveSlideId(null);
      return;
    }

    if (!visibleSlides.some((slide) => slide.id === activeSlideId)) {
      setActiveSlideId(visibleSlides[0].id);
    }
  }, [visibleSlides, activeSlideId]);

  const activeSlide = visibleSlides.find((slide) => slide.id === activeSlideId) ?? visibleSlides[0] ?? null;

  function patch(id: number, field: keyof HeroSlide, value: HeroSlide[keyof HeroSlide]) {
    setSlides((current) => current.map((slide) => (slide.id === id ? { ...slide, [field]: value } : slide)));
  }

  function patchCard(id: number, index: number, field: keyof CardItem, value: string) {
    setSlides((current) =>
      current.map((slide) => {
        if (slide.id !== id) return slide;
        const cards = [...(slide.cards ?? emptyCards)].slice(0, 3);
        while (cards.length < 3) cards.push({ title: "", text: "" });
        cards[index] = { ...cards[index], [field]: value };
        return { ...slide, cards };
      })
    );
  }

  async function save(slide: HeroSlide) {
    setBusyId(slide.id);
    setMessage("");
    const response = await fetch(`/api/admin/heroes/${slide.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(slide),
    });
    const json = await response.json().catch(() => ({}));
    setBusyId(null);
    if (!response.ok) {
      setMessage(json.message ?? "No fue posible guardar el slide.");
      return;
    }
    setMessage("Slide guardado correctamente.");
    await load();
  }

  async function createSlide() {
    setMessage("");
    const current = slides.filter((slide) => slide.section_key === activeSection && slide.option === 2);
    const response = await fetch("/api/admin/heroes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        section_key: activeSection,
        option: 2,
        sort_order: current.length,
        is_active: true,
        interval_ms: 3000,
        image_url: "https://www.b2ujean.com/wp-content/uploads/2026/03/Gemini_Generated_Image_kil2xzkil2xzkil2-scaled-1-1024x576.jpg",
        background_position: "center",
        eyebrow: "B2U Jeans",
        title: "Nueva colección",
        accent: "B2U.",
        description: "Edita el contenido de este nuevo slide.",
        primary_label: "Ver productos",
        primary_href: "/productos",
        secondary_label: "Inicio",
        secondary_href: "/",
        cards: emptyCards,
      }),
    });
    const json = await response.json().catch(() => ({}));
    if (!response.ok) {
      setMessage(json.message ?? "No fue posible crear el slide.");
      return;
    }
    setSlides((currentSlides) => [...currentSlides, json.data]);
    setActiveSlideId(json.data.id);
  }

  async function remove(slide: HeroSlide) {
    if (!confirm(`¿Eliminar el slide "${slide.title}"?`)) return;
    const response = await fetch(`/api/admin/heroes/${slide.id}`, { method: "DELETE" });
    if (!response.ok) {
      const json = await response.json().catch(() => ({}));
      setMessage(json.message ?? "No fue posible eliminar el slide.");
      return;
    }
    setSlides((current) => current.filter((item) => item.id !== slide.id));
    if (activeSlideId === slide.id) setActiveSlideId(null);
  }

  async function uploadImage(slide: HeroSlide, file: File) {
    setBusyId(slide.id);
    const form = new FormData();
    form.append("image", file);
    const response = await fetch(`/api/admin/heroes/${slide.id}/image`, { method: "POST", body: form });
    const json = await response.json().catch(() => ({}));
    setBusyId(null);
    if (!response.ok) {
      setMessage(json.message ?? "No fue posible subir la imagen.");
      return;
    }
    setSlides((current) => current.map((item) => (item.id === slide.id ? json.data : item)));
    setMessage("Imagen actualizada.");
  }

  return (
    <div className="w-full max-w-none space-y-6">
      <header className="flex flex-col gap-4 border-b border-[var(--border)] pb-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--brand)]">Contenido / Constructor visual</span>
          <h1 className="mt-2 text-3xl font-bold">Constructor de heroes</h1>
          <p className="mt-2 max-w-3xl text-sm text-[var(--muted)]">
            Administra los heroes reales de B2U por página. Cada ubicación usa una única configuración activa, sin sistema de propuestas.
          </p>
        </div>
        {canManage && (
          <button
            type="button"
            onClick={() => void createSlide()}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[var(--brand)] px-4 text-sm font-semibold text-white"
          >
            <FiPlus /> Nuevo slide
          </button>
        )}
      </header>

      <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
        <div className="border-b border-[var(--border)] px-4 pt-4">
          <span className="mb-3 block text-xs font-bold uppercase tracking-[0.08em] text-[var(--muted)]">Página</span>
          <div className="flex gap-1 overflow-x-auto">
            {sectionPresets.map((section) => (
              <button
                key={section.key}
                type="button"
                onClick={() => {
                  setActiveSection(section.key);
                  setActiveSlideId(null);
                }}
                className={
                  "whitespace-nowrap border-b-2 px-4 pb-3 pt-1 text-sm font-semibold transition " +
                  (activeSection === section.key
                    ? "border-[var(--brand)] text-[var(--brand)]"
                    : "border-transparent text-[var(--muted)] hover:text-[var(--app-fg)]")
                }
              >
                {section.label}
              </button>
            ))}
          </div>
        </div>

        {visibleSlides.length > 0 && (
          <div className="px-4 py-4">
            <span className="mb-3 block text-xs font-bold uppercase tracking-[0.08em] text-[var(--muted)]">Slides</span>
            <div className="flex gap-1 overflow-x-auto">
              {visibleSlides.map((slide, index) => (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => setActiveSlideId(slide.id)}
                  className={
                    "whitespace-nowrap rounded-t-lg border border-b-0 px-4 py-2.5 text-sm font-semibold transition " +
                    (activeSlide?.id === slide.id
                      ? "border-[var(--border)] bg-[var(--surface)] text-[var(--brand)]"
                      : "border-transparent bg-[var(--app-bg)] text-[var(--muted)] hover:text-[var(--app-fg)]")
                  }
                >
                  Slide {index + 1}
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      {message && <p className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm">{message}</p>}

      {loading ? (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 text-sm text-[var(--muted)]">Cargando heroes…</div>
      ) : (
        <div className="space-y-5">
          {activeSlide && (() => {
            const slide = activeSlide;
            const index = visibleSlides.findIndex((item) => item.id === slide.id);
            return <section key={slide.id} className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
              <div className="flex flex-col gap-3 border-b border-[var(--border)] bg-[var(--app-bg)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <strong>Slide {index + 1}</strong>
                  <span className="ml-3 text-xs text-[var(--muted)]">ID {slide.id}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {canManage ? (
                    <>
                      <button
                        type="button"
                        onClick={() => patch(slide.id, "is_active", !slide.is_active)}
                        className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[var(--border)] px-3 text-sm font-semibold"
                      >
                        {slide.is_active ? <FiEye /> : <FiEyeOff />}
                        {slide.is_active ? "Activo" : "Inactivo"}
                      </button>
                      <button
                        type="button"
                        onClick={() => void save(slide)}
                        disabled={busyId === slide.id}
                        className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[var(--brand)] px-4 text-sm font-semibold text-white disabled:opacity-50"
                      >
                        <FiSave /> Guardar
                      </button>
                      <button
                        type="button"
                        onClick={() => void remove(slide)}
                        className="grid size-10 place-items-center rounded-xl border border-red-200 text-red-600"
                        title="Eliminar slide"
                      >
                        <FiTrash2 />
                      </button>
                    </>
                  ) : (
                    <span className="inline-flex min-h-10 items-center rounded-xl border border-[var(--border)] px-3 text-xs font-semibold text-[var(--muted)]">
                      Solo lectura
                    </span>
                  )}
                </div>
              </div>

              <div className="grid gap-4 p-4 xl:grid-cols-[190px_1fr]">
                <aside className="space-y-3">
                  <button
                    type="button"
                    onClick={() => setPreviewImage(slide.image_url)}
                    className="group relative block aspect-square w-full overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--app-bg)]"
                    title="Ver imagen en grande"
                  >
                    {slide.image_url ? (
                      <img src={slide.image_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <span className="grid h-full place-items-center text-xs text-[var(--muted)]">Sin imagen</span>
                    )}
                    <span className="absolute inset-0 grid place-items-center bg-black/0 transition group-hover:bg-black/35">
                      <FiMaximize2 className="text-xl text-white opacity-0 transition group-hover:opacity-100" />
                    </span>
                  </button>

                  <label className="block">
                    <span className="flex min-h-9 cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-[var(--border)] px-3 text-xs font-semibold">
                      <FiImage /> Cambiar imagen
                      <input disabled={!canManage} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) void uploadImage(slide, file);
                        e.currentTarget.value = "";
                      }} />
                    </span>
                  </label>

                  <div className="grid grid-cols-2 gap-2">
                    <label className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wide text-[var(--muted)]">Posición</span>
                      <input disabled={!canManage} value={slide.background_position} onChange={(e) => patch(slide.id, "background_position", e.target.value)} placeholder="center" className="h-9 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 text-xs" />
                    </label>
                    <label className="space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wide text-[var(--muted)]">Orden</span>
                      <input disabled={!canManage} type="number" min={0} value={slide.sort_order} onChange={(e) => patch(slide.id, "sort_order", Number(e.target.value))} className="h-9 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 text-xs" />
                    </label>
                  </div>

                  <label className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wide text-[var(--muted)]">Intervalo</span>
                    <input disabled={!canManage} type="number" min={1000} max={15000} step={250} value={slide.interval_ms} onChange={(e) => patch(slide.id, "interval_ms", Number(e.target.value))} className="h-9 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 text-xs" />
                  </label>
                </aside>

                <div className="space-y-4">
                  <section className="rounded-xl border border-[var(--border)] p-3">
                    <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--muted)]">Contenido principal</div>
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                      <label className="space-y-1">
                        <span className="text-[10px] font-bold uppercase text-[var(--muted)]">Badge</span>
                        <input disabled={!canManage} value={slide.eyebrow ?? ""} onChange={(e) => patch(slide.id, "eyebrow", e.target.value)} className="h-9 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2.5 text-xs" />
                      </label>
                      <label className="space-y-1 xl:col-span-2">
                        <span className="text-[10px] font-bold uppercase text-[var(--muted)]">Título</span>
                        <input disabled={!canManage} value={slide.title} onChange={(e) => patch(slide.id, "title", e.target.value)} className="h-9 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2.5 text-xs" />
                      </label>
                      <label className="space-y-1">
                        <span className="text-[10px] font-bold uppercase text-[var(--muted)]">Destacado</span>
                        <input disabled={!canManage} value={slide.accent ?? ""} onChange={(e) => patch(slide.id, "accent", e.target.value)} className="h-9 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2.5 text-xs" />
                      </label>
                      <label className="space-y-1 md:col-span-2 xl:col-span-4">
                        <span className="text-[10px] font-bold uppercase text-[var(--muted)]">Descripción</span>
                        <textarea disabled={!canManage} value={slide.description ?? ""} onChange={(e) => patch(slide.id, "description", e.target.value)} rows={2} className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2.5 py-2 text-xs" />
                      </label>
                    </div>
                  </section>

                  <section className="rounded-xl border border-[var(--border)] p-3">
                    <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--muted)]">Botones</div>
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                      {[
                        ["primary_label", "Principal", "primary_href", "URL principal"],
                        ["secondary_label", "Secundario", "secondary_href", "URL secundaria"],
                      ].map(([labelKey, labelTitle, hrefKey, hrefTitle]) => (
                        <div key={labelKey} className="contents">
                          <label className="space-y-1">
                            <span className="text-[10px] font-bold uppercase text-[var(--muted)]">{labelTitle}</span>
                            <input disabled={!canManage} value={String(slide[labelKey as keyof HeroSlide] ?? "")} onChange={(e) => patch(slide.id, labelKey as keyof HeroSlide, e.target.value)} className="h-9 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2.5 text-xs" />
                          </label>
                          <label className="space-y-1">
                            <span className="text-[10px] font-bold uppercase text-[var(--muted)]">{hrefTitle}</span>
                            <input disabled={!canManage} value={String(slide[hrefKey as keyof HeroSlide] ?? "")} onChange={(e) => patch(slide.id, hrefKey as keyof HeroSlide, e.target.value)} className="h-9 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2.5 text-xs" />
                          </label>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="rounded-xl border border-[var(--border)] p-3">
                    <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.12em] text-[var(--muted)]">Bloques derechos</div>
                    <div className="grid gap-2 lg:grid-cols-3">
                      {[0, 1, 2].map((cardIndex) => {
                        const card = (slide.cards ?? emptyCards)[cardIndex] ?? { title: "", text: "" };
                        return (
                          <div key={cardIndex} className="grid gap-2 rounded-lg bg-[var(--app-bg)] p-2">
                            <input disabled={!canManage} value={card.title} onChange={(e) => patchCard(slide.id, cardIndex, "title", e.target.value)} placeholder="Título" className="h-8 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 text-xs font-semibold" />
                            <textarea disabled={!canManage} value={card.text} onChange={(e) => patchCard(slide.id, cardIndex, "text", e.target.value)} placeholder="Descripción" rows={2} className="w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-2 py-1.5 text-xs" />
                          </div>
                        );
                      })}
                    </div>
                  </section>
                </div>
              </div>
            </section>;
          })()}

          {visibleSlides.length === 0 && (
            <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] p-10 text-center text-sm text-[var(--muted)]">
              Esta ubicación/propuesta todavía no tiene slides. Puedes crear el primero con “Nuevo slide”.
            </div>
          )}
        </div>
      )}
      {previewImage && (
        <div
          className="fixed inset-0 z-[100] grid place-items-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setPreviewImage(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Vista ampliada del hero"
        >
          <button
            type="button"
            onClick={() => setPreviewImage(null)}
            className="absolute right-5 top-5 grid size-10 place-items-center rounded-full bg-white text-black shadow-xl"
            aria-label="Cerrar"
          >
            <FiX size={20} />
          </button>
          <div className="max-h-[90vh] max-w-[92vw] overflow-hidden rounded-2xl bg-black shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <img src={previewImage} alt="" className="max-h-[90vh] max-w-[92vw] object-contain" />
          </div>
        </div>
      )}
    </div>
  );
}
