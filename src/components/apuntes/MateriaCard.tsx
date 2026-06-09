import Link from "next/link";
import { MateriaIcon } from "@/components/ui/materia-icon";
import { MouseTooltip } from "@/components/ui/cursor-tooltip";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Eye } from "lucide-react";
import { Materia } from "@/types";
import { MateriaInteractions } from "./MateriaInteractions";

interface MateriaCardProps {
  materia: Materia;
  href: string;
  index?: number;
}

export function MateriaCard({ materia, href, index = 0 }: MateriaCardProps) {
  return (
    <MouseTooltip text={`Ir a ${materia.nombre}`} color={materia.color || undefined} className="block h-full">
      <Link
        href={href}
        className={`animate-fade-in stagger-${index + 1} group/link block h-full`}
      >
      <Card
        className="h-full flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl relative group-hover/link:-translate-y-1 border-2 border-border/50 hover:!border-[var(--materia-color)] p-0 gap-0"
        style={{ "--materia-color": materia.color || "#e5e5e5" } as React.CSSProperties}
      >
        {/* Larger Color accent banner */}
        <div
          className="h-16 w-full shrink-0 relative overflow-hidden"
          style={{ backgroundColor: "var(--materia-color)" }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent" />
          <div className="absolute inset-0 bg-black/5" />
        </div>

        <CardHeader className="px-5 pt-0 pb-4 shrink-0 relative">
          <div className="flex flex-col items-start">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-background border-2 shadow-sm relative -mt-6 mb-3 z-10 transition-transform group-hover/link:scale-105"
              style={{
                color: "var(--materia-color)",
                borderColor: "var(--materia-color)",
              }}
            >
              <MateriaIcon
                name={materia.icono}
                className="size-6"
                style={{
                  fill: "var(--materia-color)",
                  color: "var(--materia-color)",
                }}
              />
            </div>
            <div className="min-w-0 w-full text-left">
              <CardTitle className="text-lg leading-snug truncate">
                {materia.nombre}
              </CardTitle>
              <div className="mt-1 flex flex-col gap-1.5">
                <CardDescription className="font-mono text-[11px] font-bold text-muted-foreground/80 tracking-widest uppercase">
                  CODE: {materia.codigo}
                </CardDescription>
                {materia.profesorNombre && (
                  <div className="flex items-center text-xs text-muted-foreground z-20 relative pointer-events-auto">
                    <User className="w-3.5 h-3.5 mr-1.5 opacity-70" />
                    {materia.profesorId ? (
                      <object>
                        <MouseTooltip text={`Ver perfil de ${materia.profesorNombre}`} color="#3b82f6">
                          <Link
                            href={`/profesores/${materia.profesorId}`}
                            className="truncate hover:underline hover:text-foreground transition-colors"
                          >
                            Prof. {materia.profesorNombre}
                          </Link>
                        </MouseTooltip>
                      </object>
                    ) : (
                      <span className="truncate">
                        Prof. {materia.profesorNombre}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-5 pb-5 flex flex-col flex-1">
          <p className="line-clamp-2 text-sm text-muted-foreground leading-relaxed">
            {materia.descripcion}
          </p>
          <div className="flex items-center gap-2 mt-auto pt-4 flex-wrap">
            <Badge
              variant="secondary"
              className="text-[10.5px] font-medium bg-secondary/50"
            >
              {materia.apuntesCount}{" "}
              {materia.apuntesCount === 1 ? "apunte" : "apuntes"}
            </Badge>
            {typeof materia.vistasCount === 'number' && materia.vistasCount > 0 && (
              <Badge
                variant="secondary"
                className="text-[10.5px] font-medium bg-secondary/50 text-muted-foreground"
              >
                <Eye className="w-3 h-3 mr-1 opacity-70" />
                {materia.vistasCount} {materia.vistasCount === 1 ? "vista" : "vistas"}
              </Badge>
            )}
          </div>
          <MateriaInteractions materiaId={materia.id} />
        </CardContent>
      </Card>
      </Link>
    </MouseTooltip>
  );
}
