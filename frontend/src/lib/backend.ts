import "server-only";

const baseUrl = process.env.LARAVEL_API_URL ?? "http://127.0.0.1:8000";

export async function backendFetch(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("Accept", headers.get("Accept") ?? "application/json");

  if (init.body && !(init.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(`${baseUrl}/api/v1${path}`, {
    ...init,
    headers,
    cache: "no-store",
  });
}
