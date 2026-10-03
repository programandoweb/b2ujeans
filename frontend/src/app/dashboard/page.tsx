import Link from "next/link";
import { ArrowRight, Settings } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-7">
      <section>
        <span className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--brand)]">Gaspronal</span>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Dashboard</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)] sm:text-base">
          Base administrativa de la nueva plataforma. Los módulos comerciales se incorporarán progresivamente.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
          <div className="grid size-11 place-items-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand)]">
            <Settings size={21} />
          </div>
          <h2 className="mt-5 font-semibold">Configuración</h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Administración técnica y autodespliegue del proyecto.
          </p>
          <Link href="/dashboard/configuracion" className="mt-5 inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-[var(--brand)]">
            Abrir configuración <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}
