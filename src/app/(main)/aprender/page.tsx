import { BookOpen, ShieldCheck, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Aprender - Introducción | La Nube de Most",
  description: "Descubre qué es La Nube de Most y nuestra misión principal.",
};

export default function AprenderIntroPage() {
  return (
    <section>
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-primary/10 rounded-2xl">
          <BookOpen className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-3xl font-bold">Introducción</h2>
      </div>
      <div className="prose prose-neutral dark:prose-invert max-w-none text-muted-foreground text-lg leading-relaxed space-y-6">
        <p>
          Bienvenido a <strong>La Nube de Most</strong>, el epicentro del conocimiento universitario. Esta plataforma fue creada con un propósito claro: centralizar y democratizar el acceso a materiales de estudio, apuntes y recursos valiosos.
        </p>
        <div className="bg-card border border-border/50 p-6 rounded-3xl shadow-sm my-8">
          <h4 className="text-foreground font-bold flex items-center gap-2 mb-3">
            <ShieldCheck className="w-5 h-5 text-green-500" />
            Nuestra Misión
          </h4>
          <p className="text-base m-0">
            Evitar que el conocimiento se pierda al final de cada semestre. Queremos que el esfuerzo de un estudiante hoy, sirva para facilitar el aprendizaje de muchos mañana.
          </p>
        </div>
        <p>
          Aquí podrás encontrar desde resúmenes de materias específicas, hasta exámenes pasados (¡solo con fines de estudio!) organizados por materia y profesor.
        </p>
        
        <div className="mt-12 pt-8 border-t border-border/50">
          <Link href="/apuntes">
            <Button size="lg" className="rounded-full shadow-lg gap-2 text-base px-8">
              Empezar a Explorar <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
