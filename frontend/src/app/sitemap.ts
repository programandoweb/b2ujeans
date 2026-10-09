import type { MetadataRoute } from "next";

const backendUrl = process.env.LARAVEL_API_URL ?? "http://127.0.0.1:8000";
const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://demo.pereira.expert").replace(/\/$/, "");

type Post = {
  slug:string;
  updated_at?:string|null;
  published_at?:string|null;
};

type Product = {
  slug:string;
  updated_at?:string|null;
  published_at?:string|null;
};

type Category = {
  slug:string;
  updated_at?:string|null;
};

async function getPosts():Promise<Post[]>{
  const posts:Post[]=[];
  let page=1;
  let lastPage=1;

  do{
    const response=await fetch(
      `${backendUrl}/api/v1/content/public/posts?per_page=48&page=${page}`,
      {cache:"no-store",headers:{Accept:"application/json"}},
    );
    if(!response.ok)break;

    const payload=await response.json();
    posts.push(...(payload.data??[]));
    lastPage=Number(payload.last_page??1);
    page++;
  }while(page<=lastPage);

  return posts;
}

async function getProducts():Promise<Product[]>{
  const products:Product[]=[];
  let page=1;
  let lastPage=1;

  do{
    const response=await fetch(
      `${backendUrl}/api/v1/catalog/public/items?per_page=48&page=${page}`,
      {cache:"no-store",headers:{Accept:"application/json"}},
    );
    if(!response.ok)break;

    const payload=await response.json();
    products.push(...(payload.data??[]));
    lastPage=Number(payload.last_page??1);
    page++;
  }while(page<=lastPage);

  return products;
}

async function getCategories():Promise<Category[]>{
  const response=await fetch(
    `${backendUrl}/api/v1/catalog/public/categories`,
    {cache:"no-store",headers:{Accept:"application/json"}},
  );
  if(!response.ok)return[];
  const payload=await response.json();
  return payload.data??[];
}

export default async function sitemap():Promise<MetadataRoute.Sitemap>{
  const [posts,products,categories]=await Promise.all([
    getPosts(),
    getProducts(),
    getCategories(),
  ]);

  return [
    {
      url:siteUrl,
      changeFrequency:"weekly",
      priority:1,
    },
    {
      url:`${siteUrl}/productos`,
      changeFrequency:"daily",
      priority:0.95,
    },
    ...categories.map(category=>({
      url:`${siteUrl}/productos/categoria/${category.slug}`,
      lastModified:category.updated_at||undefined,
      changeFrequency:"weekly" as const,
      priority:0.9,
    })),
    ...products.map(product=>({
      url:`${siteUrl}/productos/${product.slug}`,
      lastModified:product.updated_at||product.published_at||undefined,
      changeFrequency:"monthly" as const,
      priority:0.85,
    })),
    {
      url:`${siteUrl}/gaspro-notas`,
      changeFrequency:"daily",
      priority:0.9,
    },
    ...posts.map(post=>({
      url:`${siteUrl}/gaspro-notas/${post.slug}`,
      lastModified:post.updated_at||post.published_at||undefined,
      changeFrequency:"monthly" as const,
      priority:0.8,
    })),
    {
      url:`${siteUrl}/tratamiento-de-datos`,
      changeFrequency:"yearly",
      priority:0.2,
    },
  ];
}
