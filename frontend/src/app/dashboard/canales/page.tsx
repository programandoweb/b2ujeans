"use client";

import { Mail, MessageCircle, PlugZap, Plus, RefreshCw, Save, Send, Trash2, Unplug } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type Channel = "whatsapp" | "email";
type Provider = {
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
type RuntimeProvider = Provider & {
  runtime_status:"disconnected"|"connecting"|"qr_pending"|"connected"|"ready"|"error";
  phone_number?:string;
  display_name?:string;
  qr_data_url?:string;
  last_error?:string;
};

const emptyForm={
  name:"",
  channel:"whatsapp" as Channel,
  priority:100,
  is_fallback:false,
  enabled:true,
  auto_connect:true,
  host:"",
  port:587,
  secure:false,
  from:"",
  user:"",
  password:"",
};

export default function ChannelsPage(){
  const [providers,setProviders]=useState<Provider[]>([]);
  const [runtime,setRuntime]=useState<RuntimeProvider[]>([]);
  const [form,setForm]=useState(emptyForm);
  const [loading,setLoading]=useState(true);
  const [saving,setSaving]=useState(false);
  const [message,setMessage]=useState("");

  async function load(){
    const [providersResponse,runtimeResponse]=await Promise.all([
      fetch("/api/admin/communications/providers",{cache:"no-store"}),
      fetch("/api/channels",{cache:"no-store"}),
    ]);
    const providersJson=await providersResponse.json().catch(()=>({}));
    const runtimeJson=await runtimeResponse.json().catch(()=>({}));
    if(providersResponse.ok)setProviders(providersJson.data??[]);
    if(runtimeResponse.ok)setRuntime(runtimeJson.data??[]);
    setLoading(false);
  }

  useEffect(()=>{
    void load();
    const timer=window.setInterval(()=>void load(),4000);
    return ()=>window.clearInterval(timer);
  },[]);

  async function createProvider(e:React.FormEvent){
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const email=form.channel==="email";
    const payload:Record<string,unknown>={
      name:form.name.trim(),
      channel:form.channel,
      driver:email?"smtp":"baileys",
      priority:Number(form.priority),
      is_fallback:form.is_fallback,
      auto_connect:form.auto_connect,
      enabled:form.enabled,
      settings:email?{
        host:form.host.trim(),
        port:Number(form.port),
        secure:form.secure,
        from:form.from.trim(),
      }:{},
    };
    if(email)payload.credentials={user:form.user.trim(),password:form.password};

    const response=await fetch("/api/admin/communications/providers",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify(payload),
    });
    const json=await response.json().catch(()=>({}));
    setSaving(false);

    if(!response.ok){
      setMessage(json.message??"No fue posible crear el proveedor.");
      return;
    }

    setForm(emptyForm);
    setMessage("Proveedor creado correctamente.");
    await load();
  }

  const runtimeMap=useMemo(()=>new Map(runtime.map(item=>[item.id,item])),[runtime]);

  return <div className="mx-auto w-full max-w-7xl space-y-6">
    <header>
      <span className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--brand)]">Comunicaciones</span>
      <h1 className="mt-1 text-3xl font-bold">Canales</h1>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">
        Registra múltiples proveedores de WhatsApp y Email. Los envíos intentan primero los proveedores principales por prioridad y luego los marcados como fallback.
      </p>
    </header>

    <section className="grid gap-6 xl:grid-cols-[1.2fr_.8fr]">
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold">Proveedores registrados</h2>
            <p className="text-sm text-[var(--muted)]">{providers.length} proveedor(es)</p>
          </div>
          <button type="button" onClick={()=>void load()} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm font-semibold">
            <RefreshCw size={16}/>Actualizar
          </button>
        </div>

        {loading&&<div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 text-sm text-[var(--muted)]">Cargando canales…</div>}
        {!loading&&!providers.length&&<div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface)] p-8 text-center text-sm text-[var(--muted)]">Aún no hay proveedores registrados.</div>}

        {providers.map(provider=><ProviderEditor key={provider.id} provider={provider} runtime={runtimeMap.get(provider.id)} onChanged={load}/>)}
      </div>

      <form onSubmit={createProvider} className="h-fit space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
        <div className="flex items-center gap-2"><Plus size={18} className="text-[var(--brand)]"/><h2 className="font-bold">Nuevo proveedor</h2></div>

        <label className="block space-y-2">
          <span className="text-sm font-medium">Canal</span>
          <select value={form.channel} onChange={e=>setForm(current=>({...current,channel:e.target.value as Channel}))} className="min-h-11 w-full rounded-xl border border-[var(--border)] bg-transparent px-3">
            <option value="whatsapp">WhatsApp · Baileys</option>
            <option value="email">Email · SMTP</option>
          </select>
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium">Nombre</span>
          <input required value={form.name} onChange={e=>setForm(current=>({...current,name:e.target.value}))} placeholder={form.channel==="whatsapp"?"WhatsApp Comercial":"SMTP Principal"} className="min-h-11 w-full rounded-xl border border-[var(--border)] bg-transparent px-3"/>
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block space-y-2">
            <span className="text-sm font-medium">Prioridad</span>
            <input type="number" min={1} value={form.priority} onChange={e=>setForm(current=>({...current,priority:Number(e.target.value)}))} className="min-h-11 w-full rounded-xl border border-[var(--border)] bg-transparent px-3"/>
          </label>
          <label className="flex items-end gap-2 pb-3 text-sm font-medium">
            <input type="checkbox" checked={form.is_fallback} onChange={e=>setForm(current=>({...current,is_fallback:e.target.checked}))}/>Fallback
          </label>
        </div>

        {form.channel==="email"&&<div className="space-y-3 rounded-xl bg-[var(--app-bg)] p-4">
          <div className="grid gap-3 sm:grid-cols-[1fr_100px]">
            <input required value={form.host} onChange={e=>setForm(current=>({...current,host:e.target.value}))} placeholder="smtp.gmail.com" className="min-h-11 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3"/>
            <input required type="number" value={form.port} onChange={e=>setForm(current=>({...current,port:Number(e.target.value)}))} placeholder="587" className="min-h-11 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3"/>
          </div>
          <input required type="email" value={form.from} onChange={e=>setForm(current=>({...current,from:e.target.value}))} placeholder="Email remitente" className="min-h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3"/>
          <input required value={form.user} onChange={e=>setForm(current=>({...current,user:e.target.value}))} placeholder="Usuario SMTP" className="min-h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3"/>
          <input required type="password" autoComplete="new-password" value={form.password} onChange={e=>setForm(current=>({...current,password:e.target.value}))} placeholder="Contraseña / App password" className="min-h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3"/>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.secure} onChange={e=>setForm(current=>({...current,secure:e.target.checked}))}/>TLS directo / secure</label>
        </div>}

        <label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" checked={form.enabled} onChange={e=>setForm(current=>({...current,enabled:e.target.checked}))}/>Habilitado</label>
        {form.channel==="whatsapp"&&<label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" checked={form.auto_connect} onChange={e=>setForm(current=>({...current,auto_connect:e.target.checked}))}/>Reconectar automáticamente</label>}

        <button disabled={saving} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[var(--brand)] px-4 font-semibold text-white disabled:opacity-50">
          <Save size={17}/>{saving?"Guardando…":"Crear proveedor"}
        </button>
        {message&&<p className="text-xs leading-5 text-[var(--muted)]">{message}</p>}
      </form>
    </section>
  </div>;
}

