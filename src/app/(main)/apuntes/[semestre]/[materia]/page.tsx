import { Metadata, ResolvingMetadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

import { Lock, BookOpen, User, ChevronRight } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { MateriaIcon } from "@/components/ui/materia-icon";
import {
  getSemestreBySlug,
  getMateriaBySlug,
  getCarpetaBySlugOrId,
  getDocumentBySlugOrId,
} from "@/lib/academic";

interface PageProps {
  params: Promise<{ semestre: string; materia: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata(
  { params, searchParams }: PageProps
): Promise<Metadata> {
  const { semestre: semestreSlug, materia: materiaSlug } = await params;
  const sp = searchParams ? await searchParams : {};
  const semestre = await getSemestreBySlug(semestreSlug);
  const materia = await getMateriaBySlug(materiaSlug);
  if (!semestre || !materia) return { title: "Materia no encontrada" };

  const folderParam = typeof sp.folder === "string" ? sp.folder : undefined;
  const fileParam = typeof sp.archivo === "string" ? sp.archivo : (typeof sp.cuaderno === "string" ? sp.cuaderno : undefined);

  let title = `${materia.nombre} — ${semestre.nombre}`;
  const totalMateriaFiles = materia.apuntesCount || 0;
  let description = `Explorador de apuntes de ${materia.nombre} (${semestre.nombre}). Contiene ${totalMateriaFiles} ${totalMateriaFiles === 1 ? 'apunte' : 'apuntes'}.${materia.descripcion ? ` ${materia.descripcion}` : ''}`;
  let ogImage = "/open_graphs/folder.png";
  let url = `/apuntes/${semestreSlug}/${materiaSlug}`;

  if (fileParam) {
    const doc = await getDocumentBySlugOrId(fileParam);
    if (doc) {
      const visiblePages = doc.paginas_cuaderno?.filter((p: any) => !p.oculta) || [];
      const numPages = visiblePages.length > 0 ? visiblePages.length : (doc.paginas_cuaderno?.length || 0);
      const paginasInfo = numPages > 0 ? ` (${numPages} ${numPages === 1 ? 'página' : 'páginas'})` : '';
      
      title = `${doc.nombre}${paginasInfo} — ${materia.nombre}`;
      description = `Apunte "${doc.nombre}"${paginasInfo} en ${materia.nombre} (${semestre.nombre}) | La Nube de Most`;
      url = `${url}?${typeof sp.archivo === "string" ? 'archivo' : 'cuaderno'}=${fileParam}`;

      const firstPageImg = visiblePages[0]?.url_imagen || doc.paginas_cuaderno?.[0]?.url_imagen;
      if (doc.tipo === "pdf") {
        ogImage = firstPageImg || "/open_graphs/pdf.png";
      } else {
        ogImage = firstPageImg || "/open_graphs/notebook.png";
      }
    }
  } else if (folderParam) {
    const carpeta = await getCarpetaBySlugOrId(folderParam);
    if (carpeta) {
      const cantArchivos = carpeta.archivos_apuntes?.length || 0;
      title = `${carpeta.nombre} — ${materia.nombre}`;
      description = `Carpeta "${carpeta.nombre}" en ${materia.nombre} (${semestre.nombre}). Contiene ${cantArchivos} ${cantArchivos === 1 ? 'apunte' : 'apuntes'}.`;
      url = `${url}?folder=${folderParam}`;
      ogImage = "/open_graphs/folder.png";
    }
  }

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      images: [
        {
          url: ogImage,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("es-EC", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

import { ExploradorMateria } from "@/components/apuntes/ExploradorMateria";
import { TrackVisit } from "@/components/ui/TrackVisit";
import { FloatingBreadcrumbs } from "@/components/ui/floating-breadcrumbs";

export default async function MateriaPage({ params, searchParams }: PageProps) {
  const { semestre: semestreSlug, materia: materiaSlug } = await params;
  const semestre = await getSemestreBySlug(semestreSlug);
  if (!semestre) notFound();

  const materia = await getMateriaBySlug(materiaSlug);
  
  if (!materia || materia.semestreId !== semestre.id) {
    console.log("NOT FOUND TRIGGERED", { materiaSlug, materia, semestreId: semestre.id });
    notFound();
  }
  
  const sp = await searchParams;
  const initialFileId = typeof sp?.archivo === "string" ? sp.archivo : (typeof sp?.cuaderno === "string" ? sp.cuaderno : undefined);
  const initialFolderId = typeof sp?.folder === "string" ? sp.folder : undefined;

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <TrackVisit entidadId={materia.id} tipoEntidad="materia" />
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground animate-fade-in font-medium">
        <Link href="/apuntes" className="transition-colors hover:text-primary">Apuntes</Link>
        <ChevronRight className="w-4 h-4" />
        <Link href={`/apuntes/${semestreSlug}`} className="transition-colors hover:text-primary">{semestre.nombre}</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-foreground">{materia.nombre}</span>
      </nav>

      {/* Nuevo Explorador de Archivos y Carpetas con Header integrado */}
      <section className="mb-12">
        <ExploradorMateria materia={materia} initialFileId={initialFileId} initialFolderId={initialFolderId} />
      </section>
    </main>
  );
}
