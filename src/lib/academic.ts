import { createClient } from "@/utils/supabase/server";
import { Semestre, Materia, Apunte, Actividad, Comentario, PerfilUsuario, Profesor, VisibilidadArchivo, Malla, MallaMateria, TipoMateria, Carrera } from "@/types";
import { formatPeriodo } from "@/lib/utils";

// Helper to get total apuntes (archivos) count for multiple materias
async function getApuntesCounts(supabase: any, materiaIds: string[]): Promise<Record<string, number>> {
  if (!materiaIds.length) return {};
  const { data: carpetas } = await supabase
    .from("carpetas_apuntes")
    .select("materia_id, archivos_apuntes(count)")
    .in("materia_id", materiaIds);

  const counts: Record<string, number> = {};
  if (carpetas) {
    for (const c of carpetas) {
      if (!counts[c.materia_id]) counts[c.materia_id] = 0;
      counts[c.materia_id] += c.archivos_apuntes?.[0]?.count || 0;
    }
  }
  return counts;
}

// Get all semestres
export async function getSemestres(): Promise<Semestre[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("semestres")
    .select("*, materias(id, nombre, color)")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching semestres:", error.message);
    return [];
  }
  
  return data.map((s: any) => ({
    id: s.id,
    nombre: s.nombre,
    slug: s.slug,
    periodo: formatPeriodo(s.fecha_inicio, s.fecha_fin),
    activo: s.activo,
    materias: s.materias?.length || 0,
    materiasList: s.materias || [],
  }));
}

// Get semestre by slug
export async function getSemestreBySlug(slug: string): Promise<Semestre | undefined> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("semestres")
    .select("*, materias(id, nombre, color)")
    .eq("slug", slug)
    .single();

  if (error) return undefined;
  return {
    id: data.id,
    nombre: data.nombre,
    slug: data.slug,
    periodo: formatPeriodo(data.fecha_inicio, data.fecha_fin),
    activo: data.activo,
    materias: data.materias?.length || 0,
    materiasList: data.materias || [],
  };
}

// Get all materias
export async function getAllMaterias(): Promise<(Materia & { semestreSlug?: string })[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("materias")
    .select("*, profesores(nombre), semestres(slug, nombre)")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching all materias:", error.message);
    return [];
  }

  const materiaIds = data.map((m: any) => m.id);
  const counts = await getApuntesCounts(supabase, materiaIds);

  return data.map((m: any) => ({
    id: m.id,
    nombre: m.nombre,
    slug: m.slug,
    semestreId: m.semestre_id,
    codigo: m.codigo,
    color: m.color,
    icono: m.icono,
    apuntesCount: counts[m.id] || 0,
    vistasCount: m.vistas || 0,
    descripcion: m.descripcion,
    profesorId: m.profesor_id,
    profesorNombre: m.profesores?.nombre,
    semestreSlug: m.semestres?.slug,
    semestreNombre: m.semestres?.nombre,
  }));
}

// Get materias by semestre
export async function getMateriasBySemestre(semestreId: string): Promise<Materia[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("materias")
    .select("*, profesores(nombre)")
    .eq("semestre_id", semestreId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching materias:", error.message);
    return [];
  }

  const materiaIds = data.map((m: any) => m.id);
  const counts = await getApuntesCounts(supabase, materiaIds);

  return data.map((m: any) => ({
    id: m.id,
    nombre: m.nombre,
    slug: m.slug,
    semestreId: m.semestre_id,
    codigo: m.codigo,
    color: m.color,
    icono: m.icono,
    apuntesCount: counts[m.id] || 0,
    vistasCount: m.vistas || 0,
    descripcion: m.descripcion,
    profesorId: m.profesor_id,
    profesorNombre: m.profesores?.nombre,
  }));
}

