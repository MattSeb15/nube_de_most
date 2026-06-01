"use client";

import React from "react";
import { Folder, FileText, BookOpen, MoreVertical, ChevronRight, ArrowLeft, User, Users, Shield, Edit2, Trash2, Eye } from "lucide-react";
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
  onDeleteClick?: (type: 'folder' | 'file', item: any) => void;
  onToggleCollaborative?: (type: 'folder' | 'file', item: any) => void;
  onCollaboratorsClick?: (file: any, collaborators: any[]) => void;
  selectedFile?: ArchivoApunte | null;
  isCompact?: boolean;
  currentUser?: any;
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
  onDeleteClick,
  onToggleCollaborative,
  onCollaboratorsClick,
  selectedFile,
  isCompact,
  currentUser,
}: ExploradorProps) {
  return (
    <div className="w-full flex flex-col space-y-4">
      {/* Breadcrumbs */}
      <div className="flex items-center space-x-2 text-sm text-neutral-500 dark:text-neutral-400 overflow-x-auto pb-2 scrollbar-hide">
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

      {/* Horizontal List */}
      <div className="flex flex-col gap-2">
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

          return (
            <div
              key={folder.id}
              onClick={() => onFolderClick(folder)}
              className={`group relative flex items-center bg-white dark:bg-neutral-900/40 border border-neutral-200 dark:border-neutral-800 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800/80 hover:border-blue-500/50 cursor-pointer transition-all ${
                isCompact ? "p-2" : "p-3"
              }`}
            >
              <Folder className={`${isCompact ? "w-6 h-6 mr-3" : "w-10 h-10 mr-4"} ${folder.tipo === "cuaderno" ? "text-purple-500 dark:text-purple-400" : "text-blue-500 dark:text-blue-400"} shrink-0`} fill="currentColor" />
              
              <div className="flex-1 min-w-0">
                <span className={`font-semibold truncate block text-neutral-700 dark:text-neutral-200 group-hover:text-neutral-900 dark:group-hover:text-white ${isCompact ? "text-xs" : "text-sm"}`}>
                  {folder.nombre}
                </span>
                {!isCompact && (
                  <div className="flex items-center gap-2 mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                    <span>{folder.tipo === "cuaderno" ? "Carpeta de Cuadernos" : "Carpeta"}</span>
                    <span>•</span>
                    <span className={`font-medium px-1.5 py-0.5 rounded-md ${folder.tipo === "cuaderno" ? "text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30" : "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30"}`}>
                      {folder.archivos_apuntes?.length || 0} {(folder.archivos_apuntes?.length === 1) ? (folder.tipo === "cuaderno" ? 'cuaderno' : 'archivo') : (folder.tipo === "cuaderno" ? 'cuadernos' : 'archivos')}
                    </span>
                    <span>•</span>
                    <span>{dateStr ? format(new Date(dateStr), "d MMM yyyy, HH:mm", { locale: es }) : "Fecha desconocida"}</span>
                    <span>•</span>
                    {isOwner ? (
                      <Link href={`/perfil/${folder.creador_id}`} onClick={(e) => e.stopPropagation()} className="flex items-center gap-1 bg-purple-100 hover:bg-purple-200 text-purple-700 dark:bg-purple-900/40 dark:hover:bg-purple-900/60 dark:text-purple-300 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide transition-colors cursor-pointer">
                        <User className="w-2.5 h-2.5" fill="currentColor" />
                        Tú
                      </Link>
                    ) : folder.perfiles?.rol === 'admin' ? (
                      <Link href={`/perfil/${folder.creador_id}`} onClick={(e) => e.stopPropagation()} className="flex items-center gap-1 bg-primary hover:bg-primary/90 text-primary-foreground px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide transition-colors cursor-pointer">
                        <Shield className="w-2.5 h-2.5" fill="currentColor" />
                        {folder.perfiles?.nombre_completo || folder.perfil?.nombre_completo || "Admin"}
                      </Link>
                    ) : (
                      <Link href={`/perfil/${folder.creador_id}`} onClick={(e) => e.stopPropagation()} className="flex items-center gap-1 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer">
                        <User className="w-3 h-3" />
                        {folder.perfiles?.nombre_completo || folder.perfil?.nombre_completo || "Desconocido"}
                      </Link>
                    )}
                  </div>
                )}
              </div>

              {!isCompact && folder.colaborativa && (
                <button 
                  onClick={(e) => { e.stopPropagation(); onCollaboratorsClick?.(folder, uniqueCollaborators); }}
                  className="mx-4 text-xs font-medium text-green-600 bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50 dark:text-green-400 px-2.5 py-0.5 rounded-full transition-colors flex items-center gap-1.5"
                >
                  <span>Colaborativa</span>
                  <span className="bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200 rounded-full px-1.5 py-0.5 text-[10px] leading-none">
                    {uniqueCollaborators.length}
                  </span>
                </button>
              )}

                {showMenu && (
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      onClick={(e) => e.stopPropagation()}
                      className="p-2 text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onRenameClick?.('folder', folder); }}>
                        <Edit2 className="w-4 h-4 mr-2" /> Renombrar
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
                    pageCount: 1
                  });
                }
              }
            });
          }
          const uniqueCollaborators = Array.from(collabsMap.values());
          const hasOtherCollaborators = uniqueCollaborators.some((c: any) => c.id !== file.creador_id);
          const disabledTooltip = hasOtherCollaborators ? "Primero los colaboradores deben eliminar sus aportes" : undefined;

          return (
            <div
              key={file.id}
              onClick={() => onFileClick(file)}
              className={`group relative flex items-center border rounded-xl cursor-pointer transition-all ${
                isCompact ? "p-2" : "p-3"
              } ${
                isSelected
                  ? "bg-blue-50 dark:bg-blue-900/20 border-blue-500 ring-1 ring-blue-500 shadow-sm"
                  : "bg-white dark:bg-neutral-900/40 border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/80 hover:border-purple-500/50"
              }`}
            >
              {file.tipo === "pdf" ? (
                <FileText className={`${isCompact ? "w-6 h-6 mr-3" : "w-10 h-10 mr-4"} text-red-500 dark:text-red-400 shrink-0`} fill="currentColor" />
              ) : (
                <BookOpen className={`${isCompact ? "w-6 h-6 mr-3" : "w-10 h-10 mr-4"} text-purple-500 dark:text-purple-400 shrink-0`} fill="currentColor" />
              )}
              
              <div className="flex-1 min-w-0">
                <span className={`font-semibold truncate block group-hover:text-neutral-900 dark:group-hover:text-white ${isCompact ? "text-xs" : "text-sm"} ${isSelected ? "text-blue-700 dark:text-blue-300" : "text-neutral-700 dark:text-neutral-200"}`}>
                  {file.nombre}
                </span>
                {!isCompact && (
                  <div className="flex items-center gap-2 mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                    <span className="uppercase">{file.tipo}</span>
                    <span>•</span>
                    <span>{dateStr ? format(new Date(dateStr), "d MMM yyyy, HH:mm", { locale: es }) : "Fecha desconocida"}</span>
                    <span>•</span>
                    {isOwner ? (
                      <Link href={`/perfil/${file.creador_id}`} onClick={(e) => e.stopPropagation()} className="flex items-center gap-1 bg-purple-100 hover:bg-purple-200 text-purple-700 dark:bg-purple-900/40 dark:hover:bg-purple-900/60 dark:text-purple-300 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide transition-colors cursor-pointer">
                        <User className="w-2.5 h-2.5" fill="currentColor" />
                        Tú
                      </Link>
                    ) : file.perfiles?.rol === 'admin' ? (
                      <Link href={`/perfil/${file.creador_id}`} onClick={(e) => e.stopPropagation()} className="flex items-center gap-1 bg-primary hover:bg-primary/90 text-primary-foreground px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide transition-colors cursor-pointer">
                        <Shield className="w-2.5 h-2.5" fill="currentColor" />
                        {file.perfiles?.nombre_completo || file.perfil?.nombre_completo || "Admin"}
                      </Link>
                    ) : (
                      <Link href={`/perfil/${file.creador_id}`} onClick={(e) => e.stopPropagation()} className="flex items-center gap-1 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer">
                        <User className="w-3 h-3" />
                        {file.perfiles?.nombre_completo || file.perfil?.nombre_completo || "Desconocido"}
                      </Link>
                    )}
                    {typeof file.vistas === 'number' && file.vistas > 0 && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-neutral-500 dark:text-neutral-400" title="Vistas">
                          <Eye className="w-3 h-3" />
                          {file.vistas}
                        </span>
                      </>
                    )}
                  </div>
                )}
              </div>

              {!isCompact && file.tipo === "cuaderno" && file.colaborativa && (
                <button 
                  onClick={(e) => { e.stopPropagation(); onCollaboratorsClick?.(file, uniqueCollaborators); }}
                  className="mx-4 text-xs font-medium text-green-600 bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50 dark:text-green-400 px-2.5 py-0.5 rounded-full transition-colors flex items-center gap-1.5"
                >
                  <span>Colaborativo</span>
                  <span className="bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200 rounded-full px-1.5 py-0.5 text-[10px] leading-none">
                    {uniqueCollaborators.length}
                  </span>
                </button>
              )}

                {showMenu && (
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      onClick={(e) => e.stopPropagation()}
                      className="p-2 text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onRenameClick?.('file', file); }}>
                        <Edit2 className="w-4 h-4 mr-2" /> Renombrar
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
                )}
            </div>
          );
        })}

        {folders.length === 0 && files.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-neutral-400">
            <Folder className="w-16 h-16 mb-4 opacity-50" />
            <p>Esta carpeta está vacía.</p>
          </div>
        )}
      </div>
    </div>
  );
}
