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
import { MallaMateria, SubjectNodeData } from '@/types';
import { SubjectNode } from './nodes/subject-node';
import { Search } from 'lucide-react';

interface MallaInteractiveViewProps {
  mallaMaterias: MallaMateria[];
  malla?: any;
  semestreSlug?: string;
  carreraSlug?: string;
  focusSemester?: number;
  className?: string;
}

const cardWidth = 155;
const cardHeight = 165;
const spacingX = 35;
const spacingY = 50;
const startX = 70;
const startY = 60;

const SemesterLabelNode = ({ data }: any) => {
  return (
    <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-card/40 backdrop-blur-md border border-border/40 shadow-sm w-14 h-12 pointer-events-none select-none">
      <span className="text-[9px] font-black opacity-40 uppercase tracking-widest leading-none text-muted-foreground">{data.prefix || "SEM"}</span>
      <span className="text-lg font-black text-primary/40 leading-tight">{data.number}</span>
    </div>
  );
};

const ColumnLabelNode = ({ data }: any) => {
  return (
    <div className="flex items-center justify-center p-1.5 rounded-lg bg-card/20 backdrop-blur-md border border-border/20 shadow-none w-10 h-7 pointer-events-none select-none">
      <span className="text-xs font-black text-primary/40 leading-none">{data.label}</span>
    </div>
  );
};

