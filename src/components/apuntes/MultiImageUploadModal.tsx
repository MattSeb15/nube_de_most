"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Images, ArrowUp, ArrowDown, Save, X, Lightbulb, Trash2, CheckCircle2, CloudUpload } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { v4 as uuidv4 } from "uuid";

interface FileItem {
  id: string;
  originalFile: File;
  previewUrl: string;
  originalSize: number;
  optimizedBlob?: Blob;
  status: 'pending' | 'processing' | 'done' | 'error';
}

interface MultiImageUploadModalProps {
  isOpen: boolean;
  files: File[];
  onClose: () => void;
  onUpload: (optimizedFiles: File[]) => Promise<void>;
  maxWidth?: number;
  maxHeight?: number;
}

export function MultiImageUploadModal({
  isOpen,
  files,
  onClose,
  onUpload,
  maxWidth = 1920,
  maxHeight = 1920
}: MultiImageUploadModalProps) {
  const [fileItems, setFileItems] = useState<FileItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [quality] = useState<number>(5);
  const [zoomedItemId, setZoomedItemId] = useState<string | null>(null);
  const [zoomedOptimizedUrl, setZoomedOptimizedUrl] = useState<string | null>(null);
  const [comparePosition, setComparePosition] = useState(50);

  const zoomedItem = zoomedItemId ? fileItems.find(i => i.id === zoomedItemId) : null;

  useEffect(() => {
    if (zoomedItem?.optimizedBlob) {
      const url = URL.createObjectURL(zoomedItem.optimizedBlob);
      setZoomedOptimizedUrl(url);
      setComparePosition(50);
      return () => URL.revokeObjectURL(url);
    } else {
      setZoomedOptimizedUrl(null);
    }
  }, [zoomedItem?.optimizedBlob]);

  useEffect(() => {
    if (!isOpen) {
      setFileItems([]);
      return;
    }

    if (files && files.length > 0) {
      const items: FileItem[] = files.map(file => ({
        id: uuidv4(),
        originalFile: file,
        previewUrl: URL.createObjectURL(file),
        originalSize: file.size,
        status: 'pending'
      }));
      setFileItems(items);
      processQueue(items);
    }
  }, [isOpen]);

  const processQueue = async (queueItems: FileItem[]) => {
    let isMounted = true;
      for (const item of queueItems) {
        if (!isMounted) break;

        // Mark as processing
        setFileItems(prev => prev.map(p => p.id === item.id ? { ...p, status: 'processing' } : p));

        try {
          const img = new Image();
          img.src = item.previewUrl;
          
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
          });

          if (!isMounted) break;

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

          ctx.fillStyle = "#FFFFFF";
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);

          const blob = await new Promise<Blob | null>((resolve) => {
            canvas.toBlob((b) => resolve(b), "image/webp", quality / 100);
          });

          if (!isMounted) break;

          if (blob) {
            setFileItems(prev => prev.map(p => p.id === item.id ? { ...p, optimizedBlob: blob, status: 'done' } : p));
          } else {
            throw new Error("Failed to create blob");
          }
        } catch (error) {
          if (!isMounted) break;
          console.error("Error optimizando imagen:", error);
          setFileItems(prev => prev.map(p => p.id === item.id ? { ...p, status: 'error' } : p));
        }
      }
    };


    
  const handleAddFiles = (newFiles: File[]) => {
    const items: FileItem[] = newFiles.map(file => ({
      id: uuidv4(),
      originalFile: file,
      previewUrl: URL.createObjectURL(file),
      originalSize: file.size,
      status: 'pending'
    }));
    setFileItems(prev => [...prev, ...items]);
    processQueue(items);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
      if (droppedFiles.length > 0) handleAddFiles(droppedFiles);
    }
  };



  const handleUpload = async () => {
    setIsUploading(true);
    
    try {
      const filesToUpload: File[] = [];
      for (const item of fileItems) {
        if (item.optimizedBlob) {
          const originalName = item.originalFile.name.replace(/\.[^/.]+$/, "");
          const newFile = new File([item.optimizedBlob], `${originalName}.webp`, {
            type: "image/webp",
          });
          filesToUpload.push(newFile);
        }
      }
      
      if (filesToUpload.length > 0) {
        await onUpload(filesToUpload);
      }
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
    const sizes = ["B", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newItems = [...fileItems];
    const temp = newItems[index - 1];
    newItems[index - 1] = newItems[index];
    newItems[index] = temp;
    setFileItems(newItems);
  };

  const handleMoveDown = (index: number) => {
    if (index === fileItems.length - 1) return;
    const newItems = [...fileItems];
    const temp = newItems[index + 1];
    newItems[index + 1] = newItems[index];
    newItems[index] = temp;
    setFileItems(newItems);
  };

  const handleRemove = (id: string) => {
    setFileItems(prev => prev.filter(item => item.id !== id));
  };

  const processedCount = fileItems.filter(item => item.status === 'done' || item.status === 'error').length;
  const progressPercent = fileItems.length > 0 ? Math.round((processedCount / fileItems.length) * 100) : 0;
  const allProcessed = fileItems.length === 0 || processedCount === fileItems.length;
  
  const totalOriginalSize = fileItems.reduce((acc, item) => acc + item.originalSize, 0);
  const totalOptimizedSize = fileItems.reduce((acc, item) => acc + (item.optimizedBlob?.size || 0), 0);
  const totalSavings = totalOriginalSize > 0 && totalOptimizedSize > 0 
    ? Math.round(((totalOriginalSize - totalOptimizedSize) / totalOriginalSize) * 100) 
    : 0;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isUploading && onClose()}>
      <DialogContent className="sm:max-w-4xl max-w-4xl w-[95vw] bg-[#f8f9fa] dark:bg-[#0a0a0a] border-neutral-200 dark:border-neutral-800 rounded-2xl p-0 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <DialogHeader className="p-6 pb-4 border-b border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-black/50 backdrop-blur-sm shrink-0">
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Images className="w-6 h-6 text-purple-500" /> 
            Subir múltiples páginas
          </DialogTitle>
          <DialogDescription className="text-neutral-500 dark:text-neutral-400">
            Se han seleccionado {fileItems.length} imágenes. Puedes ordenar las páginas usando las flechas y revisar la optimización antes de subir.
          </DialogDescription>

          {/* Progress Bar */}
          {fileItems.length > 0 && (
            <div className="mt-4 flex flex-col gap-2">
              <div className="flex justify-between items-center text-xs font-medium text-neutral-500 dark:text-neutral-400">
                {!allProcessed ? (
                  <span>Optimizando a formato WebP...</span>
                ) : (
                  <span className="text-green-600 dark:text-green-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Optimización completada
                  </span>
                )}
                <span>{processedCount} de {fileItems.length} ({progressPercent}%)</span>
              </div>
              <div className="w-full h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden relative">
                <div 
                  className={`absolute top-0 left-0 h-full transition-all duration-300 ease-out ${allProcessed ? 'bg-green-500' : 'bg-purple-500'}`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}
        </DialogHeader>

        <div 
          className="flex-1 overflow-y-auto p-4 sm:p-6 bg-neutral-100/30 dark:bg-neutral-900/30 flex flex-col lg:flex-row gap-6 relative"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          
          {/* Main List Area */}
          <div className="flex-1 flex flex-col gap-3 min-h-0 overflow-y-auto pr-2 custom-scrollbar">
            <ul className="flex flex-col gap-3">
              <AnimatePresence initial={false}>
                {fileItems.map((item, index) => {
                  const savingsPercent = item.optimizedBlob 
                    ? Math.round(((item.originalSize - item.optimizedBlob.size) / item.originalSize) * 100) 
                    : 0;

                  return (
                    <motion.li
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                      className="bg-white dark:bg-[#151515] p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm flex items-center gap-4 group hover:border-purple-500/30 transition-colors"
                    >
                      <div className="flex flex-col gap-1 shrink-0">
                        <button 
                          onClick={() => handleMoveUp(index)}
                          disabled={index === 0}
                          className="p-1.5 text-neutral-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-md disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-neutral-400 transition-colors"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleMoveDown(index)}
                          disabled={index === fileItems.length - 1}
                          className="p-1.5 text-neutral-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-md disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-neutral-400 transition-colors"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 font-bold text-sm shrink-0">
                        {index + 1}
                      </div>

                      <div 
                        className="w-16 h-16 rounded-lg overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900 shrink-0 cursor-pointer group/img relative"
                        onClick={() => setZoomedItemId(item.id)}
                      >
                        <img src={item.previewUrl} alt="Preview" className="w-full h-full object-cover transition-transform group-hover/img:scale-110" />
                        <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/20 transition-colors flex items-center justify-center">
                          <Images className="w-5 h-5 text-white opacity-0 group-hover/img:opacity-100 transition-opacity drop-shadow-md" />
                        </div>
                      </div>

                      <div className="flex-1 min-w-0 flex flex-col gap-1">
                        <span className="font-medium text-sm text-neutral-900 dark:text-white truncate">
                          {item.originalFile.name}
                        </span>
                        
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-500 dark:text-neutral-400">
                          <span className="line-through opacity-70" title="Peso original">{formatSize(item.originalSize)}</span>
                          {item.status === 'done' && item.optimizedBlob && (
                            <>
                              <ArrowDown className="w-3 h-3 text-purple-500" />
                              <span className="font-semibold text-purple-600 dark:text-purple-400">{formatSize(item.optimizedBlob.size)}</span>
                              {savingsPercent > 0 && (
                                <span className="px-1.5 py-0.5 rounded-md bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 font-bold text-[10px]">
                                  -{savingsPercent}%
                                </span>
                              )}
                            </>
                          )}
                          {(item.status === 'processing' || item.status === 'pending') && (
                            <span className="flex items-center gap-1 text-purple-500">
                              <Loader2 className="w-3 h-3 animate-spin" /> Optimizando...
                            </span>
                          )}
                        </div>
                      </div>

                      <button 
                        onClick={() => handleRemove(item.id)}
                        className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors ml-auto opacity-0 group-hover:opacity-100 focus:opacity-100"
                        title="Eliminar imagen"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </motion.li>
                  );
                })}
              </AnimatePresence>
              {fileItems.length === 0 && (
                <div 
                  className={`m-2 text-center p-8 sm:p-12 text-neutral-500 dark:text-neutral-400 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-4 transition-colors ${
                    isDragging 
                      ? 'border-purple-500 bg-purple-50/80 dark:border-purple-500/80 dark:bg-purple-900/20 scale-[1.02] shadow-lg' 
                      : 'border-neutral-300 dark:border-neutral-700 bg-white dark:bg-[#151515] hover:border-purple-500/50 hover:bg-purple-50/50 dark:hover:bg-purple-900/10'
                  }`}
                >
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors ${
                    isDragging ? 'bg-purple-200 dark:bg-purple-900/50' : 'bg-purple-100 dark:bg-purple-900/30'
                  }`}>
                    <Images className="w-8 h-8 text-purple-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-1">Arrastra tus imágenes aquí</h3>
                    <p className="text-sm">o haz clic en el botón para seleccionarlas</p>
                  </div>
                  <label className="mt-2 cursor-pointer bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-lg font-medium shadow-sm transition-all flex items-center gap-2">
                    <ArrowUp className="w-4 h-4" />
                    Explorar imágenes
                    <input 
                      type="file" 
                      accept="image/*" 
                      multiple 
                      className="hidden" 
                      onChange={(e) => {
                        if (e.target.files) handleAddFiles(Array.from(e.target.files));
                        e.target.value = '';
                      }}
                    />
                  </label>
                </div>
              )}
            </ul>
          </div>

          {/* Stats Panel */}
          <div className="w-full lg:w-72 flex flex-col gap-4 shrink-0">
            <div className="bg-white dark:bg-neutral-950 p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm flex flex-col gap-4">
              <h4 className="font-semibold text-neutral-900 dark:text-white mb-1">Resumen de subida</h4>
              
              <div className="flex justify-between items-center text-sm">
                <span className="text-neutral-500">Total páginas</span>
                <span className="font-medium text-neutral-900 dark:text-neutral-200">{fileItems.length}</span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-neutral-500">Peso original total</span>
                <span className="font-mono text-neutral-900 dark:text-neutral-200">{formatSize(totalOriginalSize)}</span>
              </div>
              
              <div className="flex justify-between items-center text-sm">
                <span className="text-purple-600 dark:text-purple-400 font-medium">Peso optimizado</span>
                <div className="flex items-center gap-2">
                  {!allProcessed ? (
                    <Loader2 className="w-3 h-3 animate-spin text-purple-500" />
                  ) : (
                    <span className="font-mono font-bold text-purple-600 dark:text-purple-400">
                      {formatSize(totalOptimizedSize)}
                    </span>
                  )}
                </div>
              </div>

              <div className="h-px bg-neutral-200 dark:bg-neutral-800 my-1 w-full" />
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Ahorro total</span>
                <span className={`text-sm font-bold px-2 py-1 rounded-md ${totalSavings > 0 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'}`}>
                  {totalSavings > 0 ? `-${totalSavings}%` : "0%"}
                </span>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-900/50">
              <p className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed">
                <strong className="flex items-center gap-1.5 mb-1">
                  <Lightbulb className="w-4 h-4" />
                  Tip de uso:
                </strong>
                El orden que elijas arriba usando las flechas será el orden en el que aparecerán las páginas en el cuaderno.
              </p>
            </div>
          </div>
        </div>



        <DialogFooter className="p-6 pt-4 border-t border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-black/50 backdrop-blur-sm shrink-0 flex flex-row justify-between items-center gap-3">
          <div>
            {fileItems.length > 0 && (
              <label className="cursor-pointer text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors flex items-center gap-1.5 px-3 py-2 rounded-md hover:bg-purple-50 dark:hover:bg-purple-900/20">
                <Images className="w-4 h-4" />
                Añadir más páginas
                <input 
                  type="file" 
                  accept="image/*" 
                  multiple 
                  className="hidden" 
                  onChange={(e) => {
                    if (e.target.files) handleAddFiles(Array.from(e.target.files));
                    e.target.value = '';
                  }}
                />
              </label>
            )}
          </div>
          <div className="flex flex-row gap-3">
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
              disabled={isUploading || !allProcessed || fileItems.length === 0}
              className="bg-purple-600 hover:bg-purple-700 text-white shadow-md hover:shadow-lg transition-all"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Subiendo {fileItems.length}...
                </>
              ) : (
                <>
                  {allProcessed ? <CheckCircle2 className="w-4 h-4 mr-2" /> : <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Subir {fileItems.length} página{fileItems.length !== 1 ? 's' : ''}
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>

      {/* Zoom Overlay */}
      <AnimatePresence>
        {zoomedItem && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm p-4 sm:p-8"
            onClick={() => setZoomedItemId(null)}
          >
            <div className="absolute top-4 left-4 sm:top-6 sm:left-6 text-white" onClick={e => e.stopPropagation()}>
               <h3 className="text-lg sm:text-xl font-bold">{zoomedItem.originalFile.name}</h3>
               {zoomedOptimizedUrl && zoomedItem.optimizedBlob && (
                 <p className="text-purple-400 font-medium text-sm">
                   Ahorro: {Math.round(((zoomedItem.originalSize - zoomedItem.optimizedBlob.size) / zoomedItem.originalSize) * 100)}%
                 </p>
               )}
            </div>

            <button 
              onClick={() => setZoomedItemId(null)}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 bg-white/10 hover:bg-white/20 text-white rounded-full p-2 transition-colors z-50"
            >
              <X className="w-6 h-6" />
            </button>

            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="relative w-full max-w-6xl aspect-[4/3] sm:aspect-[16/9] lg:h-[70vh] bg-neutral-900 rounded-xl overflow-hidden shadow-2xl border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              {zoomedOptimizedUrl ? (
                <img src={zoomedOptimizedUrl} className="absolute inset-0 w-full h-full object-contain pointer-events-none" alt="Optimizada" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-white/50 bg-neutral-900">
                  {zoomedItem.status === 'processing' ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                      <span>Optimizando para previsualización...</span>
                    </div>
                  ) : zoomedItem.status === 'error' ? (
                    'Error al optimizar imagen'
                  ) : (
                    'En cola de optimización...'
                  )}
                </div>
              )}

              <div 
                className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none"
                style={{ clipPath: `inset(0 ${100 - comparePosition}% 0 0)` }}
              >
                <img src={zoomedItem.previewUrl} className="absolute inset-0 w-full h-full object-contain max-w-none" style={{ width: '100%', height: '100%' }} alt="Original" />
              </div>

              {/* Labels */}
              <div className="absolute top-4 left-4 px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-md text-white text-xs font-semibold pointer-events-none">
                Original ({formatSize(zoomedItem.originalSize)})
              </div>
              {zoomedOptimizedUrl && zoomedItem.optimizedBlob && (
                <div className="absolute top-4 right-4 px-3 py-1.5 bg-purple-600/80 backdrop-blur-md rounded-md text-white text-xs font-semibold pointer-events-none">
                  WebP ({formatSize(zoomedItem.optimizedBlob.size)})
                </div>
              )}

              {/* Slider Input */}
              {zoomedOptimizedUrl && (
                <input 
                  type="range" 
                  min="0" max="100" 
                  value={comparePosition} 
                  onChange={(e) => setComparePosition(Number(e.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
                />
              )}

              {/* Slider Visual Divider */}
              {zoomedOptimizedUrl && (
                <div 
                  className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_5px_rgba(0,0,0,0.5)] pointer-events-none z-20"
                  style={{ left: `${comparePosition}%` }}
                >
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-purple-500">
                    <div className="flex gap-0.5">
                      <div className="w-0.5 h-3 bg-purple-400 rounded-full"></div>
                      <div className="w-0.5 h-3 bg-purple-400 rounded-full"></div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Uploading Overlay */}
      <AnimatePresence>
        {isUploading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[150] bg-white/80 dark:bg-black/80 backdrop-blur-md flex flex-col items-center justify-center rounded-2xl"
          >
            <div className="relative">
              <div className="w-24 h-24 border-4 border-purple-200 dark:border-purple-900/50 rounded-full"></div>
              <div className="w-24 h-24 border-4 border-purple-600 dark:border-purple-500 rounded-full border-t-transparent animate-spin absolute top-0 left-0"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                 <CloudUpload className="w-10 h-10 text-purple-600 dark:text-purple-400 animate-pulse" />
              </div>
            </div>
            <h3 className="text-2xl font-bold mt-8 text-neutral-900 dark:text-white tracking-tight">Subiendo a la nube...</h3>
            <p className="text-neutral-500 dark:text-neutral-400 mt-3 text-center max-w-xs leading-relaxed">
              Por favor, no cierres esta ventana. Se están guardando tus páginas en el cuaderno de forma segura.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </Dialog>
  );
}
