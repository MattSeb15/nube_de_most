"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Search, Frown, FileText, ClipboardList, BookOpen } from "lucide-react";
import { getSearchIndexData } from "./actions";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MateriaIcon } from "@/components/ui/materia-icon";
import { MateriaCard } from "@/components/apuntes/MateriaCard";
import { ArchivoCard } from "@/components/apuntes/ArchivoCard";
import type { EstadoActividad } from "@/types";

const statusConfig: Record<EstadoActividad, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pendiente: { label: "Pendiente", variant: "outline" },
  entregada: { label: "Entregada", variant: "secondary" },
  vencida: { label: "Vencida", variant: "destructive" },
};

function normalizeText(text: string) {
  if (!text) return "";
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

export default function BuscarPage() {
  const [query, setQuery] = useState("");
  const [actividades, setActividades] = useState<any[]>([]);
  const [materias, setMaterias] = useState<any[]>([]);
  const [apuntes, setApuntes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSearchIndex() {
      const data = await getSearchIndexData();

      setActividades(data.actividades);
      setMaterias(data.materias);
      setApuntes(data.apuntes);
      setLoading(false);
    }
    loadSearchIndex();
  }, []);

  const getMateriaById = (id: string) => {
    return materias.find((m) => m.id === id);
  };

  const normalizedQuery = normalizeText(query);

  const filteredActividades = useMemo(() => {
    if (!normalizedQuery) return [];
    return actividades.filter((a) =>
      normalizeText(a.nombre).includes(normalizedQuery)
    );
  }, [normalizedQuery, actividades]);

  const filteredMaterias = useMemo(() => {
    if (!normalizedQuery) return [];
    return materias.filter((m) =>
      normalizeText(m.nombre).includes(normalizedQuery) ||
      normalizeText(m.descripcion || "").includes(normalizedQuery)
    );
  }, [normalizedQuery, materias]);

  const filteredApuntes = useMemo(() => {
    if (!normalizedQuery) return [];
    return apuntes.filter((a) =>
      normalizeText(a.nombre).includes(normalizedQuery) ||
      normalizeText(a.descripcion || "").includes(normalizedQuery)
    );
  }, [normalizedQuery, apuntes]);

  const hasResults =
    filteredActividades.length > 0 ||
    filteredMaterias.length > 0 ||
    filteredApuntes.length > 0;

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        
        {/* Header Hero */}
        <div className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-8 mb-10 shadow-sm animate-fade-in">
          <div className="absolute -right-6 -top-6 text-primary/5 dark:text-primary/10">
            <Search className="size-48" strokeWidth={1} />
          </div>
          <div className="relative z-10 max-w-2xl">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-3">
              ¿Qué estás buscando?
            </h1>
            <p className="text-muted-foreground mb-8 text-lg">
              Encuentra apuntes, materias, y actividades académicas en toda la nube.
            </p>
            <div className="relative shadow-sm rounded-xl">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/60">
                <Search className="size-5" />
              </div>
              <Input
                type="search"
                placeholder="Busca por nombre, descripción, materia..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                disabled={loading}
                className="h-14 pl-12 text-base rounded-xl border-primary/20 focus-visible:ring-primary/30 bg-background/80 backdrop-blur-sm transition-all"
              />
            </div>
          </div>
        </div>

        {/* Results area */}
        <div className="animate-fade-in stagger-2">
          {loading && (
            <div className="py-20 text-center flex flex-col items-center justify-center">
              <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
                <div className="absolute h-full w-full animate-ping rounded-full bg-primary/20"></div>
                <Search className="size-6 text-primary animate-pulse" />
              </div>
              <p className="text-sm font-medium text-muted-foreground animate-pulse">
                Explorando la nube...
              </p>
            </div>
          )}

          {!loading && !normalizedQuery && (
            <div className="py-24 text-center">
              <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-muted/50 text-muted-foreground/30 ring-1 ring-border/50">
                <Search className="size-10" strokeWidth={1.5} />
              </div>
              <p className="text-lg font-medium text-foreground">
                Comienza a escribir
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Te mostraremos resultados en tiempo real
              </p>
            </div>
          )}

          {!loading && normalizedQuery && !hasResults && (
            <div className="py-24 text-center">
              <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-red-500/10 text-red-500/40 ring-1 ring-red-500/20">
                <Frown className="size-10" strokeWidth={1.5} />
              </div>
              <p className="text-lg font-medium text-foreground">
                No encontramos nada
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Intenta buscar con otras palabras clave para &quot;{query}&quot;
              </p>
            </div>
          )}

          {!loading && hasResults && (
            <div className="grid gap-8">
              
              {filteredMaterias.length > 0 && (
                <section className="animate-fade-in stagger-1">
                  <div className="flex items-center gap-2 mb-4 border-b pb-2">
                    <BookOpen className="size-5 text-primary" />
                    <h2 className="text-xl font-semibold text-foreground">
                      Materias
                    </h2>
                    <Badge variant="secondary" className="ml-2 rounded-full">
                      {filteredMaterias.length}
                    </Badge>
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredMaterias.map((materia, i) => (
                      <MateriaCard
                        key={materia.id}
                        materia={materia}
                        href={materia.semestres?.slug ? `/apuntes/${materia.semestres.slug}/${materia.slug}` : "/apuntes"}
                        index={i}
                      />
                    ))}
                  </div>
                </section>
              )}

              {filteredApuntes.length > 0 && (
                <section className="animate-fade-in stagger-2">
                  <div className="flex items-center gap-2 mb-4 border-b pb-2">
                    <FileText className="size-5 text-blue-500" />
                    <h2 className="text-xl font-semibold text-foreground">
                      Apuntes
                    </h2>
                    <Badge variant="secondary" className="ml-2 rounded-full">
                      {filteredApuntes.length}
                    </Badge>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredApuntes.map((apunte) => {
                      const materiaId = Array.isArray(apunte.carpetas_apuntes) 
                        ? apunte.carpetas_apuntes[0]?.materia_id 
                        : apunte.carpetas_apuntes?.materia_id;
                      const materia = getMateriaById(materiaId);
                      const perfiles = Array.isArray(apunte.perfiles) ? apunte.perfiles[0] : apunte.perfiles;
                      
                      const archivoFormatted = {
                        id: apunte.id,
                        nombre: apunte.nombre,
                        tipo: apunte.tipo,
                        fechaSubida: apunte.fecha_subida,
                        urlArchivo: apunte.url_archivo,
                        creador: perfiles ? (perfiles.apodo || perfiles.nombre_completo || "Anónimo") : "Anónimo",
                        creadorId: perfiles?.id || apunte.creador_id,
                        creadorRol: perfiles?.rol || "usuario",
                        materia: materia,
                      };

                      return (
                        <div key={apunte.id} className="h-[200px]">
                          <ArchivoCard archivo={archivoFormatted} />
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {filteredActividades.length > 0 && (
                <section className="animate-fade-in stagger-3">
                  <div className="flex items-center gap-2 mb-4 border-b pb-2">
                    <ClipboardList className="size-5 text-amber-500" />
                    <h2 className="text-xl font-semibold text-foreground">
                      Actividades
                    </h2>
                    <Badge variant="secondary" className="ml-2 rounded-full">
                      {filteredActividades.length}
                    </Badge>
                  </div>
                  <div className="space-y-3">
                    {filteredActividades.map((actividad) => {
                      const materia = getMateriaById(actividad.materia_id);
                      return (
                        <ActividadResult
                          key={actividad.id}
                          actividad={actividad}
                          materia={materia}
                        />
                      );
                    })}
                  </div>
                </section>
              )}

            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function ActividadResult({ actividad, materia }: { actividad: any; materia?: any }) {
  const config = statusConfig[actividad.estado as EstadoActividad];

  return (
    <Link href={`/actividades/${actividad.slug}`} className="block">
      <Card className="transition-all duration-200 hover:ring-2 hover:ring-amber-500/20 hover:shadow-md group">
        <CardContent className="flex flex-col sm:flex-row sm:items-center gap-4 p-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400 group-hover:scale-110 transition-transform">
              <ClipboardList className="size-5 fill-amber-500/20" strokeWidth={1.5} />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-medium text-foreground truncate pr-4">
                {actividad.nombre}
              </h3>
              {materia && (
                <div className="flex items-center gap-1.5 mt-1">
                  <MateriaIcon name={materia.icono} className="size-3" style={{ fill: materia.color, color: materia.color }} />
                  <p className="text-xs text-muted-foreground truncate">{materia.nombre}</p>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3 sm:ml-auto">
            {config && (
              <Badge variant={config.variant} className="text-[10px] whitespace-nowrap">
                {config.label}
              </Badge>
            )}
            <div className="text-muted-foreground group-hover:text-amber-500 transition-colors">
              <Search className="size-4" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
