"use client";

import React, { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, ImageIcon, ArrowRight, Save, X, Lightbulb, ZoomIn, ZoomOut } from "lucide-react";

interface ImageOptimizerModalProps {
  isOpen: boolean;
  file: File | null;
  onClose: () => void;
  onUpload: (optimizedFile: File) => Promise<void>;
  title?: string;
  description?: string;
  maxWidth?: number;
  maxHeight?: number;
}

export function ImageOptimizerModal({ 
  isOpen, 
  file, 
  onClose, 
  onUpload,
  title = "Optimización de Imagen",
  description = "Ajusta la calidad para ahorrar espacio. La imagen se convertirá a formato WebP optimizado para web.",
  maxWidth = 1920,
  maxHeight = 1920
}: ImageOptimizerModalProps) {
  const [originalPreview, setOriginalPreview] = useState<string>("");
  const [optimizedPreview, setOptimizedPreview] = useState<string>("");
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [optimizedBlob, setOptimizedBlob] = useState<Blob | null>(null);
  
  // Quality configuration
  const [quality] = useState<number>(5); 
  const [debouncedQuality, setDebouncedQuality] = useState<number>(5);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuality(quality), 300);
    return () => clearTimeout(timer);
  }, [quality]);

  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [comparePosition, setComparePosition] = useState(50);
  const [zoom, setZoom] = useState(1);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [viewportWidth, setViewportWidth] = useState(0);

  useEffect(() => {
    if (!scrollContainerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      setViewportWidth(entries[0].contentRect.width);
    });
    observer.observe(scrollContainerRef.current);
    return () => observer.disconnect();
  }, []);

  const updateClipPath = () => {
    if (overlayRef.current && scrollContainerRef.current) {
      overlayRef.current.style.clipPath = `inset(0 calc(100% - ${scrollContainerRef.current.scrollLeft + (viewportWidth * comparePosition) / 100}px) 0 0)`;
    }
  };

  useEffect(() => {
    updateClipPath();
  }, [comparePosition, viewportWidth, zoom]);

  const handleScroll = () => {
    updateClipPath();
  };

  useEffect(() => {
    if (!file || !isOpen) return;

    setOriginalSize(file.size);
    const objectUrl = URL.createObjectURL(file);
    setOriginalPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [file, isOpen]);

  useEffect(() => {
    if (!file || !isOpen || !originalPreview) return;
    
    let isActive = true;
    
    const processImage = async () => {
      setIsProcessing(true);
      
      try {
        const img = new Image();
        img.src = originalPreview;
        
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });

        if (!isActive) return;

        setImageDimensions({ width: img.width, height: img.height });

        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("No 2d context");

        // Fill with white background in case of transparent images (png) before converting to webp
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!isActive) return;
            if (blob) {
              setOptimizedBlob(blob);
              const optUrl = URL.createObjectURL(blob);
              setOptimizedPreview((prev) => {
                if (prev) URL.revokeObjectURL(prev);
                return optUrl;
              });
            }
            setIsProcessing(false);
          },
          "image/webp",
          debouncedQuality / 100
        );
      } catch (error) {
        if (!isActive) return;
        console.error("Error optimizando imagen:", error);
        setIsProcessing(false);
      }
    };

    processImage();

    return () => {
      isActive = false;
    };
  }, [originalPreview, debouncedQuality, isOpen]);

  useEffect(() => {
    return () => {
      if (optimizedPreview) {
        URL.revokeObjectURL(optimizedPreview);
      }
    };
  }, [optimizedPreview]);

  const handleUpload = async () => {
    if (!optimizedBlob || !file) return;
    setIsUploading(true);
    
    try {
      const originalName = file.name.replace(/\.[^/.]+$/, "");
      const newFile = new File([optimizedBlob], `${originalName}.webp`, {
        type: "image/webp",
      });
      await onUpload(newFile);
    } catch (e) {
      console.error(e);
    } finally {
      setIsUploading(false);
      onClose();
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const savingsPercent = optimizedBlob ? Math.round(((originalSize - optimizedBlob.size) / originalSize) * 100) : 0;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isUploading && onClose()}>
      <DialogContent className="sm:max-w-6xl max-w-6xl w-[95vw] bg-[#f8f9fa] dark:bg-[#0a0a0a] border-neutral-200 dark:border-neutral-800 rounded-2xl p-0 overflow-hidden shadow-2xl flex flex-col max-h-[95vh]">
        <DialogHeader className="p-6 pb-4 border-b border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-black/50 backdrop-blur-sm shrink-0">
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <ImageIcon className="w-6 h-6 text-purple-500" /> 
            {title}
          </DialogTitle>
          <DialogDescription className="text-neutral-500 dark:text-neutral-400">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 bg-neutral-100/30 dark:bg-neutral-900/30 flex flex-col lg:flex-row gap-8">
          
          {/* Main Comparison Area */}
          <div className="flex-1 flex flex-col gap-4">
            <div className="relative w-full aspect-[4/3] md:aspect-[16/9] lg:aspect-auto lg:h-[550px] xl:h-[650px] bg-neutral-200 dark:bg-neutral-900 rounded-xl overflow-hidden border border-neutral-300 dark:border-neutral-800 shadow-inner group">
              <div 
                className="w-full h-full overflow-auto custom-scrollbar"
                ref={scrollContainerRef}
                onScroll={handleScroll}
              >
                <div 
                  className="relative min-w-full min-h-full transition-all duration-200 flex items-center justify-center origin-top-left"
                  style={{ width: `${zoom * 100}%`, height: `${zoom * 100}%` }}
                >
                  {isProcessing && !optimizedPreview ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/10 dark:bg-white/5 backdrop-blur-sm z-30">
                      <Loader2 className="w-8 h-8 animate-spin text-purple-500 mb-2" />
                      <span className="text-sm font-medium text-neutral-600 dark:text-neutral-300">Procesando imagen...</span>
                    </div>
                  ) : (
                    <>
                      {/* Base Image (Optimized/After) */}
                      {optimizedPreview && (
                        <img 
                          src={optimizedPreview} 
                          className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                          alt="Optimizada" 
                        />
                      )}
                      
                      {/* Overlay Image (Original/Before) */}
                      {originalPreview && (
                        <div 
                          ref={overlayRef}
                          className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none"
                          style={{ clipPath: `inset(0 ${100 - comparePosition}% 0 0)` }}
                        >
                          <img 
                            src={originalPreview} 
                            className="absolute inset-0 w-full h-full object-contain max-w-none"
                            style={{ width: '100%', height: '100%' }}
                            alt="Original" 
                          />
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* Interactive Custom Slider Divider */}
              <div 
                className="absolute top-0 bottom-0 w-8 -ml-4 cursor-ew-resize z-20 flex justify-center group/divider"
                style={{ left: `${comparePosition}%`, touchAction: 'none' }}
                onPointerDown={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                  e.currentTarget.setPointerCapture(e.pointerId);
                }}
                onPointerMove={(e) => {
                  if (!isDragging || !scrollContainerRef.current) return;
                  const rect = scrollContainerRef.current.getBoundingClientRect();
                  let pos = ((e.clientX - rect.left) / rect.width) * 100;
                  pos = Math.max(0, Math.min(pos, 100));
                  setComparePosition(pos);
                }}
                onPointerUp={(e) => {
                  setIsDragging(false);
                  e.currentTarget.releasePointerCapture(e.pointerId);
                }}
              >
                <div className="w-0.5 h-full bg-white shadow-[0_0_5px_rgba(0,0,0,0.5)] pointer-events-none"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-purple-500 pointer-events-none transition-transform group-active/divider:scale-95">
                  <div className="flex gap-0.5">
                    <div className="w-0.5 h-3 bg-purple-400 rounded-full"></div>
                    <div className="w-0.5 h-3 bg-purple-400 rounded-full"></div>
                  </div>
                </div>
              </div>

              {/* Labels */}
              <div className="absolute top-4 left-4 px-2 py-1 bg-black/60 backdrop-blur-md rounded-md text-white text-xs font-semibold pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-20">
                Original
              </div>
              <div className="absolute top-4 right-4 px-2 py-1 bg-purple-600/80 backdrop-blur-md rounded-md text-white text-xs font-semibold pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-20">
                Optimizada (WebP)
              </div>

              {/* Zoom Controls */}
              <div className="absolute bottom-4 right-4 flex items-center gap-1 z-30 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 backdrop-blur-md p-1.5 rounded-xl shadow-lg border border-white/10">
                <button 
                  onClick={() => setZoom(z => Math.max(z - 0.5, 1))} 
                  disabled={zoom <= 1}
                  className="p-1.5 text-white hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-transparent rounded-md transition-colors"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <div className="w-12 text-center text-white text-xs font-bold font-mono">
                  {Math.round(zoom * 100)}%
                </div>
                <button 
                  onClick={() => setZoom(z => Math.min(z + 0.5, 4))} 
                  disabled={zoom >= 4}
                  className="p-1.5 text-white hover:bg-white/20 disabled:opacity-30 disabled:hover:bg-transparent rounded-md transition-colors"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
              </div>
            </div>

            <p className="text-center text-sm text-neutral-500 dark:text-neutral-400 font-medium">
              Desliza para comparar: <span className="text-neutral-800 dark:text-neutral-200">Original (Izquierda)</span> vs <span className="text-purple-600 dark:text-purple-400">Optimizada (Derecha)</span>
            </p>
          </div>

          {/* Controls Panel */}
          <div className="w-full lg:w-80 flex flex-col gap-6 shrink-0">
            {/* Stats Card */}
            <div className="bg-white dark:bg-neutral-950 p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm flex flex-col gap-4">
              <h4 className="font-semibold text-neutral-900 dark:text-white mb-1">Información de Peso</h4>
              
              <div className="flex justify-between items-center text-sm">
                <span className="text-neutral-500">Original</span>
                <span className="font-mono font-medium text-neutral-900 dark:text-neutral-200">{formatSize(originalSize)}</span>
              </div>
              
              <div className="flex justify-between items-center text-sm">
                <span className="text-purple-600 dark:text-purple-400 font-medium">Optimizado</span>
                <div className="flex items-center gap-2">
                  {isProcessing ? (
                    <Loader2 className="w-3 h-3 animate-spin text-purple-500" />
                  ) : (
                    <span className="font-mono font-bold text-purple-600 dark:text-purple-400">
                      {optimizedBlob ? formatSize(optimizedBlob.size) : "-"}
                    </span>
                  )}
                </div>
              </div>

              <div className="h-px bg-neutral-200 dark:bg-neutral-800 my-1 w-full" />
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Ahorro</span>
                <span className={`text-sm font-bold px-2 py-1 rounded-md ${savingsPercent > 0 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'}`}>
                  {savingsPercent > 0 ? `-${savingsPercent}%` : "0%"}
                </span>
              </div>
            </div>


            {/* Note */}
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-900/50">
              <p className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed">
                <strong className="flex items-center gap-1.5 mb-1">
                  <Lightbulb className="w-4 h-4" />
                  Importante:
                </strong>
                Las imágenes se limitan a un máximo de {maxWidth}x{maxHeight}px y se convierten a WebP para que la nube no se sature.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="p-6 pt-4 border-t border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-black/50 backdrop-blur-sm shrink-0 flex flex-row justify-end gap-3">
          <Button 
            variant="outline" 
            onClick={onClose} 
            disabled={isUploading}
            className="border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <X className="w-4 h-4 mr-2" />
            Cancelar
          </Button>
          <Button 
            onClick={handleUpload} 
            disabled={isUploading || isProcessing || !optimizedBlob}
            className="bg-purple-600 hover:bg-purple-700 text-white shadow-md hover:shadow-lg transition-all"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Subiendo...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Subir Optimizado
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
