"use client";

import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { FormEvent, Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { resetPassword } from "@/lib/auth-client";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const token = searchParams.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const invalidLink = !email || !token;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if (password !== confirmation) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    try {
      await resetPassword({ email, token, password, password_confirmation: confirmation });
      window.history.replaceState({}, "", "/reset-password");
      setSuccess(true);
    } catch (exception) {
      setError(exception instanceof Error ? exception.message : "No fue posible procesar la solicitud. Inténtalo nuevamente.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div>
        <div className="grid size-12 place-items-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand)]"><ShieldCheck size={22} /></div>
        <span className="mt-6 block text-xs font-bold uppercase tracking-[0.18em] text-[var(--muted)]">Acceso recuperado</span>
        <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Contraseña actualizada</h1>
        <p className="mt-4 text-sm leading-6 text-[var(--muted)]">Ya puedes iniciar sesión con tu nueva contraseña.</p>
        <Link href="/login" className="mt-7 inline-flex min-h-12 items-center justify-center rounded-xl bg-[var(--brand)] px-5 text-sm font-bold text-white transition hover:bg-[var(--brand-hover)]">Ir a iniciar sesión</Link>
      </div>
    );
  }

  if (invalidLink) {
    return (
      <div>
        <span className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--muted)]">Enlace inválido</span>
        <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Este enlace ya no es válido o ha expirado.</h1>
        <p className="mt-4 text-sm leading-6 text-[var(--muted)]">Solicita un nuevo enlace para continuar con la recuperación de acceso.</p>
        <Link href="/forgot-password" className="mt-7 inline-flex min-h-12 items-center justify-center rounded-xl bg-[var(--brand)] px-5 text-sm font-bold text-white transition hover:bg-[var(--brand-hover)]">Solicitar un nuevo enlace</Link>
      </div>
    );
  }

  return (
    <>
      <span className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--accent)]">Acceso seguro</span>
      <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Crear nueva contraseña</h1>
      <p className="mt-3 text-sm leading-6 text-[var(--muted)]">Define una nueva contraseña para <strong className="font-semibold text-[var(--brand)]">{email}</strong>.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
        <label className="block space-y-2">
          <span className="text-sm font-semibold">Nueva contraseña</span>
          <div className="relative">
            <input value={password} onChange={(event) => setPassword(event.target.value)} type={showPassword ? "text" : "password"} autoComplete="new-password" minLength={8} required autoFocus className="min-h-12 w-full rounded-xl border border-[var(--border)] bg-white px-4 pr-12 outline-none transition focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--focus-ring)]" />
            <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-1 top-1 grid size-10 place-items-center rounded-lg text-[var(--muted)] hover:bg-[var(--brand-soft)]" aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
          </div>
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-semibold">Confirmar nueva contraseña</span>
          <div className="relative">
            <input value={confirmation} onChange={(event) => setConfirmation(event.target.value)} type={showConfirmation ? "text" : "password"} autoComplete="new-password" minLength={8} required className="min-h-12 w-full rounded-xl border border-[var(--border)] bg-white px-4 pr-12 outline-none transition focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--focus-ring)]" />
            <button type="button" onClick={() => setShowConfirmation((value) => !value)} className="absolute right-1 top-1 grid size-10 place-items-center rounded-lg text-[var(--muted)] hover:bg-[var(--brand-soft)]" aria-label={showConfirmation ? "Ocultar contraseña" : "Mostrar contraseña"}>{showConfirmation ? <EyeOff size={18} /> : <Eye size={18} />}</button>
          </div>
        </label>

        {error ? <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700" role="alert">{error}</p> : null}
        <button disabled={loading} className="min-h-12 w-full rounded-xl bg-[var(--brand)] px-4 text-sm font-bold text-white transition hover:bg-[var(--brand-hover)] disabled:opacity-60">{loading ? "Guardando…" : "Guardar nueva contraseña"}</button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="grid min-h-screen bg-white lg:grid-cols-[minmax(0,0.9fr)_minmax(520px,1.1fr)]">
      <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8 lg:px-12">
        <div className="w-full max-w-md">
          <div className="mb-10 flex justify-center"><img src="/programandoweb/brand/main-logo-programandoweb.png" alt="Gaspronal" className="h-auto max-h-24 w-auto max-w-[330px] object-contain" /></div>
          <Suspense fallback={<p className="text-sm text-[var(--muted)]">Validando enlace…</p>}><ResetPasswordForm /></Suspense>
        </div>
      </section>

      <aside className="relative hidden overflow-hidden bg-[var(--brand)] text-white lg:flex lg:min-h-screen lg:items-end">
        <div className="absolute inset-0 opacity-60"><div className="absolute -left-24 top-24 h-72 w-72 rounded-full border border-white/10" /><div className="absolute left-12 top-40 h-96 w-96 rounded-full border border-white/10" /><div className="absolute bottom-[-180px] right-[-80px] h-[520px] w-[520px] rounded-full border border-white/10" /></div>
        <div className="relative z-10 max-w-2xl p-14 xl:p-20">
          <div className="mb-7 grid size-14 place-items-center rounded-2xl border border-white/15 bg-white/10"><ShieldCheck size={26} /></div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/50">Protección de acceso</p>
          <h2 className="mt-4 text-4xl font-bold leading-tight xl:text-5xl">Crea una nueva contraseña y recupera el control de tu cuenta.</h2>
        </div>
      </aside>
    </main>
  );
}