// Get materia by slug
export async function getMateriaBySlug(slug: string): Promise<Materia | undefined> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("materias")
    .select("*, profesores(nombre)")
    .eq("slug", slug)
    .single();

  if (error) {
    console.error("Error fetching materia by slug:", error.message);
    return undefined;
  }
  const counts = await getApuntesCounts(supabase, [data.id]);

  return {
    id: data.id,
    nombre: data.nombre,
    slug: data.slug,
    semestreId: data.semestre_id,
    codigo: data.codigo,
    color: data.color,
    icono: data.icono,
    apuntesCount: counts[data.id] || 0,
    vistasCount: data.vistas || 0,
    descripcion: data.descripcion,
    profesorId: data.profesor_id,
    profesorNombre: data.profesores?.nombre,
  };
}

// Get materia by ID
export async function getMateriaById(id: string): Promise<Materia | undefined> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("materias")
    .select("*, profesores(nombre)")
    .eq("id", id)
    .single();

  if (error) return undefined;
  const counts = await getApuntesCounts(supabase, [data.id]);

  return {
    id: data.id,
    nombre: data.nombre,
    slug: data.slug,
    semestreId: data.semestre_id,
    codigo: data.codigo,
    color: data.color,
    icono: data.icono,
    apuntesCount: counts[data.id] || 0,
    vistasCount: data.vistas || 0,
    descripcion: data.descripcion,
    profesorId: data.profesor_id,
    profesorNombre: data.profesores?.nombre,
  };
}


// Get document by slug or ID
export async function getDocumentBySlugOrId(slugOrId: string): Promise<any> {
  const supabase = await createClient();
  
  // Attempt to match by UUID first
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slugOrId);
  
  let query = supabase
    .from("archivos_apuntes")
    .select(`
      *,
      perfiles!creador_id(nombre_completo, avatar_url, rol, apodo),
      carpetas_apuntes(id, materia_id, materias(id, nombre, semestre_id, codigo, slug, semestres(slug)))
    `);

  if (isUUID) {
    query = query.eq("id", slugOrId);
  } else {
    query = query.eq("slug", slugOrId);
  }

  const { data, error } = await query.single();

  if (error || !data) {
    // If not found by ID and it was a UUID, maybe it's actually a slug that looks like a UUID? 
    // Very unlikely, but we can fallback if needed.
    // For now, if error, try finding by slug just in case.
    if (isUUID) {
      const { data: fallbackData, error: fallbackError } = await supabase
        .from("archivos_apuntes")
        .select(`
          *,
          perfiles!creador_id(nombre_completo, avatar_url, rol, apodo),
          carpetas_apuntes(id, materia_id, materias(id, nombre, semestre_id, codigo, slug, semestres(slug)))
        `)
        .eq("slug", slugOrId)
        .single();
        
      if (!fallbackError && fallbackData) return fallbackData;
    }
    return null;
  }

  return data;
}

// Get all document slugs for sitemap
export async function getAllDocumentSlugs(): Promise<{ slug: string; id: string; updated_at: string }[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("archivos_apuntes")
    .select("slug, id, fecha_subida")
    .not("slug", "is", null);

  if (error) {
    console.error("Error fetching document slugs:", error.message);
    return [];
  }
  return data.map((doc: any) => ({
    slug: doc.slug,
    id: doc.id,
    updated_at: doc.fecha_subida,
  }));
}

// Get latest archivos across all subjects
export async function getLatestArchivos(limit: number = 4): Promise<any[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("archivos_apuntes")
    .select("*, carpetas_apuntes(materia_id), perfiles!creador_id(id, nombre_completo, apodo, rol)")
    .order("fecha_subida", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching latest archivos:", error.message);
    return [];
  }
  return data.map((a: any) => ({
    id: a.id,
    slug: a.slug,
    nombre: a.nombre,
    tipo: a.tipo,
    materiaId: a.carpetas_apuntes?.materia_id,
    fechaSubida: a.fecha_subida,
    urlArchivo: a.url_archivo,
    creador: a.perfiles ? (a.perfiles.apodo || a.perfiles.nombre_completo) : "Anónimo",
    creadorId: a.perfiles?.id || a.creador_id,
    creadorApodo: a.perfiles?.apodo || null,
    creadorRol: a.perfiles?.rol || "usuario",
    vistasCount: a.vistas || 0,
  }));
}

