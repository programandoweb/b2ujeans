"use client";

import Link from "next/link";
import { ArrowLeft, ExternalLink, Save } from "lucide-react";
import { use, useEffect, useState } from "react";

type Category = { id:number; name:string; slug:string };

type CatalogForm = {
  type:"product"|"service";
  name:string;
  reference:string;
  slug:string;
  category_id:string;
  short_description:string;
  description:string;
  applications:string;
  status:"draft"|"published"|"archived";
  commercial_price:string;
  price_currency:string;
  price_unit:string;
  seo_title:string;
  seo_description:string;
  whatsapp_message:string;
};

type CatalogItem = {
  id:number;
  type:"product"|"service";
  name:string;
  reference?:string|null;
  slug:string;
  category_id?:number|null;
  short_description?:string|null;
  description?:string|null;
  applications?:string|null;
  status:"draft"|"published"|"archived";
  commercial_price?:string|null;
  price_currency?:string|null;
  price_unit?:string|null;
  seo_title?:string|null;
  seo_description?:string|null;
  whatsapp_message?:string|null;
  public_url:string;
};

function slugify(value:string){
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
}

export default function EditCatalogItemPage({ params }:{ params:Promise<{id:string}> }){
  const { id } = use(params);
  const [categories,setCategories]=useState<Category[]>([]);
  const [publicUrl,setPublicUrl]=useState("");
  const [loading,setLoading]=useState(true);
  const [message,setMessage]=useState("");
  const [form,setForm]=useState<CatalogForm>({
    type:"product",
    name:"",
    reference:"",
    slug:"",
    category_id:"",
    short_description:"",
    description:"",
    applications:"",
    status:"draft",
    commercial_price:"",
    price_currency:"COP",
    price_unit:"",
    seo_title:"",
    seo_description:"",
    whatsapp_message:"",
  });

  useEffect(()=>{
    async function load(){
      const [itemResponse,categoriesResponse]=await Promise.all([
        fetch(`/api/admin/catalog/items/${id}`),
        fetch("/api/admin/catalog/categories"),
      ]);
      const itemJson=await itemResponse.json();
      const categoriesJson=await categoriesResponse.json();

      if(!itemResponse.ok){
        setMessage(itemJson.message??"No fue posible cargar el producto.");
        setLoading(false);
        return;
      }

      const item:CatalogItem=itemJson.data;
      setCategories(categoriesJson.data??[]);
      setPublicUrl(item.public_url);
      setForm({
        type:item.type,
        name:item.name,
        reference:item.reference??"",
        slug:item.slug,
        category_id:item.category_id ? String(item.category_id) : "",
        short_description:item.short_description??"",
        description:item.description??"",
        applications:item.applications??"",
        status:item.status,
        commercial_price:item.commercial_price??"",
        price_currency:item.price_currency??"COP",
        price_unit:item.price_unit??"",
        seo_title:item.seo_title??"",
        seo_description:item.seo_description??"",
        whatsapp_message:item.whatsapp_message??"",
      });
      setLoading(false);
    }

    void load();
  },[id]);

  async function save(e:React.FormEvent){
    e.preventDefault();
    setMessage("");

    const response=await fetch(`/api/admin/catalog/items/${id}`,{
      method:"PUT",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        ...form,
        category_id:form.category_id ? Number(form.category_id) : null,
        reference:form.reference||null,
        short_description:form.short_description||null,
        description:form.description||null,
        applications:form.applications||null,
        seo_title:form.seo_title||null,
        seo_description:form.seo_description||null,
        whatsapp_message:form.whatsapp_message||null,
        commercial_price:form.commercial_price ? Number(form.commercial_price) : null,
        price_currency:form.price_currency||"COP",
        price_unit:form.price_unit||null,
      }),
    });

    const json=await response.json();
    if(!response.ok){
      setMessage(json.message??"No fue posible guardar los cambios.");
      return;
    }

    setPublicUrl(json.data.public_url??publicUrl);
    setMessage("Producto actualizado correctamente.");
  }

  if(loading){
    return <div className="mx-auto w-full max-w-5xl py-8 text-sm text-[var(--muted)]">Cargando producto…</div>;
  }

  return <div className="mx-auto w-full max-w-5xl space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <Link href="/dashboard/catalogo" className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[var(--border)] px-3 text-sm font-medium">
        <ArrowLeft size={16}/>Volver
      </Link>
      {publicUrl&&<a href={`https://www.gaspronal.com${publicUrl}`} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[var(--border)] px-3 text-sm font-medium">
        <ExternalLink size={16}/>Ver original
      </a>}
    </div>

    <header>
      <span className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--brand)]">Catálogo</span>
      <h1 className="mt-2 text-3xl font-bold">Editar producto o servicio</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">Compara con la publicación histórica antes de modificar slug, contenido o SEO.</p>
    </header>

    <form onSubmit={save} className="space-y-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-medium">Tipo</span>
          <select value={form.type} onChange={e=>setForm({...form,type:e.target.value as CatalogForm["type"]})} className="min-h-11 w-full rounded-xl border border-[var(--border)] bg-transparent px-3">
            <option value="product">Producto</option>
            <option value="service">Servicio</option>
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium">Categoría</span>
          <select value={form.category_id} onChange={e=>setForm({...form,category_id:e.target.value})} className="min-h-11 w-full rounded-xl border border-[var(--border)] bg-transparent px-3">
            <option value="">Sin categoría</option>
            {categories.map(category=><option key={category.id} value={category.id}>{category.name}</option>)}
          </select>
        </label>

        <label className="space-y-2 md:col-span-2">
          <span className="text-sm font-medium">Nombre</span>
          <input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} className="min-h-11 w-full rounded-xl border border-[var(--border)] bg-transparent px-3"/>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium">Referencia / tipo</span>
          <input value={form.reference} onChange={e=>setForm({...form,reference:e.target.value})} className="min-h-11 w-full rounded-xl border border-[var(--border)] bg-transparent px-3"/>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium">Slug</span>
          <input required value={form.slug} onChange={e=>setForm({...form,slug:slugify(e.target.value)})} className="min-h-11 w-full rounded-xl border border-[var(--border)] bg-transparent px-3"/>
        </label>

        <label className="space-y-2 md:col-span-2">
          <span className="text-sm font-medium">Descripción corta</span>
          <textarea value={form.short_description} onChange={e=>setForm({...form,short_description:e.target.value})} rows={3} className="w-full rounded-xl border border-[var(--border)] bg-transparent p-3"/>
        </label>

        <label className="space-y-2 md:col-span-2">
          <span className="text-sm font-medium">Descripción</span>
          <textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} rows={10} className="w-full rounded-xl border border-[var(--border)] bg-transparent p-3"/>
        </label>

        <label className="space-y-2 md:col-span-2">
          <span className="text-sm font-medium">Aplicaciones</span>
          <textarea value={form.applications} onChange={e=>setForm({...form,applications:e.target.value})} rows={4} className="w-full rounded-xl border border-[var(--border)] bg-transparent p-3"/>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium">Estado</span>
          <select value={form.status} onChange={e=>setForm({...form,status:e.target.value as CatalogForm["status"]})} className="min-h-11 w-full rounded-xl border border-[var(--border)] bg-transparent px-3">
            <option value="draft">Borrador</option>
            <option value="published">Publicado</option>
            <option value="archived">Archivado</option>
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium">Precio comercial privado</span>
          <input type="number" min="0" step="0.01" value={form.commercial_price} onChange={e=>setForm({...form,commercial_price:e.target.value})} placeholder="No visible en la web pública" className="min-h-11 w-full rounded-xl border border-[var(--border)] bg-transparent px-3"/>
          <span className="block text-xs text-[var(--muted)]">Sólo dashboard y Claudio pueden consultar este valor.</span>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-medium">Moneda</span>
          <input value={form.price_currency} maxLength={3} onChange={e=>setForm({...form,price_currency:e.target.value.toUpperCase()})} className="min-h-11 w-full rounded-xl border border-[var(--border)] bg-transparent px-3"/>
        </label>

        <label className="space-y-2 md:col-span-2">
          <span className="text-sm font-medium">Unidad del precio</span>
          <input value={form.price_unit} onChange={e=>setForm({...form,price_unit:e.target.value})} placeholder="Ej. unidad, metro, servicio" className="min-h-11 w-full rounded-xl border border-[var(--border)] bg-transparent px-3"/>
        </label>

        <label className="space-y-2 md:col-span-2">
          <span className="text-sm font-medium">SEO title</span>
          <input value={form.seo_title} onChange={e=>setForm({...form,seo_title:e.target.value})} className="min-h-11 w-full rounded-xl border border-[var(--border)] bg-transparent px-3"/>
        </label>

        <label className="space-y-2 md:col-span-2">
          <span className="text-sm font-medium">SEO description</span>
          <textarea value={form.seo_description} onChange={e=>setForm({...form,seo_description:e.target.value})} rows={3} className="w-full rounded-xl border border-[var(--border)] bg-transparent p-3"/>
        </label>

        <label className="space-y-2 md:col-span-2">
          <span className="text-sm font-medium">Mensaje de WhatsApp</span>
          <textarea value={form.whatsapp_message} onChange={e=>setForm({...form,whatsapp_message:e.target.value})} rows={3} className="w-full rounded-xl border border-[var(--border)] bg-transparent p-3"/>
        </label>
      </div>

      <button className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[var(--brand)] px-5 font-semibold text-white">
        <Save size={17}/>Guardar cambios
      </button>
      {message&&<p className="text-sm font-medium text-[var(--brand)]">{message}</p>}
    </form>
  </div>;
}
