import { generateOGImage, ogSize } from '@/lib/og-generator';

export const runtime = 'edge';
export const alt = 'Buscar | La Nube de Most';
export const size = ogSize;
export const contentType = 'image/png';

export default async function Image() {
  return generateOGImage({
    title: 'Buscador de Apuntes',
    subtitle: 'Encuentra rápidamente apuntes, cuadernos y documentos de cualquier materia.',
    type: 'buscar',
  });
}
