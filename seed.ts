import { semestres, materias, apuntes, actividades, comentarios, perfilMost } from "./src/lib/mock-data";
import * as fs from "fs";

function escape(str: string): string {
  return str.replace(/'/g, "''");
}

function pgArray(arr: string[]): string {
  return "ARRAY[" + arr.map(x => `'${escape(x)}'`).join(", ") + "]";
}

let sql = `-- La Nube de Most — Seed SQL
-- Generado automáticamente desde mock-data.ts

-- 1. Truncar tablas existentes para reinicio limpio
TRUNCATE public.comentarios, public.apuntes, public.actividades, public.materias, public.semestres, public.perfiles CASCADE;

-- 2. Insertar Semestres
`;

for (const s of semestres) {
  sql += `INSERT INTO public.semestres (id, nombre, slug, periodo, activo) VALUES ('${escape(s.id)}', '${escape(s.nombre)}', '${escape(s.slug)}', '${escape(s.periodo)}', ${s.activo});\n`;
}

sql += "\n-- 3. Insertar Materias\n";
for (const m of materias) {
  sql += `INSERT INTO public.materias (id, nombre, slug, semestre_id, codigo, color, icono, descripcion) VALUES ('${escape(m.id)}', '${escape(m.nombre)}', '${escape(m.slug)}', '${escape(m.semestreId)}', '${escape(m.codigo)}', '${escape(m.color)}', '${escape(m.icono)}', '${escape(m.descripcion)}');\n`;
}

sql += "\n-- 4. Insertar Apuntes\n";
for (const a of apuntes) {
  sql += `INSERT INTO public.apuntes (id, titulo, slug, materia_id, semestre_id, contenido, tipo, estado, bloqueado, tags, autor, vistas, fecha_creacion, fecha_actualizacion) VALUES (gen_random_uuid(), '${escape(a.titulo)}', '${escape(a.slug)}', '${escape(a.materiaId)}', '${escape(a.semestreId)}', '${escape(a.contenido)}', '${escape(a.tipo)}', '${escape(a.estado)}', ${a.bloqueado}, ${pgArray(a.tags)}, '${escape(a.autor)}', ${a.vistas}, '${a.fechaCreacion}', '${a.fechaActualizacion}');\n`;
}

sql += "\n-- 5. Insertar Actividades\n";
for (const act of actividades) {
  sql += `INSERT INTO public.actividades (id, nombre, slug, materia_id, descripcion_oficial, tips_most, estado, fecha_inicio, fecha_entrega) VALUES ('${escape(act.id)}', '${escape(act.nombre)}', '${escape(act.slug)}', '${escape(act.materiaId)}', '${escape(act.descripcionOficial)}', '${escape(act.tipsMost)}', '${escape(act.estado)}', '${act.fechaInicio}', '${act.fechaEntrega}');\n`;
}

sql += "\n-- 6. Insertar Comentarios\n";
for (const c of comentarios) {
  sql += `INSERT INTO public.comentarios (id, actividad_id, autor, contenido, fecha) VALUES (gen_random_uuid(), '${escape(c.actividadId)}', '${escape(c.autor)}', '${escape(c.contenido)}', '${c.fecha}');\n`;
}

sql += "\n-- 7. Insertar Perfil de Most (Mateo)\n";
// Perfil de Mateo (creamos un UUID aleatorio o fijo para el perfil inicial de Most, usaremos uno fijo para simplicidad)
const adminId = "00000000-0000-0000-0000-000000000000";
sql += `INSERT INTO public.perfiles (id, nombre_completo, apodo, rol, bio, redes) VALUES ('${adminId}', '${escape(perfilMost.nombreCompleto)}', '${escape(perfilMost.apodo)}', 'admin', '${escape(perfilMost.bio)}', '${escape(JSON.stringify(perfilMost.redes))}'::jsonb);\n`;

fs.writeFileSync("seed.sql", sql);
console.log("seed.sql generado con éxito!");
