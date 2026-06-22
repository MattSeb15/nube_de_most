"use client";

import React, { useEffect, useRef, useState } from "react";
import { Folder, FileText, BookOpen, MoreVertical, ChevronRight, ArrowLeft, User, Users, Shield, Edit2, Trash2, Eye, MoveRight, ThumbsUp, ThumbsDown, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { CarpetaApunte, ArchivoApunte } from "@/types";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface ExploradorProps {
  currentFolder: CarpetaApunte | null;
  breadcrumbs: CarpetaApunte[];
  folders: CarpetaApunte[];
  files: ArchivoApunte[];
  onFolderClick: (folder: CarpetaApunte) => void;
  onFileClick: (file: ArchivoApunte) => void;
  onNavigateBreadcrumb: (folder: CarpetaApunte | null) => void;
  isAdmin?: boolean;
  onActionClick?: (e: React.MouseEvent, type: 'folder' | 'file', item: any) => void;
  onRenameClick?: (type: 'folder' | 'file', item: any) => void;
  onMoveClick?: (type: 'folder' | 'file', item: any) => void;
  onDeleteClick?: (type: 'folder' | 'file', item: any) => void;
  onToggleCollaborative?: (type: 'folder' | 'file', item: any) => void;
  onCollaboratorsClick?: (file: any, collaborators: any[]) => void;
  selectedFile?: ArchivoApunte | null;
  isCompact?: boolean;
  currentUser?: any;
  loading?: boolean;
  viewMode?: 'grid' | 'list';
}

export function Explorador({
  currentFolder,
  breadcrumbs,
  folders,
  files,
  onFolderClick,
  onFileClick,
  onNavigateBreadcrumb,
  isAdmin,
  onActionClick,
  onRenameClick,
  onMoveClick,
  onDeleteClick,
  onToggleCollaborative,
  onCollaboratorsClick,
  selectedFile,
  isCompact,
  currentUser,
  loading,
  viewMode = 'grid',
}: ExploradorProps) {
  const [isBreadcrumbsVisible, setIsBreadcrumbsVisible] = useState(true);
  const breadcrumbsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsBreadcrumbsVisible(entry.isIntersecting);
      },
      { threshold: 0 }
    );

    if (breadcrumbsRef.current) {
      observer.observe(breadcrumbsRef.current);
    }

    return () => {
      if (breadcrumbsRef.current) {
        observer.unobserve(breadcrumbsRef.current);
      }
    };
  }, []);

  return (
    <div className="w-full flex flex-col space-y-4">
      {/* Breadcrumbs */}
      <div ref={breadcrumbsRef} className="flex items-center space-x-2 text-sm text-neutral-500 dark:text-neutral-400 overflow-x-auto pb-2 scrollbar-hide">
        <button
          onClick={() => onNavigateBreadcrumb(null)}
          className="hover:text-neutral-900 dark:hover:text-white transition-colors flex items-center shrink-0"
        >
          <Folder className="w-4 h-4 mr-1" /> Raíz
        </button>
        {breadcrumbs.map((crumb, idx) => {
          const isLast = idx === breadcrumbs.length - 1;
          return (
            <React.Fragment key={crumb.id}>
              <ChevronRight className="w-4 h-4 shrink-0" />
              <button
                onClick={() => onNavigateBreadcrumb(crumb)}
                className={`transition-colors whitespace-nowrap ${
                  isLast 
                    ? "font-bold text-neutral-900 dark:text-white" 
                    : "hover:text-neutral-900 dark:hover:text-white"
                }`}
              >
                {crumb.nombre}
              </button>
            </React.Fragment>
          );
        })}
      </div>

      <AnimatePresence>
        {!isBreadcrumbsVisible && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 shadow-lg rounded-full border bg-background/80 backdrop-blur-md px-6 py-3 flex items-center gap-1.5 text-sm font-medium overflow-x-auto max-w-[90vw] scrollbar-hide"
          >
            <button
              onClick={() => onNavigateBreadcrumb(null)}
              className="hover:text-primary transition-colors flex items-center shrink-0 whitespace-nowrap text-muted-foreground"
            >
              <Folder className="w-4 h-4 mr-1" /> Raíz
            </button>
            {breadcrumbs.map((crumb, idx) => {
              const isLast = idx === breadcrumbs.length - 1;
              return (
                <React.Fragment key={crumb.id}>
                  <ChevronRight className="w-4 h-4 shrink-0 text-muted-foreground" />
                  <button
                    onClick={() => onNavigateBreadcrumb(crumb)}
                    className={`transition-colors whitespace-nowrap ${
                      isLast 
                        ? "font-bold text-foreground" 
                        : "hover:text-primary text-muted-foreground"
                    }`}
                  >
                    {crumb.nombre}
                  </button>
                </React.Fragment>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grid List */}
      <div className={viewMode === 'list' ? "flex flex-col gap-3" : "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"}>
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            viewMode === 'list' ? (
              <div key={`skeleton-${i}`} className="flex items-center bg-white dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-800 rounded-xl p-3 h-[72px] animate-pulse">
                <div className="w-10 h-10 bg-neutral-100 dark:bg-neutral-800 rounded-lg mr-4"></div>
                <div className="flex-1 flex flex-col gap-2">
                  <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-1/3"></div>
                  <div className="h-3 bg-neutral-100 dark:bg-neutral-800/50 rounded w-1/4"></div>
                </div>
              </div>
            ) : (
              <div key={`skeleton-${i}`} className="flex flex-col bg-white dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 min-h-[220px] animate-pulse">
                <div className="aspect-[4/3] bg-neutral-100 dark:bg-neutral-800 rounded-xl mb-4"></div>
                <div className="flex-1 flex flex-col gap-2">
                  <div className="h-4 bg-neutral-200 dark:bg-neutral-800 rounded w-3/4"></div>
                  <div className="h-3 bg-neutral-100 dark:bg-neutral-800/50 rounded w-1/2"></div>
                  <div className="mt-auto pt-3 flex items-center justify-between">
                    <div className="h-3 bg-neutral-200 dark:bg-neutral-800 rounded w-1/3"></div>
                  </div>
                </div>
              </div>
            )
          ))
        ) : (
          <>
            {folders.map((folder: any) => {
          const dateStr = folder.created_at || folder.fechaCreacion || folder.fecha_creacion;
          const isOwner = folder.creador_id === currentUser?.id;
          const showMenu = isAdmin || isOwner;

          const collabsMap = new Map();
          let hasOtherCollaborators = false;

          if (folder.archivos_apuntes) {
            folder.archivos_apuntes.forEach((archivo: any) => {
              if (archivo.creador_id && archivo.perfiles) {
                const existing = collabsMap.get(archivo.creador_id);
                if (existing) {
                  existing.pageCount += 1;
                } else {
                  collabsMap.set(archivo.creador_id, { 
                    id: archivo.creador_id, 
                    nombre_completo: archivo.perfiles.nombre_completo,
                    avatar_url: archivo.perfiles.avatar_url,
                    pageCount: 1
                  });
                }
                if (archivo.creador_id !== folder.creador_id) {
                  hasOtherCollaborators = true;
                }
              }
              if (archivo.paginas_cuaderno) {
                archivo.paginas_cuaderno.forEach((page: any) => {
                  if (page.creador_id && page.perfiles) {
                    if (page.creador_id !== folder.creador_id) {
                      hasOtherCollaborators = true;
                    }
                  }
                });
              }
            });
          }
          const uniqueCollaborators = Array.from(collabsMap.values());
          const disabledTooltip = hasOtherCollaborators ? "Primero los colaboradores deben eliminar sus aportes" : undefined;
          
          const creador = folder.perfiles;
          const creadorLink = creador ? `/perfil/${creador.apodo || folder.creador_id}` : "#";

          return (            <div
              key={folder.id}
              onClick={() => onFolderClick(folder)}
              className={cn(
                "group relative flex bg-white dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-800 hover:shadow-xl hover:shadow-primary/5 cursor-pointer transition-all",
                viewMode === 'list' 
                  ? "flex-row items-center p-3 rounded-xl hover:-translate-y-0.5" 
                  : "flex-col p-4 rounded-2xl min-h-[220px] hover:-translate-y-1"
              )}
            >
              {viewMode === 'list' ? (
                <div className="w-12 h-12 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg relative border border-neutral-100 dark:border-neutral-800 flex items-center justify-center mr-4 shrink-0 transition-colors group-hover:bg-primary/5">
                  <Folder className={`w-6 h-6 ${folder.tipo === "cuaderno" ? "text-purple-500/80" : "text-blue-500/80"}`} fill="currentColor" />
                  <span className="absolute -bottom-1 -right-1 bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-300 shadow-sm border border-neutral-200 dark:border-neutral-700 text-[9px] font-bold px-1.5 py-[1px] rounded-full flex items-center gap-0.5">
                    {folder.totalFilesCount !== undefined ? folder.totalFilesCount : (folder.archivos_apuntes?.length || 0)}
                  </span>
                </div>
              ) : (
                <div className="aspect-[4/3] bg-neutral-50 dark:bg-neutral-800/50 rounded-xl relative border border-neutral-100 dark:border-neutral-800 flex items-center justify-center mb-4 transition-colors group-hover:bg-primary/5">
                  <Folder className={`w-16 h-16 ${folder.tipo === "cuaderno" ? "text-purple-500/80" : "text-blue-500/80"}`} fill="currentColor" />
                  <span className="absolute bottom-2 right-2 bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-300 shadow-sm border border-neutral-200 dark:border-neutral-700 text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Layers className="size-3" />
                    {folder.totalFilesCount !== undefined ? folder.totalFilesCount : (folder.archivos_apuntes?.length || 0)}
                  </span>
                </div>
              )}
              
              <div className={cn("flex-1 min-w-0 flex", viewMode === 'list' ? "flex-row items-center" : "flex-col")}>
                {viewMode === 'list' ? (
                  <>
                    <div className="flex-1 min-w-0 sm:w-[35%] sm:flex-none sm:min-w-[200px] pr-2 sm:pr-4">
                      <h3 className="font-bold text-foreground text-sm line-clamp-1 leading-snug group-hover:text-primary transition-colors">
                        {folder.nombre}
                      </h3>
                      <div className="flex items-center gap-2 mt-0.5 min-w-0">
                        <p className="text-[11px] text-muted-foreground capitalize truncate">{folder.tipo === "cuaderno" ? "Colección de Cuadernos" : "Carpeta"}</p>
                      </div>
                    </div>

                    <div className="shrink-0 px-2 flex items-center gap-2 sm:flex-1 sm:min-w-0 mr-10 sm:mr-0">
                      {folder.colaborativa && (
                        <span className="sm:hidden text-green-600 font-medium bg-green-100 dark:bg-green-900/30 px-1.5 py-0.5 rounded text-[9px] shrink-0">Colab</span>
                      )}
                      {creador && (
                        <Link href={creadorLink} className="flex items-center gap-2 hover:underline group/link w-auto max-w-full" onClick={(e) => e.stopPropagation()}>
                          <div className="w-6 h-6 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden shrink-0 flex items-center justify-center">
                            {creador.avatar_url ? (
                              <img src={creador.avatar_url} alt={creador.nombre_completo || "Usuario"} className="w-full h-full object-cover" />
                            ) : (
                              <User className="w-3.5 h-3.5 text-neutral-400" />
                            )}
                          </div>
                          <span className="hidden sm:inline text-[13px] text-neutral-600 dark:text-neutral-400 group-hover/link:text-primary truncate uppercase">{creador.nombre_completo || "Usuario"}</span>
                        </Link>
                      )}
                    </div>

                    <div className="hidden sm:flex items-center justify-end gap-4 shrink-0 mr-12 text-xs text-muted-foreground min-w-[150px]">
                      {folder.colaborativa && (
                        <span className="text-green-600 font-medium bg-green-100 dark:bg-green-900/30 px-1.5 py-0.5 rounded text-[10px]">Colaborativa</span>
                      )}
                      <span className="w-24 text-right truncate">{dateStr ? format(new Date(dateStr), "d MMM yyyy", { locale: es }) : "Desconocido"}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-foreground text-sm line-clamp-2 leading-snug group-hover:text-primary transition-colors pr-6">
                        {folder.nombre}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1 capitalize">{folder.tipo === "cuaderno" ? "Colección de Cuadernos" : "Carpeta"}</p>
                      
                      {creador && (
                        <div className="flex items-center gap-2 mt-2 min-w-0 overflow-hidden" onClick={(e) => e.stopPropagation()}>
                          <Link href={creadorLink} className="flex items-center gap-1.5 hover:underline group/link min-w-0 overflow-hidden">
                            <div className="w-5 h-5 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden shrink-0 flex items-center justify-center">
                              {creador.avatar_url ? (
                                <img src={creador.avatar_url} alt={creador.nombre_completo || "Usuario"} className="w-full h-full object-cover" />
                              ) : (
                                <User className="w-3 h-3 text-neutral-400" />
                              )}
                            </div>
                            <span className="text-[11px] text-neutral-600 dark:text-neutral-400 group-hover/link:text-primary truncate uppercase">{creador.nombre_completo || "Usuario"}</span>
                          </Link>
                        </div>
                      )}
                    </div>

                    <div className="mt-auto pt-3 text-[10px] text-muted-foreground flex items-center justify-between">
                      <span>{dateStr ? format(new Date(dateStr), "d MMM yyyy", { locale: es }) : "Desconocido"}</span>
                      {folder.colaborativa && (
                        <span className="text-green-600 font-medium bg-green-100 dark:bg-green-900/30 px-1.5 py-0.5 rounded">Colaborativa</span>
                      )}
                    </div>
                  </>
                )}
              </div>

              {showMenu && (
                <div className={cn("absolute z-10", viewMode === 'list' ? "right-3 top-1/2 -translate-y-1/2" : "top-6 right-6")}>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      onClick={(e) => e.stopPropagation()}
                      className="p-1.5 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white rounded-full shadow-sm border border-neutral-200 dark:border-neutral-700 transition-colors"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onRenameClick?.('folder', folder); }}>
                        <Edit2 className="w-4 h-4 mr-2" /> Renombrar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onMoveClick?.('folder', folder); }}>
                        <MoveRight className="w-4 h-4 mr-2" /> Mover
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={(e) => { e.stopPropagation(); onToggleCollaborative?.('folder', folder); }}
                        disabled={hasOtherCollaborators}
                        title={disabledTooltip}
                      >
                        <Users className="w-4 h-4 mr-2" /> {folder.colaborativa ? "Quitar Colaborativa" : "Hacer Colaborativa"}
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/30" 
                        onClick={(e) => { e.stopPropagation(); onDeleteClick?.('folder', folder); }}
                        disabled={hasOtherCollaborators}
                        title={disabledTooltip}
                      >
                        <Trash2 className="w-4 h-4 mr-2" /> Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </div>
          );
        })}

        {files.map((file: any) => {
          const dateStr = file.created_at || file.fechaSubida || file.fecha_subida;
          const isSelected = selectedFile?.id === file.id;
          const isOwner = file.creador_id === currentUser?.id;
          const showMenu = isAdmin || isOwner;

          const collabsMap = new Map();
          if (file.paginas_cuaderno) {
            file.paginas_cuaderno.forEach((page: any) => {
              if (page.creador_id && page.perfiles) {
                const existing = collabsMap.get(page.creador_id);
                if (existing) {
                  existing.pageCount += 1;
                } else {
                  collabsMap.set(page.creador_id, { 
                    id: page.creador_id, 
                    nombre_completo: page.perfiles.nombre_completo,
                    avatar_url: page.perfiles.avatar_url,
                    pageCount: 1
                  });
                }
              }
            });
          }
          const uniqueCollaborators = Array.from(collabsMap.values());
          const hasOtherCollaborators = uniqueCollaborators.some((c: any) => c.id !== file.creador_id);
          const disabledTooltip = hasOtherCollaborators ? "Primero los colaboradores deben eliminar sus aportes" : undefined;
          const interactions = file.interacciones_apuntes || [];
          const likes = interactions.filter((i: any) => i.tipo === 'like').length;
          const dislikes = interactions.filter((i: any) => i.tipo === 'dislike').length;
          const totalRatings = likes + dislikes;
          const ratingPercentage = totalRatings > 0 ? Math.round((likes / totalRatings) * 100) : 0;
          
          const creador = file.perfiles;
          const creadorLink = creador ? `/perfil/${creador.apodo || file.creador_id}` : "#";

          return (
            <div
              key={file.id}
              onClick={() => onFileClick(file)}
              className={cn(
                "group relative flex bg-white dark:bg-neutral-900/40 border cursor-pointer transition-all",
                viewMode === 'list' 
                  ? "flex-row items-center p-3 rounded-xl hover:-translate-y-0.5" 
                  : "flex-col p-4 rounded-2xl min-h-[220px] hover:-translate-y-1",
                isSelected
                  ? "border-primary ring-1 ring-primary shadow-md"
                  : "border-neutral-200 dark:border-neutral-800 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/30"
              )}
            >
              {viewMode === 'list' ? (
                <div className="w-12 h-12 bg-neutral-100 dark:bg-neutral-800/80 rounded-lg relative border border-neutral-200 dark:border-neutral-700 flex items-center justify-center mr-4 shrink-0 overflow-hidden group-hover:border-primary/50 transition-colors">
                  {file.tipo === "pdf" ? (
                    <FileText className="w-6 h-6 text-red-500/80" fill="currentColor" />
                  ) : (
                    <div className="w-8 h-10 bg-purple-500 dark:bg-purple-600 rounded-r shadow-inner relative flex items-center justify-center">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-700 dark:bg-purple-800 rounded-l"></div>
                      <BookOpen className="w-4 h-4 text-white/80" />
                    </div>
                  )}
                  {file.tipo === "cuaderno" && (
                    <span className="absolute -bottom-1 -right-1 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-sm text-neutral-600 dark:text-neutral-300 shadow-sm border border-neutral-200 dark:border-neutral-700 text-[9px] font-bold px-1.5 py-[1px] rounded-full z-10">
                      {file.paginas_cuaderno ? file.paginas_cuaderno.length : 0}
                    </span>
                  )}
                </div>
              ) : (
                <div className="aspect-[4/3] bg-neutral-100 dark:bg-neutral-800/80 rounded-xl relative border border-neutral-200 dark:border-neutral-700 flex items-center justify-center mb-4 overflow-hidden group-hover:border-primary/50 transition-colors">
                  {/* Real Preview */}
                  {file.tipo === "pdf" ? (
                    <div className="w-full h-full bg-white dark:bg-neutral-900 relative overflow-hidden flex items-center justify-center">
                      {(file.urlArchivo || file.url_archivo) ? (
                         <iframe 
                           src={`${file.urlArchivo || file.url_archivo}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
                           className="absolute top-0 left-0 w-[400%] h-[400%] origin-top-left border-none pointer-events-none select-none opacity-90 group-hover:opacity-100 transition-opacity"
                           style={{ transform: 'scale(0.25)' }}
                           tabIndex={-1}
                         />
                      ) : (
                        <FileText className="w-10 h-10 text-red-500/80" fill="currentColor" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
                    </div>
                  ) : (
                    <div className="w-full h-full bg-neutral-100 dark:bg-neutral-800 relative flex items-center justify-center overflow-hidden">
                      {(file.paginas_cuaderno && file.paginas_cuaderno.length > 0 && file.paginas_cuaderno[0].url_imagen) ? (
                        <img 
                          src={file.paginas_cuaderno[0].url_imagen} 
                          alt="Preview" 
                          className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" 
                        />
                      ) : (
                        <div className="w-20 h-24 bg-purple-500 dark:bg-purple-600 rounded-r-md shadow-inner relative flex items-center justify-center rotate-[-5deg] group-hover:rotate-0 transition-transform">
                          <div className="absolute left-0 top-0 bottom-0 w-2 bg-purple-700 dark:bg-purple-800 rounded-l-md"></div>
                          <BookOpen className="w-8 h-8 text-white/80" />
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Page count */}
                  {file.tipo === "cuaderno" && (
                    <span className="absolute bottom-2 right-2 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-sm text-neutral-600 dark:text-neutral-300 shadow-sm border border-neutral-200 dark:border-neutral-700 text-xs font-bold px-2 py-0.5 rounded-full z-10">
                      {file.paginas_cuaderno ? file.paginas_cuaderno.length : 0}
                    </span>
                  )}
                </div>
              )}
              
              <div className={cn("flex-1 min-w-0 flex", viewMode === 'list' ? "flex-row items-center" : "flex-col")}>
                {viewMode === 'list' ? (
                  <>
                    <div className="flex-1 min-w-0 sm:w-[35%] sm:flex-none sm:min-w-[200px] pr-2 sm:pr-4">
                      <h3 className="font-bold text-foreground text-sm line-clamp-1 leading-snug group-hover:text-primary transition-colors">
                        {file.nombre}
                      </h3>
                      <div className="flex items-center gap-2 mt-0.5 min-w-0">
                        <p className="text-[11px] text-muted-foreground capitalize truncate">{file.tipo === 'pdf' ? 'Apuntes' : 'Cuaderno'}</p>
                      </div>
                    </div>

                    <div className="shrink-0 px-2 flex items-center gap-2 sm:flex-1 sm:min-w-0 mr-10 sm:mr-0">
                      {file.colaborativa && (
                        <span className="sm:hidden text-green-600 font-medium bg-green-100 dark:bg-green-900/30 px-1.5 py-0.5 rounded text-[9px] shrink-0">Colab</span>
                      )}
                      {creador && (
                        <Link href={creadorLink} className="flex items-center gap-2 hover:underline group/link w-auto max-w-full" onClick={(e) => e.stopPropagation()}>
                          <div className="w-6 h-6 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden shrink-0 flex items-center justify-center">
                            {creador.avatar_url ? (
                              <img src={creador.avatar_url} alt={creador.nombre_completo || "Usuario"} className="w-full h-full object-cover" />
                            ) : (
                              <User className="w-3.5 h-3.5 text-neutral-400" />
                            )}
                          </div>
                          <span className="hidden sm:inline text-[13px] text-neutral-600 dark:text-neutral-400 group-hover/link:text-primary truncate uppercase">{creador.nombre_completo || "Usuario"}</span>
                        </Link>
                      )}
                    </div>

                    <div className="hidden sm:flex items-center justify-end gap-4 shrink-0 mr-12 text-xs text-muted-foreground min-w-[200px]">
                      {file.colaborativa && (
                        <span className="text-green-600 font-medium bg-green-100 dark:bg-green-900/30 px-1.5 py-0.5 rounded text-[10px]">Colaborativo</span>
                      )}
                      {(totalRatings > 0 || (typeof file.vistas === 'number' && file.vistas > 0)) && (
                        <div className="flex items-center gap-3">
                          {totalRatings > 0 && (
                            <div className={cn("flex items-center gap-1.5", ratingPercentage >= 50 ? "text-green-600 dark:text-green-500" : "text-red-600 dark:text-red-500")}>
                              {ratingPercentage >= 50 ? <ThumbsUp className="size-3.5" /> : <ThumbsDown className="size-3.5" />} {ratingPercentage}%
                            </div>
                          )}
                          {typeof file.vistas === 'number' && file.vistas > 0 && (
                             <div className="flex items-center gap-1">
                               <Eye className="size-3.5" /> {file.vistas}
                             </div>
                          )}
                        </div>
                      )}
                      <span className="w-24 text-right truncate">{dateStr ? format(new Date(dateStr), "d MMM yyyy", { locale: es }) : "Desconocido"}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex-1 min-w-0 pr-4">
                      <h3 className="font-bold text-foreground text-sm line-clamp-2 leading-snug group-hover:text-primary transition-colors pr-6">
                        {file.nombre}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-muted-foreground capitalize">{file.tipo === 'pdf' ? 'Apuntes' : 'Cuaderno'}</p>
                        {file.colaborativa && (
                          <span className="text-green-600 text-[10px] font-medium bg-green-100 dark:bg-green-900/30 px-1.5 py-0.5 rounded">Colaborativo</span>
                        )}
                      </div>

                      {creador && (
                        <div className="flex items-center gap-2 mt-2 min-w-0 overflow-hidden" onClick={(e) => e.stopPropagation()}>
                          <Link href={creadorLink} className="flex items-center gap-1.5 hover:underline group/link min-w-0 overflow-hidden">
                            <div className="w-5 h-5 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden shrink-0 flex items-center justify-center">
                              {creador.avatar_url ? (
                                <img src={creador.avatar_url} alt={creador.nombre_completo || "Usuario"} className="w-full h-full object-cover" />
                              ) : (
                                <User className="w-3 h-3 text-neutral-400" />
                              )}
                            </div>
                            <span className="text-[11px] text-neutral-600 dark:text-neutral-400 group-hover/link:text-primary truncate uppercase">{creador.nombre_completo || "Usuario"}</span>
                          </Link>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-auto pt-3 flex items-center justify-between text-xs text-muted-foreground font-medium">
                      {totalRatings > 0 ? (
                        <div className={cn("flex items-center gap-1.5", ratingPercentage >= 50 ? "text-green-600 dark:text-green-500" : "text-red-600 dark:text-red-500")}>
                          {ratingPercentage >= 50 ? <ThumbsUp className="size-3.5" /> : <ThumbsDown className="size-3.5" />} {ratingPercentage}% ({totalRatings})
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-neutral-400">
                          Sin valoraciones
                        </div>
                      )}
                      {typeof file.vistas === 'number' && file.vistas > 0 && (
                         <div className="flex items-center gap-1">
                           <Eye className="size-3.5" /> {file.vistas}
                         </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              {showMenu && (
                <div className={cn("absolute z-10", viewMode === 'list' ? "right-3 top-1/2 -translate-y-1/2" : "top-6 right-6")}>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      onClick={(e) => e.stopPropagation()}
                      className="p-1.5 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white rounded-full shadow-sm border border-neutral-200 dark:border-neutral-700 transition-colors"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onRenameClick?.('file', file); }}>
                        <Edit2 className="w-4 h-4 mr-2" /> Renombrar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onMoveClick?.('file', file); }}>
                        <MoveRight className="w-4 h-4 mr-2" /> Mover
                      </DropdownMenuItem>
                      {file.tipo === "cuaderno" && (
                        <DropdownMenuItem 
                          onClick={(e) => { e.stopPropagation(); onToggleCollaborative?.('file', file); }}
                          disabled={hasOtherCollaborators}
                          title={disabledTooltip}
                        >
                          <Users className="w-4 h-4 mr-2" /> {file.colaborativa ? "Quitar Colaborativo" : "Hacer Colaborativo"}
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem 
                        className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/30" 
                        onClick={(e) => { e.stopPropagation(); onDeleteClick?.('file', file); }}
                        disabled={hasOtherCollaborators}
                        title={disabledTooltip}
                      >
                        <Trash2 className="w-4 h-4 mr-2" /> Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </div>
          );
        })}

            {folders.length === 0 && files.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center py-12 text-neutral-400 animate-fade-in">
                <Folder className="w-16 h-16 mb-4 opacity-50" />
                <p>Esta carpeta está vacía.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
