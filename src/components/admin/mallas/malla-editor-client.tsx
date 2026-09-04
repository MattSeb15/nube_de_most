"use client";
import { useTheme } from "next-themes";

import React, { useCallback, useMemo, useState, useEffect, useRef } from "react";
import ReactFlow, {
  useReactFlow,
  ReactFlowProvider,
  Background,
  MiniMap,
  Controls,
  Node,
  Edge,
  Connection,
  useNodesState,
  useEdgesState,
  MarkerType,
} from "reactflow";
import "reactflow/dist/style.css";

import { SubjectNode } from "@/components/malla/nodes/subject-node";
import { PlaceholderNode } from "@/components/malla/nodes/placeholder-node";
import { RemovableEdge } from "@/components/malla/edges/removable-edge";
import { createClient } from "@/utils/supabase/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MateriaIcon } from "@/components/ui/materia-icon";
import {
  Save,
  Plus,
  Trash2,
  Search,
  X,
  Loader2,
  Undo2,
  ArrowLeft,
  GitBranch,
  BookOpen,
  Copy,
  Check,
  Settings2,
  Sliders,
  Palette,
} from "lucide-react";
import Link from "next/link";
import type { Malla, MallaMateria, Materia, TipoMateria, SubjectNodeData, MallaMetadata } from "@/types";

const cardWidth = 155;
const cardHeight = 165;
const spacingX = 35;
const spacingY = 50;
const startX = 70;
const startY = 80;

const DEFAULT_TYPES = [
  { id: "basica", label: "Básica", color: "#f59e0b", textColor: "#451a03" },
  { id: "profesional", label: "Profesional", color: "#1e3a8a", textColor: "#ffffff" },
  { id: "integracion", label: "Integración", color: "#15803d", textColor: "#ffffff" },
  { id: "ninguno", label: "No asignado", color: "#e2e8f0", textColor: "#64748b" },
];

const SemesterLabelNode = ({ data }: any) => (
  <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-card/40 backdrop-blur-md border border-border/40 shadow-sm w-14 h-12 pointer-events-none select-none">
    <span className="text-[9px] font-black opacity-40 uppercase tracking-widest leading-none text-muted-foreground">{data.prefix || "SEM"}</span>
    <span className="text-lg font-black text-primary/40 leading-tight">{data.number}</span>
  </div>
);

const ColumnLabelNode = ({ data }: any) => (
  <div className="flex items-center justify-center p-1.5 rounded-lg bg-card/20 backdrop-blur-md border border-border/20 shadow-none w-10 h-7 pointer-events-none select-none">
    <span className="text-xs font-black text-primary/40 leading-none">{data.label}</span>
  </div>
);

const nodeTypes = {
  subject: SubjectNode,
  placeholder: PlaceholderNode,
  semesterLabel: SemesterLabelNode,
  columnLabel: ColumnLabelNode,
};

const edgeTypes = {
  removable: RemovableEdge,
};

interface MallaEditorClientProps {
  malla: Malla;
  mallaMaterias: MallaMateria[];
  availableMaterias: Materia[];
}

export function MallaEditorClient(props: MallaEditorClientProps) {
  return (
    <ReactFlowProvider>
      <MallaEditorContent {...props} />
    </ReactFlowProvider>
  );
}

