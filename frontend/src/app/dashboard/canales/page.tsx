"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  FiChevronLeft,
  FiChevronRight,
  FiEdit2,
  FiMail,
  FiMessageCircle,
  FiPlus,
  FiRefreshCw,
  FiSend,
  FiTrash2,
  FiWifi,
  FiWifiOff,
} from "react-icons/fi";

type Channel="whatsapp"|"email";
type Provider={
  id:string;
  name:string;
  channel:Channel;
  driver:"baileys"|"smtp";
  is_fallback:boolean;
  priority:number;
  auto_connect:boolean;
  enabled:boolean;
  settings:Record<string,unknown>;
  has_credentials:boolean;
};
type RuntimeProvider=Provider&{
  runtime_status:"disconnected"|"connecting"|"qr_pending"|"connected"|"ready"|"error";
  phone_number?:string;
  display_name?:string;
  last_error?:string;
};
type PaginationMeta={
  current_page:number;
  last_page:number;
  per_page:number;
  total:number;
  from:number|null;
  to:number|null;
};

export default function ChannelsPage(){
  const [providers,setProviders]=useState<Provider[]>([]);
  const [runtime,setRuntime]=useState<RuntimeProvider[]>([]);
  const [page,setPage]=useState(1);
  const [meta,setMeta]=useState<PaginationMeta>({
    current_page:1,last_page:1,per_page:25,total:0,from:null,to:null,
  });
  const [loading,setLoading]=useState(true);
  const [message,setMessage]=useState("");

  async function load(targetPage=page){
    setLoading(true);
    setMessage("");

    const [providersResponse,runtimeResponse]=await Promise.all([
      fetch(`/api/admin/communications/providers?page=${targetPage}&per_page=25`,{cache:"no-store"}),
      fetch("/api/channels",{cache:"no-store"}),
    ]);

    const providersJson=await providersResponse.json().catch(()=>({}));
    const runtimeJson=await runtimeResponse.json().catch(()=>({}));

    if(!providersResponse.ok){
      setMessage(providersJson.message??"No fue posible cargar los canales.");
      setLoading(false);
      return;
    }

    setProviders(providersJson.data??[]);
    setRuntime(runtimeResponse.ok?(runtimeJson.data??[]):[]);
    setMeta({
      current_page:Number(providersJson.current_page??targetPage),
      last_page:Number(providersJson.last_page??1),
      per_page:Number(providersJson.per_page??25),
      total:Number(providersJson.total??0),
      from:providersJson.from??null,
      to:providersJson.to??null,
    });
    setPage(Number(providersJson.current_page??targetPage));
    setLoading(false);
  }

  useEffect(()=>{
    void load(1);
    const timer=window.setInterval(()=>void load(page),10000);
    return ()=>window.clearInterval(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  const runtimeMap=useMemo(()=>new Map(runtime.map(item=>[String(item.id),item])),[runtime]);

  async function runtimeAction(provider:Provider,action:"connect"|"disconnect"){
    const response=await fetch(`/api/channels/${provider.id}/${action}`,{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({logout:false}),
    });
    const json=await response.json().catch(()=>({}));
    if(!response.ok){
      setMessage(json.message??"No fue posible cambiar el estado del canal.");
      return;
    }
    await load(page);
  }

  async function test(provider:Provider){
    const recipient=window.prompt(
      provider.channel==="whatsapp"
        ?"Número destino con indicativo, por ejemplo 573001234567"
        :"Email destino"
    );
    if(!recipient)return;

    const text=window.prompt("Mensaje de prueba","Prueba de canal Gaspronal");
    if(!text)return;

    const subject=provider.channel==="email"
      ? window.prompt("Asunto","Prueba Gaspronal")??"Prueba Gaspronal"
      : undefined;

    const response=await fetch(`/api/channels/${provider.id}/test`,{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({recipient,text,subject}),
    });
    const json=await response.json().catch(()=>({}));
    setMessage(response.ok?"Mensaje de prueba enviado.":json.message??"Falló el envío de prueba.");
  }

  async function remove(provider:Provider){
    if(!confirm(`¿Eliminar el proveedor "${provider.name}"?`))return;

    if(provider.driver==="baileys"){
      await fetch(`/api/channels/${provider.id}/disconnect`,{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({logout:true}),
      }).catch(()=>undefined);
    }

    const response=await fetch(`/api/admin/communications/providers/${provider.id}`,{method:"DELETE"});
    if(!response.ok){
      const json=await response.json().catch(()=>({}));
      setMessage(json.message??"No fue posible eliminar el proveedor.");
      return;
    }

    const targetPage=providers.length===1&&page>1?page-1:page;
    await load(targetPage);
  }

  function goToPage(nextPage:number){
    if(nextPage<1||nextPage>meta.last_page||nextPage===page)return;
    void load(nextPage);
  }

  const pageNumbers=Array.from(
    {length:Math.min(5,meta.last_page)},
    (_,index)=>{
      if(meta.last_page<=5)return index+1;
      const start=Math.min(Math.max(page-2,1),meta.last_page-4);
      return start+index;
    }
  );

  return <div className="w-full max-w-none space-y-6">
    <header className="flex flex-col gap-4 border-b border-[var(--border)] pb-5 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <span className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--brand)]">Comunicaciones</span>
        <h1 className="mt-2 flex items-center gap-3 text-3xl font-bold">
          <FiMessageCircle className="text-[var(--brand)]"/>
          Canales
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">
          Proveedores de WhatsApp y Email usados por la plataforma y los agentes.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 lg:justify-end">
        <button
          type="button"
          onClick={()=>void load(page)}
          className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 text-sm font-semibold"
        >
          <FiRefreshCw/>Actualizar
        </button>
        <Link
          href="/dashboard/canales/nuevo"
          className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[var(--brand)] px-4 text-sm font-semibold text-white"
        >
          <FiPlus/>Nuevo canal
        </Link>
      </div>
    </header>

    <div className="flex items-center justify-between gap-3">
      <p className="text-sm text-[var(--muted)]">
        {meta.total>0?`Mostrando ${meta.from}–${meta.to} de ${meta.total}`:"0 registros"}
      </p>
    </div>

    <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] border-collapse text-left">
          <thead className="border-b border-[var(--border)] bg-[var(--app-bg)]">
            <tr className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--muted)]">
              <th className="px-5 py-4">Proveedor</th>
              <th className="px-5 py-4">Canal</th>
              <th className="px-5 py-4">Prioridad</th>
              <th className="px-5 py-4">Modo</th>
              <th className="px-5 py-4">Estado</th>
              <th className="px-5 py-4 text-right">Acciones</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[var(--border)]">
            {loading&&<tr><td colSpan={6} className="px-5 py-10 text-center text-sm text-[var(--muted)]">Cargando canales…</td></tr>}

            {!loading&&providers.map(provider=>{
              const runtimeProvider=runtimeMap.get(String(provider.id));
              const status=runtimeProvider?.runtime_status??(provider.enabled&&provider.driver==="smtp"?"ready":"disconnected");
              const connected=status==="connected"||status==="ready";

              return <tr key={provider.id} className="transition hover:bg-[var(--app-bg)]">
                <td className="px-5 py-4">
                  <strong className="block text-sm">{provider.name}</strong>
                  <span className="mt-1 block text-xs text-[var(--muted)]">{provider.driver.toUpperCase()}</span>
                </td>
                <td className="px-5 py-4">
                  <span className="inline-flex items-center gap-2 text-sm font-medium">
                    {provider.channel==="whatsapp"?<FiMessageCircle className="text-[var(--brand)]"/>:<FiMail className="text-[var(--brand)]"/>}
                    {provider.channel==="whatsapp"?"WhatsApp":"Email"}
                  </span>
                </td>
                <td className="px-5 py-4 text-sm">{provider.priority}</td>
                <td className="px-5 py-4 text-sm">{provider.is_fallback?"Fallback":"Principal"}</td>
                <td className="px-5 py-4">
                  <span className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-semibold ${
                    connected
                      ?"bg-emerald-50 text-emerald-700"
                      :status==="error"
                        ?"bg-red-50 text-red-700"
                        :"bg-slate-100 text-slate-600"
                  }`}>
                    {connected?<FiWifi/>:<FiWifiOff/>}
                    {status}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={()=>void runtimeAction(provider,connected?"disconnect":"connect")}
                      className="grid size-10 place-items-center rounded-xl border border-[var(--border)] transition hover:border-[var(--brand)] hover:text-[var(--brand)]"
                      title={connected?"Desconectar":"Conectar"}
                      aria-label={connected?"Desconectar":"Conectar"}
                    >
                      {connected?<FiWifiOff/>:<FiWifi/>}
                    </button>
                    <button
                      type="button"
                      onClick={()=>void test(provider)}
                      className="grid size-10 place-items-center rounded-xl border border-[var(--border)] transition hover:border-[var(--brand)] hover:text-[var(--brand)]"
                      title="Probar canal"
                      aria-label="Probar canal"
                    >
                      <FiSend/>
                    </button>
                    <Link
                      href={`/dashboard/canales/${provider.id}/editar`}
                      className="grid size-10 place-items-center rounded-xl border border-[var(--border)] transition hover:border-[var(--brand)] hover:text-[var(--brand)]"
                      title="Editar"
                      aria-label="Editar"
                    >
                      <FiEdit2/>
                    </Link>
                    <button
                      type="button"
                      onClick={()=>void remove(provider)}
                      className="grid size-10 place-items-center rounded-xl border border-red-200 text-red-600 transition hover:bg-red-50"
                      title="Eliminar"
                      aria-label="Eliminar"
                    >
                      <FiTrash2/>
                    </button>
                  </div>
                </td>
              </tr>;
            })}

            {!loading&&providers.length===0&&(
              <tr><td colSpan={6} className="px-5 py-12 text-center text-sm text-[var(--muted)]">No hay canales configurados.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {!loading&&meta.last_page>1&&(
        <div className="flex flex-col gap-3 border-t border-[var(--border)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-[var(--muted)]">Página {meta.current_page} de {meta.last_page}</p>

          <nav className="flex flex-wrap items-center gap-2" aria-label="Paginación de canales">
            <button
              type="button"
              onClick={()=>goToPage(page-1)}
              disabled={page<=1}
              className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[var(--border)] px-3 text-sm font-semibold disabled:opacity-40"
            >
              <FiChevronLeft/>Anterior
            </button>

            {pageNumbers.map(number=>(
              <button
                key={number}
                type="button"
                onClick={()=>goToPage(number)}
                aria-current={number===page?"page":undefined}
                className={`grid size-10 place-items-center rounded-xl border text-sm font-semibold ${
                  number===page
                    ?"border-[var(--brand)] bg-[var(--brand)] text-white"
                    :"border-[var(--border)]"
                }`}
              >
                {number}
              </button>
            ))}

            <button
              type="button"
              onClick={()=>goToPage(page+1)}
              disabled={page>=meta.last_page}
              className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[var(--border)] px-3 text-sm font-semibold disabled:opacity-40"
            >
              Siguiente<FiChevronRight/>
            </button>
          </nav>
        </div>
      )}
    </section>

    {message&&<p className="text-sm font-medium text-[var(--brand)]">{message}</p>}
  </div>;
}
