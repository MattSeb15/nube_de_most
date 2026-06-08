import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Actividades | La Nube de Most",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ActividadesPage() {
  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="max-w-2xl w-full text-center space-y-8 animate-fade-in">
        <div className="inline-flex items-center justify-center size-20 rounded-3xl bg-primary/10 text-primary mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-10"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
          Calendario de Actividades
        </h1>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary font-bold text-sm tracking-wide uppercase border border-primary/20">
          Work in Progress
        </div>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
          Estamos construyendo un sistema completo para rastrear tus tareas, deberes y proyectos. Mantente al día con notificaciones, colabora con tus compañeros y nunca te pierdas una entrega.
        </p>
        <div className="pt-8">
          <Link href="/">
            <Button size="lg" className="rounded-full px-8 font-bold">
              Volver al Inicio
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
