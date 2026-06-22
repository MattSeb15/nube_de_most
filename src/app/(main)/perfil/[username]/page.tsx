import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPerfilByUsername, getArchivosByCreador, getMateriaById } from "@/lib/academic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MateriaCard } from "@/components/apuntes/MateriaCard";
import { ArrowLeft, Clock, ChevronRight, Shield, Globe, FileArchive, Users, Edit, Bookmark } from "lucide-react";
import { MateriaIcon } from "@/components/ui/materia-icon";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/server";
import { PaginatedArchivos } from "@/components/apuntes/PaginatedArchivos";

// Custom Social Icons
function GithubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12Z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
    </svg>
  );
}

function TwitterIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  );
}

// ── Helpers ────────────────────────────────────────
function formatFecha(iso: string) {
  return new Date(iso).toLocaleString("es-EC", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export async function generateMetadata({ params }: { params: Promise<{ username: string }> }): Promise<Metadata> {
  const { username } = await params;
  const perfil = await getPerfilByUsername(username);
  if (!perfil) return { title: "Perfil no encontrado | La Nube de Most" };

  const title = `${perfil.nombreCompleto || perfil.apodo} | Perfil en La Nube de Most`;
  const description = perfil.bio || `Perfil académico de ${perfil.nombreCompleto || perfil.apodo} en La Nube de Most.`;
  const url = `/perfil/${username}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "profile",
      images: perfil.avatar_url ? [{ url: perfil.avatar_url, width: 256, height: 256, alt: title }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: perfil.avatar_url ? [perfil.avatar_url] : [],
    },
  };
}

export default async function PublicProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  
  const perfil = await getPerfilByUsername(username);
  
  if (!perfil) {
    notFound();
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isOwner = user?.id === perfil.id;

  const archivos = await getArchivosByCreador(perfil.id);
  const archivosWithMaterias = await Promise.all(
    archivos.map(async (archivo) => {
      const materia = await getMateriaById(archivo.materiaId);
      return { ...archivo, materia, colaborativa: archivo.esColaboracion };
    })
  );

  const isAdmin = perfil.rol === "admin";
  const userInitials = (perfil.apodo || perfil.nombreCompleto || "U").substring(0, 2).toUpperCase();

  const aportesPropios = archivosWithMaterias.filter(a => !a.esColaboracion);
  const colaboraciones = archivosWithMaterias.filter(a => a.esColaboracion);

  let archivosGuardados: any[] = [];
  let materiasGuardadas: any[] = [];
  if (isOwner) {
    const { data: guardadosData } = await supabase
      .from("apuntes_guardados")
      .select(`
        archivo_id,
        archivos_apuntes (
          id, nombre, tipo, fecha_subida, url_archivo, vistas, creador_id,
          perfiles!creador_id(id, nombre_completo, apodo, rol),
          carpetas_apuntes(materia_id)
        )
      `)
      .eq("usuario_id", user.id);

    if (guardadosData) {
      const guardadosRaw = guardadosData.map((g: any) => g.archivos_apuntes).filter(Boolean);
      archivosGuardados = await Promise.all(
        guardadosRaw.map(async (a: any) => {
          const mId = a.carpetas_apuntes?.materia_id || (Array.isArray(a.carpetas_apuntes) ? a.carpetas_apuntes[0]?.materia_id : null);
          const materia = mId ? await getMateriaById(mId) : null;
          return {
            id: a.id,
            nombre: a.nombre,
            tipo: a.tipo,
            materiaId: mId,
            fechaSubida: a.fecha_subida || a.fecha_creacion || new Date().toISOString(),
            urlArchivo: a.url_archivo || "",
            creador: a.perfiles ? (a.perfiles.apodo || a.perfiles.nombre_completo) : "Anónimo",
            creadorId: a.perfiles?.id || a.creador_id || "",
            creadorApodo: a.perfiles?.apodo || null,
            creadorRol: a.perfiles?.rol || "usuario",
            vistasCount: a.vistas || 0,
            materia
          };
        })
      );
    }

    const { data: mGuardadosData } = await supabase
      .from("materias_guardadas")
      .select("materia_id")
      .eq("usuario_id", user.id);

    if (mGuardadosData) {
      materiasGuardadas = await Promise.all(
        mGuardadosData.map(async (m: any) => {
          const materia = await getMateriaById(m.materia_id);
          return materia;
        })
      );
      materiasGuardadas = materiasGuardadas.filter(Boolean);
    }
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl flex flex-col items-center">
      
      {/* ── Top Bar ── */}
      <div className="w-full flex justify-between items-center mb-10 animate-fade-in stagger-1">
        <Link
          href="/"
          className="group flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors duration-200"
        >
          <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
          <span>Volver al inicio</span>
        </Link>
      </div>

      {/* ── Hero Profile Section ── */}
      <div className="flex flex-col items-center text-center animate-fade-in stagger-2 w-full max-w-2xl">
        
        {/* Avatar */}
        <div className={cn(
          "size-24 sm:size-32 rounded-full flex items-center justify-center text-4xl sm:text-5xl font-bold font-mono tracking-wider mb-6 transition-transform duration-500 hover:scale-105 select-none overflow-hidden",
          isAdmin
            ? "bg-primary text-white shadow-xl shadow-primary/20"
            : "bg-foreground text-background shadow-xl shadow-foreground/10"
        )}>
          {perfil.avatar_url ? (
            <img src={perfil.avatar_url} alt={`Avatar de ${perfil.apodo || perfil.nombreCompleto}`} className="w-full h-full object-cover" />
          ) : (
            userInitials
          )}
        </div>

        {/* Name & Title */}
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground mb-2">
          {perfil.nombreCompleto || perfil.apodo || "Estudiante"}
        </h1>
        <h2 className="text-lg sm:text-xl text-muted-foreground font-medium mb-6 font-mono">
          @{perfil.apodo}
        </h2>

        {/* Badges & Socials */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
          {isAdmin ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 rounded-full px-4 py-1.5">
              <Shield className="size-3.5 fill-current" />
              Administrador
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground bg-muted/50 rounded-full px-4 py-1.5">
              <Shield className="size-3.5" />
              Estudiante Verificado
            </span>
          )}

          {perfil.redes?.map((red) => {
            let Icon: any = Globe;
            if (red.icono === "github") Icon = GithubIcon;
            else if (red.icono === "instagram") Icon = InstagramIcon;
            else if (red.icono === "twitter") Icon = TwitterIcon;
            else if (red.icono === "facebook") Icon = FacebookIcon;
            else if (red.icono === "linkedin") Icon = LinkedinIcon;

            return (
              <a
                key={red.plataforma}
                href={red.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-center size-8 rounded-full bg-muted/50 text-muted-foreground hover:bg-foreground hover:text-background transition-all duration-300"
                title={red.plataforma}
              >
                <Icon className="size-3.5 group-hover:scale-110 transition-transform" />
              </a>
            );
          })}
        </div>

        {/* Bio */}
        {perfil.bio && (
          <p className="max-w-xl text-center text-muted-foreground/80 mb-8 text-[15px] leading-relaxed">
            {perfil.bio}
          </p>
        )}

        {/* Modify Profile Button (Owner only) */}
        {isOwner && (
          <Link href="/perfil/editar" className="mb-12">
            <button className="rounded-full h-12 px-8 font-bold text-sm bg-foreground text-background hover:bg-foreground/90 transition-all flex items-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5">
              <Edit className="size-4" />
              Modificar Perfil
            </button>
          </Link>
        )}

        {/* Quick Stats */}
        <div className="flex items-center justify-center gap-8 sm:gap-16 mt-4 mb-16 border-t border-border/40 pt-8 w-full">
          <div className="flex flex-col items-center">
            <span className="text-4xl font-extrabold text-foreground tracking-tight">{aportesPropios.length}</span>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mt-2">Aportes</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-4xl font-extrabold text-foreground tracking-tight">{colaboraciones.length}</span>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mt-2">Colaboraciones</span>
          </div>
          {isOwner && user?.created_at && (
             <div className="flex flex-col items-center">
               <span className="text-4xl font-extrabold text-foreground tracking-tight">{new Date(user.created_at).getFullYear()}</span>
               <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mt-2">Miembro</span>
             </div>
          )}
        </div>
      </div>

      {/* ── Content Sections (Aportes / Colaboraciones) ── */}
      <div className="w-full space-y-16 animate-fade-in stagger-3">
        
        {/* Aportes Propios */}
        {aportesPropios.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-6">
              <FileArchive className="size-5 text-foreground" />
              <h2 className="text-xl font-bold tracking-tight text-foreground">
                Archivos Subidos
              </h2>
            </div>
            
            <PaginatedArchivos archivos={aportesPropios} emptyMessage="No hay archivos subidos" itemsPerPage={6} />
          </section>
        )}

        {/* Colaboraciones */}
        {colaboraciones.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-6">
              <Users className="size-5 text-foreground" />
              <h2 className="text-xl font-bold tracking-tight text-foreground">
                Colaboraciones
              </h2>
            </div>
            
            <PaginatedArchivos archivos={colaboraciones} emptyMessage="No hay colaboraciones" itemsPerPage={6} />
          </section>
        )}

        {/* Archivos Guardados */}
        {isOwner && archivosGuardados.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-6">
              <Bookmark className="size-5 text-foreground" />
              <h2 className="text-xl font-bold tracking-tight text-foreground">
                Apuntes Guardados
              </h2>
            </div>
            
            <PaginatedArchivos archivos={archivosGuardados} emptyMessage="No hay apuntes guardados" itemsPerPage={6} />
          </section>
        )}

        {/* Materias Guardadas */}
        {isOwner && materiasGuardadas.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-6">
              <Bookmark className="size-5 text-foreground" />
              <h2 className="text-xl font-bold tracking-tight text-foreground">
                Materias Guardadas
              </h2>
            </div>
            
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {materiasGuardadas.map((materia, i) => (
                <MateriaCard
                  key={materia.id}
                  materia={materia}
                  href={`/apuntes/${materia.semestreSlug || 'otros'}/${materia.slug}`}
                  index={i}
                />
              ))}
            </div>
          </section>
        )}

        {aportesPropios.length === 0 && colaboraciones.length === 0 && (!isOwner || (archivosGuardados.length === 0 && materiasGuardadas.length === 0)) && (
          <div className="py-12 border-t border-border/40 w-full flex flex-col items-center justify-center opacity-60">
             <FileArchive className="size-10 text-muted-foreground mb-4" />
             <p className="text-sm font-medium text-muted-foreground">Este usuario aún no tiene aportes en la nube.</p>
          </div>
        )}

      </div>
    </div>
  );
}
