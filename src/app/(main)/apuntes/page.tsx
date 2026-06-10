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
            className={`animate-fade-in stagger-${i + 1} group/link block outline-none`}
          >
            <Card className="relative h-full overflow-hidden border border-border/40 bg-card/40 backdrop-blur-xl p-5 sm:p-7 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1.5 group rounded-[1.5rem]">
              {/* Efectos de fondo dinámicos */}
              <div className="absolute -inset-0.5 bg-gradient-to-br from-primary/20 via-transparent to-primary/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 blur-2xl z-0" />
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 z-0" />
              
              <div className="relative z-10 flex flex-col h-full gap-5 sm:gap-6">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex flex-col">
                    <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors duration-300">
                      {semestre.nombre}
                    </h3>
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground mt-0.5">
                      {semestre.periodo || "Periodo no definido"}
                    </p>
                  </div>
                  <div className="self-start sm:self-auto">
                    {semestre.activo ? (
                      <Badge variant="default" className="shadow-sm shadow-primary/30 bg-primary hover:bg-primary/90 px-3 py-1.5 text-[10px] sm:text-xs uppercase tracking-wider font-bold rounded-full transition-transform hover:scale-105">
                        Semestre Actual
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="px-3 py-1.5 text-[10px] sm:text-xs uppercase tracking-wider font-semibold rounded-full bg-secondary/50 text-secondary-foreground/70 backdrop-blur-sm transition-colors hover:bg-secondary/70">
                        Próximo
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="mt-auto pt-5 border-t border-border/40 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 flex-1">
                    {semestre.materiasList && semestre.materiasList.length > 0 ? (
                      semestre.materiasList.map((m) => (
                        <div
                          key={m.id}
                          className="px-2.5 py-1 text-[10px] sm:text-xs font-semibold rounded-full border shadow-sm transition-all duration-300 hover:brightness-110 hover:scale-105"
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
                      <span className="text-xs font-medium text-muted-foreground italic opacity-70">
                        Sin materias registradas
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center text-xs sm:text-sm font-bold text-primary opacity-100 sm:opacity-0 sm:-translate-x-4 transition-all duration-500 group-hover:opacity-100 group-hover:translate-x-0 shrink-0 self-end sm:self-auto">
                    Explorar <ChevronRight className="ml-1 size-4 sm:size-5 transition-transform duration-300 group-hover:translate-x-1.5" />
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
