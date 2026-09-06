import React, { memo } from "react";
import { Handle, Position } from "reactflow";
import { cn } from "@/lib/utils";

export interface SectionBackgroundNodeData {
  sectionId?: string;
  width: number;
  height: number;
  bgColor?: string;
  borderColor?: string;
  isHighlighted?: boolean;
  isDimmed?: boolean;
  isPrerequisite?: boolean;
  onSelectSection?: (sectionId: string) => void;
}

export const SectionBackgroundNode = memo(({ data }: { data: SectionBackgroundNodeData }) => {
  const {
    sectionId,
    width,
    height,
    bgColor = "rgba(15, 23, 42, 0.4)",
    borderColor,
    isHighlighted,
    isDimmed,
    isPrerequisite,
    onSelectSection,
  } = data;

  const handleClick = (e: React.MouseEvent) => {
    // If clicking on child nodes like subjects or buttons, they will stop propagation or handle it
    if (onSelectSection && sectionId) {
      onSelectSection(sectionId);
    }
  };

  return (
    <div
      onClick={handleClick}
      title="Clic para enfocar esta sección"
      style={{
        width: Math.max(width, 200),
        height: Math.max(height, 120),
        backgroundColor: bgColor || "rgba(15, 23, 42, 0.4)",
        borderColor: isHighlighted
          ? "#38bdf8"
          : isPrerequisite
          ? "#f59e0b"
          : borderColor || "rgba(255, 255, 255, 0.08)",
      }}
      className={cn(
        "rounded-2xl border transition-all duration-300 pointer-events-auto select-none relative backdrop-blur-[2px] cursor-pointer group",
        "hover:border-white/25 hover:shadow-lg",
        isHighlighted && "ring-2 ring-sky-500 shadow-[0_0_30px_rgba(56,189,248,0.25)] border-sky-400",
        isPrerequisite && "ring-2 ring-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.25)] border-amber-400"
      )}
    >
      {/* Handles for section connection arrows */}
      <Handle
        type="target"
        position={Position.Top}
        id="section-top-target"
        style={{ left: 140, opacity: 0, pointerEvents: "none" }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="section-bottom-source"
        style={{ left: 140, opacity: 0, pointerEvents: "none" }}
      />

      {/* Decorative corner accents */}
      <div className="absolute top-3 right-3 flex gap-1.5 opacity-30 group-hover:opacity-60 transition-opacity">
        <div className="w-1.5 h-1.5 rounded-full bg-white" />
        <div className="w-1.5 h-1.5 rounded-full bg-white" />
        <div className="w-1.5 h-1.5 rounded-full bg-white" />
      </div>
    </div>
  );
});

SectionBackgroundNode.displayName = "SectionBackgroundNode";
