"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  BookOpen, 
  Search, 
  UploadCloud, 
  FileText, 
  Users, 
  ArrowRight,
  Lightbulb,
  UserCircle
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const sections = [
  { href: "/aprender", title: "Introducción", icon: BookOpen, exact: true },
  { href: "/aprender/explorar", title: "Explorar Contenido", icon: Search },
  { href: "/aprender/colaborar", title: "Cómo Colaborar", icon: UploadCloud },
  { href: "/aprender/archivos", title: "Tipos de Archivos", icon: FileText },
  { href: "/aprender/perfil", title: "Perfil y Reputación", icon: UserCircle },
  { href: "/aprender/comunidad", title: "Comunidad y Reglas", icon: Users },
];

export default function AprenderLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-b from-primary/10 via-background to-background pt-20 pb-16 md:pt-32 md:pb-24">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary mb-6 text-sm font-medium">
            <Lightbulb className="w-4 h-4" />
            <span>Centro de Aprendizaje</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
            Aprende a usar <br className="hidden md:block" /> La Nube de Most
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Domina la plataforma, descubre cómo encontrar los mejores apuntes y conviértete en un colaborador estrella en nuestra comunidad.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/apuntes">
              <Button size="lg" variant="outline" className="rounded-full px-8 bg-background/50 backdrop-blur-md">
                Ir a Explorar
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl mt-8 relative">
        <div className="flex flex-col lg:flex-row gap-12 items-start relative">
          
          {/* Sidebar */}
          <aside className="lg:w-72 shrink-0 lg:sticky lg:top-28 hidden md:block">
            <div className="bg-card/50 backdrop-blur-xl border border-border/50 rounded-3xl p-6 shadow-sm">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-6">Contenido</h3>
              <nav className="flex flex-col gap-2">
                {sections.map((section) => {
                  const isActive = section.exact 
                    ? pathname === section.href 
                    : pathname.startsWith(section.href);
                  const Icon = section.icon;
                  return (
                    <Link
                      key={section.href}
                      href={section.href}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-all duration-300",
                        isActive 
                          ? "bg-primary text-primary-foreground shadow-md font-semibold translate-x-1" 
                          : "text-muted-foreground hover:bg-muted hover:text-foreground hover:translate-x-1 font-medium"
                      )}
                    >
                      <Icon className={cn("w-5 h-5", isActive ? "text-primary-foreground" : "text-muted-foreground")} />
                      {section.title}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Content Area */}
          <main className="flex-1 max-w-3xl">
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