// Get latest updated materias based on archivos_apuntes
export async function getMateriasActualizadasRecientemente(limit: number = 3): Promise<(Materia & { semestreSlug?: string })[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("archivos_apuntes")
    .select("carpetas_apuntes(materia_id)")
    .order("fecha_subida", { ascending: false })
    .limit(limit * 5);

  if (error) {
    console.error("Error fetching latest archivos for materias:", error.message);
    return [];
  }

  const uniqueMateriaIds: string[] = [];
  for (const row of data as any[]) {
    const materiaId = row.carpetas_apuntes?.materia_id || (Array.isArray(row.carpetas_apuntes) && row.carpetas_apuntes[0]?.materia_id);
    if (materiaId && !uniqueMateriaIds.includes(materiaId)) {
      uniqueMateriaIds.push(materiaId);
      if (uniqueMateriaIds.length === limit) break;
    }
  }

  if (uniqueMateriaIds.length === 0) return [];

  // Fetch materias data with semestre slug
  const { data: materiasData, error: materiasError } = await supabase
    .from("materias")
    .select("*, profesores(nombre), semestres(slug)")
    .in("id", uniqueMateriaIds);
    
  if (materiasError) return [];

  const counts = await getApuntesCounts(supabase, uniqueMateriaIds);

  // Return them in the correct order based on latest files
  const mappedMaterias = uniqueMateriaIds.map(id => {
    const m = materiasData.find((md: any) => md.id === id);
    if (!m) return null;
    return {
      id: m.id,
      nombre: m.nombre,
      slug: m.slug,
      semestreId: m.semestre_id,
      codigo: m.codigo,
      color: m.color,
      icono: m.icono,
      apuntesCount: counts[m.id] || 0,
      vistasCount: m.vistas || 0,
      descripcion: m.descripcion,
      profesorId: m.profesor_id,
      profesorNombre: m.profesores?.nombre,
      semestreSlug: m.semestres?.slug,
    };
  }).filter(Boolean) as (Materia & { semestreSlug?: string })[];

  return mappedMaterias;
}

// Get all activities
export async function getActividades(): Promise<Actividad[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("actividades")
    .select("*, comentarios(count)")
    .order("fecha_entrega", { ascending: true });

  if (error) {
    console.error("Error fetching activities:", error.message);
    return [];
  }

  return data.map((act: any) => ({
    id: act.id,
    nombre: act.nombre,
    slug: act.slug,
    materiaId: act.materia_id,
    descripcionOficial: act.descripcion_oficial,
    tipsMost: act.tips_most,
    estado: act.estado,
    fechaInicio: act.fecha_inicio,
    fechaEntrega: act.fecha_entrega,
    archivos: [],
    comentariosCount: act.comentarios?.[0]?.count || 0,
    visibilidadArchivo: (act.visibilidad_archivo || 'completa') as VisibilidadArchivo,
    fechaDesbloqueoVisibilidad: act.fecha_desbloqueo_visibilidad,
    archivoResolucionUrl: act.archivo_resolucion_url,
    archivoResolucionNombre: act.archivo_resolucion_nombre,
    destinoSemestreId: act.destino_semestre_id,
    destinoMateriaId: act.destino_materia_id,
    destinoCarpetaId: act.destino_carpeta_id,
    destinoNuevaCarpeta: act.destino_nueva_carpeta,
    colaborativa: act.colaborativa ?? true,
    transferida: act.transferida ?? false,
  }));
}

