"use server";

import { createClient } from "@/utils/supabase/server";

export async function getSearchIndexData() {
  const supabase = await createClient();
  const [actividadesRes, materiasRes, apuntesRes] = await Promise.all([
    supabase.from("actividades").select("*"),
    supabase.from("materias").select("*, semestres(slug)"),
    supabase.from("archivos_apuntes").select("*, carpetas_apuntes(materia_id), perfiles!creador_id(id, nombre_completo, apodo, rol)"),
  ]);

  return {
    actividades: actividadesRes.data || [],
    materias: materiasRes.data || [],
    apuntes: apuntesRes.data || [],
  };
}
