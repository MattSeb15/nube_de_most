"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { MateriaIcon } from "@/components/ui/materia-icon";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { EstadoActividad } from "@/types";
import { Calendar, FileDown, Eye, EyeOff, Lock } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";

function formatFechaHora(fecha: string): string {
  return new Date(fecha).toLocaleDateString("es-EC", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const statusConfig: Record<
  EstadoActividad,
  { dot: string; label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  pendiente: {
    dot: "bg-amber-400",
    label: "Pendiente",
    variant: "outline",
  },
  entregada: {
    dot: "bg-emerald-500",
    label: "Entregada",
    variant: "secondary",
  },
  vencida: {
    dot: "bg-red-500",
    label: "Vencida",
    variant: "destructive",
  },
};

type FilterTab = "todas" | EstadoActividad;

export default function ActividadesPage() {
  const [activeTab, setActiveTab] = useState<FilterTab>("todas");
  const [actividades, setActividades] = useState<any[]>([]);
  const [materias, setMaterias] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const supabase = createClient();
      const [actRes, matRes] = await Promise.all([
        supabase
          .from("actividades")
          .select("*, comentarios(count)")
          .order("fecha_entrega", { ascending: true }),
        supabase.from("materias").select("*"),
      ]);

      if (actRes.data) {
        setActividades(
          actRes.data.map((act: any) => ({
            id: act.id,
            nombre: act.nombre,
            slug: act.slug,
            materiaId: act.materia_id,
            descripcionOficial: act.descripcion_oficial,
            tipsMost: act.tips_most,
            estado: act.estado,
            fechaInicio: act.fecha_inicio,
            fechaEntrega: act.fecha_entrega,
            comentariosCount: act.comentarios?.[0]?.count || 0,
            visibilidadArchivo: act.visibilidad_archivo || 'completa',
            archivoResolucionUrl: act.archivo_resolucion_url,
            archivoResolucionNombre: act.archivo_resolucion_nombre,
            colaborativa: act.colaborativa ?? true,
            transferida: act.transferida ?? false,
          }))
        );
      }
      if (matRes.data) {
        setMaterias(matRes.data);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  const getMateriaById = (id: string) => {
    return materias.find((m) => m.id === id);
  };

  const filtered =
    activeTab === "todas"
      ? actividades
      : actividades.filter((a) => a.estado === activeTab);

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 animate-fade-in">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Actividades
          </h1>
          <p className="mt-2 text-muted-foreground">
            Seguimiento de tareas, deberes y proyectos
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="mb-8 animate-fade-in stagger-1">
          <Tabs
            defaultValue="todas"
            onValueChange={(val) => setActiveTab(val as FilterTab)}
          >
            <TabsList>
              <TabsTrigger value="todas">Todas</TabsTrigger>
              <TabsTrigger value="pendiente">Pendientes</TabsTrigger>
              <TabsTrigger value="entregada">Entregadas</TabsTrigger>
              <TabsTrigger value="vencida">Vencidas</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab}>
              <div className="mt-6 space-y-4">
                {loading ? (
                  <div className="py-16 text-center">
                    <svg
                      className="mx-auto h-8 w-8 animate-spin text-primary"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <p className="mt-4 text-sm text-muted-foreground">
                      Cargando actividades...
                    </p>
                  </div>
                ) : filtered.length === 0 ? (
                  <EmptyState
                    icon={Calendar}
                    title="No hay actividades"
                    description={
                      activeTab === "todas"
                        ? "No se han publicado actividades todavía. ¡Estás al día!"
                        : `No hay actividades con el estado "${activeTab}" en este momento.`
                    }
                    action={
                      activeTab !== "todas" ? (
                        <Button variant="outline" size="sm" onClick={() => setActiveTab("todas")}>
                          Ver Todas
                        </Button>
                      ) : undefined
                    }
                  />
                ) : (
                  filtered.map((actividad, i) => {
                    const materia = getMateriaById(actividad.materiaId);
                    const config = statusConfig[actividad.estado as EstadoActividad];
                    const staggerClass = `stagger-${Math.min(i + 1, 6)}`;

                    return (
                      <Link
                        key={actividad.id}
                        href={`/actividades/${actividad.slug}`}
                        className="block"
                      >
                        <Card
                          className={cn(
                            "animate-fade-in transition-all duration-200 hover:ring-2 hover:ring-primary/20 hover:shadow-md",
                            staggerClass
                          )}
                        >
                          <CardContent className="flex items-start gap-4 p-5">
                            {/* Status dot */}
                            <div className="mt-1 flex-shrink-0">
                              <span
                                className={cn(
                                  "block h-3 w-3 rounded-full",
                                  config.dot
                                )}
                              />
                            </div>

                            {/* Content */}
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="font-medium text-foreground">
                                  {actividad.nombre}
                                </h3>
                                <Badge variant={config.variant}>
                                  {config.label}
                                </Badge>
                              </div>

                              {materia && (
                                <p className="mt-1 text-sm text-muted-foreground flex items-center gap-1.5">
                                  <MateriaIcon name={materia.icono} className="size-3.5" style={{ fill: materia.color, color: materia.color }} />
                                  <span>{materia.nombre}</span>
                                </p>
                              )}

                              <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="14"
                                    height="14"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <rect
                                      width="18"
                                      height="18"
                                      x="3"
                                      y="4"
                                      rx="2"
                                      ry="2"
                                    />
                                    <line x1="16" x2="16" y1="2" y2="6" />
                                    <line x1="8" x2="8" y1="2" y2="6" />
                                    <line x1="3" x2="21" y1="10" y2="10" />
                                  </svg>
                                  {formatFechaHora(actividad.fechaEntrega)}
                                </span>

                                {actividad.archivoResolucionUrl && (
                                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                                    <FileDown className="size-3.5" />
                                    Archivo adjunto
                                  </span>
                                )}

                                {actividad.visibilidadArchivo && actividad.visibilidadArchivo !== 'completa' && (
                                  <span className={cn(
                                    "flex items-center gap-1",
                                    actividad.visibilidadArchivo === 'parcial'
                                      ? "text-amber-600 dark:text-amber-400"
                                      : "text-red-500 dark:text-red-400"
                                  )}>
                                    {actividad.visibilidadArchivo === 'parcial' ? (
                                      <><Eye className="size-3.5" /> Parcial</>
                                    ) : (
                                      <><EyeOff className="size-3.5" /> Oculto</>
                                    )}
                                  </span>
                                )}

                                <span className="flex items-center gap-1">
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="14"
                                    height="14"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
                                  </svg>
                                  {actividad.comentariosCount} comentarios
                                </span>
                              </div>
                            </div>

                            {/* Arrow */}
                            <div className="mt-1 flex-shrink-0 text-muted-foreground/40">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="m9 18 6-6-6-6" />
                              </svg>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    );
                  })
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </main>
  );
}