// Get activity by slug
export async function getActividadBySlug(slug: string): Promise<Actividad | undefined> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("actividades")
    .select("*, comentarios(count)")
    .eq("slug", slug)
    .single();

  if (error) return undefined;
  return {
    id: data.id,
    nombre: data.nombre,
    slug: data.slug,
    materiaId: data.materia_id,
    descripcionOficial: data.descripcion_oficial,
    tipsMost: data.tips_most,
    estado: data.estado,
    fechaInicio: data.fecha_inicio,
    fechaEntrega: data.fecha_entrega,
    archivos: [],
    comentariosCount: data.comentarios?.[0]?.count || 0,
    visibilidadArchivo: (data.visibilidad_archivo || 'completa') as VisibilidadArchivo,
    fechaDesbloqueoVisibilidad: data.fecha_desbloqueo_visibilidad,
    archivoResolucionUrl: data.archivo_resolucion_url,
    archivoResolucionNombre: data.archivo_resolucion_nombre,
    destinoSemestreId: data.destino_semestre_id,
    destinoMateriaId: data.destino_materia_id,
    destinoCarpetaId: data.destino_carpeta_id,
    destinoNuevaCarpeta: data.destino_nueva_carpeta,
    colaborativa: data.colaborativa ?? true,
    transferida: data.transferida ?? false,
  };
}

// Get comments for an activity
export async function getComentariosByActividad(actividadId: string): Promise<Comentario[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("comentarios")
    .select("*")
    .eq("actividad_id", actividadId)
    .order("fecha", { ascending: true });

  if (error) return [];
  return data.map((c) => ({
    id: c.id,
    actividadId: c.actividad_id,
    parentId: c.parent_id,
    autor: c.autor,
    contenido: c.contenido,
    fecha: c.fecha,
  }));
}

// Get Most's profile details
export async function getPerfilMost(): Promise<PerfilUsuario> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("perfiles")
    .select("*")
    .eq("rol", "admin")
    .single();

  if (error) {
    return {
      nombreCompleto: "Mateo Sebastian Oviedo Trujillo",
      apodo: "Most",
      rol: "Estudiante de Ingeniería · UTA",
      bio: "Estudiante de nivelación en la Universidad Técnica de Ambato (UTA).",
      redes: [],
    };
  }

  return {
    nombreCompleto: data.nombre_completo,
    apodo: data.apodo,
    rol: data.rol,
    bio: data.bio,
    redes: data.redes || [],
    avatar_url: data.avatar_url,
  };
}

// Get site-wide statistics computed on-the-fly
export async function getEstadisticas(): Promise<any> {
  const supabase = await createClient();
  
  const [apuntesRes, materiasRes, actividadesRes, usuariosRes, vistasMateriasRes, vistasArchivosRes] = await Promise.all([
    supabase.from("archivos_apuntes").select("id", { count: "exact", head: true }),
    supabase.from("materias").select("id", { count: "exact", head: true }),
    supabase.from("actividades").select("id", { count: "exact", head: true }),
    supabase.from("perfiles").select("id", { count: "exact", head: true }),
    supabase.from("materias").select("vistas"),
    supabase.from("archivos_apuntes").select("vistas"),
  ]);

  const totalApuntes = apuntesRes.count || 0;
  const totalMaterias = materiasRes.count || 0;
  const totalActividades = actividadesRes.count || 0;
  const totalUsuarios = usuariosRes.count || 0;
  
  let totalVistas = 0;
  if (vistasMateriasRes.data) {
    totalVistas += vistasMateriasRes.data.reduce((sum: number, row: any) => sum + (row.vistas || 0), 0);
  }
  if (vistasArchivosRes.data) {
    totalVistas += vistasArchivosRes.data.reduce((sum: number, row: any) => sum + (row.vistas || 0), 0);
  }

  return {
    totalApuntes,
    totalMaterias,
    totalActividades,
    totalUsuarios,
    totalVistas,
    totalColaboradores: 0,
  };
}

// ── PROFESORES CRUD ──

