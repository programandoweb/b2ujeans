import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import GasproNotaOgCard from "@/components/public/GasproNotaOgCard";

export const runtime = "nodejs";

const backendUrl = process.env.LARAVEL_API_URL ?? "http://127.0.0.1:8000";

type Post = {
  title:string;
  excerpt?:string|null;
  featured_image?:string|null;
  og_image?:string|null;
};

async function getPost(slug:string):Promise<Post|null>{
  try{
    const response=await fetch(`${backendUrl}/api/v1/content/public/posts/${encodeURIComponent(slug)}`,{
      cache:"no-store",
      headers:{Accept:"application/json"},
    });
    if(!response.ok)return null;
    const payload=await response.json();
    return payload.data??null;
  }catch{
    return null;
  }
}

function sourceImageUrl(value:string|null|undefined, origin:string):string|null{
  if(!value)return null;
  if(/^https?:\/\//i.test(value))return value;

  const media=value.match(/^\/api\/post-media\/([^/]+)\/([^/?#]+)/);
  if(media){
    return `${backendUrl}/api/v1/content/posts/${encodeURIComponent(media[1])}/media/${encodeURIComponent(media[2])}`;
  }

  return `${origin}${value.startsWith("/")?value:`/${value}`}`;
}

export async function GET(
  request:NextRequest,
  context:{params:Promise<{slug:string}>},
){
  const {slug}=await context.params;
  const post=await getPost(slug);
  const origin=new URL(request.url).origin;

  const title=post?.title??"Gaspro-notas";
  const excerpt=(post?.excerpt??"Contenido técnico, casos y soluciones industriales de Gaspronal.")
    .replace(/\s+/g," ")
    .trim()
    .slice(0,220);
  const image=sourceImageUrl(post?.og_image||post?.featured_image,origin);

  return new ImageResponse(
    GasproNotaOgCard({title,excerpt,image}),
    {
      width:1200,
      height:630,
      headers:{
        "Cache-Control":"public, max-age=86400, stale-while-revalidate=604800",
        "Content-Disposition":"inline",
      },
    },
  );
}
