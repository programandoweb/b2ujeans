import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "Gaspro-notas · Gaspronal";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const backendUrl = process.env.LARAVEL_API_URL ?? "http://127.0.0.1:8000";
const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://gaspronal.programandoweb.net").replace(/\/$/, "");

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

function absoluteMediaUrl(value?:string|null):string|null{
  if(!value)return null;
  if(/^https?:\/\//i.test(value))return value;
  return `${siteUrl}${value.startsWith("/")?value:`/${value}`}`;
}

export default async function OpenGraphImage({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params;
  const post=await getPost(slug);
  const title=post?.title??"Gaspro-notas";
  const excerpt=(post?.excerpt??"Contenido técnico, casos y soluciones industriales de Gaspronal.").slice(0,210);
  const image=absoluteMediaUrl(post?.og_image||post?.featured_image);

  return new ImageResponse(
    <div
      style={{
        width:"1200px",
        height:"630px",
        display:"flex",
        background:"#0d2b40",
        color:"#fff",
        fontFamily:"Arial, Helvetica, sans-serif",
        position:"relative",
        overflow:"hidden",
      }}
    >
      <div
        style={{
          position:"absolute",
          inset:0,
          background:"linear-gradient(135deg, rgba(13,43,64,1) 0%, rgba(16,72,102,0.98) 58%, rgba(25,102,138,0.92) 100%)",
          display:"flex",
        }}
      />
      <div
        style={{
          position:"absolute",
          left:"0px",
          top:"0px",
          width:"18px",
          height:"630px",
          background:"#f28a3a",
          display:"flex",
        }}
      />
      <div
        style={{
          width:image?"690px":"1200px",
          height:"630px",
          padding:"62px 54px 50px 72px",
          display:"flex",
          flexDirection:"column",
          justifyContent:"space-between",
          position:"relative",
          zIndex:2,
        }}
      >
        <div style={{display:"flex",flexDirection:"column"}}>
          <div style={{display:"flex",alignItems:"center",gap:"14px"}}>
            <div
              style={{
                display:"flex",
                padding:"10px 16px",
                borderRadius:"999px",
                background:"rgba(242,138,58,0.16)",
                border:"1px solid rgba(242,138,58,0.48)",
                color:"#ffb072",
                fontSize:"22px",
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
              marginTop:"30px",
              fontSize:title.length>90?"48px":title.length>60?"54px":"60px",
              lineHeight:1.05,
              fontWeight:900,
              letterSpacing:"-2px",
              maxHeight:"258px",
              overflow:"hidden",
            }}
          >
            {title}
          </div>

          <div
            style={{
              display:"flex",
              marginTop:"24px",
              fontSize:"25px",
              lineHeight:1.35,
              color:"rgba(255,255,255,0.78)",
              maxHeight:"102px",
              overflow:"hidden",
            }}
          >
            {excerpt}
          </div>
        </div>

        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",flexDirection:"column"}}>
            <div style={{display:"flex",fontSize:"28px",fontWeight:900,letterSpacing:"1px"}}>GASPRONAL</div>
            <div style={{display:"flex",marginTop:"4px",fontSize:"16px",letterSpacing:"2px",color:"rgba(255,255,255,0.58)"}}>
              INDUSTRIAS Y SERVICIOS
            </div>
          </div>
          <div style={{display:"flex",fontSize:"18px",color:"#ffb072",fontWeight:700}}>gaspronal.com</div>
        </div>
      </div>

      {image&&(
        <div
          style={{
            width:"510px",
            height:"630px",
            display:"flex",
            position:"relative",
            overflow:"hidden",
            zIndex:2,
          }}
        >
          <img
            src={image}
            alt=""
            width="510"
            height="630"
            style={{width:"510px",height:"630px",objectFit:"cover"}}
          />
          <div
            style={{
              position:"absolute",
              inset:0,
              background:"linear-gradient(90deg, rgba(13,43,64,0.48) 0%, rgba(13,43,64,0.03) 35%, rgba(13,43,64,0.02) 100%)",
              display:"flex",
            }}
          />
        </div>
      )}
    </div>,
    size,
  );
}
