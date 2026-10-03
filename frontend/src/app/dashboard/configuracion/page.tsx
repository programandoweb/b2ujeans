import { DeploymentPanel } from "@/components/dashboard/deployment-panel";

export default function ConfigurationPage() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-7">
      <section>
        <span className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--brand)]">Administración</span>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Configuración</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)] sm:text-base">Herramientas técnicas y configuración operativa de la plataforma.</p>
      </section>
      <DeploymentPanel />
    </div>
  );
}
