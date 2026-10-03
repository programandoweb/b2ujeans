export async function GET() {
  const backendUrl = process.env.LARAVEL_API_URL ?? "http://127.0.0.1:8000";
  const imageUrl = new URL("/programandoweb/default/login-programandoweb.jpg", backendUrl);

  const response = await fetch(imageUrl, { cache: "force-cache" });

  if (!response.ok || !response.body) {
    return new Response(null, { status: 404 });
  }

  return new Response(response.body, {
    status: 200,
    headers: {
      "Content-Type": response.headers.get("content-type") ?? "image/jpeg",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
    },
  });
}
