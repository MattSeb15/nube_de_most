"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Explorador } from "@/components/apuntes/Explorador";
import { VisorPDF } from "@/components/apuntes/VisorPDF";
import { VisorCuaderno } from "@/components/apuntes/VisorCuaderno";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, FolderPlus, UploadCloud, Loader2 } from "lucide-react";
import type { CarpetaApunte, ArchivoApunte } from "@/types";
import { v4 as uuidv4 } from "uuid";
import { uploadBytesResumable, ref, getDownloadURL } from "firebase/storage";
import { storage } from "@/utils/firebase/config";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EmptyState } from "@/components/ui/empty-state";
import { BookOpen } from "lucide-react";

export function AdminApuntesPanel() {
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

  const [deleteConfirmData, setDeleteConfirmData] = useState<{type: 'folder' | 'file', item: any} | null>(null);
  
  // Modals
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderType, setNewFolderType] = useState<"normal" | "cuaderno">("normal");
  const [newFolderColaborativa, setNewFolderColaborativa] = useState(false);
  const [isCreatingNotebook, setIsCreatingNotebook] = useState(false);
  const [newNotebookName, setNewNotebookName] = useState("");
  const [itemToRename, setItemToRename] = useState<{type: "folder" | "file", item: any} | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Materias
  const [materias, setMaterias] = useState<any[]>([]);
  const [selectedMateriaId, setSelectedMateriaId] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
    fetchMaterias();
  }, []);

  const fetchMaterias = async () => {
    const { data } = await supabase.from("materias").select("id, nombre, codigo").order("nombre");
    if (data) setMaterias(data);
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

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setCurrentUser(user);
    }
  };

  const fetchContents = async () => {
    setLoading(true);
    const parentId = currentFolder ? currentFolder.id : null;

    let foldersQuery = supabase.from("carpetas_apuntes").select("*, perfiles!creador_id(nombre_completo, rol), archivos_apuntes(count)").order("nombre");
    if (parentId) foldersQuery = foldersQuery.eq("parent_id", parentId);
    else foldersQuery = foldersQuery.is("parent_id", null).eq("materia_id", selectedMateriaId);

    const { data: fData } = await foldersQuery;
    setFolders(fData || []);

    if (parentId) {
      const { data: fileData } = await supabase.from("archivos_apuntes").select("*, perfiles!creador_id(nombre_completo, rol)").eq("carpeta_id", parentId).order("nombre");
      setFiles(fileData || []);
    } else {
      setFiles([]);
    }

    setLoading(false);
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    setIsCreatingFolder(false);
    setLoading(true);
    
    await supabase.from("carpetas_apuntes").insert({
      nombre: newFolderName,
      descripcion: "",
      parent_id: currentFolder?.id || null,
      materia_id: currentFolder?.materiaId || selectedMateriaId,
      creador_id: currentUser.id,
      visible: true,
      colaborativa: newFolderColaborativa,
      tipo: newFolderType,
    });
    
    setNewFolderName("");
    setNewFolderType("normal");
    setNewFolderColaborativa(false);
    fetchContents();
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
      nombre: newNotebookName,
      creador_id: currentUser.id,
    });
    
    setNewNotebookName("");
    fetchContents();
  };

  const handleRenameSubmit = async () => {
    if (!renameValue.trim() || !itemToRename) return;
    setLoading(true);
    const table = itemToRename.type === "folder" ? "carpetas_apuntes" : "archivos_apuntes";
    await supabase.from(table).update({ nombre: renameValue }).eq("id", itemToRename.item.id);
    setItemToRename(null);
    setRenameValue("");
    fetchContents();
  };

  const handleDeleteItem = async (type: "folder" | "file", item: any) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar ${type === 'folder' ? 'la carpeta' : 'el archivo'} "${item.nombre}"?`)) {
      setLoading(true);
      const table = type === "folder" ? "carpetas_apuntes" : "archivos_apuntes";
      await supabase.from(table).delete().eq("id", item.id);
      
      if (type === 'folder' && currentFolder?.id === item.id) handleNavigateBreadcrumb(breadcrumbs[breadcrumbs.length - 2] || null);
      if (type === 'file' && showPdfViewer?.id === item.id) setShowPdfViewer(null);
      if (type === 'file' && showNotebookViewer?.id === item.id) setShowNotebookViewer(null);
      
      fetchContents();
    }
  };

  const handleNavigateBreadcrumb = (folder: CarpetaApunte | null) => {
    if (!folder) {
      setCurrentFolder(null);
      setBreadcrumbs([]);
    } else {
      const index = breadcrumbs.findIndex(b => b.id === folder.id);
      if (index !== -1) {
        setBreadcrumbs(breadcrumbs.slice(0, index + 1));
        setCurrentFolder(folder);
      }
    }
    setShowPdfViewer(null);
    setShowNotebookViewer(null);
  };

  const handleFolderClick = (folder: CarpetaApunte) => {
    setCurrentFolder(folder);
    setBreadcrumbs([...breadcrumbs, folder]);
    setShowPdfViewer(null);
    setShowNotebookViewer(null);
  };

  const handleFileClick = (file: ArchivoApunte) => {
    if (file.tipo === "pdf") {
      if (showPdfViewer?.id === file.id) setShowPdfViewer(null);
      else { setShowNotebookViewer(null); setShowPdfViewer(file); }
    } else {
      if (showNotebookViewer?.id === file.id) setShowNotebookViewer(null);
      else { setShowPdfViewer(null); setShowNotebookViewer(file); }
    }
  };

  const hasViewer = !!(showPdfViewer || showNotebookViewer);

  const uploadFileToFirebase = async (file: File, type: "pdf" | "cuaderno") => {
    if (!currentFolder) {
      alert("Debes estar dentro de una carpeta para subir archivos.");
      return;
    }
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
          creador_id: currentUser.id,
        });

        setIsUploadingFile(false);
        setUploadProgress(0);
        fetchContents();
      }
    );
  };

  return (
    <div className="w-full text-neutral-900 dark:text-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 border-b border-neutral-200 dark:border-neutral-800 pb-4 gap-4">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl font-bold">Gestor de Apuntes</h2>
          <Select value={selectedMateriaId || ""} onValueChange={(val) => {
            setSelectedMateriaId(val);
            setCurrentFolder(null);
            setBreadcrumbs([]);
          }}>
            <SelectTrigger className="w-[300px] bg-white dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white">
              <SelectValue placeholder="Seleccionar Materia..." />
            </SelectTrigger>
            <SelectContent>
              {materias.map((m) => (
                <SelectItem key={m.id} value={m.id}>{m.codigo} - {m.nombre}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {selectedMateriaId && (
          <div className="flex flex-wrap gap-2">
            {(!currentFolder || currentFolder.tipo !== "cuaderno") && (
              <Button onClick={() => setIsCreatingFolder(true)} size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
                <FolderPlus className="w-4 h-4 mr-2" /> Nueva Carpeta
              </Button>
            )}
          {currentFolder && (
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
        </div>
        )}
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

      {isCreatingFolder && (
        <div className="mb-6 p-4 bg-neutral-50 dark:bg-neutral-900/50 rounded-xl border border-neutral-200 dark:border-neutral-800 flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Nombre de la carpeta..."
              className="flex-1 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-md px-4 py-2 text-neutral-900 dark:text-white focus:outline-none focus:border-primary"
              autoFocus
              onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()}
            />
            <Button onClick={handleCreateFolder} className="bg-green-600 hover:bg-green-700 text-white">
              Crear
            </Button>
            <Button variant="outline" onClick={() => { setIsCreatingFolder(false); setNewFolderType("normal"); }} className="text-neutral-900 dark:text-white border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800">
              Cancelar
            </Button>
          </div>
          <div className="flex items-center gap-2 px-2">
            <input 
              type="checkbox" 
              id="isNotebookFolder" 
              checked={newFolderType === "cuaderno"} 
              onChange={(e) => setNewFolderType(e.target.checked ? "cuaderno" : "normal")}
              className="w-4 h-4 text-purple-600 rounded border-neutral-300"
            />
            <label htmlFor="isNotebookFolder" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Esta es una carpeta exclusiva para cuadernos
            </label>
          </div>
          <div className="flex items-center gap-2 px-2">
            <input 
              type="checkbox" 
              id="isColaborativaFolder" 
              checked={newFolderColaborativa} 
              onChange={(e) => setNewFolderColaborativa(e.target.checked)}
              className="w-4 h-4 text-green-600 rounded border-neutral-300"
            />
            <label htmlFor="isColaborativaFolder" className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Hacer esta carpeta colaborativa (los usuarios podrán subir archivos)
            </label>
          </div>
        </div>
      )}

      {isCreatingNotebook && (
        <div className="mb-6 p-4 bg-neutral-50 dark:bg-neutral-900/50 rounded-xl border border-neutral-200 dark:border-neutral-800 flex items-center gap-4">
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

      {itemToRename && (
        <div className="mb-6 p-4 bg-neutral-50 dark:bg-neutral-900/50 rounded-xl border border-neutral-200 dark:border-neutral-800 flex items-center gap-4 animate-fade-in">
          <input
            type="text"
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            placeholder="Nuevo nombre..."
            className="flex-1 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-md px-4 py-2 text-neutral-900 dark:text-white focus:outline-none focus:border-blue-500"
            autoFocus
            onKeyDown={(e) => e.key === "Enter" && handleRenameSubmit()}
          />
          <Button onClick={handleRenameSubmit} className="bg-blue-600 hover:bg-blue-700 text-white">
            Guardar
          </Button>
          <Button variant="outline" onClick={() => { setItemToRename(null); setRenameValue(""); }} className="text-neutral-900 dark:text-white border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800">
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
          ) : !selectedMateriaId ? (
            <div className="py-12">
              <EmptyState
                icon={BookOpen}
                title="Selecciona una materia"
                description="Elige una materia del menú superior para empezar a gestionar sus carpetas y archivos."
              />
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
              isAdmin={true}
              onRenameClick={(type, item) => {
                setItemToRename({ type, item });
                setRenameValue(item.nombre);
              }}
              onDeleteClick={(type, item) => setDeleteConfirmData({ type, item })}
              onToggleCollaborative={handleToggleCollaborative}
              selectedFile={showPdfViewer || showNotebookViewer}
              isCompact={hasViewer}
            />
          )}
        </div>

        {hasViewer && (
          <div className="w-full lg:flex-1 transition-all duration-500 ease-in-out animate-fade-in">
            {showPdfViewer && (
              <VisorPDF file={showPdfViewer} onClose={() => setShowPdfViewer(null)} />
            )}
            
            {showNotebookViewer && (
              <VisorCuaderno file={showNotebookViewer} onClose={() => setShowNotebookViewer(null)} currentUserId={currentUser?.id} isAdmin={true} />
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
    </div>
  );
}
