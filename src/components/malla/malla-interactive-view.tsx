"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Edge,
  Node,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import { Malla, MallaMateria, MallaSection, SubjectNodeData } from '@/types';
import { SubjectNode } from './nodes/subject-node';
import { SectionBackgroundNode } from './nodes/section-background-node';
import { SectionBannerNode } from './nodes/section-banner-node';
import { Search } from 'lucide-react';

interface MallaInteractiveViewProps {
  mallaMaterias: MallaMateria[];
  malla?: Malla | any;
  semestreSlug?: string;
  carreraSlug?: string;
  focusSemester?: number;
  className?: string;
}

const cardWidth = 155;
const cardHeight = 165;
const spacingX = 35;
const spacingY = 50;
const startX = 110;
const sectionGap = 100;

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

const ColumnLabelNode = ({ data }: any) => {
  return (
    <div className="flex items-center justify-center p-1.5 rounded-lg bg-card/30 backdrop-blur-md border border-border/30 shadow-none w-10 h-7 pointer-events-none select-none">
      <span className="text-xs font-black text-primary/50 leading-none">{data.label}</span>
    </div>
  );
};

const nodeTypes = {
  subject: SubjectNode,
  semesterLabel: SemesterLabelNode,
  columnLabel: ColumnLabelNode,
  sectionBackground: SectionBackgroundNode,
  sectionBanner: SectionBannerNode,
};

const EMPTY_METADATA = {};
const EMPTY_COLUMN_LABELS = {};
const EMPTY_CUSTOM_TYPES: any[] = [];

