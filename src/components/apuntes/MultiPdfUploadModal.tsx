"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, FileText, ArrowUp, ArrowDown, X, Lightbulb, Trash2, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { v4 as uuidv4 } from "uuid";
import * as pdfjsLib from 'pdfjs-dist';
import jsPDF from "jspdf";

// Configurar el worker de pdf.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

interface FileItem {
  id: string;
  originalFile: File;
  previewUrl: string;
  originalSize: number;
  optimizedBlob?: Blob;
  status: 'pending' | 'processing' | 'done' | 'error';
  numPages?: number;
}

interface MultiPdfUploadModalProps {
  isOpen: boolean;
  files: File[];
  onClose: () => void;
  onUpload: (optimizedFiles: File[]) => Promise<void>;
}

export function MultiPdfUploadModal({
  isOpen,
  files,
  onClose,
  onUpload
}: MultiPdfUploadModalProps) {
  const [fileItems, setFileItems] = useState<FileItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [quality] = useState<number>(0.80); // 80% JPEG quality
  const [scale] = useState<number>(1.5); // 1.5x scale for render

  useEffect(() => {
    if (!isOpen || files.length === 0) {
      setFileItems([]);
      return;
    }

    const items: FileItem[] = files.map(file => ({
      id: uuidv4(),
      originalFile: file,
      previewUrl: URL.createObjectURL(file), // Usaremos el object URL para cargar con pdf.js
      originalSize: file.size,
      status: 'pending' // Empezamos en pending, y los iremos actualizando
    }));

    setFileItems(items);

    let isActive = true;

    const processAllFiles = async (itemsToProcess: FileItem[]) => {
      for (const item of itemsToProcess) {
        if (!isActive) break;

        // Actualizar UI para mostrar que este archivo se está procesando
        setFileItems(prev => prev.map(p => p.id === item.id ? { ...p, status: 'processing' } : p));

        try {
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error("Timeout optimizando PDF")), 30000)
          );

          const optimizePromise = async () => {
            const arrayBuffer = await item.originalFile.arrayBuffer();
            const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
            const pdfDoc = await loadingTask.promise;
            const numPages = pdfDoc.numPages;

            if (!isActive) return null;

            let doc: jsPDF | null = null;

            for (let i = 1; i <= numPages; i++) {
              if (!isActive) return null;
              const page = await pdfDoc.getPage(i);
              const viewport = page.getViewport({ scale });

              const canvas = document.createElement("canvas");
              const ctx = canvas.getContext("2d");
              if (!ctx) throw new Error("No 2d context");

              canvas.height = viewport.height;
              canvas.width = viewport.width;

              const renderContext = {
                canvasContext: ctx,
                viewport: viewport,
              };

              await page.render(renderContext).promise;

              if (!isActive) return null;

              // Convertir a JPEG para mejor compatibilidad con jsPDF
              const imgData = canvas.toDataURL("image/jpeg", quality);
              const orientation = viewport.width > viewport.height ? "l" : "p";

              if (!doc) {
                doc = new jsPDF({
                  orientation,
                  unit: 'px',
                  format: [viewport.width, viewport.height]
                });
              } else {
                doc.addPage([viewport.width, viewport.height], orientation);
                doc.setPage(i);
              }

              doc.addImage(imgData, 'JPEG', 0, 0, viewport.width, viewport.height);
            }

            if (!doc) throw new Error("Document is empty");
            return { doc, numPages };
          };

          const result = await Promise.race([optimizePromise(), timeoutPromise]) as any;

          if (!isActive) return;

          if (result && result.doc) {
            const optimizedBlob = result.doc.output('blob');
            
            // Si el blob optimizado es más pesado que el original, o si hubo algún problema, 
            // usaremos el original. De lo contrario, usamos el optimizado.
            const finalBlob = optimizedBlob.size < item.originalSize ? optimizedBlob : item.originalFile;
            
            setFileItems(prev => prev.map(p => p.id === item.id ? { 
              ...p, 
              optimizedBlob: finalBlob, 
              status: 'done',
              numPages: result.numPages
            } : p));
          } else if (result === null) {
            // Cancelado
          }

        } catch (error) {
          if (!isActive) return;
          console.error("Error optimizando PDF:", error);
          // Fallback: si falla la optimización, usamos el archivo original
          setFileItems(prev => prev.map(p => p.id === item.id ? { ...p, status: 'done', optimizedBlob: item.originalFile } : p));
        }
      }
    };

    processAllFiles(items);

    return () => {
      isActive = false;
      items.forEach(item => {
        if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
      });
    };
  }, [files, isOpen, quality, scale]);

  const handleUpload = async () => {
    setIsUploading(true);
    
    try {
      const filesToUpload: File[] = [];
      for (const item of fileItems) {
        if (item.optimizedBlob) {
          const originalName = item.originalFile.name;
          const newFile = new File([item.optimizedBlob], originalName, {
            type: "application/pdf",
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

  const allProcessed = fileItems.length > 0 && fileItems.every(item => item.status === 'done' || item.status === 'error');
  const totalOriginalSize = fileItems.reduce((acc, item) => acc + item.originalSize, 0);
  const totalOptimizedSize = fileItems.reduce((acc, item) => acc + (item.optimizedBlob?.size || item.originalSize), 0);
  const totalSavings = totalOriginalSize > 0 && totalOptimizedSize < totalOriginalSize
    ? Math.round(((totalOriginalSize - totalOptimizedSize) / totalOriginalSize) * 100) 
    : 0;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isUploading && onClose()}>
      <DialogContent className="sm:max-w-4xl max-w-4xl w-[95vw] bg-[#f8f9fa] dark:bg-[#0a0a0a] border-neutral-200 dark:border-neutral-800 rounded-2xl p-0 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <DialogHeader className="p-6 pb-4 border-b border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-black/50 backdrop-blur-sm shrink-0">
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <FileText className="w-6 h-6 text-red-500" /> 
            Subir archivos PDF
          </DialogTitle>
          <DialogDescription className="text-neutral-500 dark:text-neutral-400">
            Se han seleccionado {fileItems.length} archivos. Puedes reordenarlos o revisar la compresión antes de subir.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-neutral-100/30 dark:bg-neutral-900/30 flex flex-col lg:flex-row gap-6">
          
          {/* Main List Area */}
          <div className="flex-1 flex flex-col gap-3 min-h-0 overflow-y-auto pr-2 custom-scrollbar">
            <ul className="flex flex-col gap-3">
              <AnimatePresence initial={false}>
                {fileItems.map((item, index) => {
                  const savingsPercent = item.optimizedBlob && item.optimizedBlob.size < item.originalSize
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
                      className="bg-white dark:bg-[#151515] p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm flex items-center gap-4 group hover:border-red-500/30 transition-colors"
                    >
                      <div className="flex flex-col gap-1 shrink-0">
                        <button 
                          onClick={() => handleMoveUp(index)}
                          disabled={index === 0}
                          className="p-1.5 text-neutral-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-neutral-400 transition-colors"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleMoveDown(index)}
                          disabled={index === fileItems.length - 1}
                          className="p-1.5 text-neutral-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-neutral-400 transition-colors"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 font-bold text-sm shrink-0">
                        {index + 1}
                      </div>

                      <div className="w-12 h-12 flex items-center justify-center rounded-lg border border-neutral-200 dark:border-neutral-800 bg-red-50 dark:bg-red-900/10 shrink-0">
                        <FileText className="w-6 h-6 text-red-500" />
                      </div>

                      <div className="flex-1 min-w-0 flex flex-col gap-1">
                        <span className="font-medium text-sm text-neutral-900 dark:text-white truncate">
                          {item.originalFile.name}
                        </span>
                        
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-500 dark:text-neutral-400">
                          {item.numPages && <span className="text-neutral-400">{item.numPages} pág.</span>}
                          <span className={savingsPercent > 0 ? "line-through opacity-70" : ""} title="Peso original">{formatSize(item.originalSize)}</span>
                          {item.status === 'done' && savingsPercent > 0 && item.optimizedBlob && (
                            <>
                              <ArrowDown className="w-3 h-3 text-red-500" />
                              <span className="font-semibold text-red-600 dark:text-red-400">{formatSize(item.optimizedBlob.size)}</span>
                              <span className="px-1.5 py-0.5 rounded-md bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 font-bold text-[10px]">
                                -{savingsPercent}%
                              </span>
                            </>
                          )}
                          {(item.status === 'processing' || item.status === 'pending') && (
                            <span className="flex items-center gap-1 text-red-500">
                              <Loader2 className="w-3 h-3 animate-spin" /> Procesando...
                            </span>
                          )}
                        </div>
                      </div>

                      <button 
                        onClick={() => handleRemove(item.id)}
                        className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors ml-auto opacity-0 group-hover:opacity-100 focus:opacity-100"
                        title="Eliminar PDF"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </motion.li>
                  );
                })}
              </AnimatePresence>
              {fileItems.length === 0 && (
                <div className="text-center p-8 text-neutral-500 dark:text-neutral-400 border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-xl">
                  No hay archivos seleccionados.
                </div>
              )}
            </ul>
          </div>

          {/* Stats Panel */}
          <div className="w-full lg:w-72 flex flex-col gap-4 shrink-0">
            <div className="bg-white dark:bg-neutral-950 p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm flex flex-col gap-4">
              <h4 className="font-semibold text-neutral-900 dark:text-white mb-1">Resumen de subida</h4>
              
              <div className="flex justify-between items-center text-sm">
                <span className="text-neutral-500">Archivos totales</span>
                <span className="font-medium text-neutral-900 dark:text-neutral-200">{fileItems.length}</span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-neutral-500">Peso original total</span>
                <span className="font-mono text-neutral-900 dark:text-neutral-200">{formatSize(totalOriginalSize)}</span>
              </div>
              
              <div className="flex justify-between items-center text-sm">
                <span className="text-red-600 dark:text-red-400 font-medium">Peso final</span>
                <div className="flex items-center gap-2">
                  {!allProcessed ? (
                    <Loader2 className="w-3 h-3 animate-spin text-red-500" />
                  ) : (
                    <span className="font-mono font-bold text-red-600 dark:text-red-400">
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
                  Ahorro de espacio:
                </strong>
                Optimizamos los PDFs convirtiendo sus páginas a formato comprimido. Si el archivo no requiere optimización, se subirá el original.
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
            disabled={isUploading || !allProcessed || fileItems.length === 0}
            className="bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg transition-all"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Subiendo...
              </>
            ) : (
              <>
                {allProcessed ? <CheckCircle2 className="w-4 h-4 mr-2" /> : <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Subir {fileItems.length} archivo{fileItems.length !== 1 ? 's' : ''}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
