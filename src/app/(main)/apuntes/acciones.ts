"use server";

import { createClient } from "@/utils/supabase/server";

export async function toggleLikeDislike(archivoId: string, tipo: 'like' | 'dislike') {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "No autorizado" };
  }

  // Comprobar si ya existe una interacción
  const { data: existingInteraction } = await supabase
    .from("interacciones_apuntes")
    .select("id, tipo")
    .eq("archivo_id", archivoId)
    .eq("usuario_id", user.id)
    .single();

  if (existingInteraction) {
    if (existingInteraction.tipo === tipo) {
      // Si hace clic en el mismo, eliminarlo (neutro)
      const { error } = await supabase
        .from("interacciones_apuntes")
        .delete()
        .eq("id", existingInteraction.id);
      
      if (error) return { error: error.message };
      return { success: true, action: "removed", tipo: null };
    } else {
      // Si hace clic en el otro, actualizar
      const { error } = await supabase
        .from("interacciones_apuntes")
        .update({ tipo })
        .eq("id", existingInteraction.id);
      
      if (error) return { error: error.message };
      return { success: true, action: "updated", tipo };
    }
  } else {
    // Si no existe, crear
    const { error } = await supabase
      .from("interacciones_apuntes")
      .insert({ archivo_id: archivoId, usuario_id: user.id, tipo });
    
    if (error) return { error: error.message };
    return { success: true, action: "inserted", tipo };
  }
}

export async function toggleSave(archivoId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "No autorizado" };
  }

  // Comprobar si ya está guardado
  const { data: existingSave } = await supabase
    .from("apuntes_guardados")
    .select("id")
    .eq("archivo_id", archivoId)
    .eq("usuario_id", user.id)
    .single();

  if (existingSave) {
    // Eliminar si ya está guardado
    const { error } = await supabase
      .from("apuntes_guardados")
      .delete()
      .eq("id", existingSave.id);
      
    if (error) return { error: error.message };
    return { success: true, isSaved: false };
  } else {
    // Guardar
    const { error } = await supabase
      .from("apuntes_guardados")
      .insert({ archivo_id: archivoId, usuario_id: user.id });
      
    if (error) return { error: error.message };
    return { success: true, isSaved: true };
  }
}
