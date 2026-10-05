import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

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
    <div
      style={{
        width:"1200px",
        height:"630px",
        display:"flex",
        background:"#0d2b40",
        color:"#ffffff",
        fontFamily:"Arial, Helvetica, sans-serif",
        position:"relative",
        overflow:"hidden",
      }}
    >
      <div
        style={{
          position:"absolute",
          inset:0,
          display:"flex",
          background:"linear-gradient(135deg, #0d2b40 0%, #113e59 54%, #176b91 100%)",
        }}
      />
      <div
        style={{
          position:"absolute",
          left:0,
          top:0,
          width:"18px",
          height:"630px",
          display:"flex",
          background:"#f28a3a",
        }}
      />
      <div
        style={{
          width:image?"700px":"1200px",
          height:"630px",
          padding:"58px 50px 48px 72px",
          display:"flex",
          flexDirection:"column",
          justifyContent:"space-between",
          position:"relative",
          zIndex:2,
        }}
      >
        <div style={{display:"flex",flexDirection:"column"}}>
          <div style={{display:"flex",alignItems:"center"}}>
            <div
              style={{
                display:"flex",
                padding:"10px 16px",
                borderRadius:"999px",
                background:"rgba(242,138,58,0.17)",
                border:"1px solid rgba(255,176,114,0.58)",
                color:"#ffb072",
                fontSize:"21px",
                fontWeight:800,
                letterSpacing:"2px",
              }}
            >
              GASPRO-NOTAS
            </div>
          </div>

          <div
            style={{
              display:"flex",
              marginTop:"28px",
              maxHeight:"270px",
              overflow:"hidden",
              fontSize:title.length>100?"45px":title.length>72?"50px":"58px",
              lineHeight:1.04,
              fontWeight:900,
              letterSpacing:"-2px",
            }}
          >
            {title}
          </div>

          <div
            style={{
              display:"flex",
              marginTop:"22px",
              maxHeight:"104px",
              overflow:"hidden",
              fontSize:"24px",
              lineHeight:1.34,
              color:"rgba(255,255,255,0.78)",
            }}
          >
            {excerpt}
          </div>
        </div>

        <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between"}}>
          <div style={{display:"flex",flexDirection:"column"}}>
            <div style={{display:"flex",fontSize:"29px",fontWeight:900,letterSpacing:"1px"}}>
              GASPRONAL
            </div>
            <div
              style={{
                display:"flex",
                marginTop:"5px",
                fontSize:"15px",
                fontWeight:700,
                letterSpacing:"2.2px",
                color:"rgba(255,255,255,0.58)",
              }}
            >
              INDUSTRIAS Y SERVICIOS
            </div>
          </div>
          <div style={{display:"flex",fontSize:"17px",fontWeight:800,color:"#ffb072"}}>
            GAS · ACERO · INGENIERÍA
          </div>
        </div>
      </div>

      {image&&(
        <div
          style={{
            width:"500px",
            height:"630px",
            display:"flex",
            position:"relative",
            overflow:"hidden",
            zIndex:2,
            background:"#143d55",
          }}
        >
          <img
            src={image}
            alt=""
            width="500"
            height="630"
            style={{width:"500px",height:"630px",objectFit:"cover"}}
          />
          <div
            style={{
              position:"absolute",
              inset:0,
              display:"flex",
              background:"linear-gradient(90deg, rgba(13,43,64,0.58) 0%, rgba(13,43,64,0.08) 38%, rgba(13,43,64,0.02) 100%)",
            }}
          />
          <div
            style={{
              position:"absolute",
              left:"28px",
              bottom:"28px",
              display:"flex",
              padding:"9px 13px",
              borderRadius:"14px",
              background:"rgba(13,43,64,0.82)",
              color:"#ffffff",
              fontSize:"16px",
              fontWeight:800,
              letterSpacing:"1px",
            }}
          >
            GASPRONAL
          </div>
        </div>
      )}
    </div>,
    {
      width:1200,
      height:630,
      headers:{
        "Cache-Control":"public, max-age=86400, stale-while-revalidate=604800",
      },
    },
  );
}
