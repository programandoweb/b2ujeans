export type ManagedHeroSlide = {
  id: number;
  option: number;
  sort_order: number;
  interval_ms: number;
  image_url: string;
  background_position?: string | null;
  eyebrow?: string | null;
  title: string;
  accent?: string | null;
  description?: string | null;
  primary_label?: string | null;
  primary_href?: string | null;
  secondary_label?: string | null;
  secondary_href?: string | null;
  cards?: Array<{ title: string; text: string }> | null;
};

const backendUrl = process.env.LARAVEL_API_URL ?? "http://127.0.0.1:8000";
const publicBackendUrl = (process.env.PUBLIC_BACKEND_URL ?? backendUrl).replace(/\/$/, "");

function publicAsset(url: string): string {
  if (!url) return url;
  if (/^https?:\/\//i.test(url)) return url;
  return publicBackendUrl + (url.startsWith("/") ? url : "/" + url);
}

export async function getManagedHero(section: string): Promise<ManagedHeroSlide[]> {
  try {
    const response = await fetch(
      `${backendUrl}/api/v1/heroes/public?section=${encodeURIComponent(section)}`,
      { cache: "no-store", headers: { Accept: "application/json" } }
    );
    if (!response.ok) return [];

    const payload = await response.json() as { data?: Record<string, ManagedHeroSlide[]> };
    const groups = payload.data ?? {};
    const selected = groups["2"]?.length ? 2 : Object.keys(groups)
      .map(Number)
      .filter((option) => Number.isFinite(option) && groups[String(option)]?.length)
      .sort((a, b) => a - b)[0];

    if (!selected) return [];

    return (groups[String(selected)] ?? [])
      .slice()
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((slide) => ({ ...slide, image_url: publicAsset(slide.image_url) }));
  } catch {
    return [];
  }
}
