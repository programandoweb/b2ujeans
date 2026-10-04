"use client";

import { CalendarDays, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";

type Appointment={
 id:number;
 scheduled_at:string;
 status:string;
 channel:string;
 notes?:string|null;
 lead:{name:string;email:string;whatsapp:string};
};

export default function CommercialAppointmentsPage(){
 const [items,setItems]=useState<Appointment[]>([]);
 const [loading,setLoading]=useState(true);
 const [message,setMessage]=useState("");

 async function load(){
  setLoading(true);
  const response=await fetch("/api/admin/commercial/appointments?per_page=100",{cache:"no-store"});
  const json=await response.json().catch(()=>({}));
  setLoading(false);
  if(!response.ok){setMessage(json.message??"No fue posible cargar las citas.");return;}
  setItems(json.data??[]);
 }

 useEffect(()=>{void load();},[]);

 return <div className="mx-auto w-full max-w-7xl space-y-6">
  <div className="flex flex-wrap items-end justify-between gap-3">
   <header>
    <span className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--brand)]">Comercial</span>
    <h1 className="mt-2 text-3xl font-bold">Citas agendadas por Claudio</h1>
    <p className="mt-2 text-sm text-[var(--muted)]">Agenda comercial generada por el agente y asociada a cada lead.</p>
   </header>
   <button onClick={()=>void load()} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm font-medium"><RefreshCw size={16}/>Actualizar</button>
  </div>

  <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
   {loading?<p className="p-5 text-sm text-[var(--muted)]">Cargando citas…</p>:items.length===0?
    <div className="p-8 text-center"><CalendarDays className="mx-auto text-[var(--brand)]"/><p className="mt-3 font-semibold">No hay citas programadas.</p></div>:
    <div className="divide-y divide-[var(--border)]">
     {items.map(item=><div key={item.id} className="grid gap-3 p-4 sm:grid-cols-[.9fr_1.2fr_.8fr_1.2fr] sm:items-center">
      <div><strong className="block">{new Date(item.scheduled_at).toLocaleString("es-CO")}</strong><span className="text-xs text-[var(--muted)]">{item.channel}</span></div>
      <div><strong className="block text-sm">{item.lead?.name}</strong><span className="block text-xs text-[var(--muted)]">{item.lead?.email}</span></div>
      <div><span className="text-sm">{item.lead?.whatsapp}</span></div>
      <div><span className="block text-sm">{item.notes||"Sin notas"}</span><span className="mt-1 inline-block rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">{item.status}</span></div>
     </div>)}
    </div>}
  </section>
  {message&&<p className="text-sm text-red-700">{message}</p>}
 </div>;
}
