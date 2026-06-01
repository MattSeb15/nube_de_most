import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

import { getProfesorById, getMateriasByProfesor } from "@/lib/academic";
import { MateriaIcon } from "@/components/ui/materia-icon";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, BookOpen } from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const profesor = await getProfesorById(id);
  if (!profesor) return { title: "Profesor no encontrado" };
  return {
    title: `Prof. ${profesor.nombre} — La Nube de Most`,
    description: `Materias impartidas por el Prof. ${profesor.nombre}`,
  };
}

export default async function ProfesorPage({ params }: PageProps) {
  const { id } = await params;
  const profesor = await getProfesorById(id);
  if (!profesor) notFound();

  const materiasList = await getMateriasByProfesor(profesor.id);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header Profile */}
      <section className="mb-12 animate-fade-in flex flex-col items-center justify-center text-center space-y-4">
        <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center border-4 border-background shadow-xl">
          <User className="w-12 h-12 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Prof. {profesor.nombre}
          </h1>
          <p className="mt-2 text-muted-foreground flex items-center justify-center gap-2">
            <BookOpen className="w-4 h-4" />
            <span>
              Imparte {materiasList.length} {materiasList.length === 1 ? "materia" : "materias"}
            </span>
          </p>
        </div>
      </section>

      {/* Materias Grid */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2 mb-6">
          Materias en común
        </h2>
        {materiasList.length === 0 ? (
          <div className="animate-fade-in rounded-xl border border-dashed border-border p-12 text-center">
            <p className="text-lg text-muted-foreground">
              Aún no hay materias registradas para este profesor.
            </p>
          </div>
        ) : (
          <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {materiasList.map((materia, i) => (
              <Link
                key={materia.id}
                href={`/apuntes/${materia.semestreSlug}/${materia.slug}`}
                className={`animate-fade-in stagger-${i + 1} group/link`}
              >
                <Card 
                  className="h-full flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl relative group-hover/link:-translate-y-1 border-2 border-border/50 hover:!border-[var(--materia-color)] p-0 gap-0"
                  style={{ '--materia-color': materia.color || "#e5e5e5" } as React.CSSProperties}
                >
                  <div
                    className="h-16 w-full shrink-0 relative overflow-hidden"
                    style={{ backgroundColor: "var(--materia-color)" }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent" />
                    <div className="absolute inset-0 bg-black/5" />
                  </div>
                  
                  <CardHeader className="px-5 pt-0 pb-4 shrink-0 relative">
                    <div className="flex flex-col items-start">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-background border-2 shadow-sm relative -mt-6 mb-3 z-10 transition-transform group-hover/link:scale-105" style={{ color: "var(--materia-color)", borderColor: "var(--materia-color)" }}>
                        <MateriaIcon name={materia.icono} className="size-6" style={{ fill: "var(--materia-color)", color: "var(--materia-color)" }} />
                      </div>
                      <div className="min-w-0 w-full text-left">
                        <CardTitle className="text-lg leading-snug truncate">
                          {materia.nombre}
                        </CardTitle>
                        <div className="mt-1 flex flex-col gap-1.5">
                          <CardDescription className="font-mono text-[11px] font-bold text-muted-foreground/80 tracking-widest uppercase">
                            CODE: {materia.codigo}
                          </CardDescription>
                          {materia.semestreSlug && (
                            <Badge variant="outline" className="w-fit text-[10px] uppercase font-semibold">
                              Semestre {materia.semestreSlug.replace("semestre-", "")}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="px-5 pb-5 flex flex-col flex-1">
                    <p className="line-clamp-2 text-sm text-muted-foreground leading-relaxed">
                      {materia.descripcion}
                    </p>
                    <div className="flex items-center gap-2 mt-auto pt-4">
                      <Badge variant="secondary" className="text-[10.5px] font-medium bg-secondary/50">
                        {materia.apuntesCount}{" "}
                        {materia.apuntesCount === 1 ? "apunte" : "apuntes"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