function ProviderEditor({provider,runtime,onChanged}:{provider:Provider;runtime?:RuntimeProvider;onChanged:()=>Promise<void>}){
  const settings=provider.settings??{};
  const [name,setName]=useState(provider.name);
  const [priority,setPriority]=useState(provider.priority);
  const [fallback,setFallback]=useState(provider.is_fallback);
  const [enabled,setEnabled]=useState(provider.enabled);
  const [autoConnect,setAutoConnect]=useState(provider.auto_connect);
  const [host,setHost]=useState(String(settings.host??""));
  const [port,setPort]=useState(Number(settings.port??587));
  const [secure,setSecure]=useState(Boolean(settings.secure??false));
  const [from,setFrom]=useState(String(settings.from??""));
  const [user,setUser]=useState("");
  const [password,setPassword]=useState("");
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState("");

  const status=runtime?.runtime_status??(provider.enabled&&provider.driver==="smtp"?"ready":"disconnected");

  async function save(){
    setBusy(true);setMessage("");
    const payload:Record<string,unknown>={
      name,channel:provider.channel,driver:provider.driver,
      priority:Number(priority),is_fallback:fallback,enabled,auto_connect:autoConnect,
      settings:provider.driver==="smtp"?{host,port:Number(port),secure,from}:{},
    };
    if(provider.driver==="smtp"&&(user.trim()||password))payload.credentials={user:user.trim(),password};

    const response=await fetch(`/api/admin/communications/providers/${provider.id}`,{
      method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload),
    });
    const json=await response.json().catch(()=>({}));
    setBusy(false);
    if(!response.ok){setMessage(json.message??"No fue posible guardar.");return;}
    setUser("");setPassword("");setMessage("Configuración guardada.");await onChanged();
  }

  async function runtimeAction(action:"connect"|"disconnect",logout=false){
    setBusy(true);setMessage("");
    const response=await fetch(`/api/channels/${provider.id}/${action}`,{
      method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({logout}),
    });
    const json=await response.json().catch(()=>({}));
    setBusy(false);
    if(!response.ok){setMessage(json.message??"No fue posible cambiar la conexión.");return;}
    setMessage(action==="connect"?"Conexión iniciada.":"Proveedor desconectado.");await onChanged();
  }

  async function test(){
    const recipient=window.prompt(provider.channel==="whatsapp"?"Número destino con indicativo, por ejemplo 573001234567":"Email destino");
    if(!recipient)return;
    const text=window.prompt("Mensaje de prueba","Prueba de canal Gaspronal");
    if(!text)return;
    const subject=provider.channel==="email"?window.prompt("Asunto","Prueba Gaspronal")??"Prueba Gaspronal":undefined;

    setBusy(true);setMessage("");
    const response=await fetch(`/api/channels/${provider.id}/test`,{
      method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({recipient,text,subject}),
    });
    const json=await response.json().catch(()=>({}));
    setBusy(false);
    setMessage(response.ok?"Mensaje de prueba enviado.":json.message??"Falló el envío de prueba.");
  }

  async function remove(){
    if(!confirm(`¿Eliminar el proveedor "${provider.name}"?`))return;
    setBusy(true);
    if(provider.driver==="baileys"){
      await fetch(`/api/channels/${provider.id}/disconnect`,{
        method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({logout:true}),
      }).catch(()=>undefined);
    }
    const response=await fetch(`/api/admin/communications/providers/${provider.id}`,{method:"DELETE"});
    setBusy(false);
    if(!response.ok){const json=await response.json().catch(()=>({}));setMessage(json.message??"No fue posible eliminar.");return;}
    await onChanged();
  }

  return <article className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-[var(--brand-soft)] text-[var(--brand)]">{provider.channel==="whatsapp"?<MessageCircle size={20}/>:<Mail size={20}/>}</div>
        <div className="min-w-0">
          <input value={name} onChange={e=>setName(e.target.value)} className="w-full bg-transparent font-bold outline-none"/>
          <p className="text-xs text-[var(--muted)]">{provider.channel==="whatsapp"?"WhatsApp · Baileys":"Email · SMTP"} · {fallback?"Fallback":"Principal"}</p>
        </div>
      </div>
      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${status==="connected"||status==="ready"?"bg-emerald-50 text-emerald-700":status==="qr_pending"||status==="connecting"?"bg-amber-50 text-amber-800":status==="error"?"bg-red-50 text-red-700":"bg-slate-100 text-slate-600"}`}>{status}</span>
    </div>

    <div className="grid gap-3 sm:grid-cols-4">
      <label className="space-y-1"><span className="text-xs text-[var(--muted)]">Prioridad</span><input type="number" min={1} value={priority} onChange={e=>setPriority(Number(e.target.value))} className="min-h-10 w-full rounded-xl border border-[var(--border)] bg-transparent px-3"/></label>
      <label className="flex items-center gap-2 pt-5 text-sm"><input type="checkbox" checked={fallback} onChange={e=>setFallback(e.target.checked)}/>Fallback</label>
      <label className="flex items-center gap-2 pt-5 text-sm"><input type="checkbox" checked={enabled} onChange={e=>setEnabled(e.target.checked)}/>Habilitado</label>
      {provider.driver==="baileys"&&<label className="flex items-center gap-2 pt-5 text-sm"><input type="checkbox" checked={autoConnect} onChange={e=>setAutoConnect(e.target.checked)}/>Auto conectar</label>}
    </div>

    {provider.driver==="smtp"&&<div className="grid gap-3 rounded-xl bg-[var(--app-bg)] p-4 sm:grid-cols-2">
      <input value={host} onChange={e=>setHost(e.target.value)} placeholder="Host SMTP" className="min-h-10 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3"/>
      <input type="number" value={port} onChange={e=>setPort(Number(e.target.value))} placeholder="Puerto" className="min-h-10 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3"/>
      <input type="email" value={from} onChange={e=>setFrom(e.target.value)} placeholder="Remitente" className="min-h-10 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3"/>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={secure} onChange={e=>setSecure(e.target.checked)}/>Secure</label>
      <input value={user} onChange={e=>setUser(e.target.value)} placeholder={provider.has_credentials?"Nuevo usuario (opcional)":"Usuario SMTP"} className="min-h-10 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3"/>
      <input type="password" autoComplete="new-password" value={password} onChange={e=>setPassword(e.target.value)} placeholder={provider.has_credentials?"Nueva contraseña (opcional)":"Contraseña SMTP"} className="min-h-10 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3"/>
    </div>}

    {runtime?.qr_data_url&&<div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-center">
      <p className="mb-3 text-sm font-semibold text-amber-900">Escanea este QR desde WhatsApp → Dispositivos vinculados</p>
      <img src={runtime.qr_data_url} alt="QR de vinculación WhatsApp" className="mx-auto size-64 max-w-full rounded-lg bg-white p-2"/>
    </div>}

    {runtime?.phone_number&&<p className="text-sm text-[var(--muted)]">Número conectado: <strong className="text-[var(--app-fg)]">+{runtime.phone_number}</strong>{runtime.display_name?` · ${runtime.display_name}`:""}</p>}
    {runtime?.last_error&&<p className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">{runtime.last_error}</p>}

    <div className="flex flex-wrap gap-2">
      <button type="button" disabled={busy} onClick={()=>void save()} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[var(--brand)] px-3 text-sm font-semibold text-white disabled:opacity-50"><Save size={15}/>Guardar</button>
      <button type="button" disabled={busy} onClick={()=>void runtimeAction("connect")} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[var(--border)] px-3 text-sm font-semibold disabled:opacity-50"><PlugZap size={15}/>Conectar</button>
      {provider.driver==="baileys"&&<button type="button" disabled={busy} onClick={()=>void runtimeAction("disconnect",false)} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[var(--border)] px-3 text-sm font-semibold disabled:opacity-50"><Unplug size={15}/>Desconectar</button>}
      <button type="button" disabled={busy} onClick={()=>void test()} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[var(--border)] px-3 text-sm font-semibold disabled:opacity-50"><Send size={15}/>Probar</button>
      <button type="button" disabled={busy} onClick={()=>void remove()} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-red-200 px-3 text-sm font-semibold text-red-700 disabled:opacity-50"><Trash2 size={15}/>Eliminar</button>
    </div>
    {message&&<p className="text-xs text-[var(--muted)]">{message}</p>}
  </article>;
}
