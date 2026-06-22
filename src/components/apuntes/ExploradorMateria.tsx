"use client";

import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Explorador } from "@/components/apuntes/Explorador";
import { VisorPDF } from "@/components/apuntes/VisorPDF";
import { VisorCuaderno } from "@/components/apuntes/VisorCuaderno";
import { DialogoMover } from "@/components/apuntes/DialogoMover";
import { MultiPdfUploadModal } from "@/components/apuntes/MultiPdfUploadModal";
import { Loader2, RefreshCw, Plus, UploadCloud, BookOpen, ChevronRight, Search, Share, FileText, LayoutGrid, List as ListIcon, ArrowDownWideNarrow, ArrowUpNarrowWide, ArrowDownAZ, ArrowUpAZ } from "lucide-react";
import { ShareDialog } from "@/components/ui/share-dialog";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { TrackVisit } from "@/components/ui/TrackVisit";
import { MateriaIcon } from "@/components/ui/materia-icon";
import { CacheUtils } from "@/lib/cache";
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
  materia: any;
  initialFileId?: string;
  initialFolderId?: string;
}

export function ExploradorMateria({ materia, initialFileId, initialFolderId }: ExploradorMateriaProps) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const allFoldersRef = React.useRef<CarpetaApunte[]>([]);

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentFolder, setCurrentFolder] = useState<CarpetaApunte | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<CarpetaApunte[]>([]);
  const [folders, setFolders] = useState<CarpetaApunte[]>([]);
  const [files, setFiles] = useState<ArchivoApunte[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [totalStats, setTotalStats] = useState({ pdfs: 0, cuadernos: 0 });
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'fecha' | 'nombre'>('fecha');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Redirect if initialFileId is provided
  useEffect(() => {
    if (initialFileId) {
      router.replace(`/apuntes/documento/${initialFileId}`);
    }
  }, [initialFileId, router]);
  
  // Upload States
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isCreatingNotebook, setIsCreatingNotebook] = useState(false);
  const [newNotebookName, setNewNotebookName] = useState("");
  const [isPdfUploadModalOpen, setIsPdfUploadModalOpen] = useState(false);
  const [selectedPdfFiles, setSelectedPdfFiles] = useState<File[]>([]);

  const [deleteConfirmData, setDeleteConfirmData] = useState<{type: 'folder' | 'file', item: any} | null>(null);
  const [collaboratorsDialogData, setCollaboratorsDialogData] = useState<{file: any, collaborators: any[]} | null>(null);
  const [itemToMove, setItemToMove] = useState<{type: 'folder' | 'file', item: any} | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const folderId = params.get("folder");
      
      const view = params.get('view') as 'grid' | 'list';
      if (view === 'grid' || view === 'list') setViewMode(view);
      else setViewMode('grid');

      const sb = params.get('sortBy') as 'fecha' | 'nombre';
      if (sb === 'fecha' || sb === 'nombre') setSortBy(sb);
      else setSortBy('fecha');

      const so = params.get('sortOrder') as 'asc' | 'desc';
      if (so === 'asc' || so === 'desc') setSortOrder(so);
      else setSortOrder('desc');

      if (!folderId) {
        setCurrentFolder(null);
        setBreadcrumbs([]);
      } else {
        const targetFolder = allFoldersRef.current.find((f: any) => f.id === folderId || f.slug === folderId);
        if (targetFolder) {
          const newBreadcrumbs: CarpetaApunte[] = [];
          let curr: any = targetFolder;
          while (curr) {
            newBreadcrumbs.unshift(curr);
            curr = allFoldersRef.current.find((f: any) => f.id === curr?.parent_id);
          }
          setBreadcrumbs(newBreadcrumbs);
          setCurrentFolder(targetFolder);
        } else {
          setCurrentFolder({ id: folderId } as any);
        }
      }
    };
    
    // Init from URL on mount
    handlePopState();
    
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    fetchContents();
  }, [currentFolder, materia.id]);

  const fetchContents = async () => {
    const folderCacheKey = `folders_${materia.id}`;
    const cachedFolders = CacheUtils.get<any[]>(folderCacheKey);
    
    if (cachedFolders) {
      processFolders(cachedFolders);
      setLoading(false);
      fetchFoldersFromSupabase(folderCacheKey, true, cachedFolders);
    } else {
      setLoading(true);
      await fetchFoldersFromSupabase(folderCacheKey, false, null);
    }
  };

  const fetchFoldersFromSupabase = async (cacheKey: string, isBackground: boolean, cachedData: any[] | null) => {
    const { data: allFoldersData } = await supabase
      .from("carpetas_apuntes")
      .select("*, perfiles!creador_id(nombre_completo, rol, avatar_url, apodo), archivos_apuntes(id, tipo, creador_id, perfiles!creador_id(id, nombre_completo, avatar_url, apodo), paginas_cuaderno(creador_id, url_imagen, perfiles!creador_id(id, nombre_completo, avatar_url, apodo)))")
      .eq("visible", true)
      .eq("materia_id", materia.id)
      .order("nombre");

    const allFolders = allFoldersData || [];
    const isDataChanged = !cachedData || JSON.stringify(cachedData) !== JSON.stringify(allFolders);

    if (isDataChanged) {
      CacheUtils.set(cacheKey, allFolders);
      await processFolders(allFolders);
    }
    
    if (!isBackground) {
      setLoading(false);
    }
  };

  const processFolders = async (allFolders: any[]) => {
    allFoldersRef.current = allFolders;

    let effectiveFolder = currentFolder;

    if (!isInitialized) {
      const urlParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
      const actualFolderId = urlParams.get("folder") || initialFolderId;
      
      if (actualFolderId) {
        const targetFolder = allFolders.find((f: any) => f.id === actualFolderId);
        if (targetFolder) {
          const newBreadcrumbs: CarpetaApunte[] = [];
          let curr: any = targetFolder;
          while (curr) {
            newBreadcrumbs.unshift(curr);
            curr = allFolders.find((f: any) => f.id === curr?.parent_id);
          }
          setBreadcrumbs(newBreadcrumbs);
          setCurrentFolder(targetFolder);
          effectiveFolder = targetFolder;
        }
      }
      setIsInitialized(true);
    }

    const parentId = effectiveFolder ? effectiveFolder.id : null;

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
        totalFilesCount: calculateTotalFiles(folder.id)
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
      const filesCacheKey = `files_${parentId}`;
      const cachedFiles = CacheUtils.get<any[]>(filesCacheKey);
      
      if (cachedFiles) {
         setFiles(cachedFiles);
         fetchFilesInBackground(parentId, filesCacheKey, cachedFiles);
      } else {
         await fetchFiles(parentId, filesCacheKey, null);
      }
    } else {
      setFiles([]);
    }
  };

  const fetchFilesInBackground = async (parentId: string, cacheKey: string, cachedData: any[]) => {
      const { data: fileData } = await supabase
        .from("archivos_apuntes")
        .select("*, perfiles!creador_id(nombre_completo, rol, avatar_url, apodo), paginas_cuaderno(creador_id, url_imagen, perfiles!creador_id(id, nombre_completo, avatar_url, apodo)), interacciones_apuntes(tipo)")
        .eq("carpeta_id", parentId)
        .order("nombre");
      
      const filesArr = fileData || [];
      if (JSON.stringify(cachedData) !== JSON.stringify(filesArr)) {
         setFiles(filesArr);
         CacheUtils.set(cacheKey, filesArr);
      }
  };

  const fetchFiles = async (parentId: string, cacheKey: string, cachedData: any[] | null) => {
      const { data: fileData } = await supabase
        .from("archivos_apuntes")
        .select("*, perfiles!creador_id(nombre_completo, rol, avatar_url, apodo), paginas_cuaderno(creador_id, url_imagen, perfiles!creador_id(id, nombre_completo, avatar_url, apodo)), interacciones_apuntes(tipo)")
        .eq("carpeta_id", parentId)
        .order("nombre");
      
      const filesArr = fileData || [];
      setFiles(filesArr);
      CacheUtils.set(cacheKey, filesArr);
  };

  const updateUrlParams = (updates: Record<string, string | null>) => {
    const newUrl = new URL(window.location.href);
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        newUrl.searchParams.set(key, value);
      } else {
        newUrl.searchParams.delete(key);
      }
    });
    window.history.pushState({}, "", newUrl.toString());
  };

  const updateUrlFolder = (folderId: string | null) => {
    if (!folderId) {
      updateUrlParams({ folder: null });
      return;
    }
    const folder = allFoldersRef.current.find((f: any) => f.id === folderId);
    updateUrlParams({ folder: folder?.slug || folderId });
  };

  const handleViewModeChange = (mode: 'grid' | 'list') => {
    setViewMode(mode);
    updateUrlParams({ view: mode });
  };

  const handleSortChange = (by: 'fecha' | 'nombre', order: 'asc' | 'desc') => {
    setSortBy(by);
    setSortOrder(order);
    updateUrlParams({ sortBy: by, sortOrder: order });
  };

  const scrollToExplorer = () => {
    // Scroll to the explorer section smoothly
    const element = document.getElementById('explorer-toolbar');
    if (element) {
      const y = element.getBoundingClientRect().top + window.scrollY - 100; // 100px offset for any fixed header
      window.scrollTo({ top: y, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNavigateBreadcrumb = (folder: CarpetaApunte | null) => {
    if (!folder) {
      setCurrentFolder(null);
      setBreadcrumbs([]);
      updateUrlFolder(null);
    } else {
      const idx = breadcrumbs.findIndex((c) => c.id === folder.id);
      setCurrentFolder(folder);
      setBreadcrumbs(breadcrumbs.slice(0, idx + 1));
      updateUrlFolder(folder.id);
    }
    setTimeout(scrollToExplorer, 50);
  };

  const handleFolderClick = (folder: CarpetaApunte) => {
    setCurrentFolder(folder);
    setBreadcrumbs(prev => {
      if (prev.some(c => c.id === folder.id)) return prev;
      return [...prev, folder];
    });
    updateUrlFolder(folder.id);
    setTimeout(scrollToExplorer, 50);
  };

  const handleFileClick = (file: ArchivoApunte) => {
    router.push(`/apuntes/documento/${file.slug || file.id}`);
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

  const hasViewer = false;

  // Filtrado de búsqueda
  const filteredFolders = folders.filter((f) => f.nombre.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredFiles = files.filter((f) => f.nombre.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleShareClick = () => {
    setIsShareDialogOpen(true);
  };

  const sortItems = (items: any[]) => {
    return [...items].sort((a, b) => {
      let valA, valB;
      if (sortBy === 'nombre') {
        valA = a.nombre.toLowerCase();
        valB = b.nombre.toLowerCase();
      } else {
        valA = new Date(a.created_at || a.fechaCreacion || a.fecha_creacion || a.fechaSubida || a.fecha_subida || 0).getTime();
        valB = new Date(b.created_at || b.fechaCreacion || b.fecha_creacion || b.fechaSubida || b.fecha_subida || 0).getTime();
      }
      
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const sortedFolders = sortItems(filteredFolders);
  const sortedFiles = sortItems(filteredFiles);

  return (
    <div className="w-full">
      {/* Header Estilo Imagen 1 */}
      <section 
        className="mb-10 animate-fade-in rounded-none md:rounded-3xl p-6 md:p-8 -mx-4 md:mx-0 relative overflow-hidden"
        style={{ backgroundColor: materia.color || '#39b54a' }}
      >
        <div className="flex flex-col md:flex-row gap-6 md:items-start justify-between relative z-10">
          <div className="flex gap-4 items-start">
            <div className="flex h-16 w-16 md:h-20 md:w-20 shrink-0 items-center justify-center">
              <MateriaIcon name={materia.icono} className="size-12 md:size-14 text-white fill-white" style={{ fill: 'white' }} />
            </div>
            <div className="min-w-0 flex-1 text-white">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight flex flex-wrap items-center gap-x-2 gap-y-1 break-words">
                {materia.nombre} 
                {loading ? (
                  <div className="h-8 w-16 bg-white/20 animate-pulse rounded-md ml-2 shrink-0" />
                ) : (
                  <span className="text-white/70 font-medium shrink-0 text-xl sm:text-2xl md:text-3xl">({totalStats.pdfs + totalStats.cuadernos})</span>
                )}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-4 text-sm font-medium text-white/90">
                {loading ? (
                  <>
                    <div className="h-5 w-32 bg-white/20 animate-pulse rounded" />
                    <div className="h-5 w-32 bg-white/20 animate-pulse rounded" />
                  </>
                ) : (
                  <>
                    <span className="flex items-center gap-1.5"><FileText className="size-4 shrink-0" /> {totalStats.pdfs} documentos</span>
                    <span className="flex items-center gap-1.5"><BookOpen className="size-4 shrink-0" /> {totalStats.cuadernos} cuadernos</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button disabled className="rounded-full px-6 bg-foreground text-background hover:bg-foreground/90 shadow-sm font-bold opacity-50 cursor-not-allowed">
              Próximamente
            </Button>
            <Button variant="outline" className="rounded-full px-6 bg-white hover:bg-neutral-100 shadow-sm dark:bg-neutral-900 dark:hover:bg-neutral-800" onClick={handleShareClick}>
              <Share className="size-4 mr-2" /> Compartir
            </Button>
          </div>
          <div className="relative w-full sm:w-64 md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={`Buscar en ${materia.nombre}`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-full pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
            />
          </div>
        </div>
      </section>

      <div id="explorer-toolbar" className="flex items-center justify-between mb-6 flex-wrap gap-4 scroll-mt-24">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold">Documentos</h2>
          
          <div className="flex items-center bg-neutral-100 dark:bg-neutral-800 rounded-lg p-1">
            <button 
              onClick={() => handleViewModeChange('grid')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white dark:bg-neutral-900 shadow-sm text-primary' : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'}`}
              title="Vista de cuadrícula"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button 
              onClick={() => handleViewModeChange('list')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-neutral-900 shadow-sm text-primary' : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'}`}
              title="Vista de lista"
            >
              <ListIcon className="w-4 h-4" />
            </button>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center justify-center border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/40 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-md text-sm font-medium h-8 px-3 gap-2 text-neutral-600 dark:text-neutral-300 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer">
              {sortBy === 'fecha' ? (sortOrder === 'desc' ? <ArrowDownWideNarrow className="w-4 h-4" /> : <ArrowUpNarrowWide className="w-4 h-4" />) : (sortOrder === 'desc' ? <ArrowDownAZ className="w-4 h-4" /> : <ArrowUpAZ className="w-4 h-4" />)}
              <span className="hidden sm:inline">Ordenar por</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuItem onClick={() => handleSortChange('fecha', 'desc')} className={sortBy === 'fecha' && sortOrder === 'desc' ? 'bg-primary/10 text-primary' : ''}>
                Más recientes primero
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSortChange('fecha', 'asc')} className={sortBy === 'fecha' && sortOrder === 'asc' ? 'bg-primary/10 text-primary' : ''}>
                Más antiguos primero
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSortChange('nombre', 'asc')} className={sortBy === 'nombre' && sortOrder === 'asc' ? 'bg-primary/10 text-primary' : ''}>
                Nombre (A-Z)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSortChange('nombre', 'desc')} className={sortBy === 'nombre' && sortOrder === 'desc' ? 'bg-primary/10 text-primary' : ''}>
                Nombre (Z-A)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="flex items-center gap-2">
          {currentFolder?.colaborativa && currentUser && (
            <>
              {currentFolder.tipo !== "cuaderno" && (
                <button 
                  onClick={() => {
                    setSelectedPdfFiles([]);
                    setIsPdfUploadModalOpen(true);
                  }}
                  className="cursor-pointer bg-red-600 hover:bg-red-700 text-white h-9 px-4 rounded-lg flex items-center justify-center text-sm font-medium transition-colors"
                >
                  <UploadCloud className="w-4 h-4 mr-2" /> Subir PDF
                </button>
              )}
              {currentFolder.tipo === "cuaderno" && (
                <Button onClick={() => {
                  setNewNotebookName(`Cuaderno de ${currentUser?.user_metadata?.full_name || "Alumno"}`);
                  setIsCreatingNotebook(true);
                }} size="sm" className="bg-purple-600 hover:bg-purple-700 text-white h-9">
                  <Plus className="w-4 h-4 mr-2" /> Nuevo Cuaderno
                </Button>
              )}
            </>
          )}

          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchContents} 
            disabled={loading}
            className="h-9 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-800 px-2 sm:px-3"
          >
            <RefreshCw className={`w-4 h-4 sm:mr-2 ${loading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Actualizar</span>
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
              isAdmin={false} // Users don't see edit/delete dots
              selectedFile={null}
              isCompact={false}
              currentUser={currentUser}
              onToggleCollaborative={async (type, item) => {
                setLoading(true);
                const table = type === 'folder' ? 'carpetas_apuntes' : 'archivos_apuntes';
                await supabase.from(table).update({ colaborativa: !item.colaborativa }).eq("id", item.id);
                fetchContents();
              }}
              onMoveClick={(type, item) => setItemToMove({ type, item })}
              onCollaboratorsClick={(file, collaborators) => setCollaboratorsDialogData({ file, collaborators })}
              onDeleteClick={(type, item) => setDeleteConfirmData({ type, item })}
            />
        </div>
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
                  href={`/perfil/${collab.apodo || collab.id}`}
                  className="flex items-center gap-3 p-2 rounded-lg border border-neutral-100 dark:border-neutral-800/60 bg-neutral-50/50 dark:bg-neutral-900/30 hover:bg-white dark:hover:bg-neutral-800 hover:border-purple-200 dark:hover:border-purple-500/30 hover:shadow-sm transition-all group"
                >
                  <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 font-bold text-xs shrink-0 overflow-hidden">
                    {collab.avatar_url ? (
                      <img src={collab.avatar_url} alt={collab.nombre_completo || "Colaborador"} className="w-full h-full object-cover" />
                    ) : (
                      collab.nombre_completo?.[0]?.toUpperCase() || 'U'
                    )}
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

      <DialogoMover
        isOpen={!!itemToMove}
        onClose={() => setItemToMove(null)}
        itemToMove={itemToMove}
        onConfirm={async (newMateriaId, newFolderId) => {
          if (!itemToMove) return;
          setLoading(true);
          const { type, item } = itemToMove;
          if (type === 'folder') {
            await supabase
              .from('carpetas_apuntes')
              .update({ materia_id: newMateriaId, parent_id: newFolderId })
              .eq('id', item.id);
          } else {
              await supabase
                .from('archivos_apuntes')
                .update({ carpeta_id: newFolderId })
                .eq('id', item.id);
            }
          setItemToMove(null);
          // Refresh content. If the item was moved out of the current folder, it will disappear.
          fetchContents();
        }}
      />

      <ShareDialog 
        isOpen={isShareDialogOpen} 
        onOpenChange={setIsShareDialogOpen} 
        title={`Compartir ${materia.nombre}`}
        text={`Mira los apuntes de ${materia.nombre} en Most Cloud`}
      />

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
                (snapshot) => {},
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
          }
        }}
      />
    </div>
  );
}
