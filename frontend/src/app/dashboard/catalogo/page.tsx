"use client";

import { useEffect, useState } from "react";
import { Plus, Save, Trash2 } from "lucide-react";

type Category={id:number;name:string;slug:string};
type Item={id:number;type:"product"|"service";name:string;slug:string;reference?:string|null;status:string;public_url:string;category?:Category|null};
type CatalogForm={type:"product"|"service";name:string;reference:string;slug:string;category_id:string;short_description:string;description:string;status:"draft"|"published"|"archived"};

const initial:CatalogForm={type:"product",name:"",reference:"",slug:"",category_id:"",short_description:"",description:"",status:"draft"};

function slugify(v:string){return v.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");}

export default function CatalogPage(){
  const [items,setItems]=useState<Item[]>([]);
  const [categories,setCategories]=useState<Category[]>([]);
  const [filter,setFilter]=useState<"all"|"product"|"service">("all");
  const [form,setForm]=useState<CatalogForm>(initial);
  const [categoryName,setCategoryName]=useState("");
  const [message,setMessage]=useState("");

  async function load(){
    const suffix=filter==="all"?"":`?type=${filter}`;
    const [a,b]=await Promise.all([fetch("/api/admin/catalog/items"+suffix),fetch("/api/admin/catalog/categories")]);
    const aj=await a.json(); const bj=await b.json();
    setItems(aj.data??[]); setCategories(bj.data??[]);
  }

  useEffect(()=>{void load();},[filter]);

  async function createItem(e:React.FormEvent){
    e.preventDefault(); setMessage("");
    const payload={...form,category_id:form.category_id?Number(form.category_id):null,reference:form.reference||null,short_description:form.short_description||null,description:form.description||null};
    const r=await fetch("/api/admin/catalog/items",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
    const j=await r.json();
    if(!r.ok){setMessage(j.message??"No fue posible guardar.");return;}
    setForm(initial); setMessage("Guardado correctamente."); await load();
  }

  async function addCategory(e:React.FormEvent){
    e.preventDefault();
    const r=await fetch("/api/admin/catalog/categories",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:categoryName,slug:slugify(categoryName),is_active:true})});
    if(r.ok){setCategoryName("");await load();}
  }

  async function remove(id:number){if(!confirm("¿Eliminar este elemento?"))return;await fetch(`/api/admin/catalog/items/${id}`,{method:"DELETE"});await load();}

  return <div className="mx-auto w-full max-w-7xl space-y-6">
    <header>
      <span className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--brand)]">CRM / CMS</span>
      <h1 className="mt-2 text-3xl font-bold">Productos y servicios</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">Un único catálogo con tipo producto o servicio, conservando las rutas históricas.</p>
    </header>

    <div className="flex flex-wrap gap-2">
      {(["all","product","service"] as const).map(v=><button key={v} onClick={()=>setFilter(v)} className={`rounded-xl border px-4 py-2 text-sm font-semibold ${filter===v?"bg-[var(--brand)] text-white":"bg-[var(--surface)]"}`}>{v==="all"?"Todo":v==="product"?"Productos":"Servicios"}</button>)}
    </div>

    <section className="grid gap-6 xl:grid-cols-[1.3fr_.7fr]">
      <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
        <div className="border-b border-[var(--border)] px-5 py-4"><h2 className="font-semibold">Catálogo</h2></div>
        <div className="divide-y divide-[var(--border)]">
          {items.map(item=><div key={item.id} className="grid gap-3 px-5 py-4 sm:grid-cols-[1fr_auto] sm:items-center">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2"><strong>{item.name}</strong><span className="rounded-full bg-[var(--brand-soft)] px-2 py-0.5 text-xs font-semibold text-[var(--brand)]">{item.type==="product"?"Producto":"Servicio"}</span></div>
              <p className="mt-1 truncate text-sm text-[var(--muted)]">{item.public_url}</p>
              <p className="mt-1 text-xs text-[var(--muted)]">{item.category?.name??"Sin categoría"} · {item.status}</p>
            </div>
            <button onClick={()=>remove(item.id)} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[var(--border)] px-3 text-sm text-red-600"><Trash2 size={16}/>Eliminar</button>
          </div>)}
          {!items.length&&<p className="px-5 py-10 text-center text-sm text-[var(--muted)]">Aún no hay elementos.</p>}
        </div>
      </div>

      <div className="space-y-5">
        <form onSubmit={createItem} className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <div className="flex items-center gap-2"><Plus size={18}/><h2 className="font-semibold">Nuevo elemento</h2></div>
          <select value={form.type} onChange={e=>setForm({...form,type:e.target.value as CatalogForm["type"]})} className="min-h-11 w-full rounded-xl border border-[var(--border)] bg-transparent px-3"><option value="product">Producto</option><option value="service">Servicio</option></select>
          <input required value={form.name} onChange={e=>setForm({...form,name:e.target.value,slug:slugify(e.target.value)})} placeholder="Nombre" className="min-h-11 w-full rounded-xl border border-[var(--border)] bg-transparent px-3"/>
          <input value={form.reference} onChange={e=>setForm({...form,reference:e.target.value})} placeholder="Referencia / tipo" className="min-h-11 w-full rounded-xl border border-[var(--border)] bg-transparent px-3"/>
          <input required value={form.slug} onChange={e=>setForm({...form,slug:slugify(e.target.value)})} placeholder="slug" className="min-h-11 w-full rounded-xl border border-[var(--border)] bg-transparent px-3"/>
          <select value={form.category_id} onChange={e=>setForm({...form,category_id:e.target.value})} className="min-h-11 w-full rounded-xl border border-[var(--border)] bg-transparent px-3"><option value="">Sin categoría</option>{categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select>
          <textarea value={form.short_description} onChange={e=>setForm({...form,short_description:e.target.value})} placeholder="Descripción corta" rows={3} className="w-full rounded-xl border border-[var(--border)] bg-transparent p-3"/>
          <select value={form.status} onChange={e=>setForm({...form,status:e.target.value as CatalogForm["status"]})} className="min-h-11 w-full rounded-xl border border-[var(--border)] bg-transparent px-3"><option value="draft">Borrador</option><option value="published">Publicado</option><option value="archived">Archivado</option></select>
          <button className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[var(--brand)] px-4 font-semibold text-white"><Save size={17}/>Guardar</button>
        </form>

        <form onSubmit={addCategory} className="space-y-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
          <h2 className="font-semibold">Categorías</h2>
          <div className="flex gap-2"><input required value={categoryName} onChange={e=>setCategoryName(e.target.value)} placeholder="Nueva categoría" className="min-h-11 min-w-0 flex-1 rounded-xl border border-[var(--border)] bg-transparent px-3"/><button className="rounded-xl bg-[var(--brand)] px-4 text-white"><Plus size={18}/></button></div>
          <div className="flex flex-wrap gap-2">{categories.map(c=><span key={c.id} className="rounded-full border border-[var(--border)] px-3 py-1 text-xs">{c.name}</span>)}</div>
        </form>
      </div>
    </section>
    {message&&<p className="text-sm font-medium text-[var(--brand)]">{message}</p>}
  </div>;
}