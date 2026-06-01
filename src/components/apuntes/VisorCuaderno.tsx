"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X, ChevronLeft, ChevronRight, Plus, Loader2, UploadCloud, Calendar, BookOpen, Maximize, Minimize, LayoutGrid, Trash2, Eye, EyeOff, ArrowLeft, ArrowRight, ImageIcon, User, Users } from "lucide-react";
import type { ArchivoApunte, PaginaCuaderno } from "@/types";
import { createClient } from "@/utils/supabase/client";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { uploadFile, deleteFile } from "@/utils/firebase/storage";
import { ImageOptimizerModal } from "@/components/apuntes/ImageOptimizerModal";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? "100%" : "-100%",
    opacity: 0,
    scale: 0.95
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    zIndex: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? "100%" : "-100%",
    opacity: 0,
    scale: 0.95,
    zIndex: 0,
  }),
};

interface VisorCuadernoProps {
  file: ArchivoApunte;
  onClose: () => void;
  currentUserId?: string;
  isAdmin?: boolean;
}

export function VisorCuaderno({ file, onClose, currentUserId, isAdmin }: VisorCuadernoProps) {
  const [paginas, setPaginas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [isFullscreen, setIsFullscreen] = useState(searchParams?.get("fullscreen") === "true");
  const [isEditing, setIsEditing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [fileToOptimize, setFileToOptimize] = useState<File | null>(null);
  const [showOptimizer, setShowOptimizer] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const isOwner = (file as any).creador_id === currentUserId || file.creadorId === currentUserId || isAdmin;
  const canAddPage = isOwner || file.colaborativa;

  const toggleFullscreen = () => {
    const newState = !isFullscreen;
    setIsFullscreen(newState);
    const params = new URLSearchParams(searchParams?.toString() || "");
    if (newState) {
      params.set("fullscreen", "true");
    } else {
      params.delete("fullscreen");
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  useEffect(() => {
    setMounted(true);
    fetchPaginas();
  }, [file.id, supabase]);

  async function fetchPaginas() {
    setLoading(true);
    const { data, error } = await supabase
      .from("paginas_cuaderno")
      .select("*, perfiles!creador_id(nombre_completo)")
      .eq("cuaderno_id", file.id)
      .order("orden", { ascending: true })
      .order("fecha_clase", { ascending: true });

    if (!error && data) {
      setPaginas(data);
    }
    setLoading(false);
  }

  const paginasVisibles = isEditing ? paginas : paginas.filter((p: any) => !p.oculta);

  useEffect(() => {
    if (!isEditing && currentPageIndex >= paginasVisibles.length) {
      setCurrentPageIndex(Math.max(0, paginasVisibles.length - 1));
    }
  }, [isEditing, paginasVisibles.length, currentPageIndex]);

  const handleNext = () => {
    if (currentPageIndex < paginasVisibles.length - 1) {
      setDirection(1);
      setCurrentPageIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentPageIndex > 0) {
      setDirection(-1);
      setCurrentPageIndex((prev) => prev - 1);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    setFileToOptimize(selectedFiles[0]);
    setShowOptimizer(true);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleOptimizedUpload = async (optimizedFile: File) => {
    setUploading(true);
    setShowOptimizer(false);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id || "anonymous";

      const path = `cuadernos/${file.id}/${Date.now()}_${optimizedFile.name}`;
      
      const { downloadUrl } = await uploadFile(optimizedFile, path);

      const maxOrden = paginas.length > 0 
        ? Math.max(...paginas.map(p => p.orden || 0)) 
        : 0;

      const newPage = {
        cuaderno_id: file.id,
        url_imagen: downloadUrl,
        fecha_clase: new Date().toISOString().split('T')[0],
        orden: maxOrden + 1,
        creador_id: userId,
        oculta: false
      };

      const { error } = await supabase
        .from("paginas_cuaderno")
        .insert(newPage);

      if (error) {
        console.error("Error inserting page:", error);
        alert("Hubo un error al guardar la página.");
      } else {
        await fetchPaginas();
        // Si no está editando, enviarlo al final de las visibles. Si edita, al final de todas.
        setDirection(1);
        setCurrentPageIndex(isEditing ? paginas.length : paginasVisibles.length); 
      }
    } catch (error) {
      console.error("Error uploading page:", error);
      alert("Hubo un error al subir la imagen.");
    } finally {
      setUploading(false);
      setFileToOptimize(null);
    }
  };

  const handleToggleHide = async (page: any) => {
    const newState = !page.oculta;
    const { error } = await supabase
      .from("paginas_cuaderno")
      .update({ oculta: newState })
      .eq("id", page.id);
    if (!error) {
      setPaginas(paginas.map(p => p.id === page.id ? { ...p, oculta: newState } : p));
    }
  };

  const handleDelete = async (page: any) => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar esta página de forma permanente?")) return;
    try {
      const url = page.url_imagen || page.urlImagen;
      if (url) {
         await deleteFile(url);
      }
    } catch (e) {
      console.error("No se pudo borrar de Firebase o ya no existía.", e);
    }
    const { error } = await supabase.from("paginas_cuaderno").delete().eq("id", page.id);
    if (!error) {
      setPaginas(paginas.filter(p => p.id !== page.id));
    }
  };

  const handleMove = async (index: number, direction: 'left' | 'right') => {
    if (direction === 'left' && index === 0) return;
    if (direction === 'right' && index === paginas.length - 1) return;

    const newIndex = direction === 'left' ? index - 1 : index + 1;
    const current = paginas[index];
    const swapWith = paginas[newIndex];

    const currentOrden = current.orden;
    const swapOrden = swapWith.orden;

    const { error: err1 } = await supabase.from("paginas_cuaderno").update({ orden: swapOrden }).eq("id", current.id);
    const { error: err2 } = await supabase.from("paginas_cuaderno").update({ orden: currentOrden }).eq("id", swapWith.id);

    if (!err1 && !err2) {
      const newPaginas = [...paginas];
      newPaginas[index] = { ...current, orden: swapOrden };
      newPaginas[newIndex] = { ...swapWith, orden: currentOrden };
      newPaginas.sort((a, b) => (a.orden || 0) - (b.orden || 0));
      setPaginas(newPaginas);
    }
  };

  const getPageUrl = (page: any) => page?.url_imagen || page?.urlImagen;
  const getPageDate = (page: any) => page?.fecha_clase || page?.fechaClase;

  const content = (
    <div className={
      isFullscreen 
        ? "fixed inset-0 z-[100] w-screen h-screen bg-[#f8f9fa] dark:bg-[#0a0a0a] flex flex-col overflow-hidden animate-fade-in backdrop-blur-xl"
        : "w-full max-w-4xl mx-auto h-[85vh] bg-[#f8f9fa] dark:bg-[#0a0a0a] border border-neutral-200/60 dark:border-neutral-800/60 rounded-3xl flex flex-col overflow-hidden animate-slide-up shadow-2xl backdrop-blur-xl"
    }>
      {/* Header */}
      <div className="flex flex-col border-b border-neutral-200/50 dark:border-neutral-800/50 z-20 shrink-0 bg-white/80 dark:bg-[#111111]/80 backdrop-blur-md">
        <div className="flex items-start justify-between gap-6 px-8 py-5 pb-3">
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <div className="p-2.5 bg-purple-100 dark:bg-purple-500/10 rounded-xl mt-0.5 shrink-0">
              <BookOpen className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-xl font-bold text-neutral-900 dark:text-white tracking-tight leading-tight">
                  {file.nombre}
                </h2>
                {file.colaborativa && (
                  <div className="flex items-center px-2.5 py-0.5 bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 text-xs font-semibold rounded-full border border-green-200 dark:border-green-500/30 shrink-0">
                    <span>Colaborativo</span>
                  </div>
                )}
                {typeof (file as any).vistas === 'number' && (file as any).vistas > 0 && (
                  <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 text-xs font-semibold rounded-full border border-neutral-200 dark:border-neutral-700 shrink-0" title="Vistas">
                    <Eye className="w-3.5 h-3.5" />
                    <span>{(file as any).vistas}</span>
                  </div>
                )}
              </div>
              {file.descripcion && (
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 font-medium truncate">
                  {file.descripcion}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {(canAddPage ? paginas.length > 0 : paginasVisibles.length > 0) && (
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`p-2.5 rounded-full transition-all flex items-center gap-2 px-4 text-sm font-medium ${isEditing ? 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300' : 'bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300'}`}
                title={isEditing ? "Ver cuaderno" : (canAddPage ? "Organizar páginas" : "Navegación rápida")}
              >
                {isEditing ? <ImageIcon className="w-4 h-4" /> : <LayoutGrid className="w-4 h-4" />}
                <span className="hidden sm:inline">{isEditing ? "Leer" : (canAddPage ? "Organizar" : "Navegar")}</span>
              </button>
            )}
            <button
              onClick={toggleFullscreen}
              className="p-2.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300 rounded-full transition-all"
              title={isFullscreen ? "Minimizar" : "Pantalla completa"}
            >
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>
            {!isFullscreen && (
              <button
                onClick={onClose}
                className="p-2.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300 rounded-full transition-all"
                title="Cerrar visor"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
        
        {/* Page Meta (Only in Read Mode) */}
        {!loading && !isEditing && paginasVisibles.length > 0 && (
          <div className="px-8 pb-4 flex items-center gap-6 ml-[68px] overflow-x-auto whitespace-nowrap scrollbar-hide">
            <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400 shrink-0">
              <Calendar className="w-4 h-4" />
              <span className="font-medium text-sm">
                {getPageDate(paginasVisibles[currentPageIndex])
                  ? format(new Date(getPageDate(paginasVisibles[currentPageIndex])), "EEEE, d 'de' MMMM", { locale: es })
                  : "Sin fecha"}
              </span>
            </div>
            <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400 text-sm font-medium shrink-0">
              <div className="w-1 h-1 rounded-full bg-neutral-300 dark:bg-neutral-700"></div>
              Página {currentPageIndex + 1} de {paginasVisibles.length}
            </div>
            <div className="flex items-center gap-2 text-sm font-medium shrink-0">
              <div className="w-1 h-1 rounded-full bg-neutral-300 dark:bg-neutral-700"></div>
              {(() => {
                const currentPage = paginasVisibles[currentPageIndex];
                const authorId = currentPage?.creador_id;
                const isCurrentUserPageAuthor = authorId && currentUserId && authorId === currentUserId;
                const authorName = currentPage?.perfiles?.nombre_completo?.split(' ')[0] || "Usuario";
                
                return (
                  <Link 
                    href={authorId ? `/perfil/${authorId}` : '#'}
                    className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border transition-all ${
                      isCurrentUserPageAuthor 
                        ? "bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-500/30 hover:bg-indigo-200 dark:hover:bg-indigo-500/30 font-semibold shadow-sm"
                        : "bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-500/30 hover:bg-purple-200 dark:hover:bg-purple-500/30"
                    }`}
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>{isCurrentUserPageAuthor ? "Tú" : `Por ${authorName}`}</span>
                  </Link>
                );
              })()}
            </div>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 relative flex bg-neutral-100/50 dark:bg-[#0f0f0f] overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center w-full h-full">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-purple-200 dark:border-purple-900/30 rounded-full"></div>
              <div className="w-16 h-16 border-4 border-purple-600 dark:border-purple-500 rounded-full border-t-transparent animate-spin absolute top-0 left-0"></div>
            </div>
            <p className="mt-6 text-neutral-500 dark:text-neutral-400 font-medium">Cargando...</p>
          </div>
        ) : paginas.length === 0 ? (
          <div className="flex flex-col items-center justify-center w-full h-full p-8 animate-fade-in">
            <div className="max-w-md w-full flex flex-col items-center text-center relative">
              <div className="w-24 h-24 mb-8 bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/30 dark:to-indigo-900/30 rounded-full flex items-center justify-center shadow-inner">
                <BookOpen className="w-10 h-10 text-purple-600 dark:text-purple-400" strokeWidth={1.5} />
              </div>
              <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4 tracking-tight">
                Cuaderno vacío
              </h3>
              <p className="text-neutral-500 dark:text-neutral-400 mb-10 leading-relaxed text-base">
                {canAddPage 
                  ? "Aún no has añadido ninguna página a este cuaderno. Sube fotos de tus apuntes o clases para empezar a organizar tu conocimiento." 
                  : "Este cuaderno aún no tiene páginas publicadas."}
              </p>
              
              {canAddPage && (
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="w-full max-w-xs py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-semibold transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed group"
                >
                  {uploading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <UploadCloud className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
                      Añadir primera página
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        ) : isEditing ? (
          <div className="w-full h-full overflow-y-auto p-6 custom-scrollbar bg-neutral-100/50 dark:bg-black/40">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-6xl mx-auto pb-24">
              {(canAddPage ? paginas : paginasVisibles).map((page, index) => {
                const isHidden = page.oculta;
                const arrLength = canAddPage ? paginas.length : paginasVisibles.length;
                const pageNum = canAddPage ? index + 1 : paginasVisibles.findIndex(p => p.id === page.id) + 1;
                const userCanEditPage = isOwner || page.creador_id === currentUserId;
                const authorName = page.perfiles?.nombre_completo || "Usuario Desconocido";
                const isCurrentUserPageAuthor = page.creador_id === currentUserId;
                
                return (
                <div key={page.id} className={`group relative aspect-[3/4] bg-white dark:bg-[#151515] rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-800 overflow-hidden transition-all hover:shadow-lg hover:ring-2 hover:ring-purple-500/50 ${isHidden ? 'opacity-50 grayscale-[0.5]' : ''}`}>
                  <div 
                    className="w-full h-full cursor-pointer" 
                    onClick={() => {
                      const visibleIdx = paginasVisibles.findIndex((p: any) => p.id === page.id);
                      if (visibleIdx !== -1) {
                        setDirection(visibleIdx > currentPageIndex ? 1 : -1);
                        setCurrentPageIndex(visibleIdx);
                        setIsEditing(false);
                      }
                    }}
                  >
                    <img src={getPageUrl(page)} alt={`Página`} className="w-full h-full object-cover" loading="lazy" />
                  </div>
                  
                  {/* Edges Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex flex-col justify-between p-3 opacity-0 group-hover:opacity-100 pointer-events-none">
                    <div className="flex justify-between items-center">
                      <div className="px-2 py-1 bg-black/60 backdrop-blur-md rounded-md text-white text-xs font-bold pointer-events-none shadow-sm flex items-center gap-1">
                        {pageNum}
                        <span className="font-normal opacity-70 border-l border-white/20 pl-1 ml-1">
                          {isCurrentUserPageAuthor ? "Tú" : authorName.split(' ')[0]}
                        </span>
                      </div>
                      
                      {userCanEditPage && (
                        <div className="flex gap-1 pointer-events-auto">
                          <button onClick={(e) => { e.stopPropagation(); handleToggleHide(page); }} className="p-1.5 bg-black/60 hover:bg-black/80 rounded-md text-white transition-colors" title={isHidden ? "Mostrar" : "Ocultar"}>
                            {isHidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); handleDelete(page); }} className="p-1.5 bg-red-500/80 hover:bg-red-600 rounded-md text-white transition-colors shadow-sm" title="Eliminar">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                    
                    {userCanEditPage && (
                      <div className="flex justify-center gap-2 pointer-events-auto">
                        <button onClick={(e) => { e.stopPropagation(); handleMove(index, 'left'); }} disabled={index === 0} className="p-2 bg-black/60 hover:bg-black/80 disabled:opacity-30 rounded-full text-white transition-colors shadow-sm">
                          <ArrowLeft className="w-4 h-4" />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); handleMove(index, 'right'); }} disabled={index === arrLength - 1} className="p-2 bg-black/60 hover:bg-black/80 disabled:opacity-30 rounded-full text-white transition-colors shadow-sm">
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {isHidden && canAddPage && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-3 py-1.5 bg-black/80 text-white text-xs font-bold rounded-lg pointer-events-none shadow-md">
                      Oculta
                    </div>
                  )}
                </div>
              )})}
            </div>
          </div>
        ) : paginasVisibles.length === 0 ? (
          <div className="flex flex-col items-center justify-center w-full h-full">
            <p className="text-neutral-500 dark:text-neutral-400 font-medium">Todas las páginas están ocultas.</p>
          </div>
        ) : (
          <div className="relative w-full h-full flex flex-col items-center justify-center">
            {/* Navigation Left */}
            <button
              onClick={handlePrev}
              disabled={currentPageIndex === 0}
              className="absolute left-6 top-1/2 -translate-y-1/2 z-20 p-4 sm:p-5 bg-white/80 hover:bg-white dark:bg-[#222]/80 dark:hover:bg-[#333] disabled:opacity-0 disabled:pointer-events-none text-neutral-800 dark:text-white rounded-full backdrop-blur-xl shadow-lg border border-neutral-200/50 dark:border-neutral-700/50 transition-all hover:scale-105"
            >
              <ChevronLeft className="w-7 h-7" />
            </button>

            {/* Page Display */}
            <div className="w-full h-full relative overflow-hidden flex items-center justify-center">
              <AnimatePresence initial={false} custom={direction}>
                <motion.img
                  key={currentPageIndex}
                  src={getPageUrl(paginasVisibles[currentPageIndex])}
                  alt={`Página ${currentPageIndex + 1}`}
                  className="absolute max-w-full max-h-full w-auto h-auto object-contain rounded-lg shadow-sm"
                  loading="lazy"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    x: { type: "spring", stiffness: 300, damping: 30 },
                    opacity: { duration: 0.2 },
                    scale: { duration: 0.2 }
                  }}
                />
              </AnimatePresence>
            </div>

            {/* Navigation Right */}
            <button
              onClick={handleNext}
              disabled={currentPageIndex === paginasVisibles.length - 1}
              className="absolute right-6 top-1/2 -translate-y-1/2 z-20 p-4 sm:p-5 bg-white/80 hover:bg-white dark:bg-[#222]/80 dark:hover:bg-[#333] disabled:opacity-0 disabled:pointer-events-none text-neutral-800 dark:text-white rounded-full backdrop-blur-xl shadow-lg border border-neutral-200/50 dark:border-neutral-700/50 transition-all hover:scale-105"
            >
              <ChevronRight className="w-7 h-7" />
            </button>
          </div>
        )}

        {/* Hidden File Input */}
        <input 
          type="file" 
          ref={fileInputRef}
          className="hidden" 
          accept="image/*" 
          onChange={handleFileChange} 
          multiple
        />

        {/* Floating Action Button for adding pages */}
        {canAddPage && paginas.length > 0 && (
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="absolute bottom-8 right-8 px-6 py-4 bg-neutral-900 hover:bg-black dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-black rounded-2xl shadow-xl transition-all hover:scale-105 flex items-center gap-3 group disabled:opacity-80 disabled:cursor-not-allowed disabled:hover:scale-100 z-50"
          >
            {uploading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Plus className="w-5 h-5" strokeWidth={2.5} />
                <span className="font-semibold tracking-wide">
                  Añadir Página
                </span>
              </>
            )}
          </button>
        )}

        {/* Optimization Modal */}
        <ImageOptimizerModal
          isOpen={showOptimizer}
          file={fileToOptimize}
          onClose={() => {
            setShowOptimizer(false);
            setFileToOptimize(null);
          }}
          onUpload={handleOptimizedUpload}
        />
      </div>
    </div>
  );

  if (isFullscreen && mounted) {
    return createPortal(content, document.body);
  }

  return content;
}

