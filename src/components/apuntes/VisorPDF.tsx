"use client";

import React, { useState, useEffect, useRef } from "react";
import type { ArchivoApunte } from "@/types";
import { X, ExternalLink, Loader2, AlertCircle, Eye, ThumbsUp, ThumbsDown, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

import { Worker, Viewer, SpecialZoomLevel } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin, ToolbarProps, ToolbarSlot } from '@react-pdf-viewer/default-layout';

import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

// Worker URL provided by unpkg
const pdfjsVersion = "3.11.174";
const workerUrl = `https://unpkg.com/pdfjs-dist@${pdfjsVersion}/build/pdf.worker.min.js`;

interface VisorPDFProps {
  file: ArchivoApunte | any;
  currentUser?: any;
  onClose?: () => void;
  interaction?: 'like' | 'dislike' | null;
  onLike?: () => void;
  onDislike?: () => void;
}

export function VisorPDF({ file, currentUser, onClose, interaction, onLike, onDislike }: VisorPDFProps) {
  // Sync with global document dark mode
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // Customize the toolbar to remove the theme switcher and unnecessary options
  const renderToolbar = (Toolbar: (props: ToolbarProps) => React.ReactElement) => (
    <Toolbar>
      {(slots: ToolbarSlot) => {
        const {
          EnterFullScreen,
          Zoom,
          ZoomIn,
          ZoomOut,
          GoToNextPage,
          GoToPreviousPage,
          CurrentPageInput,
          NumberOfPages,
        } = slots;
        return (
          <div className="flex items-center gap-1 sm:gap-2 px-4 py-2 sm:px-5 sm:py-2.5 bg-white/95 dark:bg-neutral-900/90 backdrop-blur-md rounded-full shadow-2xl border border-neutral-200 dark:border-white/10 text-neutral-800 dark:text-white animate-slide-up">
            <button 
              onClick={() => scrollToPage(currentPage - 1)} 
              disabled={currentPage === 0} 
              className="p-1.5 hover:bg-neutral-200 dark:hover:bg-white/20 rounded-full transition-colors text-neutral-700 dark:text-white disabled:opacity-50" 
              title="Página Anterior"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <div className="flex items-center gap-1 text-xs sm:text-sm font-semibold tracking-wider">
              <div className="w-8">
                <input 
                  type="text" 
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onBlur={() => setInputValue((currentPage + 1).toString())}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const val = parseInt((e.target as HTMLInputElement).value) - 1;
                      if (!isNaN(val)) scrollToPage(val);
                      (e.target as HTMLInputElement).blur();
                    }
                  }}
                  className="rpv-core__textbox" 
                />
              </div>
              <span className="opacity-50 dark:opacity-70">/</span>
              <NumberOfPages />
            </div>
            <button 
              onClick={() => scrollToPage(currentPage + 1)} 
              className="p-1.5 hover:bg-neutral-200 dark:hover:bg-white/20 rounded-full transition-colors text-neutral-700 dark:text-white disabled:opacity-50" 
              title="Página Siguiente"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
            
            <div className="w-px h-5 sm:h-6 bg-neutral-300 dark:bg-white/20 mx-1 sm:mx-2"></div>

            <ZoomOut>
              {(props) => (
                <button onClick={props.onClick} className="p-1.5 hover:bg-neutral-200 dark:hover:bg-white/20 rounded-full transition-colors text-neutral-700 dark:text-white" title="Reducir">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
                </button>
              )}
            </ZoomOut>
            <div className="px-1 sm:px-2 min-w-[3rem] sm:min-w-[4rem] text-center text-xs sm:text-sm font-semibold tracking-wider">
              <Zoom />
            </div>
            <ZoomIn>
              {(props) => (
                <button onClick={props.onClick} className="p-1.5 hover:bg-neutral-200 dark:hover:bg-white/20 rounded-full transition-colors text-neutral-700 dark:text-white" title="Ampliar">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
                </button>
              )}
            </ZoomIn>
            <div className="w-px h-5 sm:h-6 bg-neutral-300 dark:bg-white/20 mx-1 sm:mx-2"></div>
            <EnterFullScreen>
              {(props) => (
                <button onClick={props.onClick} className="p-1.5 hover:bg-neutral-200 dark:hover:bg-white/20 rounded-full transition-colors text-neutral-700 dark:text-white" title="Pantalla Completa">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
                </button>
              )}
            </EnterFullScreen>
            <div className="w-px h-5 sm:h-6 bg-neutral-300 dark:bg-white/20 mx-1 sm:mx-2"></div>
            <button onClick={() => window.open(file.urlArchivo || (file as any).url_archivo, '_blank')} className="p-1.5 hover:bg-neutral-200 dark:hover:bg-white/20 rounded-full transition-colors text-neutral-700 dark:text-white" title="Abrir en otra pestaña">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
            </button>
          </div>
        );
      }}
    </Toolbar>
  );

  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  const footerRef = useRef<HTMLDivElement>(null);
  const [isFooterVisible, setIsFooterVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [inputValue, setInputValue] = useState("1");

  useEffect(() => {
    setInputValue((currentPage + 1).toString());
  }, [currentPage]);

  const scrollToPage = (pageIndex: number) => {
    if (pageIndex < 0) return;
    const pageLayers = document.querySelectorAll('.rpv-core__page-layer');
    if (pageIndex >= pageLayers.length) return;
    
    const targetElement = pageLayers[pageIndex];
    if (targetElement) {
      const rect = targetElement.getBoundingClientRect();
      const offset = window.pageYOffset || document.documentElement.scrollTop;
      window.scrollTo({ top: rect.top + offset - 100, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const pageLayers = document.querySelectorAll('.rpv-core__page-layer');
          let maxVisibleRatio = 0;
          let mostVisibleIndex = currentPage;
          const windowHeight = window.innerHeight;

          pageLayers.forEach((layer, index) => {
            const rect = layer.getBoundingClientRect();
            const visibleTop = Math.max(0, rect.top);
            const visibleBottom = Math.min(windowHeight, rect.bottom);
            const visibleHeight = Math.max(0, visibleBottom - visibleTop);
            
            if (visibleHeight > maxVisibleRatio) {
              maxVisibleRatio = visibleHeight;
              mostVisibleIndex = index;
            }
          });
          
          if (mostVisibleIndex !== currentPage && maxVisibleRatio > 0) {
            setCurrentPage(mostVisibleIndex);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [currentPage]);

  const handlePageChange = (e: any) => {
    // Only use internal page tracking if we don't have our own scroll listener
    // Actually, we can just ignore it since our scroll listener is more accurate
  };

  useEffect(() => {
    if (!footerRef.current) return;
    const observer = new IntersectionObserver(([entry]) => {
      setIsFooterVisible(entry.isIntersecting);
    }, { threshold: 0.1 });
    observer.observe(footerRef.current);
    return () => observer.disconnect();
  }, [blobUrl]);

  useEffect(() => {
    if (isFooterVisible) {
      document.body.classList.add('hide-pdf-toolbar');
    } else {
      document.body.classList.remove('hide-pdf-toolbar');
    }
    return () => document.body.classList.remove('hide-pdf-toolbar');
  }, [isFooterVisible]);

  const defaultLayoutPluginInstance = defaultLayoutPlugin({
    // Hide the sidebar completely (thumbnails, bookmarks, attachments)
    sidebarTabs: () => [],
    renderToolbar,
  });

  const [error, setError] = useState<string | null>(null);

  const rawUrl = file.urlArchivo || (file as any).url_archivo;

  useEffect(() => {
    if (!rawUrl) {
      setError("No se proporcionó URL para este archivo PDF.");
      return;
    }

    setBlobUrl(null);
    setError(null);

    let active = true;
    let currentObjectUrl: string | null = null;

    const fetchPdf = async () => {
      try {
        const proxiedUrl = `/api/proxy-pdf?url=${encodeURIComponent(rawUrl)}`;
        const res = await fetch(proxiedUrl);
        if (!res.ok) throw new Error("Error al descargar el PDF desde el servidor.");
        
        const blob = await res.blob();
        if (!active) return;
        
        const objectUrl = URL.createObjectURL(blob);
        currentObjectUrl = objectUrl;
        setBlobUrl(objectUrl);
      } catch (err: any) {
        if (!active) return;
        console.error("PDF Fetch Error:", err);
        setError("Ocurrió un error al cargar el PDF. Puede que el archivo esté corrupto o no tengas permisos.");
      }
    };

    fetchPdf();

    return () => {
      active = false;
      if (currentObjectUrl) {
        URL.revokeObjectURL(currentObjectUrl);
      }
    };
  }, [rawUrl]);

  if (!rawUrl) {
    return (
      <div className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto h-[400px] bg-neutral-100 dark:bg-[#111] text-neutral-900 dark:text-white rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 animate-fade-in">
        <p>No se proporcionó URL para este archivo PDF.</p>
        <button onClick={onClose} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Cerrar Visor</button>
      </div>
    );
  }

  // Inject CSS overrides to make the PDF viewer render inline (no internal scroll)
  useEffect(() => {
    const style = document.createElement('style');
    style.setAttribute('data-visor-pdf', '');
    style.textContent = `
      .rpv-core__viewer,
      .rpv-default-layout__container,
      .rpv-default-layout__body,
      .rpv-core__inner-container {
        overflow: visible !important;
        height: auto !important;
        position: relative !important;
      }
      .rpv-core__inner-pages {
        overflow: visible !important;
        height: auto !important;
      }
      .rpv-default-layout__toolbar {
        position: fixed !important;
        top: auto !important;
        bottom: 2rem !important;
        left: 50% !important;
        transform: translateX(-50%) !important;
        z-index: 50 !important;
        width: auto !important;
        border: none !important;
        background: transparent !important;
        padding: 0 !important;
        transition: all 0.3s ease-in-out !important;
      }
      body.hide-pdf-toolbar .rpv-default-layout__toolbar {
        opacity: 0 !important;
        pointer-events: none !important;
        transform: translateX(-50%) translateY(20px) !important;
      }
      .rpv-core__inner-pages::-webkit-scrollbar {
        display: none;
      }
      /* Dark mode styles for toolbar */
      html.dark .rpv-default-layout__toolbar .rpv-core__minimal-button,
      html.dark .rpv-default-layout__toolbar .rpv-core__popover-target,
      html.dark .rpv-default-layout__toolbar button {
        color: white !important;
      }
      html.dark .rpv-default-layout__toolbar svg,
      html.dark .rpv-default-layout__toolbar path,
      html.dark .rpv-default-layout__toolbar polygon {
        color: white !important;
      }
      /* Only apply fill to the specific dropdown arrow so we don't break our outline icons */
      html.dark .rpv-default-layout__toolbar .rpv-core__popover-target svg,
      html.dark .rpv-default-layout__toolbar .rpv-core__popover-target path,
      html.dark .rpv-default-layout__toolbar .rpv-core__popover-target polygon {
        fill: currentColor !important;
        stroke: none !important;
      }
      html.dark .rpv-default-layout__toolbar .rpv-core__textbox {
        background: rgba(255, 255, 255, 0.1) !important;
        border: 1px solid rgba(255, 255, 255, 0.2) !important;
        color: white !important;
      }
      html.dark .rpv-default-layout__toolbar .rpv-core__textbox:focus {
        border-color: rgba(255, 255, 255, 0.5) !important;
      }

      /* Light mode styles for toolbar */
      html:not(.dark) .rpv-default-layout__toolbar .rpv-core__minimal-button,
      html:not(.dark) .rpv-default-layout__toolbar .rpv-core__popover-target,
      html:not(.dark) .rpv-default-layout__toolbar button {
        color: #333 !important;
      }
      html:not(.dark) .rpv-default-layout__toolbar svg,
      html:not(.dark) .rpv-default-layout__toolbar path,
      html:not(.dark) .rpv-default-layout__toolbar polygon {
        color: #333 !important;
      }
      /* Only apply fill to the specific dropdown arrow */
      html:not(.dark) .rpv-default-layout__toolbar .rpv-core__popover-target svg,
      html:not(.dark) .rpv-default-layout__toolbar .rpv-core__popover-target path,
      html:not(.dark) .rpv-default-layout__toolbar .rpv-core__popover-target polygon {
        fill: currentColor !important;
        stroke: none !important;
      }
      html:not(.dark) .rpv-default-layout__toolbar .rpv-core__textbox {
        background: #f5f5f5 !important;
        border: 1px solid #e5e5e5 !important;
        color: #333 !important;
      }
      html:not(.dark) .rpv-default-layout__toolbar .rpv-core__textbox:focus {
        border-color: #ccc !important;
      }
      
      .rpv-default-layout__toolbar .rpv-core__textbox {
        text-align: center !important;
        padding: 0 !important;
        height: 1.5rem !important;
        width: 100% !important;
        border-radius: 4px !important;
        font-size: 0.875rem !important;
        outline: none !important;
      }
      
      /* Force popovers (like the zoom menu) to open upwards since toolbar is at the bottom */
      .rpv-core__popover-body {
        top: auto !important;
        bottom: 100% !important;
        margin-bottom: 8px !important;
        transform: none !important;
      }
      
      /* Fix arrow direction to point down since popover is above */
      .rpv-core__arrow {
        top: auto !important;
        bottom: -4px !important;
        transform: rotate(180deg) !important;
      }

      /* Light mode popover styles */
      html:not(.dark) .rpv-core__popover-body {
        background-color: white !important;
        color: black !important;
        border: 1px solid #e5e5e5 !important;
        box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1) !important;
      }
      html:not(.dark) .rpv-core__menu-item:hover {
        background-color: #f5f5f5 !important;
        color: black !important;
      }
      
      /* Dark mode popover styles */
      html.dark .rpv-core__popover-body {
        background-color: #1a1a1a !important;
        color: white !important;
        border: 1px solid #333 !important;
        box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.5) !important;
      }
      html.dark .rpv-core__menu-item {
        color: white !important;
      }
      html.dark .rpv-core__menu-item:hover {
        background-color: #333 !important;
        color: white !important;
      }
      html.dark .rpv-core__menu-divider {
        border-bottom: 1px solid #333 !important;
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <>
      <div className="w-full bg-[#eee] dark:bg-[#1a1a1a]">
        {/* Viewer Body */}
        <div 
          className="relative"
          onWheelCapture={(e) => {
            if (e.ctrlKey || e.metaKey) {
              e.stopPropagation();
            }
          }}
        >
          {error ? (
            <div className="flex flex-col items-center justify-center h-[400px] text-red-500 p-6 text-center">
              <AlertCircle className="w-12 h-12 mb-4" />
              <p className="font-medium">{error}</p>
            </div>
          ) : !blobUrl ? (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] pt-20 pb-10 text-neutral-400 dark:text-neutral-500">
              <div className="relative mb-8">
                <div className="w-20 h-20 rounded-2xl bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center animate-pulse">
                  <FileText className="w-10 h-10 text-neutral-300 dark:text-neutral-600" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center shadow-lg">
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                </div>
              </div>
              <p className="text-base font-medium text-neutral-600 dark:text-neutral-400 mb-2">Cargando documento...</p>
              <p className="text-sm text-neutral-400 dark:text-neutral-600">Descargando archivo PDF</p>
              {/* Skeleton page placeholders */}
              <div className="mt-10 w-full max-w-2xl mx-auto space-y-4 px-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-full aspect-[8.5/11] rounded-lg bg-neutral-200 dark:bg-neutral-800 animate-pulse" style={{ animationDelay: `${i * 150}ms` }} />
                ))}
              </div>
            </div>
          ) : (
            <Worker workerUrl={workerUrl}>
              <Viewer
                fileUrl={blobUrl}
                plugins={[defaultLayoutPluginInstance]}
                theme={isDark ? "dark" : "light"}
                defaultScale={1.7}
                onPageChange={handlePageChange}
              />
            </Worker>
          )}
        </div>
      </div>

      {/* End of document section */}
      {blobUrl && (
        <div className="w-full bg-background" ref={footerRef}>
          <div className="max-w-4xl mx-auto py-16 px-6 flex flex-col items-center">
            <div className="flex items-center gap-4 mb-8 w-full">
              <div className="flex-1 h-px bg-border"></div>
              <span className="text-sm text-muted-foreground font-medium">Fin del documento</span>
              <div className="flex-1 h-px bg-border"></div>
            </div>
            <h3 className="text-xl font-bold mb-6 text-foreground">¿Te fue útil este documento?</h3>
            <div className="flex gap-4">
              <button 
                onClick={onLike}
                className={cn(
                  "px-6 py-2.5 border rounded-full flex items-center gap-2 font-medium transition-colors",
                  interaction === 'like' 
                    ? "bg-green-100 border-green-300 text-green-700 dark:bg-green-900/40 dark:border-green-700 dark:text-green-400"
                    : "bg-muted border-border text-foreground hover:bg-green-50 hover:text-green-600 hover:border-green-300 dark:hover:bg-green-950/40 dark:hover:text-green-400 dark:hover:border-green-700"
                )}
              >
                <ThumbsUp className={cn("w-4 h-4", interaction === 'like' && "fill-current")} /> Sí
              </button>
              <button 
                onClick={onDislike}
                className={cn(
                  "px-6 py-2.5 border rounded-full flex items-center gap-2 font-medium transition-colors",
                  interaction === 'dislike'
                    ? "bg-red-100 border-red-300 text-red-700 dark:bg-red-900/40 dark:border-red-700 dark:text-red-400"
                    : "bg-muted border-border text-foreground hover:bg-red-50 hover:text-red-600 hover:border-red-300 dark:hover:bg-red-950/40 dark:hover:text-red-400 dark:hover:border-red-700"
                )}
              >
                <ThumbsDown className={cn("w-4 h-4", interaction === 'dislike' && "fill-current")} /> No
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
