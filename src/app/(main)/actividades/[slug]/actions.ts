"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function addComentarioAction(formData: FormData) {
  const actividadId = formData.get("actividadId") as string;
  const slug = formData.get("slug") as string;
  const contenido = formData.get("contenido") as string;
  const parentId = formData.get("parentId") as string | null;

  if (!actividadId || !slug || !contenido || contenido.trim() === "") {
    return { error: "El contenido del comentario no puede estar vacío." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Debes iniciar sesión para comentar." };
  }

  // Double check email domain and verification status
  const email = user.email || "";
  const isUtaEmail = email.endsWith("@uta.edu.ec");
  const isEmailVerified = user.email_confirmed_at !== undefined && user.email_confirmed_at !== null;

  if (!isUtaEmail || !isEmailVerified) {
    return { error: "Solo los estudiantes de la UTA con correo verificado pueden dejar comentarios." };
  }

  // Formatting author name
  let autor = "Estudiante UTA";
  if (email === "most@uta.edu.ec") {
    autor = "Most";
  } else if (user.user_metadata?.nombre_completo) {
    autor = user.user_metadata.nombre_completo;
  } else if (user.user_metadata?.full_name) {
    autor = user.user_metadata.full_name;
  } else {
    // Generate from email prefix (e.g. mateo.oviedo@uta.edu.ec -> Mateo Oviedo)
    const prefix = email.split("@")[0];
    autor = prefix
      .split(".")
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join(" ");
  }

  const { error } = await supabase.from("comentarios").insert({
    actividad_id: actividadId,
    parent_id: parentId || null,
    autor,
    contenido: contenido.trim(),
    fecha: new Date().toISOString(),
  });

  if (error) {
    console.error("Error inserting comment:", error.message);
    return { error: "No se pudo publicar el comentario. Inténtalo de nuevo." };
  }

  revalidatePath(`/actividades/${slug}`);
  return { success: true };
}