function MallaInteractiveViewContent({
  mallaMaterias,
  malla,
  semestreSlug = "nivelacion",
  carreraSlug = "software",
  focusSemester,
  className,
}: MallaInteractiveViewProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const [searchText, setSearchText] = useState('');
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);

  const metadata = malla?.metadata || EMPTY_METADATA;
  const globalRowFormat = metadata.rowLabelFormat || "SEM ${num}";
  const globalColumnLabels = metadata.columnLabels || EMPTY_COLUMN_LABELS;
  const customTypes = metadata.customTypes || EMPTY_CUSTOM_TYPES;

  const customTypeMap = useMemo(() => {
    const map = new Map<string, { label: string; color: string; textColor?: string }>();
    customTypes.forEach((t: any) => {
      map.set(t.id, t);
    });
    return map;
  }, [customTypes]);

  // Normalized sections
  const activeSections: MallaSection[] = useMemo(() => {
    if (metadata.sections && metadata.sections.length > 0) {
      return [...metadata.sections].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    }
    return [
      {
        id: "default",
        nombre: malla?.nombre || "Malla Curricular",
        bgColor: "rgba(15, 23, 42, 0.5)",
        rowLabelFormat: globalRowFormat,
        columnLabels: globalColumnLabels,
      },
    ];
  }, [metadata.sections, malla?.nombre, globalRowFormat, globalColumnLabels]);

  const sectionMap = useMemo(() => {
    const map = new Map<string, MallaSection>();
    activeSections.forEach((s) => map.set(s.id, s));
    return map;
  }, [activeSections]);

  const handleSelectSection = useCallback((sectionId: string) => {
    setSelectedSectionId((prev) => (prev === sectionId ? null : sectionId));
  }, []);

  // Build nodes: Header placed ABOVE the category box
  const initialNodes = useMemo(() => {
    const nodes: Node[] = [];
    let currentY = 40;

    const activeSection = selectedSectionId ? sectionMap.get(selectedSectionId) : null;
    const prereqSectionIds = new Set<string>(activeSection?.prerequisiteSectionIds || []);

    activeSections.forEach((sec) => {
      const secMaterias = mallaMaterias.filter((mm) => {
        if (sec.id === "default") {
          return !mm.sectionId || mm.sectionId === "default" || !sectionMap.has(mm.sectionId);
        }
        return mm.sectionId === sec.id;
      });

      const maxSubSem = secMaterias.length > 0 ? Math.max(...secMaterias.map((mm) => mm.semester)) : 1;
      const maxSubCol = secMaterias.length > 0 ? Math.max(...secMaterias.map((mm) => mm.mapColumn)) : 0;

      const configuredCol =
        sec.totalColumns !== undefined && sec.totalColumns > 0
          ? sec.totalColumns - 1
          : maxSubCol;
      const secMaxCol = Math.max(configuredCol, maxSubCol);
      const secMaxSem = Math.max(sec.totalSemesters || 1, maxSubSem);

      const isSecHighlighted = selectedSectionId === sec.id;
      const isSecPrereq = selectedSectionId ? prereqSectionIds.has(sec.id) : false;

      const prereqNames = (sec.prerequisiteSectionIds || [])
        .map((id) => sectionMap.get(id)?.nombre)
        .filter(Boolean) as string[];

      // 1. SECTION BANNER: Placed ABOVE the category box (never inside)
      const bannerY = currentY;
      nodes.push({
        id: `banner-${sec.id}`,
        type: 'sectionBanner',
        position: { x: startX, y: bannerY },
        data: {
          sectionId: sec.id,
          nombre: sec.nombre,
          descripcion: sec.descripcion,
          bgColor: sec.bgColor,
          semestersCount: secMaxSem,
          materiasCount: secMaterias.length,
          prerequisiteSectionIds: sec.prerequisiteSectionIds,
          prerequisiteSectionNames: prereqNames,
          isHighlighted: isSecHighlighted,
          isDimmed: false,
          isPrerequisite: isSecPrereq,
          isEditor: false,
          onSelectSection: handleSelectSection,
        },
        draggable: false,
        selectable: false,
        zIndex: 25,
      });

      // 2. CATEGORY BOX: Starts below the banner
      const boxStartY = bannerY + 54;
      const colLabelsY = boxStartY + 14;
      const gridStartY = boxStartY + 45;
      const boxHeight = 45 + secMaxSem * (cardHeight + spacingY) + 20;
      const boxWidth = startX + (secMaxCol + 1) * (cardWidth + spacingX) + 25;

      // 3. Section Background Node: Clickable sector representing the entire category
      nodes.push({
        id: `bg-${sec.id}`,
        type: 'sectionBackground',
        position: { x: 5, y: boxStartY },
        data: {
          sectionId: sec.id,
          width: boxWidth,
          height: boxHeight,
          bgColor: sec.bgColor || "rgba(15, 23, 42, 0.4)",
          borderColor: sec.borderColor,
          isHighlighted: isSecHighlighted,
          isDimmed: false,
          isPrerequisite: isSecPrereq,
          onSelectSection: handleSelectSection,
        },
        draggable: false,
        selectable: true,
        zIndex: 0,
      });

      // 4. Column labels: Located inside the top of the box, unobstructed
      for (let c = 0; c <= secMaxCol; c++) {
        const colLabel =
          sec.columnLabels?.[c] !== undefined
            ? sec.columnLabels[c]
            : globalColumnLabels[c] !== undefined
            ? globalColumnLabels[c]
            : String(c);

        nodes.push({
          id: `col-label-${sec.id}-${c}`,
          type: 'columnLabel',
          position: {
            x: startX + c * (cardWidth + spacingX) + cardWidth / 2 - 20,
            y: colLabelsY,
          },
          data: { label: colLabel },
          draggable: false,
          selectable: false,
          zIndex: 5,
        });
      }

      // 5. Semester labels
      const rowFormat = sec.rowLabelFormat || globalRowFormat;
      for (let s = 1; s <= secMaxSem; s++) {
        let prefix = "SEM";
        let numStr = String(s);

        if (sec.semesterLabels?.[s]) {
          prefix = "";
          numStr = sec.semesterLabels[s];
        } else if (rowFormat.includes("${num}")) {
          const parts = rowFormat.split("${num}");
          prefix = parts[0].trim() || "SEM";
        }

        nodes.push({
          id: `sem-label-${sec.id}-${s}`,
          type: 'semesterLabel',
          position: {
            x: 10,
            y: gridStartY + (s - 1) * (cardHeight + spacingY) + cardHeight / 2 - 24,
          },
          data: { prefix, number: numStr },
          draggable: false,
          selectable: false,
          zIndex: 5,
        });
      }

      // 6. Subject nodes
      secMaterias.forEach((mm) => {
        const customTypeData = customTypeMap.get(mm.tipoMateria);
        const data: SubjectNodeData = {
          label: mm.materia?.nombre || 'Sin nombre',
          code: mm.materia?.codigo || '---',
          color: mm.materia?.color || '#94a3b8',
          icono: mm.materia?.icono || '📚',
          profesorNombre: mm.materia?.profesorNombre,
          apuntesCount: mm.materia?.apuntesCount || 0,
          creditos: (mm.materia as any)?.creditos || 3,
          horas: (mm.materia as any)?.horas || 48,
          type: mm.tipoMateria,
          customTypeData: customTypeData,
          sectionId: sec.id,
          semester: mm.semester,
          column: mm.mapColumn,
          slug: mm.materia?.slug || '',
          semestreSlug: (mm.materia as any)?.semestres?.slug || semestreSlug,
          carreraSlug: carreraSlug,
          prerequisites: mm.prerequisites,
          corequisites: mm.corequisites,
          uuid: mm.id,
          materia: mm.materia,
          isHighlighted: false,
          isDimmed: focusSemester ? mm.semester !== focusSemester : false,
          isSearchMatch: false,
          isInteractiveViewer: true,
          showOnlyConnectedHandles: true,
        };

        nodes.push({
          id: mm.id,
          type: 'subject',
          position: {
            x: startX + mm.mapColumn * (cardWidth + spacingX),
            y: gridStartY + (mm.semester - 1) * (cardHeight + spacingY),
          },
          data: data,
          draggable: false,
          connectable: false,
          zIndex: 20,
        });
      });

      // Next section starts after this category box + gap
      currentY = boxStartY + boxHeight + sectionGap;
    });

    return nodes;
  }, [
    activeSections,
    sectionMap,
    mallaMaterias,
    selectedSectionId,
    handleSelectSection,
    globalRowFormat,
    globalColumnLabels,
    customTypeMap,
    semestreSlug,
    carreraSlug,
    focusSemester,
  ]);

  // Edges: connecting subjects AND connecting section prerequisites
  const initialEdges = useMemo(() => {
    const edges: Edge[] = [];

    // 1. SECTION PREREQUISITE EDGES (Flechas de conexión entre secciones)
    activeSections.forEach((sec) => {
      (sec.prerequisiteSectionIds || []).forEach((prereqSecId) => {
        const prereqSec = sectionMap.get(prereqSecId);
        if (prereqSec) {
          const isHighlighted = selectedSectionId === sec.id || selectedSectionId === prereqSec.id;
          const isDimmed = selectedSectionId !== null && !isHighlighted;

          edges.push({
            id: `edge-sec-prereq-${prereqSec.id}-${sec.id}`,
            source: `bg-${prereqSec.id}`,
            target: `banner-${sec.id}`,
            sourceHandle: 'section-bottom-source',
            targetHandle: 'section-banner-target',
            type: 'smoothstep',
            animated: isHighlighted,
            style: {
              stroke: '#f59e0b',
              strokeWidth: isHighlighted ? 3.5 : 2.5,
              strokeDasharray: isHighlighted ? undefined : '6,6',
              opacity: 0.9,
            },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#f59e0b',
              width: 20,
              height: 20,
            },
            label: `Requiere ${prereqSec.nombre}`,
            labelStyle: { fill: '#fbbf24', fontWeight: 800, fontSize: 11 },
            labelBgStyle: {
              fill: '#18181b',
              fillOpacity: 0.95,
              stroke: '#f59e0b',
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

    // 2. SUBJECT PREREQUISITE & COREQUISITE EDGES
    const addedCoreqPairs = new Set<string>();

    mallaMaterias.forEach((mm) => {
      if (mm.prerequisites && mm.prerequisites.length > 0) {
        mm.prerequisites.forEach((prereqCode) => {
          const sourceMm = mallaMaterias.find((m) => m.materia?.codigo === prereqCode);
          if (sourceMm) {
            edges.push({
              id: `edge-prereq-${sourceMm.id}-${mm.id}`,
              source: sourceMm.id,
              target: mm.id,
              sourceHandle: 'bottom-source',
              targetHandle: 'top-target',
              type: 'smoothstep',
              animated: false,
              style: { stroke: '#94a3b8', strokeWidth: 2 },
              markerEnd: {
                type: MarkerType.ArrowClosed,
                color: '#94a3b8',
              },
              zIndex: 10,
            });
          }
        });
      }

      if (mm.corequisites && mm.corequisites.length > 0) {
        mm.corequisites.forEach((coreqCode) => {
          const other = mallaMaterias.find((m) => m.materia?.codigo === coreqCode);
          if (other) {
            const pairKey = [mm.id, other.id].sort().join("---");
            if (!addedCoreqPairs.has(pairKey)) {
              addedCoreqPairs.add(pairKey);

              const isOtherOnLeft = (other.mapColumn ?? 0) <= (mm.mapColumn ?? 0);
              const sourceId = isOtherOnLeft ? other.id : mm.id;
              const targetId = isOtherOnLeft ? mm.id : other.id;
              edges.push({
                id: `edge-coreq-${sourceId}-${targetId}`,
                source: sourceId,
                target: targetId,
                sourceHandle: 'right-source',
                targetHandle: 'left-target',
                type: 'smoothstep',
                animated: false,
                style: { stroke: '#f59e0b', strokeWidth: 2, strokeDasharray: '5,5' },
                markerEnd: {
                  type: MarkerType.ArrowClosed,
                  color: '#f59e0b',
                },
                markerStart: {
                  type: MarkerType.ArrowClosed,
                  color: '#f59e0b',
                  orient: 'auto-start-reverse',
                },
                zIndex: 10,
              });
            }
          }
        });
      }
    });

    return edges;
  }, [mallaMaterias, activeSections, sectionMap, selectedSectionId]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  // Keyboard shortcut search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        document.activeElement?.hasAttribute('contenteditable')
      ) {
        return;
      }

      if (e.key === 'Escape') {
        setSearchText('');
        setSelectedSectionId(null);
        return;
      }

      if (e.key.length === 1 && /[a-zA-Z0-9 ]/.test(e.key)) {
        setSearchText((prev) => prev + e.key);
      } else if (e.key === 'Backspace') {
        setSearchText((prev) => prev.slice(0, -1));
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (searchText) {
      const timeoutId = setTimeout(() => {
        setSearchText('');
      }, 2500);
      return () => clearTimeout(timeoutId);
    }
  }, [searchText]);

  // Search filter effect
  useEffect(() => {
    if (nodes.length === 0) return;

    setNodes((nds) =>
      nds.map((n) => {
        if (n.type !== 'subject') return n;

        const data = n.data as SubjectNodeData;
        const matchesSearch =
          searchText.length > 0 &&
          (data.label.toLowerCase().includes(searchText.toLowerCase()) ||
            data.code.toLowerCase().includes(searchText.toLowerCase()));

        return {
          ...n,
          data: {
            ...data,
            isSearchMatch: matchesSearch,
            isDimmed: searchText.length > 0 && !matchesSearch,
          },
        };
      })
    );
  }, [searchText, setNodes]);

  const getTransitivePredecessors = useCallback(
    (nodeId: string): Set<string> => {
      const visited = new Set<string>();
      const traverse = (currId: string) => {
        if (visited.has(currId)) return;
        visited.add(currId);
        const preEdges = initialEdges.filter((e) => e.target === currId && e.id.includes('prereq') && !e.id.includes('sec-prereq'));
        preEdges.forEach((e) => traverse(e.source));
      };
      traverse(nodeId);
      return visited;
    },
    [initialEdges]
  );

  const getTransitiveSuccessors = useCallback(
    (nodeId: string): Set<string> => {
      const visited = new Set<string>();
      const traverse = (currId: string) => {
        if (visited.has(currId)) return;
        visited.add(currId);
        const succEdges = initialEdges.filter((e) => e.source === currId && e.id.includes('prereq') && !e.id.includes('sec-prereq'));
        succEdges.forEach((e) => traverse(e.target));
      };
      traverse(nodeId);
      return visited;
    },
    [initialEdges]
  );

  const getCorequisites = useCallback(
    (nodeId: string): Set<string> => {
      const coreqs = new Set<string>();
      initialEdges
        .filter((e) => e.id.includes('coreq') && (e.source === nodeId || e.target === nodeId))
        .forEach((e) => {
          coreqs.add(e.source === nodeId ? e.target : e.source);
        });
      return coreqs;
    },
    [initialEdges]
  );

  // Click on node: Materias take highest priority!
  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      // 1. If subject clicked -> handle subject path tracing
      if (node.type === 'subject') {
        const prereqs = getTransitivePredecessors(node.id);
        const succs = getTransitiveSuccessors(node.id);
        const coreqs = getCorequisites(node.id);

        setNodes((nds) =>
          nds.map((n) => {
            if (n.type !== 'subject') {
              if (n.type === 'sectionBackground' || n.type === 'sectionBanner') {
                return { ...n, data: { ...n.data, isHighlighted: false, isDimmed: false } };
              }
              return n;
            }

            const data = n.data as SubjectNodeData;
            let highlightType: 'selected' | 'prereq' | 'successor' | 'coreq' | undefined;

            if (n.id === node.id) highlightType = 'selected';
            else if (prereqs.has(n.id) && n.id !== node.id) highlightType = 'prereq';
            else if (succs.has(n.id) && n.id !== node.id) highlightType = 'successor';
            else if (coreqs.has(n.id) && n.id !== node.id) highlightType = 'coreq';

            return {
              ...n,
              data: {
                ...data,
                highlightType,
                isHighlighted: !!highlightType,
                isDimmed: !highlightType,
                isSearchMatch: false,
              },
            };
          })
        );

        setSearchText('');
        return;
      }

      // 2. If section background or banner clicked -> select section!
      if (node.type === 'sectionBackground' || node.type === 'sectionBanner') {
        const targetSecId = node.data.sectionId;
        if (targetSecId) {
          handleSelectSection(targetSecId);
        }
      }
    },
    [getTransitivePredecessors, getTransitiveSuccessors, getCorequisites, handleSelectSection, setNodes]
  );

  const onPaneClick = useCallback(() => {
    setSelectedSectionId(null);
    setNodes(initialNodes);
  }, [initialNodes, setNodes]);

  return (
    <div
      className={cn(
        'w-full h-[600px] bg-background rounded-xl border border-border/50 overflow-hidden relative',
        '[&_.react-flow\\_\\_node-sectionBackground]:z-[0]!',
        '[&_.react-flow\\_\\_edges]:z-[10]!',
        '[&_.react-flow\\_\\_node-subject]:z-[20]!',
        '[&_.react-flow\\_\\_node-sectionBanner]:z-[25]!',
        className
      )}
    >
      {searchText && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-background/80 backdrop-blur-md px-4 py-2 rounded-full border border-primary/50 shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
          <Search className="w-4 h-4 text-primary" />
          <span className="font-mono text-sm">{searchText}</span>
          <span className="w-1.5 h-4 bg-primary animate-pulse ml-0.5" />
        </div>
      )}

      {selectedSectionId && (
        <div className="absolute top-4 left-4 z-20 bg-background/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-sky-500/50 shadow-lg flex items-center gap-2 text-xs font-semibold text-sky-400 animate-in fade-in">
          <span>Enfoque en sección:</span>
          <span className="text-white font-bold">{sectionMap.get(selectedSectionId)?.nombre}</span>
          <button
            onClick={() => setSelectedSectionId(null)}
            className="ml-2 text-neutral-400 hover:text-white text-[10px] uppercase font-bold underline cursor-pointer"
          >
            Restablecer
          </button>
        </div>
      )}

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={true}
        zoomOnScroll={true}
        panOnDrag={true}
        preventScrolling={true}
        zoomOnPinch={true}
        maxZoom={1.5}
        minZoom={0.05}
      >
        <Background gap={25} size={1} className="bg-background!" />
        <Controls
          showInteractive={false}
          className="bg-background/80 backdrop-blur-md border border-border/50 rounded-xl overflow-hidden shadow-2xl [&>button]:bg-background [&>button]:text-foreground [&>button]:border-border [&>button]:hover:bg-muted"
        />
        {mounted && (
          <MiniMap
            nodeStrokeWidth={3}
            className="bg-background/80 backdrop-blur-md border border-border/50 rounded-xl overflow-hidden shadow-lg"
            maskColor={resolvedTheme === 'dark' ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.5)'}
            nodeColor={(node) => {
              if (node.type === 'sectionBackground') return 'rgba(255,255,255,0.03)';
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
    </div>
  );
}

export default function MallaInteractiveView(props: MallaInteractiveViewProps) {
  return (
    <ReactFlowProvider>
      <MallaInteractiveViewContent {...props} />
    </ReactFlowProvider>
  );
}