export async function getProfesores(): Promise<Profesor[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profesores")
    .select("*")
    .order("nombre", { ascending: true });

  if (error) {
    console.error("Error fetching profesores:", error.message);
    return [];
  }
  return data.map((p: any) => ({
    id: p.id,
    nombre: p.nombre,
  }));
}

export async function getProfesorById(id: string): Promise<Profesor | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profesores")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;
  return { id: data.id, nombre: data.nombre };
}

export async function getMateriasByProfesor(profesorId: string): Promise<Materia[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("materias")
    .select("*, semestres(slug)")
    .eq("profesor_id", profesorId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching materias by profesor:", error.message);
    return [];
  }

  const materiaIds = data.map((m: any) => m.id);
  const counts = await getApuntesCounts(supabase, materiaIds);

  return data.map((m: any) => ({
    id: m.id,
    nombre: m.nombre,
    slug: m.slug,
    semestreId: m.semestre_id,
    codigo: m.codigo,
    color: m.color,
    icono: m.icono,
    apuntesCount: counts[m.id] || 0,
    vistasCount: m.vistas || 0,
    descripcion: m.descripcion,
    profesorId: m.profesor_id,
    semestreSlug: m.semestres?.slug,
  }));
}

export async function createProfesor(profesor: Partial<Profesor>): Promise<Profesor | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profesores")
    .insert([{ nombre: profesor.nombre }])
    .select()
    .single();

  if (error) {
    console.error("Error creating profesor:", error.message);
    return null;
  }
  return { id: data.id, nombre: data.nombre };
}

export async function updateProfesor(id: string, updates: Partial<Profesor>): Promise<boolean> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("profesores")
    .update({ nombre: updates.nombre })
    .eq("id", id);
  return !error;
}

export async function deleteProfesor(id: string): Promise<boolean> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("profesores")
    .delete()
    .eq("id", id);
  return !error;
}

// ── PERFILES PÚBLICOS Y APORTES ──

export async function getPerfilByUsername(username: string): Promise<(PerfilUsuario & { id: string }) | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("perfiles")
    .select("*")
    .eq("apodo", username)
    .single();

  console.log("getPerfilByUsername debug -> username:", username, "| error:", error?.message, "| found data:", !!data);

  if (error || !data) {
    return null;
  }

  return {
    id: data.id,
    nombreCompleto: data.nombre_completo,
    apodo: data.apodo,
    rol: data.rol,
    bio: data.bio,
    redes: data.redes || [],
    avatar_url: data.avatar_url,
  };
}

export async function getPerfilById(id: string): Promise<(PerfilUsuario & { id: string }) | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("perfiles")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    return null;
  }

  return {
    id: data.id,
    nombreCompleto: data.nombre_completo,
    apodo: data.apodo,
    rol: data.rol,
    bio: data.bio,
    redes: data.redes || [],
    avatar_url: data.avatar_url,
  };
}

