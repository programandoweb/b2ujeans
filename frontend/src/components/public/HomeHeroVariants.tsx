import Link from "next/link";
import {
  ArrowRight,
  ChefHat,
  Flame,
  Gauge,
  Hammer,
  Settings,
  ShieldCheck,
  Sparkles,
  Wind,
  Wrench,
} from "lucide-react";

const whatsappHref =
  "https://wa.me/573045527575?text=Hola%20Gaspronal,%20quiero%20recibir%20asesor%C3%ADa%20para%20mi%20proyecto.";

const heroBackgroundOne =
  "https://www.gaspronal.com/2019/fotos/Image/cabezotesjq/Cabezote-Gaspronal-Web.jpg?1791214773376";
const heroBackgroundTwo =
  "https://www.gaspronal.com/2019/fotos/Image/cabezotesjq/Cabezote-Gaspronal-Web-2.jpg?1791214773955";

function HeroBackground({
  src,
  overlay = "bg-[#082237]/75",
  position = "center",
}: {
  src: string;
  overlay?: string;
  position?: string;
}) {
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      <div
        className="absolute inset-0 bg-cover bg-no-repeat"
        style={{ backgroundImage: `url("${src}")`, backgroundPosition: position }}
      />
      <div className={"absolute inset-0 " + overlay} />
    </div>
  );
}

const services = [
  {
    icon: Hammer,
    title: "Fabricación industrial",
    description:
      "Equipos en acero inoxidable diseñados para restaurantes, panaderías, comidas rápidas y procesos de alimentos.",
  },
  {
    icon: Flame,
    title: "Redes de gas",
    description:
      "Instalación de redes de gas propano y natural para aplicaciones comerciales, industriales y residenciales.",
  },
  {
    icon: Wind,
    title: "Extracción industrial",
    description:
      "Montaje de sistemas de extracción para cocinas y espacios que exigen evacuación eficiente de humos.",
  },
  {
    icon: Wrench,
    title: "Servicio técnico",
    description:
      "Mantenimiento, reparación e instalación de equipos a gas domésticos e industriales.",
  },
];

