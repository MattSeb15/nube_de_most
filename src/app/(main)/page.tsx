import type { Metadata } from "next";
import Link from "next/link";
import { ScrollLink } from "@/components/ui/scroll-link";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { MouseTooltip } from "@/components/ui/cursor-tooltip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Cloud, BookOpen, Calendar, FileText, ChevronRight, Clock, Shield, ArrowRight } from "lucide-react";
import { MateriaIcon } from "@/components/ui/materia-icon";
import { EmptyState } from "@/components/ui/empty-state";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  getEstadisticas,
  getLatestArchivos,
  getActividades,
  getMateriaById,
  getMateriasActualizadasRecientemente,
  getAllMaterias,
  getLatestUsers,
} from "@/lib/academic";
import { OrbitalHero, OrbitItem } from "@/components/ui/orbital-hero";
import { MateriaCard } from "@/components/apuntes/MateriaCard";
import { ArchivoCard } from "@/components/apuntes/ArchivoCard";

export const metadata: Metadata = {
  title: "La Nube de Most — Apuntes de Software y Nivelación UTA",
  description:
    "El espacio definitivo de apuntes, recursos y actividades académicas para la carrera de Ingeniería en Software y nivelación en la Universidad Técnica de Ambato (UTA).",
};

// ── Helpers ────────────────────────────────────────
function formatFecha(iso: string) {
  return new Date(iso).toLocaleString("es-EC", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const statusConfig = {
  pendiente: {
    label: "Pendiente",
    className: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
  },
  vencida: {
    label: "Vencida",
    className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  },
  entregada: {
    label: "Entregada",
    className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  },
} as const;

// ── Page ───────────────────────────────────────────
export default async function HomePage() {
  // Fetch site statistics
  const siteStats = await getEstadisticas();
  
  // Latest archivos for orbit (up to 20 for performance)
  const orbitArchivos = await getLatestArchivos(20);
  const orbitArchivosWithMaterias = await Promise.all(
    orbitArchivos.map(async (archivo) => {
      const materia = await getMateriaById(archivo.materiaId);
      return { ...archivo, materia };
    })
  );

  // Latest 4 archivos for the section below
  const latestArchivosWithMaterias = orbitArchivosWithMaterias.slice(0, 4);

  // Pending activities (up to 3)
  const allActividades = await getActividades();
  
  // Materias actualizadas recientemente
  const materiasRecientes = await getMateriasActualizadasRecientemente(3);
  
  // All materias, reversed to get the most recently added ones, limited to 20 for orbit performance
  const allMaterias = await getAllMaterias();
  const materiasParaOrbita = [...allMaterias].reverse().slice(0, 20);

  // Latest users for a new orbit
  const latestUsers = await getLatestUsers(15);
  
  const pendingActividades = allActividades
    .filter((a) => a.estado === "pendiente")
    .slice(0, 3);
  const pendingActividadesWithMaterias = await Promise.all(
    pendingActividades.map(async (act) => {
      const materia = await getMateriaById(act.materiaId);
      return { ...act, materia };
    })
  );

  const stats = [
    { value: siteStats.totalApuntes, label: "Apuntes" },
    { value: siteStats.totalMaterias, label: "Materias" },
    { value: siteStats.totalUsuarios, label: "Usuarios" },
    { value: siteStats.totalVistas.toLocaleString("es-EC"), label: "Vistas totales" },
  ];

  const orbitItems: OrbitItem[] = [
    ...orbitArchivosWithMaterias.map(a => ({
      id: a.id,
      nombre: a.nombre,
      tipo: a.tipo,
      materiaSlug: a.materia?.slug,
      icono: a.materia?.icono,
      color: a.materia?.color,
      originalArchivo: a
    })),
    ...materiasParaOrbita.map(m => ({
      id: m.id,
      nombre: m.nombre,
      tipo: "materia",
      materiaSlug: m.semestreSlug ? `${m.semestreSlug}/${m.slug}` : m.slug,
      icono: m.icono,
      color: m.color,
      originalMateria: m
    }))
  ];

  return (
    <main className="flex-1">
      {/* ── Hero Section ─────────────────────────── */}
      <OrbitalHero items={orbitItems} stats={stats} users={latestUsers} />

      {/* ── Últimos Archivos ──────────────────────── */}
      <section className="relative w-full py-24 bg-background">
        <div className="mx-auto w-full max-w-7xl px-6 relative z-10">
          <ScrollReveal>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
              <div className="max-w-3xl">
                <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-foreground leading-[1.1]">
                  Recursos frescos.
                  <br />
                  <span className="text-muted-foreground font-semibold text-3xl md:text-5xl tracking-tight">Directo de la comunidad.</span>
                </h2>
              </div>
              <ScrollLink href="/apuntes" className="group shrink-0">
                <div className="flex items-center gap-4 rounded-full bg-primary/10 pl-6 pr-2 py-2 text-primary hover:bg-primary/20 transition-all duration-300">
                  <span className="font-bold text-lg">Explorar archivo</span>
                  <div className="flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground group-hover:rotate-45 transition-transform duration-300">
                    <ArrowRight className="size-6" />
                  </div>
                </div>
              </ScrollLink>
            </div>
          </ScrollReveal>

          {latestArchivosWithMaterias.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="Aún no hay archivos"
              description="Aquí se mostrarán los últimos archivos que suba la comunidad. ¡Sé el primero en explorarlos!"
              action={
                <MouseTooltip text="Explorar semestres">
                  <ScrollLink href="/apuntes">
                    <Button variant="outline" size="sm" className="rounded-full">
                      Explorar Semestres
                    </Button>
                  </ScrollLink>
                </MouseTooltip>
              }
            />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {latestArchivosWithMaterias.map((archivo, i) => (
                <ScrollReveal key={archivo.id} delay={0.1 * i} className="h-[240px]">
                  <ArchivoCard archivo={archivo} />
                </ScrollReveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Materias Recientes ────────────────────── */}
      {materiasRecientes.length > 0 && (
        <section className="relative w-full py-24 bg-muted/40 border-y border-border/40">
          <div className="mx-auto w-full max-w-7xl px-6 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              <ScrollReveal direction="left" className="lg:col-span-5 space-y-8">
                <div className="inline-flex size-16 items-center justify-center rounded-3xl bg-foreground text-background shadow-xl">
                  <BookOpen className="size-8" />
                </div>
                <div className="space-y-4">
                  <h2 className="text-4xl md:text-6xl font-extrabold text-foreground tracking-tighter leading-none">
                    Tu Carrera,<br/>Organizada.
                  </h2>
                  <p className="text-muted-foreground text-xl font-medium max-w-md leading-relaxed">
                    Revisa las asignaturas con mayor actividad reciente y mantén tus materias bajo control.
                  </p>
                </div>
                <div className="pt-4">
                  <ScrollLink href="/materias" className="inline-flex items-center text-xl font-bold text-foreground hover:text-primary transition-colors group">
                    <span className="border-b-2 border-foreground group-hover:border-primary pb-1 transition-colors">
                      Ver todas las materias
                    </span>
                    <ArrowRight className="ml-3 size-6 group-hover:translate-x-2 transition-transform" />
                  </ScrollLink>
                </div>
              </ScrollReveal>

              <div className="lg:col-span-7">
                <div className="grid gap-6 sm:grid-cols-2 items-start">
                  <div className="flex flex-col gap-6">
                    {materiasRecientes.filter((_, i) => i % 2 === 0).slice(0, 2).map((materia, i) => (
                      <ScrollReveal key={materia.id} delay={0.15 * i}>
                        <MateriaCard
                          materia={materia}
                          href={materia.semestreSlug ? `/apuntes/${materia.semestreSlug}/${materia.slug}` : `/apuntes`}
                          index={i}
                        />
                      </ScrollReveal>
                    ))}
                  </div>
                  <div className="flex flex-col gap-6 sm:mt-16">
                    {materiasRecientes.filter((_, i) => i % 2 !== 0).slice(0, 2).map((materia, i) => (
                      <ScrollReveal key={materia.id} delay={0.2 + (0.15 * i)}>
                        <MateriaCard
                          materia={materia}
                          href={materia.semestreSlug ? `/apuntes/${materia.semestreSlug}/${materia.slug}` : `/apuntes`}
                          index={i + 2}
                        />
                      </ScrollReveal>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Actividades Próximas ──────────────────── */}
      <section className="relative w-full py-32 bg-background overflow-hidden">
        {/* Giant background text for depth */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[12vw] font-black text-muted/30 whitespace-nowrap select-none pointer-events-none -z-10 tracking-tighter">
          DEADLINES
        </div>

        <div className="mx-auto w-full max-w-5xl px-6 relative z-10">
          <ScrollReveal direction="up">
            <div className="flex flex-col items-center text-center mb-20">
              <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-foreground uppercase">
                No te quedes atrás
              </h2>
              <p className="mt-6 text-2xl text-muted-foreground font-medium">
                Próximas entregas y eventos importantes.
              </p>
            </div>
          </ScrollReveal>

          {pendingActividadesWithMaterias.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="¡Todo al día!"
              description="No hay actividades pendientes para mostrar en este momento. ¡Excelente trabajo!"
              action={
                <MouseTooltip text="Ver historial de actividades">
                  <ScrollLink href="/actividades">
                    <Button variant="outline" size="sm" className="rounded-full">
                      Ver Historial
                    </Button>
                  </ScrollLink>
                </MouseTooltip>
              }
            />
          ) : (
            <div className="space-y-6">
              {pendingActividadesWithMaterias.map((act, i) => {
                const date = new Date(act.fechaEntrega);
                const day = date.getDate();
                const month = date.toLocaleString('es-EC', { month: 'short' }).replace('.', '').toUpperCase();
                const time = formatFecha(act.fechaEntrega).split(', ')[1] || date.toLocaleTimeString('es-EC', {hour: '2-digit', minute: '2-digit'});
                const materia = act.materia;
                const status = statusConfig[act.estado as keyof typeof statusConfig];

                return (
                  <ScrollReveal key={act.id} delay={0.15 * i} className="flex flex-col sm:flex-row gap-4 sm:gap-8 group items-center">
                    {/* Date Block */}
                    <div className="flex sm:flex-col items-center justify-center shrink-0 w-full sm:w-28 h-16 sm:h-28 rounded-2xl sm:rounded-[2rem] bg-muted/50 border border-border/50 group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all duration-300 shadow-sm">
                      <span className="text-2xl sm:text-4xl font-black leading-none">{day}</span>
                      <span className="text-xs sm:text-sm font-bold tracking-widest mt-1 opacity-80">{month}</span>
                    </div>

                    {/* Content Card */}
                    <Card className="flex-1 w-full border-border/50 hover:border-primary/30 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1">
                      <CardContent className="flex flex-col md:flex-row md:items-center justify-between p-6 sm:p-8 gap-6">
                        <div className="flex flex-col gap-2">
                          <span className="text-xl font-bold text-foreground">
                            {act.nombre}
                          </span>
                          <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            {materia ? (
                              <>
                                <MateriaIcon name={materia.icono} className="size-4" style={{ fill: materia.color, color: materia.color }} />
                                {materia.nombre}
                              </>
                            ) : "Materia desconocida"}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground bg-muted px-3 py-1.5 rounded-lg">
                            <Clock className="size-4" />
                            {time}
                          </div>
                          <Badge variant="secondary" className={`${status.className} px-3 py-1.5 rounded-lg font-bold text-xs uppercase tracking-wider`}>
                            {status.label}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </ScrollReveal>
                );
              })}
            </div>
          )}

          <ScrollReveal delay={0.4} className="flex justify-center mt-16">
            <ScrollLink href="/actividades">
              <Button size="lg" className="rounded-full px-10 h-16 text-lg font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 bg-foreground text-background hover:bg-foreground/90">
                Abrir Calendario <ArrowRight className="ml-3 size-5" />
              </Button>
            </ScrollLink>
          </ScrollReveal>
        </div>
      </section>
    </main>
  );
}
