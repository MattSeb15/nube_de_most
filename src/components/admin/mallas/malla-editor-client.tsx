"use client";
import { useTheme } from "next-themes";

import React, { useCallback, useMemo, useState, useEffect } from "react";
import ReactFlow, {
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
import { SectionBackgroundNode } from "@/components/malla/nodes/section-background-node";
import { SectionBannerNode } from "@/components/malla/nodes/section-banner-node";
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
  FolderPlus,
  Layers,
  ArrowRight,
  ArrowUpRight,
} from "lucide-react";
import Link from "next/link";
import type {
  Malla,
  MallaMateria,
  MallaSection,
  Materia,
  TipoMateria,
  SubjectNodeData,
  MallaMetadata,
} from "@/types";

const cardWidth = 155;
const cardHeight = 165;
const spacingX = 35;
const spacingY = 50;
const startX = 110;
const sectionGap = 100;

const DEFAULT_TYPES = [
  { id: "basica", label: "Básica", color: "#f59e0b", textColor: "#451a03" },
  { id: "profesional", label: "Profesional", color: "#1e3a8a", textColor: "#ffffff" },
  { id: "integracion", label: "Integración", color: "#15803d", textColor: "#ffffff" },
  { id: "ninguno", label: "No asignado", color: "#e2e8f0", textColor: "#64748b" },
];

const BG_COLOR_PRESETS = [
  { label: "Pizarra Oscura", color: "rgba(15, 23, 42, 0.6)" },
  { label: "Índigo Profundo", color: "rgba(30, 27, 75, 0.6)" },
  { label: "Esmeralda", color: "rgba(6, 78, 59, 0.6)" },
  { label: "Carmesí", color: "rgba(76, 5, 25, 0.6)" },
  { label: "Ámbar", color: "rgba(69, 26, 3, 0.6)" },
  { label: "Carbón", color: "rgba(24, 24, 27, 0.6)" },
  { label: "Medianoche", color: "rgba(12, 74, 110, 0.6)" },
];