function ProposalSelector({ option }: { option: number }) {
  return (
    <div className="absolute left-1/2 top-4 z-20 -translate-x-1/2">
      <div className="flex items-center gap-1 rounded-full border border-white/20 bg-[#0d2b40]/90 p-1 text-white shadow-xl backdrop-blur">
        <span className="hidden px-3 text-[10px] font-black uppercase tracking-[0.14em] text-white/55 sm:inline">
          Propuestas
        </span>
        {[1, 2, 3, 4, 5].map((item) => (
          <Link
            key={item}
            href={item === 1 ? "/" : "/?option=" + item}
            scroll={false}
            className={
              "grid size-8 place-items-center rounded-full text-xs font-black transition " +
              (option === item
                ? "bg-[var(--accent)] text-white"
                : "text-white/70 hover:bg-white/10 hover:text-white")
            }
            aria-label={"Ver propuesta " + item}
          >
            {item}
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function HomeHeroVariants({ option }: { option: number }) {
  const selector = <ProposalSelector option={option} />;

  if (option === 2) {
    return (
      <section className="relative overflow-hidden border-b border-slate-200 bg-[#f7fafc]">
        <HeroBackground src={heroBackgroundTwo} overlay="bg-white/88" position="center" />
        {selector}
        <div className="mx-auto grid max-w-[1440px] items-stretch pt-14 lg:min-h-[720px] lg:grid-cols-[1.04fr_0.96fr]">
          <div className="flex items-center px-4 py-14 sm:px-6 sm:py-20 lg:px-10 lg:py-24">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-[var(--brand)]/15 bg-white px-3 py-2 text-xs font-bold uppercase tracking-[0.14em] text-[var(--brand)] shadow-sm">
                <Sparkles size={15} />
                Ingeniería para cocinas y procesos industriales
              </div>
              <h1 className="mt-7 max-w-[850px] text-[clamp(3.1rem,7vw,7.4rem)] font-black leading-[0.9] tracking-[-0.065em] text-[#102d42]">
                Equipos que están hechos para <span className="text-[var(--brand)]">trabajar.</span>
              </h1>
              <p className="mt-7 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
                Diseñamos, fabricamos, instalamos y mantenemos soluciones para cocinas profesionales,
                producción de alimentos, redes de gas y extracción industrial.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <a
                  href="#productos"
                  className="inline-flex min-h-13 items-center justify-center gap-2 rounded-full bg-[var(--brand)] px-6 text-sm font-bold text-white transition hover:bg-[var(--brand-hover)]"
                >
                  Conocer soluciones <ArrowRight size={18} />
                </a>
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-13 items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-6 text-sm font-bold text-slate-800 transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                >
                  Cuéntanos tu proyecto
                </a>
              </div>
            </div>
          </div>

          <div className="relative min-h-[520px] overflow-hidden bg-[#0d2b40] lg:min-h-full">
            <div className="absolute inset-x-0 top-0 h-2 bg-[var(--accent)]" />
            <div className="absolute -right-24 -top-20 h-72 w-72 rounded-full border-[60px] border-white/5" />
            <div className="absolute -bottom-28 -left-24 h-80 w-80 rounded-full border-[70px] border-white/5" />
            <div className="relative flex h-full min-h-[520px] flex-col justify-between p-6 sm:p-10 lg:p-12">
              <div className="flex items-start justify-between gap-4">
                <span className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-white/75">
                  Gaspronal · Industria
                </span>
                <ShieldCheck className="text-[var(--accent)]" size={34} />
              </div>

              <div className="my-12">
                <p className="max-w-xl text-4xl font-black leading-[1.02] tracking-[-0.04em] text-white sm:text-5xl lg:text-6xl">
                  Acero, calor y precisión para operaciones que no pueden parar.
                </p>
                <p className="mt-6 max-w-lg text-base leading-7 text-slate-300">
                  Esta opción conserva el concepto visual que ya tiene la página, pero lo presenta como una propuesta de hero formal.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  ["AISI 304", "Acero inoxidable"],
                  ["Gas", "Natural y propano"],
                  ["A medida", "Diseño especial"],
                ].map(([value, label]) => (
                  <div key={value} className="rounded-3xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur">
                    <strong className="block text-xl font-black text-white">{value}</strong>
                    <span className="mt-1 block text-xs font-medium text-slate-300">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (option === 3) {
    return (
      <section className="relative overflow-hidden border-b border-slate-200 bg-white">
        <HeroBackground src={heroBackgroundOne} overlay="bg-white/90" position="center 35%" />
        {selector}
        <div className="mx-auto max-w-[1440px] px-4 pb-14 pt-24 sm:px-6 sm:pb-20 lg:px-10 lg:pb-24">
          <div className="grid items-end gap-10 lg:grid-cols-[1.12fr_0.88fr]">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-[var(--accent)]">
                Catálogo industrial Gaspronal
              </p>
              <h1 className="mt-5 max-w-5xl text-[clamp(3rem,7vw,7rem)] font-black leading-[0.9] tracking-[-0.065em] text-[#102d42]">
                El equipo correcto para <span className="text-[var(--brand)]">cada operación.</span>
              </h1>
            </div>

            <div className="lg:pb-2">
              <p className="max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
                Explora líneas de producto o cuéntanos qué necesitas producir. Fabricamos equipos estándar y soluciones especiales en acero inoxidable.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <a
                  href="#productos"
                  className="inline-flex min-h-13 items-center justify-center gap-2 rounded-full bg-[var(--brand)] px-6 text-sm font-black text-white"
                >
                  Explorar catálogo <ArrowRight size={18} />
                </a>
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-13 items-center justify-center rounded-full border border-slate-300 px-6 text-sm font-black text-[#102d42]"
                >
                  Pedir recomendación
                </a>
              </div>
            </div>
          </div>

          <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <a href="#productos" className="rounded-[1.75rem] border border-slate-200 bg-[#f7fafc] p-6 transition hover:-translate-y-1 hover:border-[var(--brand)] hover:bg-white hover:shadow-xl">
              <Flame className="text-[var(--brand)]" size={25} />
              <strong className="mt-8 block text-xl font-black text-[#102d42]">Cocción</strong>
              <span className="mt-2 block text-sm text-slate-500">Estufas · hornos · planchas</span>
            </a>
            <a href="#productos" className="rounded-[1.75rem] border border-slate-200 bg-[#f7fafc] p-6 transition hover:-translate-y-1 hover:border-[var(--brand)] hover:bg-white hover:shadow-xl">
              <Gauge className="text-[var(--brand)]" size={25} />
              <strong className="mt-8 block text-xl font-black text-[#102d42]">Producción</strong>
              <span className="mt-2 block text-sm text-slate-500">Marmitas · freidoras</span>
            </a>
            <a href="#productos" className="rounded-[1.75rem] border border-slate-200 bg-[#f7fafc] p-6 transition hover:-translate-y-1 hover:border-[var(--brand)] hover:bg-white hover:shadow-xl">
              <ChefHat className="text-[var(--brand)]" size={25} />
              <strong className="mt-8 block text-xl font-black text-[#102d42]">Preparación</strong>
              <span className="mt-2 block text-sm text-slate-500">Mesas · mesones</span>
            </a>
            <a href="#productos" className="rounded-[1.75rem] border border-slate-200 bg-[#f7fafc] p-6 transition hover:-translate-y-1 hover:border-[var(--brand)] hover:bg-white hover:shadow-xl">
              <Wind className="text-[var(--brand)]" size={25} />
              <strong className="mt-8 block text-xl font-black text-[#102d42]">Ambiente</strong>
              <span className="mt-2 block text-sm text-slate-500">Campanas · extracción</span>
            </a>
          </div>
        </div>
      </section>
    );
  }

  if (option === 4) {
    return (
      <section className="relative overflow-hidden bg-[#0b2b40] text-white">
        <HeroBackground src={heroBackgroundTwo} overlay="bg-[#082237]/80" position="center" />
        {selector}
        <div className="absolute inset-y-0 right-0 hidden w-[42%] bg-[var(--brand)]/70 lg:block" />
        <div className="absolute -left-24 top-32 size-72 rounded-full border-[70px] border-white/[0.035]" />

        <div className="relative mx-auto grid min-h-[720px] max-w-[1440px] items-center gap-10 px-4 pb-14 pt-24 sm:px-6 lg:grid-cols-[1.08fr_0.92fr] lg:px-10">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-white/70">
              <Settings size={15} /> Desarrollo especial
            </div>
            <h1 className="mt-7 text-[clamp(3.2rem,7vw,7.2rem)] font-black leading-[0.88] tracking-[-0.07em]">
              Tu proceso primero. <span className="text-[#ff9a5b]">El equipo después.</span>
            </h1>
            <p className="mt-8 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
              Partimos de lo que necesitas producir, del espacio disponible y de tu operación para diseñar una solución industrial que realmente encaje.
            </p>
            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="mt-9 inline-flex min-h-13 items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-7 text-sm font-black text-white"
            >
              Diseñar mi solución <ArrowRight size={18} />
            </a>
          </div>

          <div className="relative lg:pl-10">
            <div className="grid gap-3">
              {[
                ["01", "Entendemos tu proceso", "Producción, capacidad, energía y espacio."],
                ["02", "Diseñamos contigo", "Equipo, distribución y requerimientos técnicos."],
                ["03", "Fabricamos e instalamos", "Una solución lista para trabajar."],
              ].map(([number, title, text]) => (
                <div key={number} className="rounded-[1.75rem] border border-white/15 bg-white/[0.08] p-6 backdrop-blur">
                  <span className="text-xs font-black tracking-[0.18em] text-[#ffc09a]">{number}</span>
                  <strong className="mt-3 block text-xl font-black">{title}</strong>
                  <span className="mt-2 block text-sm leading-6 text-white/65">{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (option === 5) {
    return (
      <section className="relative overflow-hidden border-b border-slate-200 bg-[#f6f9fb]">
        <HeroBackground src={heroBackgroundOne} overlay="bg-[#edf4f8]/88" position="center 40%" />
        {selector}
        <div className="mx-auto max-w-[1440px] px-4 pb-16 pt-24 sm:px-6 lg:px-10 lg:pb-24">
          <div className="rounded-[2.5rem] bg-white p-6 shadow-[0_30px_80px_rgba(13,43,64,0.10)] sm:p-10 lg:p-14">
            <div className="grid gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--accent)]">
                  Gaspronal Industrias y Servicios
                </p>
                <h1 className="mt-5 text-[clamp(2.8rem,6vw,6rem)] font-black leading-[0.92] tracking-[-0.06em] text-[#102d42]">
                  Una sola empresa para resolver tu <span className="text-[var(--brand)]">operación industrial.</span>
                </h1>
                <p className="mt-7 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
                  Fabricación de equipos, redes de gas, extracción, instalación y soporte técnico con un mismo equipo.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-13 items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-6 text-sm font-black text-white"
                  >
                    Hablar con un asesor <ArrowRight size={18} />
                  </a>
                  <a
                    href="#servicios"
                    className="inline-flex min-h-13 items-center justify-center rounded-full border border-slate-300 px-6 text-sm font-black text-[#102d42]"
                  >
                    Ver capacidades
                  </a>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {services.map((service) => {
                  const Icon = service.icon;
                  return (
                    <div key={service.title} className="rounded-[1.75rem] border border-slate-200 bg-[#f7fafc] p-6">
                      <Icon size={24} className="text-[var(--brand)]" />
                      <strong className="mt-7 block text-lg font-black text-[#102d42]">{service.title}</strong>
                      <p className="mt-2 text-sm leading-6 text-slate-500">{service.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden bg-[#0b2b40] text-white">
      <HeroBackground src={heroBackgroundOne} overlay="bg-[#082237]/78" position="center" />
      {selector}
      <div className="absolute inset-0">
        <div className="absolute right-[-8%] top-[-18%] size-[620px] rounded-full border-[120px] border-white/[0.035]" />
        <div className="absolute bottom-[-28%] left-[18%] size-[520px] rounded-full border-[100px] border-white/[0.03]" />
      </div>

      <div className="relative mx-auto grid min-h-[760px] max-w-[1440px] gap-10 px-4 pb-16 pt-24 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center lg:px-10">
        <div className="max-w-5xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-white/70">
            <ShieldCheck size={15} className="text-[#ff9a5b]" />
            Industria alimentaria · Gas · Extracción
          </div>
          <h1 className="mt-7 text-[clamp(3.4rem,8vw,8rem)] font-black leading-[0.84] tracking-[-0.075em]">
            Ingeniería que <span className="text-[#ff9a5b]">mueve tu negocio.</span>
          </h1>
          <p className="mt-8 max-w-2xl text-base leading-7 text-slate-300 sm:text-xl sm:leading-8">
            Diseñamos y fabricamos equipos industriales en acero inoxidable, instalamos redes de gas y desarrollamos soluciones de extracción para operaciones que exigen rendimiento.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-[var(--accent)] px-7 text-sm font-black text-white transition hover:bg-[var(--accent-hover)]"
            >
              Cotizar mi proyecto <ArrowRight size={18} />
            </a>
            <a
              href="#productos"
              className="inline-flex min-h-14 items-center justify-center rounded-full border border-white/20 bg-white/5 px-7 text-sm font-black text-white transition hover:bg-white/10"
            >
              Ver productos
            </a>
          </div>
        </div>

        <div className="grid gap-3 self-end lg:self-center">
          {[
            ["Fabricamos", "Equipos industriales en acero inoxidable"],
            ["Instalamos", "Gas natural, propano y extracción"],
            ["Respondemos", "Servicio técnico y mantenimiento"],
          ].map(([title, text], index) => (
            <div
              key={title}
              className={
                "rounded-[1.75rem] border p-6 backdrop-blur " +
                (index === 0
                  ? "border-[#ff9a5b]/40 bg-[#ff9a5b]/10"
                  : "border-white/10 bg-white/[0.05]")
              }
            >
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/45">0{index + 1}</span>
              <strong className="mt-3 block text-2xl font-black">{title}</strong>
              <span className="mt-2 block text-sm leading-6 text-slate-300">{text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
