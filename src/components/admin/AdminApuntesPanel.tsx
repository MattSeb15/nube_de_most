"use client";

import React, { useState, useEffect, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import { Explorador } from "@/components/apuntes/Explorador";
import { VisorPDF } from "@/components/apuntes/VisorPDF";
import { VisorCuaderno } from "@/components/apuntes/VisorCuaderno";
import { DialogoMover } from "@/components/apuntes/DialogoMover";
import { MultiPdfUploadModal } from "@/components/apuntes/MultiPdfUploadModal";
import { Button } from "@/components/ui/button";
import { MateriaIcon } from "@/components/ui/materia-icon";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Plus,
  FolderPlus,
  UploadCloud,
  Loader2,
  BookOpen,
  FileText,
  Search,
  LayoutGrid,
  List as ListIcon,
  ArrowDownWideNarrow,
  ArrowUpNarrowWide,
  ArrowDownAZ,
  ArrowUpAZ,
  RefreshCw,
  X,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "@/components/ui/empty-state";
import type { CarpetaApunte, ArchivoApunte } from "@/types";
import { v4 as uuidv4 } from "uuid";
import { uploadBytesResumable, ref, getDownloadURL } from "firebase/storage";
import { storage } from "@/utils/firebase/config";
import Link from "next/link";

interface AdminApuntesPanelProps {
  onCountChange?: () => void;
}

export function AdminApuntesPanel({ onCountChange }: AdminApuntesPanelProps) {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const [currentFolder, setCurrentFolder] = useState<CarpetaApunte | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<CarpetaApunte[]>([]);
  const [folders, setFolders] = useState<CarpetaApunte[]>([]);
  const [files, setFiles] = useState<ArchivoApunte[]>([]);
  const allFoldersRef = useRef<CarpetaApunte[]>([]);

  // Search & Filter & Sort
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<"fecha" | "nombre">("fecha");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [totalStats, setTotalStats] = useState({ pdfs: 0, cuadernos: 0 });

  // Modal Viewer State (Clean modal instead of broken side-by-side)
  const [viewerFile, setViewerFile] = useState<ArchivoApunte | null>(null);

  // Dialogs
  const [deleteConfirmData, setDeleteConfirmData] = useState<{ type: "folder" | "file"; item: any } | null>(null);
  const [collaboratorsDialogData, setCollaboratorsDialogData] = useState<{ file: any; collaborators: any[] } | null>(null);
  const [itemToMove, setItemToMove] = useState<{ type: "folder" | "file"; item: any } | null>(null);

  // Modals & Forms
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderType, setNewFolderType] = useState<"normal" | "cuaderno">("normal");
  const [newFolderColaborativa, setNewFolderColaborativa] = useState(false);
  const [isCreatingNotebook, setIsCreatingNotebook] = useState(false);
  const [newNotebookName, setNewNotebookName] = useState("");
  const [itemToRename, setItemToRename] = useState<{ type: "folder" | "file"; item: any } | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isPdfUploadModalOpen, setIsPdfUploadModalOpen] = useState(false);
  const [selectedPdfFiles, setSelectedPdfFiles] = useState<File[]>([]);

  // Materias
  const [materias, setMaterias] = useState<any[]>([]);
  const [selectedMateriaId, setSelectedMateriaId] = useState<string | null>(null);

  // Initial load
  useEffect(() => {
    checkAuth();
    fetchMaterias();
  }, []);

  const checkAuth = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      setCurrentUser(user);
    }
  };

  const fetchMaterias = async () => {
    const { data } = await supabase
      .from("materias")
      .select("id, nombre, codigo, color, icono, descripcion, semestre_id")
      .order("nombre");

    if (data && data.length > 0) {
      setMaterias(data);

      // Restore last selected materia from localStorage or default
      const savedMateriaId = typeof window !== "undefined" ? localStorage.getItem("admin_selected_materia_id") : null;
      if (savedMateriaId && data.some((m: any) => m.id === savedMateriaId)) {
        setSelectedMateriaId(savedMateriaId);
      } else {
        setSelectedMateriaId(data[0].id);
        if (typeof window !== "undefined") {
          localStorage.setItem("admin_selected_materia_id", data[0].id);
        }
      }
    } else {
      setLoading(false);
    }
  };

  const handleSelectMateria = (materiaId: string | null) => {
    if (!materiaId) return;
    setSelectedMateriaId(materiaId);
    if (typeof window !== "undefined") {
      localStorage.setItem("admin_selected_materia_id", materiaId);
    }
    setCurrentFolder(null);
    setBreadcrumbs([]);
    setViewerFile(null);
    setSearchQuery("");
  };

  useEffect(() => {
    if (currentUser && selectedMateriaId) {
      fetchContents();
    } else if (!selectedMateriaId) {
      setFolders([]);
      setFiles([]);
      setLoading(false);
    }
  }, [currentFolder, currentUser, selectedMateriaId]);

  const fetchContents = async () => {
    if (!selectedMateriaId) return;
    setLoading(true);
    const parentId = currentFolder ? currentFolder.id : null;

    try {
      const { data: allFoldersData } = await supabase
        .from("carpetas_apuntes")
        .select(
          "*, perfiles!creador_id(nombre_completo, rol, avatar_url, apodo), archivos_apuntes(id, slug, tipo, creador_id, perfiles!creador_id(id, nombre_completo, avatar_url, apodo), paginas_cuaderno(creador_id, url_imagen, perfiles!creador_id(id, nombre_completo, avatar_url, apodo)))"
        )
        .eq("materia_id", selectedMateriaId)
        .order("nombre");

      const allFolders = allFoldersData || [];
      allFoldersRef.current = allFolders;

      const calculateTotalFiles = (folderId: string): number => {
        let total = 0;
        const folder = allFolders.find((f: any) => f.id === folderId);
        if (folder && folder.archivos_apuntes) {
          total += folder.archivos_apuntes.length;
        }
        const subfolders = allFolders.filter((f: any) => f.parent_id === folderId);
        for (const sub of subfolders) {
          total += calculateTotalFiles(sub.id);
        }
        return total;
      };

      const childFolders = allFolders
        .filter((f: any) => f.parent_id === parentId)
        .map((folder: any) => ({
          ...folder,
          totalFilesCount: calculateTotalFiles(folder.id),
        }));

      let pdfsCount = 0;
      let cuadernosCount = 0;
      for (const folder of allFolders) {
        if (folder.archivos_apuntes) {
          for (const file of folder.archivos_apuntes) {
            if (file.tipo === "pdf") pdfsCount++;
            else if (file.tipo === "cuaderno") cuadernosCount++;
          }
        }
      }
      setTotalStats({ pdfs: pdfsCount, cuadernos: cuadernosCount });
      setFolders(childFolders);

      if (parentId) {
        const { data: fileData } = await supabase
          .from("archivos_apuntes")
          .select(
            "*, perfiles!creador_id(nombre_completo, rol, avatar_url, apodo), paginas_cuaderno(creador_id, url_imagen, perfiles!creador_id(id, nombre_completo, avatar_url, apodo)), interacciones_apuntes(tipo)"
          )
          .eq("carpeta_id", parentId)
          .order("nombre");
        setFiles(fileData || []);
      } else {
        setFiles([]);
      }
    } catch (err) {
      console.error("Error fetching contents in admin panel", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim() || !selectedMateriaId) return;
    setIsCreatingFolder(false);
    setLoading(true);

    await supabase.from("carpetas_apuntes").insert({
      nombre: newFolderName.trim(),
      descripcion: "",
      parent_id: currentFolder?.id || null,
      materia_id: currentFolder?.materiaId || selectedMateriaId,
      creador_id: currentUser?.id,
      visible: true,
      colaborativa: newFolderColaborativa,
      tipo: newFolderType,
    });

    setNewFolderName("");
    setNewFolderType("normal");
    setNewFolderColaborativa(false);
    fetchContents();
    onCountChange?.();
  };

  const handleToggleCollaborative = async (type: "folder" | "file", item: any) => {
    setLoading(true);
    const table = type === "folder" ? "carpetas_apuntes" : "archivos_apuntes";
    await supabase.from(table).update({ colaborativa: !item.colaborativa }).eq("id", item.id);
    fetchContents();
  };

  const handleCreateNotebook = async () => {
    if (!newNotebookName.trim() || !currentFolder) return;
    setIsCreatingNotebook(false);
    setLoading(true);

    await supabase.from("archivos_apuntes").insert({
      carpeta_id: currentFolder.id,
      tipo: "cuaderno",
      nombre: newNotebookName.trim(),
      creador_id: currentUser?.id,
    });

    setNewNotebookName("");
    fetchContents();
    onCountChange?.();
  };

  const handleRenameSubmit = async () => {
    if (!renameValue.trim() || !itemToRename) return;
    setLoading(true);
    const table = itemToRename.type === "folder" ? "carpetas_apuntes" : "archivos_apuntes";
    await supabase.from(table).update({ nombre: renameValue.trim() }).eq("id", itemToRename.item.id);
    setItemToRename(null);
    setRenameValue("");
    fetchContents();
  };

  const handleNavigateBreadcrumb = (folder: CarpetaApunte | null) => {
    if (!folder) {
      setCurrentFolder(null);
      setBreadcrumbs([]);
    } else {
      const index = breadcrumbs.findIndex((b) => b.id === folder.id);
      if (index !== -1) {
        setBreadcrumbs(breadcrumbs.slice(0, index + 1));
        setCurrentFolder(folder);
      }
    }
    setViewerFile(null);
  };

  const handleFolderClick = (folder: CarpetaApunte) => {
    setCurrentFolder(folder);
    setBreadcrumbs((prev) => {
      if (prev.some((c) => c.id === folder.id)) return prev;
      return [...prev, folder];
    });
    setViewerFile(null);
  };

  const handleFileClick = (file: ArchivoApunte) => {
    // Open in dedicated modal viewer
    setViewerFile(file);
  };

  // Filter & Sort
  const filteredFolders = folders.filter((f) =>
    f.nombre.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredFiles = files.filter((f) =>
    f.nombre.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortItems = (items: any[]) => {
    return [...items].sort((a, b) => {
      let valA, valB;
      if (sortBy === "nombre") {
        valA = a.nombre.toLowerCase();
        valB = b.nombre.toLowerCase();
      } else {
        valA = new Date(
          a.created_at || a.fechaCreacion || a.fecha_creacion || a.fechaSubida || a.fecha_subida || 0
        ).getTime();
        valB = new Date(
          b.created_at || b.fechaCreacion || b.fecha_creacion || b.fechaSubida || b.fecha_subida || 0
        ).getTime();
      }

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  };

  const sortedFolders = sortItems(filteredFolders);
  const sortedFiles = sortItems(filteredFiles);
  const selectedMateria = materias.find((m) => m.id === selectedMateriaId);

  return (
    <div className="w-full text-neutral-900 dark:text-white space-y-6">
      {/* Top Header & Materia Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight">Gestor de Apuntes</h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Administra carpetas, documentos PDF y cuadernos interactivos organizados por materia.
          </p>
        </div>

        {/* Subject Selector */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-neutral-500 whitespace-nowrap">Materia:</span>
          <Select
            value={selectedMateriaId || ""}
            onValueChange={handleSelectMateria}
          >
            <SelectTrigger className="w-[280px] sm:w-[320px] bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white shadow-sm font-medium">
              <SelectValue placeholder="Seleccionar Materia...">
                {selectedMateria ? (
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: selectedMateria.color || "#3b82f6" }}
                    />
                    <span className="truncate">{selectedMateria.codigo ? `${selectedMateria.codigo} - ` : ""}{selectedMateria.nombre}</span>
                  </div>
                ) : (
                  "Seleccionar Materia..."
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="max-h-[300px]">
              {materias.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: m.color || "#3b82f6" }}
                    />
                    <span>{m.codigo ? `${m.codigo} - ` : ""}{m.nombre}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {selectedMateria ? (
        <>
          {/* Active Materia Badge / Banner */}
          <div
            className="rounded-2xl p-5 sm:p-6 text-white relative overflow-hidden shadow-md transition-all animate-fade-in"
            style={{ backgroundColor: selectedMateria.color || "#3b82f6" }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
                  <MateriaIcon name={selectedMateria.icono} className="size-8 sm:size-9 text-white fill-white" style={{ fill: "white" }} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      {selectedMateria.codigo || "MATERIA"}
                    </span>
                    <span className="text-white/80 text-xs font-semibold">
                      {totalStats.pdfs + totalStats.cuadernos} apuntes en total
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight mt-1">
                    {selectedMateria.nombre}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-white/90 font-medium mt-1.5">
                    <span className="flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5" /> {totalStats.pdfs} PDF{totalStats.pdfs !== 1 ? "s" : ""}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5" /> {totalStats.cuadernos} Cuaderno{totalStats.cuadernos !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons in Banner */}
              <div className="flex flex-wrap items-center gap-2 pt-2 sm:pt-0">
                {(!currentFolder || currentFolder.tipo !== "cuaderno") && (
                  <Button
                    onClick={() => setIsCreatingFolder(true)}
                    size="sm"
                    className="bg-white text-neutral-900 hover:bg-white/90 shadow-sm font-bold text-xs"
                  >
                    <FolderPlus className="w-4 h-4 mr-1.5" /> Nueva Carpeta
                  </Button>
                )}

                {currentFolder && currentFolder.tipo !== "cuaderno" && (
                  <button
                    onClick={() => {
                      setSelectedPdfFiles([]);
                      setIsPdfUploadModalOpen(true);
                    }}
                    className="cursor-pointer bg-red-600 hover:bg-red-700 text-white h-9 px-3.5 rounded-lg flex items-center justify-center text-xs font-bold shadow-sm transition-colors"
                  >
                    <UploadCloud className="w-4 h-4 mr-1.5" /> Subir PDF
                  </button>
                )}

                {currentFolder && currentFolder.tipo === "cuaderno" && (
                  <Button
                    onClick={() => {
                      setNewNotebookName(`Cuaderno de ${currentUser?.user_metadata?.full_name || "Most"}`);
                      setIsCreatingNotebook(true);
                    }}
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-700 text-white shadow-sm font-bold text-xs"
                  >
                    <Plus className="w-4 h-4 mr-1.5" /> Nuevo Cuaderno
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Creation Forms */}
          {isCreatingFolder && (
            <div className="p-4 bg-neutral-50 dark:bg-neutral-900/50 rounded-xl border border-neutral-200 dark:border-neutral-800 flex flex-col gap-4 animate-fade-in">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Nombre de la nueva carpeta..."
                  className="flex-1 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg px-4 py-2 text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-primary"
                  autoFocus
                  onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()}
                />
                <Button onClick={handleCreateFolder} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs">
                  Crear Carpeta
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCreatingFolder(false);
                    setNewFolderType("normal");
                  }}
                  className="text-xs"
                >
                  Cancelar
                </Button>
              </div>
              <div className="flex flex-wrap items-center gap-6 px-1 text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-neutral-700 dark:text-neutral-300">
                  <input
                    type="checkbox"
                    checked={newFolderType === "cuaderno"}
                    onChange={(e) => setNewFolderType(e.target.checked ? "cuaderno" : "normal")}
                    className="w-4 h-4 text-purple-600 rounded"
                  />
                  <span>Carpeta exclusiva para cuadernos de contenido</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-neutral-700 dark:text-neutral-300">
                  <input
                    type="checkbox"
                    checked={newFolderColaborativa}
                    onChange={(e) => setNewFolderColaborativa(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <span>Habilitar aportes colaborativos (los usuarios podrán subir contenido)</span>
                </label>
              </div>
            </div>
          )}

          {isCreatingNotebook && (
            <div className="p-4 bg-neutral-50 dark:bg-neutral-900/50 rounded-xl border border-neutral-200 dark:border-neutral-800 flex items-center gap-3 animate-fade-in">
              <BookOpen className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0" />
              <input
                type="text"
                value={newNotebookName}
                onChange={(e) => setNewNotebookName(e.target.value)}
                placeholder="Nombre del nuevo cuaderno..."
                className="flex-1 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg px-4 py-2 text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-purple-500"
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && handleCreateNotebook()}
              />
              <Button onClick={handleCreateNotebook} className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs">
                Crear Cuaderno
              </Button>
              <Button variant="outline" onClick={() => setIsCreatingNotebook(false)} className="text-xs">
                Cancelar
              </Button>
            </div>
          )}

          {itemToRename && (
            <div className="p-4 bg-neutral-50 dark:bg-neutral-900/50 rounded-xl border border-neutral-200 dark:border-neutral-800 flex items-center gap-3 animate-fade-in">
              <input
                type="text"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                placeholder="Nuevo nombre..."
                className="flex-1 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg px-4 py-2 text-sm text-neutral-900 dark:text-white focus:outline-none focus:border-blue-500"
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && handleRenameSubmit()}
              />
              <Button onClick={handleRenameSubmit} className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs">
                Guardar
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setItemToRename(null);
                  setRenameValue("");
                }}
                className="text-xs"
              >
                Cancelar
              </Button>
            </div>
          )}

          {/* Explorer Toolbar: Search, ViewMode, Sort, Refresh */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-3 flex-1 max-w-md">
              <div className="relative w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
                <input
                  type="text"
                  placeholder={`Buscar en ${currentFolder ? currentFolder.nombre : selectedMateria.nombre}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 rounded-xl pl-10 pr-4 py-2 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
                />
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
              {/* View mode toggle */}
              <div className="flex items-center bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-0.5">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded-md transition-colors ${
                    viewMode === "grid"
                      ? "bg-white dark:bg-neutral-800 shadow-sm text-primary"
                      : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                  }`}
                  title="Vista de cuadrícula"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-1.5 rounded-md transition-colors ${
                    viewMode === "list"
                      ? "bg-white dark:bg-neutral-800 shadow-sm text-primary"
                      : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                  }`}
                  title="Vista de lista"
                >
                  <ListIcon className="w-4 h-4" />
                </button>
              </div>

              {/* Sort dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger className="inline-flex items-center justify-center border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg text-xs font-semibold h-8.5 px-3 gap-1.5 text-neutral-700 dark:text-neutral-300 transition-colors shadow-sm focus:outline-none">
                  {sortBy === "fecha" ? (
                    sortOrder === "desc" ? (
                      <ArrowDownWideNarrow className="w-3.5 h-3.5" />
                    ) : (
                      <ArrowUpNarrowWide className="w-3.5 h-3.5" />
                    )
                  ) : sortOrder === "desc" ? (
                    <ArrowDownAZ className="w-3.5 h-3.5" />
                  ) : (
                    <ArrowUpAZ className="w-3.5 h-3.5" />
                  )}
                  <span>Ordenar</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44 text-xs">
                  <DropdownMenuItem
                    onClick={() => {
                      setSortBy("fecha");
                      setSortOrder("desc");
                    }}
                    className={sortBy === "fecha" && sortOrder === "desc" ? "bg-primary/10 text-primary font-bold" : ""}
                  >
                    Más recientes
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      setSortBy("fecha");
                      setSortOrder("asc");
                    }}
                    className={sortBy === "fecha" && sortOrder === "asc" ? "bg-primary/10 text-primary font-bold" : ""}
                  >
                    Más antiguos
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      setSortBy("nombre");
                      setSortOrder("asc");
                    }}
                    className={sortBy === "nombre" && sortOrder === "asc" ? "bg-primary/10 text-primary font-bold" : ""}
                  >
                    Nombre (A-Z)
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      setSortBy("nombre");
                      setSortOrder("desc");
                    }}
                    className={sortBy === "nombre" && sortOrder === "desc" ? "bg-primary/10 text-primary font-bold" : ""}
                  >
                    Nombre (Z-A)
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Refresh button */}
              <Button
                variant="outline"
                size="sm"
                onClick={fetchContents}
                disabled={loading}
                className="h-8.5 text-xs text-neutral-600 dark:text-neutral-300 border-neutral-200 dark:border-neutral-800"
              >
                <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
                <span>Actualizar</span>
              </Button>
            </div>
          </div>

          {/* Full-width Explorer View */}
          <div className="w-full transition-all">
            <Explorador
              loading={loading}
              currentFolder={currentFolder}
              breadcrumbs={breadcrumbs}
              folders={sortedFolders}
              files={sortedFiles}
              viewMode={viewMode}
              onFolderClick={handleFolderClick}
              onFileClick={handleFileClick}
              onNavigateBreadcrumb={handleNavigateBreadcrumb}
              isAdmin={true}
              selectedFile={null}
              isCompact={false}
              currentUser={currentUser}
              onRenameClick={(type, item) => {
                setItemToRename({ type, item });
                setRenameValue(item.nombre);
              }}
              onMoveClick={(type, item) => setItemToMove({ type, item })}
              onDeleteClick={(type, item) => setDeleteConfirmData({ type, item })}
              onToggleCollaborative={handleToggleCollaborative}
              onCollaboratorsClick={(file, collaborators) => setCollaboratorsDialogData({ file, collaborators })}
            />
          </div>
        </>
      ) : (
        <div className="py-16">
          <EmptyState
            icon={BookOpen}
            title="Selecciona una materia"
            description="Elige una materia del menú superior para empezar a gestionar sus carpetas y apuntes."
          />
        </div>
      )}

      {/* ── MODAL VIEWER (PDF / Cuaderno) ── */}
      <Dialog
        open={!!viewerFile}
        onOpenChange={(open) => {
          if (!open) setViewerFile(null);
        }}
      >
        <DialogContent className="sm:max-w-6xl md:max-w-6xl lg:max-w-7xl sm:w-[94vw] w-[96vw] h-[92vh] max-h-[92vh] p-0 gap-0 overflow-hidden flex flex-col bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl">
          <DialogHeader className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex flex-row items-center justify-between space-y-0 shrink-0 pr-12">
            <div className="flex items-center gap-3 min-w-0 pr-6">
              <div className="w-9 h-9 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0">
                {viewerFile?.tipo === "pdf" ? (
                  <FileText className="w-5 h-5 text-red-500" />
                ) : (
                  <BookOpen className="w-5 h-5 text-purple-500" />
                )}
              </div>
              <div className="min-w-0">
                <DialogTitle className="text-base font-bold truncate leading-tight">
                  {viewerFile?.nombre}
                </DialogTitle>
                <DialogDescription className="text-xs text-neutral-500 truncate mt-0.5">
                  {viewerFile?.tipo === "pdf" ? "Documento PDF" : "Cuaderno interactivo"} • Vista previa administrativa
                </DialogDescription>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {viewerFile && (
                <Link
                  href={`/apuntes/documento/${viewerFile.slug || viewerFile.id}`}
                  target="_blank"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-semibold text-neutral-700 dark:text-neutral-300 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Página pública</span>
                </Link>
              )}
            </div>
          </DialogHeader>

          {/* Modal Body with Visor */}
          <div className="flex-1 min-h-0 overflow-y-auto relative bg-neutral-50 dark:bg-neutral-900/40">
            {viewerFile && viewerFile.tipo === "pdf" && (
              <div className="h-full w-full">
                <VisorPDF file={viewerFile} onClose={() => setViewerFile(null)} />
              </div>
            )}

            {viewerFile && viewerFile.tipo === "cuaderno" && (
              <div className="h-full w-full p-4 sm:p-6">
                <VisorCuaderno
                  file={viewerFile}
                  onClose={() => setViewerFile(null)}
                  currentUserId={currentUser?.id}
                  isAdmin={true}
                />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirmData} onOpenChange={(open) => !open && setDeleteConfirmData(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Eliminar {deleteConfirmData?.type === "folder" ? "carpeta" : "apunte"}
            </DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que quieres eliminar <strong>{deleteConfirmData?.item?.nombre}</strong> de forma permanente? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmData(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                if (!deleteConfirmData) return;
                setLoading(true);
                const { type, item } = deleteConfirmData;
                if (type === "folder") {
                  await supabase.from("carpetas_apuntes").delete().eq("id", item.id);
                  if (currentFolder?.id === item.id) {
                    handleNavigateBreadcrumb(breadcrumbs[breadcrumbs.length - 2] || null);
                  }
                } else {
                  await supabase.from("archivos_apuntes").delete().eq("id", item.id);
                  if (viewerFile?.id === item.id) setViewerFile(null);
                }
                setDeleteConfirmData(null);
                fetchContents();
                onCountChange?.();
              }}
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Move Dialog */}
      <DialogoMover
        isOpen={!!itemToMove}
        onClose={() => setItemToMove(null)}
        itemToMove={itemToMove}
        onConfirm={async (newMateriaId, newFolderId) => {
          if (!itemToMove) return;
          setLoading(true);
          const { type, item } = itemToMove;
          if (type === "folder") {
            await supabase
              .from("carpetas_apuntes")
              .update({ materia_id: newMateriaId, parent_id: newFolderId })
              .eq("id", item.id);
          } else {
            await supabase
              .from("archivos_apuntes")
              .update({ carpeta_id: newFolderId })
              .eq("id", item.id);
            if (viewerFile?.id === item.id) setViewerFile(null);
          }
          setItemToMove(null);
          fetchContents();
        }}
      />

      {/* Collaborators Dialog */}
      <Dialog open={!!collaboratorsDialogData} onOpenChange={(open) => !open && setCollaboratorsDialogData(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="pr-8 leading-snug">
              Colaboradores de {collaboratorsDialogData?.file?.nombre}
            </DialogTitle>
            <DialogDescription className="text-xs mt-1">
              Usuarios que han aportado páginas o archivos a este apunte.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2 py-1 max-h-[60vh] overflow-y-auto custom-scrollbar pr-1">
            {collaboratorsDialogData?.collaborators.length === 0 ? (
              <p className="text-center text-sm text-neutral-500 py-4">Aún no hay colaboradores.</p>
            ) : (
              collaboratorsDialogData?.collaborators.map((collab) => (
                <Link
                  key={collab.id}
                  href={`/perfil/${collab.apodo || collab.id}`}
                  className="flex items-center gap-3 p-2 rounded-lg border border-neutral-100 dark:border-neutral-800/60 bg-neutral-50/50 dark:bg-neutral-900/30 hover:bg-white dark:hover:bg-neutral-800 hover:border-purple-200 dark:hover:border-purple-500/30 hover:shadow-sm transition-all group"
                >
                  <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 font-bold text-xs shrink-0 overflow-hidden">
                    {collab.avatar_url ? (
                      <img src={collab.avatar_url} alt={collab.nombre_completo || "Colaborador"} className="w-full h-full object-cover" />
                    ) : (
                      collab.nombre_completo?.[0]?.toUpperCase() || "U"
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-neutral-900 dark:text-white truncate leading-tight">
                      {collab.id === currentUser?.id ? "Tú" : collab.nombre_completo || "Usuario"}
                    </p>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5 truncate">
                      {collab.pageCount || 1} {collab.pageCount === 1 ? "página aportada" : "páginas aportadas"}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-neutral-300 group-hover:text-purple-500 transition-colors shrink-0" />
                </Link>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Multi PDF Upload Modal */}
      <MultiPdfUploadModal
        isOpen={isPdfUploadModalOpen}
        files={selectedPdfFiles}
        onClose={() => {
          setIsPdfUploadModalOpen(false);
          setSelectedPdfFiles([]);
        }}
        onUpload={async (optimizedFiles) => {
          if (!currentFolder) return;
          setIsUploadingFile(true);
          setUploadProgress(0);

          let completed = 0;

          const uploadPromises = optimizedFiles.map((file) => {
            return new Promise<void>((resolve, reject) => {
              const storageRef = ref(storage, `apuntes/${currentFolder.id}/${uuidv4()}_${file.name}`);
              const uploadTask = uploadBytesResumable(storageRef, file);

              uploadTask.on(
                "state_changed",
                () => {},
                (error) => {
                  console.error(error);
                  reject(error);
                },
                async () => {
                  const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                  await supabase.from("archivos_apuntes").insert({
                    carpeta_id: currentFolder.id,
                    tipo: "pdf",
                    nombre: file.name,
                    url_archivo: downloadURL,
                    creador_id: currentUser?.id,
                  });
                  completed++;
                  setUploadProgress((completed / optimizedFiles.length) * 100);
                  resolve();
                }
              );
            });
          });

          try {
            await Promise.all(uploadPromises);
          } catch (e) {
            console.error(e);
          } finally {
            setIsUploadingFile(false);
            setUploadProgress(0);
            setIsPdfUploadModalOpen(false);
            setSelectedPdfFiles([]);
            fetchContents();
            onCountChange?.();
          }
        }}
      />
    </div>
  );
}
