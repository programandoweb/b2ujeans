"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ExternalLink, FileText, Pencil, Save, Trash2 } from "lucide-react";

type Category={id:number;name:string;slug:string};
type Post={id:number;title:string;status:string;public_url:string;category?:Category|null};
type PostForm={title:string;slug:string;excerpt:string;content:string;category_id:string;status:"draft"|"published"|"archived"};

function slugify(v:string){return v.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");}

export default function NotesPage(){
  const [posts,setPosts]=useState<Post[]>([]);
  const [categories,setCategories]=useState<Category[]>([]);
  const [form,setForm]=useState<PostForm>({title:"",slug:"",excerpt:"",content:"",category_id:"",status:"draft"});
  const [message,setMessage]=useState("");

  async function load(){
    const [a,b]=await Promise.all([fetch("/api/admin/content/posts"),fetch("/api/admin/content/post-categories")]);
    const aj=await a.json(); const bj=await b.json();
    setPosts(aj.data??[]); setCategories(bj.data??[]);
    setForm(current=>({...current,category_id:current.category_id||String(bj.data?.[0]?.id??"")}));
  }

  useEffect(()=>{void load();},[]);

  async function create(e:React.FormEvent){
    e.preventDefault();
    const r=await fetch("/api/admin/content/posts",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...form,category_id:Number(form.category_id),excerpt:form.excerpt||null,content:form.content||null})});
    const j=await r.json();
    if(!r.ok){setMessage(j.message??"No fue posible guardar.");return;}
    setForm({title:"",slug:"",excerpt:"",content:"",category_id:String(categories[0]?.id??""),status:"draft"});setMessage("Gaspro-nota guardada.");await load();
  }

  async function remove(id:number){if(!confirm("¿Eliminar esta publicación?"))return;await fetch(`/api/admin/content/posts/${id}`,{method:"DELETE"});await load();}

  return <div className="w-full max-w-none space-y-6">
    <header><span className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--brand)]">Contenido</span><h1 className="mt-2 text-3xl font-bold">Gaspro-notas</h1><p className="mt-2 text-sm text-[var(--muted)]">CMS editorial bajo la taxonomía histórica <strong>/2019/gaspro-notas</strong>.</p></header>
    <section className="space-y-6">
      <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
        <div className="flex items-center gap-2 border-b border-[var(--border)] px-5 py-4"><FileText size={18}/><h2 className="font-semibold">Publicaciones</h2></div>
        <div className="divide-y divide-[var(--border)]">{posts.map(post=><div key={post.id} className="grid gap-3 px-5 py-4 sm:grid-cols-[1fr_auto] sm:items-center"><div className="min-w-0"><strong>{post.title}</strong><p className="mt-1 truncate text-sm text-[var(--muted)]">{post.public_url}</p><p className="mt-1 text-xs text-[var(--muted)]">{post.category?.name??"Sin categoría"} · {post.status}</p></div><div className="flex flex-wrap gap-2 sm:justify-end"><a href={`https://www.gaspronal.com${post.public_url}`} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[var(--border)] px-3 text-sm font-medium"><ExternalLink size={16}/>Ver original</a><Link href={`/dashboard/gaspro-notas/${post.id}/editar`} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[var(--border)] px-3 text-sm font-medium"><Pencil size={16}/>Editar</Link><button onClick={()=>remove(post.id)} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[var(--border)] px-3 text-sm text-red-600"><Trash2 size={16}/>Eliminar</button></div></div>)}{!posts.length&&<p className="px-5 py-10 text-center text-sm text-[var(--muted)]">Aún no hay publicaciones.</p>}</div>
      </div>
      <form onSubmit={create} className="space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
        <h2 className="font-semibold">Nueva Gaspro-nota</h2>
        <input required value={form.title} onChange={e=>setForm({...form,title:e.target.value,slug:slugify(e.target.value)})} placeholder="Título" className="min-h-11 w-full rounded-xl border border-[var(--border)] bg-transparent px-3"/>
        <input required value={form.slug} onChange={e=>setForm({...form,slug:slugify(e.target.value)})} placeholder="slug" className="min-h-11 w-full rounded-xl border border-[var(--border)] bg-transparent px-3"/>
        <select required value={form.category_id} onChange={e=>setForm({...form,category_id:e.target.value})} className="min-h-11 w-full rounded-xl border border-[var(--border)] bg-transparent px-3">{categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select>
        <textarea value={form.excerpt} onChange={e=>setForm({...form,excerpt:e.target.value})} placeholder="Resumen" rows={3} className="w-full rounded-xl border border-[var(--border)] bg-transparent p-3"/>
        <textarea value={form.content} onChange={e=>setForm({...form,content:e.target.value})} placeholder="Contenido" rows={8} className="w-full rounded-xl border border-[var(--border)] bg-transparent p-3"/>
        <select value={form.status} onChange={e=>setForm({...form,status:e.target.value as PostForm["status"]})} className="min-h-11 w-full rounded-xl border border-[var(--border)] bg-transparent px-3"><option value="draft">Borrador</option><option value="published">Publicado</option><option value="archived">Archivado</option></select>
        <button className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[var(--brand)] px-4 font-semibold text-white"><Save size={17}/>Guardar</button>
      </form>
    </section>
    {message&&<p className="text-sm font-medium text-[var(--brand)]">{message}</p>}
  </div>;
}