"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { FiArrowLeft, FiArrowRight, FiFileText, FiGitCommit, FiLink2, FiSave } from "react-icons/fi";

type Redirect={
  id:number;
  source_path:string;
  target_path:string;
  status_code:number;
  reason?:string|null;
  is_active?:boolean;
};

export default function EditRedirectPage({params}:{params:Promise<{id:string}>}){
  const {id}=use(params);
  const [loading,setLoading]=useState(true);
  const [saving,setSaving]=useState(false);
  const [message,setMessage]=useState("");
  const [form,setForm]=useState({
    source_path:"",
    target_path:"",
    status_code:301,
    reason:"",
    is_active:true,
  });

  useEffect(()=>{
    async function load(){
      const response=await fetch(`/api/admin/seo/redirects/${id}`,{cache:"no-store"});
      const json=await response.json().catch(()=>({}));
      if(!response.ok){
        setMessage(json.message??"No fue posible cargar la redirección.");
        setLoading(false);
        return;
      }

      const item:Redirect=json.data;
      setForm({
        source_path:item.source_path,
        target_path:item.target_path,
        status_code:item.status_code,
        reason:item.reason??"",
        is_active:item.is_active??true,
      });
      setLoading(false);
    }
    void load();
  },[id]);

  function normalizePath(value:string){
    const trimmed=value.trim();
    if(!trimmed)return "";
    return trimmed.startsWith("/")?trimmed:`/${trimmed}`;
  }

  async function submit(e:React.FormEvent){
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const response=await fetch(`/api/admin/seo/redirects/${id}`,{
      method:"PUT",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        source_path:normalizePath(form.source_path),
        target_path:normalizePath(form.target_path),
        status_code:Number(form.status_code),
        reason:form.reason.trim()||null,
        is_active:form.is_active,
      }),
    });
    const json=await response.json().catch(()=>({}));
    setSaving(false);

    if(!response.ok){
      setMessage(json.message??"No fue posible guardar los cambios.");
      return;
    }

    setMessage("Redirección actualizada correctamente.");
  }

  if(loading)return <div className="w-full max-w-none py-8 text-sm text-[var(--muted)]">Cargando redirección…</div>;

  return <div className="w-full max-w-none space-y-6">
    <Link href="/dashboard/seo/redirecciones" className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[var(--border)] px-3 text-sm font-medium">
      <FiArrowLeft/>Volver a redirecciones
    </Link>

    <header>
      <span className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--brand)]">SEO</span>
      <h1 className="mt-2 flex items-center gap-3 text-3xl font-bold"><FiGitCommit className="text-[var(--brand)]"/>Editar redirección</h1>
    </header>

    <form onSubmit={submit} className="space-y-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <label className="space-y-2 xl:col-span-2">
          <span className="flex items-center gap-2 text-sm font-medium"><FiLink2 className="text-[var(--brand)]"/>URL origen</span>
          <input required value={form.source_path} onChange={e=>setForm({...form,source_path:e.target.value})} className="min-h-11 w-full rounded-xl border border-[var(--border)] bg-transparent px-3"/>
        </label>

        <label className="space-y-2 xl:col-span-2">
          <span className="flex items-center gap-2 text-sm font-medium"><FiArrowRight className="text-[var(--brand)]"/>URL destino</span>
          <input required value={form.target_path} onChange={e=>setForm({...form,target_path:e.target.value})} className="min-h-11 w-full rounded-xl border border-[var(--border)] bg-transparent px-3"/>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium">Código</span>
          <select value={form.status_code} onChange={e=>setForm({...form,status_code:Number(e.target.value)})} className="min-h-11 w-full rounded-xl border border-[var(--border)] bg-transparent px-3">
            {[301,302,307,308].map(code=><option key={code} value={code}>{code}</option>)}
          </select>
        </label>

        <label className="space-y-2 md:col-span-2 xl:col-span-3">
          <span className="flex items-center gap-2 text-sm font-medium"><FiFileText className="text-[var(--brand)]"/>Motivo</span>
          <input value={form.reason} onChange={e=>setForm({...form,reason:e.target.value})} className="min-h-11 w-full rounded-xl border border-[var(--border)] bg-transparent px-3"/>
        </label>
      </div>

      <label className="flex items-center gap-2 text-sm font-medium">
        <input type="checkbox" checked={form.is_active} onChange={e=>setForm({...form,is_active:e.target.checked})}/>
        Redirección activa
      </label>

      <button disabled={saving} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[var(--brand)] px-5 font-semibold text-white disabled:opacity-50">
        <FiSave/>{saving?"Guardando…":"Guardar cambios"}
      </button>

      {message&&<p className="text-sm font-medium text-[var(--brand)]">{message}</p>}
    </form>
  </div>;
}
