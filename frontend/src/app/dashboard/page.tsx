"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  FiArrowUpRight,
  FiBarChart2,
  FiBookOpen,
  FiBox,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiDollarSign,
  FiFileText,
  FiMessageCircle,
  FiRefreshCw,
  FiSend,
  FiTrendingUp,
  FiUsers,
  FiWifi,
} from "react-icons/fi";

type DashboardMetrics={
  catalog:{
    total:number;
    published:number;
    products:number;
    services:number;
    publication_rate:number;
  };
  content:{
    posts_total:number;
    posts_published:number;
  };
  commercial:{
    leads_total:number;
    leads_this_month:number;
    quotes_total:number;
    quotes_pending:number;
    quotes_approved:number;
    approved_value:number;
    upcoming_appointments:number;
  };
  communications:{
    providers_total:number;
    providers_enabled:number;
    messages_30d:number;
    sent_30d:number;
    failed_30d:number;
    delivery_rate:number;
  };
  activity_7d:Array<{
    date:string;
    label:string;
    leads:number;
    quotes:number;
  }>;
  recent_quotes:Array<{
    id:number;
    number:string;
    status:string;
    currency:string;
    total:number;
    lead_name?:string|null;
    created_at:string;
  }>;
  next_appointments:Array<{
    id:number;
    scheduled_at:string;
    status:string;
    channel:string;
    lead_name?:string|null;
  }>;
  generated_at:string;
};

function money(value:number,currency="COP"){
  return new Intl.NumberFormat("es-CO",{
    style:"currency",
    currency,
    maximumFractionDigits:0,
  }).format(value||0);
}

function dateTime(value:string){
  return new Intl.DateTimeFormat("es-CO",{
    dateStyle:"medium",
    timeStyle:"short",
  }).format(new Date(value));
}

