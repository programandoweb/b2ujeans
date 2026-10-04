"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FiArrowLeft, FiFileText, FiLink2, FiSave, FiTag, FiType } from "react-icons/fi";

function slugify(v:string){
  return v.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
}

export default function NewCategoryPage(){
  const router=useRouter();
  const [saving,setSaving]=useState(false);
  const [message,setMessage]=useState("");
  const [form,setForm]=useState({name:"",slug:"",description:"",is_active:true});

  async function submit(e:React.FormEvent){
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const response=await fetch("/api/admin/catalog/categories",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        name:form.name.trim(),
        slug:form.slug.trim()||slugify(form.name),
        description:form.description.trim()||null,
        is_active:form.is_active,
      }),
    });
    const json=await response.json().catch(()=>({}));
    setSaving(false);

    if(!response.ok){
      setMessage(json.message??"No fue posible crear la categoría.");
      return;
    }

    router.push("/dashboard/catalogo/categorias");
  }

  return <div className="w-full max-w-none space-y-6">
    <Link href="/dashboard/catalogo/categorias" className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[var(--border)] px-3 text-sm font-medium">
      <FiArrowLeft/>Volver a categorías
    </Link>

    <header>
      <span className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--brand)]">Catálogo</span>
      <h1 className="mt-2 flex items-center gap-3 text-3xl font-bold"><FiTag className="text-[var(--brand)]"/>Nueva categoría</h1>
    </header>

    <form onSubmit={submit} className="space-y-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <label className="space-y-2 xl:col-span-2">
          <span className="flex items-center gap-2 text-sm font-medium"><FiType className="text-[var(--brand)]"/>Nombre</span>
          <input required value={form.name} onChange={e=>setForm({...form,name:e.target.value,slug:slugify(e.target.value)})} className="min-h-11 w-full rounded-xl border border-[var(--border)] bg-transparent px-3"/>
        </label>

        <label className="space-y-2 xl:col-span-2">
          <span className="flex items-center gap-2 text-sm font-medium"><FiLink2 className="text-[var(--brand)]"/>Slug</span>
          <input required value={form.slug} onChange={e=>setForm({...form,slug:slugify(e.target.value)})} className="min-h-11 w-full rounded-xl border border-[var(--border)] bg-transparent px-3"/>
        </label>

        <label className="space-y-2 md:col-span-2 xl:col-span-4">
          <span className="flex items-center gap-2 text-sm font-medium"><FiFileText className="text-[var(--brand)]"/>Descripción</span>
          <textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} rows={6} className="w-full rounded-xl border border-[var(--border)] bg-transparent p-3"/>
        </label>
      </div>

      <label className="flex items-center gap-2 text-sm font-medium">
        <input type="checkbox" checked={form.is_active} onChange={e=>setForm({...form,is_active:e.target.checked})}/>
        Categoría activa
      </label>

      <button disabled={saving} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[var(--brand)] px-5 font-semibold text-white disabled:opacity-50">
        <FiSave/>{saving?"Guardando…":"Crear categoría"}
      </button>

      {message&&<p className="text-sm font-medium text-red-700">{message}</p>}
    </form>
  </div>;
}
