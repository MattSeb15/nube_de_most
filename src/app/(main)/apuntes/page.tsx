import type { Metadata } from "next";
import Link from "next/link";
import { getSemestres } from "@/lib/academic";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, ChevronRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Apuntes",
  description:
    "Explora los apuntes organizados por semestre y materia en La Nube de Most.",
  alternates: {
    canonical: "/apuntes",
  },
  openGraph: {
    title: "Apuntes | La Nube de Most",
    description: "Explora los apuntes organizados por semestre y materia en La Nube de Most.",
    url: "/apuntes",
  },
};

export default async function ApuntesPage() {
  const semestres = await getSemestres();
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <section className="mb-10 animate-fade-in">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Apuntes
        </h1>
        <p className="mt-2 text-muted-foreground">
          Explora los apuntes organizados por semestre y materia
        </p>
      </section>

      {/* Semestres Grid */}
      <section className="grid gap-6 sm:grid-cols-2">
        {semestres.map((semestre, i) => (
          <Link
            key={semestre.id}
            href={`/apuntes/${semestre.slug}`}
            className={`animate-fade-in stagger-${i + 1} group/link`}
          >
            <Card className="relative h-full overflow-hidden border border-border/50 bg-background/50 p-6 sm:p-8 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              
              <div className="relative z-10 flex flex-col h-full gap-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner">
                      <BookOpen className="size-7" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
                        {semestre.nombre}
                      </h3>
                      <p className="text-sm font-medium text-muted-foreground mt-1">
                        {semestre.periodo || "Periodo no definido"}
                      </p>
                    </div>
                  </div>
                  {semestre.activo ? (
                    <Badge variant="default" className="shadow-sm shadow-primary/20 bg-primary hover:bg-primary px-3 py-1 text-xs uppercase tracking-wider font-bold">
                      Semestre Actual
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="px-3 py-1 text-xs uppercase tracking-wider font-semibold">
                      Próximo
                    </Badge>
                  )}
                </div>

                <div className="mt-auto pt-6 border-t border-border/50 flex items-end justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-1.5 flex-1">
                    {semestre.materiasList && semestre.materiasList.length > 0 ? (
                      semestre.materiasList.map((m) => (
                        <div
                          key={m.id}
                          className="px-2 py-0.5 text-[10px] font-semibold rounded-full border shadow-sm transition-colors hover:brightness-110 line-clamp-1 max-w-full"
                          style={{
                            backgroundColor: `${m.color}15`,
                            color: m.color,
                            borderColor: `${m.color}30`,
                          }}
                          title={m.nombre}
                        >
                          {m.nombre}
                        </div>
                      ))
                    ) : (
                      <span className="text-xs font-medium text-muted-foreground">
                        Sin materias registradas
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center text-sm font-bold text-primary opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 shrink-0 mb-1">
                    Explorar <ChevronRight className="ml-1 size-4" />
                  </div>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </section>
    </main>
  );
}
