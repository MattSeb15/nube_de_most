import { getCarreras } from "@/lib/academic";
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Selecciona una Carrera | La Nube de Most",
  description: "Selecciona tu carrera para ver los apuntes y la malla curricular.",
};

export const revalidate = 3600;

export default async function CarrerasSelectorPage() {
  const carreras = await getCarreras();

  return (
    <div className="container mx-auto max-w-5xl py-16 px-4 sm:px-6 lg:px-8 min-h-[60vh] flex flex-col justify-center">
      <div className="mb-16 text-center animate-fade-in">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl mb-4">
          Selecciona tu Carrera
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Elige tu carrera para explorar su malla curricular interactiva y acceder a los apuntes de la comunidad.
        </p>
      </div>

      {carreras.length === 0 ? (
        <div className="text-center py-20 bg-card/30 rounded-2xl border border-border/50 animate-fade-in">
          <BookOpen className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-foreground">No hay carreras disponibles</h3>
          <p className="text-muted-foreground mt-2">Pronto añadiremos nuevas carreras.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
          {carreras.map((carrera) => (
            <Link
              key={carrera.id}
              href={`/${carrera.slug}/apuntes`}
              className="group relative flex flex-col p-7 rounded-2xl border border-border/40 bg-card/30 hover:bg-card/80 transition-all duration-300 hover:shadow-sm hover:border-border"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-2.5 h-2.5 rounded-full shadow-sm"
                    style={{ backgroundColor: carrera.color || "#3b82f6" }}
                  />
                  <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Carrera
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-foreground transition-transform group-hover:translate-x-1" />
              </div>
              
              <div className="mt-auto">
                <h3 className="text-xl font-semibold text-foreground tracking-tight mb-2">
                  {carrera.nombre}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {carrera.descripcion || "Explora las materias y apuntes disponibles"}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
