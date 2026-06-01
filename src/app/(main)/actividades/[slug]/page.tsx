import Link from "next/link";
import { notFound } from "next/navigation";
import { Lightbulb, FileDown, Lock, Eye, EyeOff, CheckCircle2, FolderOpen, Clock } from "lucide-react";
import { MateriaIcon } from "@/components/ui/materia-icon";
import {
  getActividades,
  getActividadBySlug,
  getMateriaById,
  getComentariosByActividad,
} from "@/lib/academic";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { EstadoActividad, VisibilidadArchivo } from "@/types";
import { createClient, createStaticClient } from "@/utils/supabase/server";
import { CommentForm } from "@/components/actividades/comment-form";
import { CommentItem } from "@/components/actividades/comment-item";

function formatFecha(fecha: string): string {
  return new Date(fecha).toLocaleDateString("es-EC", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatFechaHora(fecha: string): string {
  return new Date(fecha).toLocaleDateString("es-EC", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatFechaCorta(fecha: string): string {
  return new Date(fecha).toLocaleDateString("es-EC", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const statusConfig: Record<
  EstadoActividad,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  pendiente: { label: "Pendiente", variant: "outline" },
  entregada: { label: "Entregada", variant: "secondary" },
  vencida: { label: "Vencida", variant: "destructive" },
};

export async function generateStaticParams() {
  const supabase = createStaticClient();
  const { data } = await supabase.from("actividades").select("slug");
  return (data || []).map((a: any) => ({ slug: a.slug }));
}

export default async function ActividadDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const actividad = await getActividadBySlug(slug);

  if (!actividad) {
    notFound();
  }

  const materia = await getMateriaById(actividad.materiaId);
  const comentarios = await getComentariosByActividad(actividad.id);
  const config = statusConfig[actividad.estado];

  // Check auth session
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isUtaEmail = user?.email?.endsWith("@uta.edu.ec") ?? false;
  const isEmailConfirmed = user?.email_confirmed_at !== undefined && user?.email_confirmed_at !== null;
  const canComment = user && isUtaEmail && isEmailConfirmed;

  // ── Visibility logic for resolution file ──
  const now = new Date();
  const fechaEntrega = new Date(actividad.fechaEntrega);
  const haVencido = now >= fechaEntrega;
  const visibilidad = actividad.visibilidadArchivo || "completa";
  const tieneArchivo = !!actividad.archivoResolucionUrl;

  // Determine if the file should be unlocked (for parcial visibility)
  let archivoDesbloqueado = false;
  if (visibilidad === "parcial" && actividad.fechaDesbloqueoVisibilidad) {
    archivoDesbloqueado = now >= new Date(actividad.fechaDesbloqueoVisibilidad);
  } else if (visibilidad === "parcial" && !actividad.fechaDesbloqueoVisibilidad) {
    // If no unlock date set, unlock when activity expires
    archivoDesbloqueado = haVencido;
  }

  const mostrarArchivo = visibilidad === "completa" || (visibilidad === "parcial" && archivoDesbloqueado);
  const mostrarEstadoArchivo = visibilidad !== "ninguna";

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Back button + Breadcrumb */}
        <div className="mb-8 animate-fade-in">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link
              href="/actividades"
              className="transition-colors hover:text-foreground"
            >
              Actividades
            </Link>
            <span>/</span>
            <span className="text-foreground">{actividad.nombre}</span>
          </nav>
        </div>

        {/* Header */}
        <div className="mb-10 animate-fade-in stagger-1">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            {materia && (
              <Badge variant="secondary" className="flex items-center gap-1.5">
                <MateriaIcon name={materia.icono} className="size-3.5" style={{ fill: materia.color, color: materia.color }} />
                <span>{materia.nombre}</span>
              </Badge>
            )}
            <Badge variant={config.variant}>{config.label}</Badge>
            {actividad.transferida && (
              <Badge variant="secondary" className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
                <FolderOpen className="size-3" />
                Transferida a apuntes
              </Badge>
            )}
            {actividad.colaborativa && (
              <Badge variant="outline" className="flex items-center gap-1.5 text-xs">
                💬 Colaborativa
              </Badge>
            )}
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {actividad.nombre}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <Clock className="size-4" />
              <span>Entrega: {formatFechaHora(actividad.fechaEntrega)}</span>
            </span>
            {actividad.fechaInicio && (
              <span className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                  <line x1="16" x2="16" y1="2" y2="6" />
                  <line x1="8" x2="8" y1="2" y2="6" />
                  <line x1="3" x2="21" y1="10" y2="10" />
                </svg>
                <span>Inicio: {formatFechaCorta(actividad.fechaInicio)}</span>
              </span>
            )}
          </div>
        </div>

        {/* Two-column sections */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          {/* Descripción Oficial */}
          <Card className="animate-fade-in stagger-2">
            <CardHeader>
              <CardTitle>Descripción Oficial</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-foreground/80">
                {actividad.descripcionOficial}
              </p>
            </CardContent>
          </Card>

          {/* Tips de Most */}
          <div
            className={cn(
              "animate-fade-in stagger-3 rounded-xl border-l-4 border-amber-400 bg-amber-50 p-6 dark:bg-amber-950/20"
            )}
          >
            <h3 className="mb-3 flex items-center gap-1.5 text-base font-medium text-foreground">
              <span>Tips de Most</span>
              <Lightbulb className="size-4 fill-amber-500 text-amber-500 animate-bounce" />
            </h3>
            <p className="text-sm leading-relaxed text-foreground/80">
              {actividad.tipsMost}
            </p>
          </div>
        </div>

        {/* ── Archivo de Resolución ── */}
        {tieneArchivo && mostrarEstadoArchivo && (
          <div className="mb-12 animate-fade-in stagger-3">
            <Card className={cn(
              "overflow-hidden",
              mostrarArchivo
                ? "border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-950/10"
                : "border-amber-500/20 bg-amber-50/50 dark:bg-amber-950/10"
            )}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    {mostrarArchivo ? (
                      <div className="flex-shrink-0 size-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                        <FileDown className="size-5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                    ) : (
                      <div className="flex-shrink-0 size-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                        <Lock className="size-5 text-amber-600 dark:text-amber-400" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <h4 className="font-semibold text-sm text-foreground">
                        Archivo de Resolución
                      </h4>
                      {mostrarArchivo ? (
                        <p className="text-xs text-muted-foreground truncate">
                          {actividad.archivoResolucionNombre || "Archivo adjunto"}
                        </p>
                      ) : (
                        <p className="text-xs text-amber-600 dark:text-amber-400">
                          {actividad.fechaDesbloqueoVisibilidad
                            ? `Disponible el ${formatFechaCorta(actividad.fechaDesbloqueoVisibilidad)}`
                            : "Disponible al vencer la fecha de entrega"
                          }
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    {mostrarArchivo ? (
                      <a
                        href={actividad.archivoResolucionUrl!}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-xs font-bold transition-colors"
                      >
                        <FileDown className="size-3.5" />
                        Descargar
                      </a>
                    ) : (
                      <div className="inline-flex items-center gap-2 rounded-xl bg-muted text-muted-foreground px-4 py-2 text-xs font-bold cursor-not-allowed">
                        <Lock className="size-3.5" />
                        Bloqueado
                      </div>
                    )}
                  </div>
                </div>

                {/* Status indicator */}
                <div className="mt-3 flex items-center gap-2 text-xs">
                  {mostrarArchivo ? (
                    <>
                      <CheckCircle2 className="size-3.5 text-emerald-500" />
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">Archivo disponible para descarga</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="size-3.5 text-amber-500" />
                      <span className="text-amber-600 dark:text-amber-400 font-medium">
                        Archivo subido — visibilidad restringida
                      </span>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Comentarios */}
        <section className="animate-fade-in stagger-4">
          <h2 className="mb-6 text-xl font-semibold text-foreground">
            Comentarios ({comentarios.length})
          </h2>

          {comentarios.length === 0 ? (
            <div className="rounded-xl border border-border bg-muted/30 py-12 text-center text-sm text-muted-foreground">
              No hay comentarios aún.
            </div>
          ) : (
            <div className="space-y-4">
              {/* Group comments into parent/child relationships */}
              {(() => {
                const grouped: Record<string, any[]> = {};
                const roots: any[] = [];
                comentarios.forEach(c => {
                  if (c.parentId) {
                    if (!grouped[c.parentId]) grouped[c.parentId] = [];
                    grouped[c.parentId].push(c);
                  } else {
                    roots.push({ ...c, respuestas: [] });
                  }
                });
                
                // Attach responses to roots
                roots.forEach(r => {
                  if (grouped[r.id]) {
                    r.respuestas = grouped[r.id];
                  }
                });

                return roots.map((comentario) => (
                  <CommentItem
                    key={comentario.id}
                    comentario={comentario}
                    actividadId={actividad.id}
                    slug={actividad.slug}
                    canComment={!!canComment}
                  />
                ));
              })()}
            </div>
          )}

          {/* Formulario de comentarios */}
          <div className="mt-8 border-t border-border pt-6">
            <h3 className="text-lg font-medium text-foreground">Dejar un comentario</h3>
            {canComment ? (
              <CommentForm actividadId={actividad.id} slug={actividad.slug} />
            ) : (
              <div className="mt-4 rounded-xl bg-muted/40 p-4 border border-border text-center">
                <p className="text-sm text-muted-foreground">
                  Debes{" "}
                  <Link href="/login" className="font-semibold text-primary hover:underline">
                    iniciar sesión
                  </Link>{" "}
                  con tu correo institucional verificado (<span className="font-medium text-foreground">@uta.edu.ec</span>) para poder comentar.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Back button */}
        <div className="mt-12 animate-fade-in stagger-5">
          <Link href="/actividades">
            <Button variant="outline">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m15 18-6-6 6-6" />
              </svg>
              Volver a Actividades
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
