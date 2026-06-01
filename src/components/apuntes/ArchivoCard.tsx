import Link from "next/link";
import { MouseTooltip } from "@/components/ui/cursor-tooltip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Shield, ChevronRight, Eye } from "lucide-react";
import { MateriaIcon } from "@/components/ui/materia-icon";
import { Materia } from "@/types";

export interface Archivo {
  id: string;
  nombre: string;
  tipo: string;
  fechaSubida: string;
  urlArchivo: string;
  creador: string;
  creadorId: string;
  creadorRol: string;
  materia?: Materia;
  vistasCount?: number;
}

interface ArchivoCardProps {
  archivo: Archivo;
}

function formatFecha(iso: string) {
  return new Date(iso).toLocaleString("es-EC", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ArchivoCard({ archivo }: ArchivoCardProps) {
  const materia = archivo.materia;
  const materiaSlug = materia?.slug ?? "desconocida";

  return (
    <Card className="group relative overflow-hidden flex flex-col h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-border/50 hover:border-primary/50 bg-background/50 hover:bg-background p-0 gap-0 w-full min-w-[200px]">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <MouseTooltip text={`Ver apunte: ${archivo.nombre}`}>
              <Link 
                href={`/apuntes/nivelacion/${materiaSlug}?archivo=${archivo.id}`}
                className="focus-visible:outline-none"
              >
                <CardTitle className="text-sm sm:text-base font-semibold leading-tight line-clamp-2 break-all group-hover:text-primary transition-colors min-h-[2.5em]">
                  {archivo.nombre}
                </CardTitle>
              </Link>
            </MouseTooltip>
            <div className="flex flex-col gap-1.5 mt-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className={`text-[10px] font-medium px-2 py-0.5 rounded-full border-0 transition-colors ${
                  archivo.tipo === "cuaderno"
                    ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                    : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                }`}>
                  {archivo.tipo?.toUpperCase()}
                </Badge>
                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <Clock className="size-3" />
                  {formatFecha(archivo.fechaSubida)}
                </span>
              </div>
              {typeof archivo.vistasCount === 'number' && archivo.vistasCount > 0 && (
                <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-0.5">
                  <Eye className="size-3 opacity-70" />
                  <span>{archivo.vistasCount} {archivo.vistasCount === 1 ? "vista" : "vistas"}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="px-4 pb-4 mt-auto flex flex-col gap-3">
        <div className="flex items-center mt-1">
          <span className="text-xs text-muted-foreground mr-2">Subido por</span>
          <MouseTooltip text={`Ver perfil de ${archivo.creador}`} color={archivo.creadorRol === "admin" ? "#dc2626" : "#3b82f6"}>
            <Link
              href={`/perfil/${archivo.creadorId || ""}`}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all hover:scale-105 shadow-sm ${
                archivo.creadorRol === "admin"
                  ? "bg-red-600 text-white hover:bg-red-700 shadow-red-600/20"
                  : "bg-muted text-foreground hover:bg-muted/80"
              }`}
            >
              {archivo.creadorRol === "admin" && <Shield className="size-3 fill-current" />}
              {archivo.creador}
            </Link>
          </MouseTooltip>
        </div>
      </CardContent>

      {materia && (
        <MouseTooltip text={`Ir a ${materia.nombre.toUpperCase()}`} color={materia.color || undefined} className="block w-full">
          <Link
            href={`/apuntes/nivelacion/${materiaSlug}`}
            className="flex items-center gap-2 px-4 h-11 w-full group/materia transition-all hover:brightness-110 relative overflow-hidden shrink-0"
            style={{ backgroundColor: materia.color, color: '#ffffff' }}
          >
            <div className="absolute inset-0 bg-black/10 opacity-0 group-hover/materia:opacity-100 transition-opacity" />
            <MateriaIcon name={materia.icono} className="size-3.5 shrink-0 transition-transform group-hover/materia:scale-110 relative z-10" style={{ fill: 'currentColor' }} />
            <span className="truncate text-[11px] font-bold tracking-wider relative z-10 leading-none">{materia.nombre.toUpperCase()}</span>
            <ChevronRight className="size-3.5 ml-auto opacity-0 -translate-x-2 group-hover/materia:opacity-100 group-hover/materia:translate-x-0 transition-all duration-300 relative z-10" />
          </Link>
        </MouseTooltip>
      )}
    </Card>
  );
}
