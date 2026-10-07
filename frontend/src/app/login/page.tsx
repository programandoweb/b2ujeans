"use client";

import { Eye, EyeOff, MessageCircle, ShieldCheck } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type LoginMode = "password" | "whatsapp";
type WhatsAppStep = "phone" | "pin";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [whatsappAvailable, setWhatsappAvailable] = useState(false);
  const [mode, setMode] = useState<LoginMode>("password");
  const [whatsappStep, setWhatsappStep] = useState<WhatsAppStep>("phone");
  const [whatsapp, setWhatsapp] = useState("");
  const [pin, setPin] = useState("");

  useEffect(() => {
    fetch("/api/auth/whatsapp/status", { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => setWhatsappAvailable(Boolean(data.enabled)))
      .catch(() => setWhatsappAvailable(false));
  }, []);

  function finishLogin() {
    const requestedNext = new URLSearchParams(window.location.search).get("next");
    const safeNext = requestedNext?.startsWith("/dashboard") ? requestedNext : "/dashboard";
    router.replace(safeNext);
    router.refresh();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: form.get("email"), password: form.get("password") }),
    });

    setLoading(false);

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setError(data.message ?? "No fue posible iniciar sesión.");
      return;
    }

    finishLogin();
  }

  async function requestPin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const response = await fetch("/api/auth/whatsapp/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ whatsapp }),
    });
    const data = await response.json().catch(() => ({}));
    setLoading(false);

    if (!response.ok) {
      setError(data.message ?? "No fue posible enviar el código por WhatsApp.");
      return;
    }

    setWhatsappStep("pin");
    setMessage(data.message ?? "Si el número está registrado, recibirás un código de acceso.");
  }

  async function verifyPin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const response = await fetch("/api/auth/whatsapp/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ whatsapp, pin }),
    });
    const data = await response.json().catch(() => ({}));
    setLoading(false);

    if (!response.ok) {
      setError(data.message ?? "El código no es válido.");
      return;
    }

    finishLogin();
  }

  function switchMode(nextMode: LoginMode) {
    setMode(nextMode);
    setError(null);
    setMessage(null);
    setWhatsappStep("phone");
    setPin("");
  }

  return (
    <main className="grid min-h-screen bg-white lg:grid-cols-[minmax(0,0.9fr)_minmax(520px,1.1fr)]">
      <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8 lg:px-12">
        <div className="w-full max-w-md">
          <div className="mb-10 flex justify-center">
            <img src="/b2u/logo-b2u.svg" alt="B2U Jeans" className="h-auto max-h-24 w-auto max-w-[280px] object-contain" />
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--accent)]">Acceso seguro</span>
            <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Inicia sesión</h1>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{mode === "password" ? "Ingresa con las credenciales asignadas para administrar la plataforma." : "Recibe un PIN de 4 dígitos en tu WhatsApp registrado."}</p>
          </div>

          {mode === "password" ? (
            <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
              <label className="block space-y-2">
                <span className="text-sm font-semibold">Correo electrónico</span>
                <input name="email" type="email" autoComplete="email" required className="min-h-12 w-full rounded-xl border border-[var(--border)] bg-white px-4 outline-none transition focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--focus-ring)]" />
              </label>
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-4">
                  <label htmlFor="password" className="text-sm font-semibold">Contraseña</label>
                  <Link href="/forgot-password" className="text-xs font-semibold text-[var(--brand)] hover:text-[var(--accent)]">¿Olvidaste tu contraseña?</Link>
                </div>
                <div className="relative">
                  <input id="password" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" required minLength={8} className="min-h-12 w-full rounded-xl border border-[var(--border)] bg-white px-4 pr-12 outline-none transition focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--focus-ring)]" />
                  <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-1 top-1 grid size-10 place-items-center rounded-lg text-[var(--muted)] hover:bg-[var(--brand-soft)]" aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}>{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                </div>
              </div>
              {error ? <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700" role="alert">{error}</p> : null}
              <button disabled={loading} className="min-h-12 w-full rounded-xl bg-[var(--brand)] px-4 text-sm font-bold text-white transition hover:bg-[var(--brand-hover)] disabled:opacity-60">{loading ? "Ingresando…" : "Ingresar"}</button>
            </form>
          ) : whatsappStep === "phone" ? (
            <form onSubmit={requestPin} className="mt-8 space-y-5" noValidate>
              <label className="block space-y-2">
                <span className="text-sm font-semibold">Número de WhatsApp</span>
                <input value={whatsapp} onChange={(event) => setWhatsapp(event.target.value.replace(/\s/g, ""))} name="whatsapp" type="tel" inputMode="tel" autoComplete="tel" placeholder="+573115000926" required className="min-h-12 w-full rounded-xl border border-[var(--border)] bg-white px-4 outline-none transition focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--focus-ring)]" />
                <span className="block text-xs text-[var(--muted)]">Usa el número registrado en formato internacional.</span>
              </label>
              {error ? <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700" role="alert">{error}</p> : null}
              <button disabled={loading || !whatsapp} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--brand)] px-4 text-sm font-bold text-white transition hover:bg-[var(--brand-hover)] disabled:opacity-60"><MessageCircle size={18} />{loading ? "Enviando…" : "Enviar PIN por WhatsApp"}</button>
            </form>
          ) : (
            <form onSubmit={verifyPin} className="mt-8 space-y-5" noValidate>
              <label className="block space-y-2">
                <span className="text-sm font-semibold">PIN de 4 dígitos</span>
                <input value={pin} onChange={(event) => setPin(event.target.value.replace(/\D/g, "").slice(0, 4))} name="pin" type="text" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{4}" maxLength={4} required className="min-h-14 w-full rounded-xl border border-[var(--border)] bg-white px-4 text-center text-2xl font-bold tracking-[0.5em] outline-none transition focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--focus-ring)]" />
              </label>
              {message ? <p className="rounded-xl border border-[var(--border)] bg-[var(--brand-soft)] p-3 text-sm text-[var(--brand)]">{message}</p> : null}
              {error ? <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700" role="alert">{error}</p> : null}
              <button disabled={loading || pin.length !== 4} className="min-h-12 w-full rounded-xl bg-[var(--brand)] px-4 text-sm font-bold text-white transition hover:bg-[var(--brand-hover)] disabled:opacity-60">{loading ? "Validando…" : "Ingresar con PIN"}</button>
              <button type="button" onClick={() => { setWhatsappStep("phone"); setPin(""); setError(null); setMessage(null); }} className="min-h-11 w-full text-sm font-semibold text-[var(--brand)]">Cambiar número o reenviar código</button>
            </form>
          )}

          {whatsappAvailable ? (
            <div className="mt-6">
              <div className="flex items-center gap-3 text-xs text-[var(--muted)]"><span className="h-px flex-1 bg-[var(--border)]" /><span>o</span><span className="h-px flex-1 bg-[var(--border)]" /></div>
              <button type="button" onClick={() => switchMode(mode === "password" ? "whatsapp" : "password")} className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-[var(--border)] px-4 text-sm font-bold text-[var(--brand)] transition hover:bg-[var(--brand-soft)]">
                <MessageCircle size={18} />{mode === "password" ? "Ingresar con WhatsApp" : "Ingresar con correo y contraseña"}
              </button>
            </div>
          ) : null}

          <div className="mt-6 flex items-start gap-2 text-xs leading-5 text-[var(--muted)]"><ShieldCheck size={16} className="mt-0.5 shrink-0" /><p>La sesión se conserva mediante cookie HttpOnly y el backend valida el acceso al dashboard.</p></div>
        </div>
      </section>

      <aside className="relative hidden min-h-screen overflow-hidden bg-[var(--brand)] text-white lg:flex lg:items-end">
        <img src="/api/media/login-programandoweb" alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10" />
        <div className="relative z-10 max-w-2xl p-14 xl:p-20">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/70">Gestión digital Gaspronal</p>
          <h2 className="mt-4 text-4xl font-bold leading-tight drop-shadow-sm xl:text-5xl">Una plataforma moderna para administrar un activo construido durante años.</h2>
          <p className="mt-5 max-w-xl text-base leading-7 text-white/75">Catálogo, contenido, oportunidades y operación digital desde un entorno centralizado.</p>
        </div>
      </aside>
    </main>
  );
}
