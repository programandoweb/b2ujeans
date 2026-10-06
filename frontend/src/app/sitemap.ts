import type { MetadataRoute } from "next";

const backendUrl = process.env.LARAVEL_API_URL ?? "http://127.0.0.1:8000";
const siteUrl = (process.env.NEXT_PUBLIC_APP_URL ?? "https://gaspronal.programandoweb.net").replace(/\/$/, "");

type Post = {
  slug:string;
  updated_at?:string|null;
  published_at?:string|null;
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

export default async function sitemap():Promise<MetadataRoute.Sitemap>{
  const posts=await getPosts();

  return [
    {
      url:siteUrl,
      changeFrequency:"weekly",
      priority:1,
    },
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
  ];
}
