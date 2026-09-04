import { generateOGImage, ogSize } from '@/lib/og-generator';
import { getSemestreBySlug, getMateriaBySlug } from '@/lib/academic';

export const runtime = 'edge';
export const alt = 'Materia | La Nube de Most';
export const size = ogSize;
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ semestre: string; materia: string }> }) {
  const { semestre: semestreSlug, materia: materiaSlug } = await params;
  const semestre = await getSemestreBySlug(semestreSlug);
  const materia = await getMateriaBySlug(materiaSlug);

  if (!semestre || !materia) {
    return generateOGImage({
      title: 'Materia no encontrada',
      type: 'default',
    });
  }

  return generateOGImage({
    title: materia.nombre,
    subtitle: `Semestre: ${semestre.nombre}`,
    type: 'materia',
  });
}
