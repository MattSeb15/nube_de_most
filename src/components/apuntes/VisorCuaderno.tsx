"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X, ChevronLeft, ChevronRight, ChevronDown, Plus, Loader2, UploadCloud, Calendar, BookOpen, Maximize, Minimize, LayoutGrid, Trash2, Eye, EyeOff, ArrowLeft, ArrowRight, ImageIcon, User, Users, Book, ZoomIn, ZoomOut, MoreVertical, ThumbsUp, ThumbsDown, Tag, Bookmark, List, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ArchivoApunte, PaginaCuaderno } from "@/types";
import { createClient } from "@/utils/supabase/client";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { uploadFile, deleteFile } from "@/utils/firebase/storage";
import { ImageOptimizerModal } from "@/components/apuntes/ImageOptimizerModal";
import { MultiImageUploadModal } from "@/components/apuntes/MultiImageUploadModal";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { CacheUtils } from "@/lib/cache";

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? "50%" : "-50%",
    rotateY: direction > 0 ? 60 : -60,
    opacity: 0,
    scale: 0.9
  }),
  center: {
    x: 0,
    rotateY: 0,
    opacity: 1,
    scale: 1,
    zIndex: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? "50%" : "-50%",
    rotateY: direction < 0 ? 60 : -60,
    opacity: 0,
    scale: 0.9,
    zIndex: 0,
  }),
};

interface VisorCuadernoProps {
  file: ArchivoApunte;
  onClose: () => void;
  currentUserId?: string;
  isAdmin?: boolean;
  onCollaboratorsLoad?: (collaborators: any[]) => void;
  interaction?: 'like' | 'dislike' | null;
  onLike?: () => void;
  onDislike?: () => void;
}