const SemesterLabelNode = ({ data }: any) => {
  const isLong = data.number && data.number.length > 3;
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-1.5 rounded-xl bg-card/60 backdrop-blur-md border border-border/50 shadow-sm pointer-events-none select-none text-center h-12 transition-all",
        isLong ? "w-24 px-2" : "w-14 px-1"
      )}
    >
      {data.prefix && (
        <span className="text-[9px] font-black opacity-50 uppercase tracking-widest leading-none text-muted-foreground truncate max-w-full">
          {data.prefix}
        </span>
      )}
      <span
        className={cn(
          "font-black leading-tight truncate max-w-full",
          isLong ? "text-[11px] text-primary/80" : "text-lg text-primary/50"
        )}
        title={data.number}
      >
        {data.number}
      </span>
    </div>
  );
};

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
  sectionBackground: SectionBackgroundNode,
  sectionBanner: SectionBannerNode,
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
  const [isMallaSettingsOpen, setIsMallaSettingsOpen] = useState(false);
  const [isNewSectionModalOpen, setIsNewSectionModalOpen] = useState(false);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);

  const [activeSlot, setActiveSlot] = useState<{
    sectionId: string;
    semester: number;
    column: number;
  } | null>(null);

  // Focus/highlight section state
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);

  // Metadata state (includes sections)
  const [metadata, setMetadata] = useState<MallaMetadata>(() => {
    const raw = malla.metadata || {};
    const defaultSections: MallaSection[] =
      raw.sections && raw.sections.length > 0
        ? raw.sections
        : [
            {
              id: "sec-default",
              nombre: malla.nombre || "Malla Principal",
              bgColor: "rgba(15, 23, 42, 0.5)",
              rowLabelFormat: raw.rowLabelFormat || "SEM ${num}",
              semesterLabels: {},
              columnLabels: raw.columnLabels || {},
              totalSemesters: 2,
              totalColumns: 4,
              order: 0,
              prerequisiteSectionIds: [],
            },
          ];

    return {
      rowLabelFormat: raw.rowLabelFormat || "SEM ${num}",
      columnLabels: raw.columnLabels || {},
      customTypes: raw.customTypes && raw.customTypes.length > 0 ? raw.customTypes : DEFAULT_TYPES,
      sections: defaultSections,
    };
  });

  const sections = useMemo(() => {
    const list = metadata.sections || [];
    return [...list].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, [metadata.sections]);

  const defaultSectionId = sections[0]?.id || "sec-default";

  // Working copy of malla subjects with sectionId
  const [subjects, setSubjects] = useState<
    {
      materiaId: string;
      sectionId: string;
      semester: number;
      mapColumn: number;
      tipoMateria: TipoMateria;
      prerequisites: string[];
      corequisites: string[];
      materia?: Materia;
    }[]
  >(() => {
    return initialMallaMaterias.map((mm) => ({
      materiaId: mm.materiaId,
      sectionId:
        mm.sectionId && mm.sectionId !== "default"
          ? mm.sectionId
          : defaultSectionId,
      semester: mm.semester,
      mapColumn: mm.mapColumn,
      tipoMateria: mm.tipoMateria,
      prerequisites: mm.prerequisites || [],
      corequisites: mm.corequisites || [],
      materia: mm.materia,
    }));
  });

  // Context Menu State
  const [contextMenu, setContextMenu] = useState<{
    nodeId: string;
    x: number;
    y: number;
  } | null>(null);

  // Custom type creation form state
  const [newTypeName, setNewTypeName] = useState("");
  const [newTypeColor, setNewTypeColor] = useState("#3b82f6");

  // New Section form state
  const [newSectionName, setNewSectionName] = useState("");
  const [newSectionBgColor, setNewSectionBgColor] = useState(BG_COLOR_PRESETS[0].color);
  const [newSectionRowFormat, setNewSectionRowFormat] = useState("SEM ${num}");
  const [newSectionPrereqs, setNewSectionPrereqs] = useState<string[]>([]);

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

  // Section bounds calculation for positioning and drag/drop
  const sectionBoundsMap = useMemo(() => {
    const map = new Map<
      string,
      {
        startY: number;
        bannerY: number;
        boxStartY: number;
        colLabelsY: number;
        gridStartY: number;
        totalHeight: number;
        boxHeight: number;
        boxWidth: number;
        maxSem: number;
        maxCol: number;
      }
    >();

    let currentY = 50;

    sections.forEach((sec) => {
      const secMaterias = subjects.filter((s) => s.sectionId === sec.id);
      const maxSubSem = secMaterias.length > 0 ? Math.max(...secMaterias.map((s) => s.semester)) : 1;
      const maxSubCol = secMaterias.length > 0 ? Math.max(...secMaterias.map((s) => s.mapColumn)) : 0;

      // In editor:
      // If sec.totalColumns is configured (e.g. 4), columns are 0..3 (count - 1 = 3).
      // If not configured, use maxSubCol.
      const configuredCol =
        sec.totalColumns !== undefined && sec.totalColumns > 0
          ? sec.totalColumns - 1
          : maxSubCol;
      const maxCol = Math.max(configuredCol, maxSubCol);
      const maxSem = Math.max(sec.totalSemesters || 1, maxSubSem);

      const bannerY = currentY;
      const boxStartY = bannerY + 54;
      const colLabelsY = boxStartY + 14;
      const gridStartY = boxStartY + 45;
      const boxHeight = 45 + maxSem * (cardHeight + spacingY) + 20;
      const boxWidth = startX + (maxCol + 1) * (cardWidth + spacingX) + 25;

      map.set(sec.id, {
        startY: bannerY,
        bannerY,
        boxStartY,
        colLabelsY,
        gridStartY,
        totalHeight: (boxStartY - bannerY) + boxHeight,
        boxHeight,
        boxWidth,
        maxSem,
        maxCol,
      });

      currentY = boxStartY + boxHeight + sectionGap;
    });

    return map;
  }, [sections, subjects]);

  // Available custom types
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

  // Open Add Materia panel for a slot
  const handleAdd = useCallback(
    (sectionId: string, semester: number, column: number) => {
      pushHistory();
      setActiveSlot({ sectionId, semester, column });
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
          sectionId: activeSlot.sectionId,
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

  // Move a subject to a different section
  const handleMoveSubjectToSection = useCallback(
    (materiaId: string, targetSectionId: string) => {
      pushHistory();
      setSubjects((prev) => {
        const targetSectionSubjects = prev.filter((s) => s.sectionId === targetSectionId);
        // Find next available column in semester 1
        const occupiedCols = new Set(
          targetSectionSubjects.filter((s) => s.semester === 1).map((s) => s.mapColumn)
        );
        let nextCol = 0;
        while (occupiedCols.has(nextCol)) {
          nextCol++;
        }

        return prev.map((s) => {
          if (s.materiaId === materiaId) {
            return {
              ...s,
              sectionId: targetSectionId,
              semester: 1,
              mapColumn: nextCol,
            };
          }
          return s;
        });
      });
      setContextMenu(null);
    },
    [pushHistory]
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

  // Section Banner Action Handlers
  const handleQuickAddSemester = useCallback(
    (sectionId: string) => {
      pushHistory();
      setMetadata((prev) => {
        const currentSections = prev.sections || [];
        return {
          ...prev,
          sections: currentSections.map((sec) => {
            if (sec.id === sectionId) {
              const currentSem = sec.totalSemesters || 1;
              return { ...sec, totalSemesters: currentSem + 1 };
            }
            return sec;
          }),
        };
      });
    },
    [pushHistory]
  );

  const handleQuickAddColumn = useCallback(
    (sectionId: string) => {
      pushHistory();
      setMetadata((prev) => {
        const currentSections = prev.sections || [];
        return {
          ...prev,
          sections: currentSections.map((sec) => {
            if (sec.id === sectionId) {
              const currentCols =
                sec.totalColumns !== undefined
                  ? sec.totalColumns
                  : (sectionBoundsMap.get(sectionId)?.maxCol ?? 0) + 1;
              return { ...sec, totalColumns: currentCols + 1 };
            }
            return sec;
          }),
        };
      });
    },
    [pushHistory, sectionBoundsMap]
  );

  const handleQuickChangeColor = useCallback(
    (sectionId: string, color: string) => {
      pushHistory();
      setMetadata((prev) => {
        const currentSections = prev.sections || [];
        return {
          ...prev,
          sections: currentSections.map((sec) =>
            sec.id === sectionId ? { ...sec, bgColor: color } : sec
          ),
        };
      });
    },
    [pushHistory]
  );

  const handleMoveSection = useCallback(
    (sectionId: string, direction: "up" | "down") => {
      pushHistory();
      setMetadata((prev) => {
        const currentSections = [...(prev.sections || [])].sort(
          (a, b) => (a.order ?? 0) - (b.order ?? 0)
        );
        const index = currentSections.findIndex((s) => s.id === sectionId);
        if (index === -1) return prev;

        const targetIndex = direction === "up" ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= currentSections.length) return prev;

        const temp = currentSections[index];
        currentSections[index] = currentSections[targetIndex];
        currentSections[targetIndex] = temp;

        return {
          ...prev,
          sections: currentSections.map((s, idx) => ({ ...s, order: idx })),
        };
      });
    },
    [pushHistory]
  );

  const handleDeleteSection = useCallback(
    (sectionId: string) => {
      if (sections.length <= 1) {
        alert("Debe existir al menos una sección en la malla.");
        return;
      }

      const count = subjects.filter((s) => s.sectionId === sectionId).length;
      if (count > 0) {
        const confirmDelete = confirm(
          `Esta sección contiene ${count} materias. Si la eliminas, sus materias se moverán a la sección principal. ¿Deseas continuar?`
        );
        if (!confirmDelete) return;
      }

      pushHistory();
      const remainingSections = sections.filter((s) => s.id !== sectionId);
      const fallbackSectionId = remainingSections[0].id;

      // Reassign subjects to fallback section
      setSubjects((prev) =>
        prev.map((s) => (s.sectionId === sectionId ? { ...s, sectionId: fallbackSectionId } : s))
      );

      setMetadata((prev) => ({
        ...prev,
        sections: remainingSections.map((s, idx) => ({
          ...s,
          order: idx,
          prerequisiteSectionIds: (s.prerequisiteSectionIds || []).filter((id) => id !== sectionId),
        })),
      }));

      if (editingSectionId === sectionId) setEditingSectionId(null);
    },
    [sections, subjects, pushHistory, editingSectionId]
  );

  // Create new section
  const handleCreateNewSection = () => {
    if (!newSectionName.trim()) return;
    pushHistory();

    const id = "sec-" + Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
    const newSection: MallaSection = {
      id,
      nombre: newSectionName.trim(),
      bgColor: newSectionBgColor,
      rowLabelFormat: newSectionRowFormat || "SEM ${num}",
      semesterLabels: {},
      columnLabels: {},
      totalSemesters: 1,
      totalColumns: 1,
      order: sections.length,
      prerequisiteSectionIds: newSectionPrereqs,
    };

    setMetadata((prev) => ({
      ...prev,
      sections: [...(prev.sections || []), newSection],
    }));

    setNewSectionName("");
    setNewSectionBgColor(BG_COLOR_PRESETS[0].color);
    setNewSectionPrereqs([]);
    setIsNewSectionModalOpen(false);
  };

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

  // Build nodes and edges
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  useEffect(() => {
    const activeSection = selectedSectionId
      ? sections.find((s) => s.id === selectedSectionId)
      : null;
    const prereqSectionIds = new Set<string>(activeSection?.prerequisiteSectionIds || []);

    const allNodes: Node[] = [];

    sections.forEach((sec, secIndex) => {
      const bounds = sectionBoundsMap.get(sec.id);
      if (!bounds) return;

      const secMaterias = subjects.filter((s) => s.sectionId === sec.id);
      const isSecHighlighted = selectedSectionId === sec.id;
      const isSecPrereq = selectedSectionId ? prereqSectionIds.has(sec.id) : false;

      const prereqNames = (sec.prerequisiteSectionIds || [])
        .map((id) => sections.find((s) => s.id === id)?.nombre)
        .filter(Boolean) as string[];

      // 1. Section Banner Node: Placed ABOVE the category box
      allNodes.push({
        id: `banner-${sec.id}`,
        type: "sectionBanner",
        position: { x: startX, y: bounds.bannerY },
        data: {
          sectionId: sec.id,
          nombre: sec.nombre,
          descripcion: sec.descripcion,
          bgColor: sec.bgColor,
          semestersCount: bounds.maxSem,
          materiasCount: secMaterias.length,
          prerequisiteSectionIds: sec.prerequisiteSectionIds,
          prerequisiteSectionNames: prereqNames,
          isHighlighted: isSecHighlighted,
          isDimmed: false,
          isPrerequisite: isSecPrereq,
          isEditor: true,
          canMoveUp: secIndex > 0,
          canMoveDown: secIndex < sections.length - 1,
          onEditSection: (id: string) => setEditingSectionId(id),
          onAddSemester: handleQuickAddSemester,
          onAddColumn: handleQuickAddColumn,
          onDeleteSection: handleDeleteSection,
          onMoveSectionUp: (id: string) => handleMoveSection(id, "up"),
          onMoveSectionDown: (id: string) => handleMoveSection(id, "down"),
          onChangeColor: handleQuickChangeColor,
          onSelectSection: (id: string) =>
            setSelectedSectionId((prev) => (prev === id ? null : id)),
        },
        draggable: false,
        selectable: false,
        zIndex: 25,
      });

      // 2. Section Background Node: Clickable sector representing the entire category
      allNodes.push({
        id: `bg-${sec.id}`,
        type: "sectionBackground",
        position: { x: 5, y: bounds.boxStartY },
        data: {
          sectionId: sec.id,
          width: bounds.boxWidth,
          height: bounds.boxHeight,
          bgColor: sec.bgColor || "rgba(15, 23, 42, 0.4)",
          borderColor: sec.borderColor,
          isHighlighted: isSecHighlighted,
          isDimmed: false,
          isPrerequisite: isSecPrereq,
          onSelectSection: (id: string) =>
            setSelectedSectionId((prev) => (prev === id ? null : id)),
        },
        draggable: false,
        selectable: true,
        zIndex: 0,
      });

      // 3. Column labels: Located inside the top of the box, unobstructed
      for (let col = 0; col <= bounds.maxCol; col++) {
        const label =
          sec.columnLabels?.[col] !== undefined
            ? sec.columnLabels[col]
            : metadata.columnLabels?.[col] !== undefined
            ? metadata.columnLabels[col]
            : String(col);

        allNodes.push({
          id: `col-label-${sec.id}-${col}`,
          type: "columnLabel",
          position: {
            x: startX + col * (cardWidth + spacingX) + cardWidth / 2 - 20,
            y: bounds.colLabelsY,
          },
          data: { label },
          draggable: false,
          selectable: false,
          zIndex: 5,
        });
      }

      // 4. Semester labels
      const rowFormat = sec.rowLabelFormat || metadata.rowLabelFormat || "SEM ${num}";
      for (let sem = 1; sem <= bounds.maxSem; sem++) {
        let prefix = "SEM";
        let numStr = String(sem);

        if (sec.semesterLabels?.[sem]) {
          prefix = "";
          numStr = sec.semesterLabels[sem];
        } else if (rowFormat.includes("${num}")) {
          prefix = rowFormat.split("${num}")[0].trim() || "SEM";
        }

        allNodes.push({
          id: `sem-label-${sec.id}-${sem}`,
          type: "semesterLabel",
          position: {
            x: 10,
            y: bounds.gridStartY + (sem - 1) * (cardHeight + spacingY) + cardHeight / 2 - 24,
          },
          data: { prefix, number: numStr },
          draggable: false,
          selectable: false,
          zIndex: 5,
        });
      }

      // 5. Subject Nodes in this section
      secMaterias.forEach((s) => {
        allNodes.push({
          id: s.materiaId,
          type: "subject",
          position: {
            x: startX + s.mapColumn * (cardWidth + spacingX),
            y: bounds.gridStartY + (s.semester - 1) * (cardHeight + spacingY),
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
            sectionId: sec.id,
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
            carreraSlug: "",
          } satisfies SubjectNodeData,
          zIndex: 20,
        });
      });

      // 6. Placeholder nodes for empty slots
      for (let sem = 1; sem <= bounds.maxSem; sem++) {
        for (let col = 0; col <= bounds.maxCol; col++) {
          const occupied = secMaterias.some((s) => s.semester === sem && s.mapColumn === col);
          if (!occupied) {
            allNodes.push({
              id: `placeholder-${sec.id}-${sem}-${col}`,
              type: "placeholder",
              position: {
                x: startX + col * (cardWidth + spacingX),
                y: bounds.gridStartY + (sem - 1) * (cardHeight + spacingY),
              },
              draggable: false,
              data: {
                semester: sem,
                column: col,
                onAdd: () => handleAdd(sec.id, sem, col),
                onRemoveSpace: () => {},
                canDelete: false,
              },
              zIndex: 2,
            });
          }
        }
      }
    });

    setNodes(allNodes);

    // Build Edges: 1. Section prerequisite edges
    const newEdges: Edge[] = [];
    sections.forEach((sec) => {
      (sec.prerequisiteSectionIds || []).forEach((prereqSecId) => {
        const prereqSec = sections.find((s) => s.id === prereqSecId);
        if (prereqSec) {
          const isHighlighted = selectedSectionId === sec.id || selectedSectionId === prereqSec.id;
          newEdges.push({
            id: `edge-sec-prereq-${prereqSec.id}-${sec.id}`,
            source: `bg-${prereqSec.id}`,
            target: `banner-${sec.id}`,
            sourceHandle: "section-bottom-source",
            targetHandle: "section-banner-target",
            type: "smoothstep",
            animated: isHighlighted,
            style: {
              stroke: "#f59e0b",
              strokeWidth: isHighlighted ? 3.5 : 2.5,
              strokeDasharray: isHighlighted ? undefined : "6,6",
              opacity: 0.9,
            },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: "#f59e0b",
              width: 20,
              height: 20,
            },
            label: `Requiere ${prereqSec.nombre}`,
            labelStyle: { fill: "#fbbf24", fontWeight: 800, fontSize: 11 },
            labelBgStyle: {
              fill: "#18181b",
              fillOpacity: 0.95,
              stroke: "#f59e0b",
              strokeWidth: 1.5,
              rx: 8,
              ry: 8,
            },
            labelBgPadding: [8, 4],
            zIndex: 15,
          });
        }
      });
    });

    // 2. Subject edges
    const addedCoreqPairs = new Set<string>();

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
            style: { stroke: "#94a3b8", strokeWidth: 2, opacity: 0.85 },
            markerEnd: { type: MarkerType.ArrowClosed, color: "#94a3b8" },
            reconnectable: true,
            zIndex: 10,
          });
        }
      });

      // Corequisites
      (s.corequisites || []).forEach((coreqCode) => {
        const other = subjects.find((ss) => ss.materia?.codigo === coreqCode);
        if (other) {
          const pairKey = [s.materiaId, other.materiaId].sort().join("---");
          if (!addedCoreqPairs.has(pairKey)) {
            addedCoreqPairs.add(pairKey);

            const isOtherOnLeft = (other.mapColumn ?? 0) <= (s.mapColumn ?? 0);
            const sourceId = isOtherOnLeft ? other.materiaId : s.materiaId;
            const targetId = isOtherOnLeft ? s.materiaId : other.materiaId;
            newEdges.push({
              id: `edge-coreq-${sourceId}-${targetId}`,
              source: sourceId,
              target: targetId,
              sourceHandle: "right-source",
              targetHandle: "left-target",
              type: "removable",
              animated: false,
              style: { stroke: "#f59e0b", strokeWidth: 2, strokeDasharray: "5,5", opacity: 0.85 },
              markerStart: {
                type: MarkerType.ArrowClosed,
                color: "#f59e0b",
                orient: "auto-start-reverse",
              },
              markerEnd: { type: MarkerType.ArrowClosed, color: "#f59e0b" },
              reconnectable: true,
              zIndex: 10,
            });
          }
        }
      });
    });

    setEdges(newEdges);
  }, [
    sections,
    subjects,
    sectionBoundsMap,
    metadata,
    customTypeMap,
    selectedSectionId,
    handleAdd,
    handleQuickAddSemester,
    handleQuickAddColumn,
    handleDeleteSection,
    handleMoveSection,
    handleQuickChangeColor,
  ]);

  // Handle node drag stop: snap to section and grid
  const onNodeDragStop = useCallback(
    (_event: any, node: Node) => {
      if (node.type !== "subject") return;

      // Detect target section by Y position
      let targetSecId = node.data.sectionId || defaultSectionId;
      let targetBounds = sectionBoundsMap.get(targetSecId);

      for (const sec of sections) {
        const bounds = sectionBoundsMap.get(sec.id);
        if (!bounds) continue;
        if (
          node.position.y >= bounds.boxStartY - 25 &&
          node.position.y <= bounds.boxStartY + bounds.boxHeight
        ) {
          targetSecId = sec.id;
          targetBounds = bounds;
          break;
        }
      }

      if (!targetBounds) targetBounds = sectionBoundsMap.get(defaultSectionId)!;

      const col = Math.max(0, Math.round((node.position.x - startX) / (cardWidth + spacingX)));
      const sem = Math.max(
        1,
        Math.round((node.position.y - targetBounds.gridStartY) / (cardHeight + spacingY)) + 1
      );

      const originalSectionId = node.data.sectionId;
      const originalColumn = node.data.column;
      const originalSemester = node.data.semester;

      const changed =
        originalSectionId !== targetSecId ||
        originalColumn !== col ||
        originalSemester !== sem;

      if (!changed) {
        // Snap back to slot
        setNodes((nds) =>
          nds.map((n) => {
            if (n.id === node.id) {
              return {
                ...n,
                position: {
                  x: startX + originalColumn * (cardWidth + spacingX),
                  y: targetBounds!.gridStartY + (originalSemester - 1) * (cardHeight + spacingY),
                },
              };
            }
            return n;
          })
        );
        return;
      }

      pushHistory();

      setSubjects((prev) => {
        const targetNode = prev.find(
          (mm) =>
            mm.materiaId !== node.id &&
            mm.sectionId === targetSecId &&
            mm.semester === sem &&
            (mm.mapColumn ?? 0) === col
        );

        const isSwap = targetNode !== undefined;

        return prev.map((s) => {
          if (s.materiaId === node.id) {
            return { ...s, sectionId: targetSecId, semester: sem, mapColumn: col };
          }
          if (isSwap && s.materiaId === targetNode?.materiaId) {
            return {
              ...s,
              sectionId: originalSectionId,
              semester: originalSemester,
              mapColumn: originalColumn,
            };
          }
          return s;
        });
      });
    },
    [pushHistory, setNodes, sections, sectionBoundsMap, defaultSectionId]
  );

  // Connection validation
  const isValidConnection = useCallback((connection: Connection): boolean => {
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
  }, []);

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
    [subjects, pushHistory]
  );

  const edgeReconnectSuccessful = React.useRef(true);
  const onReconnectStart = React.useCallback(() => {
    edgeReconnectSuccessful.current = false;
  }, []);
  const onReconnect = React.useCallback(
    (oldEdge: any, newConnection: any) => {
      edgeReconnectSuccessful.current = true;
      pushHistory();

      const isOldCoreq = oldEdge.id?.includes("coreq");
      const oldSource = subjects.find((s) => s.materiaId === oldEdge.source);
      const oldTarget = subjects.find((s) => s.materiaId === oldEdge.target);

      const newSource = subjects.find((s) => s.materiaId === newConnection.source);
      const newTarget = subjects.find((s) => s.materiaId === newConnection.target);

      const isNewCoreq =
        newConnection.sourceHandle?.includes("left") ||
        newConnection.sourceHandle?.includes("right") ||
        newConnection.targetHandle?.includes("left") ||
        newConnection.targetHandle?.includes("right");

      setSubjects((prev) =>
        prev.map((s) => {
          let updated = { ...s };

          // 1. Remove old edge relationship
          if (oldSource?.materia && oldTarget?.materia) {
            if (s.materiaId === oldEdge.target) {
              if (isOldCoreq) {
                updated.corequisites = (updated.corequisites || []).filter(
                  (c) => c !== oldSource.materia!.codigo
                );
              } else {
                updated.prerequisites = (updated.prerequisites || []).filter(
                  (p) => p !== oldSource.materia!.codigo
                );
              }
            }
            if (isOldCoreq && s.materiaId === oldEdge.source) {
              updated.corequisites = (updated.corequisites || []).filter(
                (c) => c !== oldTarget.materia!.codigo
              );
            }
          }

          // 2. Add new edge connection
          if (newSource?.materia && newTarget?.materia) {
            if (s.materiaId === newConnection.target) {
              if (isNewCoreq) {
                const current = updated.corequisites || [];
                if (!current.includes(newSource.materia!.codigo)) {
                  updated.corequisites = [...current, newSource.materia!.codigo];
                }
              } else {
                const current = updated.prerequisites || [];
                if (!current.includes(newSource.materia!.codigo)) {
                  updated.prerequisites = [...current, newSource.materia!.codigo];
                }
              }
            }
            if (isNewCoreq && s.materiaId === newConnection.source) {
              const current = updated.corequisites || [];
              if (!current.includes(newTarget.materia!.codigo)) {
                updated.corequisites = [...current, newTarget.materia!.codigo];
              }
            }
          }

          return updated;
        })
      );
    },
    [subjects, pushHistory]
  );

  const onReconnectEnd = React.useCallback(
    (_: any, edge: any) => {
      if (!edgeReconnectSuccessful.current && edge) {
        pushHistory();
        setEdges((eds) => eds.filter((e) => e.id !== edge.id));
        const isCoreq = edge.id?.includes("coreq");
        const sourceSubject = subjects.find((s) => s.materiaId === edge.source);
        const targetSubject = subjects.find((s) => s.materiaId === edge.target);

        if (sourceSubject?.materia && targetSubject?.materia) {
          setSubjects((prev) =>
            prev.map((s) => {
              if (s.materiaId === edge.target) {
                return {
                  ...s,
                  prerequisites: isCoreq
                    ? s.prerequisites
                    : (s.prerequisites || []).filter((p) => p !== sourceSubject.materia!.codigo),
                  corequisites: isCoreq
                    ? (s.corequisites || []).filter((c) => c !== sourceSubject.materia!.codigo)
                    : s.corequisites,
                };
              }
              if (isCoreq && s.materiaId === edge.source) {
                return {
                  ...s,
                  corequisites: (s.corequisites || []).filter((c) => c !== targetSubject.materia!.codigo),
                };
              }
              return s;
            })
          );
        }
      }
      edgeReconnectSuccessful.current = true;
    },
    [setEdges, subjects, pushHistory]
  );

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

      // 2. Insert new subjects with section_id
      if (subjects.length > 0) {
        const rows = subjects.map((s) => ({
          malla_id: malla.id,
          materia_id: s.materiaId,
          section_id: s.sectionId || "default",
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

  const activeEditingSection = useMemo(() => {
    if (!editingSectionId) return null;
    return sections.find((s) => s.id === editingSectionId) || null;
  }, [editingSectionId, sections]);

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
          <Badge className="text-[10px] bg-sky-950 text-sky-400 border-sky-800 flex items-center gap-1">
            <Layers className="w-3 h-3" />
            {sections.length} {sections.length === 1 ? "sección" : "secciones"}
          </Badge>
          <Badge className="text-[10px] bg-neutral-800 text-neutral-400 border-neutral-700">
            {subjects.length} materias
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          {/* Add Section Button */}
          <Button
            size="sm"
            onClick={() => setIsNewSectionModalOpen(true)}
            className="gap-1.5 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/40 font-bold"
          >
            <FolderPlus className="w-4 h-4" />
            Nueva Sección
          </Button>

          {/* Malla Global Settings */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsMallaSettingsOpen(true)}
            className="gap-1.5 bg-neutral-900 border-neutral-700 text-neutral-300 hover:text-white"
          >
            <Sliders className="w-4 h-4" />
            Configurar Malla
          </Button>

          {/* Undo */}
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

          {/* Save */}
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
            {saveStatus === "saved"
              ? "¡Guardado!"
              : saveStatus === "error"
              ? "Error al Guardar"
              : "Guardar"}
          </Button>
        </div>
      </header>

      {/* Editor Canvas */}
      <div className="flex-1 relative [&_.react-flow\_\_node-sectionBackground]:z-[0]! [&_.react-flow\_\_edges]:z-[10]! [&_.react-flow\_\_node-subject]:z-[20]! [&_.react-flow\_\_node-sectionBanner]:z-[25]! [&_.react-flow\_\_edgeupdater]:pointer-events-auto! [&_.react-flow\_\_edgeupdater]:cursor-grab! [&_.react-flow\_\_edgeupdater:hover]:cursor-grabbing! [&_.react-flow\_\_edgeupdater:hover]:stroke-amber-500! [&_.react-flow\_\_edgeupdater:hover]:fill-amber-500/30!">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          isValidConnection={isValidConnection}
          onNodeDragStop={onNodeDragStop}
          onNodeContextMenu={handleNodeContextMenu}
          onNodeClick={(_event, node) => {
            if (node.type === "sectionBackground" || node.type === "sectionBanner") {
              const targetSecId = node.data.sectionId;
              if (targetSecId) {
                setSelectedSectionId((prev) => (prev === targetSecId ? null : targetSecId));
              }
            }
          }}
          onPaneClick={() => {
            setContextMenu(null);
            setSelectedSectionId(null);
          }}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          fitViewOptions={{ padding: 0.15 }}
          nodesDraggable={true}
          nodesConnectable={true}
          elementsSelectable={true}
          edgesUpdatable={true}
          reconnectRadius={25}
          zoomOnScroll={true}
          panOnDrag={true}
          preventScrolling={true}
          zoomOnPinch={true}
          maxZoom={3}
          minZoom={0.05}
          onReconnect={onReconnect}
          onReconnectStart={onReconnectStart}
          onReconnectEnd={onReconnectEnd}
          defaultEdgeOptions={{
            type: "removable",
            style: { strokeWidth: 2, stroke: "#94a3b8" },
            reconnectable: true,
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
                        prerequisites: isCoreq
                          ? s.prerequisites
                          : (s.prerequisites || []).filter((p) => p !== sourceSubject.materia!.codigo),
                        corequisites: isCoreq
                          ? (s.corequisites || []).filter((c) => c !== sourceSubject.materia!.codigo)
                          : s.corequisites,
                      };
                    }
                    if (isCoreq && s.materiaId === edge.source) {
                      return {
                        ...s,
                        corequisites: (s.corequisites || []).filter((c) => c !== targetSubject.materia!.codigo),
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
              maskColor={resolvedTheme === "dark" ? "rgba(0,0,0,0.5)" : "rgba(255,255,255,0.5)"}
              nodeColor={(node) => {
                if (node.type === "sectionBackground") return "rgba(255,255,255,0.03)";
                if (node.type !== "subject") return "transparent";
                const { type } = node.data;
                if (type === "basica") return "#f59e0b";
                if (type === "profesional") return "#3b82f6";
                if (type === "integracion") return "#16a34a";
                return "#94a3b8";
              }}
            />
          )}
        </ReactFlow>

        {/* Right-Click Context Menu on Subject */}
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
              className="fixed z-[101] w-[240px] bg-neutral-900/95 backdrop-blur-xl border border-neutral-700/80 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100"
              style={{ left: contextMenu.x, top: contextMenu.y }}
            >
              {/* Header */}
              <div className="px-3 pt-2.5 pb-2 border-b border-neutral-800 bg-neutral-800/40">
                <p className="text-[9px] font-black uppercase tracking-widest text-neutral-400">
                  Materia
                </p>
                <p className="text-xs font-bold text-white truncate">
                  {ctxSubject.materia?.nombre || "Sin nombre"}
                </p>
                <p className="text-[10px] font-mono text-neutral-400">
                  {ctxSubject.materia?.codigo || "---"}
                </p>
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

              {/* Move to another section */}
              {sections.length > 1 && (
                <>
                  <div className="h-px bg-neutral-800 mx-2" />
                  <div className="py-1">
                    <div className="px-3 py-1">
                      <p className="text-[8px] font-black uppercase tracking-widest text-neutral-500">
                        Mover a Sección
                      </p>
                    </div>
                    {sections.map((s) => {
                      const isCurrent = ctxSubject.sectionId === s.id;
                      return (
                        <button
                          key={s.id}
                          disabled={isCurrent}
                          onClick={() => handleMoveSubjectToSection(ctxSubject.materiaId, s.id)}
                          className={cn(
                            "w-full flex items-center justify-between px-3 py-1.5 text-left text-xs transition-colors cursor-pointer",
                            isCurrent
                              ? "text-neutral-500 cursor-not-allowed bg-neutral-800/30"
                              : "text-neutral-300 hover:bg-neutral-800"
                          )}
                        >
                          <span className="truncate">{s.nombre}</span>
                          {isCurrent && <Check className="w-3.5 h-3.5 text-primary" />}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}

              <div className="h-px bg-neutral-800 mx-2" />

              {/* Tipo de Materia Selection */}
              <div className="py-1">
                <div className="px-3 py-1">
                  <p className="text-[8px] font-black uppercase tracking-widest text-neutral-500">
                    Tipo de Materia
                  </p>
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
                      <span
                        className="text-xs font-medium flex-1 truncate"
                        style={{ color: isActive ? opt.color : "#d4d4d4" }}
                      >
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

        {/* Modal: New Section */}
        {isNewSectionModalOpen && (
          <div className="fixed inset-0 z-[120] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-neutral-900 border border-neutral-700 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800">
                <div className="flex items-center gap-2">
                  <FolderPlus className="w-5 h-5 text-primary" />
                  <h3 className="text-base font-bold text-white">Nueva Sección en la Malla</h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-neutral-400"
                  onClick={() => setIsNewSectionModalOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="p-5 space-y-5">
                {/* Name */}
                <div>
                  <label className="text-xs font-bold text-neutral-300 block mb-1.5 uppercase tracking-wider">
                    Nombre de la Sección
                  </label>
                  <Input
                    placeholder="Ej. Nivelación, Materias de Carrera, Tronco Común..."
                    value={newSectionName}
                    onChange={(e) => setNewSectionName(e.target.value)}
                    className="bg-neutral-800 border-neutral-700 text-sm"
                    autoFocus
                  />
                  {/* Suggestion Chips */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {["Nivelación", "Materias de Carrera", "Tronco Común", "Especialidad", "Optativas"].map(
                      (name) => (
                        <button
                          key={name}
                          type="button"
                          onClick={() => setNewSectionName(name)}
                          className="px-2 py-0.5 rounded-full text-[11px] bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-300 transition-colors cursor-pointer"
                        >
                          {name}
                        </button>
                      )
                    )}
                  </div>
                </div>

                {/* Color Background Preset */}
                <div>
                  <label className="text-xs font-bold text-neutral-300 block mb-1.5 uppercase tracking-wider">
                    Color de Fondo (Contenedor Visual)
                  </label>
                  <div className="grid grid-cols-4 gap-2 mb-2">
                    {BG_COLOR_PRESETS.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => setNewSectionBgColor(preset.color)}
                        className={cn(
                          "flex flex-col items-center gap-1 p-2 rounded-xl border text-center transition-all cursor-pointer",
                          newSectionBgColor === preset.color
                            ? "border-primary ring-2 ring-primary/40 bg-neutral-800"
                            : "border-neutral-700 hover:border-neutral-500 bg-neutral-800/50"
                        )}
                      >
                        <div
                          className="w-5 h-5 rounded-full border border-white/20"
                          style={{ backgroundColor: preset.color }}
                        />
                        <span className="text-[10px] text-neutral-300 truncate w-full">
                          {preset.label}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Custom color input */}
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="color"
                      value={newSectionBgColor.startsWith("#") ? newSectionBgColor.slice(0, 7) : "#0f172a"}
                      onChange={(e) => setNewSectionBgColor(e.target.value)}
                      className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                    />
                    <span className="text-xs text-neutral-400">Color personalizado</span>
                  </div>
                </div>

                {/* Prerequisite sections */}
                {sections.length > 0 && (
                  <div>
                    <label className="text-xs font-bold text-neutral-300 block mb-1.5 uppercase tracking-wider">
                      Sección(es) Requisito Previo
                    </label>
                    <p className="text-[11px] text-neutral-400 mb-2">
                      Selecciona si esta sección requiere haber completado otra sección antes.
                    </p>
                    <div className="space-y-1.5 max-h-32 overflow-y-auto">
                      {sections.map((s) => {
                        const isChecked = newSectionPrereqs.includes(s.id);
                        return (
                          <label
                            key={s.id}
                            className={cn(
                              "flex items-center gap-2 px-3 py-2 rounded-lg border text-xs cursor-pointer transition-colors",
                              isChecked
                                ? "bg-amber-500/10 border-amber-500/40 text-amber-300"
                                : "bg-neutral-800/40 border-neutral-700/60 text-neutral-300 hover:bg-neutral-800"
                            )}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setNewSectionPrereqs((prev) => [...prev, s.id]);
                                } else {
                                  setNewSectionPrereqs((prev) => prev.filter((id) => id !== s.id));
                                }
                              }}
                              className="rounded border-neutral-600 text-amber-500 focus:ring-amber-500"
                            />
                            <span className="font-semibold">{s.nombre}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Row format */}
                <div>
                  <label className="text-xs font-bold text-neutral-300 block mb-1.5 uppercase tracking-wider">
                    Formato de Semestres (Filas)
                  </label>
                  <Input
                    placeholder="Ej. SEM ${num} o NIV ${num}"
                    value={newSectionRowFormat}
                    onChange={(e) => setNewSectionRowFormat(e.target.value)}
                    className="bg-neutral-800 border-neutral-700 text-sm"
                  />
                </div>
              </div>

              <div className="px-5 py-3 border-t border-neutral-800 bg-neutral-900/50 flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsNewSectionModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  onClick={handleCreateNewSection}
                  disabled={!newSectionName.trim()}
                  className="font-bold gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  Crear Sección
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Edit Section Settings */}
        {editingSectionId && activeEditingSection && (
          <div className="fixed inset-0 z-[120] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-neutral-900 border border-neutral-700 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[85vh] flex flex-col">
              <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800 shrink-0">
                <div className="flex items-center gap-2">
                  <Settings2 className="w-5 h-5 text-primary" />
                  <h3 className="text-base font-bold text-white">
                    Configurar Sección: {activeEditingSection.nombre}
                  </h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-neutral-400"
                  onClick={() => setEditingSectionId(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="p-5 space-y-5 overflow-y-auto flex-1">
                {/* Rename */}
                <div>
                  <label className="text-xs font-bold text-neutral-300 block mb-1.5 uppercase tracking-wider">
                    Nombre de la Sección
                  </label>
                  <Input
                    value={activeEditingSection.nombre}
                    onChange={(e) => {
                      pushHistory();
                      const val = e.target.value;
                      setMetadata((m) => ({
                        ...m,
                        sections: (m.sections || []).map((s) =>
                          s.id === editingSectionId ? { ...s, nombre: val } : s
                        ),
                      }));
                    }}
                    className="bg-neutral-800 border-neutral-700 text-sm"
                  />
                </div>

                {/* Color Selector */}
                <div>
                  <label className="text-xs font-bold text-neutral-300 block mb-1.5 uppercase tracking-wider">
                    Color de Fondo
                  </label>
                  <div className="grid grid-cols-4 gap-2 mb-2">
                    {BG_COLOR_PRESETS.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => {
                          pushHistory();
                          setMetadata((m) => ({
                            ...m,
                            sections: (m.sections || []).map((s) =>
                              s.id === editingSectionId ? { ...s, bgColor: preset.color } : s
                            ),
                          }));
                        }}
                        className={cn(
                          "flex flex-col items-center gap-1 p-2 rounded-xl border text-center transition-all cursor-pointer",
                          activeEditingSection.bgColor === preset.color
                            ? "border-primary ring-2 ring-primary/40 bg-neutral-800"
                            : "border-neutral-700 hover:border-neutral-500 bg-neutral-800/50"
                        )}
                      >
                        <div
                          className="w-5 h-5 rounded-full border border-white/20"
                          style={{ backgroundColor: preset.color }}
                        />
                        <span className="text-[10px] text-neutral-300 truncate w-full">
                          {preset.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Prerequisite Sections */}
                <div>
                  <label className="text-xs font-bold text-neutral-300 block mb-1.5 uppercase tracking-wider">
                    Requisitos de Sección (Secciones Previas)
                  </label>
                  <p className="text-[11px] text-neutral-400 mb-2">
                    Marca qué secciones deben completarse antes de cursar esta sección.
                  </p>
                  <div className="space-y-1.5">
                    {sections
                      .filter((s) => s.id !== editingSectionId)
                      .map((s) => {
                        const currentPrereqs = activeEditingSection.prerequisiteSectionIds || [];
                        const isChecked = currentPrereqs.includes(s.id);
                        return (
                          <label
                            key={s.id}
                            className={cn(
                              "flex items-center justify-between px-3 py-2 rounded-lg border text-xs cursor-pointer transition-colors",
                              isChecked
                                ? "bg-amber-500/10 border-amber-500/40 text-amber-300"
                                : "bg-neutral-800/40 border-neutral-700/60 text-neutral-300 hover:bg-neutral-800"
                            )}
                          >
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => {
                                  pushHistory();
                                  const updated = e.target.checked
                                    ? [...currentPrereqs, s.id]
                                    : currentPrereqs.filter((id) => id !== s.id);
                                  setMetadata((m) => ({
                                    ...m,
                                    sections: (m.sections || []).map((sec) =>
                                      sec.id === editingSectionId
                                        ? { ...sec, prerequisiteSectionIds: updated }
                                        : sec
                                    ),
                                  }));
                                }}
                                className="rounded border-neutral-600 text-amber-500 focus:ring-amber-500"
                              />
                              <span className="font-semibold">{s.nombre}</span>
                            </div>
                            {isChecked && (
                              <span className="text-[10px] uppercase font-bold text-amber-400">
                                Requisito Activo
                              </span>
                            )}
                          </label>
                        );
                      })}
                    {sections.length <= 1 && (
                      <p className="text-xs text-neutral-500 italic">
                        No hay otras secciones para asignar como requisito. Crea otra sección primero.
                      </p>
                    )}
                  </div>
                </div>

                {/* Independent Semester Names and Numbers */}
                <div className="border-t border-neutral-800 pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                      Semestres y Etiquetas de Esta Sección
                    </label>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleQuickAddSemester(activeEditingSection.id)}
                      className="h-7 text-xs gap-1 bg-neutral-800 border-neutral-700"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Añadir Semestre
                    </Button>
                  </div>
                  <p className="text-[11px] text-neutral-400 mb-3">
                    Modifica los números y nombres de los semestres de esta sección de manera
                    independiente.
                  </p>

                  <div className="space-y-2">
                    {Array.from({ length: activeEditingSection.totalSemesters || 1 }).map((_, i) => {
                      const semNum = i + 1;
                      const customVal = activeEditingSection.semesterLabels?.[semNum] || "";
                      return (
                        <div
                          key={semNum}
                          className="flex items-center gap-2 p-2 rounded-lg bg-neutral-800/40 border border-neutral-700/50"
                        >
                          <span className="text-xs font-mono text-neutral-400 w-16">
                            Fila {semNum}:
                          </span>
                          <Input
                            placeholder={`Etiqueta (ej. Nivelación, SEM ${semNum})`}
                            value={customVal}
                            onChange={(e) => {
                              pushHistory();
                              const val = e.target.value;
                              setMetadata((m) => ({
                                ...m,
                                sections: (m.sections || []).map((sec) =>
                                  sec.id === editingSectionId
                                    ? {
                                        ...sec,
                                        semesterLabels: {
                                          ...(sec.semesterLabels || {}),
                                          [semNum]: val,
                                        },
                                      }
                                    : sec
                                ),
                              }));
                            }}
                            className="bg-neutral-800 border-neutral-700 text-xs h-8 flex-1"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Delete Section */}
                <div className="border-t border-neutral-800 pt-4">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteSection(activeEditingSection.id)}
                    className="w-full gap-1.5 font-semibold"
                  >
                    <Trash2 className="w-4 h-4" />
                    Eliminar Sección
                  </Button>
                </div>
              </div>

              <div className="px-5 py-3 border-t border-neutral-800 bg-neutral-900/50 flex justify-end shrink-0">
                <Button onClick={() => setEditingSectionId(null)} size="sm" className="font-bold">
                  Listo
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Modal: Global Malla Settings */}
        {isMallaSettingsOpen && (
          <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-lg bg-neutral-900 border border-neutral-700 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[85vh] flex flex-col">
              <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800 shrink-0">
                <div className="flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-primary" />
                  <h3 className="text-base font-bold text-white">Configuración Global de la Malla</h3>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-neutral-400"
                  onClick={() => setIsMallaSettingsOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="p-5 space-y-6 overflow-y-auto flex-1">
                {/* Global Row Format */}
                <div>
                  <label className="text-xs font-bold text-neutral-300 block mb-1.5 uppercase tracking-wider">
                    Formato de Filas por Defecto
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
                    Usa <code className="text-primary font-mono font-bold">{"${num}"}</code> para el número de semestre.
                  </p>
                </div>

                {/* Custom Types Manager */}
                <div className="border-t border-neutral-800 pt-5">
                  <div className="flex items-center gap-1.5 mb-3">
                    <Palette className="w-4 h-4 text-primary" />
                    <label className="text-xs font-bold text-neutral-300 uppercase tracking-wider">
                      Tipos de Materias (Categorías)
                    </label>
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

              <div className="px-5 py-3 border-t border-neutral-800 bg-neutral-900/50 flex justify-end shrink-0">
                <Button onClick={() => setIsMallaSettingsOpen(false)} size="sm" className="font-bold">
                  Listo
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Add Panel (Sidebar to pick materia) */}
        {isAddPanelOpen && (
          <div className="absolute top-0 right-0 bottom-0 w-80 bg-neutral-900/95 backdrop-blur-md border-l border-neutral-700 z-50 flex flex-col animate-in slide-in-from-right-10 duration-150">
            <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800">
              <div>
                <h3 className="text-sm font-bold text-white">Añadir Materia</h3>
                {activeSlot && (
                  <p className="text-[11px] text-neutral-400">
                    {sections.find((s) => s.id === activeSlot.sectionId)?.nombre} · Semestre{" "}
                    {activeSlot.semester}, Columna {activeSlot.column}
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
