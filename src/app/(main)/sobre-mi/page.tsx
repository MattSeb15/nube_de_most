import type { Metadata } from "next";
import Link from "next/link";
import { getPerfilMost, getEstadisticas, getRoadmapFeatures } from "@/lib/academic";
import { Cloud } from "lucide-react";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Acerca de",
  description:
    "Conoce a Mateo Sebastian Oviedo Trujillo (Most), creador de La Nube de Most y compartidor de apuntes académicos.",
  alternates: {
    canonical: "/sobre-mi",
  },
  openGraph: {
    title: "Acerca de | La Nube de Most",
    description: "Conoce a Mateo Sebastian Oviedo Trujillo (Most), creador de La Nube de Most y compartidor de apuntes académicos.",
    url: "/sobre-mi",
  },
};

// ── Custom SVG Brand Icons (Filled/Solid Styles) ──

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12Z" />
    </svg>
  );
}

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
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

function SocialIcon({ name, className }: { name: string; className?: string }) {
  switch (name) {
    case "github":
      return <GithubIcon className={className} />;
    case "linkedin":
      return <LinkedinIcon className={className} />;
    case "instagram":
      return <InstagramIcon className={className} />;
    case "twitter":
      return <TwitterIcon className={className} />;
    default:
      return <GithubIcon className={className} />;
  }
}

