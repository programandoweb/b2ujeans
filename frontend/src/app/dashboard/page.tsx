import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { backendFetch } from "@/lib/backend";

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("gaspronal_access_token")?.value;

  if (!token) {
    redirect("/login");
  }

  const response = await backendFetch("/auth/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    redirect("/login");
  }

  const { data: user } = await response.json();

  return (
    <main className="mx-auto min-h-screen w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="border-b border-neutral-200 pb-5">
        <p className="text-sm font-semibold uppercase tracking-[0.18em]">Dashboard restringido</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Gaspronal</h1>
        <p className="mt-2 text-sm text-neutral-600">
          Sesión activa: {user.name} · {user.email}
        </p>
      </header>

      <section className="py-8">
        <p className="text-neutral-600">
          Foundation administrativa lista para comenzar los módulos de catálogo, contenido y CRM.
        </p>
      </section>
    </main>
  );
}
