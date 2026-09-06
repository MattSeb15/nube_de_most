"use client";

import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  getSmoothStepPath,
} from "reactflow";
import { cn } from "@/lib/utils";

export const RemovableEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerStart,
  markerEnd,
  data,
}: EdgeProps) => {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const isCoreq = data?.isCoreq;
  const isPrereq = data?.isPrereq;

  return (
    <>
      <BaseEdge path={edgePath} markerStart={markerStart} markerEnd={markerEnd} style={style} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: "all",
          }}
          className="nodrag nopan"
        >
          {(isCoreq || isPrereq) && (
            <div
              className={cn(
                "px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider shadow-sm",
                isCoreq
                  ? "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
                  : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
              )}
            >
              {isCoreq ? "Corequisito" : "Prerrequisito"}
            </div>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
};
