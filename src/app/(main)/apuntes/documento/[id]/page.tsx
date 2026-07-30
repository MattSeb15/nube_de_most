import { Metadata, ResolvingMetadata } from "next";
import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import DocumentViewClient from "./DocumentViewClient";
import { TrackVisit } from "@/components/ui/TrackVisit";
import { getDocumentBySlugOrId } from "@/lib/academic";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ params, searchParams }: PageProps, parent: ResolvingMetadata): Promise<Metadata> {
  const { id } = await params;
  const searchParamsObj = await searchParams;
  const page = searchParamsObj.page;
  const file = await getDocumentBySlugOrId(id);

  if (!file) {
    return {
      title: "Documento no encontrado",
    };
  }

  const materiaName = file.carpetas_apuntes?.materias?.nombre;
  
  // Calculate page count
  const visiblePages = file.paginas_cuaderno?.filter((p: any) => !p.oculta) || [];
  const numPages = visiblePages.length > 0 ? visiblePages.length : (file.paginas_cuaderno?.length || 0);
  const paginasInfo = numPages > 0 ? `${numPages} ${numPages === 1 ? 'página' : 'páginas'}` : '';

  let title = file.nombre;
  if (paginasInfo) {
    title = `${file.nombre} (${paginasInfo})`;
  }
  let description = `${file.nombre}${paginasInfo ? ` (${paginasInfo})` : ''}${materiaName ? ` — ${materiaName}` : ''} | Apunte en La Nube de Most`;
  let url = `/apuntes/documento/${file.slug || file.id}`;

  if (page && typeof page === 'string') {
    title = `${file.nombre} - Página ${page}${numPages > 0 ? ` de ${numPages}` : ''}`;
    description = `Página ${page}${numPages > 0 ? ` de ${numPages}` : ''} de ${file.nombre}${materiaName ? ` — ${materiaName}` : ''} | Apunte en La Nube de Most`;
    url = `${url}?page=${page}`;
  }

  // Determine OpenGraph image
  const firstPageImg = visiblePages[0]?.url_imagen || file.paginas_cuaderno?.[0]?.url_imagen;
  let ogImage = "/open_graphs/notebook.png";

  if (file.tipo === "pdf") {
    ogImage = firstPageImg || "/open_graphs/pdf.png";
  } else {
    ogImage = firstPageImg || "/open_graphs/notebook.png";
  }

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "article",
      images: [
        {
          url: ogImage,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default async function DocumentoPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  
  let currentUser = null;
  if (user) {
    const { data: profile } = await supabase
      .from("perfiles")
      .select("*")
      .eq("id", user.id)
      .single();
    currentUser = profile;
  }

  // Fetch the file and its related data using the helper
  const file = await getDocumentBySlugOrId(id);

  if (!file) {
    notFound();
  }

  // Obtener interacciones
  const { data: interacciones } = await supabase
    .from("interacciones_apuntes")
    .select("tipo, usuario_id")
    .eq("archivo_id", file.id);

  const likes = interacciones?.filter((i: any) => i.tipo === 'like').length || 0;
  const dislikes = interacciones?.filter((i: any) => i.tipo === 'dislike').length || 0;
  
  let currentInteraction = null;
  let isSaved = false;

  if (user) {
    const userInteraction = interacciones?.find((i: any) => i.usuario_id === user.id);
    if (userInteraction) {
      currentInteraction = userInteraction.tipo;
    }

    const { data: save } = await supabase
      .from("apuntes_guardados")
      .select("id")
      .eq("archivo_id", file.id)
      .eq("usuario_id", user.id)
      .single();

    if (save) {
      isSaved = true;
    }
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": file.nombre,
    "description": `${file.nombre}${file.carpetas_apuntes?.materias?.nombre ? ` — ${file.carpetas_apuntes.materias.nombre}` : ''}`,
    "url": `https://www.mostcloud.space/apuntes/documento/${file.slug || file.id}`,
    "datePublished": file.fecha_subida,
    "author": {
      "@type": "Person",
      "name": file.perfiles?.nombre_completo || "Usuario anónimo",
      "url": file.perfiles ? `https://www.mostcloud.space/perfil/${file.perfiles.apodo || file.creador_id}` : undefined
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <TrackVisit entidadId={file.id} tipoEntidad="apunte" />
      <DocumentViewClient 
        file={file} 
        currentUser={currentUser} 
        initialLikes={likes}
        initialDislikes={dislikes}
        initialInteraction={currentInteraction}
        initialIsSaved={isSaved}
      />
    </>
  );
}
