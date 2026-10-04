"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FiArrowLeft, FiPlus, FiSave, FiTag, FiTrash2 } from "react-icons/fi";

type Category={id:number;name:string;slug:string;description?:string|null;items_count?:number};

function slugify(v:string){
  return v.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
}

export default function CatalogCategoriesPage(){
  const [items,setItems]=useState<Category[]>([]);
  const [name,setName]=useState("");
  const [message,setMessage]=useState("");

  async function load(){
    const r=await fetch("/api/admin/catalog/categories",{cache:"no-store"});
    const j=await r.json().catch(()=>({}));
    setItems(j.data??[]);
  }

  useEffect(()=>{void load();},[]);

  async function create(e:React.FormEvent){
    e.preventDefault();
    setMessage("");
    const r=await fetch("/api/admin/catalog/categories",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({name,slug:slugify(name),is_active:true}),
    });
    const j=await r.json().catch(()=>({}));
    if(!r.ok){setMessage(j.message??"No fue posible crear la categoría.");return;}
    setName("");
    await load();
  }

  async function remove(id:number){
    if(!confirm("¿Eliminar esta categoría?"))return;
    const r=await fetch(`/api/admin/catalog/categories/${id}`,{method:"DELETE"});
    const j=await r.json().catch(()=>({}));
    if(!r.ok){setMessage(j.message??"No fue posible eliminar la categoría.");return;}
    await load();
  }

  return <div className="w-full max-w-none space-y-6">
    <div>
      <Link href="/dashboard/catalogo" className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[var(--border)] px-3 text-sm font-medium">
        <FiArrowLeft/>Volver al catálogo
      </Link>
    </div>

    <header className="flex flex-col gap-4 border-b border-[var(--border)] pb-5 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <span className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--brand)]">Catálogo</span>
        <h1 className="mt-2 flex items-center gap-3 text-3xl font-bold"><FiTag className="text-[var(--brand)]"/>Categorías</h1>
      </div>

      <form onSubmit={create} className="flex w-full max-w-xl gap-2 lg:w-auto">
        <input required value={name} onChange={e=>setName(e.target.value)} placeholder="Nueva categoría" className="min-h-11 min-w-0 flex-1 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3"/>
        <button className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[var(--brand)] px-4 font-semibold text-white"><FiPlus/>Crear</button>
      </form>
    </header>

    <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
      <table className="w-full border-collapse text-left">
        <thead className="border-b border-[var(--border)] bg-[var(--app-bg)]">
          <tr className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--muted)]">
            <th className="px-5 py-4">Categoría</th>
            <th className="px-5 py-4">Slug</th>
            <th className="px-5 py-4">Elementos</th>
            <th className="px-5 py-4 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border)]">
          {items.map(item=><tr key={item.id}>
            <td className="px-5 py-4 font-medium">{item.name}</td>
            <td className="px-5 py-4 text-sm text-[var(--muted)]">{item.slug}</td>
            <td className="px-5 py-4 text-sm">{item.items_count??0}</td>
            <td className="px-5 py-4 text-right">
              <button onClick={()=>void remove(item.id)} className="grid size-10 place-items-center rounded-xl border border-red-200 text-red-600" aria-label="Eliminar categoría" title="Eliminar categoría"><FiTrash2/></button>
            </td>
          </tr>)}
        </tbody>
      </table>
    </section>

    {message&&<p className="text-sm font-medium text-red-700">{message}</p>}
  </div>;
}
