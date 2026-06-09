import { createClient } from "@/utils/supabase/server";
import { notFound } from "next/navigation";
import DocumentViewClient from "./DocumentViewClient";
import { TrackVisit } from "@/components/ui/TrackVisit";

export default async function DocumentoPage({ params }: { params: Promise<{ id: string }> }) {
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

  // Fetch the file and its related data
  const { data: file, error } = await supabase
    .from("archivos_apuntes")
    .select(`
      *,
      perfiles!creador_id(nombre_completo, avatar_url, rol, apodo),
      carpetas_apuntes(id, materia_id, materias(id, nombre, semestre_id, codigo, slug, semestres(slug)))
    `)
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching file:", error);
  }

  if (!file) {
    notFound();
  }

  // Obtener interacciones
  const { data: interacciones } = await supabase
    .from("interacciones_apuntes")
    .select("tipo, usuario_id")
    .eq("archivo_id", id);

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
      .eq("archivo_id", id)
      .eq("usuario_id", user.id)
      .single();

    if (save) {
      isSaved = true;
    }
  }

  return (
    <>
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
