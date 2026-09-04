"use client";

import React, { useState } from "react";
import Link from "next/link";
import { LayoutGrid, GitBranch, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Semestre, Malla, MallaMateria } from "@/types";
import dynamic from "next/dynamic";

const MallaInteractiveView = dynamic(
  () => import("@/components/malla/malla-interactive-view"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[650px] bg-card/30 rounded-2xl border border-border/40 flex items-center justify-center backdrop-blur-md">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <GitBranch className="w-8 h-8 animate-pulse text-primary" />
          <span className="text-sm font-medium">Cargando malla curricular interactiva...</span>
        </div>
      </div>
    ),
  }
);

type ViewMode = "malla" | "semestres";

interface ApuntesMainContentProps {
  semestres: Semestre[];
  carreraSlug: string;
  mallaResult: {
    malla: Malla;
    materias: MallaMateria[];
  } | null;
}

export function ApuntesMainContent({ semestres, carreraSlug, mallaResult }: ApuntesMainContentProps) {
  const hasMalla = !!(mallaResult && mallaResult.materias && mallaResult.materias.length > 0);
  const [view, setView] = useState<ViewMode>(hasMalla ? "malla" : "semestres");

  return (
    <>
      {/* View Toggle Bar */}
      {hasMalla && (
        <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in">
          <div className="inline-flex items-center gap-1 rounded-xl border border-border/60 bg-card/60 p-1.5 backdrop-blur-lg shadow-sm">
            <button
              onClick={() => setView("malla")}
              className={cn(
                "flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all cursor-pointer",
                view === "malla"
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              )}
            >
              <GitBranch className="w-4 h-4" />
              Malla Interactiva
            </button>
            <button
              onClick={() => setView("semestres")}
              className={cn(
                "flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all cursor-pointer",
                view === "semestres"
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              )}
            >
              <LayoutGrid className="w-4 h-4" />
              Vista por Semestres
            </button>
          </div>

          {view === "malla" && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/40 px-3 py-1.5 rounded-lg border border-border/30">
              <span className="font-medium">{mallaResult.malla.nombre}</span>
              <span className="opacity-40">·</span>
              <span>Pensum {mallaResult.malla.pensum}</span>
            </div>
          )}
        </div>
      )}

      {/* Main Content Area */}
      {view === "malla" && hasMalla ? (
        <div className="animate-fade-in space-y-4">
          <MallaInteractiveView
            mallaMaterias={mallaResult.materias}
            malla={mallaResult.malla}
            carreraSlug={carreraSlug}
            className="h-[650px] shadow-2xl border-border/60 rounded-2xl"
          />
        </div>
      ) : (
        <section className="grid gap-6 sm:grid-cols-2 animate-fade-in">
          {semestres.map((semestre, i) => (
            <Link
              key={semestre.id}
              href={`/${carreraSlug}/apuntes/${semestre.slug}`}
              className={`animate-fade-in stagger-${i + 1} group/link block outline-none`}
            >
              <Card className="relative h-full overflow-hidden border border-border/40 bg-card/40 backdrop-blur-xl p-5 sm:p-7 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1.5 group rounded-[1.5rem]">
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
                        <Badge
                          variant="default"
                          className="shadow-sm shadow-primary/30 bg-primary hover:bg-primary/90 px-3 py-1.5 text-[10px] sm:text-xs uppercase tracking-wider font-bold rounded-full transition-transform hover:scale-105"
                        >
                          Semestre Actual
                        </Badge>
                      ) : (
                        <Badge
                          variant="secondary"
                          className="px-3 py-1.5 text-[10px] sm:text-xs uppercase tracking-wider font-semibold rounded-full bg-secondary/50 text-secondary-foreground/70 backdrop-blur-sm transition-colors hover:bg-secondary/70"
                        >
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
                      Explorar{" "}
                      <ChevronRight className="ml-1 size-4 sm:size-5 transition-transform duration-300 group-hover:translate-x-1.5" />
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </section>
      )}
    </>
  );
}
