import { UploadCloud, AlertCircle, FileUp, FolderSync, PlayCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Cómo Colaborar - Aprender | La Nube de Most",
  description: "Aprende a subir archivos y colaborar con la comunidad.",
};

export default function AprenderColaborarPage() {
  return (
    <section>
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-primary/10 rounded-2xl">
          <UploadCloud className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-3xl font-bold">Cómo Colaborar</h2>
      </div>
      <div className="prose prose-neutral dark:prose-invert max-w-none text-muted-foreground text-lg leading-relaxed space-y-6">
        <p>
          La Nube de Most crece gracias a estudiantes como tú. Subir un apunte es muy sencillo y ayuda a cientos de compañeros. Nuestro sistema cuenta con herramientas avanzadas para optimizar tus archivos y organizar la información.
        </p>

        {/* Video Placeholder */}
        <div className="my-8 rounded-3xl border border-border/50 bg-muted/30 aspect-video flex flex-col items-center justify-center relative overflow-hidden group cursor-pointer">
          <div className="absolute inset-0 bg-black/5 group-hover:bg-black/10 transition-colors"></div>
          <PlayCircle className="w-16 h-16 text-primary mb-4 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all" />
          <p className="text-sm font-semibold text-foreground/80">Video Tutorial: Subiendo tu primer apunte</p>
          <span className="text-xs text-muted-foreground">(Próximamente)</span>
        </div>
        
        <h3 className="text-2xl font-bold text-foreground mt-8 mb-4 border-b border-border/50 pb-2">Herramientas de Subida Inteligente</h3>
        <p>
          Para mantener la plataforma rápida y ahorrar espacio, hemos desarrollado herramientas de subida ("Upload Modals") que optimizan automáticamente tus documentos antes de guardarlos.
        </p>

        <div className="grid md:grid-cols-2 gap-6 mt-6">
          <div className="bg-card border border-border/50 p-6 rounded-3xl shadow-sm">
            <h4 className="text-foreground font-bold flex items-center gap-2 mb-3">
              <FileUp className="w-5 h-5 text-red-500" />
              Subida Múltiple de PDFs
            </h4>
            <p className="text-base m-0 text-muted-foreground">
              Nuestro <code>MultiPdfUploadModal</code> te permite seleccionar varios PDFs a la vez. Lo más importante: <strong>optimiza su peso</strong> automáticamente utilizando <code>pdf.js</code> para convertirlos a formatos más ligeros sin perder legibilidad, mostrando el porcentaje de ahorro en tiempo real.
            </p>
          </div>
          <div className="bg-card border border-border/50 p-6 rounded-3xl shadow-sm">
            <h4 className="text-foreground font-bold flex items-center gap-2 mb-3">
              <FileUp className="w-5 h-5 text-blue-500" />
              Subida Múltiple de Imágenes
            </h4>
            <p className="text-base m-0 text-muted-foreground">
              Con el <code>MultiImageUploadModal</code>, puedes subir fotos de tus cuadernos o pizarras. Se encarga de comprimirlas automáticamente para que no gastes tus datos móviles al subirlas o verlas posteriormente.
            </p>
          </div>
        </div>

        <h3 className="text-2xl font-bold text-foreground mt-12 mb-4 border-b border-border/50 pb-2">Carpetas Colaborativas</h3>
        <p>
          Los apuntes se organizan dentro de <strong>Carpetas Colaborativas</strong> (relacionadas a una Materia y un Profesor). Esto significa que no necesitas crear carpetas desde cero; si ya existe la carpeta de "Física 101 - Prof. Martínez", simplemente agregas tu apunte allí, y todo el material de esa clase quedará centralizado.
        </p>

        <div className="bg-amber-500/10 border border-amber-500/20 p-6 rounded-3xl mt-8">
          <h4 className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-2 mb-3">
            <AlertCircle className="w-5 h-5" />
            Tip Importante
          </h4>
          <p className="text-base text-amber-700 dark:text-amber-300/80 m-0">
            Asegúrate de que tus documentos sean legibles. Si son fotos de cuadernos, intenta usar una aplicación de escáner en tu celular antes de subirlas para mejorar el contraste.
          </p>
        </div>
        <div className="mt-12 pt-8 border-t border-border/50">
          <Link href="/apuntes">
            <Button size="lg" className="rounded-full shadow-lg gap-2 text-base px-8">
              Ir a Subir Archivos <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
