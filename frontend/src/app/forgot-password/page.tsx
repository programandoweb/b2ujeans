"use client";

import { ArrowLeft, Mail, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { forgotPassword } from "@/lib/auth-client";

const successMessage = "Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("Ingresa un correo electrónico válido.");
      return;
    }

    setLoading(true);
    try {
      await forgotPassword(email.trim());
      setSent(true);
    } catch (exception) {
      setError(exception instanceof Error ? exception.message : "No fue posible procesar la solicitud. Inténtalo nuevamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen bg-white lg:grid-cols-[minmax(0,0.9fr)_minmax(520px,1.1fr)]">
      <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8 lg:px-12">
        <div className="w-full max-w-md">
          <div className="mb-10 flex justify-center">
            <img src="/programandoweb/brand/main-logo-programandoweb.png" alt="Gaspronal" className="h-auto max-h-24 w-auto max-w-[330px] object-contain" />
          </div>

          {sent ? (
            <div>
              <div className="grid size-12 place-items-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand)]"><Mail size={22} /></div>
              <span className="mt-6 block text-xs font-bold uppercase tracking-[0.18em] text-[var(--muted)]">Solicitud recibida</span>
              <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Revisa tu correo</h1>
              <p className="mt-4 text-sm leading-6 text-[var(--muted)]">{successMessage}</p>
              <Link href="/login" className="mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[var(--brand)] px-5 text-sm font-bold text-white transition hover:bg-[var(--brand-hover)]">
                <ArrowLeft size={17} />Volver a iniciar sesión
              </Link>
            </div>
          ) : (
            <>
              <span className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--accent)]">Acceso seguro</span>
              <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Recuperar contraseña</h1>
              <p className="mt-3 text-sm leading-6 text-[var(--muted)]">Ingresa el correo asociado a tu cuenta. Si está registrado, recibirás un enlace temporal para crear una nueva contraseña.</p>

              <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
                <label className="block space-y-2">
                  <span className="text-sm font-semibold">Correo electrónico</span>
                  <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" autoComplete="email" inputMode="email" required autoFocus className="min-h-12 w-full rounded-xl border border-[var(--border)] bg-white px-4 outline-none transition focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--focus-ring)]" />
                </label>

                {error ? <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700" role="alert">{error}</p> : null}

                <button disabled={loading} className="min-h-12 w-full rounded-xl bg-[var(--brand)] px-4 text-sm font-bold text-white transition hover:bg-[var(--brand-hover)] disabled:opacity-60">
                  {loading ? "Enviando…" : "Enviar enlace de recuperación"}
                </button>
              </form>

              <Link href="/login" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[var(--brand)] hover:text-[var(--accent)]"><ArrowLeft size={16} />Volver a iniciar sesión</Link>
              <div className="mt-8 flex items-start gap-2 text-xs leading-5 text-[var(--muted)]"><ShieldCheck size={16} className="mt-0.5 shrink-0" /><p>Por seguridad, la pantalla no confirma si una dirección de correo pertenece a una cuenta.</p></div>
            </>
          )}
        </div>
      </section>

      <aside className="relative hidden min-h-screen overflow-hidden bg-[var(--brand)] text-white lg:flex lg:items-end">
        <img
          src="/api/media/login-programandoweb"
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10" />
        <div className="relative z-10 max-w-2xl p-14 xl:p-20">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/70">Protección de acceso</p>
          <h2 className="mt-4 text-4xl font-bold leading-tight drop-shadow-sm xl:text-5xl">Recupera tu acceso mediante un enlace temporal y seguro.</h2>
          <p className="mt-5 max-w-xl text-base leading-7 text-white/75">El proceso utiliza el mecanismo estándar de recuperación de Laravel y no expone si una cuenta existe.</p>
        </div>
      </aside>
    </main>
  );
}
