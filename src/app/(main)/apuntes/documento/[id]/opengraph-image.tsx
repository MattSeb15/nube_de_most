import { generateOGImage, ogSize } from '@/lib/og-generator';
import { getDocumentBySlugOrId } from '@/lib/academic';

export const runtime = 'edge';
export const alt = 'Apunte | La Nube de Most';
export const size = ogSize;
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const file = await getDocumentBySlugOrId(id);

  if (!file) {
    return generateOGImage({
      title: 'Documento no encontrado',
      type: 'default',
    });
  }

  const materiaName = file.carpetas_apuntes?.materias?.nombre;
  const isNotebook = file.nombre.toLowerCase().includes('cuaderno');
  const type = isNotebook ? 'cuaderno' : 'pdf';

  return generateOGImage({
    title: file.nombre,
    subtitle: materiaName ? `Materia: ${materiaName}` : 'Apunte en La Nube de Most',
    type,
  });
}
