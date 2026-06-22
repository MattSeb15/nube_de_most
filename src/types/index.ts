// ============================================
// La Nube de Most — Type Definitions
// ============================================

export type EstadoActividad = "pendiente" | "vencida" | "entregada";
export type EstadoApunte = "publicado" | "borrador" | "en_revision";
export type TipoContenido = "markdown" | "pdf" | "imagen";
export type RolUsuario = "visitante" | "registrado" | "colaborador" | "admin";

export interface Semestre {
  id: string;
  nombre: string;
  slug: string;
  periodo: string; // e.g., "Octubre 2025 - Marzo 2026"
  activo: boolean;
  materias: number;
  materiasList?: { id: string; nombre: string; color: string }[];
}

export interface Profesor {
  id: string;
  nombre: string;
}

export interface Materia {
  id: string;
  nombre: string;
  slug: string;
  semestreId: string;
  codigo: string;
  color: string; // hex color for the subject card
  icono: string; // emoji
  apuntesCount: number;
  vistasCount?: number;
  descripcion: string;
  profesorId?: string;
  profesorNombre?: string;
  semestreSlug?: string;
  semestreNombre?: string;
}

export interface Apunte {
  id: string;
  titulo: string;
  slug: string;
  materiaId: string;
  semestreId: string;
  contenido: string; // markdown content
  tipo: TipoContenido;
  estado: EstadoApunte;
  bloqueado: boolean;
  tags: string[];
  fechaCreacion: string;
  fechaActualizacion: string;
  autor: string;
  colaboradores: string[];
  archivos: ArchivoAdjunto[];
  vistas: number;
}

export interface ArchivoAdjunto {
  id: string;
  nombre: string;
  url: string;
  tipo: string; // mime type
  tamano: number; // bytes
}

export type VisibilidadArchivo = "completa" | "parcial" | "ninguna";

export interface Actividad {
  id: string;
  nombre: string;
  slug: string;
  materiaId: string;
  descripcionOficial: string;
  tipsMost: string; // markdown with Most's personal tips
  estado: EstadoActividad;
  fechaInicio: string;
  fechaEntrega: string;
  archivos: ArchivoAdjunto[];
  comentariosCount: number;
  // ── Nuevos campos ──
  visibilidadArchivo: VisibilidadArchivo;
  fechaDesbloqueoVisibilidad: string | null;
  archivoResolucionUrl: string | null;
  archivoResolucionNombre: string | null;
  destinoSemestreId: string | null;
  destinoMateriaId: string | null;
  destinoCarpetaId: string | null;
  destinoNuevaCarpeta: string | null;
  colaborativa: boolean;
  transferida: boolean;
}

export interface Comentario {
  id: string;
  actividadId: string;
  parentId?: string | null;
  autor: string;
  avatarUrl?: string;
  contenido: string;
  fecha: string;
  respuestas?: Comentario[];
}

export interface Aporte {
  id: string;
  apunteId: string;
  colaborador: string;
  archivo: ArchivoAdjunto;
  mensaje: string;
  fecha: string;
  estado: "pendiente" | "aprobado" | "rechazado";
}

export interface EstadisticasSitio {
  totalApuntes: number;
  totalActividades: number;
  totalMaterias: number;
  totalVistas: number;
  totalColaboradores: number;
}

export interface RedSocial {
  plataforma: string;
  usuario: string;
  url: string;
  icono: string;
}

export interface PerfilUsuario {
  nombreCompleto: string;
  apodo: string;
  rol: string;
  bio: string;
  redes: RedSocial[];
  avatar_url?: string;
}

// ============================================
// Reinvented Apuntes (Folders, PDFs, Cuadernos)
// ============================================

export interface CarpetaApunte {
  id: string;
  slug?: string;
  nombre: string;
  descripcion: string;
  materiaId: string;
  parentId: string | null;
  creadorId: string;
  visible: boolean;
  colaborativa: boolean;
  fechaCreacion: string;
  tipo?: "normal" | "cuaderno";
}

export interface ArchivoApunte {
  id: string;
  slug?: string;
  carpetaId: string;
  tipo: "pdf" | "cuaderno";
  nombre: string;
  descripcion: string;
  urlArchivo: string | null;
  creadorId: string;
  fechaSubida: string;
  colaborativa?: boolean;
  vistasCount?: number;
}

export interface PaginaCuaderno {
  id: string;
  cuadernoId: string;
  urlImagen: string;
  fechaClase: string;
  orden: number;
  creadorId: string;
  oculta?: boolean;
  etiqueta?: string;
  etiqueta_grupo?: string;
  etiqueta_color?: string;
  // Propiedades para renderizado local
  perfiles?: {
    id: string;
    nombre_completo: string;
    avatar_url: string;
    apodo?: string;
  };
  creador_id?: string;
  created_at?: string;
  fecha_creacion?: string;
  fecha_subida?: string;
}

export interface ColaboradorCarpeta {
  carpetaId: string;
  usuarioId: string;
}
