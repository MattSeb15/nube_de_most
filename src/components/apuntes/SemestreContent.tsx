"use client";

import { useState } from "react";
import { LayoutGrid, GitBranch } from "lucide-react";
import { cn } from "@/lib/utils";
import { MateriaCard } from "@/components/apuntes/MateriaCard";
import { Materia, MallaMateria } from "@/types";
import dynamic from "next/dynamic";

// Lazy load the malla view since it pulls in ReactFlow (heavy)
const MallaInteractiveView = dynamic(
  () => import("@/components/malla/malla-interactive-view"),
  { ssr: false, loading: () => (
    <div className="w-full h-[600px] bg-background rounded-xl border border-border/50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        <GitBranch className="w-8 h-8 animate-pulse" />
        <span className="text-sm font-medium">Cargando malla interactiva...</span>
      </div>
    </div>
  )}
);

type ViewMode = "grid" | "malla";

interface SemestreContentProps {
  materiasList: Materia[];
  mallaMaterias: MallaMateria[] | null;
  semestreSlug: string;
}

export function SemestreContent({ materiasList, mallaMaterias, semestreSlug }: SemestreContentProps) {
  const [view, setView] = useState<ViewMode>(mallaMaterias && mallaMaterias.length > 0 ? "malla" : "grid");

  const hasMalla = mallaMaterias && mallaMaterias.length > 0;

  return (
    <>
      {/* View Toggle */}
      {hasMalla && (
        <div className="mb-6 flex items-center gap-2 animate-fade-in">
          <div className="inline-flex items-center gap-1 rounded-lg border border-border/50 bg-muted/30 p-1">
            <button
              onClick={() => setView("malla")}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all cursor-pointer",
                view === "malla"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <GitBranch className="w-4 h-4" />
              Malla Interactiva
            </button>
            <button
              onClick={() => setView("grid")}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-all cursor-pointer",
                view === "grid"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <LayoutGrid className="w-4 h-4" />
              Tarjetas
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      {materiasList.length === 0 ? (
        <div className="animate-fade-in rounded-xl border border-dashed border-border p-12 text-center">
          <p className="text-lg text-muted-foreground">
            Aún no hay materias registradas para este semestre.
          </p>
        </div>
      ) : view === "malla" && hasMalla ? (
        <div className="animate-fade-in">
          <MallaInteractiveView
            mallaMaterias={mallaMaterias}
            semestreSlug={semestreSlug}
          />
        </div>
      ) : (
        <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 animate-fade-in">
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
    </>
  );
}
