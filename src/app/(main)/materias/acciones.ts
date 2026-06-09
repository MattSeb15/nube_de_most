"use server";

import { createClient } from "@/utils/supabase/server";

export async function getMateriaInteraction(materiaId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Get total likes and dislikes
  const { data: interacciones } = await supabase
    .from("interacciones_materias")
    .select("tipo, usuario_id")
    .eq("materia_id", materiaId);

  let likes = 0;
  let dislikes = 0;
  let userInteraction: 'like' | 'dislike' | null = null;

  if (interacciones) {
    for (const inter of interacciones) {
      if (inter.tipo === 'like') likes++;
      if (inter.tipo === 'dislike') dislikes++;
      if (user && inter.usuario_id === user.id) {
        userInteraction = inter.tipo as 'like' | 'dislike';
      }
    }
  }

  let isSaved = false;
  if (user) {
    const { data: savedData } = await supabase
      .from("materias_guardadas")
      .select("id")
      .eq("materia_id", materiaId)
      .eq("usuario_id", user.id)
      .single();
    
    if (savedData) isSaved = true;
  }

  return { likes, dislikes, userInteraction, isSaved, userId: user?.id };
}

export async function toggleLikeDislikeMateria(materiaId: string, tipo: 'like' | 'dislike') {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "No autorizado" };
  }

  const { data: existingInteraction } = await supabase
    .from("interacciones_materias")
    .select("id, tipo")
    .eq("materia_id", materiaId)
    .eq("usuario_id", user.id)
    .single();

  if (existingInteraction) {
    if (existingInteraction.tipo === tipo) {
      const { error } = await supabase
        .from("interacciones_materias")
        .delete()
        .eq("id", existingInteraction.id);
      if (error) return { error: error.message };
      return { success: true, action: "removed", tipo: null };
    } else {
      const { error } = await supabase
        .from("interacciones_materias")
        .update({ tipo })
        .eq("id", existingInteraction.id);
      if (error) return { error: error.message };
      return { success: true, action: "updated", tipo };
    }
  } else {
    const { error } = await supabase
      .from("interacciones_materias")
      .insert({ materia_id: materiaId, usuario_id: user.id, tipo });
    if (error) return { error: error.message };
    return { success: true, action: "inserted", tipo };
  }
}

export async function toggleSaveMateria(materiaId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "No autorizado" };
  }

  const { data: existingSave } = await supabase
    .from("materias_guardadas")
    .select("id")
    .eq("materia_id", materiaId)
    .eq("usuario_id", user.id)
    .single();

  if (existingSave) {
    const { error } = await supabase
      .from("materias_guardadas")
      .delete()
      .eq("id", existingSave.id);
    if (error) return { error: error.message };
    return { success: true, isSaved: false };
  } else {
    const { error } = await supabase
      .from("materias_guardadas")
      .insert({ materia_id: materiaId, usuario_id: user.id });
    if (error) return { error: error.message };
    return { success: true, isSaved: true };
  }
}
