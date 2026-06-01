import { MetadataRoute } from "next";
import { getSemestres, getAllMaterias, getActividades } from "@/lib/academic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://www.mostcloud.space";

  // Rutas estáticas principales
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/apuntes`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/materias`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/sobre-mi`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  // Rutas dinámicas
  const [semestres, materias, actividades] = await Promise.all([
    getSemestres(),
    getAllMaterias(),
    getActividades(),
  ]);

  const semestresRoutes: MetadataRoute.Sitemap = semestres.map((semestre) => ({
    url: `${baseUrl}/apuntes/${semestre.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const materiasRoutes: MetadataRoute.Sitemap = materias.map((materia) => ({
    url: `${baseUrl}/apuntes/${materia.semestreSlug || 'otros'}/${materia.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const actividadesRoutes: MetadataRoute.Sitemap = actividades.map((actividad) => ({
    url: `${baseUrl}/actividades/${actividad.slug}`,
    lastModified: new Date(actividad.fechaEntrega || Date.now()),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...semestresRoutes, ...materiasRoutes, ...actividadesRoutes];
}
