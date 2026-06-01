import type { Metadata } from "next";
import { getAllMaterias } from "@/lib/academic";
import { MateriaCard } from "@/components/apuntes/MateriaCard";

export const metadata: Metadata = {
  title: "Todas las Materias — La Nube de Most",
  description: "Explora todas las materias registradas en la base de datos de La Nube de Most.",
};

export default async function MateriasPage() {
  const materias = await getAllMaterias();

  // Group materias by semestre
  const grouped = materias.reduce((acc, materia) => {
    const sem = materia.semestreNombre || "Sin Semestre";
    if (!acc[sem]) acc[sem] = [];
    acc[sem].push(materia);
    return acc;
  }, {} as Record<string, typeof materias>);

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8 min-h-screen">
      {/* Header */}
      <section className="mb-12 animate-fade-in">
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
          Todas las Materias
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl">
          Explora la lista completa de materias añadidas a la base de datos, organizadas por el semestre al que pertenecen.
        </p>
      </section>

      {/* Grouped by Semestre */}
      <div className="space-y-16">
        {Object.entries(grouped).map(([semestre, mats], index) => (
          <section key={semestre} className={`animate-fade-in stagger-${index + 1}`}>
            <div className="mb-6 flex items-center gap-4">
              <h2 className="text-2xl font-bold tracking-tight text-foreground">
                {semestre}
              </h2>
              <div className="h-px bg-border/60 flex-1 mt-1" />
              <span className="text-sm font-medium text-muted-foreground">
                {mats.length} {mats.length === 1 ? "materia" : "materias"}
              </span>
            </div>
            
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {mats.map((materia, i) => (
                <MateriaCard
                  key={materia.id}
                  materia={materia}
                  href={`/apuntes/${materia.semestreSlug || 'otros'}/${materia.slug}`}
                  index={i}
                />
              ))}
            </div>
          </section>
        ))}
      </div>

      {materias.length === 0 && (
        <div className="flex flex-col items-center justify-center py-32 text-center animate-fade-in">
          <div className="bg-secondary/50 rounded-full p-6 mb-6">
            <span className="text-4xl">📚</span>
          </div>
          <h3 className="text-2xl font-bold text-foreground mb-2">No se encontraron materias</h3>
          <p className="text-muted-foreground max-w-md">
            Aún no hay materias registradas en la base de datos.
          </p>
        </div>
      )}
    </main>
  );
}
