"use client";

import Link from "next/link";
import { FileCheck2, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";

type Quote = {
  id:number;
  number:string;
  status:string;
  total:string;
  currency:string;
  created_at:string;
  created_by_agent?:string;
  lead:{name:string;email:string;whatsapp:string;source?:string};
  items:Array<{id:number}>;
};

const statusLabel:Record<string,string>={
  pending_approval:"Pendiente de aprobación",
  approved:"Aprobada",
};

export default function CommercialProposalsPage(){
  const [quotes,setQuotes]=useState<Quote[]>([]);
  const [loading,setLoading]=useState(true);
  const [message,setMessage]=useState("");

  async function load(){
    setLoading(true);
    const response=await fetch("/api/admin/commercial/quotes?per_page=100",{cache:"no-store"});
    const json=await response.json().catch(()=>({}));
    setLoading(false);
    if(!response.ok){
      setMessage(json.message??"No fue posible cargar las propuestas.");
      return;
    }
    setQuotes(json.data??[]);
  }

  useEffect(()=>{void load();},[]);

  return <div className="w-full max-w-none space-y-6">
    <div className="flex flex-wrap items-end justify-between gap-3">
      <header>
        <span className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--brand)]">Comercial</span>
        <h1 className="mt-2 text-3xl font-bold">Pedidos web y cotizaciones</h1>
        <p className="mt-2 text-sm text-[var(--muted)]">Gestiona solicitudes del carrito B2U y propuestas comerciales de los agentes. Confirma precios, disponibilidad y entrega antes de aprobar.</p>
      </header>
      <button onClick={()=>void load()} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm font-medium">
        <RefreshCw size={16}/>Actualizar
      </button>
    </div>

    <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
      {loading?<p className="p-5 text-sm text-[var(--muted)]">Cargando propuestas…</p>:quotes.length===0?
        <div className="p-8 text-center"><FileCheck2 className="mx-auto text-[var(--brand)]"/><p className="mt-3 font-semibold">No hay propuestas todavía.</p></div>:
        <div className="divide-y divide-[var(--border)]">
          {quotes.map(quote=><Link key={quote.id} href={`/dashboard/comercial/propuestas/${quote.id}`} className="grid gap-3 p-4 transition hover:bg-[var(--app-bg)] sm:grid-cols-[1fr_1.2fr_.7fr_.7fr_auto] sm:items-center">
            <div><strong className="block">{quote.number}</strong><span className="mt-1 inline-block rounded bg-[var(--app-bg)] px-2 py-0.5 text-[10px] uppercase">{quote.created_by_agent==="web_cart"?"Carrito web":"Agente comercial"}</span><span className="text-xs text-[var(--muted)]">{new Date(quote.created_at).toLocaleString("es-CO")}</span></div>
            <div><strong className="block text-sm">{quote.lead?.name}</strong><span className="block text-xs text-[var(--muted)]">{quote.lead?.email} · {quote.lead?.whatsapp}</span></div>
            <span className="text-sm">{quote.items?.length??0} ítem(s)</span>
            <strong className="text-sm">{new Intl.NumberFormat("es-CO",{style:"currency",currency:quote.currency||"COP",maximumFractionDigits:0}).format(Number(quote.total||0))}</strong>
            <span className={`rounded-full px-3 py-1 text-center text-xs font-semibold ${quote.status==="approved"?"bg-emerald-50 text-emerald-700":"bg-amber-50 text-amber-800"}`}>{statusLabel[quote.status]??quote.status}</span>
          </Link>)}
        </div>}
    </section>
    {message&&<p className="text-sm text-red-700">{message}</p>}
  </div>;
}
