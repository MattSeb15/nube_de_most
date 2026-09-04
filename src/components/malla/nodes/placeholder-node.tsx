"use client";

import { memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PlaceholderNodeData {
  semester: number;
  column: number;
  onAdd: (semester: number, column: number) => void;
  onRemoveSpace: (semester: number, column: number) => void;
  canDelete?: boolean;
  isDragOrigin?: boolean;
  isDragTarget?: boolean;
}

export const PlaceholderNode = memo(({ data }: NodeProps<PlaceholderNodeData>) => {
  return (
    <>
      <Handle type="target" position={Position.Top} className="opacity-0" />
      <Handle type="source" position={Position.Bottom} className="opacity-0" />
      
      <div className={cn(
        "relative flex flex-col items-center justify-center w-[155px] h-[165px] rounded-xl border-2 border-dashed transition-all duration-200 group",
        data.isDragTarget ? "border-primary bg-primary/10" : "border-border/50 hover:border-primary/50",
        data.isDragOrigin ? "opacity-50" : "opacity-100"
      )}>
        {!data.isDragOrigin && !data.isDragTarget && (
          <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => data.onAdd(data.semester, data.column)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 rounded-md transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Añadir</span>
            </button>
            
            {data.canDelete && (
              <button
                onClick={() => data.onRemoveSpace(data.semester, data.column)}
                className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-destructive hover:bg-destructive/10 rounded-md transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Quitar</span>
              </button>
            )}
          </div>
        )}
        
        {data.isDragTarget && (
          <div className="text-xs font-medium text-primary">
            Soltar aquí
          </div>
        )}
      </div>
    </>
  );
});

PlaceholderNode.displayName = "PlaceholderNode";
