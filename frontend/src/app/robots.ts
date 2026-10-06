import type { MetadataRoute } from "next";

const siteUrl=(process.env.NEXT_PUBLIC_APP_URL??"https://gaspronal.programandoweb.net").replace(/\/$/,"");

export default function robots():MetadataRoute.Robots{
  return {
    rules:[
      {
        userAgent:"*",
        allow:"/",
        disallow:["/dashboard/","/api/","/login","/forgot-password","/reset-password"],
      },
    ],
    sitemap:`${siteUrl}/sitemap.xml`,
    host:siteUrl,
  };
}