export async function getArchivosByCreador(creadorId: string): Promise<any[]> {
  const supabase = await createClient();
  
  // 1. Get files directly created by the user
  const { data: archivosPropios, error: errorPropios } = await supabase
    .from("archivos_apuntes")
    .select("*, slug, carpetas_apuntes(materia_id), perfiles!creador_id(id, nombre_completo, apodo, rol)")
    .eq("creador_id", creadorId);

  if (errorPropios) {
    console.error("Error fetching archivos propios:", errorPropios.message);
  }

  // 2. Get pages created by the user in any cuaderno
  const { data: paginasAportadas, error: errorPaginas } = await supabase
    .from("paginas_cuaderno")
    .select("cuaderno_id")
    .eq("creador_id", creadorId);

  let archivosColaborativos: any[] = [];

  if (paginasAportadas && paginasAportadas.length > 0) {
    // Unique cuaderno IDs
    const cuadernoIds = [...new Set(paginasAportadas.map(p => p.cuaderno_id))];
    
    // Filter out cuadernos that the user already created (they are already in archivosPropios)
    const uniqueCuadernoIds = cuadernoIds.filter(id => !archivosPropios?.find(a => a.id === id));
    
    if (uniqueCuadernoIds.length > 0) {
      const { data: dataColab, error: errorColab } = await supabase
        .from("archivos_apuntes")
        .select("*, slug, carpetas_apuntes(materia_id), perfiles!creador_id(id, nombre_completo, apodo, rol)")
        .in("id", uniqueCuadernoIds);
        
      if (dataColab) {
        // Tag them as collaborative so we can identify them in the UI if needed
        archivosColaborativos = dataColab.map(a => ({ ...a, esColaboracion: true }));
      }
    }
  }

  // Merge both lists
  const allData = [...(archivosPropios || []), ...archivosColaborativos];
  
  // Sort by date descending
  allData.sort((a, b) => new Date(b.fecha_subida).getTime() - new Date(a.fecha_subida).getTime());

  return allData.map((a: any) => ({
    id: a.id,
    slug: a.slug,
    nombre: a.nombre,
    tipo: a.tipo,
    materiaId: a.carpetas_apuntes?.materia_id || (Array.isArray(a.carpetas_apuntes) ? a.carpetas_apuntes[0]?.materia_id : null),
    fechaSubida: a.fecha_subida,
    urlArchivo: a.url_archivo,
    creador: a.perfiles ? (a.perfiles.apodo || a.perfiles.nombre_completo) : "Anónimo",
    creadorId: a.perfiles?.id || a.creador_id,
    creadorApodo: a.perfiles?.apodo || null,
    creadorRol: a.perfiles?.rol || "usuario",
    esColaboracion: a.esColaboracion || false,
    vistasCount: a.vistas || 0,
  }));
}

export async function getLatestUsers(limit: number = 10): Promise<any[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("perfiles")
    .select("id, nombre_completo, apodo, avatar_url")
    .not("apodo", "is", null)
    .order("updated_at", { ascending: false, nullsFirst: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching latest users:", error.message);
    return [];
  }
  return data;
}

export async function getAllUsernames(): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("perfiles")
    .select("apodo")
    .not("apodo", "is", null);

  if (error) {
    console.error("Error fetching usernames:", error.message);
    return [];
  }
  return data.map((u: any) => u.apodo);
}

// ── ROADMAP FEATURES ──

export async function getRoadmapFeatures(): Promise<{ id: string; titulo: string; completada: boolean; created_at: string }[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("roadmap_features")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching roadmap features:", error.message);
    return [];
  }
  return data;
}

// Get all profesores for sitemap
export async function getAllProfesores(): Promise<{ id: string }[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("profesores").select("id");
  if (error) return [];
  return data || [];
}

// ── MALLA CURRICULAR ──

// Helper to map raw DB malla_materias rows to MallaMateria[]
function mapMallaMateria(row: any): MallaMateria {
  return {
    id: row.id,
    mallaId: row.malla_id,
    materiaId: row.materia_id,
    semester: row.semester,
    mapColumn: row.map_column,
    tipoMateria: row.tipo_materia as TipoMateria,
    prerequisites: row.prerequisites || [],
    corequisites: row.corequisites || [],
    materia: row.materias ? {
      id: row.materias.id,
      nombre: row.materias.nombre,
      slug: row.materias.slug,
      semestreId: row.materias.semestre_id,
      codigo: row.materias.codigo,
      color: row.materias.color,
      icono: row.materias.icono,
      apuntesCount: 0,
      vistasCount: row.materias.vistas || 0,
      descripcion: row.materias.descripcion,
      profesorId: row.materias.profesor_id,
      profesorNombre: row.materias.profesores?.nombre,
    } : undefined,
  };
}

// Get all carreras
export async function getCarreras(): Promise<Carrera[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("carreras")
    .select("*")
    .order("nombre", { ascending: true });

  if (error) {
    console.error("Error fetching carreras:", error.message);
    return [];
  }

  return data.map((c: any) => ({
    id: c.id,
    nombre: c.nombre,
    slug: c.slug,
    color: c.color,
    icono: c.icono,
    descripcion: c.descripcion,
    createdAt: c.created_at,
  }));
}

