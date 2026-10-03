"use client";

import Link from "next/link";
import { ArrowLeft, ExternalLink, Save } from "lucide-react";
import { use, useEffect, useState } from "react";

type Category = { id:number; name:string; slug:string };
type PostForm = {
  title:string;
  slug:string;
  excerpt:string;
  content:string;
  category_id:string;
  status:"draft"|"published"|"archived";
  seo_title:string;
  seo_description:string;
};
type Post = {
  id:number;
  title:string;
  slug:string;
  excerpt?:string|null;
  content?:string|null;
  category_id:number;
  status:"draft"|"published"|"archived";
  seo_title?:string|null;
  seo_description?:string|null;
  public_url:string;
};

function slugify(v:string){
  return v.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
}

export default function EditGasproNotaPage({ params }:{ params:Promise<{id:string}> }){
  const { id } = use(params);
  const [categories,setCategories]=useState<Category[]>([]);
  const [publicUrl,setPublicUrl]=useState("");
  const [form,setForm]=useState<PostForm>({
    title:"",slug:"",excerpt:"",content:"",category_id:"",status:"draft",seo_title:"",seo_description:""
  });
  const [loading,setLoading]=useState(true);
  const [message,setMessage]=useState("");

  useEffect(()=>{
    async function load(){
      const [postResponse,categoriesResponse]=await Promise.all([
        fetch(`/api/admin/content/posts/${id}`),
        fetch("/api/admin/content/post-categories")
      ]);
      const postJson=await postResponse.json();
      const categoriesJson=await categoriesResponse.json();

      if(!postResponse.ok){
        setMessage(postJson.message??"No fue posible cargar la publicación.");
        setLoading(false);
        return;
      }

      const post:Post=postJson.data;
      setCategories(categoriesJson.data??[]);
      setPublicUrl(post.public_url);
      setForm({
        title:post.title,
        slug:post.slug,
        excerpt:post.excerpt??"",
        content:post.content??"",
        category_id:String(post.category_id),
        status:post.status,
        seo_title:post.seo_title??"",
        seo_description:post.seo_description??""
      });
      setLoading(false);
    }
    void load();
  },[id]);

  async function save(e:React.FormEvent){
    e.preventDefault();
    setMessage("");

    const response=await fetch(`/api/admin/content/posts/${id}`,{
      method:"PUT",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        ...form,
        category_id:Number(form.category_id),
        excerpt:form.excerpt||null,
        content:form.content||null,
        seo_title:form.seo_title||null,
        seo_description:form.seo_description||null
      })
    });

    const json=await response.json();
    if(!response.ok){
      setMessage(json.message??"No fue posible guardar los cambios.");
      return;
    }

    setPublicUrl(json.data.public_url??publicUrl);
    setMessage("Publicación actualizada correctamente.");
  }

  if(loading) return <div className="mx-auto w-full max-w-5xl py-8 text-sm text-[var(--muted)]">Cargando publicación…</div>;

  return <div className="mx-auto w-full max-w-5xl space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <Link href="/dashboard/gaspro-notas" className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[var(--border)] px-3 text-sm font-medium"><ArrowLeft size={16}/>Volver</Link>
      {publicUrl&&<a href={`https://www.gaspronal.com${publicUrl}`} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[var(--border)] px-3 text-sm font-medium"><ExternalLink size={16}/>Ver original</a>}
    </div>

    <header>
      <span className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--brand)]">Contenido</span>
      <h1 className="mt-2 text-3xl font-bold">Editar Gaspro-nota</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">Edita el contenido manteniendo el slug histórico cuando tenga valor SEO.</p>
    </header>

    <form onSubmit={save} className="space-y-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 md:col-span-2"><span className="text-sm font-medium">Título</span><input required value={form.title} onChange={e=>setForm({...form,title:e.target.value})} className="min-h-11 w-full rounded-xl border border-[var(--border)] bg-transparent px-3"/></label>
        <label className="space-y-2"><span className="text-sm font-medium">Slug</span><input required value={form.slug} onChange={e=>setForm({...form,slug:slugify(e.target.value)})} className="min-h-11 w-full rounded-xl border border-[var(--border)] bg-transparent px-3"/></label>
        <label className="space-y-2"><span className="text-sm font-medium">Categoría</span><select required value={form.category_id} onChange={e=>setForm({...form,category_id:e.target.value})} className="min-h-11 w-full rounded-xl border border-[var(--border)] bg-transparent px-3">{categories.map(category=><option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
        <label className="space-y-2 md:col-span-2"><span className="text-sm font-medium">Resumen</span><textarea value={form.excerpt} onChange={e=>setForm({...form,excerpt:e.target.value})} rows={3} className="w-full rounded-xl border border-[var(--border)] bg-transparent p-3"/></label>
        <label className="space-y-2 md:col-span-2"><span className="text-sm font-medium">Contenido</span><textarea value={form.content} onChange={e=>setForm({...form,content:e.target.value})} rows={12} className="w-full rounded-xl border border-[var(--border)] bg-transparent p-3"/></label>
        <label className="space-y-2"><span className="text-sm font-medium">Estado</span><select value={form.status} onChange={e=>setForm({...form,status:e.target.value as PostForm["status"]})} className="min-h-11 w-full rounded-xl border border-[var(--border)] bg-transparent px-3"><option value="draft">Borrador</option><option value="published">Publicado</option><option value="archived">Archivado</option></select></label>
        <div/>
        <label className="space-y-2 md:col-span-2"><span className="text-sm font-medium">SEO title</span><input value={form.seo_title} onChange={e=>setForm({...form,seo_title:e.target.value})} className="min-h-11 w-full rounded-xl border border-[var(--border)] bg-transparent px-3"/></label>
        <label className="space-y-2 md:col-span-2"><span className="text-sm font-medium">SEO description</span><textarea value={form.seo_description} onChange={e=>setForm({...form,seo_description:e.target.value})} rows={3} className="w-full rounded-xl border border-[var(--border)] bg-transparent p-3"/></label>
      </div>

      <button className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[var(--brand)] px-5 font-semibold text-white"><Save size={17}/>Guardar cambios</button>
      {message&&<p className="text-sm font-medium text-[var(--brand)]">{message}</p>}
    </form>
  </div>;
}
