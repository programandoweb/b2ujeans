import Link from "next/link";

export const metadata = {
  title: "Tratamiento de datos personales | B2uJeans",
  description: "Información sobre el tratamiento de datos personales utilizados para atención y seguimiento comercial de B2uJeans.",
};

export default function DataProcessingPage() {
  return (
    <main className="min-h-screen bg-[var(--app-bg)] px-5 py-10 sm:px-8 lg:px-12">
      <article className="mx-auto max-w-4xl rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm sm:p-10">
        <div className="border-b border-[var(--border)] pb-6">
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--brand)]">B2uJeans</span>
          <h1 className="mt-2 text-3xl font-bold">Tratamiento de datos personales</h1>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">Versión vigente: 5 de octubre de 2026.</p>
        </div>

        <div className="mt-7 space-y-6 text-sm leading-7">
          <section>
            <h2 className="text-lg font-bold">Finalidad</h2>
            <p className="mt-2">
              Los datos que el cliente suministre voluntariamente —como nombre, número de WhatsApp y correo electrónico—
              podrán utilizarse para identificarlo, brindar continuidad a la atención, responder solicitudes, realizar
              seguimiento comercial, elaborar propuestas, coordinar citas y mejorar la experiencia de servicio.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold">Datos solicitados</h2>
            <p className="mt-2">
              Para el flujo de atención de Claudio se solicitan únicamente nombre, correo electrónico y número de WhatsApp.
              Estos datos no se registran mediante este flujo hasta que el titular manifieste expresamente su aceptación.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold">Autorización</h2>
            <p className="mt-2">
              La entrega de los datos por sí sola no constituye autorización. El cliente debe aceptar expresamente el
              tratamiento de sus datos para las finalidades indicadas. Si no acepta, la conversación puede continuar sin
              que Claudio cree su registro como cliente mediante este proceso.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold">Conservación y seguridad</h2>
            <p className="mt-2">
              B2uJeans conserva la información necesaria para la relación de atención y seguimiento comercial y aplica
              controles técnicos y administrativos para limitar el acceso a la información.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold">Derechos del titular</h2>
            <p className="mt-2">
              El titular puede solicitar información sobre sus datos, pedir su actualización o corrección y presentar
              solicitudes relacionadas con la autorización o el tratamiento de su información a través de los canales
              oficiales de B2uJeans.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold">Registro del consentimiento</h2>
            <p className="mt-2">
              Cuando el cliente acepta, el sistema registra la fecha de aceptación, el origen de la captura y la versión
              de esta política asociada al consentimiento.
            </p>
          </section>
        </div>

        <div className="mt-8 border-t border-[var(--border)] pt-6">
          <Link href="/" className="inline-flex min-h-11 items-center rounded-xl bg-[var(--brand)] px-5 text-sm font-semibold text-white">
            Volver al sitio
          </Link>
        </div>
      </article>
    </main>
  );
}
