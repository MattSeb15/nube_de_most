import { Metadata } from "next";
import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import DocumentViewClient from "./DocumentViewClient";
import { TrackVisit } from "@/components/ui/TrackVisit";
import { getDocumentBySlugOrId } from "@/lib/academic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const file = await getDocumentBySlugOrId(id);

  if (!file) {
    return {
      title: "Documento no encontrado",
    };
  }

  const materiaName = file.carpetas_apuntes?.materias?.nombre;
  const title = file.nombre;
  const description = `${file.nombre}${materiaName ? ` — ${materiaName}` : ''} | Apunte en La Nube de Most`;
  const url = `/apuntes/documento/${file.slug || file.id}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function DocumentoPage({ params }: PageProps) {
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
