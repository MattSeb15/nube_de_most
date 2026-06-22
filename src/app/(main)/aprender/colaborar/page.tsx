import { UploadCloud, AlertCircle, FileUp, FolderSync, PlayCircle, ArrowRight, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PdfModalPreview, ImageModalPreview } from "./UploadModalsPreview";

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

        {/* Video Tutorial */}
        <div className="my-8 rounded-3xl border border-border/50 bg-black/5 dark:bg-black/20 overflow-hidden shadow-md w-full aspect-video relative group">
          <video
            src="https://firebasestorage.googleapis.com/v0/b/nube-de-most.firebasestorage.app/o/videos%2Fedited_most_guide.webm?alt=media&token=b4478ba7-4f0d-4a44-a31c-1404692b1e84"
            controls
            className="w-full h-full object-contain outline-none"
            preload="metadata"
          >
            Tu navegador no soporta el elemento de video.
          </video>
        </div>
        
        <h3 className="text-2xl font-bold text-foreground mt-8 mb-4 border-b border-border/50 pb-2">Herramientas de Subida Inteligente</h3>
        <p>
          Para mantener la plataforma rápida y ahorrar espacio, hemos desarrollado herramientas de subida ("Upload Modals") que optimizan automáticamente tus documentos antes de guardarlos.
        </p>

        <div className="grid md:grid-cols-2 gap-6 mt-6">
          <div className="bg-card border border-border/50 p-6 rounded-3xl shadow-sm flex flex-col">
            <h4 className="text-foreground font-bold flex items-center gap-2 mb-3">
              <FileUp className="w-5 h-5 text-red-500" />
              Subida Múltiple de PDFs
            </h4>
            <p className="text-base text-muted-foreground mb-6 flex-1">
              Nuestra <strong>Herramienta de Subida de PDFs</strong> te permite seleccionar varios archivos a la vez. Lo más importante: <strong>optimiza su peso</strong> automáticamente para convertirlos a formatos más ligeros sin perder legibilidad, mostrando el porcentaje de ahorro en tiempo real.
            </p>
            {/* Modal Preview */}
            <div className="w-full h-64 sm:h-72 relative overflow-hidden group mt-auto pointer-events-none select-none rounded-xl">
              <div className="w-[800px] origin-top-left scale-[0.40] sm:scale-[0.45] md:scale-[0.40] lg:scale-[0.45]">
                <PdfModalPreview />
              </div>
              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-card via-card/80 to-transparent z-10" />
            </div>
          </div>
          <div className="bg-card border border-border/50 p-6 rounded-3xl shadow-sm flex flex-col">
            <h4 className="text-foreground font-bold flex items-center gap-2 mb-3">
              <FileUp className="w-5 h-5 text-blue-500" />
              Creador de Cuadernos
            </h4>
            <p className="text-base text-muted-foreground mb-6 flex-1">
              Con la <strong>Herramienta de Creador de Cuadernos</strong>, puedes subir fotos de tus apuntes o pizarras. Se encarga de comprimirlas y agruparlas automáticamente para que no gastes tus datos móviles al subirlas o verlas posteriormente.
            </p>
            {/* Modal Preview */}
            <div className="w-full h-64 sm:h-72 relative overflow-hidden group mt-auto pointer-events-none select-none rounded-xl">
              <div className="w-[800px] origin-top-left scale-[0.40] sm:scale-[0.45] md:scale-[0.40] lg:scale-[0.45]">
                <ImageModalPreview />
              </div>
              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-card via-card/80 to-transparent z-10" />
            </div>
          </div>
        </div>

        <h3 className="text-2xl font-bold text-foreground mt-12 mb-4 border-b border-border/50 pb-2 flex items-center gap-3">
          Carpetas Colaborativas
          <span className="bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-bold px-2.5 py-1 rounded-md border border-green-500/20 tracking-wide">
            Colaborativa
          </span>
        </h3>
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
