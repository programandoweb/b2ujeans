import type { MetadataRoute } from "next";

const siteUrl=(process.env.NEXT_PUBLIC_SITE_URL??"https://demo.pereira.expert").replace(/\/$/,"");

export default function robots():MetadataRoute.Robots{
  return {
    rules:[
      {
        userAgent:"*",
        allow:["/","/api/og/"],
        disallow:["/dashboard/","/api/","/login","/forgot-password","/reset-password"],
      },
    ],
    sitemap:`${siteUrl}/sitemap.xml`,
    host:siteUrl,
  };
}
