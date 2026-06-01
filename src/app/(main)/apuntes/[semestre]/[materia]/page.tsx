import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

import { Lock, BookOpen, User } from "lucide-react";
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

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { semestre: semestreSlug, materia: materiaSlug } = await params;
  const semestre = await getSemestreBySlug(semestreSlug);
  const materia = await getMateriaBySlug(materiaSlug);
  if (!semestre || !materia) return { title: "Materia no encontrada" };
  const title = `${materia.nombre} — ${semestre.nombre}`;
  const description = materia.descripcion || `Apuntes y recursos de ${materia.nombre} para el ${semestre.nombre}.`;
  const url = `/apuntes/${semestreSlug}/${materiaSlug}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
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

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <TrackVisit entidadId={materia.id} tipoEntidad="materia" />
      {/* Breadcrumb */}
      <nav className="mb-8 flex items-center gap-1.5 text-sm text-muted-foreground animate-fade-in">
        <Link
          href="/apuntes"
          className="transition-colors hover:text-foreground"
        >
          Apuntes
        </Link>
        <span>/</span>
        <Link
          href={`/apuntes/${semestreSlug}`}
          className="transition-colors hover:text-foreground"
        >
          {semestre.nombre}
        </Link>
        <span>/</span>
        <span className="font-medium text-foreground">{materia.nombre}</span>
      </nav>

      {/* Header */}
      <section className="mb-10 animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted/60 p-2" style={{ color: materia.color }}>
            <MateriaIcon name={materia.icono} className="size-6" style={{ fill: materia.color, color: materia.color }} />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {materia.nombre}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground flex flex-wrap items-center gap-2">
              <span className="font-mono bg-muted px-2 py-0.5 rounded-md text-xs">{materia.codigo}</span>
              {materia.profesorNombre && (
                <>
                  <span>&middot;</span>
                  {materia.profesorId ? (
                    <Link href={`/profesores/${materia.profesorId}`} className="flex items-center gap-1.5 font-medium hover:underline hover:text-foreground transition-colors">
                      <User className="size-3.5" />
                      Prof. {materia.profesorNombre}
                    </Link>
                  ) : (
                    <span className="flex items-center gap-1.5 font-medium">
                      <User className="size-3.5" />
                      Prof. {materia.profesorNombre}
                    </span>
                  )}
                </>
              )}
            </p>
            {materia.descripcion && (
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                {materia.descripcion}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Nuevo Explorador de Archivos y Carpetas */}
      <section className="mb-12 mt-8">
        <ExploradorMateria materiaId={materia.id} initialFileId={initialFileId} />
      </section>

    </main>
  );
}
