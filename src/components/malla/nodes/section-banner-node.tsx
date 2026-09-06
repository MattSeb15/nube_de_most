import React, { memo } from "react";
import { Handle, Position } from "reactflow";
import { cn } from "@/lib/utils";
import {
  Layers,
  ArrowUpRight,
  Plus,
  Settings2,
  Trash2,
  ChevronUp,
  ChevronDown,
  Palette,
} from "lucide-react";

export interface SectionBannerNodeData {
  sectionId: string;
  nombre: string;
  descripcion?: string;
  bgColor?: string;
  borderColor?: string;
  semestersCount: number;
  materiasCount: number;
  prerequisiteSectionIds?: string[];
  prerequisiteSectionNames?: string[];
  isHighlighted?: boolean;
  isDimmed?: boolean;
  isPrerequisite?: boolean;
  isEditor?: boolean;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  onEditSection?: (sectionId: string) => void;
  onAddSemester?: (sectionId: string) => void;
  onAddColumn?: (sectionId: string) => void;
  onDeleteSection?: (sectionId: string) => void;
  onMoveSectionUp?: (sectionId: string) => void;
  onMoveSectionDown?: (sectionId: string) => void;
  onChangeColor?: (sectionId: string, color: string) => void;
  onSelectSection?: (sectionId: string) => void;
}

export const SectionBannerNode = memo(({ data }: { data: SectionBannerNodeData }) => {
  const {
    sectionId,
    nombre,
    bgColor,
    semestersCount,
    materiasCount,
    prerequisiteSectionNames = [],
    isHighlighted,
    isDimmed,
    isPrerequisite,
    isEditor,
    canMoveUp,
    canMoveDown,
    onEditSection,
    onAddSemester,
    onAddColumn,
    onDeleteSection,
    onMoveSectionUp,
    onMoveSectionDown,
    onChangeColor,
    onSelectSection,
  } = data;

  const handleClick = (e: React.MouseEvent) => {
    // If clicking on an action button, don't trigger selection
    if ((e.target as HTMLElement).closest("button") || (e.target as HTMLElement).closest("input")) {
      return;
    }
    if (onSelectSection) {
      onSelectSection(sectionId);
    }
  };

  return (
    <div
      onClick={handleClick}
      title="Clic para enfocar esta sección"
      className={cn(
        "flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl border backdrop-blur-md shadow-md transition-all duration-300 select-none min-w-[280px] max-w-[700px] cursor-pointer",
        isHighlighted
          ? "bg-sky-950/80 border-sky-400 ring-2 ring-sky-500/40 shadow-[0_0_25px_rgba(56,189,248,0.25)]"
          : isPrerequisite
          ? "bg-amber-950/80 border-amber-400 ring-2 ring-amber-500/40 shadow-[0_0_25px_rgba(245,158,11,0.25)]"
          : "bg-neutral-900/90 border-neutral-700/80 hover:border-neutral-500 hover:bg-neutral-900"
      )}
    >
      {/* Handles for section connection edges */}
      <Handle
        type="target"
        position={Position.Top}
        id="section-banner-target"
        style={{ left: 50, opacity: 0, pointerEvents: "none" }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="section-banner-source"
        style={{ left: 50, opacity: 0, pointerEvents: "none" }}
      />

      {/* Left side: Section title and metadata */}
      <div className="flex items-center gap-2.5 min-w-0">
        <div
          className="flex items-center justify-center w-7 h-7 rounded-lg shrink-0 ring-1 ring-white/10"
          style={{ backgroundColor: bgColor || "#3b82f6" }}
        >
          <Layers className="w-3.5 h-3.5 text-white" />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-white tracking-wide truncate">{nombre}</h3>
            {isPrerequisite && (
              <span className="text-[10px] uppercase font-black tracking-wider px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Requisito Previo
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-[11px] text-neutral-400">
            <span>
              {semestersCount} {semestersCount === 1 ? "semestre" : "semestres"}
            </span>
            <span>·</span>
            <span>
              {materiasCount} {materiasCount === 1 ? "materia" : "materias"}
            </span>
          </div>
        </div>
      </div>

      {/* Middle: Prerequisite section badges */}
      {prerequisiteSectionNames.length > 0 && (
        <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
          {prerequisiteSectionNames.map((prereqName, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 border border-amber-500/30 text-amber-300"
              title={`Requiere completar la sección: ${prereqName}`}
            >
              <ArrowUpRight className="w-3 h-3 text-amber-400" />
              <span>Requiere: {prereqName}</span>
            </span>
          ))}
        </div>
      )}

      {/* Right side: Actions (Editor mode) */}
      {isEditor && (
        <div className="flex items-center gap-1 shrink-0 ml-2 border-l border-neutral-700/60 pl-2">
          {/* Quick Color Picker */}
          <div className="relative group">
            <label
              className="flex items-center justify-center w-6 h-6 rounded-md hover:bg-neutral-800 text-neutral-400 hover:text-white cursor-pointer transition-colors"
              title="Cambiar color de fondo"
            >
              <Palette className="w-3.5 h-3.5" />
              <input
                type="color"
                value={bgColor?.startsWith("#") ? bgColor.slice(0, 7) : "#1e293b"}
                onChange={(e) => onChangeColor && onChangeColor(sectionId, e.target.value)}
                className="opacity-0 absolute inset-0 w-full h-full cursor-pointer pointer-events-auto"
              />
            </label>
          </div>

          {/* Quick Add Semester */}
          <button
            onClick={() => onAddSemester && onAddSemester(sectionId)}
            className="flex items-center gap-1 px-2 py-1 rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
            title="Añadir semestre a esta sección"
          >
            <Plus className="w-3 h-3 text-primary" />
            <span className="text-[11px]">Semestre</span>
          </button>

          {/* Quick Add Column */}
          {onAddColumn && (
            <button
              onClick={() => onAddColumn(sectionId)}
              className="flex items-center gap-1 px-2 py-1 rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
              title="Añadir columna a esta sección"
            >
              <Plus className="w-3 h-3 text-sky-400" />
              <span className="text-[11px]">Columna</span>
            </button>
          )}

          {/* Move Up */}
          {canMoveUp && (
            <button
              onClick={() => onMoveSectionUp && onMoveSectionUp(sectionId)}
              className="p-1 rounded-md hover:bg-neutral-800 text-neutral-400 hover:text-white cursor-pointer transition-colors"
              title="Mover sección arriba"
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Move Down */}
          {canMoveDown && (
            <button
              onClick={() => onMoveSectionDown && onMoveSectionDown(sectionId)}
              className="p-1 rounded-md hover:bg-neutral-800 text-neutral-400 hover:text-white cursor-pointer transition-colors"
              title="Mover sección abajo"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Section Settings */}
          <button
            onClick={() => onEditSection && onEditSection(sectionId)}
            className="p-1 rounded-md hover:bg-neutral-800 text-neutral-400 hover:text-white cursor-pointer transition-colors"
            title="Configurar sección (Nombre, semestres, requisitos...)"
          >
            <Settings2 className="w-3.5 h-3.5" />
          </button>

          {/* Delete Section */}
          <button
            onClick={() => onDeleteSection && onDeleteSection(sectionId)}
            className="p-1 rounded-md hover:bg-red-500/10 text-neutral-400 hover:text-red-400 cursor-pointer transition-colors"
            title="Eliminar sección"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
});

SectionBannerNode.displayName = "SectionBannerNode";