export default async function SobreMiPage() {
  const perfilMost = await getPerfilMost();
  const siteStats = await getEstadisticas();
  const roadmapFeatures = await getRoadmapFeatures();

  const stats = [
    { label: "Apuntes", value: siteStats.totalApuntes },
    { label: "Materias", value: siteStats.totalMaterias },
    { label: "Usuarios", value: siteStats.totalUsuarios || 0 },
  ];

  return (
    <main className="min-h-screen bg-background relative flex flex-col items-center pb-24 overflow-hidden">
      
      {/* Hero-like Fog Background */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none bg-background"
        style={{
          maskImage: 'radial-gradient(ellipse 1000px 800px at center top, black 0%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse 1000px 800px at center top, black 0%, transparent 80%)'
        }}
      >
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:32px]" />
      </div>

      <div className="relative z-10 w-full max-w-3xl px-6 pt-16 space-y-12">
        
        {/* Header / Profile */}
        <section className="flex flex-col items-center text-center animate-fade-in space-y-5">
          <Link href="/" className="flex items-center justify-center mb-2 group focus-visible:outline-none">
             <Cloud className="size-8 fill-foreground text-foreground transition-transform group-hover:scale-105 opacity-40" />
          </Link>
          
          <div className="relative group">
            {perfilMost.avatar_url ? (
              <img 
                src={perfilMost.avatar_url} 
                alt={`Avatar de ${perfilMost.apodo}`} 
                className="h-24 w-24 rounded-full object-cover ring-2 ring-primary/20"
              />
            ) : (
              <img 
                src="https://avatars.githubusercontent.com/u/93635987?v=4" 
                alt="Avatar de Most" 
                className="h-24 w-24 rounded-full object-cover ring-2 ring-primary/20"
              />
            )}
          </div>

          <div className="space-y-1.5">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
              {perfilMost.nombreCompleto}
            </h1>
            <div className="flex items-center justify-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">
                {perfilMost.rol}
              </span>
              <span className="text-sm font-medium text-primary">
                @{perfilMost.apodo}
              </span>
            </div>
          </div>

          <p className="max-w-lg text-sm sm:text-base leading-relaxed text-muted-foreground">
            {perfilMost.bio}
          </p>

          {/* Social Links - Clean Links */}
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            {perfilMost.redes
              .filter((red) => red.plataforma !== "GitHub Proyecto")
              .map((red) => (
              <a
                key={red.plataforma}
                href={red.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-2 px-3.5 py-2 rounded-full bg-secondary/30 hover:bg-secondary/60 text-muted-foreground hover:text-foreground transition-all duration-200"
              >
                <SocialIcon name={red.icono} className="size-4" />
                <span className="text-sm font-medium">
                  {red.plataforma}
                </span>
              </a>
            ))}
          </div>
        </section>

        {/* Minimalist Stats */}
        <section className="flex items-center justify-center gap-8 sm:gap-12 animate-fade-in stagger-1">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center group">
              <div className="text-2xl sm:text-3xl font-bold text-foreground transition-colors group-hover:text-primary">
                {stat.value}
              </div>
              <div className="text-xs sm:text-sm font-medium text-muted-foreground">
                {stat.label}
              </div>
            </div>
          ))}
        </section>

        <div className="w-full h-px bg-border/40" />

        <div className="animate-fade-in stagger-2 space-y-12">
          {/* Proyecto Info - No Cards, just Typography */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold tracking-tight text-foreground">
              Sobre el proyecto
            </h2>
            <div className="space-y-4 text-sm sm:text-base leading-relaxed text-muted-foreground">
              <p>
                <strong className="text-foreground font-semibold">La Nube de Most</strong> es una plataforma académica colaborativa donde centralizamos, organizamos y compartimos apuntes, tareas y recursos de la universidad. El objetivo es construir una base de conocimiento conjunta para que todos los compañeros puedan acceder fácilmente al material, aportar sus propias notas y beneficiarse de los tips de estudio de toda la clase.
              </p>
              <p>
                El proyecto es <strong className="text-foreground font-semibold">open source</strong> y está construido con <strong className="text-foreground font-semibold">Next.js</strong>, <strong className="text-foreground font-semibold">Tailwind CSS</strong> y <strong className="text-foreground font-semibold">TypeScript</strong>. Cuenta con licencia <strong className="text-foreground font-semibold">MIT</strong>, lo que significa que cualquiera puede usarlo, modificarlo y adaptarlo a sus necesidades.
              </p>
              <p>
                Si eres estudiante y quieres crear tu propia &quot;nube&quot; colaborativa para tu curso o grupo de estudio, ¡siéntete libre de hacer un fork del repositorio!
              </p>
              
              <div className="pt-4">
                {(() => {
                  const projectGithub = perfilMost.redes.find(red => red.plataforma === "GitHub Proyecto")?.url;
                  if (!projectGithub) return null;
                  
                  return (
                    <a 
                      href={projectGithub} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-foreground text-background font-semibold text-sm hover:bg-foreground/90 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 group"
                    >
                      <SocialIcon name="github" className="size-5" />
                      Ir al repositorio en GitHub
                    </a>
                  );
                })()}
              </div>
            </div>
          </section>

          {/* Roadmap Features */}
          {roadmapFeatures.length > 0 && (
            <>
              <div className="w-full h-px bg-border/40 my-8" />
              <section className="space-y-6">
                <div className="space-y-1.5">
                  <h2 className="text-xl font-semibold tracking-tight text-foreground">
                    Próximas Features (Roadmap)
                  </h2>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    En esto estamos trabajando para mejorar la plataforma. ¡Si quieres hacer alguna de estas u otras sugerencias, eres bienvenido a colaborar!
                  </p>
                </div>

                <div className="grid gap-3">
                  {roadmapFeatures.map((feature) => (
                    <div 
                      key={feature.id} 
                      className={cn(
                        "flex items-center gap-3.5 p-4 rounded-xl border transition-all duration-200",
                        feature.completada 
                          ? "bg-secondary/30 border-border/40 opacity-75" 
                          : "bg-background border-border shadow-sm"
                      )}
                    >
                      <div className={cn(
                        "flex items-center justify-center shrink-0 size-5 rounded-full transition-colors",
                        feature.completada 
                          ? "bg-primary text-primary-foreground" 
                          : "border-2 border-muted-foreground/40 bg-transparent"
                      )}>
                        {feature.completada && (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" className="size-3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </div>
                      <span className={cn(
                        "text-sm font-medium leading-none",
                        feature.completada ? "line-through text-muted-foreground decoration-muted-foreground/50" : "text-foreground"
                      )}>
                        {feature.titulo}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}
        </div>

      </div>
    </main>
  );
}
