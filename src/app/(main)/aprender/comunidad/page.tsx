import { Users, Heart, Bookmark, Flag, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Comunidad y Reglas - Aprender | La Nube de Most",
  description: "Conoce las normas de nuestra comunidad y cómo interactuar.",
};

export default function AprenderComunidadPage() {
  return (
    <section>
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-primary/10 rounded-2xl">
          <Users className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-3xl font-bold">Comunidad y Reglas</h2>
      </div>
      <div className="prose prose-neutral dark:prose-invert max-w-none text-muted-foreground text-lg leading-relaxed space-y-6">
        <p>
          La Nube de Most es un espacio de respeto y apoyo mutuo. Al ser parte de la comunidad, puedes interactuar con el contenido de diversas formas:
        </p>
        
        <ul className="space-y-3 mt-4">
          <li className="flex items-center gap-3 bg-background border border-border/50 px-4 py-3 rounded-xl">
            <Heart className="w-5 h-5 text-red-500 fill-red-500/20 shrink-0" />
            <span><strong>Dar Me Gusta:</strong> Agradece a los autores por su esfuerzo. Un simple "me gusta" motiva a seguir compartiendo.</span>
          </li>
          <li className="flex items-center gap-3 bg-background border border-border/50 px-4 py-3 rounded-xl">
            <Bookmark className="w-5 h-5 text-blue-500 fill-blue-500/20 shrink-0" />
            <span><strong>Guardar Apuntes:</strong> Crea tu propia biblioteca personal de favoritos para acceder rápidamente antes de un examen.</span>
          </li>
          <li className="flex items-center gap-3 bg-background border border-border/50 px-4 py-3 rounded-xl">
            <Flag className="w-5 h-5 text-amber-500 fill-amber-500/20 shrink-0" />
            <span><strong>Reportar:</strong> Ayúdanos a mantener la calidad reportando contenido inapropiado o spam. La moderación es tarea de todos.</span>
          </li>
        </ul>

        <p className="mt-8">
          <strong>Reglas de oro:</strong>
        </p>
        <ol className="list-decimal pl-6 space-y-2 marker:text-primary marker:font-bold">
          <li>No subas material con derechos de autor explícitos (ej. libros comerciales enteros).</li>
          <li>No subas contenido ofensivo o ajeno al ámbito académico.</li>
          <li>Respeta a los profesores y compañeros en los comentarios o descripciones de los archivos.</li>
        </ol>
        
        <p>
          Mantengamos la plataforma limpia y enfocada en el aprendizaje colaborativo.
        </p>
        <div className="mt-12 pt-8 border-t border-border/50">
          <Link href="/">
            <Button size="lg" className="rounded-full shadow-lg gap-2 text-base px-8">
              Ver Actividad Reciente <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
