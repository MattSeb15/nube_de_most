"use client";
import React from 'react';

import { memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { SubjectNodeData } from "@/types";
import { cn } from "@/lib/utils";
import { ExternalLink, BookOpen, Clock, Bookmark, ThumbsUp, ThumbsDown } from "lucide-react";
import Link from "next/link";
import { MateriaIcon } from "@/components/ui/materia-icon";
import { getMateriaInteraction, toggleLikeDislikeMateria, toggleSaveMateria } from "@/app/(main)/materias/acciones";
import { useState, useEffect } from "react";

const DEFAULT_TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  basica: { bg: "#f59e0b", text: "#451a03" },
  profesional: { bg: "#1e3a8a", text: "#ffffff" },
  integracion: { bg: "#15803d", text: "#ffffff" },
  ninguno: { bg: "#e2e8f0", text: "#64748b" },
};


function FloatingInteractions({ materiaId }: { materiaId: string }) {
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [interaction, setInteraction] = useState<'like' | 'dislike' | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, setIsPending] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function loadInteractions() {
      const data = await getMateriaInteraction(materiaId);
      if (!mounted) return;
      setLikes(data.likes);
      setDislikes(data.dislikes);
      setInteraction(data.userInteraction);
      setIsSaved(data.isSaved);
      setUserId(data.userId || null);
      setIsLoading(false);
    }
    loadInteractions();
    return () => { mounted = false; };
  }, [materiaId]);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (!userId || isPending) return;
    setIsPending(true);
    
    const prevInteraction = interaction;
    let newLikes = likes;
    let newDislikes = dislikes;
    
    if (interaction === 'like') {
      newLikes--; setInteraction(null);
    } else {
      if (interaction === 'dislike') newDislikes--;
      newLikes++; setInteraction('like');
    }
    
    setLikes(newLikes); setDislikes(newDislikes);
    const res = await toggleLikeDislikeMateria(materiaId, 'like');
    if (res?.error) {
      setInteraction(prevInteraction); setLikes(likes); setDislikes(dislikes);
    }
    setIsPending(false);
  };

  const handleDislike = async (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (!userId || isPending) return;
    setIsPending(true);
    
    const prevInteraction = interaction;
    let newLikes = likes;
    let newDislikes = dislikes;
    
    if (interaction === 'dislike') {
      newDislikes--; setInteraction(null);
    } else {
      if (interaction === 'like') newLikes--;
      newDislikes++; setInteraction('dislike');
    }
    
    setLikes(newLikes); setDislikes(newDislikes);
    const res = await toggleLikeDislikeMateria(materiaId, 'dislike');
    if (res?.error) {
      setInteraction(prevInteraction); setLikes(likes); setDislikes(dislikes);
    }
    setIsPending(false);
  };

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (!userId || isPending) return;
    setIsPending(true);
    const prevSaved = isSaved;
    setIsSaved(!isSaved);
    const res = await toggleSaveMateria(materiaId);
    if (res?.error) setIsSaved(prevSaved);
    setIsPending(false);
  };

  if (isLoading) {
    return (
      <div className="absolute -right-16 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-50 animate-pulse">
        <div className="h-10 w-10 bg-muted/60 rounded-full" />
        <div className="h-10 w-10 bg-muted/60 rounded-full" />
        <div className="h-10 w-10 bg-muted/60 rounded-full" />
      </div>
    );
  }

  return (
    <div className="absolute -right-16 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-50 animate-in fade-in slide-in-from-left-2 zoom-in-95 duration-200">
      <button onClick={handleSave} disabled={!userId} className={cn("flex items-center justify-center h-10 w-10 rounded-full shadow-lg bg-background/95 backdrop-blur border border-border transition-all hover:bg-muted hover:scale-105", isSaved && "text-primary border-primary")} title={isSaved ? "Quitar de guardados" : "Guardar materia"}>
        <Bookmark className="w-5 h-5" fill={isSaved ? "currentColor" : "none"} />
      </button>
      
      <div className="flex flex-col items-center gap-1 bg-background/95 backdrop-blur border border-border rounded-full py-1 shadow-lg">
          <button onClick={handleLike} disabled={!userId} className={cn("flex items-center justify-center h-8 w-8 rounded-full transition-colors hover:bg-muted mx-1", interaction === 'like' && "text-green-500 bg-green-500/10")} title="Me gusta">
            <ThumbsUp className="w-4 h-4" fill={interaction === 'like' ? "currentColor" : "none"} />
          </button>
          <span className="text-[10px] font-bold text-muted-foreground w-full text-center px-1 border-y border-border/40 py-0.5">{likes - dislikes > 0 ? `+${likes - dislikes}` : (likes - dislikes)}</span>
          <button onClick={handleDislike} disabled={!userId} className={cn("flex items-center justify-center h-8 w-8 rounded-full transition-colors hover:bg-muted mx-1", interaction === 'dislike' && "text-red-500 bg-red-500/10")} title="No me gusta">
            <ThumbsDown className="w-4 h-4" fill={interaction === 'dislike' ? "currentColor" : "none"} />
          </button>
      </div>
    </div>
  );
}

