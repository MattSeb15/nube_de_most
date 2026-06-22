"use client";

import React, { useState, useEffect } from "react";
import { VisorPDF } from "@/components/apuntes/VisorPDF";
import { VisorCuaderno } from "@/components/apuntes/VisorCuaderno";
import { Download, ThumbsUp, ThumbsDown, Bookmark, Share, MoreHorizontal, FileText, Users, ArrowLeft, Eye } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toggleLikeDislike, toggleSave } from "../../acciones";
import { DownloadCuadernoModal } from "@/components/apuntes/DownloadCuadernoModal";
import { ShareDialog } from "@/components/ui/share-dialog";
import { createClient } from "@/utils/supabase/client";
import { jsPDF } from "jspdf";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { MoreVertical, Edit2, Trash2, MoveRight } from "lucide-react";
import { DialogoMover } from "@/components/apuntes/DialogoMover";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
export default function DocumentViewClient({ 
  file, 
  currentUser,
  initialLikes = 0,
  initialDislikes = 0,
  initialInteraction = null,
  initialIsSaved = false
}: { 
  file: any, 
  currentUser: any,
  initialLikes?: number,
  initialDislikes?: number,
  initialInteraction?: 'like' | 'dislike' | null,
  initialIsSaved?: boolean
}) {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  
  const [likes, setLikes] = useState(initialLikes);
  const [dislikes, setDislikes] = useState(initialDislikes);
  const [interaction, setInteraction] = useState<'like' | 'dislike' | null>(initialInteraction);
  const [isSaved, setIsSaved] = useState(initialIsSaved);
  const [isPending, setIsPending] = useState(false);
  const [collaborators, setCollaborators] = useState<any[]>([]);
  const [showCollabs, setShowCollabs] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const supabase = createClient();  

  // States for 3-dots actions
  const [fileNombre, setFileNombre] = useState(file.nombre);
  const [isCollaborative, setIsCollaborative] = useState(file.colaborativa);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const [isMoving, setIsMoving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSavingActions, setIsSavingActions] = useState(false);

  useEffect(() => {
    setFileNombre(file.nombre);
    setIsCollaborative(file.colaborativa);
  }, [file.nombre, file.colaborativa]);

  const isOwner = file.creador_id === currentUser?.id;
  const isAdmin = currentUser?.rol === "admin";
  const canEdit = isAdmin || isOwner;

  const hasOtherCollaborators = collaborators.some((c: any) => c.id !== file.creador_id);
  const disabledTooltip = hasOtherCollaborators ? "Primero los colaboradores deben eliminar sus aportes" : undefined;

  const handleRenameSubmit = async () => {
    if (!renameValue.trim() || isSavingActions) return;
    setIsSavingActions(true);
    const { error } = await supabase.from("archivos_apuntes").update({ nombre: renameValue }).eq("id", file.id);
    if (!error) {
      setFileNombre(renameValue);
      setIsRenaming(false);
      router.refresh();
    }
    setIsSavingActions(false);
  };

  const handleToggleCollaborative = async () => {
    if (isSavingActions) return;
    setIsSavingActions(true);
    const { error } = await supabase.from("archivos_apuntes").update({ colaborativa: !isCollaborative }).eq("id", file.id);
    if (!error) {
      setIsCollaborative(!isCollaborative);
      router.refresh();
    }
    setIsSavingActions(false);
  };

  const handleDeleteConfirm = async () => {
    if (isSavingActions) return;
    setIsSavingActions(true);
    const { error } = await supabase.from("archivos_apuntes").delete().eq("id", file.id);
    if (!error) {
      const materia = file.carpetas_apuntes?.materias;
      if (materia) {
        router.push(`/apuntes/${materia.semestres?.slug || materia.semestre_id}/${materia.slug || materia.id}`);
      } else {
        router.push("/apuntes");
      }
    } else {
      setIsSavingActions(false);
    }
  };

  const handleLike = async () => {
    if (!currentUser) return;
    if (isPending) return;
    setIsPending(true);
    const prevInteraction = interaction;
    let newLikes = likes;
    let newDislikes = dislikes;
    if (interaction === 'like') {
      newLikes--;
      setInteraction(null);
    } else {
      if (interaction === 'dislike') newDislikes--;
      newLikes++;
      setInteraction('like');
    }
    setLikes(newLikes);
    setDislikes(newDislikes);
    const res = await toggleLikeDislike(file.id, 'like');
    if (res?.error) {
      setInteraction(prevInteraction);
      setLikes(likes);
      setDislikes(dislikes);
    }
    setIsPending(false);
  };

  const handleDislike = async () => {
    if (!currentUser) return;
    if (isPending) return;
    setIsPending(true);
    const prevInteraction = interaction;
    let newLikes = likes;
    let newDislikes = dislikes;
    if (interaction === 'dislike') {
      newDislikes--;
      setInteraction(null);
    } else {
      if (interaction === 'like') newLikes--;
      newDislikes++;
      setInteraction('dislike');
    }
    setLikes(newLikes);
    setDislikes(newDislikes);
    const res = await toggleLikeDislike(file.id, 'dislike');
    if (res?.error) {
      setInteraction(prevInteraction);
      setLikes(likes);
      setDislikes(dislikes);
    }
    setIsPending(false);
  };

  const handleSave = async () => {
    if (!currentUser) return;
    if (isPending) return;
    setIsPending(true);
    const prevSaved = isSaved;
    setIsSaved(!isSaved);
    const res = await toggleSave(file.id);
    if (res?.error) {
      setIsSaved(prevSaved);
    }
    setIsPending(false);
  };

  const dateStr = file.created_at || file.fecha_subida || file.fechaSubida || file.fecha_creacion;
  const materia = file.carpetas_apuntes?.materias;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 150);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isPdf = file.tipo === "pdf";
  const isCuaderno = file.tipo === "cuaderno";
  const isSpecialBg = isPdf || isCuaderno;

  const getHeaderBg = () => {
    if (isPdf) return "bg-[#e5252a] dark:bg-[#c11c1f] text-white border-transparent";
    if (isCuaderno) return "bg-[#7e22ce] dark:bg-[#581c87] text-white border-transparent";
    return "bg-transparent border-border text-foreground";
  };

  const getFloatingBg = () => {
    if (isPdf) return "bg-[#e5252a]/95 dark:bg-[#c11c1f]/95 border-red-500/50 text-white";
    if (isCuaderno) return "bg-[#7e22ce]/95 dark:bg-[#581c87]/95 border-purple-500/50 text-white";
    return "bg-background/90 border-border text-foreground";
  };

  const headerBg = getHeaderBg();
  const floatingBg = getFloatingBg();
  const textMuted = isSpecialBg ? "text-white/80" : "text-muted-foreground";
  const textLink = isSpecialBg ? "text-white font-semibold hover:text-white/90 underline-offset-4 hover:underline transition-colors" : "text-primary hover:underline font-medium transition-colors";
  const iconBg = isSpecialBg ? "bg-white/20 text-white" : "bg-primary/10 text-primary";
  const btnGhost = isSpecialBg ? "text-white hover:text-white hover:bg-white/20" : "text-neutral-600 dark:text-neutral-300 hover:bg-muted";
  const likeBtnBg = isSpecialBg ? "bg-white/10" : "bg-muted";
  const likeBtnGhost = isSpecialBg ? "hover:bg-white/20 text-white" : "text-green-600 hover:text-green-700 hover:bg-green-50/50";
  const dislikeBtnGhost = isSpecialBg ? "hover:bg-white/20 text-white" : "text-red-600 hover:text-red-700 hover:bg-red-50/50";
  const likeDivider = isSpecialBg ? "bg-white/20" : "bg-border";
  
  const savedBtnClass = isSaved 
    ? (isPdf ? "bg-red-500 hover:bg-red-400 text-white shadow-md border border-red-400/50" : 
       isCuaderno ? "bg-purple-500 hover:bg-purple-400 text-white shadow-md border border-purple-400/50" : 
       "bg-purple-100 hover:bg-purple-200 text-purple-700 dark:bg-purple-900/40 dark:hover:bg-purple-900/60 dark:text-purple-300 shadow-sm")
    : btnGhost;
  const handleDownload = async () => {
    if (isCuaderno) {
      setShowDownloadModal(true);
      return;
    }

    const url = file.urlArchivo || file.url_archivo;
    if (!url) return;

    try {
      const proxiedUrl = `/api/proxy-pdf?url=${encodeURIComponent(url)}`;
      const response = await fetch(proxiedUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = blobUrl;
      a.download = `${file.nombre}${isPdf ? ".pdf" : ""}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(blobUrl);
      document.body.removeChild(a);
    } catch (e) {
      // Fallback
      const a = document.createElement("a");
      a.href = url + "?download=";
      a.download = `${file.nombre}`;
      a.target = "_blank";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const getCuadernoPages = async () => {
    const { data, error } = await supabase
      .from("paginas_cuaderno")
      .select("url_imagen, orden")
      .eq("cuaderno_id", file.id)
      .order("orden", { ascending: true });
    
    if (error) {
      console.error("Error fetching pages:", error);
      return [];
    }
    return data || [];
  };

  const fetchImageAsBlob = async (url: string) => {
    try {
      // Intentar a través de nuestro proxy para evadir CORS si es necesario, 
      // o directamente si el proxy también funciona para imágenes.
      const proxiedUrl = `/api/proxy-pdf?url=${encodeURIComponent(url)}`;
      const response = await fetch(proxiedUrl);
      if (!response.ok) throw new Error("Network response was not ok");
      return await response.blob();
    } catch (error) {
      // Fallback a fetch directo
      const response = await fetch(url);
      return await response.blob();
    }
  };

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const getImageDimensions = (base64: string): Promise<{ width: number, height: number }> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.width, height: img.height });
      img.onerror = reject;
      img.src = base64;
    });
  };

  const handleDownloadPdf = async () => {
    try {
      const pages = await getCuadernoPages();
      if (pages.length === 0) {
        alert("El cuaderno no tiene páginas para descargar.");
        return;
      }

      const pdf = new jsPDF();
      
      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        const url = page.url_imagen;
        
        try {
          const blob = await fetchImageAsBlob(url);
          const base64 = await blobToBase64(blob);
          const dims = await getImageDimensions(base64);

          // Ajustar tamaño de la página del PDF según la imagen (formato A4 aprox o mantener ratio)
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = (dims.height * pdfWidth) / dims.width;

          if (i > 0) {
            pdf.addPage([pdfWidth, pdfHeight]);
            pdf.setPage(i + 1);
          } else {
             // Redimensionar la primera página
             // Hacky way in jsPDF to set the first page size if needed, but we can just use standard A4
             // For better results, we keep A4 and scale image to fit A4
          }

          const a4Width = 210;
          const a4Height = 297;
          
          const ratio = Math.min(a4Width / dims.width, a4Height / dims.height);
          const imgWidth = dims.width * ratio;
          const imgHeight = dims.height * ratio;
          
          const marginX = (a4Width - imgWidth) / 2;
          const marginY = (a4Height - imgHeight) / 2;

          // Aseguramos formato 'JPEG' o 'PNG' basado en los datos
          const isPng = base64.startsWith("data:image/png");
          
          pdf.addImage(base64, isPng ? "PNG" : "JPEG", marginX, marginY, imgWidth, imgHeight);
        } catch (error) {
          console.error(`Error procesando página ${i + 1}:`, error);
        }
      }

      pdf.save(`${file.nombre}.pdf`);
    } catch (error) {
      console.error("Error al generar PDF:", error);
      alert("Hubo un error al generar el PDF.");
    }
  };

  const handleDownloadZip = async () => {
    try {
      const pages = await getCuadernoPages();
      if (pages.length === 0) {
        alert("El cuaderno no tiene páginas para descargar.");
        return;
      }

      const zip = new JSZip();
      const folder = zip.folder(file.nombre);

      if (!folder) throw new Error("No se pudo crear la carpeta ZIP");

      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        const url = page.url_imagen;
        
        try {
          const blob = await fetchImageAsBlob(url);
          // Determinar extensión, asumiendo jpg si no es evidente
          let ext = "jpg";
          if (blob.type === "image/png") ext = "png";
          else if (blob.type === "image/webp") ext = "webp";
          
          folder.file(`pagina_${i + 1}.${ext}`, blob);
        } catch (error) {
          console.error(`Error descargando página ${i + 1}:`, error);
        }
      }

      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, `${file.nombre}.zip`);
    } catch (error) {
      console.error("Error al generar ZIP:", error);
      alert("Hubo un error al generar el ZIP.");
    }
  };

  const renderMoreOptions = (mobileClass?: string) => {
    if (!canEdit) return null;
    return (
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger className={cn("inline-flex items-center justify-center rounded-full w-8 h-8 p-0 shrink-0 hover:bg-neutral-100 dark:hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring transition-colors", isSpecialBg ? "text-white hover:bg-white/20 hover:text-white" : "text-foreground", mobileClass)}>
          <MoreVertical className="w-4 h-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => { setRenameValue(fileNombre); setIsRenaming(true); }}>
            <Edit2 className="w-4 h-4 mr-2" /> Renombrar
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setIsMoving(true)}>
            <MoveRight className="w-4 h-4 mr-2" /> Mover
          </DropdownMenuItem>
          {isCuaderno && (
            <DropdownMenuItem 
              onClick={handleToggleCollaborative}
              disabled={hasOtherCollaborators}
              title={disabledTooltip}
            >
              <Users className="w-4 h-4 mr-2" /> {isCollaborative ? "Quitar Colaborativo" : "Hacer Colaborativo"}
            </DropdownMenuItem>
          )}
          <DropdownMenuItem 
            className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/30" 
            onClick={() => setIsDeleting(true)}
            disabled={hasOtherCollaborators}
            title={disabledTooltip}
          >
            <Trash2 className="w-4 h-4 mr-2" /> Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  return (
    <main className="bg-background min-h-screen">
      {/* Floating Mini Header */}
      <div 
        className={cn(
          "fixed top-[72px] sm:top-[80px] left-0 right-0 z-40 mx-auto w-full max-w-7xl transition-all duration-300 pointer-events-none px-2 sm:px-4",
          isScrolled ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
        )}
      >
        <div className={cn("backdrop-blur-md border shadow-md rounded-2xl p-2 sm:p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4 pointer-events-auto", floatingBg)}>
          <div className="w-full sm:flex-1 min-w-0 flex items-center gap-2 sm:gap-3">
            <Button onClick={() => router.back()} variant="ghost" size="icon" className={cn("shrink-0 rounded-full h-8 w-8 sm:h-9 sm:w-9", isSpecialBg ? "text-white hover:bg-white/20" : "text-foreground")}>
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
            <div className={cn("hidden sm:flex h-8 w-8 rounded-full items-center justify-center shrink-0", iconBg)}>
               <FileText className="w-4 h-4" />
            </div>
            <div className="flex flex-col min-w-0 w-full">
              <h2 className="text-sm sm:text-base font-bold truncate leading-tight">
                {fileNombre}
              </h2>
              <div className={cn("flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs mt-0.5 min-w-0 w-full overflow-hidden", textMuted)}>
                {materia && (
                  <Link href={`/apuntes/${materia.semestres?.slug || materia.semestre_id}/${materia.slug || materia.id}`} className="truncate font-medium hover:text-white hover:underline transition-colors shrink min-w-0">
                    {materia.nombre}
                  </Link>
                )}
                
                {materia && <span className="hidden sm:inline shrink-0">•</span>}
                
                <Link href={`/perfil/${file.perfiles?.apodo || file.perfiles?.id || file.creador_id}`} className="hidden sm:flex items-center gap-1.5 hover:text-white hover:underline transition-colors group shrink min-w-0">
                  {file.perfiles?.avatar_url && (
                    <img src={file.perfiles.avatar_url} alt={file.perfiles.nombre_completo} className="w-4 h-4 rounded-full object-cover group-hover:ring-1 group-hover:ring-white transition-all shrink-0" />
                  )}
                  <span className="truncate shrink min-w-0">{file.perfiles?.nombre_completo || "Usuario anónimo"}</span>
                </Link>
                
                <span className="hidden sm:inline shrink-0">•</span>
                
                <span className="font-medium capitalize shrink-0 hidden sm:inline">
                  {dateStr ? format(new Date(dateStr), "d MMM yyyy, HH:mm", { locale: es }) : "2024"}
                </span>
                <span className="font-medium capitalize shrink-0 sm:hidden">
                  {dateStr ? format(new Date(dateStr), "d MMM, HH:mm", { locale: es }) : "2024"}
                </span>
                
                <span className="hidden sm:inline shrink-0">•</span>
                
                <span className="flex items-center gap-1 font-medium shrink-0" title={`${file.vistas || 0} vistas`}>
                  <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  <span>{file.vistas || 0}</span>
                </span>
              </div>
            </div>
            <div className="sm:hidden shrink-0 ml-1">
              {renderMoreOptions()}
            </div>
          </div>
          <div className="w-full sm:w-auto flex items-center justify-start sm:justify-end gap-1.5 sm:gap-2 shrink-0 mt-1 sm:mt-0">
            {/* Ocultamos los botones de like/dislike solo en pantallas ultra pequeñas (< 350px) usando max-[350px]:hidden */}
            <div className={cn("flex max-[350px]:hidden items-center rounded-full sm:mr-1 h-8", likeBtnBg)}>
              <Button onClick={handleLike} variant="ghost" size="sm" className={cn("rounded-l-full px-2 h-full transition-colors", interaction === 'like' ? (isPdf ? "bg-white/30 text-white" : "bg-green-100 text-green-700") : likeBtnGhost)}>
                <ThumbsUp className={cn("w-3.5 h-3.5", interaction === 'like' && "fill-current")} /> {likes > 0 && <span className="ml-1 sm:ml-1.5 text-xs">{likes}</span>}
              </Button>
              <div className={cn("w-[1px] h-3", likeDivider)}></div>
              <Button onClick={handleDislike} variant="ghost" size="sm" className={cn("rounded-r-full px-2 h-full transition-colors", interaction === 'dislike' ? (isPdf ? "bg-white/30 text-white" : "bg-red-100 text-red-700") : dislikeBtnGhost)}>
                <ThumbsDown className={cn("w-3.5 h-3.5", interaction === 'dislike' && "fill-current")} /> {dislikes > 0 && <span className="ml-1 sm:ml-1.5 text-xs">{dislikes}</span>}
              </Button>
            </div>
            <Button onClick={handleSave} variant="ghost" size="sm" className={cn("flex rounded-full h-8 px-2 lg:px-3 transition-colors", savedBtnClass)}>
              <Bookmark className={cn("w-3.5 h-3.5 lg:mr-1.5", isSaved && "fill-current")} /> <span className="text-xs hidden lg:inline">{isSaved ? "Guardado" : "Guardar"}</span>
            </Button>
            <Button onClick={() => setIsShareDialogOpen(true)} variant="ghost" size="sm" className={cn("flex rounded-full h-8 px-2 lg:px-3 transition-colors", savedBtnClass)}>
              <Share className="w-3.5 h-3.5 lg:mr-1.5" /> <span className="text-xs hidden lg:inline">Compartir</span>
            </Button>
            <Button onClick={handleDownload} size="sm" className={cn("bg-green-600 hover:bg-green-700 text-white rounded-full font-bold shadow-sm px-2.5 sm:px-4 h-8 text-xs", isSpecialBg && "shadow-none border border-green-500")}>
              <Download className="w-3.5 h-3.5 sm:mr-1.5" /> <span className="hidden sm:inline">Descargar</span>
            </Button>
            {renderMoreOptions("hidden sm:inline-flex ml-1 sm:ml-0")}
          </div>
        </div>
      </div>

      {/* Header Estilo Imagen 2 */}
      <header className={cn("z-30 border-b px-4 py-4 sm:px-6 flex flex-col gap-3 relative transition-colors shrink-0", headerBg, isSpecialBg && "-mt-[88px] pt-[120px]")}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <Button onClick={() => router.back()} variant="ghost" size="icon" className={cn("shrink-0 rounded-full -ml-2", isSpecialBg ? "text-white hover:bg-white/20" : "text-foreground")}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-xl sm:text-2xl font-bold leading-tight truncate">
                {fileNombre}
              </h1>
            </div>
            <div className={cn("flex flex-col gap-2.5 mt-1 text-xs sm:text-sm pl-1", textMuted)}>
              {materia && (
                <div className="flex items-center gap-1.5">
                  <span>Materia:</span>
                  <Link href={`/apuntes/${materia.semestres?.slug || materia.semestre_id}/${materia.slug || materia.id}`} className={textLink}>
                    {materia.nombre}
                  </Link>
                </div>
              )}
              
              <div className="flex items-center gap-1.5 group cursor-pointer relative">
                {file.perfiles?.avatar_url ? (
                  <img src={file.perfiles.avatar_url} alt="Avatar" className="w-5 h-5 rounded-full object-cover border border-white/20 group-hover:border-white transition-colors" />
                ) : (
                  <div className={cn("w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold group-hover:bg-white/30 transition-colors", iconBg)}>
                    {file.perfiles?.nombre_completo?.[0] || 'U'}
                  </div>
                )}
                <Link href={`/perfil/${file.perfiles?.apodo || file.creador_id}`} className={textLink}>
                  {file.perfiles?.nombre_completo || "Usuario anónimo"}
                </Link>
                {collaborators.length > 0 && (
                  <div className="relative ml-2">
                    <button onClick={() => setShowCollabs(!showCollabs)} className={cn("flex items-center gap-1 text-[10px] sm:text-xs px-2 py-0.5 rounded-full transition-colors border", isSpecialBg ? "bg-white/10 hover:bg-white/20 border-white/20 text-white" : "bg-primary/5 hover:bg-primary/10 border-primary/20 text-primary")}>
                      <Users className="w-3 h-3" />
                      <span>+{collaborators.length} colaborador{collaborators.length !== 1 && 'es'}</span>
                    </button>
                    
                    {showCollabs && (
                      <div className="absolute top-full left-0 mt-2 w-48 bg-background rounded-xl shadow-xl border border-border p-2 z-50 animate-fade-in text-foreground cursor-default">
                        <p className="text-[10px] font-bold uppercase text-muted-foreground px-2 py-1 mb-1 border-b border-border">Colaboradores</p>
                        <div className="flex flex-col max-h-40 overflow-y-auto">
                          {collaborators.map((c, i) => (
                            <Link key={i} href={`/perfil/${c.apodo || c.id}`} className="flex items-center gap-2 p-1.5 hover:bg-muted rounded-lg transition-colors">
                              {c.avatar_url ? (
                                <img src={c.avatar_url} className="w-5 h-5 rounded-full object-cover" alt="" />
                              ) : (
                                <div className="w-5 h-5 rounded-full bg-muted-foreground/20 flex items-center justify-center text-[10px] font-bold">
                                  {c.nombre_completo?.[0] || 'U'}
                                </div>
                              )}
                              <span className="text-xs font-medium truncate">{c.nombre_completo}</span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="font-medium capitalize">{dateStr ? format(new Date(dateStr), "d MMM yyyy, HH:mm", { locale: es }) : "2024"}</span>
                <span className="opacity-50 text-[10px]">•</span>
                <span className="flex items-center gap-1 font-medium" title={`${file.vistas || 0} vistas`}>
                  <Eye className="w-3.5 h-3.5" />
                  <span>{file.vistas || 0}</span>
                </span>
              </div>
            </div>
          </div>
          {canEdit && (
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger className={cn("inline-flex items-center justify-center rounded-full h-9 w-9 shrink-0 hover:bg-neutral-100 dark:hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring transition-colors", isSpecialBg ? "text-white hover:bg-white/20 hover:text-white" : "text-foreground")}>
                <MoreVertical className="w-5 h-5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => { setRenameValue(fileNombre); setIsRenaming(true); }}>
                  <Edit2 className="w-4 h-4 mr-2" /> Renombrar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsMoving(true)}>
                  <MoveRight className="w-4 h-4 mr-2" /> Mover
                </DropdownMenuItem>
                {isCuaderno && (
                  <DropdownMenuItem 
                    onClick={handleToggleCollaborative}
                    disabled={hasOtherCollaborators}
                    title={disabledTooltip}
                  >
                    <Users className="w-4 h-4 mr-2" /> {isCollaborative ? "Quitar Colaborativo" : "Hacer Colaborativo"}
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem 
                  className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/30" 
                  onClick={() => setIsDeleting(true)}
                  disabled={hasOtherCollaborators}
                  title={disabledTooltip}
                >
                  <Trash2 className="w-4 h-4 mr-2" /> Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        {/* Action Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-1">
          <Button 
            onClick={isPdf || isCuaderno ? handleDownload : undefined}
            disabled={!isPdf && !isCuaderno}
            className={cn(
              "rounded-full font-bold shadow-sm px-6 shrink-0", 
              isPdf || isCuaderno
                ? cn("bg-green-600 hover:bg-green-700 text-white", isSpecialBg && "shadow-none border border-green-500")
                : "bg-neutral-200 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400 cursor-not-allowed"
            )}
          >
            <Download className="w-4 h-4 mr-2" /> 
            {isPdf || isCuaderno ? "Descargar" : "Descargar"}
          </Button>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <div className={cn("flex items-center rounded-full", likeBtnBg)}>
              <Button onClick={handleLike} variant="ghost" size="sm" className={cn("rounded-l-full px-3 transition-colors", interaction === 'like' ? (isPdf ? "bg-white/30 text-white" : "bg-green-100 text-green-700") : likeBtnGhost)}>
                <ThumbsUp className={cn("w-4 h-4 mr-1.5", interaction === 'like' && "fill-current")} /> {likes}
              </Button>
              <div className={cn("w-[1px] h-4", likeDivider)}></div>
              <Button onClick={handleDislike} variant="ghost" size="sm" className={cn("rounded-r-full px-3 transition-colors", interaction === 'dislike' ? (isPdf ? "bg-white/30 text-white" : "bg-red-100 text-red-700") : dislikeBtnGhost)}>
                <ThumbsDown className={cn("w-4 h-4 mr-1.5", interaction === 'dislike' && "fill-current")} /> {dislikes}
              </Button>
            </div>
            <Button onClick={handleSave} variant="ghost" size="sm" className={cn("rounded-full flex transition-colors", savedBtnClass)}>
              <Bookmark className={cn("w-4 h-4 mr-2", isSaved && "fill-current")} /> {isSaved ? "Guardado" : "Guardar"}
            </Button>
            <Button onClick={() => setIsShareDialogOpen(true)} variant="ghost" size="sm" className={cn("rounded-full flex transition-colors", savedBtnClass)}>
              <Share className="w-4 h-4 mr-2" /> Compartir
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content Viewer */}
      <div className={cn("w-full mx-auto", isSpecialBg ? "max-w-none p-0" : "max-w-6xl p-4 sm:p-6 mb-8 mt-2")}>
        {file.tipo === "pdf" ? (
          <VisorPDF 
            file={file} 
            onClose={() => router.back()} 
            interaction={interaction}
            onLike={handleLike}
            onDislike={handleDislike}
          />
        ) : (
          <VisorCuaderno 
            file={file} 
            onClose={() => router.back()} 
            currentUserId={currentUser?.id} 
            isAdmin={currentUser?.rol === 'admin'} 
            onCollaboratorsLoad={setCollaborators}
            interaction={interaction}
            onLike={handleLike}
            onDislike={handleDislike}
          />
        )}
      </div>

      <DownloadCuadernoModal 
        isOpen={showDownloadModal}
        onClose={() => setShowDownloadModal(false)}
        onDownloadPdf={handleDownloadPdf}
        onDownloadZip={handleDownloadZip}
      />

      <ShareDialog 
        isOpen={isShareDialogOpen} 
        onOpenChange={setIsShareDialogOpen} 
        title={`Compartir ${fileNombre}`}
        text={`Mira este ${isCuaderno ? 'cuaderno' : 'documento'} en Most Cloud`}
      />

      <Dialog open={isRenaming} onOpenChange={setIsRenaming}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Renombrar {isCuaderno ? 'cuaderno' : 'documento'}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <input
              type="text"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              placeholder="Nuevo nombre..."
              className="w-full bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-md px-4 py-2 text-neutral-900 dark:text-white focus:outline-none focus:border-purple-500"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleRenameSubmit();
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRenaming(false)}>
              Cancelar
            </Button>
            <Button onClick={handleRenameSubmit} className="bg-purple-600 hover:bg-purple-700 text-white" disabled={isSavingActions}>
              {isSavingActions ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleting} onOpenChange={setIsDeleting}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar {isCuaderno ? 'cuaderno' : 'documento'}</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que quieres eliminar <strong>{fileNombre}</strong> de forma permanente? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleting(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm} disabled={isSavingActions}>
              {isSavingActions ? "Eliminando..." : "Eliminar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DialogoMover
        isOpen={isMoving}
        onClose={() => setIsMoving(false)}
        itemToMove={{ type: 'file', item: file }}
        onConfirm={async (newMateriaId, newFolderId) => {
          setIsMoving(false);
          if (isSavingActions) return;
          setIsSavingActions(true);
          const { error } = await supabase.from('archivos_apuntes').update({ carpeta_id: newFolderId }).eq('id', file.id);
          if (!error) {
            router.refresh();
          }
          setIsSavingActions(false);
        }}
      />
    </main>
  );
}
