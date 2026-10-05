import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import PublicHeader from "@/components/public/PublicHeader";

const backendUrl = process.env.LARAVEL_API_URL ?? "http://127.0.0.1:8000";
const whatsappHref =
  "https://wa.me/573045527575?text=Hola%20Gaspronal,%20quiero%20recibir%20asesor%C3%ADa%20para%20mi%20proyecto.";

type Post = {
  title:string;
  slug:string;
  excerpt?:string|null;
  content?:string|null;
  featured_image?:string|null;
  og_image?:string|null;
  gallery?:string[]|null;
  seo_title?:string|null;
  seo_description?:string|null;
  published_at?:string|null;
};

async function getPost(slug:string):Promise<Post|null>{
  const response=await fetch(`${backendUrl}/api/v1/content/public/posts/${encodeURIComponent(slug)}`,{
    cache:"no-store",
    headers:{Accept:"application/json"},
  });
  if(response.status===404)return null;
  if(!response.ok)return null;
  const payload=await response.json();
  return payload.data??null;
}

export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{
  const {slug}=await params;
  const post=await getPost(slug);
  if(!post)return{};
  const image=post.og_image||post.featured_image||undefined;
  return{
    title:post.seo_title||post.title,
    description:post.seo_description||post.excerpt||undefined,
    openGraph:{
      title:post.seo_title||post.title,
      description:post.seo_description||post.excerpt||undefined,
      type:"article",
      images:image?[image]:undefined,
    },
  };
}

export default async function GasproNotaDetailPage({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params;
  const post=await getPost(slug);
  if(!post)notFound();

  const gallery=Array.from(new Set([post.featured_image||"",...(post.gallery||[])].filter(Boolean)));

  return <main className="min-h-screen bg-white text-[var(--foreground)]">
    <PublicHeader whatsappHref={whatsappHref}/>

    <article className="mx-auto max-w-[1100px] px-4 py-12 sm:px-6 sm:py-16 lg:px-10">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--accent)]">Gaspro-notas</p>
      <h1 className="mt-4 text-4xl font-black tracking-[-0.045em] text-[#102d42] sm:text-6xl">{post.title}</h1>
      {post.excerpt&&<p className="mt-6 text-lg leading-8 text-slate-600">{post.excerpt}</p>}
      {post.published_at&&<p className="mt-4 text-sm font-semibold text-slate-400">{new Date(post.published_at).toLocaleDateString("es-CO")}</p>}

      {gallery[0]&&<div className="mt-10 overflow-hidden rounded-[2rem] bg-slate-100"><Image src={gallery[0]} alt={post.title} width={1400} height={875} className="h-auto w-full object-cover"/></div>}

      {post.content&&<div className="mt-10 whitespace-pre-wrap text-base leading-8 text-slate-700">{post.content}</div>}

      {gallery.length>1&&<div className="mt-12 grid gap-4 sm:grid-cols-2">
        {gallery.slice(1).map((image,index)=><div key={image} className="overflow-hidden rounded-[1.5rem] bg-slate-100"><Image src={image} alt={`${post.title} - imagen ${index+2}`} width={900} height={675} className="h-full w-full object-cover"/></div>)}
      </div>}
    </article>
  </main>;
}
