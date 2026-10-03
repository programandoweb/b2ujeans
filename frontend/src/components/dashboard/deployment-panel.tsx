"use client";

import { CheckCircle2, CircleAlert, Clock3, RefreshCw, Rocket, Terminal } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

type Deployment = {
  id: number;
  status: "queued" | "running" | "succeeded" | "failed";
  started_at: string | null;
  finished_at: string | null;
  exit_code: number | null;
  output: string | null;
  failure_message: string | null;
  created_at: string;
};

type Payload = {
  data: Deployment[];
  configuration: { enabled: boolean; ready: boolean; script_name: string | null };
};

const labels = { queued: "En cola", running: "Ejecutando", succeeded: "Correcto", failed: "Falló" };

function Status({ value }: { value: Deployment["status"] }) {
  const style = value === "succeeded"
    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
    : value === "failed"
      ? "border-red-200 bg-red-50 text-red-700"
      : "border-amber-200 bg-amber-50 text-amber-700";
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${style}`}>{labels[value]}</span>;
}

function date(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("es-CO", { dateStyle: "short", timeStyle: "medium" }).format(new Date(value));
}

export function DeploymentPanel() {
  const [payload, setPayload] = useState<Payload | null>(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    const response = await fetch("/api/deployments", { cache: "no-store" });
    if (response.ok) setPayload(await response.json());
    setLoading(false);
  }, []);

  useEffect(() => { void load(); }, [load]);

  const active = payload?.data.find((item) => item.status === "queued" || item.status === "running");

  useEffect(() => {
    if (!active) return;
    const timer = window.setInterval(() => void load(), 2500);
    return () => window.clearInterval(timer);
  }, [active, load]);

  async function deploy() {
    if (!window.confirm("Se actualizará y desplegará Gaspronal usando el script configurado en el servidor. ¿Deseas continuar?")) return;
    setStarting(true);
    setMessage(null);
    const response = await fetch("/api/deployments", { method: "POST" });
    const result = await response.json().catch(() => ({}));
    setStarting(false);
    setMessage(response.ok ? "Despliegue iniciado correctamente." : (result.message ?? "No fue posible iniciar el despliegue."));
    await load();
  }

  if (loading) return <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 text-sm text-[var(--muted)]">Cargando configuración…</div>;

  const latest = payload?.data[0] ?? null;
  const ready = Boolean(payload?.configuration.ready);

  return <div className="space-y-5">
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-[var(--brand)]"><Rocket size={20} /><span className="text-xs font-bold uppercase tracking-[0.16em]">Autodespliegue</span></div>
          <h2 className="mt-2 text-xl font-bold">Despliegue desde el servidor</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">Ejecuta el script privado del VPS directamente desde Gaspronal. No utiliza GitHub Actions ni consume créditos de ejecución.</p>
        </div>
        <button onClick={deploy} disabled={!ready || Boolean(active) || starting} className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-[var(--brand)] px-5 text-sm font-bold text-white shadow-sm transition hover:bg-[var(--brand-hover)] disabled:cursor-not-allowed disabled:opacity-45">
          <Rocket size={18} />{starting ? "Iniciando…" : active ? "Desplegando…" : "Desplegar ahora"}
        </button>
      </div>

      <div className="mt-5 flex flex-wrap gap-2 text-xs">
        <span className={`rounded-full border px-3 py-1.5 font-semibold ${ready ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-amber-200 bg-amber-50 text-amber-700"}`}>{ready ? "Servidor listo" : "Configuración pendiente"}</span>
        {payload?.configuration.script_name && <span className="rounded-full border border-[var(--border)] bg-[var(--app-bg)] px-3 py-1.5 font-mono text-[var(--muted)]">{payload.configuration.script_name}</span>}
      </div>

      {!payload?.configuration.enabled && <div className="mt-5 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"><CircleAlert className="mt-0.5 shrink-0" size={18} /><p>Activa <code>DEPLOYMENT_ENABLED=true</code> en el backend cuando el script privado del VPS esté configurado.</p></div>}
      {message && <p className="mt-4 text-sm font-medium">{message}</p>}
    </section>

    {latest && <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
      <div className="flex flex-wrap items-center gap-3 border-b border-[var(--border)] p-5"><Terminal size={18} /><strong>Último despliegue #{latest.id}</strong><Status value={latest.status} /><span className="ml-auto text-xs text-[var(--muted)]">{date(latest.created_at)}</span></div>
      <div className="grid gap-px bg-[var(--border)] sm:grid-cols-3">
        <div className="bg-[var(--surface)] p-4"><p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">Inicio</p><p className="mt-1 text-sm">{date(latest.started_at)}</p></div>
        <div className="bg-[var(--surface)] p-4"><p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">Fin</p><p className="mt-1 text-sm">{date(latest.finished_at)}</p></div>
        <div className="bg-[var(--surface)] p-4"><p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">Código de salida</p><p className="mt-1 text-sm">{latest.exit_code ?? "—"}</p></div>
      </div>
      {(latest.output || latest.failure_message) && <div className="p-5">{latest.failure_message && <p className="mb-3 text-sm font-semibold text-red-700">{latest.failure_message}</p>}{latest.output && <pre className="max-h-[420px] overflow-auto rounded-xl bg-[var(--brand-strong)] p-4 text-xs leading-5 text-white/90">{latest.output}</pre>}</div>}
    </section>}

    <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm">
      <div className="flex items-center gap-2 border-b border-[var(--border)] p-5"><Clock3 size={18} /><h2 className="font-bold">Historial</h2><button onClick={() => void load()} className="ml-auto grid size-9 place-items-center rounded-lg border border-[var(--border)]" aria-label="Actualizar historial"><RefreshCw size={16} /></button></div>
      <div className="divide-y divide-[var(--border)]">
        {payload?.data.length ? payload.data.map((item) => <div key={item.id} className="grid gap-2 p-4 text-sm sm:grid-cols-[80px_1fr_180px] sm:items-center"><strong>#{item.id}</strong><div className="flex items-center gap-2">{item.status === "succeeded" ? <CheckCircle2 size={16} className="text-emerald-600" /> : item.status === "failed" ? <CircleAlert size={16} className="text-red-600" /> : <Clock3 size={16} className="text-amber-600" />}<Status value={item.status} /></div><span className="text-xs text-[var(--muted)] sm:text-right">{date(item.created_at)}</span></div>) : <p className="p-5 text-sm text-[var(--muted)]">Aún no existen despliegues registrados.</p>}
      </div>
    </section>
  </div>;
}
