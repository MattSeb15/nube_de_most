import { MetadataRoute } from "next";
import { getSemestres, getAllMaterias, getAllUsernames } from "@/lib/academic";

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
  const [semestres, materias, usernames] = await Promise.all([
    getSemestres(),
    getAllMaterias(),
    getAllUsernames(),
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



  const perfilesRoutes: MetadataRoute.Sitemap = usernames.map((username) => ({
    url: `${baseUrl}/perfil/${username}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...semestresRoutes, ...materiasRoutes, ...perfilesRoutes];
}
