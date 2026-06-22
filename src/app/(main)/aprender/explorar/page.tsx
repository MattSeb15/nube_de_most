import { Search, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Explorar - Aprender | La Nube de Most",
  description: "Descubre cómo buscar apuntes y materias de forma rápida.",
};

export default function AprenderExplorarPage() {
  return (
    <section>
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-primary/10 rounded-2xl">
          <Search className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-3xl font-bold">Explorar Contenido</h2>
      </div>
      <div className="prose prose-neutral dark:prose-invert max-w-none text-muted-foreground text-lg leading-relaxed space-y-6">
        <p>
          Encontrar lo que necesitas es rápido e intuitivo. Existen tres formas principales de navegar por La Nube de Most:
        </p>
        
        <div className="grid gap-4 mt-6">
          <div className="bg-background border border-border/50 p-5 rounded-2xl hover:border-primary/50 transition-colors">
            <h4 className="text-foreground font-bold mb-2 flex items-center gap-2">
              <span className="bg-primary/20 text-primary w-6 h-6 rounded-full flex items-center justify-center text-sm">1</span>
              Buscador Global
            </h4>
            <p className="text-base text-muted-foreground">
              Usa la barra de búsqueda en la parte superior para encontrar instantáneamente apuntes, materias o perfiles de profesores. Es la forma más rápida de encontrar algo específico.
            </p>
          </div>
          <div className="bg-background border border-border/50 p-5 rounded-2xl hover:border-primary/50 transition-colors">
            <h4 className="text-foreground font-bold mb-2 flex items-center gap-2">
              <span className="bg-primary/20 text-primary w-6 h-6 rounded-full flex items-center justify-center text-sm">2</span>
              Por Materias
            </h4>
            <p className="text-base text-muted-foreground">
              Entra a la sección "Explorar" y filtra por tu semestre. Verás todas las materias disponibles y los apuntes asociados a cada una.
            </p>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-border/50">
          <Link href="/apuntes">
            <Button size="lg" className="rounded-full shadow-lg gap-2 text-base px-8">
              Ir al Buscador y Materias <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