export const SubjectNode = memo(({ data, selected }: NodeProps<SubjectNodeData>) => {
    const highlightRing = cn({
    "ring-2 ring-primary ring-offset-2": selected,
    "ring-2 ring-red-500 ring-offset-2": data.highlightType === "prereq",
    "ring-2 ring-blue-500 ring-offset-2": data.highlightType === "successor",
    "ring-2 ring-amber-500 ring-offset-2": data.highlightType === "coreq",
  });

  // Determine type styling
  const customType = data.customTypeData;
  const typeStyle = customType
    ? { backgroundColor: customType.color, color: customType.textColor || "#ffffff" }
    : DEFAULT_TYPE_COLORS[data.type]
    ? { backgroundColor: DEFAULT_TYPE_COLORS[data.type].bg, color: DEFAULT_TYPE_COLORS[data.type].text }
    : { backgroundColor: "#e2e8f0", color: "#64748b" };

  const typeLabel = customType?.label || (data.type ? data.type.toUpperCase() : "NO ASIGNADO");

  return (
    <>
      {/* Top Handle: Prerequisite Target */}
      <Handle
        type="target"
        position={Position.Top}
        id="top-target"
        className={cn(
          "w-12 h-1.5 rounded-sm border-none transition-colors",
          selected || data.isHighlighted ? "!bg-primary" : "!bg-slate-300 dark:!bg-slate-600 hover:!bg-primary"
        )}
      />

      {/* Side Handles for Corequisites (Left & Right) */}
      <Handle
        type="target"
        position={Position.Left}
        id="left-target"
        style={{ top: "50%" }}
        className={cn(
          "w-1.5 h-8 rounded-sm border-none transition-colors",
          selected || data.isHighlighted ? "!bg-amber-500" : "!bg-amber-300 dark:!bg-amber-600/70 hover:!bg-amber-500"
        )}
      />
      <Handle
        type="source"
        position={Position.Left}
        id="left-source"
        style={{ top: "50%", opacity: 0 }}
        className="w-1.5 h-8 pointer-events-none"
      />

      <Handle
        type="source"
        position={Position.Right}
        id="right-source"
        style={{ top: "50%" }}
        className={cn(
          "w-1.5 h-8 rounded-sm border-none transition-colors",
          selected || data.isHighlighted ? "!bg-amber-500" : "!bg-amber-300 dark:!bg-amber-600/70 hover:!bg-amber-500"
        )}
      />
      <Handle
        type="target"
        position={Position.Right}
        id="right-target"
        style={{ top: "50%", opacity: 0 }}
        className="w-1.5 h-8 pointer-events-none"
      />

            {/* Floating button when selected in viewer */}
      {selected && data.slug && (
        <>
          {data.materia?.id && <FloatingInteractions materiaId={data.materia.id} />}
          
          {/* Ver Apuntes on the bottom */}
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-2 zoom-in-95 duration-150">
            <Link
              href={data.semestreSlug ? `/${data.carreraSlug}/apuntes/${data.semestreSlug}/${data.slug}` : `/${data.carreraSlug}/apuntes`}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-primary text-primary-foreground text-xs font-bold rounded-full shadow-xl hover:bg-primary/90 transition-all hover:scale-105 whitespace-nowrap cursor-pointer"
            >
              <span>Ver Apuntes</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </>
      )}

      {/* Main Node Card */}
      <div
        className={cn(
          "relative flex flex-col w-[155px] h-[165px] bg-card text-card-foreground rounded-xl border border-border shadow-sm overflow-hidden transition-all duration-200 select-none",
          highlightRing,
          data.isDimmed && "opacity-25 grayscale-[60%] scale-[0.98]",
          data.isIndirect && "border-dashed",
          data.isSearchMatch && "shadow-[0_0_20px_rgba(255,255,255,0.6)] dark:shadow-[0_0_20px_rgba(255,255,255,0.3)] ring-2 ring-primary scale-105 z-30"
        )}
      >
        {/* Color banner */}
        <div
          className="h-2 w-full shrink-0 transition-colors"
          style={{ backgroundColor: data.color || "#e2e8f0" }}
        />

        <div className="flex-1 flex flex-col p-2.5 overflow-hidden">
          {/* Header: Icon + Code */}
          <div className="flex justify-between items-start mb-1.5">
            <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center shrink-0 border border-border/40">
              <MateriaIcon
                name={data.icono || "default"}
                className="w-4 h-4 text-muted-foreground"
              />
            </div>
            <span className="text-[10px] font-mono font-bold text-muted-foreground bg-muted/80 px-1.5 py-0.5 rounded border border-border/30">
              {data.code || "---"}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-xs font-bold leading-tight mb-1 line-clamp-2 text-foreground" title={data.label}>
            {data.label}
          </h3>

          {/* Professor */}
          {data.profesorNombre && (
            <p className="text-[10px] text-muted-foreground line-clamp-1 mb-auto">
              {data.profesorNombre}
            </p>
          )}

          {/* Badges */}
          <div className="flex items-center gap-1.5 mt-auto pt-1">
            <div className="flex items-center gap-1 text-[11px] font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-md shadow-sm">
              <BookOpen className="w-3 h-3" />
              <span>{data.apuntesCount || 0} apuntes</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-md shadow-sm">
              <Clock className="w-3 h-3" />
              <span>{data.creditos || 0}c</span>
            </div>
          </div>
        </div>

        {/* Type Strip */}
        <div
          className="text-[9px] font-black tracking-wider uppercase text-center py-1 shrink-0 transition-colors truncate px-1"
          style={typeStyle}
        >
          {typeLabel}
        </div>
      </div>

      {/* Bottom Handle: Prerequisite Source */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom-source"
        className={cn(
          "w-12 h-1.5 rounded-sm border-none transition-colors",
          selected || data.isHighlighted ? "!bg-primary" : "!bg-slate-300 dark:!bg-slate-600 hover:!bg-primary"
        )}
      />
    </>
  );
});

SubjectNode.displayName = "SubjectNode";
export default SubjectNode;
