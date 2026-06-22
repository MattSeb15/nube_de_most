import { generateOGImage, ogSize } from '@/lib/og-generator';

export const runtime = 'edge';
export const alt = 'Acerca de | La Nube de Most';
export const size = ogSize;
export const contentType = 'image/png';

export default async function Image() {
  return generateOGImage({
    title: 'Acerca de Most',
    subtitle: 'Conoce al creador de La Nube de Most y su misión de compartir conocimiento.',
    type: 'sobre-mi',
  });
}
