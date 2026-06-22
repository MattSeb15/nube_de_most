import { FileText, CheckCircle2, FileImage, Image as ImageIcon, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Tipos de Archivos - Aprender | La Nube de Most",
  description: "Conoce los formatos admitidos y cómo usar los Cuadernos Digitales.",
};

export default function AprenderArchivosPage() {
  return (
    <section>
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-primary/10 rounded-2xl">
          <FileText className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-3xl font-bold">Tipos de Archivos</h2>
      </div>
      <div className="prose prose-neutral dark:prose-invert max-w-none text-muted-foreground text-lg leading-relaxed space-y-6">
        <p>
          Para mantener la plataforma rápida, segura y estandarizada, nos enfocamos en dos formatos principales que garantizan la mejor experiencia de lectura para todos los estudiantes.
        </p>

        <h3 className="text-2xl font-bold text-foreground mt-8 mb-4 border-b border-border/50 pb-2">Archivos Principales</h3>
        
        <div className="grid sm:grid-cols-2 gap-4 mt-6">
          <div className="flex items-start gap-3 bg-card p-5 rounded-2xl border border-border/50 shadow-sm">
            <CheckCircle2 className="w-6 h-6 text-red-500 mt-0.5 shrink-0" />
            <div>
              <h5 className="font-bold text-foreground text-lg">Documentos PDF</h5>
              <p className="text-sm text-muted-foreground mt-1">El formato ideal por excelencia. Preserva el diseño exacto, es fácil de leer, buscar texto dentro de ellos y la plataforma los comprime eficientemente.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 bg-card p-5 rounded-2xl border border-border/50 shadow-sm border-l-4 border-l-purple-500">
            <FileImage className="w-6 h-6 text-purple-500 mt-0.5 shrink-0" />
            <div>
              <h5 className="font-bold text-foreground text-lg">Cuadernos (Imágenes)</h5>
              <p className="text-sm text-muted-foreground mt-1">Colecciones de imágenes secuenciales (JPG, PNG) que simulan un cuaderno físico. Ideal para fotos de pizarrones o apuntes a mano.</p>
            </div>
          </div>
        </div>

        <h3 className="text-2xl font-bold text-foreground mt-12 mb-4 border-b border-border/50 pb-2">¿Qué son los Cuadernos?</h3>
        <p>
          A diferencia de un archivo PDF único, un <strong>Cuaderno</strong> es un formato nativo de La Nube de Most creado a partir de múltiples imágenes.
        </p>
        <p>
          Muchas veces en clase tomamos múltiples fotografías de la pizarra o escaneamos hojas sueltas. En lugar de forzarte a convertirlas a un PDF antes de subirlas, puedes subir las imágenes directamente. La plataforma las agrupa y genera un "Cuaderno" interactivo que puedes hojear página por página como si fuera un libro físico.
        </p>
        
        <div className="bg-purple-500/10 border border-purple-500/20 p-6 rounded-3xl mt-6 shadow-sm">
          <h4 className="text-purple-600 dark:text-purple-400 font-bold flex items-center gap-2 mb-2">
            El verdadero objetivo de un Cuaderno
          </h4>
          <p className="text-base text-purple-700 dark:text-purple-300/90 m-0 leading-relaxed">
            La idea central de este formato es que puedas <strong>actualizar tus apuntes de forma progresiva durante el semestre actual</strong>. Si hoy tuviste una clase, puedes simplemente tomarle una foto a tu cuaderno real o a la pizarra y añadirla a tu "Cuaderno Digital" en la plataforma. De esta forma, el documento va creciendo clase a clase, manteniéndose siempre al día sin el tedio de tener que crear y subir un PDF nuevo cada vez que quieras añadir una página.
          </p>
        </div>

        {/* Media Placeholder */}
        <div className="my-8 rounded-3xl border border-border/50 bg-muted/30 aspect-video flex flex-col items-center justify-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-black/5"></div>
          <ImageIcon className="w-16 h-16 text-primary mb-4 opacity-50" />
          <p className="text-sm font-semibold text-foreground/80">Ejemplo de Visualizador de Cuadernos</p>
          <span className="text-xs text-muted-foreground">(Imagen/Animación Próximamente)</span>
        </div>

        <div className="mt-12 pt-8 border-t border-border/50">
          <Link href="/apuntes">
            <Button size="lg" className="rounded-full shadow-lg gap-2 text-base px-8">
              Ver Archivos y Cuadernos <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
