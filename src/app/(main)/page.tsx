import type { Metadata } from "next";
import Link from "next/link";
import { ScrollLink } from "@/components/ui/scroll-link";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { MouseTooltip } from "@/components/ui/cursor-tooltip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Cloud, BookOpen, Calendar, FileText, ChevronRight, Clock, Shield, ArrowRight, Search } from "lucide-react";
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
  title: "Inicio",
  description:
    "El espacio definitivo de apuntes, recursos y actividades académicas para la carrera de Ingeniería en Software y nivelación en la Universidad Técnica de Ambato (UTA).",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "La Nube de Most — Apuntes de Software y Nivelación UTA",
    description: "El espacio definitivo de apuntes, recursos y actividades académicas para la carrera de Ingeniería en Software y nivelación en la Universidad Técnica de Ambato (UTA).",
    url: "/",
    images: [
      {
        url: "/opengrapht_tumb.webp",
        width: 1200,
        height: 630,
        alt: "La Nube de Most",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "La Nube de Most — Apuntes de Software y Nivelación UTA",
    description: "El espacio definitivo de apuntes, recursos y actividades académicas para la carrera de Ingeniería en Software y nivelación en la Universidad Técnica de Ambato (UTA).",
    images: ["/opengrapht_tumb.webp"],
  },
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
    <main className="flex-1 overflow-x-clip">
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
              <ScrollLink href="/apuntes" className="group shrink-0 w-full md:w-auto">
                <div className="flex w-full items-center justify-between gap-4 rounded-full bg-primary/10 pl-6 pr-2 py-2 text-primary hover:bg-primary/20 transition-all duration-300 md:justify-start">
                  <span className="font-bold text-lg">Explorar archivo</span>
                  <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground group-hover:rotate-45 transition-transform duration-300">
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

      {/* ── Comunidad / Usuarios Recientes ─────────── */}
      <section className="relative w-full py-32 bg-background overflow-hidden border-t border-border/40">
        <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none opacity-[0.03] dark:opacity-[0.05]">
          <div className="text-[18vw] font-black whitespace-nowrap select-none pointer-events-none tracking-tighter">
            COMUNIDAD
          </div>
        </div>
        
        <div className="mx-auto w-full max-w-6xl px-6 relative z-10">
          <ScrollReveal>
            <div className="flex flex-col items-center text-center mb-20">
              <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-foreground leading-[1.1]">
                Nuevos en la Nube.
              </h2>
              <p className="mt-6 text-xl md:text-2xl text-muted-foreground font-medium max-w-2xl">
                Únete a los estudiantes que ya están compartiendo y colaborando.
              </p>
            </div>
          </ScrollReveal>

          <div className="flex flex-wrap justify-center items-center gap-6 md:gap-10">
            {latestUsers.map((u, i) => (
              <ScrollReveal key={u.id} delay={0.05 * i} direction="up">
                <MouseTooltip text={u.apodo || u.nombre_completo || "Usuario"}>
                  <Link href={`/perfil/${u.apodo || u.id}`} className="group flex flex-col items-center gap-3">
                    <Avatar className="size-20 md:size-28 border-4 border-background shadow-xl ring-2 ring-primary/20 group-hover:ring-primary group-hover:scale-110 transition-all duration-500 group-hover:shadow-primary/30">
                      {u.avatar_url && (
                        <AvatarImage src={u.avatar_url} alt={u.nombre_completo} className="object-cover" />
                      )}
                      <AvatarFallback className="bg-primary/10 text-primary font-bold text-2xl md:text-3xl">
                        {(u.nombre_completo || "U").substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm md:text-base font-bold text-muted-foreground group-hover:text-foreground transition-colors tracking-tight">
                      @{u.apodo || u.nombre_completo.split(' ')[0]}
                    </span>
                  </Link>
                </MouseTooltip>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Aprender / Tutorial ──────────────────────── */}
      <section className="relative w-full py-32 bg-muted/20 border-t border-border/40 overflow-hidden">
        <div className="mx-auto w-full max-w-7xl px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <ScrollReveal direction="left" className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary mb-2">
                <span className="flex size-2 rounded-full bg-primary animate-pulse"></span>
                <span className="text-sm font-bold tracking-wide uppercase">Nueva Sección</span>
              </div>
              <h2 className="text-5xl md:text-6xl font-black tracking-tighter text-foreground leading-[1.1]">
                Aprende a dominar <br />
                <span className="text-primary">La Nube.</span>
              </h2>
              <p className="text-xl text-muted-foreground font-medium leading-relaxed">
                Descubre cómo encontrar los mejores apuntes, cómo colaborar correctamente subiendo material optimizado y por qué un buen perfil mejora tu reputación digital.
              </p>
              <ul className="space-y-4 pt-4">
                <li className="flex items-center gap-3 text-lg font-medium">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <BookOpen className="size-4" />
                  </div>
                  Tutoriales interactivos
                </li>
                <li className="flex items-center gap-3 text-lg font-medium">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <FileText className="size-4" />
                  </div>
                  Guías de formatos permitidos
                </li>
              </ul>
              <div className="pt-6">
                <Link href="/aprender">
                  <Button size="lg" className="rounded-full px-8 h-14 text-lg font-bold shadow-lg hover:shadow-primary/25 transition-all">
                    Ir al Tutorial <ArrowRight className="ml-2 size-5" />
                  </Button>
                </Link>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="right" className="relative">
              {/* Estilo decorativo abstracto */}
              <div className="relative aspect-square md:aspect-[4/3] rounded-[2.5rem] bg-gradient-to-tr from-primary/20 via-background to-muted border border-border/50 shadow-2xl overflow-hidden flex items-center justify-center p-8 group">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                
                <div className="relative z-10 w-full max-w-sm space-y-4">
                  <div className="bg-card border border-border shadow-lg p-4 rounded-2xl flex items-center gap-4 transform transition-transform group-hover:-translate-y-2 group-hover:rotate-2">
                    <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl">
                      <Search className="size-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">Explorar Contenido</h4>
                      <p className="text-xs text-muted-foreground">Encuentra por materia</p>
                    </div>
                  </div>
                  
                  <div className="bg-card border border-border shadow-lg p-4 rounded-2xl flex items-center gap-4 ml-8 transform transition-transform group-hover:translate-y-1 group-hover:-rotate-1 delay-75">
                    <div className="p-3 bg-red-500/10 text-red-500 rounded-xl">
                      <Cloud className="size-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">Subir Apuntes</h4>
                      <p className="text-xs text-muted-foreground">PDFs y Cuadernos</p>
                    </div>
                  </div>
                  
                  <div className="bg-card border border-border shadow-lg p-4 rounded-2xl flex items-center gap-4 transform transition-transform group-hover:translate-y-2 group-hover:rotate-2 delay-150">
                    <div className="p-3 bg-green-500/10 text-green-500 rounded-xl">
                      <Shield className="size-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">Comunidad</h4>
                      <p className="text-xs text-muted-foreground">Reputación y SEO</p>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ── Actividades Próximas ──────────────────── */}
      <section className="relative w-full py-32 bg-background overflow-hidden">
        {/* Giant background text for depth */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[10vw] font-black text-muted/30 whitespace-nowrap select-none pointer-events-none -z-10 tracking-tighter opacity-50">
          PRÓXIMAMENTE
        </div>

        <div className="mx-auto w-full max-w-5xl px-6 relative z-10">
          <ScrollReveal direction="up">
            <div className="flex flex-col items-center text-center mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full bg-primary/10 text-primary font-bold text-sm tracking-wide uppercase border border-primary/20">
                <Shield className="size-4" /> Work in Progress
              </div>
              <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-foreground">
                Calendario de Actividades
              </h2>
              <p className="mt-6 text-xl md:text-2xl text-muted-foreground font-medium max-w-2xl">
                Un sistema inteligente para rastrear tus tareas, deberes y proyectos. Mantente al día con notificaciones, colabora con tus compañeros y nunca te pierdas una entrega.
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.2} className="flex justify-center">
            <Button disabled size="lg" className="rounded-full px-10 h-16 text-lg font-bold shadow-lg opacity-50 cursor-not-allowed bg-muted text-muted-foreground border border-border">
              Disponible Muy Pronto <Clock className="ml-3 size-5" />
            </Button>
          </ScrollReveal>
        </div>
      </section>
    </main>
  );
}