// Get the active malla with all its materias (enriched)
export async function getActiveMalla(carreraSlug: string): Promise<{ malla: Malla; materias: MallaMateria[] } | null> {
  const supabase = await createClient();

  // Find the active malla for the given carrera
  const { data: carreraData } = await supabase.from("carreras").select("id").eq("slug", carreraSlug).single();
  if (!carreraData) return null;

  const { data: mallaData, error: mallaError } = await supabase
    .from("mallas")
    .select("*")
    .eq("activo", true)
    .eq("carrera_id", carreraData.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (mallaError || !mallaData) return null;

  // Get malla_materias with materia data joined
  const { data: mmData, error: mmError } = await supabase
    .from("malla_materias")
    .select("*, materias(*, profesores(nombre))")
    .eq("malla_id", mallaData.id)
    .order("semester", { ascending: true });

  if (mmError) return null;

  // Get apuntes counts for all materias in this malla
  const materiaIds = (mmData || []).map((mm: any) => mm.materia_id);
  const counts = await getApuntesCounts(supabase, materiaIds);

  const materias: MallaMateria[] = (mmData || []).map((row: any) => {
    const mm = mapMallaMateria(row);
    if (mm.materia) {
      mm.materia.apuntesCount = counts[mm.materiaId] || 0;
    }
    return mm;
  });

  return {
    malla: {
      id: mallaData.id,
      carreraId: mallaData.carrera_id,
      nombre: mallaData.nombre,
      slug: mallaData.slug,
      descripcion: mallaData.descripcion,
      pensum: mallaData.pensum,
      activo: mallaData.activo,
      metadata: mallaData.metadata,
      createdAt: mallaData.created_at,
      updatedAt: mallaData.updated_at,
      materiasCount: materias.length,
    },
    materias,
  };
}

// Get a malla by ID
export async function getMallaById(id: string): Promise<{ malla: Malla; materias: MallaMateria[] } | null> {
  const supabase = await createClient();

  const { data: mallaData, error: mallaError } = await supabase
    .from("mallas")
    .select("*")
    .eq("id", id)
    .single();

  if (mallaError || !mallaData) return null;

  const { data: mmData } = await supabase
    .from("malla_materias")
    .select("*, materias(*, profesores(nombre))")
    .eq("malla_id", id)
    .order("semester", { ascending: true });

  const materiaIds = (mmData || []).map((mm: any) => mm.materia_id);
  const counts = await getApuntesCounts(supabase, materiaIds);

  const materias: MallaMateria[] = (mmData || []).map((row: any) => {
    const mm = mapMallaMateria(row);
    if (mm.materia) mm.materia.apuntesCount = counts[mm.materiaId] || 0;
    return mm;
  });

  return {
    malla: {
      id: mallaData.id,
      carreraId: mallaData.carrera_id,
      nombre: mallaData.nombre,
      slug: mallaData.slug,
      descripcion: mallaData.descripcion,
      pensum: mallaData.pensum,
      activo: mallaData.activo,
      metadata: mallaData.metadata,
      createdAt: mallaData.created_at,
      updatedAt: mallaData.updated_at,
      materiasCount: materias.length,
    },
    materias,
  };
}

// Get a malla by slug
export async function getMallaBySlug(slug: string): Promise<{ malla: Malla; materias: MallaMateria[] } | null> {
  const supabase = await createClient();

  const { data: mallaData, error: mallaError } = await supabase
    .from("mallas")
    .select("*")
    .eq("slug", slug)
    .single();

  if (mallaError || !mallaData) return null;

  const { data: mmData } = await supabase
    .from("malla_materias")
    .select("*, materias(*, profesores(nombre))")
    .eq("malla_id", mallaData.id)
    .order("semester", { ascending: true });

  const materiaIds = (mmData || []).map((mm: any) => mm.materia_id);
  const counts = await getApuntesCounts(supabase, materiaIds);

  const materias: MallaMateria[] = (mmData || []).map((row: any) => {
    const mm = mapMallaMateria(row);
    if (mm.materia) mm.materia.apuntesCount = counts[mm.materiaId] || 0;
    return mm;
  });

  return {
    malla: {
      id: mallaData.id,
      carreraId: mallaData.carrera_id,
      nombre: mallaData.nombre,
      slug: mallaData.slug,
      descripcion: mallaData.descripcion,
      pensum: mallaData.pensum,
      activo: mallaData.activo,
      metadata: mallaData.metadata,
      createdAt: mallaData.created_at,
      updatedAt: mallaData.updated_at,
      materiasCount: materias.length,
    },
    materias,
  };
}

// Get all mallas (for admin listing)
export async function getMallas(): Promise<Malla[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("mallas")
    .select("*, malla_materias(count)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching mallas:", error.message);
    return [];
  }

  return data.map((m: any) => ({
    id: m.id,
    carreraId: m.carrera_id,
    nombre: m.nombre,
    slug: m.slug,
    descripcion: m.descripcion,
    pensum: m.pensum,
    activo: m.activo,
    metadata: m.metadata,
    createdAt: m.created_at,
    updatedAt: m.updated_at,
    materiasCount: m.malla_materias?.[0]?.count || 0,
  }));
}

