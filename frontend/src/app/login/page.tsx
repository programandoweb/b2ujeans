"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.get("email"),
        password: form.get("password"),
      }),
    });

    setLoading(false);

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setError(data.message ?? "No fue posible iniciar sesión.");
      return;
    }

    router.replace("/dashboard");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-5" noValidate>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em]">Gaspronal</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Acceso administrativo</h1>
        </div>

        <label className="block space-y-2">
          <span className="text-sm font-medium">Correo</span>
          <input name="email" type="email" autoComplete="email" required className="min-h-12 w-full rounded-lg border border-neutral-300 px-3 outline-none focus:ring-2" />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium">Contraseña</span>
          <input name="password" type="password" autoComplete="current-password" required minLength={8} className="min-h-12 w-full rounded-lg border border-neutral-300 px-3 outline-none focus:ring-2" />
        </label>

        {error ? <p className="text-sm text-red-700" role="alert">{error}</p> : null}

        <button disabled={loading} className="min-h-12 w-full rounded-lg bg-neutral-900 px-4 font-semibold text-white disabled:opacity-60">
          {loading ? "Ingresando…" : "Ingresar"}
        </button>
      </form>
    </main>
  );
}