function MallaEditorContent({
  malla,
  mallaMaterias: initialMallaMaterias,
  availableMaterias,
}: MallaEditorClientProps) {
  const supabase = createClient();
  const { resolvedTheme } = useTheme();

  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "error">("idle");
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  const [isAddPanelOpen, setIsAddPanelOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeSlot, setActiveSlot] = useState<{ semester: number; column: number } | null>(null);

  // Metadata state
  const [metadata, setMetadata] = useState<MallaMetadata>(() => {
    const raw = malla.metadata || {};
    return {
      rowLabelFormat: raw.rowLabelFormat || "SEM ${num}",
      columnLabels: raw.columnLabels || {},
      customTypes: raw.customTypes && raw.customTypes.length > 0 ? raw.customTypes : DEFAULT_TYPES,
    };
  });

  // Working copy of malla subjects
  const [subjects, setSubjects] = useState<
    {
      materiaId: string;
      semester: number;
      mapColumn: number;
      tipoMateria: TipoMateria;
      prerequisites: string[];
      corequisites: string[];
      materia?: Materia;
    }[]
  >(
    initialMallaMaterias.map((mm) => ({
      materiaId: mm.materiaId,
      semester: mm.semester,
      mapColumn: mm.mapColumn,
      tipoMateria: mm.tipoMateria,
      prerequisites: mm.prerequisites || [],
      corequisites: mm.corequisites || [],
      materia: mm.materia,
    }))
  );

  // Context Menu State
  const [contextMenu, setContextMenu] = useState<{
    nodeId: string;
    x: number;
    y: number;
  } | null>(null);

  // Custom type creation form state
  const [newTypeName, setNewTypeName] = useState("");
  const [newTypeColor, setNewTypeColor] = useState("#3b82f6");

  // Undo history
  const [history, setHistory] = useState<{ subjects: typeof subjects; metadata: MallaMetadata }[]>([]);

  const pushHistory = useCallback(() => {
    setHistory((prev) => [
      ...prev.slice(-25),
      {
        subjects: JSON.parse(JSON.stringify(subjects)),
        metadata: JSON.parse(JSON.stringify(metadata)),
      },
    ]);
  }, [subjects, metadata]);

  const undo = useCallback(() => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));
    setSubjects(prev.subjects);
    setMetadata(prev.metadata);
  }, [history]);

  // Ctrl+Z handler
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        undo();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [undo]);

  // Dynamic grid calculation: starts 2x2 and expands with a radius of 1
  const gridDimensions = useMemo(() => {
    if (subjects.length === 0) {
      return { totalSemesters: 2, totalColumns: 2 };
    }
    const maxSem = Math.max(...subjects.map((s) => s.semester));
    const maxCol = Math.max(...subjects.map((s) => s.mapColumn));
    return {
      totalSemesters: Math.max(2, maxSem + 2),
      totalColumns: Math.max(2, maxCol + 2),
    };
  }, [subjects]);

  // Available custom types map
  const activeCustomTypes = useMemo(() => {
    return metadata.customTypes && metadata.customTypes.length > 0
      ? metadata.customTypes
      : DEFAULT_TYPES;
  }, [metadata.customTypes]);

  const customTypeMap = useMemo(() => {
    const map = new Map<string, { label: string; color: string; textColor?: string }>();
    activeCustomTypes.forEach((t) => map.set(t.id, t));
    return map;
  }, [activeCustomTypes]);

  // Add subject to a slot
  const handleAdd = useCallback(
    (semester: number, column: number) => {
      pushHistory();
      setActiveSlot({ semester, column });
      setIsAddPanelOpen(true);
    },
    [pushHistory]
  );

  // Confirm adding a specific materia to the active slot
  const confirmAdd = useCallback(
    (materia: Materia) => {
      if (!activeSlot) return;
      if (subjects.some((s) => s.materiaId === materia.id)) return;

      pushHistory();
      setSubjects((prev) => [
        ...prev,
        {
          materiaId: materia.id,
          semester: activeSlot.semester,
          mapColumn: activeSlot.column,
          tipoMateria: "ninguno",
          prerequisites: [],
          corequisites: [],
          materia,
        },
      ]);
      setIsAddPanelOpen(false);
      setActiveSlot(null);
    },
    [activeSlot, subjects, pushHistory]
  );

  // Remove a subject
  const handleDeleteNode = useCallback(
    (materiaId: string) => {
      pushHistory();
      const targetSub = subjects.find((s) => s.materiaId === materiaId);
      const targetCode = targetSub?.materia?.codigo;

      setSubjects((prev) =>
        prev
          .filter((s) => s.materiaId !== materiaId)
          .map((s) => ({
            ...s,
            prerequisites: targetCode ? s.prerequisites.filter((p) => p !== targetCode) : s.prerequisites,
            corequisites: targetCode ? s.corequisites.filter((c) => c !== targetCode) : s.corequisites,
          }))
      );
      setContextMenu(null);
    },
    [pushHistory, subjects]
  );

  // Change type of a node
  const handleChangeType = useCallback(
    (nodeId: string, typeId: string) => {
      pushHistory();
      setSubjects((prev) =>
        prev.map((s) => (s.materiaId === nodeId ? { ...s, tipoMateria: typeId } : s))
      );
      setContextMenu(null);
    },
    [pushHistory]
  );

  // Add new custom type
  const handleAddCustomType = () => {
    if (!newTypeName.trim()) return;
    pushHistory();
    const id = newTypeName.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now().toString(36);
    const newType = {
      id,
      label: newTypeName.trim(),
      color: newTypeColor,
      textColor: "#ffffff",
    };
    setMetadata((prev) => ({
      ...prev,
      customTypes: [...(prev.customTypes || DEFAULT_TYPES), newType],
    }));
    setNewTypeName("");
  };

  // Remove custom type
  const handleRemoveCustomType = (typeId: string) => {
    pushHistory();
    setMetadata((prev) => ({
      ...prev,
      customTypes: (prev.customTypes || DEFAULT_TYPES).filter((t) => t.id !== typeId),
    }));
  };

  // Build nodes
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    const { totalSemesters, totalColumns } = gridDimensions;

    // Subject nodes
    const subjectNodes: Node[] = subjects.map((s) => ({
      id: s.materiaId,
      type: "subject",
      position: {
        x: startX + s.mapColumn * (cardWidth + spacingX),
        y: startY + (s.semester - 1) * (cardHeight + spacingY),
      },
      draggable: true,
      data: {
        label: s.materia?.nombre || "Sin nombre",
        code: s.materia?.codigo || "---",
        color: s.materia?.color || "#94a3b8",
        icono: s.materia?.icono || "📚",
        profesorNombre: s.materia?.profesorNombre,
        apuntesCount: s.materia?.apuntesCount || 0,
        creditos: (s.materia as any)?.creditos || 3,
        horas: (s.materia as any)?.horas || 48,
        type: s.tipoMateria,
        customTypeData: customTypeMap.get(s.tipoMateria),
        semester: s.semester,
        column: s.mapColumn,
        slug: s.materia?.slug || "",
        semestreSlug: "",
        prerequisites: s.prerequisites,
        corequisites: s.corequisites,
        uuid: s.materiaId,
        materia: s.materia,
        isHighlighted: false,
        isDimmed: false,
        isSearchMatch: false,
        carreraSlug: '',
      } satisfies SubjectNodeData,
    }));

    // Placeholder nodes for empty slots only within dynamic grid
    const placeholderNodes: Node[] = [];
    for (let sem = 1; sem <= totalSemesters; sem++) {
      for (let col = 0; col < totalColumns; col++) {
        const occupied = subjects.some((s) => s.semester === sem && s.mapColumn === col);
        if (!occupied) {
          placeholderNodes.push({
            id: `placeholder-${sem}-${col}`,
            type: "placeholder",
            position: {
              x: startX + col * (cardWidth + spacingX),
              y: startY + (sem - 1) * (cardHeight + spacingY),
            },
            draggable: false,
            data: {
              semester: sem,
              column: col,
              onAdd: handleAdd,
              onRemoveSpace: () => {},
              canDelete: false,
            },
          });
        }
      }
    }

    // Row / Semester labels
    const semLabels: Node[] = Array.from({ length: totalSemesters }).map((_, i) => {
      const s = i + 1;
      let prefix = "SEM";
      let numStr = String(s);
      if (metadata.rowLabelFormat && metadata.rowLabelFormat.includes("${num}")) {
        prefix = metadata.rowLabelFormat.split("${num}")[0].trim() || "SEM";
      }

      return {
        id: `sem-label-${s}`,
        type: "semesterLabel",
        selectable: false,
        draggable: false,
        position: {
          x: 0,
          y: startY + i * (cardHeight + spacingY) + cardHeight / 2 - 24,
        },
        data: { prefix, number: numStr },
      };
    });

    // Column labels
    const colLabels: Node[] = Array.from({ length: totalColumns }).map((_, i) => {
      const label = metadata.columnLabels?.[i] !== undefined ? metadata.columnLabels[i] : String(i);
      return {
        id: `col-label-${i}`,
        type: "columnLabel",
        selectable: false,
        draggable: false,
        position: {
          x: startX + i * (cardWidth + spacingX) + cardWidth / 2 - 20,
          y: startY - 40,
        },
        data: { label },
      };
    });

    setNodes([...semLabels, ...colLabels, ...subjectNodes, ...placeholderNodes]);

    // Build edges
    const newEdges: Edge[] = [];
    subjects.forEach((s) => {
      // Prerequisites
      (s.prerequisites || []).forEach((prereqCode) => {
        const source = subjects.find((ss) => ss.materia?.codigo === prereqCode);
        if (source) {
          newEdges.push({
            id: `edge-${source.materiaId}-${s.materiaId}`,
            source: source.materiaId,
            target: s.materiaId,
            sourceHandle: "bottom-source",
            targetHandle: "top-target",
            type: "removable",
            animated: false,
            style: { stroke: "#94a3b8", strokeWidth: 2, opacity: 0.6 },
            markerEnd: { type: MarkerType.ArrowClosed, color: "#94a3b8" },
          });
        }
      });

      // Corequisites
      (s.corequisites || []).forEach((coreqCode) => {
        const source = subjects.find((ss) => ss.materia?.codigo === coreqCode);
        if (source && source.materiaId < s.materiaId) {
          newEdges.push({
            id: `edge-coreq-${source.materiaId}-${s.materiaId}`,
            source: source.materiaId,
            target: s.materiaId,
            sourceHandle: "right-source",
            targetHandle: "left-target",
            type: "removable",
            animated: false,
            style: { stroke: "#f59e0b", strokeWidth: 2, strokeDasharray: "5,5", opacity: 0.6 },
            markerStart: { type: MarkerType.ArrowClosed, color: "#f59e0b" },
            markerEnd: { type: MarkerType.ArrowClosed, color: "#f59e0b" },
          });
        }
      });
    });

    setEdges(newEdges);
  }, [subjects, gridDimensions, metadata, customTypeMap, handleAdd]);

  // Handle node drag stop: snap to grid and auto-recalculate dimensions
  
  

  const onNodeDragStop = useCallback(
    (_event: any, node: Node) => {
      if (node.type !== "subject") return;
      
      const col = Math.max(0, Math.round((node.position.x - startX) / (cardWidth + spacingX)));
      const sem = Math.max(1, Math.round((node.position.y - startY) / (cardHeight + spacingY)) + 1);
      
      const originalColumn = node.data.column;
      const originalSemester = node.data.semester;
      
      const cellChanged = originalColumn !== col || originalSemester !== sem;
      
      if (!cellChanged) {
        // Snap back
        setNodes((nds) => nds.map((n) => {
          if (n.id === node.id) {
            return {
              ...n,
              position: {
                x: startX + originalColumn * (cardWidth + spacingX),
                y: startY + (originalSemester - 1) * (cardHeight + spacingY)
              }
            };
          }
          return n;
        }));
        return;
      }
      
      pushHistory();
      
      setSubjects((prev) => {
        const targetNode = prev.find((mm) => 
          mm.materiaId !== node.id &&
          mm.semester === sem &&
          (mm.mapColumn ?? 0) === col
        );
        
        const isSameSemester = originalSemester === sem;
        const isSwap = isSameSemester && targetNode !== undefined;
        
        return prev.map((s) => {
          if (s.materiaId === node.id) {
            return { ...s, semester: sem, mapColumn: col };
          }
          if (cellChanged && isSwap && s.materiaId === targetNode?.materiaId) {
            return { ...s, semester: originalSemester, mapColumn: originalColumn };
          }
          if (cellChanged && !isSwap && targetNode !== undefined && s.semester === sem && (s.mapColumn ?? 0) >= col) {
            return { ...s, mapColumn: (s.mapColumn ?? 0) + 1 };
          }
          return s;
        });
      });
    },
    [pushHistory, setNodes, startX, startY, cardWidth, cardHeight, spacingX, spacingY]
  );

  // Connection validation
  const isValidConnection = useCallback(
    (connection: Connection): boolean => {
      if (!connection.source || !connection.target || connection.source === connection.target) {
        return false;
      }
      const isPrereq =
        connection.sourceHandle === "bottom-source" && connection.targetHandle === "top-target";
      const isCoreq = Boolean(
        (connection.sourceHandle?.includes("left") || connection.sourceHandle?.includes("right")) &&
        (connection.targetHandle?.includes("left") || connection.targetHandle?.includes("right"))
      );

      return Boolean(isPrereq || isCoreq);
    },
    []
  );

  // Handle new connections
  const onConnect = useCallback(
    (params: Connection) => {
      if (!params.source || !params.target || params.source === params.target) return;

      const sourceSubject = subjects.find((s) => s.materiaId === params.source);
      const targetSubject = subjects.find((s) => s.materiaId === params.target);
      if (!sourceSubject?.materia || !targetSubject?.materia) return;

      const isCoreq =
        params.sourceHandle?.includes("left") ||
        params.sourceHandle?.includes("right") ||
        params.targetHandle?.includes("left") ||
        params.targetHandle?.includes("right");

      pushHistory();

      setSubjects((prev) =>
        prev.map((s) => {
          if (s.materiaId === params.target) {
            if (isCoreq) {
              const current = s.corequisites || [];
              if (!current.includes(sourceSubject.materia!.codigo)) {
                return { ...s, corequisites: [...current, sourceSubject.materia!.codigo] };
              }
            } else {
              const current = s.prerequisites || [];
              if (!current.includes(sourceSubject.materia!.codigo)) {
                return { ...s, prerequisites: [...current, sourceSubject.materia!.codigo] };
              }
            }
          }
          if (isCoreq && s.materiaId === params.source) {
            const current = s.corequisites || [];
            if (!current.includes(targetSubject.materia!.codigo)) {
              return { ...s, corequisites: [...current, targetSubject.materia!.codigo] };
            }
          }
          return s;
        })
      );
    },
    [subjects, metadata, customTypeMap]
  );
  
  const edgeReconnectSuccessful = React.useRef(true);
  const onReconnectStart = React.useCallback(() => {
    edgeReconnectSuccessful.current = false;
  }, []);
  const onReconnect = React.useCallback((oldEdge: any, newConnection: any) => {
    edgeReconnectSuccessful.current = true;
    setEdges((els) => els.filter(e => e.id !== oldEdge.id));
    onConnect(newConnection);
  }, [setEdges, onConnect]);
  const onReconnectEnd = React.useCallback((_: any, edge: any) => {
    if (!edgeReconnectSuccessful.current) {
      setEdges((eds) => eds.filter((e) => e.id !== edge.id));
      // Trigger the delete logic manually
      const isCoreq = edge.id.includes("coreq");
      const sourceSubject = subjects.find((s) => s.materiaId === edge.source);
      const targetSubject = subjects.find((s) => s.materiaId === edge.target);
      if (sourceSubject?.materia && targetSubject?.materia) {
        setSubjects((prev) =>
          prev.map((s) => {
            if (s.materiaId === edge.target) {
              return {
                ...s,
                prerequisites: isCoreq ? s.prerequisites : s.prerequisites.filter((p) => p !== sourceSubject.materia!.codigo),
                corequisites: isCoreq ? s.corequisites.filter((c) => c !== sourceSubject.materia!.codigo) : s.corequisites,
              };
            }
            if (isCoreq && s.materiaId === edge.source) {
              return {
                ...s,
                corequisites: s.corequisites.filter((c) => c !== targetSubject.materia!.codigo),
              };
            }
            return s;
          })
        );
      }
    }
    edgeReconnectSuccessful.current = true;
  }, [setEdges, subjects]);
  const onEdgeClick = React.useCallback((_event: any, _edge: any) => {
    // optional logic
  }, []);

  // Handle Right Click on Node
  const handleNodeContextMenu = useCallback((event: React.MouseEvent, node: Node) => {
    event.preventDefault();
    if (node.type === "subject") {
      setContextMenu({
        nodeId: node.id,
        x: event.clientX,
        y: event.clientY,
      });
    }
  }, []);

  // Save to Supabase (malla_materias + mallas metadata)
  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus("idle");

    try {
      // 1. Delete existing entries
      await supabase.from("malla_materias").delete().eq("malla_id", malla.id);

      // 2. Insert new subjects
      if (subjects.length > 0) {
        const rows = subjects.map((s) => ({
          malla_id: malla.id,
          materia_id: s.materiaId,
          semester: s.semester,
          map_column: s.mapColumn,
          tipo_materia: s.tipoMateria,
          prerequisites: s.prerequisites,
          corequisites: s.corequisites,
        }));

        const { error } = await supabase.from("malla_materias").insert(rows);
        if (error) throw error;
      }

      // 3. Update malla metadata and updated_at
      const { error: mallaErr } = await supabase
        .from("mallas")
        .update({
          metadata: metadata,
          updated_at: new Date().toISOString(),
        })
        .eq("id", malla.id);

      if (mallaErr) throw mallaErr;

      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (err) {
      console.error("Save error:", err);
      setSaveStatus("error");
    } finally {
      setIsSaving(false);
    }
  };

  // Filter available materias
  const unusedMaterias = useMemo(() => {
    const usedIds = new Set(subjects.map((s) => s.materiaId));
    return availableMaterias.filter(
      (m) =>
        !usedIds.has(m.id) &&
        (searchQuery === "" ||
          m.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.codigo.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [subjects, availableMaterias, searchQuery]);

  const ctxSubject = useMemo(() => {
    if (!contextMenu) return null;
    return subjects.find((s) => s.materiaId === contextMenu.nodeId);
  }, [contextMenu, subjects]);

  return (
    <div className="flex flex-col h-screen bg-neutral-950">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-neutral-800 bg-neutral-900/80 backdrop-blur-md z-50">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/mallas"
            className="flex items-center gap-1 text-sm text-neutral-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Mallas
          </Link>
          <span className="text-neutral-600">/</span>
          <div className="flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold text-white truncate max-w-[200px]">{malla.nombre}</span>
          </div>
          <Badge className="text-[10px] bg-neutral-800 text-neutral-400 border-neutral-700">
            Pensum {malla.pensum}
          </Badge>
          <Badge className="text-[10px] bg-neutral-800 text-neutral-400 border-neutral-700">
            {subjects.length} materias
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsSettingsOpen(true)}
            className="gap-1.5 bg-neutral-900 border-neutral-700 text-neutral-300 hover:text-white"
          >
            <Sliders className="w-4 h-4" />
            Configurar Malla
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={undo}
            disabled={history.length === 0}
            className="gap-1 text-neutral-400 hover:text-white"
          >
            <Undo2 className="w-4 h-4" />
            Deshacer
          </Button>

          <Button
            onClick={handleSave}
            disabled={isSaving}
            size="sm"
            className={cn(
              "gap-1.5 font-bold",
              saveStatus === "saved" && "bg-green-600 hover:bg-green-700",
              saveStatus === "error" && "bg-red-600 hover:bg-red-700"
            )}
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saveStatus === "saved" ? "¡Guardado!" : saveStatus === "error" ? "Error al Guardar" : "Guardar"}
          </Button>
        </div>
      </header>

      {/* Editor Canvas */}
      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          isValidConnection={isValidConnection}
          onNodeDragStop={onNodeDragStop}
          onNodeContextMenu={handleNodeContextMenu}
          onPaneClick={() => setContextMenu(null)}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          fitViewOptions={{ padding: 0.15 }}
          nodesDraggable={true}
          nodesConnectable={true}
          elementsSelectable={true}
          zoomOnScroll={true}
          panOnDrag={true}
          preventScrolling={true}
          zoomOnPinch={true}
          maxZoom={3}
          minZoom={0.05}
          onReconnect={onReconnect}
            onReconnectStart={onReconnectStart}
            onReconnectEnd={onReconnectEnd}
            onEdgeClick={onEdgeClick}
            defaultEdgeOptions={{
              type: 'removable',
              style: { strokeWidth: 2, stroke: '#94a3b8' },
              reconnectable: true
            }}
            deleteKeyCode={["Backspace", "Delete"]}
          onEdgesDelete={(deletedEdges) => {
            pushHistory();
            deletedEdges.forEach((edge) => {
              const isCoreq = edge.id.includes("coreq");
              const sourceSubject = subjects.find((s) => s.materiaId === edge.source);
              const targetSubject = subjects.find((s) => s.materiaId === edge.target);

              if (sourceSubject?.materia && targetSubject?.materia) {
                setSubjects((prev) =>
                  prev.map((s) => {
                    if (s.materiaId === edge.target) {
                      return {
                        ...s,
                        prerequisites: isCoreq ? s.prerequisites : s.prerequisites.filter((p) => p !== sourceSubject.materia!.codigo),
                        corequisites: isCoreq ? s.corequisites.filter((c) => c !== sourceSubject.materia!.codigo) : s.corequisites,
                      };
                    }
                    if (isCoreq && s.materiaId === edge.source) {
                      return {
                        ...s,
                        corequisites: s.corequisites.filter((c) => c !== targetSubject.materia!.codigo),
                      };
                    }
                    return s;
                  })
                );
              }
            });
          }}
        >
          <Background gap={25} size={1} className="bg-neutral-950!" />
          <Controls
            showInteractive={false}
            className="bg-neutral-900/80 backdrop-blur-md border border-neutral-700 rounded-xl overflow-hidden shadow-2xl"
          />
          {mounted && (
            <MiniMap
              nodeStrokeWidth={3}
              className="bg-background/80 backdrop-blur-md border border-border/50 rounded-xl overflow-hidden shadow-lg"
              maskColor={resolvedTheme === 'dark' ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.5)'}
              nodeColor={(node) => {
                if (node.type !== 'subject') return 'transparent';
                const { type } = node.data;
                if (type === 'basica') return '#f59e0b';
                if (type === 'profesional') return '#3b82f6';
                if (type === 'integracion') return '#16a34a';
                return '#94a3b8';
              }}
            />
          )}
        </ReactFlow>

        {/* Right-Click Context Menu */}
        {contextMenu && ctxSubject && (
          <>
            <div
              className="fixed inset-0 z-[100]"
              onClick={() => setContextMenu(null)}
              onContextMenu={(e) => {
                e.preventDefault();
                setContextMenu(null);
              }}
            />
            <div
              className="fixed z-[101] w-[220px] bg-neutral-900/95 backdrop-blur-xl border border-neutral-700/80 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100"
              style={{ left: contextMenu.x, top: contextMenu.y }}
            >
              {/* Header */}
              <div className="px-3 pt-2.5 pb-2 border-b border-neutral-800 bg-neutral-800/40">
                <p className="text-[9px] font-black uppercase tracking-widest text-neutral-400">Materia</p>
                <p className="text-xs font-bold text-white truncate">{ctxSubject.materia?.nombre || "Sin nombre"}</p>
                <p className="text-[10px] font-mono text-neutral-400">{ctxSubject.materia?.codigo || "---"}</p>
              </div>

              {/* Quick Actions */}
              <div className="py-1">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(ctxSubject.materia?.codigo || "");
                    setContextMenu(null);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-1.5 text-left text-neutral-300 hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  <Copy className="h-3.5 w-3.5 text-neutral-400" />
                  <span className="text-xs">Copiar código</span>
                </button>
              </div>

              <div className="h-px bg-neutral-800 mx-2" />

              {/* Tipo de Materia Selection */}
              <div className="py-1">
                <div className="px-3 py-1">
                  <p className="text-[8px] font-black uppercase tracking-widest text-neutral-500">Tipo de Materia</p>
                </div>
                {activeCustomTypes.map((opt) => {
                  const isActive = ctxSubject.tipoMateria === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleChangeType(contextMenu.nodeId, opt.id)}
                      className="w-full flex items-center gap-2.5 px-3 py-1.5 text-left hover:bg-neutral-800 transition-colors cursor-pointer"
                    >
                      <div
                        className="w-2.5 h-2.5 rounded-full shrink-0 ring-1 ring-white/10"
                        style={{ backgroundColor: opt.color }}
                      />
                      <span className="text-xs font-medium flex-1 truncate" style={{ color: isActive ? opt.color : "#d4d4d4" }}>
                        {opt.label}
                      </span>
                      {isActive && <Check className="h-3.5 w-3.5" style={{ color: opt.color }} />}
                    </button>
                  );
                })}
              </div>

              <div className="h-px bg-neutral-800 mx-2" />

              {/* Delete Action */}
              <div className="py-1">
                <button
                  onClick={() => handleDeleteNode(contextMenu.nodeId)}
                  className="w-full flex items-center gap-2.5 px-3 py-1.5 text-left text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span className="text-xs font-medium">Quitar de la malla</span>
                </button>
              </div>
            </div>
          </>
        )}

        {/* Malla Settings Modal */}
        {isSettingsOpen && (
          <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-neutral-900 border border-neutral-700 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800">
                <div className="flex items-center gap-2">
                  <Settings2 className="w-5 h-5 text-primary" />
                  <h3 className="text-base font-bold text-white">Configuración de la Malla</h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-neutral-400"
                  onClick={() => setIsSettingsOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="p-5 space-y-6 max-h-[75vh] overflow-y-auto">
                {/* Format of rows */}
                <div>
                  <label className="text-xs font-bold text-neutral-300 block mb-1.5 uppercase tracking-wider">
                    Formato de Etiquetas de Filas (Semestres)
                  </label>
                  <Input
                    value={metadata.rowLabelFormat || ""}
                    onChange={(e) => {
                      pushHistory();
                      setMetadata((m) => ({ ...m, rowLabelFormat: e.target.value }));
                    }}
                    placeholder="Ej. Semestre ${num} o SEM ${num}"
                    className="bg-neutral-800 border-neutral-700 text-sm"
                  />
                  <p className="text-[11px] text-neutral-500 mt-1">
                    Usa <code className="text-primary font-mono font-bold">{"${num}"}</code> para representar el número de semestre.
                  </p>
                </div>

                {/* Column labels */}
                <div>
                  <label className="text-xs font-bold text-neutral-300 block mb-1.5 uppercase tracking-wider">
                    Etiquetas de Columnas
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {Array.from({ length: gridDimensions.totalColumns }).map((_, colIndex) => (
                      <div key={colIndex} className="space-y-1">
                        <span className="text-[10px] font-mono text-neutral-500">Col {colIndex}</span>
                        <Input
                          value={metadata.columnLabels?.[colIndex] || ""}
                          onChange={(e) => {
                            pushHistory();
                            const val = e.target.value;
                            setMetadata((m) => ({
                              ...m,
                              columnLabels: { ...(m.columnLabels || {}), [colIndex]: val },
                            }));
                          }}
                          placeholder={String(colIndex)}
                          className="bg-neutral-800 border-neutral-700 text-xs px-2 py-1 h-8 text-center font-bold"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Custom Types Manager */}
                <div className="border-t border-neutral-800 pt-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-1.5">
                      <Palette className="w-4 h-4 text-primary" />
                      <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                        Tipos de Materias (Categorías)
                      </label>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    {activeCustomTypes.map((type) => (
                      <div
                        key={type.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-neutral-800/60 border border-neutral-700/50"
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-4 h-4 rounded-full ring-1 ring-white/20"
                            style={{ backgroundColor: type.color }}
                          />
                          <span className="text-xs font-semibold text-white">{type.label}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveCustomType(type.id)}
                          className="h-7 w-7 p-0 text-neutral-500 hover:text-red-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  {/* Add Type Form */}
                  <div className="flex items-center gap-2 bg-neutral-800/40 p-2.5 rounded-xl border border-neutral-700/50">
                    <input
                      type="color"
                      value={newTypeColor}
                      onChange={(e) => setNewTypeColor(e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                    />
                    <Input
                      placeholder="Nombre del nuevo tipo..."
                      value={newTypeName}
                      onChange={(e) => setNewTypeName(e.target.value)}
                      className="bg-neutral-800 border-neutral-700 text-xs h-8 flex-1"
                    />
                    <Button
                      size="sm"
                      onClick={handleAddCustomType}
                      disabled={!newTypeName.trim()}
                      className="h-8 text-xs gap-1 font-bold"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Añadir
                    </Button>
                  </div>
                </div>
              </div>

              <div className="px-5 py-3 border-t border-neutral-800 bg-neutral-900/50 flex justify-end">
                <Button onClick={() => setIsSettingsOpen(false)} size="sm" className="font-bold">
                  Listo
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Add Panel (sidebar) */}
        {isAddPanelOpen && (
          <div className="absolute top-0 right-0 bottom-0 w-80 bg-neutral-900/95 backdrop-blur-md border-l border-neutral-700 z-50 flex flex-col animate-in slide-in-from-right-10 duration-150">
            <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800">
              <div>
                <h3 className="text-sm font-bold text-white">Añadir Materia</h3>
                {activeSlot && (
                  <p className="text-[11px] text-neutral-400">
                    Semestre {activeSlot.semester}, Columna {activeSlot.column}
                  </p>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-neutral-400"
                onClick={() => {
                  setIsAddPanelOpen(false);
                  setActiveSlot(null);
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="px-4 py-2 border-b border-neutral-800">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                <Input
                  placeholder="Buscar materias..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-neutral-800 border-neutral-700 text-sm"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-2 py-2">
              {unusedMaterias.length === 0 ? (
                <div className="text-center py-8 text-neutral-500 text-sm">
                  <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p>No hay materias disponibles</p>
                </div>
              ) : (
                <div className="grid gap-1.5">
                  {unusedMaterias.map((materia) => (
                    <button
                      key={materia.id}
                      onClick={() => confirmAdd(materia)}
                      className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-neutral-800 transition-colors text-left w-full group cursor-pointer"
                    >
                      <div
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border"
                        style={{
                          borderColor: materia.color,
                          color: materia.color,
                        }}
                      >
                        <MateriaIcon name={materia.icono} className="size-4" style={{ color: materia.color }} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-white truncate group-hover:text-primary transition-colors">
                          {materia.nombre}
                        </p>
                        <p className="text-[10px] text-neutral-500 font-mono">
                          {materia.codigo}
                          {materia.profesorNombre && ` · ${materia.profesorNombre}`}
                        </p>
                      </div>
                      <Plus className="w-4 h-4 text-neutral-600 group-hover:text-primary transition-colors" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
