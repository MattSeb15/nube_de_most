import type { Metadata } from "next";
import { getSemestres, getActiveMalla } from "@/lib/academic";
import { ApuntesMainContent } from "@/components/apuntes/ApuntesMainContent";

export const metadata: Metadata = {
  title: "Apuntes",
  description:
    "Explora los apuntes organizados por semestre y materia en La Nube de Most.",
  alternates: {
    canonical: "/apuntes",
  },
  openGraph: {
    title: "Apuntes | La Nube de Most",
    description: "Explora los apuntes organizados por semestre y materia en La Nube de Most.",
    url: "/apuntes",
  },
};

export default async function ApuntesPage({ params }: { params: Promise<{ carrera: string }> }) {
  const { carrera: carreraSlug } = await params;
  
  const [semestres, mallaResult] = await Promise.all([
    getSemestres(),
    getActiveMalla(carreraSlug),
  ]);

  if (!mallaResult) {
    return (
      <main className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 lg:px-8 flex items-center justify-center min-h-[50vh]">
        <section className="mb-8 animate-fade-in text-center py-12">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-4">
            Carrera no encontrada
          </h1>
          <p className="mt-2 text-muted-foreground">
            No pudimos encontrar la carrera "{carreraSlug}" o aún no tiene una malla activa.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <section className="mb-8 animate-fade-in text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Apuntes de {mallaResult.malla.nombre}
        </h1>
        <p className="mt-2 text-muted-foreground">
          Explora la malla curricular y los apuntes organizados por materia y semestre.
        </p>
      </section>

      {/* Main Content with View Toggle */}
      <ApuntesMainContent semestres={semestres} mallaResult={mallaResult} carreraSlug={carreraSlug} />
    </main>
  );
}
