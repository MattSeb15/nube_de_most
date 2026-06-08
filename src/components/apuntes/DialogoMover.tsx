"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Folder, ChevronRight, ArrowLeft, BookOpen } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import type { Semestre, Materia, CarpetaApunte } from "@/types";

interface DialogoMoverProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (materiaId: string, folderId: string | null) => void;
  itemToMove: { type: "folder" | "file"; item: any } | null;
}

export function DialogoMover({ isOpen, onClose, onConfirm, itemToMove }: DialogoMoverProps) {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  
  // Navigation states
  const [semestres, setSemestres] = useState<Semestre[]>([]);
  const [selectedMateria, setSelectedMateria] = useState<Materia | null>(null);
  const [currentFolder, setCurrentFolder] = useState<CarpetaApunte | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<CarpetaApunte[]>([]);
  const [folders, setFolders] = useState<CarpetaApunte[]>([]);

  useEffect(() => {
    if (isOpen) {
      // Reset state
      setSelectedMateria(null);
      setCurrentFolder(null);
      setBreadcrumbs([]);
      setFolders([]);
      fetchSemestres();
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedMateria) {
      fetchFolders(selectedMateria.id, currentFolder?.id || null);
    }
  }, [selectedMateria, currentFolder]);

  const fetchSemestres = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("semestres")
      .select("*, materias(id, nombre, color)")
      .order("created_at", { ascending: true });

    if (!error && data) {
      const formatted = data.map((s: any) => ({
        id: s.id,
        nombre: s.nombre,
        materiasList: s.materias || [],
      })) as Semestre[];
      setSemestres(formatted);
    }
    setLoading(false);
  };

  const fetchFolders = async (materiaId: string, parentId: string | null) => {
    setLoading(true);
    let query = supabase
      .from("carpetas_apuntes")
      .select("*")
      .eq("materia_id", materiaId)
      .order("nombre");

    if (parentId) {
      query = query.eq("parent_id", parentId);
    } else {
      query = query.is("parent_id", null);
    }

    const { data } = await query;
    if (data) {
      // Filter out the folder itself if we are moving a folder (to prevent moving inside itself)
      let filteredData = data;
      if (itemToMove?.type === "folder") {
        filteredData = data.filter((f) => f.id !== itemToMove.item.id);
      }
      setFolders(filteredData);
    }
    setLoading(false);
  };

  const handleMateriaClick = (materia: any) => {
    setSelectedMateria(materia);
    setCurrentFolder(null);
    setBreadcrumbs([]);
  };

  const handleFolderClick = (folder: CarpetaApunte) => {
    setCurrentFolder(folder);
    setBreadcrumbs([...breadcrumbs, folder]);
  };

  const handleNavigateBreadcrumb = (folder: CarpetaApunte | null) => {
    if (!folder) {
      setCurrentFolder(null);
      setBreadcrumbs([]);
    } else {
      const idx = breadcrumbs.findIndex((c) => c.id === folder.id);
      setCurrentFolder(folder);
      setBreadcrumbs(breadcrumbs.slice(0, idx + 1));
    }
  };

  const isFileAtRoot = itemToMove?.type === "file" && currentFolder === null;
  const isMovingToSameLocation = () => {
    if (!itemToMove) return true;
    if (itemToMove.type === "folder") {
      // If moving a folder, check if target parent matches current parent
      const currentParent = itemToMove.item.parent_id;
      const currentMat = itemToMove.item.materia_id;
      const targetParent = currentFolder?.id || null;
      const targetMat = selectedMateria?.id;
      return currentParent === targetParent && currentMat === targetMat;
    } else {
      // If moving a file, check if target folder matches current folder
      const currentCarpeta = itemToMove.item.carpeta_id;
      const targetCarpeta = currentFolder?.id;
      return currentCarpeta === targetCarpeta;
    }
  };

  const canMove = selectedMateria !== null && !isFileAtRoot && !isMovingToSameLocation() && !loading;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Mover {itemToMove?.type === "folder" ? "Carpeta" : "Archivo"}</DialogTitle>
          <DialogDescription className="truncate">
            Moviendo: <span className="font-semibold">{itemToMove?.item?.nombre}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto min-h-[300px] bg-neutral-50 dark:bg-neutral-900/30 rounded-md border border-neutral-200 dark:border-neutral-800 p-2">
          {loading && semestres.length === 0 ? (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
            </div>
          ) : !selectedMateria ? (
            // VIEW: Seleccionar Materia
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-neutral-500 px-2 pt-2">Selecciona una Materia Destino</h3>
              {semestres.map((semestre) => (
                <div key={semestre.id} className="px-2">
                  <h4 className="text-xs font-bold text-neutral-400 mb-2 uppercase">{semestre.nombre}</h4>
                  <div className="grid grid-cols-1 gap-2">
                    {semestre.materiasList?.map((m: any) => (
                      <button
                        key={m.id}
                        onClick={() => handleMateriaClick(m)}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-white dark:hover:bg-neutral-800 border border-transparent hover:border-neutral-200 dark:hover:border-neutral-700 transition-colors text-left"
                      >
                        <div
                          className="w-8 h-8 rounded-md flex items-center justify-center shrink-0"
                          style={{ backgroundColor: `${m.color}20`, color: m.color }}
                        >
                          <BookOpen className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-medium">{m.nombre}</span>
                      </button>
                    ))}
                    {(!semestre.materiasList || semestre.materiasList.length === 0) && (
                      <span className="text-xs text-neutral-500 italic px-2">Sin materias</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // VIEW: Seleccionar Carpeta
            <div className="flex flex-col h-full">
              <div className="flex items-center gap-2 mb-3 pb-3 border-b border-neutral-200 dark:border-neutral-800 px-2 sticky top-0 bg-neutral-50 dark:bg-neutral-900/30 z-10">
                <button
                  onClick={() => setSelectedMateria(null)}
                  className="p-1 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-md transition-colors"
                  title="Volver a Materias"
                >
                  <ArrowLeft className="w-4 h-4 text-neutral-500" />
                </button>
                <div className="flex-1 flex items-center overflow-x-auto scrollbar-hide text-sm">
                  <button
                    onClick={() => handleNavigateBreadcrumb(null)}
                    className="hover:text-purple-600 transition-colors whitespace-nowrap text-neutral-600 dark:text-neutral-400 font-medium"
                  >
                    Raíz ({selectedMateria.nombre})
                  </button>
                  {breadcrumbs.map((crumb) => (
                    <React.Fragment key={crumb.id}>
                      <ChevronRight className="w-3 h-3 mx-1 text-neutral-400 shrink-0" />
                      <button
                         onClick={() => handleNavigateBreadcrumb(crumb)}
                         className="hover:text-purple-600 transition-colors whitespace-nowrap text-neutral-600 dark:text-neutral-400 font-medium truncate max-w-[100px]"
                         title={crumb.nombre}
                      >
                        {crumb.nombre}
                      </button>
                    </React.Fragment>
                  ))}
                </div>
              </div>

              <div className="flex-1 px-2 space-y-1">
                {loading ? (
                   <div className="flex justify-center py-8">
                     <Loader2 className="w-5 h-5 animate-spin text-purple-500" />
                   </div>
                ) : folders.length === 0 ? (
                  <div className="text-center py-8 text-neutral-500 text-sm">
                    No hay carpetas aquí.
                  </div>
                ) : (
                  folders.map((folder) => (
                    <button
                      key={folder.id}
                      onClick={() => handleFolderClick(folder)}
                      className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white dark:hover:bg-neutral-800 border border-transparent hover:border-neutral-200 dark:hover:border-neutral-700 transition-colors text-left"
                    >
                      <Folder className="w-5 h-5 text-blue-500 shrink-0" fill="currentColor" />
                      <span className="text-sm font-medium truncate flex-1">{folder.nombre}</span>
                      <ChevronRight className="w-4 h-4 text-neutral-400" />
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="mt-4 gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={() => selectedMateria && onConfirm(selectedMateria.id, currentFolder?.id || null)}
            disabled={!canMove}
            className="bg-purple-600 hover:bg-purple-700 text-white"
            title={
              isFileAtRoot 
                ? "Los archivos deben estar dentro de una carpeta" 
                : isMovingToSameLocation() 
                  ? "Ya se encuentra en esta ubicación" 
                  : undefined
            }
          >
            Mover aquí
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
