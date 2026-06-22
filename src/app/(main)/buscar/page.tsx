"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { Search, Frown, FileText, ClipboardList, BookOpen, Filter } from "lucide-react";
import { getSearchIndexData } from "./actions";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  const [activeTab, setActiveTab] = useState("todo");
  const [materiaFilter, setMateriaFilter] = useState("todas");
  const [estadoFilter, setEstadoFilter] = useState("todos");
  const [tipoFilter, setTipoFilter] = useState("todos");
  const [sortBy, setSortBy] = useState("relevancia");
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

  const filteredMaterias = useMemo(() => {
    if (!normalizedQuery && activeTab === "todo") return [];
    let result = materias;
    if (activeTab !== "todo" && activeTab !== "materias") return [];
    
    if (normalizedQuery) {
      result = result.filter((m) =>
        normalizeText(m.nombre).includes(normalizedQuery) ||
        normalizeText(m.descripcion || "").includes(normalizedQuery)
      );
    }
    
    if (sortBy === "alfabetico") {
      result = [...result].sort((a, b) => a.nombre.localeCompare(b.nombre));
    }
    
    return result;
  }, [normalizedQuery, materias, activeTab, sortBy]);

  const filteredApuntes = useMemo(() => {
    if (!normalizedQuery && activeTab === "todo") return [];
    let result = apuntes;
    if (activeTab !== "todo" && activeTab !== "apuntes") return [];
    
    if (normalizedQuery) {
      result = result.filter((a) =>
        normalizeText(a.nombre).includes(normalizedQuery) ||
        normalizeText(a.descripcion || "").includes(normalizedQuery)
      );
    }

    if (materiaFilter !== "todas") {
      result = result.filter((a) => {
        const matId = Array.isArray(a.carpetas_apuntes) ? a.carpetas_apuntes[0]?.materia_id : a.carpetas_apuntes?.materia_id;
        return matId === materiaFilter;
      });
    }

    if (tipoFilter !== "todos") {
      result = result.filter(a => normalizeText(a.tipo).includes(tipoFilter));
    }

    if (sortBy === "alfabetico") {
      result = [...result].sort((a, b) => a.nombre.localeCompare(b.nombre));
    } else if (sortBy === "recientes") {
      result = [...result].sort((a, b) => new Date(b.fecha_subida).getTime() - new Date(a.fecha_subida).getTime());
    }
    
    return result;
  }, [normalizedQuery, apuntes, activeTab, materiaFilter, tipoFilter, sortBy]);

  const filteredActividades = useMemo(() => {
    if (!normalizedQuery && activeTab === "todo") return [];
    let result = actividades;
    if (activeTab !== "todo" && activeTab !== "actividades") return [];

    if (normalizedQuery) {
      result = result.filter((a) =>
        normalizeText(a.nombre).includes(normalizedQuery)
      );
    }

    if (materiaFilter !== "todas") {
      result = result.filter(a => a.materia_id === materiaFilter);
    }

    if (estadoFilter !== "todos") {
      result = result.filter(a => a.estado === estadoFilter);
    }

    if (sortBy === "alfabetico") {
      result = [...result].sort((a, b) => a.nombre.localeCompare(b.nombre));
    } else if (sortBy === "recientes") {
      result = [...result].sort((a, b) => new Date(b.fecha_entrega || b.created_at).getTime() - new Date(a.fecha_entrega || a.created_at).getTime());
    }

    return result;
  }, [normalizedQuery, actividades, activeTab, materiaFilter, estadoFilter, sortBy]);

  const totalResults = filteredActividades.length + filteredMaterias.length + filteredApuntes.length;
  const hasResults = totalResults > 0;

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
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground z-10 pointer-events-none">
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

        {/* Filtros y Pestañas */}
        <div className="mb-8 animate-fade-in stagger-1">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full max-w-full justify-start overflow-x-auto h-auto p-1.5 bg-muted/40 rounded-xl mb-4 no-scrollbar">
              <TabsTrigger value="todo" className="rounded-lg text-sm px-5 py-2">Todo</TabsTrigger>
              <TabsTrigger value="materias" className="rounded-lg text-sm px-5 py-2">Materias</TabsTrigger>
              <TabsTrigger value="apuntes" className="rounded-lg text-sm px-5 py-2">Apuntes</TabsTrigger>
              <TabsTrigger value="actividades" className="rounded-lg text-sm px-5 py-2">Actividades</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex flex-wrap items-center gap-3 p-4 bg-background/50 border rounded-2xl shadow-sm backdrop-blur-sm">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mr-auto">
              <Filter className="size-4" /> Filtros
            </div>

            {(activeTab === "todo" || activeTab === "apuntes" || activeTab === "actividades") && (
              <Select value={materiaFilter} onValueChange={(val) => setMateriaFilter(val || "")}>
                <SelectTrigger className="w-full sm:w-[180px] h-9 text-xs rounded-lg bg-background">
                  <SelectValue placeholder="Todas las materias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas las materias</SelectItem>
                  {materias.map(m => (
                    <SelectItem key={m.id} value={m.id}>{m.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {activeTab === "actividades" && (
              <Select value={estadoFilter} onValueChange={(val) => setEstadoFilter(val || "todos")}>
                <SelectTrigger className="w-full sm:w-[140px] h-9 text-xs rounded-lg bg-background">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Cualquier estado</SelectItem>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                  <SelectItem value="entregada">Entregada</SelectItem>
                  <SelectItem value="vencida">Vencida</SelectItem>
                </SelectContent>
              </Select>
            )}

            {activeTab === "apuntes" && (
              <Select value={tipoFilter} onValueChange={(val) => setTipoFilter(val || "todos")}>
                <SelectTrigger className="w-full sm:w-[140px] h-9 text-xs rounded-lg bg-background">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Cualquier tipo</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="image">Imagen</SelectItem>
                  <SelectItem value="document">Documento</SelectItem>
                </SelectContent>
              </Select>
            )}

            <Select value={sortBy} onValueChange={(val) => setSortBy(val || "relevancia")}>
              <SelectTrigger className="w-full sm:w-[150px] h-9 text-xs rounded-lg bg-background">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevancia">Relevancia</SelectItem>
                <SelectItem value="recientes">Más recientes</SelectItem>
                <SelectItem value="alfabetico">Orden alfabético</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results area */}
        <div className="animate-fade-in stagger-2">
          {loading && (
            <div className="grid gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-full h-24 rounded-2xl bg-muted/30 animate-pulse border"></div>
              ))}
            </div>
          )}

          {!loading && !normalizedQuery && activeTab === "todo" && (
            <div className="py-24 text-center animate-fade-in">
              <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-muted/50 text-muted-foreground/30 ring-1 ring-border/50">
                <Search className="size-10" strokeWidth={1.5} />
              </div>
              <p className="text-lg font-medium text-foreground">
                Comienza a escribir o selecciona una categoría
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Puedes explorar los apuntes y actividades sin buscar
              </p>
            </div>
          )}

          {!loading && (!(!normalizedQuery && activeTab === "todo")) && !hasResults && (
            <div className="py-24 text-center animate-fade-in">
              <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-red-500/10 text-red-500/40 ring-1 ring-red-500/20">
                <Frown className="size-10" strokeWidth={1.5} />
              </div>
              <p className="text-lg font-medium text-foreground">
                No encontramos resultados
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Intenta ajustar los filtros o buscar otras palabras clave
              </p>
            </div>
          )}

          {!loading && hasResults && (
            <div className="grid gap-8">
              <div className="flex items-center justify-between border-b pb-4">
                <p className="text-sm font-medium text-muted-foreground">
                  Se encontraron <span className="text-foreground font-semibold">{totalResults}</span> resultados
                </p>
              </div>
              
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
