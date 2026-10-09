import type { ReactElement } from "react";

type Props={
  title:string;
  excerpt:string;
  image:string|null;
};

export default function GasproNotaOgCard({title,excerpt,image}:Props):ReactElement{
  return (
    <div
      style={{
        width:"1200px",
        height:"630px",
        display:"flex",
        background:"#322725",
        color:"#ffffff",
        fontFamily:"Source Sans 3, Arial, Helvetica, sans-serif",
        position:"relative",
        overflow:"hidden",
      }}
    >
      <div
        style={{
          position:"absolute",
          left:0,
          top:0,
          width:"18px",
          height:"630px",
          display:"flex",
          background:"#c9a38c",
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
                background:"rgba(201,163,140,0.18)",
                border:"1px solid rgba(201,163,140,0.64)",
                color:"#ead3c4",
                fontSize:"21px",
                fontWeight:800,
                letterSpacing:"2px",
              }}
            >
              B2U · NOTAS
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
              color:"rgba(255,255,255,0.80)",
            }}
          >
            {excerpt}
          </div>
        </div>

        <div style={{display:"flex",alignItems:"flex-end",justifyContent:"space-between",gap:"28px"}}>
          <div style={{display:"flex",fontSize:"33px",fontWeight:900,letterSpacing:"3px",color:"#ffffff"}}>B2U JEANS</div>
          <div style={{display:"flex",fontSize:"17px",fontWeight:800,color:"#ead3c4",whiteSpace:"nowrap"}}>
            DENIM · MODA · ESTILO
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
            background:"#d4b7a5",
          }}
        >
          <img src={image} alt="" width="500" height="630" style={{width:"500px",height:"630px",objectFit:"cover"}}/>
          <div
            style={{
              position:"absolute",
              inset:0,
              display:"flex",
              background:"rgba(50,39,37,0.12)",
            }}
          />
        </div>
      )}
    </div>
  );
}
