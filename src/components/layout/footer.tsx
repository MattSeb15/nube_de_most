import { cn } from "@/lib/utils";
import Link from "next/link";
import { getPerfilMost } from "@/lib/academic";
import { MostBuiltBy } from "./MostBuiltBy";

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={cn("size-5", className)}
    >
      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12Z" />
    </svg>
  );
}

export async function Footer() {
  const perfilMost = await getPerfilMost();
  const projectGithub = perfilMost.redes.find(red => red.plataforma === "GitHub Proyecto")?.url || "https://github.com/Mostov05/nube_de_mateo";

  return (
    <footer className="w-full bg-background border-t border-border/30 pb-8 pt-16 mt-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 mb-16">
          {/* Brand/Description */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-2 flex flex-col items-start gap-4">
            <Link href="/" className="text-2xl font-extrabold tracking-tighter text-foreground hover:opacity-80 transition-opacity">
              La Nube de Most
            </Link>
            <p className="text-muted-foreground font-medium max-w-xs text-sm leading-relaxed">
              Tu espacio para la inspiración. Apuntes organizados, colaboración académica y herramientas diseñadas para estudiantes.
            </p>
            <div className="flex items-center gap-4 mt-2">
              <a
                href={projectGithub}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="text-muted-foreground transition-transform hover:scale-110 hover:text-foreground"
              >
                <GitHubIcon className="size-5" />
              </a>
            </div>
          </div>

          {/* Links 1 */}
          <div className="flex flex-col gap-4">
            <h4 className="font-semibold text-foreground tracking-tight">Plataforma</h4>
            <div className="flex flex-col gap-3 text-sm text-muted-foreground font-medium">
              <Link href="/apuntes" className="hover:text-foreground transition-colors w-fit">Explorar Apuntes</Link>
              <Link href="/profesores" className="hover:text-foreground transition-colors w-fit">Directorio de Profesores</Link>
              <Link href="/actividades" className="hover:text-foreground transition-colors w-fit">Actividades</Link>
            </div>
          </div>

          {/* Links 2 */}
          <div className="flex flex-col gap-4">
            <h4 className="font-semibold text-foreground tracking-tight">Comunidad</h4>
            <div className="flex flex-col gap-3 text-sm text-muted-foreground font-medium">
              <Link href="/sobre-mi" className="hover:text-foreground transition-colors w-fit">Acerca de Mí</Link>
              <Link href="/buscar" className="hover:text-foreground transition-colors w-fit">Buscar Recursos</Link>
            </div>
          </div>

          {/* Links 3 */}
          <div className="flex flex-col gap-4">
            <h4 className="font-semibold text-foreground tracking-tight">Legal</h4>
            <div className="flex flex-col gap-3 text-sm text-muted-foreground font-medium">
              <Link href="#" className="hover:text-foreground transition-colors w-fit">Términos de Servicio</Link>
              <Link href="#" className="hover:text-foreground transition-colors w-fit">Política de Privacidad</Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-border/30 pt-8 sm:flex-row text-sm font-medium text-muted-foreground">
          <p className="tracking-tight">© 2026 La Nube de Most. Todos los derechos reservados.</p>
          <MostBuiltBy variant="with-logo" theme="gradient" size={14} />
        </div>
      </div>
    </footer>
  );
}
