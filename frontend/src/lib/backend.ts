import "server-only";

const baseUrl = process.env.LARAVEL_API_URL ?? "http://127.0.0.1:8000";

export async function backendFetch(path: string, init: RequestInit = {}) {
  return fetch(`${baseUrl}/api/v1${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...init.headers,
    },
    cache: "no-store",
  });
}
