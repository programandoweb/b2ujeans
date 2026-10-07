import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import PublicHeader from "@/components/public/PublicHeader";
import ManagedHero from "@/components/public/ManagedHero";
import { getManagedHero } from "@/lib/public-hero";
import { ArrowRight, CalendarDays } from "lucide-react";

const backendUrl = process.env.LARAVEL_API_URL ?? "http://127.0.0.1:8000";
const whatsappHref =
  "https://wa.me/573045527575?text=Hola%20Gaspronal,%20quiero%20recibir%20asesor%C3%ADa%20para%20mi%20proyecto.";

type Post = {
  id:number;
  title:string;
  slug:string;
  excerpt?:string|null;
  featured_image?:string|null;
  og_image?:string|null;
  published_at?:string|null;
};

export const metadata:Metadata={
  title:"Gaspro-notas | Gaspronal",
  description:"Artículos, casos, novedades y contenido técnico de Gaspronal.",
  alternates:{canonical:"/gaspro-notas"},
  robots:{index:true,follow:true},
};

async function getPosts():Promise<Post[]>{
  try{
    const response=await fetch(`${backendUrl}/api/v1/content/public/posts?per_page=24`,{
      cache:"no-store",
      headers:{Accept:"application/json"},
    });
    if(!response.ok)return[];
    const payload=await response.json();
    return payload.data??[];
  }catch{
    return[];
  }
}

export default async function GasproNotasPage({
  searchParams,
}: {
  searchParams?: Promise<{ option?: string }>;
}){
  const params=searchParams?await searchParams:{};
  const requestedOption=Number(params.option||"")||undefined;
  const [posts,heroSlides]=await Promise.all([
    getPosts(),
    getManagedHero("gaspro-notas.hero",requestedOption),
  ]);

  return <main className="min-h-screen bg-white text-[var(--foreground)]">
    <PublicHeader whatsappHref={whatsappHref}/>

    {heroSlides.length?<ManagedHero slides={heroSlides}/>:(
    <section className="border-b border-slate-200 bg-[var(--surface-muted)]">
      <div className="mx-auto max-w-[1440px] px-4 py-16 sm:px-6 sm:py-20 lg:px-10">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-[var(--accent)]">Gaspro-notas</p>
        <h1 className="mt-4 max-w-4xl text-4xl font-black tracking-[-0.045em] text-[var(--steel)] sm:text-6xl">
          Ideas, casos y conocimiento aplicado a la operación.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600">
          Contenido técnico y comercial de Gaspronal sobre equipos, gas, extracción, mantenimiento y proyectos especiales.
        </p>
      </div>
    </section>
    )}

    <section className="mx-auto max-w-[1440px] px-4 py-14 sm:px-6 lg:px-10">
      {posts.length===0?(
        <div className="rounded-[2rem] border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
          <h2 className="text-xl font-black text-[var(--steel)]">Aún no hay Gaspro-notas publicadas.</h2>
          <p className="mt-2 text-sm text-slate-500">Los borradores creados por Lucía aparecerán aquí cuando sean publicados.</p>
        </div>
      ):(
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {posts.map(post=>{
            const image=post.featured_image||post.og_image||"";
            return <article key={post.id} className="group overflow-hidden rounded-[2rem] border border-slate-200 bg-white transition hover:-translate-y-1 hover:shadow-xl">
              <Link href={`/gaspro-notas/${post.slug}`} className="block">
                <div className="aspect-[16/10] overflow-hidden bg-slate-100">
                  {image?<Image src={image} alt={post.title} width={1000} height={625} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"/>:<div className="grid h-full place-items-center text-sm text-slate-400">Gaspro-notas</div>}
                </div>
                <div className="p-6">
                  {post.published_at&&<div className="flex items-center gap-2 text-xs font-semibold text-slate-400"><CalendarDays size={14}/>{new Date(post.published_at).toLocaleDateString("es-CO")}</div>}
                  <h2 className="mt-3 text-2xl font-black tracking-[-0.03em] text-[var(--steel)]">{post.title}</h2>
                  {post.excerpt&&<p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">{post.excerpt}</p>}
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-black text-[var(--brand)]">Leer nota <ArrowRight size={16}/></span>
                </div>
              </Link>
            </article>
          })}
        </div>
      )}
    </section>
  </main>;
}
