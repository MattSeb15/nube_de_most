"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Explorador } from "@/components/apuntes/Explorador";
import { VisorPDF } from "@/components/apuntes/VisorPDF";
import { VisorCuaderno } from "@/components/apuntes/VisorCuaderno";
import { Loader2, RefreshCw, Plus, UploadCloud, BookOpen, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TrackVisit } from "@/components/ui/TrackVisit";
import type { CarpetaApunte, ArchivoApunte } from "@/types";
import { v4 as uuidv4 } from "uuid";
import { uploadBytesResumable, ref, getDownloadURL } from "firebase/storage";
import { storage } from "@/utils/firebase/config";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ExploradorMateriaProps {
  materiaId: string;
  initialFileId?: string;
}

export function ExploradorMateria({ materiaId, initialFileId }: ExploradorMateriaProps) {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentFolder, setCurrentFolder] = useState<CarpetaApunte | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<CarpetaApunte[]>([]);
  const [folders, setFolders] = useState<CarpetaApunte[]>([]);
  const [files, setFiles] = useState<ArchivoApunte[]>([]);

  // UI States
  const [showPdfViewer, setShowPdfViewer] = useState<ArchivoApunte | null>(null);
  const [showNotebookViewer, setShowNotebookViewer] = useState<ArchivoApunte | null>(null);
  
  // Effect to load initial file (notebook or pdf)
  useEffect(() => {
    if (initialFileId) {
      const fetchInitialFile = async () => {
        const { data } = await supabase.from("archivos_apuntes").select("*").eq("id", initialFileId).single();
        if (data) {
          if (data.tipo === "pdf") {
            setShowPdfViewer(data);
          } else {
            setShowNotebookViewer(data);
          }
        }
      };
      fetchInitialFile();
    }
  }, [initialFileId, supabase]);
  
  // Upload States
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isCreatingNotebook, setIsCreatingNotebook] = useState(false);
  const [newNotebookName, setNewNotebookName] = useState("");

  const [deleteConfirmData, setDeleteConfirmData] = useState<{type: 'folder' | 'file', item: any} | null>(null);
  const [collaboratorsDialogData, setCollaboratorsDialogData] = useState<{file: any, collaborators: any[]} | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    fetchContents();
  }, [currentFolder, materiaId]);

  const fetchContents = async () => {
    setLoading(true);
    const parentId = currentFolder ? currentFolder.id : null;

    let foldersQuery = supabase
      .from("carpetas_apuntes")
      .select("*, perfiles!creador_id(nombre_completo, rol), archivos_apuntes(creador_id, perfiles!creador_id(id, nombre_completo), paginas_cuaderno(creador_id, perfiles!creador_id(id, nombre_completo)))")
      .eq("visible", true)
      .order("nombre");

    if (parentId) {
      foldersQuery = foldersQuery.eq("parent_id", parentId);
    } else {
      foldersQuery = foldersQuery.is("parent_id", null).eq("materia_id", materiaId);
    }

    const { data: fData } = await foldersQuery;
    setFolders(fData || []);

    if (parentId) {
      const { data: fileData } = await supabase
        .from("archivos_apuntes")
        .select("*, perfiles!creador_id(nombre_completo, rol), paginas_cuaderno(creador_id, perfiles!creador_id(id, nombre_completo))")
        .eq("carpeta_id", parentId)
        .order("nombre");
      setFiles(fileData || []);
    } else {
      setFiles([]);
    }

    setLoading(false);
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
    setShowPdfViewer(null);
    setShowNotebookViewer(null);
  };

  const handleFolderClick = (folder: CarpetaApunte) => {
    setCurrentFolder(folder);
    setBreadcrumbs(prev => {
      if (prev.some(c => c.id === folder.id)) return prev;
      return [...prev, folder];
    });
    setShowPdfViewer(null);
    setShowNotebookViewer(null);
  };

  const handleFileClick = (file: ArchivoApunte) => {
    if (file.tipo === "pdf") {
      if (showPdfViewer?.id === file.id) {
        setShowPdfViewer(null);
      } else {
        setShowNotebookViewer(null);
        setShowPdfViewer(file);
      }
    } else {
      if (showNotebookViewer?.id === file.id) {
        setShowNotebookViewer(null);
      } else {
        setShowPdfViewer(null);
        setShowNotebookViewer(file);
      }
    }
  };

  const handleCreateNotebook = async () => {
    if (!newNotebookName.trim() || !currentFolder) return;
    setIsCreatingNotebook(false);
    setLoading(true);
    
    await supabase.from("archivos_apuntes").insert({
      carpeta_id: currentFolder.id,
      tipo: "cuaderno",
      nombre: newNotebookName,
      creador_id: currentUser?.id,
    });
    
    setNewNotebookName("");
    fetchContents();
  };

  const uploadFileToFirebase = async (file: File, type: "pdf" | "cuaderno") => {
    if (!currentFolder) return;
    setIsUploadingFile(true);
    const storageRef = ref(storage, `apuntes/${currentFolder.id}/${uuidv4()}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      },
      (error) => {
        console.error(error);
        setIsUploadingFile(false);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        
        await supabase.from("archivos_apuntes").insert({
          carpeta_id: currentFolder.id,
          tipo: type,
          nombre: file.name,
          url_archivo: downloadURL,
          creador_id: currentUser?.id,
        });

        setIsUploadingFile(false);
        setUploadProgress(0);
        fetchContents();
      }
    );
  };

  const hasViewer = !!(showPdfViewer || showNotebookViewer);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
        <h2 className="text-xl font-bold">Apuntes</h2>
        
        <div className="flex items-center gap-2">
          {currentFolder?.colaborativa && currentUser && (
            <>
              {currentFolder.tipo !== "cuaderno" && (
                <label className="cursor-pointer bg-red-600 hover:bg-red-700 text-white h-9 px-4 rounded-lg flex items-center justify-center text-sm font-medium transition-colors">
                  <UploadCloud className="w-4 h-4 mr-2" /> Subir PDF
                  <input
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) uploadFileToFirebase(e.target.files[0], "pdf");
                    }}
                  />
                </label>
              )}
              {currentFolder.tipo === "cuaderno" && (
                <Button onClick={() => {
                  setNewNotebookName(`Cuaderno de ${currentUser?.user_metadata?.full_name || "Alumno"}`);
                  setIsCreatingNotebook(true);
                }} size="lg" className="bg-purple-600 hover:bg-purple-700 text-white">
                  <Plus className="w-4 h-4 mr-2" /> Nuevo Cuaderno
                </Button>
              )}
            </>
          )}

          <Button 
            variant="outline" 
            size="lg" 
            onClick={fetchContents} 
            disabled={loading}
            className="text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-800"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
        </div>
      </div>

      {isUploadingFile && (
        <div className="mb-6 p-4 bg-neutral-50 dark:bg-neutral-900/50 rounded-xl border border-neutral-200 dark:border-neutral-800">
          <div className="flex justify-between mb-2">
            <span className="text-sm">Subiendo archivo...</span>
            <span className="text-sm font-mono">{Math.round(uploadProgress)}%</span>
          </div>
          <div className="w-full bg-neutral-200 dark:bg-neutral-800 rounded-full h-2">
            <div className="bg-blue-500 h-2 rounded-full transition-all" style={{ width: `${uploadProgress}%` }}></div>
          </div>
        </div>
      )}

      {isCreatingNotebook && (
        <div className="mb-6 p-4 bg-neutral-50 dark:bg-neutral-900/50 rounded-xl border border-neutral-200 dark:border-neutral-800 flex items-center gap-4 animate-fade-in">
          <BookOpen className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <input
            type="text"
            value={newNotebookName}
            onChange={(e) => setNewNotebookName(e.target.value)}
            placeholder="Nombre del cuaderno..."
            className="flex-1 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-md px-4 py-2 text-neutral-900 dark:text-white focus:outline-none focus:border-purple-500"
            autoFocus
            onKeyDown={(e) => e.key === "Enter" && handleCreateNotebook()}
          />
          <Button onClick={handleCreateNotebook} className="bg-purple-600 hover:bg-purple-700 text-white">
            Crear
          </Button>
          <Button variant="outline" onClick={() => setIsCreatingNotebook(false)} className="text-neutral-900 dark:text-white border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800">
            Cancelar
          </Button>
        </div>
      )}

      <div className="flex flex-col lg:flex-row w-full gap-6 items-start transition-all duration-500 ease-in-out">
        <div className={`transition-all duration-500 ease-in-out ${hasViewer ? "w-full lg:w-1/3 xl:w-1/4 shrink-0" : "w-full"}`}>
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          ) : (
            <Explorador
              currentFolder={currentFolder}
              breadcrumbs={breadcrumbs}
              folders={folders}
              files={files}
              onFolderClick={handleFolderClick}
              onFileClick={handleFileClick}
              onNavigateBreadcrumb={handleNavigateBreadcrumb}
              isAdmin={false} // Users don't see edit/delete dots
              selectedFile={showPdfViewer || showNotebookViewer}
              isCompact={hasViewer}
              currentUser={currentUser}
              onToggleCollaborative={async (type, item) => {
                setLoading(true);
                const table = type === 'folder' ? 'carpetas_apuntes' : 'archivos_apuntes';
                await supabase.from(table).update({ colaborativa: !item.colaborativa }).eq("id", item.id);
                fetchContents();
              }}
              onCollaboratorsClick={(file, collaborators) => setCollaboratorsDialogData({ file, collaborators })}
              onDeleteClick={(type, item) => setDeleteConfirmData({ type, item })}
            />
          )}
        </div>

        {hasViewer && (
          <div className="w-full lg:flex-1 transition-all duration-500 ease-in-out animate-fade-in">
            {showPdfViewer && (
              <>
                <TrackVisit entidadId={showPdfViewer.id} tipoEntidad="apunte" />
                <VisorPDF file={showPdfViewer} onClose={() => setShowPdfViewer(null)} />
              </>
            )}
            {showNotebookViewer && (
              <>
                <TrackVisit entidadId={showNotebookViewer.id} tipoEntidad="apunte" />
                <VisorCuaderno
                  file={showNotebookViewer}
                  onClose={() => setShowNotebookViewer(null)}
                  currentUserId={currentUser?.id}
                />
              </>
            )}
          </div>
        )}
      </div>

      <Dialog open={!!deleteConfirmData} onOpenChange={(open) => !open && setDeleteConfirmData(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar {deleteConfirmData?.type === 'folder' ? 'carpeta' : 'cuaderno'}</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que quieres eliminar <strong>{deleteConfirmData?.item?.nombre}</strong> de forma permanente? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmData(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={async () => {
              if (!deleteConfirmData) return;
              setLoading(true);
              const { type, item } = deleteConfirmData;
              if (type === 'folder') {
                await supabase.from("carpetas_apuntes").delete().eq("id", item.id);
              } else {
                await supabase.from("archivos_apuntes").delete().eq("id", item.id);
                if (showNotebookViewer?.id === item.id) setShowNotebookViewer(null);
                if (showPdfViewer?.id === item.id) setShowPdfViewer(null);
              }
              setDeleteConfirmData(null);
              fetchContents();
            }}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!collaboratorsDialogData} onOpenChange={(open) => !open && setCollaboratorsDialogData(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="pr-8 leading-snug">Colaboradores de {collaboratorsDialogData?.file?.nombre}</DialogTitle>
            <DialogDescription className="text-xs mt-1">
              Usuarios que han aportado {collaboratorsDialogData?.file?.paginas_cuaderno ? 'páginas' : 'archivos'}.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2 py-1 max-h-[60vh] overflow-y-auto custom-scrollbar pr-1">
            {collaboratorsDialogData?.collaborators.length === 0 ? (
              <p className="text-center text-sm text-neutral-500 py-4">Aún no hay colaboradores.</p>
            ) : (
              collaboratorsDialogData?.collaborators.map((collab) => (
                <Link
                  key={collab.id}
                  href={`/perfil/${collab.id}`}
                  className="flex items-center gap-3 p-2 rounded-lg border border-neutral-100 dark:border-neutral-800/60 bg-neutral-50/50 dark:bg-neutral-900/30 hover:bg-white dark:hover:bg-neutral-800 hover:border-purple-200 dark:hover:border-purple-500/30 hover:shadow-sm transition-all group"
                >
                  <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 font-bold text-xs shrink-0">
                    {collab.nombre_completo?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-neutral-900 dark:text-white truncate leading-tight">
                      {collab.id === currentUser?.id ? "Tú" : collab.nombre_completo || "Usuario"}
                    </p>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5 truncate">
                      {collab.pageCount || 1} {collab.pageCount === 1 ? (collaboratorsDialogData?.file?.paginas_cuaderno ? 'página aportada' : 'archivo aportado') : (collaboratorsDialogData?.file?.paginas_cuaderno ? 'páginas aportadas' : 'archivos aportados')}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-neutral-300 group-hover:text-purple-500 transition-colors shrink-0" />
                </Link>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
