import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/auth/", "/perfil/editar/", "/actividades/"],
    },
    sitemap: "https://www.mostcloud.space/sitemap.xml",
  };
}