// Save malla subjects (batch upsert positions and relationships)
export async function saveMallaSubjects(
  mallaId: string,
  subjects: {
    materiaId: string;
    semester: number;
    mapColumn: number;
    tipoMateria: TipoMateria;
    prerequisites: string[];
    corequisites: string[];
  }[]
): Promise<boolean> {
  const supabase = await createClient();

  // Delete existing entries for this malla
  const { error: deleteError } = await supabase
    .from("malla_materias")
    .delete()
    .eq("malla_id", mallaId);

  if (deleteError) {
    console.error("Error deleting old malla_materias:", deleteError.message);
    return false;
  }

  if (subjects.length === 0) return true;

  // Insert new entries
  const rows = subjects.map((s) => ({
    malla_id: mallaId,
    materia_id: s.materiaId,
    semester: s.semester,
    map_column: s.mapColumn,
    tipo_materia: s.tipoMateria,
    prerequisites: s.prerequisites,
    corequisites: s.corequisites,
  }));

  const { error: insertError } = await supabase
    .from("malla_materias")
    .insert(rows);

  if (insertError) {
    console.error("Error inserting malla_materias:", insertError.message);
    return false;
  }

  // Update malla timestamp
  await supabase
    .from("mallas")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", mallaId);

  return true;
}

// Create a new malla
export async function createMalla(malla: { carreraId: string; nombre: string; slug: string; descripcion?: string; pensum?: string; metadata?: any }): Promise<Malla | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("mallas")
    .insert([{
      carrera_id: malla.carreraId,
      nombre: malla.nombre,
      slug: malla.slug,
      descripcion: malla.descripcion || null,
      pensum: malla.pensum || '2026',
      metadata: malla.metadata || {},
    }])
    .select()
    .single();

  if (error) {
    console.error("Error creating malla:", error.message);
    return null;
  }

  return {
    id: data.id,
    carreraId: data.carrera_id,
    nombre: data.nombre,
    slug: data.slug,
    descripcion: data.descripcion,
    pensum: data.pensum,
    activo: data.activo,
    metadata: data.metadata,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

// Update malla metadata
export async function updateMalla(id: string, updates: Partial<{ carrera_id: string; nombre: string; slug: string; descripcion: string; pensum: string; activo: boolean; metadata: any }>): Promise<boolean> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("mallas")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id);
  return !error;
}

// Delete a malla
export async function deleteMalla(id: string): Promise<boolean> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("mallas")
    .delete()
    .eq("id", id);
  return !error;
}

