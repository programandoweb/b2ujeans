"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  FiArrowLeft,
  FiCheckCircle,
  FiHash,
  FiLink,
  FiMail,
  FiMessageCircle,
  FiSave,
  FiServer,
  FiShield,
  FiUser,
} from "react-icons/fi";

type Driver="baileys"|"smtp"|"whatsapp_link";

export default function NewChannelPage(){
  const router=useRouter();
  const [saving,setSaving]=useState(false);
  const [message,setMessage]=useState("");
  const [form,setForm]=useState({
    name:"",
    driver:"baileys" as Driver,
    whatsapp:"",
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

  async function submit(e:React.FormEvent){
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const email=form.driver==="smtp";
    const link=form.driver==="whatsapp_link";
    const channel=email?"email":"whatsapp";
    const payload:Record<string,unknown>={
      name:form.name.trim(),
      channel,
      driver:form.driver,
      enabled:link?true:form.enabled,
      priority:link?9999:Number(form.priority),
      is_fallback:link?false:form.is_fallback,
      auto_connect:link?false:form.auto_connect,
      settings:link
        ?{whatsapp:`+${form.whatsapp.replace(/\D/g,"")}`}
        :email
          ?{
              host:form.host.trim(),
              port:Number(form.port),
              secure:form.secure,
              from:form.from.trim(),
            }
          :{},
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
      setMessage(json.message??"No fue posible crear el canal.");
      return;
    }

    router.push(`/dashboard/canales/${json.data.id}/editar`);
  }

  const link=form.driver==="whatsapp_link";
  const email=form.driver==="smtp";
  const whatsapp=form.driver==="baileys";

  return <div className="w-full max-w-none space-y-6">
    <Link href="/dashboard/canales" className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[var(--border)] px-3 text-sm font-medium">
      <FiArrowLeft/>Volver a canales
    </Link>

    <header>
      <span className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--brand)]">Comunicaciones</span>
      <h1 className="mt-2 flex items-center gap-3 text-3xl font-bold">
        {email?<FiMail className="text-[var(--brand)]"/>:link?<FiLink className="text-[var(--brand)]"/>:<FiMessageCircle className="text-[var(--brand)]"/>}
        Nuevo canal
      </h1>
      {link&&<p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted)]">
        Este canal no se conecta a WhatsApp. Guarda un número identificado para utilizarlo después en botones y llamados a la acción del portal público.
      </p>}
    </header>

    <form onSubmit={submit} className="space-y-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
      <div className={`grid gap-4 ${link?"md:grid-cols-2 xl:grid-cols-3":"md:grid-cols-2 xl:grid-cols-4"}`}>
        <label className="space-y-2">
          <span className="flex items-center gap-2 text-sm font-medium"><FiMessageCircle className="text-[var(--brand)]"/>Tipo de canal</span>
          <select value={form.driver} onChange={e=>setForm({...form,driver:e.target.value as Driver})} className="min-h-11 w-full rounded-xl border border-[var(--border)] bg-transparent px-3">
            <option value="baileys">WhatsApp · Baileys</option>
            <option value="whatsapp_link">WhatsApp · Botón / enlace</option>
            <option value="smtp">Email · SMTP</option>
          </select>
        </label>

        <label className="space-y-2">
          <span className="flex items-center gap-2 text-sm font-medium"><FiUser className="text-[var(--brand)]"/>Nombre identificador</span>
          <input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder={link?"Ej. Ventas Gaspro-notas":undefined} className="min-h-11 w-full rounded-xl border border-[var(--border)] bg-transparent px-3"/>
        </label>

        {link&&<label className="space-y-2">
          <span className="flex items-center gap-2 text-sm font-medium"><FiMessageCircle className="text-[var(--brand)]"/>WhatsApp</span>
          <input required inputMode="tel" value={form.whatsapp} onChange={e=>setForm({...form,whatsapp:e.target.value})} placeholder="+57 304 552 7575" className="min-h-11 w-full rounded-xl border border-[var(--border)] bg-transparent px-3"/>
          <span className="block text-xs text-[var(--muted)]">Se guardará en formato internacional, por ejemplo +573045527575.</span>
        </label>}

        {!link&&<label className="space-y-2">
          <span className="flex items-center gap-2 text-sm font-medium"><FiHash className="text-[var(--brand)]"/>Prioridad</span>
          <input type="number" min={1} value={form.priority} onChange={e=>setForm({...form,priority:Number(e.target.value)})} className="min-h-11 w-full rounded-xl border border-[var(--border)] bg-transparent px-3"/>
        </label>}

        {!link&&<div className="grid content-end gap-2 pb-1">
          <label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" checked={form.enabled} onChange={e=>setForm({...form,enabled:e.target.checked})}/><FiCheckCircle className="text-[var(--brand)]"/>Habilitado</label>
          <label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" checked={form.is_fallback} onChange={e=>setForm({...form,is_fallback:e.target.checked})}/><FiShield className="text-[var(--brand)]"/>Fallback</label>
        </div>}
      </div>

      {whatsapp&&(
        <label className="flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" checked={form.auto_connect} onChange={e=>setForm({...form,auto_connect:e.target.checked})}/>
          <FiServer className="text-[var(--brand)]"/>Reconectar automáticamente
        </label>
      )}

      {email&&(
        <section className="grid gap-4 rounded-xl bg-[var(--app-bg)] p-4 md:grid-cols-2 xl:grid-cols-4">
          <label className="space-y-2">
            <span className="text-sm font-medium">Host SMTP</span>
            <input required value={form.host} onChange={e=>setForm({...form,host:e.target.value})} placeholder="smtp.gmail.com" className="min-h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3"/>
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
            <span className="text-sm font-medium">Usuario SMTP</span>
            <input required value={form.user} onChange={e=>setForm({...form,user:e.target.value})} className="min-h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3"/>
          </label>
          <label className="space-y-2 md:col-span-2">
            <span className="text-sm font-medium">Contraseña / App password</span>
            <input required type="password" autoComplete="new-password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} className="min-h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3"/>
          </label>
        </section>
      )}

      {link&&<div className="rounded-xl border border-[var(--border)] bg-[var(--app-bg)] p-4 text-sm leading-6 text-[var(--muted)]">
        No requiere QR, sesión, credenciales ni conexión automática. Quedará disponible como referencia administrable para botones de WhatsApp.
      </div>}

      <button disabled={saving} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[var(--brand)] px-5 font-semibold text-white disabled:opacity-50">
        <FiSave/>{saving?"Guardando…":"Crear canal"}
      </button>
      {message&&<p className="text-sm font-medium text-red-700">{message}</p>}
    </form>
  </div>;
}