export function VisorCuaderno({ file, onClose, currentUserId, isAdmin, onCollaboratorsLoad, interaction, onLike, onDislike }: VisorCuadernoProps) {
  const [paginas, setPaginas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const footerRef = useRef<HTMLDivElement>(null);
  const [isFooterVisible, setIsFooterVisible] = useState(false);

  useEffect(() => {
    if (!footerRef.current) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting || entry.boundingClientRect.top < window.innerHeight) {
        setIsFooterVisible(true);
      } else {
        setIsFooterVisible(false);
      }
    }, { threshold: 0 });
    observer.observe(footerRef.current);
    return () => observer.disconnect();
  }, [paginas]);
  const [isDoublePage, setIsDoublePage] = useState(true);
  const [zoomedPage, setZoomedPage] = useState<any | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setIsDoublePage(false);
      setShowIndexPanel(false);
    }
  }, []);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [canPan, setCanPan] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [isFullscreen, setIsFullscreen] = useState(searchParams?.get("fullscreen") === "true");
  const [isEditing, setIsEditing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [fileToOptimize, setFileToOptimize] = useState<File | null>(null);
  const [filesToOptimize, setFilesToOptimize] = useState<File[]>([]);
  const [showOptimizer, setShowOptimizer] = useState(false);
  const [showMultiOptimizer, setShowMultiOptimizer] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();
  
  const [showIndexPanel, setShowIndexPanel] = useState(true);
  const [editingEtiquetaId, setEditingEtiquetaId] = useState<string | null>(null);
  const [etiquetaDraft, setEtiquetaDraft] = useState<string>("");
  const [etiquetaGrupoDraft, setEtiquetaGrupoDraft] = useState<string>("");
  const [etiquetaColorDraft, setEtiquetaColorDraft] = useState<string>("");
  const [showColorPicker, setShowColorPicker] = useState<string | null>(null);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  const ETIQUETA_COLORS = [
    { value: "bg-purple-600", color: "#9333ea" },
    { value: "bg-blue-600", color: "#2563eb" },
    { value: "bg-emerald-600", color: "#059669" },
    { value: "bg-red-600", color: "#dc2626" },
    { value: "bg-orange-500", color: "#f97316" },
    { value: "bg-amber-500", color: "#f59e0b" },
    { value: "bg-pink-600", color: "#db2777" },
    { value: "bg-rose-500", color: "#f43f5e" },
    { value: "bg-teal-600", color: "#0d9488" },
    { value: "bg-slate-700", color: "#334155" }
  ];

  const getEtiquetaHexColor = (colorClass: string | undefined | null) => {
    if (!colorClass) return "#9333ea";
    const colorObj = ETIQUETA_COLORS.find(c => c.value === colorClass);
    return colorObj ? colorObj.color : "#9333ea";
  };

  const handleUpdateEtiqueta = async (pageId: string, newValue: string, grupo: string = "", color: string = "") => {
    const valueToSave = newValue.trim() === "" ? null : newValue.trim();
    const grupoToSave = grupo.trim() === "" ? null : grupo.trim();
    const colorToSave = color || ETIQUETA_COLORS[0].value;

    const { error } = await supabase
      .from("paginas_cuaderno")
      .update({ etiqueta: valueToSave, etiqueta_grupo: grupoToSave, etiqueta_color: colorToSave })
      .eq("id", pageId);
      
    if (!error) {
      setPaginas(paginas.map(p => p.id === pageId ? { ...p, etiqueta: valueToSave, etiqueta_grupo: grupoToSave, etiqueta_color: colorToSave } : p));
    }
    setEditingEtiquetaId(null);
    setShowColorPicker(null);
  };

  const isOwner = (file as any).creador_id === currentUserId || file.creadorId === currentUserId || isAdmin;
  const canAddPage = isOwner || file.colaborativa;

  const renderChip = (page: any, isRightPage: boolean = false) => {
    if (!file.colaborativa || !page?.perfiles) return null;
    
    const isCurrentUser = page.creador_id === currentUserId;
    const isPageOwner = page.creador_id === (file as any).creador_id;
    const profileUrl = `/perfil/${page.perfiles.apodo || page.perfiles.id || page.creador_id}`;
    
    const bgColor = isCurrentUser 
      ? "bg-purple-600/90 hover:bg-purple-600 border-purple-500/50" 
      : isPageOwner 
        ? "bg-blue-600/90 hover:bg-blue-600 border-blue-500/50"
        : "bg-black/60 hover:bg-black/80 border-white/10";

    const dateStr = page.created_at || page.fecha_creacion || page.fecha_subida || page.fecha_clase || page.fechaClase;
    const formattedDate = dateStr ? format(new Date(dateStr), "d MMM, HH:mm", { locale: es }) : "";

    return (
      <div 
        className={`absolute bottom-full mb-1.5 sm:mb-2 ${isRightPage ? 'right-0 origin-bottom-right items-end' : 'left-0 origin-bottom-left items-start'} z-20 pointer-events-auto transition-all duration-300 ${zoomLevel !== 1 ? 'opacity-0 pointer-events-none' : 'opacity-100'} flex flex-col sm:flex-row gap-1.5 sm:gap-2 ${isRightPage ? 'sm:justify-end' : 'sm:justify-start'}`}
        style={{ transform: `scale(${1 / zoomLevel})` }}
      >
        {page.etiqueta && (
          <div 
            style={{ backgroundColor: `${getEtiquetaHexColor(page.etiqueta_color)}e6` }}
            className="backdrop-blur-md rounded-full text-white px-3 py-1.5 flex items-center gap-1.5 shadow-md border border-white/20 max-w-full"
          >
            <Tag className="w-3.5 h-3.5 shrink-0" />
            <span className="text-xs font-semibold truncate max-w-[100px] sm:max-w-[200px]">{page.etiqueta}</span>
            {page.etiqueta_grupo && (
              <span className="text-[9px] font-bold uppercase opacity-80 tracking-wider shrink-0 bg-black/25 px-1.5 py-0.5 rounded ml-0.5 sm:ml-1">
                {page.etiqueta_grupo}
              </span>
            )}
          </div>
        )}
        <Link 
          href={profileUrl}
          className={`backdrop-blur-md rounded-full text-white px-2 sm:px-2.5 py-1 sm:py-1.5 flex items-center gap-1.5 sm:gap-2 shadow-md border transition-all hover:scale-105 max-w-full ${bgColor}`}
          onClick={(e) => e.stopPropagation()}
        >
        {page.perfiles.avatar_url ? (
          <img src={page.perfiles.avatar_url} className="w-5 h-5 sm:w-5 sm:h-5 rounded-full object-cover shadow-sm border border-white/20 shrink-0" alt="Avatar" />
        ) : (
          <div className="w-5 h-5 sm:w-5 sm:h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold shadow-sm shrink-0">
            {page.perfiles.nombre_completo?.[0] || 'U'}
          </div>
        )}
        <div className="flex flex-col items-start leading-none min-w-0">
          <span className="text-[10px] sm:text-xs truncate max-w-[80px] sm:max-w-[200px] font-medium opacity-90">
            {isCurrentUser ? "Tú" : page.perfiles.nombre_completo}
          </span>
          {formattedDate && (
            <span className="text-[8px] sm:text-[9px] opacity-70 font-normal mt-0.5 whitespace-nowrap">
              {formattedDate}
            </span>
          )}
        </div>
        </Link>
      </div>
    );
  };

  const toggleFullscreen = () => {
    const newState = !isFullscreen;
    setIsFullscreen(newState);
    setZoomLevel(1);
    const params = new URLSearchParams(searchParams?.toString() || "");
    if (newState) {
      params.set("fullscreen", "true");
    } else {
      params.delete("fullscreen");
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 50);
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
        setZoomLevel(1);
        const params = new URLSearchParams(searchParams?.toString() || "");
        params.delete("fullscreen");
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }, 50);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen, searchParams, router, pathname]);

  useEffect(() => {
    setMounted(true);
    fetchPaginas();
  }, [file.id, supabase]);

  useEffect(() => {
    const checkOverflow = () => {
      setCanPan(true);
    };
    
    checkOverflow();
  }, [zoomLevel, isFullscreen, isDoublePage, paginas.length]);

  useEffect(() => {
    if (!canPan) {
      setPan({ x: 0, y: 0 });
    }
  }, [canPan]);


  const handlePointerDown = (e: React.PointerEvent) => {
    if (!canPan) return;
    setIsDragging(true);
    dragStart.current = {
      x: e.clientX - pan.x,
      y: e.clientY - pan.y
    };
    if (e.target instanceof HTMLElement) {
      e.target.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !canPan) return;
    setPan({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    if (e.target instanceof HTMLElement) {
      e.target.releasePointerCapture(e.pointerId);
    }
  };

  async function fetchPaginas() {
    const cacheKey = `cuaderno_paginas_${file.id}`;
    const cachedData = CacheUtils.get<any[]>(cacheKey);

    if (cachedData) {
      setPaginas(cachedData);
      setLoading(false);
      // Fetch in background to check for updates (Stale-While-Revalidate)
      fetchFromSupabase(cacheKey, true, cachedData);
    } else {
      setLoading(true);
      await fetchFromSupabase(cacheKey, false, null);
    }
  }

  async function fetchFromSupabase(cacheKey: string, isBackground: boolean, cachedData: any[] | null) {
    const { data, error } = await supabase
      .from("paginas_cuaderno")
      .select("*, perfiles!creador_id(nombre_completo, apodo, avatar_url)")
      .eq("cuaderno_id", file.id)
      .order("orden", { ascending: true })
      .order("fecha_clase", { ascending: true });

    if (!error && data) {
      const isDataChanged = !cachedData || JSON.stringify(cachedData) !== JSON.stringify(data);
      
      if (isDataChanged) {
        setPaginas(data);
        CacheUtils.set(cacheKey, data);
        
        if (onCollaboratorsLoad && file.colaborativa) {
          const uniqueCollaborators = new Map();
          data.forEach((p: any) => {
            if (p.creador_id && p.creador_id !== (file as any).creador_id && p.perfiles) {
              if (!uniqueCollaborators.has(p.creador_id)) {
                uniqueCollaborators.set(p.creador_id, {
                  id: p.creador_id,
                  ...p.perfiles
                });
              }
            }
          });
          onCollaboratorsLoad(Array.from(uniqueCollaborators.values()));
        }
      }
    }
    if (!isBackground) {
      setLoading(false);
    }
  }

  const paginasVisibles = isEditing ? paginas : paginas.filter((p: any) => !p.oculta);

  const groupedTags = React.useMemo(() => {
    type TagGroup = { groupName: string, tags: { tag: string, color: string, index: number }[] };
    const groups: TagGroup[] = [];
    const seenTags = new Set<string>();
    const defaultGroup: TagGroup = { groupName: "Otras Etiquetas", tags: [] };
    
    paginasVisibles.forEach((page, idx) => {
      if (page.etiqueta && !seenTags.has(page.etiqueta)) {
        seenTags.add(page.etiqueta);
        
        const tagObj = { 
          tag: page.etiqueta, 
          color: page.etiqueta_color || "bg-purple-600",
          index: idx 
        };
        
        if (!page.etiqueta_grupo) {
          defaultGroup.tags.push(tagObj);
        } else {
          let group = groups.find(g => g.groupName === page.etiqueta_grupo);
          if (!group) {
            group = { groupName: page.etiqueta_grupo, tags: [] };
            groups.push(group);
          }
          group.tags.push(tagObj);
        }
      }
    });
    
    if (defaultGroup.tags.length > 0) {
      groups.push(defaultGroup);
    }
    return groups;
  }, [paginasVisibles]);

  useEffect(() => {
    if (!isEditing && currentPageIndex >= paginasVisibles.length) {
      const maxIdx = Math.max(0, paginasVisibles.length - 1);
      setCurrentPageIndex(maxIdx % 2 === 0 ? maxIdx : maxIdx - 1);
    }
  }, [isEditing, paginasVisibles.length, currentPageIndex]);

  const handleNext = () => {
    const step = isDoublePage ? 2 : 1;
    if (currentPageIndex + step < paginasVisibles.length) {
      setDirection(1);
      setCurrentPageIndex((prev) => prev + step);
    }
  };

  const handlePrev = () => {
    const step = isDoublePage ? 2 : 1;
    if (currentPageIndex - step >= 0) {
      setDirection(-1);
      setCurrentPageIndex((prev) => prev - step);
    } else if (currentPageIndex > 0) {
      setDirection(-1);
      setCurrentPageIndex(0);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    let selectedFiles = e.target.files ? Array.from(e.target.files) : [];
    if (selectedFiles.length === 0) return;

    if (selectedFiles.length > 25) {
      alert("Solo puedes subir un máximo de 25 páginas a la vez.");
      selectedFiles = selectedFiles.slice(0, 25);
    }

    if (selectedFiles.length === 1) {
      setFileToOptimize(selectedFiles[0]);
      setShowOptimizer(true);
    } else {
      setFilesToOptimize(selectedFiles);
      setShowMultiOptimizer(true);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleOptimizedUpload = async (optimizedFile: File) => {
    setUploading(true);
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
        setDirection(1);
        setCurrentPageIndex(isEditing ? paginas.length : paginasVisibles.length); 
      }
    } catch (error) {
      console.error("Error uploading page:", error);
      alert("Hubo un error al subir la imagen.");
    } finally {
      setUploading(false);
    }
  };

  const handleMultiOptimizedUpload = async (optimizedFiles: File[]) => {
    setUploading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id || "anonymous";

      let maxOrden = paginas.length > 0 
        ? Math.max(...paginas.map(p => p.orden || 0)) 
        : 0;

      const uploadPromises = optimizedFiles.map(async (f, index) => {
        const path = `cuadernos/${file.id}/${Date.now()}_${index}_${f.name}`;
        const { downloadUrl } = await uploadFile(f, path);
        return {
          cuaderno_id: file.id,
          url_imagen: downloadUrl,
          fecha_clase: new Date().toISOString().split('T')[0],
          orden: maxOrden + index + 1,
          creador_id: userId,
          oculta: false
        };
      });

      const newPages = await Promise.all(uploadPromises);

      const { error } = await supabase
        .from("paginas_cuaderno")
        .insert(newPages);

      if (error) {
        console.error("Error inserting pages:", error);
        alert("Hubo un error al guardar las páginas.");
      } else {
        await fetchPaginas();
        setDirection(1);
        setCurrentPageIndex(isEditing ? paginas.length : paginasVisibles.length);
      }
    } catch (error) {
      console.error("Error uploading pages:", error);
      alert("Hubo un error al subir las imágenes.");
    } finally {
      setUploading(false);
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

  const baseWidth = isFullscreen 
      ? (isDoublePage ? "min(45vw, calc((100dvh - 70px) * 0.707))" : "min(95vw, calc((100dvh - 70px) * 0.707))") 
      : (isDoublePage ? "min(45vw, calc((100dvh - 130px) * 0.707), 800px)" : "min(95vw, calc((100dvh - 130px) * 0.707), 1200px)");

  const pageStyle = {
    width: baseWidth,
    aspectRatio: "1/1.414",
  };

  const BinderRings = ({ isSingle }: { isSingle?: boolean }) => (
    <div className="flex flex-col justify-evenly h-full py-8 sm:py-12 z-20 shrink-0 w-6 sm:w-8 items-center opacity-80 hover:opacity-100 transition-opacity">
      {Array.from({ length: 16 }).map((_, i) => (
        <div 
          key={i} 
          className="w-full h-1.5 sm:h-2 rounded-full shadow-sm bg-purple-500 dark:bg-purple-400 border border-purple-600/40 dark:border-purple-300/40" 
        />
      ))}
    </div>
  );

  const content = (
    <div className={
      isFullscreen 
        ? "fixed inset-0 z-[100] w-screen h-screen bg-[#f5efff] dark:bg-[#130924] flex flex-col overflow-hidden animate-fade-in backdrop-blur-xl"
        : "w-full min-h-screen bg-[#f5efff] dark:bg-[#130924] flex flex-col relative rounded-t-xl overflow-visible"
    }>

      {/* Body */}
      <div className={`flex-1 min-h-0 relative flex bg-transparent ${isFullscreen ? "overflow-hidden" : ""}`}>
        {loading ? (
          <div className="w-full relative flex flex-col items-center overflow-hidden pointer-events-none">
            <div className={`flex justify-center py-4 sm:py-8 min-w-max ${isFullscreen ? "mx-auto" : "m-auto"} origin-center`}>
              <div 
                className={`flex justify-center items-center relative perspective-[2500px] min-w-max ${
                isFullscreen
                  ? "gap-2 sm:gap-6 p-2 sm:p-4"
                  : "gap-1 sm:gap-4 p-2 sm:p-4 w-full max-w-7xl"
              }`}>
                {/* Left Skeleton Page */}
                <div className="relative perspective-[2000px] z-10 shrink-0" style={pageStyle}>
                  <div className="absolute inset-0 bg-neutral-200/50 dark:bg-[#1c1c1c]/50 shadow-2xl rounded-xl animate-pulse flex flex-col items-center justify-center gap-4 border border-border/50">
                    <Loader2 className="w-8 h-8 text-neutral-400 dark:text-neutral-500 animate-spin" />
                    <span className="text-neutral-500 dark:text-neutral-400 font-medium text-sm">Cargando...</span>
                  </div>
                </div>

                {/* Binder Rings */}
                {isDoublePage && <BinderRings />}

                {/* Right Skeleton Page */}
                {isDoublePage && (
                  <div className="relative perspective-[2000px] z-10 shrink-0" style={pageStyle}>
                    <div className="absolute inset-0 bg-neutral-200/50 dark:bg-[#1c1c1c]/50 shadow-2xl rounded-xl animate-pulse flex flex-col items-center justify-center gap-4 border border-border/50">
                      <Loader2 className="w-8 h-8 text-neutral-400 dark:text-neutral-500 animate-spin" />
                    </div>
                  </div>
                )}
              </div>
            </div>
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
                  onClick={() => {
                    setFilesToOptimize([]);
                    setShowMultiOptimizer(true);
                  }}
                  disabled={uploading}
                  className="w-full max-w-xs py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-semibold transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed group"
                >
                  {uploading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <UploadCloud className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
                      Añadir
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
                        setCurrentPageIndex(visibleIdx % 2 === 0 ? visibleIdx : visibleIdx - 1);
                        setIsEditing(false);
                      }
                    }}
                  >
                    <img src={getPageUrl(page)} alt={`Página`} className="w-full h-full object-cover" loading="lazy" />
                  </div>
                  
                  {/* Edges Overlay */}
                  <div className="absolute inset-0 bg-black/30 md:bg-black/0 md:group-hover:bg-black/40 transition-colors flex flex-col justify-between p-3 pb-[4.5rem] opacity-100 md:opacity-0 md:group-hover:opacity-100 pointer-events-none">
                    <div className="flex justify-between items-center gap-2">
                      <div className="flex items-center gap-1.5">
                        <div className="px-2 py-1 bg-black/60 backdrop-blur-md rounded-md text-white text-xs font-bold shadow-sm flex items-center justify-center min-w-[28px]">
                          {pageNum}
                        </div>
                        {file.colaborativa && page.perfiles && (() => {
                          const dateStr = page.created_at || page.fecha_creacion || page.fecha_subida || page.fecha_clase || page.fechaClase;
                          const formattedDate = dateStr ? format(new Date(dateStr), "d MMM", { locale: es }) : "";
                          
                          return (
                            <Link 
                              href={`/perfil/${page.perfiles.apodo || page.perfiles.id || page.creador_id}`}
                              onClick={(e) => e.stopPropagation()}
                              className={`flex items-center gap-1.5 px-2 py-1 backdrop-blur-md rounded-full text-white shadow-sm pointer-events-auto border transition-all hover:scale-105 ${
                                isCurrentUserPageAuthor 
                                  ? "bg-purple-600/90 hover:bg-purple-600 border-purple-500/50" 
                                  : page.creador_id === (file as any).creador_id
                                    ? "bg-blue-600/90 hover:bg-blue-600 border-blue-500/50"
                                    : "bg-black/60 hover:bg-black/80 border-white/10"
                              }`}
                            >
                              {page.perfiles.avatar_url ? (
                                <img src={page.perfiles.avatar_url} className="w-5 h-5 rounded-full object-cover shadow-sm border border-white/20" alt="Avatar" />
                              ) : (
                                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold shadow-sm">
                                  {page.perfiles.nombre_completo?.[0] || 'U'}
                                </div>
                              )}
                              <div className="flex flex-col items-start leading-none pr-1">
                                <span className="text-[10px] sm:text-[11px] truncate max-w-[80px] font-medium opacity-90">
                                  {isCurrentUserPageAuthor ? "Tú" : page.perfiles.nombre_completo}
                                </span>
                                {formattedDate && (
                                  <span className="text-[7px] sm:text-[8px] opacity-70 font-normal mt-0.5">
                                    {formattedDate}
                                  </span>
                                )}
                              </div>
                            </Link>
                          );
                        })()}
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
                  
                  {/* Tag Overlay */}
                  <div className={`absolute bottom-3 left-3 right-3 pointer-events-auto transition-opacity z-20 ${page.etiqueta || (userCanEditPage && editingEtiquetaId === page.id) ? 'opacity-100' : 'opacity-100 md:opacity-0 md:group-hover:opacity-100'}`}>
                    {editingEtiquetaId === page.id ? (
                      <div className="flex flex-col gap-1.5 w-full bg-white/95 dark:bg-black/90 backdrop-blur-md border border-purple-500 shadow-lg rounded-xl p-2" onClick={(e) => e.stopPropagation()}>
                        <input
                          value={etiquetaGrupoDraft}
                          onChange={(e) => setEtiquetaGrupoDraft(e.target.value)}
                          placeholder="Grupo (ej: Unidad 1)"
                          className="w-full text-[11px] py-1 px-2 min-w-0 bg-neutral-100 dark:bg-white/5 rounded-md outline-none text-neutral-900 dark:text-white placeholder:text-neutral-500"
                        />
                        <div className="flex items-center gap-1.5">
                          <div className="relative">
                            <button 
                              onClick={() => setShowColorPicker(showColorPicker === page.id ? null : page.id)}
                              className="w-5 h-5 rounded-full shrink-0 border border-neutral-300 dark:border-white/20 shadow-sm transition-transform hover:scale-105"
                              style={{ backgroundColor: ETIQUETA_COLORS.find(c => c.value === etiquetaColorDraft)?.color || ETIQUETA_COLORS[0].color }}
                              title="Escoger color"
                            />
                            {showColorPicker === page.id && (
                              <div className="absolute bottom-full left-0 mb-2 p-1.5 bg-white dark:bg-neutral-800 rounded-lg shadow-xl border border-neutral-200 dark:border-white/10 flex gap-1 z-[100]">
                                {ETIQUETA_COLORS.map(colorObj => (
                                  <button
                                    key={colorObj.value}
                                    onClick={() => { setEtiquetaColorDraft(colorObj.value); setShowColorPicker(null); }}
                                    className="w-5 h-5 rounded-full border border-neutral-300 dark:border-white/20 hover:scale-110 transition-transform"
                                    style={{ backgroundColor: colorObj.color }}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                          <input
                            autoFocus
                            value={etiquetaDraft}
                            onChange={(e) => setEtiquetaDraft(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                handleUpdateEtiqueta(page.id, etiquetaDraft, etiquetaGrupoDraft, etiquetaColorDraft);
                              } else if (e.key === "Escape") {
                                setEditingEtiquetaId(null);
                                setShowColorPicker(null);
                              }
                            }}
                            placeholder="Etiqueta..."
                            className="flex-1 text-xs py-1 px-2 min-w-0 bg-neutral-100 dark:bg-white/5 rounded-md outline-none text-neutral-900 dark:text-white placeholder:text-neutral-500"
                          />
                          <button 
                            onClick={() => handleUpdateEtiqueta(page.id, etiquetaDraft, etiquetaGrupoDraft, etiquetaColorDraft)}
                            className="shrink-0 bg-purple-600 hover:bg-purple-700 text-white p-1 rounded-md shadow-sm transition-colors"
                            title="Guardar etiqueta"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div 
                        onClick={(e) => {
                          e.stopPropagation();
                          if (userCanEditPage) {
                            setEtiquetaDraft(page.etiqueta || "");
                            setEtiquetaGrupoDraft(page.etiqueta_grupo || "");
                            setEtiquetaColorDraft(page.etiqueta_color || ETIQUETA_COLORS[0].value);
                            setEditingEtiquetaId(page.id);
                          }
                        }}
                        style={page.etiqueta ? { backgroundColor: `${getEtiquetaHexColor(page.etiqueta_color)}f2` } : undefined}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-md shadow-lg max-w-full transition-all ${userCanEditPage ? "cursor-pointer hover:scale-[1.02] hover:shadow-xl" : "cursor-default"} ${page.etiqueta ? "border border-white/20 text-white" : "bg-black/60 border border-white/10 text-white hover:bg-black/80"}`}
                      >
                        <Tag className="w-3.5 h-3.5 shrink-0 opacity-80" />
                        <span className="text-[11px] font-medium truncate flex-1 text-left">
                          {page.etiqueta || (userCanEditPage ? "Añadir título/etiqueta" : "Sin título")}
                        </span>
                        {page.etiqueta_grupo && (
                          <span className="text-[9px] font-bold uppercase opacity-60 tracking-wider shrink-0 bg-black/20 px-1.5 py-0.5 rounded-sm">
                            {page.etiqueta_grupo}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {isHidden && canAddPage && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-3 py-1.5 bg-black/80 text-white text-xs font-bold rounded-lg pointer-events-none shadow-md z-10">
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
          <div className="relative w-full h-full flex flex-col flex-1 perspective-[1200px]">
            {/* Index Panel (Floating Left / Side Drawer on Mobile) */}
            <AnimatePresence>
              {showIndexPanel && groupedTags.length > 0 && (
                <motion.div
                  key="index-backdrop"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowIndexPanel(false)}
                  className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[85] md:hidden"
                />
              )}
              {showIndexPanel && groupedTags.length > 0 && (
                <div className="fixed md:absolute inset-y-0 md:inset-y-auto left-0 md:left-4 top-0 md:top-4 z-[90] w-full md:w-auto h-full md:h-auto pointer-events-none flex items-center md:items-start">
                  <motion.div
                    key="index-panel"
                    initial={{ x: "-100%", opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: "-100%", opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="pointer-events-auto w-[calc(100%-2rem)] max-w-[280px] md:w-64 max-h-[55vh] md:max-h-[calc(100%-8rem)] ml-4 md:ml-0 overflow-y-auto custom-scrollbar bg-white/95 dark:bg-[#1c1c1c]/95 backdrop-blur-xl shadow-2xl rounded-2xl border border-neutral-200 dark:border-white/10 p-4 flex flex-col"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
                        <Bookmark className="w-5 h-5" />
                        <h3 className="font-semibold text-neutral-900 dark:text-white">Índice</h3>
                      </div>
                      <button 
                        onClick={() => setShowIndexPanel(false)}
                        className="p-1 hover:bg-neutral-100 dark:hover:bg-white/10 rounded-full transition-colors"
                      >
                        <X className="w-4 h-4 text-neutral-500" />
                      </button>
                    </div>
                    <div className="flex flex-col gap-2">
                      {groupedTags.map((group, groupIdx) => {
                        const isCollapsed = collapsedGroups.has(group.groupName);
                        return (
                          <div key={groupIdx} className="flex flex-col gap-1">
                            <button
                              onClick={() => {
                                const newSet = new Set(collapsedGroups);
                                if (isCollapsed) newSet.delete(group.groupName);
                                else newSet.add(group.groupName);
                                setCollapsedGroups(newSet);
                              }}
                              className="flex items-center justify-between px-2 py-1.5 hover:bg-neutral-100 dark:hover:bg-white/5 rounded-md transition-colors group"
                            >
                              <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-700 dark:group-hover:text-neutral-200 transition-colors">
                                {group.groupName}
                              </span>
                              <ChevronDown className={`w-3.5 h-3.5 text-neutral-400 transition-transform ${isCollapsed ? "-rotate-90" : ""}`} />
                            </button>
                            
                            <AnimatePresence initial={false}>
                              {!isCollapsed && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="flex flex-col gap-0.5 overflow-hidden"
                                >
                                  {group.tags.map((t, i) => {
                                    const isActive = currentPageIndex === t.index || (isDoublePage && currentPageIndex + 1 === t.index);
                                    const colorHex = ETIQUETA_COLORS.find(c => c.value === t.color)?.color || "#9333ea";
                                    return (
                                      <button
                                        key={i}
                                        onClick={() => {
                                          setDirection(t.index > currentPageIndex ? 1 : -1);
                                          setCurrentPageIndex(isDoublePage ? (t.index % 2 === 0 ? t.index : t.index - 1) : t.index);
                                          if (window.innerWidth < 768) {
                                            setShowIndexPanel(false);
                                          }
                                        }}
                                        className={`flex items-center gap-2 text-left px-3 py-2 text-sm rounded-lg transition-all border ${isActive ? "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-500/30 text-purple-700 dark:text-purple-300 font-medium" : "border-transparent hover:bg-neutral-100 dark:hover:bg-white/5 text-neutral-600 dark:text-neutral-400"}`}
                                      >
                                        <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: colorHex }} />
                                        <span className="truncate flex-1">{t.tag}</span>
                                      </button>
                                    );
                                  })}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {/* Page Display (Notebook View) */}
            <div 
              ref={containerRef} 
              className={`w-full h-full flex-1 relative flex flex-col ${isFullscreen ? "overflow-auto" : "items-center overflow-hidden"} ${canPan ? "touch-none " + (isDragging ? "cursor-grabbing" : "cursor-grab") : ""}`}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
            >
              <div 
                ref={contentRef}
                className={`flex justify-center pt-16 pb-4 sm:pt-24 sm:pb-8 min-w-max ${isFullscreen ? "mx-auto" : "m-auto"} origin-center select-none`}
                style={{ 
                  transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoomLevel})`,
                  transition: isDragging ? "none" : "transform 0.3s ease-out"
                }}
              >
                  {(() => {
                    const leftPage = paginasVisibles[currentPageIndex];
                    const rightPage = isDoublePage ? paginasVisibles[currentPageIndex + 1] : undefined;
                    const hasSinglePage = !isDoublePage || !rightPage;

                    return (
                      <div 
                        className={`flex justify-center items-center relative perspective-[2500px] transition-all duration-300 min-w-max ${
                        isFullscreen
                          ? "gap-2 sm:gap-6 p-2 sm:p-4"
                          : "gap-1 sm:gap-4 p-2 sm:p-4 w-full max-w-7xl"
                      }`}>
                        {/* Left Page Wrapper */}
                        <div className="relative perspective-[2000px] z-10 shrink-0" style={pageStyle}>
                          <AnimatePresence initial={false} custom={direction}>
                            <motion.div 
                              key={`left-${currentPageIndex}`}
                              custom={direction}
                              variants={{
                                enter: (dir: number) => ({
                                  rotateY: dir > 0 ? 90 : -90,
                                  opacity: 0,
                                  boxShadow: "inset 0 0 60px rgba(0,0,0,0.1)"
                                }),
                                center: { 
                                  rotateY: 0, 
                                  opacity: 1,
                                  boxShadow: "inset 0 0 0px rgba(0,0,0,0)"
                                },
                                exit: (dir: number) => ({
                                  rotateY: dir > 0 ? -90 : 90,
                                  opacity: 0,
                                  boxShadow: "inset 0 0 60px rgba(0,0,0,0.1)"
                                })
                              }}
                              initial="enter" animate="center" exit="exit"
                              transition={{ duration: 0.5, ease: "easeInOut" }}
                              style={{ transformOrigin: "right center" }}
                              className="absolute inset-0 bg-white dark:bg-[#1c1c1c] shadow-2xl rounded-xl flex items-center justify-center p-2 sm:p-6 transition-transform"
                            >
                              {leftPage && (
                                <>
                                  <img src={getPageUrl(leftPage)} alt={`Página ${currentPageIndex + 1}`} className="w-full h-full object-contain pointer-events-none" draggable={false} loading="lazy" />
                                  {renderChip(leftPage, false)}
                                </>
                              )}
                            </motion.div>
                          </AnimatePresence>
                        </div>

                        {/* Middle Binder (its own dedicated space) */}
                        {isDoublePage && <BinderRings isSingle={hasSinglePage} />}

                        {/* Right Page Wrapper */}
                        {!hasSinglePage && (
                          <div className="relative perspective-[2000px] z-10 shrink-0" style={pageStyle}>
                            <AnimatePresence initial={false} custom={direction}>
                              <motion.div 
                                key={`right-${currentPageIndex}`}
                                custom={direction}
                                variants={{
                                  enter: (dir: number) => ({
                                    rotateY: dir > 0 ? 90 : -90,
                                    opacity: 0,
                                    boxShadow: "inset 0 0 60px rgba(0,0,0,0.1)"
                                  }),
                                  center: { 
                                    rotateY: 0, 
                                    opacity: 1,
                                    boxShadow: "inset 0 0 0px rgba(0,0,0,0)"
                                  },
                                  exit: (dir: number) => ({
                                    rotateY: dir > 0 ? -90 : 90,
                                    opacity: 0,
                                    boxShadow: "inset 0 0 60px rgba(0,0,0,0.1)"
                                  })
                                }}
                                initial="enter" animate="center" exit="exit"
                                transition={{ duration: 0.5, ease: "easeInOut" }}
                                style={{ transformOrigin: "left center" }}
                                className="absolute inset-0 bg-white dark:bg-[#1c1c1c] shadow-2xl rounded-xl flex items-center justify-center p-2 sm:p-6 transition-transform"
                              >
                                {rightPage && (
                                  <>
                                    <img src={getPageUrl(rightPage)} alt={`Página ${currentPageIndex + 2}`} className="w-full h-full object-contain pointer-events-none" draggable={false} loading="lazy" />
                                    {renderChip(rightPage, true)}
                                  </>
                                )}
                              </motion.div>
                            </AnimatePresence>
                          </div>
                        )}
                      </div>
                    );
                  })()}
              </div>
            </div>
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

        {/* Optimization Modal (Single File) */}
        <ImageOptimizerModal
          isOpen={showOptimizer}
          file={fileToOptimize}
          onClose={() => {
            setShowOptimizer(false);
            setFileToOptimize(null);
          }}
          onUpload={handleOptimizedUpload}
        />

        {/* Multi Optimization Modal (Multiple Files) */}
        <MultiImageUploadModal
          isOpen={showMultiOptimizer}
          files={filesToOptimize}
          onClose={() => {
            setShowMultiOptimizer(false);
            setFilesToOptimize([]);
          }}
          onUpload={handleMultiOptimizedUpload}
        />
        
        {/* Zoomed Page Overlay ("Primera Plana") */}
        <AnimatePresence>
          {zoomedPage && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 z-[120] flex items-center justify-center bg-white/80 dark:bg-black/80 backdrop-blur-md cursor-zoom-out"
              onClick={() => setZoomedPage(null)}
            >
              <button 
                onClick={(e) => { e.stopPropagation(); setZoomedPage(null); }}
                className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50 px-4 py-2 flex items-center gap-2 bg-neutral-200/50 hover:bg-neutral-300/50 text-neutral-800 dark:bg-white/10 dark:hover:bg-white/20 dark:text-white rounded-full transition-colors border border-neutral-300/50 dark:border-white/20 shadow-lg backdrop-blur-md cursor-pointer"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="font-medium text-sm">Cerrar vista</span>
              </button>
              
              <div className="relative w-full h-full flex items-center justify-center p-4 sm:p-12 pointer-events-none">
                <img 
                  src={getPageUrl(zoomedPage)} 
                  className="max-w-full max-h-full object-contain shadow-2xl rounded-md cursor-default pointer-events-auto"
                  alt="Vista en primera plana"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Barra Flotante Inferior estilo PDF */}
      {paginas.length > 0 && (
        <div className={`fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-[60] w-fit max-w-[95vw] pointer-events-none flex items-center justify-center gap-2 sm:gap-3 transition-all duration-300 overflow-x-auto no-scrollbar p-2 ${showOptimizer || showMultiOptimizer || (isFooterVisible && !isFullscreen) ? 'opacity-0 translate-y-10' : 'opacity-100 translate-y-0'}`}>
        {canAddPage && (
          <button 
            onClick={() => {
              setFilesToOptimize([]);
              setShowMultiOptimizer(true);
            }}
            disabled={uploading}
            className="shrink-0 bg-neutral-900 hover:bg-black dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-black rounded-full p-2.5 sm:px-5 sm:py-2.5 flex items-center justify-center gap-0 sm:gap-2 shadow-2xl pointer-events-auto transition-all disabled:opacity-70 disabled:cursor-not-allowed font-medium text-sm border border-transparent dark:border-neutral-200"
          >
            {uploading ? <Loader2 className="w-5 h-5 sm:w-4 sm:h-4 animate-spin" /> : <Plus className="w-5 h-5 sm:w-4 sm:h-4 stroke-[2.5]" />}
            <span className="hidden sm:inline">Añadir</span>
          </button>
        )}

        <div className="shrink-0 bg-white/95 dark:bg-[#1c1c1c]/95 backdrop-blur-md text-neutral-800 dark:text-white rounded-full px-2 sm:px-4 py-2 sm:py-2.5 flex items-center justify-center gap-1 sm:gap-4 shadow-2xl border border-neutral-200 dark:border-white/10 pointer-events-auto min-w-max">
            {/* Navegación */}
            <div className="flex items-center gap-1 sm:gap-2 pr-1 sm:pr-4 border-r border-neutral-200 dark:border-white/10">
              <button onClick={handlePrev} disabled={currentPageIndex === 0} className="p-1.5 hover:bg-neutral-100 dark:hover:bg-white/10 rounded-full transition-colors disabled:opacity-30">
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <span className="text-xs sm:text-sm font-medium min-w-[2.5rem] sm:min-w-[3rem] text-center">
                {isDoublePage ? `${currentPageIndex + 1}-${Math.min(currentPageIndex + 2, paginasVisibles.length)}` : currentPageIndex + 1} / {paginasVisibles.length}
              </span>
              <button onClick={handleNext} disabled={currentPageIndex + (isDoublePage ? 2 : 1) >= paginasVisibles.length} className="p-1.5 hover:bg-neutral-100 dark:hover:bg-white/10 rounded-full transition-colors disabled:opacity-30">
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            {/* Zoom & Vista */}
            <div className="flex items-center gap-1 sm:gap-2 pr-1 sm:pr-4 sm:border-r border-neutral-200 dark:border-white/10">
              <button onClick={() => setZoomLevel(prev => Math.max(0.4, prev - 0.2))} className="p-1.5 hover:bg-neutral-100 dark:hover:bg-white/10 rounded-full transition-colors" title="Alejar">
                <ZoomOut className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <span 
                className="text-xs sm:text-sm font-medium w-[2.5rem] sm:w-[3.5rem] text-center select-none cursor-pointer hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                onClick={() => { setZoomLevel(1); setPan({ x: 0, y: 0 }); }}
                title="Restablecer zoom (100%)"
              >
                {Math.round(zoomLevel * 100)}%
              </span>
              <button onClick={() => setZoomLevel(prev => Math.min(3.0, prev + 0.2))} className="p-1.5 hover:bg-neutral-100 dark:hover:bg-white/10 rounded-full transition-colors" title="Acercar">
                <ZoomIn className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <div className="hidden sm:block w-[1px] h-4 bg-neutral-200 dark:bg-white/20 mx-1"></div>
              <button onClick={() => setIsDoublePage(!isDoublePage)} className={`hidden sm:block p-1.5 hover:bg-neutral-100 dark:hover:bg-white/10 rounded-full transition-colors ${!isDoublePage ? 'text-purple-600 dark:text-purple-400' : ''}`} title={isDoublePage ? "Cambiar a Modo 1 Hoja" : "Cambiar a Modo Cuaderno"}>
                {isDoublePage ? <Book className="w-4 h-4 sm:w-5 sm:h-5" /> : <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />}
              </button>
            </div>

            {/* Acciones Adicionales (PC) */}
            <div className="hidden sm:flex items-center gap-1 sm:gap-2">
              {groupedTags.length > 0 && !isEditing && (
                <button onClick={() => setShowIndexPanel(!showIndexPanel)} className={`p-1.5 hover:bg-neutral-100 dark:hover:bg-white/10 rounded-full transition-colors ${showIndexPanel ? 'text-purple-600 dark:text-purple-400' : ''}`} title="Índice de temas">
                  <List className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              )}
              <button onClick={toggleFullscreen} className="p-1.5 hover:bg-neutral-100 dark:hover:bg-white/10 rounded-full transition-colors" title={isFullscreen ? "Minimizar" : "Pantalla completa"}>
                {isFullscreen ? <Minimize className="w-4 h-4 sm:w-5 sm:h-5" /> : <Maximize className="w-4 h-4 sm:w-5 sm:h-5" />}
              </button>
              {(canAddPage ? paginas.length > 0 : paginasVisibles.length > 0) && (
                <button onClick={() => setIsEditing(!isEditing)} className={`p-1.5 hover:bg-neutral-100 dark:hover:bg-white/10 rounded-full transition-colors ${isEditing ? 'text-purple-600 dark:text-purple-400' : ''}`} title={isEditing ? "Leer cuaderno" : "Organizar páginas"}>
                  {isEditing ? <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5" /> : <LayoutGrid className="w-4 h-4 sm:w-5 sm:h-5" />}
                </button>
              )}
            </div>

            {/* Mobile-only More options menu */}
            <div className="sm:hidden flex items-center pr-1">
              <div className="w-[1px] h-4 bg-neutral-200 dark:bg-white/20 mx-1"></div>
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger 
                  render={<button className="p-1.5 hover:bg-neutral-100 dark:hover:bg-white/10 rounded-full transition-colors text-neutral-700 dark:text-white" title="Más opciones" />}
                >
                  <MoreVertical className="w-4 h-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="z-[110] mb-2 bg-white/95 dark:bg-[#1c1c1c]/95 backdrop-blur-md rounded-2xl border-neutral-200 dark:border-white/10 p-2 shadow-xl" sideOffset={12}>
                  {groupedTags.length > 0 && !isEditing && (
                    <DropdownMenuItem onClick={() => setShowIndexPanel(!showIndexPanel)} className="rounded-xl cursor-pointer text-sm font-medium py-2.5 px-3">
                      <List className="w-4 h-4 mr-3 opacity-70" />
                      Índice de temas
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => setIsDoublePage(!isDoublePage)} className="rounded-xl cursor-pointer text-sm font-medium py-2.5 px-3">
                    {isDoublePage ? <BookOpen className="w-4 h-4 mr-3 opacity-70" /> : <Book className="w-4 h-4 mr-3 opacity-70" />}
                    {isDoublePage ? "Modo 1 Hoja" : "Modo Cuaderno"}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={toggleFullscreen} className="rounded-xl cursor-pointer text-sm font-medium py-2.5 px-3">
                    {isFullscreen ? <Minimize className="w-4 h-4 mr-3 opacity-70" /> : <Maximize className="w-4 h-4 mr-3 opacity-70" />}
                    {isFullscreen ? "Minimizar" : "Pantalla completa"}
                  </DropdownMenuItem>
                  {(canAddPage ? paginas.length > 0 : paginasVisibles.length > 0) && (
                    <DropdownMenuItem onClick={() => setIsEditing(!isEditing)} className="rounded-xl cursor-pointer text-sm font-medium py-2.5 px-3">
                      {isEditing ? <ImageIcon className="w-4 h-4 mr-3 opacity-70" /> : <LayoutGrid className="w-4 h-4 mr-3 opacity-70" />}
                      {isEditing ? "Leer cuaderno" : "Organizar páginas"}
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (isFullscreen && mounted) {
    return createPortal(content, document.body);
  }

  return (
    <>
      {content}
      
      {/* End of document section */}
      {!isFullscreen && paginas.length > 0 && (
        <div className="w-full bg-background" ref={footerRef}>
          <div className="max-w-4xl mx-auto py-16 px-6 flex flex-col items-center">
            <div className="flex items-center gap-4 mb-8 w-full">
              <div className="flex-1 h-px bg-border"></div>
              <span className="text-sm text-muted-foreground font-medium">Fin del cuaderno</span>
              <div className="flex-1 h-px bg-border"></div>
            </div>
            <h3 className="text-xl font-bold mb-6 text-foreground">¿Te fue útil este apunte?</h3>
            <div className="flex gap-4">
              <button 
                onClick={onLike}
                className={`px-6 py-2.5 border rounded-full flex items-center gap-2 font-medium transition-colors ${
                  interaction === 'like' 
                    ? "bg-green-100 border-green-300 text-green-700 dark:bg-green-900/40 dark:border-green-700 dark:text-green-400"
                    : "bg-muted border-border text-foreground hover:bg-green-50 hover:text-green-600 hover:border-green-300 dark:hover:bg-green-950/40 dark:hover:text-green-400 dark:hover:border-green-700"
                }`}
              >
                <ThumbsUp className={`w-4 h-4 ${interaction === 'like' ? "fill-current" : ""}`} /> Sí
              </button>
              <button 
                onClick={onDislike}
                className={`px-6 py-2.5 border rounded-full flex items-center gap-2 font-medium transition-colors ${
                  interaction === 'dislike'
                    ? "bg-red-100 border-red-300 text-red-700 dark:bg-red-900/40 dark:border-red-700 dark:text-red-400"
                    : "bg-muted border-border text-foreground hover:bg-red-50 hover:text-red-600 hover:border-red-300 dark:hover:bg-red-950/40 dark:hover:text-red-400 dark:hover:border-red-700"
                }`}
              >
                <ThumbsDown className={`w-4 h-4 ${interaction === 'dislike' ? "fill-current" : ""}`} /> No
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

