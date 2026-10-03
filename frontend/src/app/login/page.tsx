"use client";

import { Eye, EyeOff, Flame, ShieldCheck } from "lucide-react";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
    <main className="grid min-h-screen bg-white lg:grid-cols-[minmax(0,0.9fr)_minmax(520px,1.1fr)]">
      <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8 lg:px-12">
        <div className="w-full max-w-md">
          <div className="mb-10 flex items-center gap-3">
            <div className="grid size-11 place-items-center rounded-xl bg-neutral-950 text-white">
              <Flame size={22} />
            </div>
            <div>
              <strong className="block tracking-[0.12em]">GASPRONAL</strong>
              <span className="text-xs text-neutral-500">Panel administrativo</span>
            </div>
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-neutral-500">Acceso seguro</span>
            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Inicia sesión</h1>
            <p className="mt-3 text-sm leading-6 text-neutral-500">
              Ingresa con las credenciales asignadas para administrar la plataforma.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
            <label className="block space-y-2">
              <span className="text-sm font-semibold">Correo electrónico</span>
              <input
                name="email"
                type="email"
                autoComplete="email"
                required
                className="min-h-12 w-full rounded-xl border border-neutral-300 bg-white px-4 outline-none transition focus:border-neutral-900 focus:ring-4 focus:ring-neutral-100"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-semibold">Contraseña</span>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  minLength={8}
                  className="min-h-12 w-full rounded-xl border border-neutral-300 bg-white px-4 pr-12 outline-none transition focus:border-neutral-900 focus:ring-4 focus:ring-neutral-100"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-1 top-1 grid size-10 place-items-center rounded-lg text-neutral-500 hover:bg-neutral-100"
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>

            {error ? (
              <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700" role="alert">
                {error}
              </p>
            ) : null}

            <button
              disabled={loading}
              className="min-h-12 w-full rounded-xl bg-neutral-950 px-4 text-sm font-bold text-white transition hover:bg-neutral-800 disabled:opacity-60"
            >
              {loading ? "Ingresando…" : "Ingresar"}
            </button>
          </form>

          <div className="mt-6 flex items-start gap-2 text-xs leading-5 text-neutral-500">
            <ShieldCheck size={16} className="mt-0.5 shrink-0" />
            <p>La sesión se conserva mediante cookie HttpOnly y el backend valida el acceso al dashboard.</p>
          </div>
        </div>
      </section>

      <aside className="relative hidden overflow-hidden bg-neutral-950 text-white lg:flex lg:min-h-screen lg:items-end">
        <div className="absolute inset-0 opacity-60">
          <div className="absolute -left-24 top-24 h-72 w-72 rounded-full border border-white/10" />
          <div className="absolute left-12 top-40 h-96 w-96 rounded-full border border-white/10" />
          <div className="absolute bottom-[-180px] right-[-80px] h-[520px] w-[520px] rounded-full border border-white/10" />
        </div>
        <div className="relative z-10 max-w-2xl p-14 xl:p-20">
          <div className="mb-7 grid size-14 place-items-center rounded-2xl border border-white/15 bg-white/10">
            <Flame size={26} />
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/50">Gestión digital Gaspronal</p>
          <h2 className="mt-4 text-4xl font-bold leading-tight xl:text-5xl">Una plataforma moderna para administrar un activo construido durante años.</h2>
          <p className="mt-5 max-w-xl text-base leading-7 text-white/60">
            Catálogo, contenido, oportunidades y operación digital desde un entorno centralizado.
          </p>
        </div>
      </aside>
    </main>
  );
}
