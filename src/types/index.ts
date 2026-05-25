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
  descripcion: string;
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
}

export interface Comentario {
  id: string;
  actividadId: string;
  autor: string;
  avatarUrl?: string;
  contenido: string;
  fecha: string;
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