export default function DashboardPage(){
  const [data,setData]=useState<DashboardMetrics|null>(null);
  const [loading,setLoading]=useState(true);
  const [message,setMessage]=useState("");

  async function load(){
    setLoading(true);
    setMessage("");

    const response=await fetch("/api/admin/dashboard/metrics",{cache:"no-store"});
    const json=await response.json().catch(()=>({}));
    setLoading(false);

    if(!response.ok){
      setMessage(json.message??"No fue posible cargar las métricas.");
      return;
    }

    setData(json.data);
  }

  useEffect(()=>{void load();},[]);

  const activityMax=useMemo(()=>{
    if(!data)return 1;
    return Math.max(
      1,
      ...data.activity_7d.map(item=>Math.max(item.leads,item.quotes))
    );
  },[data]);

  if(loading){
    return <div className="w-full max-w-none py-10 text-sm text-[var(--muted)]">Cargando métricas del negocio…</div>;
  }

  if(!data){
    return <div className="w-full max-w-none rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">{message||"No hay métricas disponibles."}</div>;
  }

  const kpis=[
    {
      label:"Leads",
      value:data.commercial.leads_total.toLocaleString("es-CO"),
      detail:`+${data.commercial.leads_this_month} este mes`,
      icon:FiUsers,
      href:"/dashboard/comercial/propuestas",
    },
    {
      label:"Propuestas aprobadas",
      value:data.commercial.quotes_approved.toLocaleString("es-CO"),
      detail:`${data.commercial.quotes_pending} pendientes`,
      icon:FiCheckCircle,
      href:"/dashboard/comercial/propuestas",
    },
    {
      label:"Valor aprobado",
      value:money(data.commercial.approved_value),
      detail:`${data.commercial.quotes_total} propuestas totales`,
      icon:FiDollarSign,
      href:"/dashboard/comercial/propuestas",
    },
    {
      label:"Próximas citas",
      value:data.commercial.upcoming_appointments.toLocaleString("es-CO"),
      detail:"agenda comercial",
      icon:FiCalendar,
      href:"/dashboard/comercial/citas",
    },
    {
      label:"Catálogo publicado",
      value:`${data.catalog.publication_rate}%`,
      detail:`${data.catalog.published} de ${data.catalog.total} publicados`,
      icon:FiBox,
      href:"/dashboard/catalogo",
    },
    {
      label:"Entregabilidad 30 días",
      value:`${data.communications.delivery_rate}%`,
      detail:`${data.communications.sent_30d} enviados · ${data.communications.failed_30d} fallidos`,
      icon:FiSend,
      href:"/dashboard/canales",
    },
  ];

  return <div className="w-full max-w-none space-y-7">
    <header className="flex flex-col gap-4 border-b border-[var(--border)] pb-5 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <span className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--brand)]">B2UJeans · visión ejecutiva</span>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Dashboard</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">
          Estado real de catálogo, operación comercial, contenido y comunicaciones.
        </p>
      </div>

      <button
        type="button"
        onClick={()=>void load()}
        className="inline-flex min-h-11 items-center gap-2 self-start rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 text-sm font-semibold"
      >
        <FiRefreshCw/>Actualizar métricas
      </button>
    </header>

    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      {kpis.map(({label,value,detail,icon:Icon,href})=>(
        <Link
          key={label}
          href={href}
          className="group rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--brand)]"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="grid size-11 place-items-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand)]">
              <Icon size={20}/>
            </div>
            <FiArrowUpRight className="text-[var(--muted)] transition group-hover:text-[var(--brand)]"/>
          </div>
          <p className="mt-5 text-xs font-bold uppercase tracking-[0.12em] text-[var(--muted)]">{label}</p>
          <strong className="mt-2 block text-2xl font-bold tracking-tight">{value}</strong>
          <span className="mt-1 block text-xs text-[var(--muted)]">{detail}</span>
        </Link>
      ))}
    </section>

    <section className="grid gap-6 xl:grid-cols-[1.4fr_.6fr]">
      <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-bold"><FiBarChart2 className="text-[var(--brand)]"/>Actividad comercial · 7 días</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">Leads y propuestas creadas por día.</p>
          </div>
          <span className="rounded-full bg-[var(--brand-soft)] px-3 py-1 text-xs font-semibold text-[var(--brand)]">Datos reales</span>
        </div>

        <div className="mt-6 grid grid-cols-7 gap-3">
          {data.activity_7d.map(item=>(
            <div key={item.date} className="min-w-0">
              <div className="flex h-48 items-end justify-center gap-1 rounded-xl bg-[var(--app-bg)] px-2 py-3">
                <div
                  className="w-1/2 rounded-t-md bg-[var(--brand)]"
                  style={{height:`${Math.max(6,(item.leads/activityMax)*100)}%`}}
                  title={`${item.leads} leads`}
                />
                <div
                  className="w-1/2 rounded-t-md bg-[var(--accent)]"
                  style={{height:`${Math.max(6,(item.quotes/activityMax)*100)}%`}}
                  title={`${item.quotes} propuestas`}
                />
              </div>
              <p className="mt-2 truncate text-center text-xs font-semibold">{item.label}</p>
              <p className="mt-1 text-center text-[11px] text-[var(--muted)]">{item.leads} / {item.quotes}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap gap-4 text-xs text-[var(--muted)]">
          <span className="inline-flex items-center gap-2"><span className="size-2 rounded-full bg-[var(--brand)]"/>Leads</span>
          <span className="inline-flex items-center gap-2"><span className="size-2 rounded-full bg-[var(--accent)]"/>Propuestas</span>
        </div>
      </article>

      <article className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
        <h2 className="flex items-center gap-2 text-lg font-bold"><FiTrendingUp className="text-[var(--brand)]"/>Pulso del sistema</h2>

        <div className="mt-5 space-y-4">
          <MetricRow
            icon={<FiBox/>}
            label="Productos"
            value={data.catalog.products}
            detail={`${data.catalog.services} servicios`}
          />
          <MetricRow
            icon={<FiBookOpen/>}
            label="Gaspro-notas"
            value={data.content.posts_published}
            detail={`${data.content.posts_total} totales`}
          />
          <MetricRow
            icon={<FiWifi/>}
            label="Canales activos"
            value={data.communications.providers_enabled}
            detail={`${data.communications.providers_total} configurados`}
          />
          <MetricRow
            icon={<FiMessageCircle/>}
            label="Mensajes 30 días"
            value={data.communications.messages_30d}
            detail={`${data.communications.failed_30d} fallidos`}
          />
        </div>
      </article>
    </section>

    <section className="grid gap-6 xl:grid-cols-2">
      <article className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
        <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
          <div>
            <h2 className="flex items-center gap-2 font-bold"><FiFileText className="text-[var(--brand)]"/>Propuestas recientes</h2>
            <p className="mt-1 text-xs text-[var(--muted)]">Últimos movimientos comerciales registrados.</p>
          </div>
          <Link href="/dashboard/comercial/propuestas" className="text-sm font-semibold text-[var(--brand)]">Ver todas</Link>
        </div>

        <div className="divide-y divide-[var(--border)]">
          {data.recent_quotes.length===0&&<p className="px-5 py-10 text-center text-sm text-[var(--muted)]">No hay propuestas todavía.</p>}
          {data.recent_quotes.map(quote=>(
            <Link key={quote.id} href={`/dashboard/comercial/propuestas/${quote.id}`} className="flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-[var(--app-bg)]">
              <div className="min-w-0">
                <strong className="block truncate text-sm">{quote.number} · {quote.lead_name||"Sin lead"}</strong>
                <span className="mt-1 block text-xs text-[var(--muted)]">{dateTime(quote.created_at)}</span>
              </div>
              <div className="text-right">
                <strong className="block text-sm">{money(quote.total,quote.currency||"COP")}</strong>
                <span className={`mt-1 inline-block rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                  quote.status==="approved"
                    ?"bg-emerald-50 text-emerald-700"
                    :"bg-amber-50 text-amber-800"
                }`}>
                  {quote.status==="approved"?"Aprobada":"Pendiente"}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </article>

      <article className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
        <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
          <div>
            <h2 className="flex items-center gap-2 font-bold"><FiClock className="text-[var(--brand)]"/>Próximas citas</h2>
            <p className="mt-1 text-xs text-[var(--muted)]">Agenda comercial pendiente.</p>
          </div>
          <Link href="/dashboard/comercial/citas" className="text-sm font-semibold text-[var(--brand)]">Ver agenda</Link>
        </div>

        <div className="divide-y divide-[var(--border)]">
          {data.next_appointments.length===0&&<p className="px-5 py-10 text-center text-sm text-[var(--muted)]">No hay citas próximas.</p>}
          {data.next_appointments.map(item=>(
            <div key={item.id} className="flex items-center justify-between gap-4 px-5 py-4">
              <div className="min-w-0">
                <strong className="block truncate text-sm">{item.lead_name||"Lead sin nombre"}</strong>
                <span className="mt-1 block text-xs text-[var(--muted)]">{item.channel}</span>
              </div>
              <div className="text-right">
                <strong className="block text-sm">{dateTime(item.scheduled_at)}</strong>
                <span className="mt-1 inline-block text-xs text-[var(--muted)]">{item.status}</span>
              </div>
            </div>
          ))}
        </div>
      </article>
    </section>

    <p className="text-right text-xs text-[var(--muted)]">
      Última lectura: {dateTime(data.generated_at)}
    </p>
  </div>;
}

function MetricRow({
  icon,
  label,
  value,
  detail,
}:{
  icon:React.ReactNode;
  label:string;
  value:number|string;
  detail:string;
}){
  return <div className="flex items-center justify-between gap-4 rounded-xl bg-[var(--app-bg)] p-4">
    <div className="flex min-w-0 items-center gap-3">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand)]">{icon}</span>
      <div className="min-w-0">
        <strong className="block truncate text-sm">{label}</strong>
        <span className="block truncate text-xs text-[var(--muted)]">{detail}</span>
      </div>
    </div>
    <strong className="text-xl">{value}</strong>
  </div>;
}