const nodeTypes = {
  subject: SubjectNode,
  semesterLabel: SemesterLabelNode,
  columnLabel: ColumnLabelNode,
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

  const metadata = malla?.metadata || EMPTY_METADATA;
  const rowFormat = metadata.rowLabelFormat || "SEM ${num}";
  const columnLabels = metadata.columnLabels || EMPTY_COLUMN_LABELS;
  const customTypes = metadata.customTypes || EMPTY_CUSTOM_TYPES;
  const customTypeMap = useMemo(() => {
    const map = new Map<string, { label: string; color: string; textColor?: string }>();
    customTypes.forEach((t: any) => {
      map.set(t.id, t);
    });
    return map;
  }, [customTypes]);

  const initialNodes = useMemo(() => {
    const nodes: Node[] = [];
    let maxSemester = 1;
    let maxColumn = 0;

    mallaMaterias.forEach(mm => {
      if (mm.semester > maxSemester) maxSemester = mm.semester;
      if (mm.mapColumn > maxColumn) maxColumn = mm.mapColumn;
    });

    // Row / Semester labels
    for (let s = 1; s <= maxSemester; s++) {
      let prefix = "SEM";
      let numStr = String(s);
      if (rowFormat.includes("${num}")) {
        const parts = rowFormat.split("${num}");
        prefix = parts[0].trim() || "SEM";
      }

      nodes.push({
        id: `sem-label-${s}`,
        type: 'semesterLabel',
        position: { x: 0, y: startY + (s - 1) * (cardHeight + spacingY) + cardHeight / 2 - 24 },
        data: { prefix, number: numStr },
        draggable: false,
        selectable: false,
      });
    }

    // Column labels
    for (let c = 0; c <= maxColumn; c++) {
      const colLabel = columnLabels[c] !== undefined ? columnLabels[c] : String(c);
      nodes.push({
        id: `col-label-${c}`,
        type: 'columnLabel',
        position: {
          x: startX + c * (cardWidth + spacingX) + cardWidth / 2 - 20,
          y: startY - 40,
        },
        data: { label: colLabel },
        draggable: false,
        selectable: false,
      });
    }

    // Subject nodes
    mallaMaterias.forEach(mm => {
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
      };

      nodes.push({
        id: mm.id,
        type: 'subject',
        position: {
          x: startX + mm.mapColumn * (cardWidth + spacingX),
          y: startY + (mm.semester - 1) * (cardHeight + spacingY),
        },
        data: data,
        draggable: false,
      });
    });

    return nodes;
  }, [mallaMaterias, semestreSlug, focusSemester, rowFormat, columnLabels, customTypeMap]);

  const initialEdges = useMemo(() => {
    const edges: Edge[] = [];

    mallaMaterias.forEach(mm => {
      if (mm.prerequisites && mm.prerequisites.length > 0) {
        mm.prerequisites.forEach(prereqCode => {
          const sourceMm = mallaMaterias.find(m => m.materia?.codigo === prereqCode);
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
            });
          }
        });
      }

      if (mm.corequisites && mm.corequisites.length > 0) {
        mm.corequisites.forEach(coreqCode => {
          const sourceMm = mallaMaterias.find(m => m.materia?.codigo === coreqCode);
          if (sourceMm && sourceMm.id < mm.id) { // Avoid duplicate bidirectional rendering
            edges.push({
              id: `edge-coreq-${sourceMm.id}-${mm.id}`,
              source: sourceMm.id,
              target: mm.id,
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
            });
          }
        });
      }
    });

    return edges;
  }, [mallaMaterias]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

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
        return;
      }

      if (e.key.length === 1 && /[a-zA-Z0-9 ]/.test(e.key)) {
        setSearchText(prev => prev + e.key);
      } else if (e.key === 'Backspace') {
        setSearchText(prev => prev.slice(0, -1));
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (searchText) {
      const timeoutId = setTimeout(() => {
        setSearchText('');
      }, 2000);
      return () => clearTimeout(timeoutId);
    }
  }, [searchText]);

  useEffect(() => {
    if (nodes.length === 0) return;

    setNodes(nds => 
      nds.map(n => {
        if (n.type !== 'subject') return n;
        
        const data = n.data as SubjectNodeData;
        const matchesSearch = searchText.length > 0 && 
          (data.label.toLowerCase().includes(searchText.toLowerCase()) || 
           data.code.toLowerCase().includes(searchText.toLowerCase()));

        return {
          ...n,
          data: {
            ...data,
            isSearchMatch: matchesSearch,
            isDimmed: searchText.length > 0 && !matchesSearch,
          }
        };
      })
    );
  }, [searchText, setNodes]);

  const getTransitivePredecessors = useCallback((nodeId: string, visited = new Set<string>()): Set<string> => {
    if (visited.has(nodeId)) return visited;
    visited.add(nodeId);
    
    const preEdges = initialEdges.filter(e => e.target === nodeId && e.id.includes('prereq'));
    preEdges.forEach(e => {
      getTransitivePredecessors(e.source, visited);
    });
    
    return visited;
  }, [initialEdges]);

  const getTransitiveSuccessors = useCallback((nodeId: string, visited = new Set<string>()): Set<string> => {
    if (visited.has(nodeId)) return visited;
    visited.add(nodeId);
    
    const succEdges = initialEdges.filter(e => e.source === nodeId && e.id.includes('prereq'));
    succEdges.forEach(e => {
      getTransitiveSuccessors(e.target, visited);
    });
    
    return visited;
  }, [initialEdges]);
  
  const getCorequisites = useCallback((nodeId: string): Set<string> => {
    const coreqs = new Set<string>();
    initialEdges.filter(e => e.id.includes('coreq') && (e.source === nodeId || e.target === nodeId)).forEach(e => {
      coreqs.add(e.source === nodeId ? e.target : e.source);
    });
    return coreqs;
  }, [initialEdges]);

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    if (node.type !== 'subject') return;

    const prereqs = getTransitivePredecessors(node.id);
    const succs = getTransitiveSuccessors(node.id);
    const coreqs = getCorequisites(node.id);

    setNodes(nds => nds.map(n => {
      if (n.type !== 'subject') return n;
      
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
        }
      };
    }));
    
    setSearchText('');
  }, [getTransitivePredecessors, getTransitiveSuccessors, getCorequisites, setNodes]);

  const onPaneClick = useCallback(() => {
    setNodes(initialNodes);
  }, [initialNodes, setNodes]);

  return (
    <div className={cn('w-full h-[600px] bg-background rounded-xl border border-border/50 overflow-hidden relative', className)}>
      {searchText && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-background/80 backdrop-blur-md px-4 py-2 rounded-full border border-primary/50 shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-4">
          <Search className="w-4 h-4 text-primary" />
          <span className="font-mono text-sm">{searchText}</span>
          <span className="w-1.5 h-4 bg-primary animate-pulse ml-0.5" />
        </div>
      )}
      
      <ReactFlow
        className="[&_.react-flow__handle]:!opacity-0"
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
        minZoom={0.1}
      >
        <Background gap={25} size={1} className="bg-background!" />
        <Controls showInteractive={false} className="bg-background/80 backdrop-blur-md border border-border/50 rounded-xl overflow-hidden shadow-2xl [&>button]:bg-background [&>button]:text-foreground [&>button]:border-border [&>button]:hover:bg-muted" />
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
