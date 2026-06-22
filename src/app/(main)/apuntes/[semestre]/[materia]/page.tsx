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
} from "@/lib/academic";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PageProps {
  params: Promise<{ semestre: string; materia: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata(
  { params }: PageProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { semestre: semestreSlug, materia: materiaSlug } = await params;
  const semestre = await getSemestreBySlug(semestreSlug);
  const materia = await getMateriaBySlug(materiaSlug);
  if (!semestre || !materia) return { title: "Materia no encontrada" };
  const title = `${materia.nombre} — ${semestre.nombre}`;
  const description = materia.descripcion || `Apuntes y recursos de ${materia.nombre} para el ${semestre.nombre}.`;
  const url = `/apuntes/${semestreSlug}/${materiaSlug}`;
  
  const previousImages = (await parent).openGraph?.images || [];
  
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      images: previousImages,
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
