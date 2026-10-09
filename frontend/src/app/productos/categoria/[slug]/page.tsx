import type { Metadata } from "next";
import ProductsPage from "../../page";

const backendUrl = process.env.LARAVEL_API_URL ?? "http://127.0.0.1:8000";

type Category = {
  id:number;
  name:string;
  slug:string;
  description?:string|null;
};

async function getCategory(slug:string):Promise<Category|null>{
  const response=await fetch(`${backendUrl}/api/v1/catalog/public/categories`,{
    next:{revalidate:300},
    headers:{Accept:"application/json"},
  });
  if(!response.ok)return null;
  const payload=await response.json();
  return (payload.data??[]).find((item:Category)=>item.slug===slug)??null;
}

export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{
  const {slug}=await params;
  const category=await getCategory(slug);

  if(!category){
    return {title:"Categoría no encontrada",robots:{index:false,follow:false}};
  }

  const title=`${category.name} | B2U Jeans`;
  const description=category.description||`Descubre ${category.name} en B2U Jeans.`;

  return {
    title,
    description,
    alternates:{canonical:`/productos/categoria/${category.slug}`},
    robots:{index:true,follow:true},
    openGraph:{
      title,
      description,
      url:`/productos/categoria/${category.slug}`,
      type:"website",
      siteName:"B2U Jeans",
      locale:"es_VE",
      images:[{url:"/opengraph-image",width:1200,height:630,alt:`${category.name} · B2U Jeans`}],
    },
    twitter:{card:"summary_large_image",title,description,images:["/opengraph-image"]},
  };
}

export default async function ProductCategoryPage({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params;
  return <ProductsPage searchParams={Promise.resolve({categoria:slug})}/>;
}
