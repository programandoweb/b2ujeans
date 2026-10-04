"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import {
  FiArrowLeft,
  FiCheckCircle,
  FiHash,
  FiMail,
  FiMessageCircle,
  FiSave,
  FiServer,
  FiShield,
  FiUser,
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

export default function EditChannelPage({params}:{params:Promise<{id:string}>}){
  const {id}=use(params);
  const [loading,setLoading]=useState(true);
  const [saving,setSaving]=useState(false);
  const [message,setMessage]=useState("");
  const [provider,setProvider]=useState<Provider|null>(null);
  const [form,setForm]=useState({
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
  });

  useEffect(()=>{
    async function load(){
      const response=await fetch(`/api/admin/communications/providers/${id}`,{cache:"no-store"});
      const json=await response.json().catch(()=>({}));
      if(!response.ok){
        setMessage(json.message??"No fue posible cargar el canal.");
        setLoading(false);
        return;
      }

      const item:Provider=json.data;
      const settings=item.settings??{};
      setProvider(item);
      setForm({
        name:item.name,
        channel:item.channel,
        priority:item.priority,
        is_fallback:item.is_fallback,
        enabled:item.enabled,
        auto_connect:item.auto_connect,
        host:String(settings.host??""),
        port:Number(settings.port??587),
        secure:Boolean(settings.secure??false),
        from:String(settings.from??""),
        user:"",
        password:"",
      });
      setLoading(false);
    }
    void load();
  },[id]);

  async function submit(e:React.FormEvent){
    e.preventDefault();
    if(!provider)return;

    setSaving(true);
    setMessage("");

    const email=form.channel==="email";
    const payload:Record<string,unknown>={
      name:form.name.trim(),
      channel:form.channel,
      driver:email?"smtp":"baileys",
      priority:Number(form.priority),
      is_fallback:form.is_fallback,
      enabled:form.enabled,
      auto_connect:form.auto_connect,
      settings:email?{
        host:form.host.trim(),
        port:Number(form.port),
        secure:form.secure,
        from:form.from.trim(),
      }:{},
    };
    if(email&&(form.user.trim()||form.password)){
      payload.credentials={user:form.user.trim(),password:form.password};
    }

    const response=await fetch(`/api/admin/communications/providers/${id}`,{
      method:"PUT",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify(payload),
    });
    const json=await response.json().catch(()=>({}));
    setSaving(false);

    if(!response.ok){
      setMessage(json.message??"No fue posible guardar los cambios.");
      return;
    }

    setProvider(json.data);
    setForm(current=>({...current,user:"",password:""}));
    setMessage("Canal actualizado correctamente.");
  }

  if(loading)return <div className="w-full max-w-none py-8 text-sm text-[var(--muted)]">Cargando canal…</div>;

  return <div className="w-full max-w-none space-y-6">
    <Link href="/dashboard/canales" className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[var(--border)] px-3 text-sm font-medium">
      <FiArrowLeft/>Volver a canales
    </Link>

    <header>
      <span className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--brand)]">Comunicaciones</span>
      <h1 className="mt-2 flex items-center gap-3 text-3xl font-bold">
        {form.channel==="whatsapp"?<FiMessageCircle className="text-[var(--brand)]"/>:<FiMail className="text-[var(--brand)]"/>}
        Editar canal
      </h1>
    </header>

    <form onSubmit={submit} className="space-y-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <label className="space-y-2">
          <span className="flex items-center gap-2 text-sm font-medium"><FiMessageCircle className="text-[var(--brand)]"/>Canal</span>
          <select value={form.channel} onChange={e=>setForm({...form,channel:e.target.value as Channel})} className="min-h-11 w-full rounded-xl border border-[var(--border)] bg-transparent px-3">
            <option value="whatsapp">WhatsApp · Baileys</option>
            <option value="email">Email · SMTP</option>
          </select>
        </label>

        <label className="space-y-2">
          <span className="flex items-center gap-2 text-sm font-medium"><FiUser className="text-[var(--brand)]"/>Nombre</span>
          <input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} className="min-h-11 w-full rounded-xl border border-[var(--border)] bg-transparent px-3"/>
        </label>

        <label className="space-y-2">
          <span className="flex items-center gap-2 text-sm font-medium"><FiHash className="text-[var(--brand)]"/>Prioridad</span>
          <input type="number" min={1} value={form.priority} onChange={e=>setForm({...form,priority:Number(e.target.value)})} className="min-h-11 w-full rounded-xl border border-[var(--border)] bg-transparent px-3"/>
        </label>

        <div className="grid content-end gap-2 pb-1">
          <label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" checked={form.enabled} onChange={e=>setForm({...form,enabled:e.target.checked})}/><FiCheckCircle className="text-[var(--brand)]"/>Habilitado</label>
          <label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" checked={form.is_fallback} onChange={e=>setForm({...form,is_fallback:e.target.checked})}/><FiShield className="text-[var(--brand)]"/>Fallback</label>
        </div>
      </div>

      {form.channel==="whatsapp"&&(
        <label className="flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" checked={form.auto_connect} onChange={e=>setForm({...form,auto_connect:e.target.checked})}/>
          <FiServer className="text-[var(--brand)]"/>Reconectar automáticamente
        </label>
      )}

      {form.channel==="email"&&(
        <section className="grid gap-4 rounded-xl bg-[var(--app-bg)] p-4 md:grid-cols-2 xl:grid-cols-4">
          <label className="space-y-2">
            <span className="text-sm font-medium">Host SMTP</span>
            <input required value={form.host} onChange={e=>setForm({...form,host:e.target.value})} className="min-h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3"/>
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium">Puerto</span>
            <input required type="number" value={form.port} onChange={e=>setForm({...form,port:Number(e.target.value)})} className="min-h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3"/>
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium">Remitente</span>
            <input required type="email" value={form.from} onChange={e=>setForm({...form,from:e.target.value})} className="min-h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3"/>
          </label>
          <label className="flex items-end gap-2 pb-3 text-sm font-medium">
            <input type="checkbox" checked={form.secure} onChange={e=>setForm({...form,secure:e.target.checked})}/>TLS directo / secure
          </label>
          <label className="space-y-2 md:col-span-2">
            <span className="text-sm font-medium">Nuevo usuario SMTP</span>
            <input value={form.user} onChange={e=>setForm({...form,user:e.target.value})} placeholder={provider?.has_credentials?"Opcional":"Requerido"} className="min-h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3"/>
          </label>
          <label className="space-y-2 md:col-span-2">
            <span className="text-sm font-medium">Nueva contraseña</span>
            <input type="password" autoComplete="new-password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} placeholder={provider?.has_credentials?"Opcional":"Requerido"} className="min-h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3"/>
          </label>
        </section>
      )}

      <button disabled={saving} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[var(--brand)] px-5 font-semibold text-white disabled:opacity-50">
        <FiSave/>{saving?"Guardando…":"Guardar cambios"}
      </button>
      {message&&<p className="text-sm font-medium text-[var(--brand)]">{message}</p>}
    </form>
  </div>;
}
