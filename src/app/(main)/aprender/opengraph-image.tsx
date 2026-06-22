import { generateOGImage, ogSize } from '@/lib/og-generator';

export const runtime = 'edge';
export const alt = 'Aprender | La Nube de Most';
export const size = ogSize;
export const contentType = 'image/png';

export default async function Image() {
  return generateOGImage({
    title: 'Aprender',
    subtitle: 'Rutas de aprendizaje y cursos recomendados para potenciar tus habilidades.',
    type: 'aprender',
  });
}
