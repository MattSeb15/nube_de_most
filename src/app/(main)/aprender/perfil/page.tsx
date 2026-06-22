import { UserCircle, PlayCircle, TrendingUp, Search, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Perfil y Reputación - Aprender | La Nube de Most",
  description: "Configura tu perfil y construye tu reputación digital académica.",
};

export default function AprenderPerfilPage() {
  return (
    <section>
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-primary/10 rounded-2xl">
          <UserCircle className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-3xl font-bold">Perfil y Reputación Digital</h2>
      </div>
      <div className="prose prose-neutral dark:prose-invert max-w-none text-muted-foreground text-lg leading-relaxed space-y-6">
        <p>
          Tu perfil en La Nube de Most es más que un simple avatar. Es tu portafolio académico y tu huella en la comunidad universitaria.
        </p>

        <h3 className="text-2xl font-bold text-foreground mt-8 mb-4 border-b border-border/50 pb-2">Cómo Personalizar tu Perfil</h3>
        <p>
          Mantener tu información actualizada ayuda a que otros estudiantes te reconozcan y validen la calidad de los apuntes que subes. Puedes modificar:
        </p>
        <ul className="list-disc pl-6 space-y-2 marker:text-primary">
          <li><strong>Foto de Perfil (Avatar):</strong> Un rostro amigable genera confianza.</li>
          <li><strong>Apodo (@username):</strong> Tu identificador único en la plataforma.</li>
          <li><strong>Biografía:</strong> ¡Este es tu pitch personal! Cuéntanos más sobre ti, en qué semestre estás, qué tecnologías o materias dominas, en qué destacas y cuáles son tus metas. Una biografía detallada te ayudará a proyectar una imagen sólida y profesional.</li>
        </ul>

        {/* Video Placeholder */}
        <div className="my-8 rounded-3xl border border-border/50 bg-muted/30 aspect-video flex flex-col items-center justify-center relative overflow-hidden group cursor-pointer">
          <div className="absolute inset-0 bg-black/5 group-hover:bg-black/10 transition-colors"></div>
          <PlayCircle className="w-16 h-16 text-primary mb-4 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all" />
          <p className="text-sm font-semibold text-foreground/80">Video Tutorial: Editando tu Perfil</p>
          <span className="text-xs text-muted-foreground">(Próximamente)</span>
        </div>

        <h3 className="text-2xl font-bold text-foreground mt-12 mb-4 border-b border-border/50 pb-2 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-green-500" />
          La Importancia de tu Reputación (SEO)
        </h3>
        
        <div className="bg-card border border-border/50 p-6 rounded-3xl shadow-sm mb-6">
          <h4 className="text-foreground font-bold flex items-center gap-2 mb-3">
            <Search className="w-5 h-5 text-blue-500" />
            Indexación en Google
          </h4>
          <p className="text-base m-0 text-muted-foreground">
            Los perfiles de los colaboradores más activos están diseñados con las mejores prácticas de <strong>SEO (Optimización para Motores de Búsqueda)</strong>. Esto significa que si llenas correctamente tu perfil y aportas apuntes de calidad, tu perfil en La Nube de Most podrá aparecer en los primeros resultados cuando alguien busque tu nombre en Google.
          </p>
        </div>

        <p>
          Tener una buena <strong>reputación digital</strong> es invaluable en el mundo profesional. Un perfil robusto demuestra que eres una persona proactiva, solidaria, metódica (al organizar apuntes) y tecnológicamente activa. ¡Es un currículum paralelo que habla excelente de tus habilidades blandas ante futuros empleadores!
        </p>

        <div className="mt-12 pt-8 border-t border-border/50">
          <Link href="/perfil/editar">
            <Button size="lg" className="rounded-full shadow-lg gap-2 text-base px-8">
              Editar mi Perfil <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
