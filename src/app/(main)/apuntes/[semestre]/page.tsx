import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

import { getSemestreBySlug, getMateriasBySemestre } from "@/lib/academic";
import { MateriaCard } from "@/components/apuntes/MateriaCard";

interface PageProps {
  params: Promise<{ semestre: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { semestre: semestreSlug } = await params;
  const semestre = await getSemestreBySlug(semestreSlug);
  if (!semestre) return { title: "Semestre no encontrado" };
  const title = `${semestre.nombre} | Apuntes`;
  const description = `Explora los recursos y materias del ${semestre.nombre} (${semestre.periodo}) en La Nube de Most.`;
  const url = `/apuntes/${semestreSlug}`;
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

export default async function SemestrePage({ params }: PageProps) {
  const { semestre: semestreSlug } = await params;
  const semestre = await getSemestreBySlug(semestreSlug);
  if (!semestre) notFound();

  const materiasList = await getMateriasBySemestre(semestre.id);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-8 flex items-center gap-1.5 text-sm text-muted-foreground animate-fade-in">
        <Link
          href="/apuntes"
          className="transition-colors hover:text-foreground"
        >
          Apuntes
        </Link>
        <span>/</span>
        <span className="font-medium text-foreground">{semestre.nombre}</span>
      </nav>

      {/* Header */}
      <section className="mb-10 animate-fade-in">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {semestre.nombre}
        </h1>
        <p className="mt-2 text-muted-foreground">{semestre.periodo}</p>
      </section>

      {/* Materias Grid */}
      {materiasList.length === 0 ? (
        <div className="animate-fade-in rounded-xl border border-dashed border-border p-12 text-center">
          <p className="text-lg text-muted-foreground">
            Aún no hay materias registradas para este semestre.
          </p>
        </div>
      ) : (
        <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {materiasList.map((materia, i) => (
            <MateriaCard
              key={materia.id}
              materia={materia}
              href={`/apuntes/${semestreSlug}/${materia.slug}`}
              index={i}
            />
          ))}
        </section>
      )}
    </main>
  );
}
