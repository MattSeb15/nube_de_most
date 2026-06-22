import { generateOGImage, ogSize } from '@/lib/og-generator';

export const runtime = 'edge';
export const alt = 'La Nube de Most';
export const size = ogSize;
export const contentType = 'image/png';

export default async function Image() {
  return generateOGImage({
    title: 'La Nube de Most',
    subtitle: 'Plataforma de recursos académicos para la Universidad Técnica de Ambato.',
    type: 'default',
  });
}
