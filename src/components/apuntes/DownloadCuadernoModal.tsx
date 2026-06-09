"use client";

import React, { useState } from "react";
import { X, FileText, FileArchive, Loader2, Download } from "lucide-react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";

interface DownloadCuadernoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDownloadPdf: () => Promise<void>;
  onDownloadZip: () => Promise<void>;
}

export function DownloadCuadernoModal({ isOpen, onClose, onDownloadPdf, onDownloadZip }: DownloadCuadernoModalProps) {
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);

  if (!isOpen) return null;

  const handlePdf = async () => {
    setIsDownloadingPdf(true);
    try {
      await onDownloadPdf();
    } finally {
      setIsDownloadingPdf(false);
      onClose();
    }
  };

  const handleZip = async () => {
    setIsDownloadingZip(true);
    try {
      await onDownloadZip();
    } finally {
      setIsDownloadingZip(false);
      onClose();
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6 animate-fade-in bg-black/60 backdrop-blur-sm">
      <div className="bg-background rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Download className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            Descargar Cuaderno
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
        
        <div className="p-6">
          <p className="text-muted-foreground mb-6 text-sm">
            Selecciona el formato en el que deseas descargar este cuaderno.
          </p>

          <div className="flex flex-col gap-4">
            <Button 
              onClick={handlePdf} 
              disabled={isDownloadingPdf || isDownloadingZip}
              className="h-auto py-4 flex flex-col items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-700 dark:bg-red-950/30 dark:hover:bg-red-900/50 dark:text-red-400 border border-red-200 dark:border-red-900 shadow-sm"
              variant="outline"
            >
              {isDownloadingPdf ? (
                <Loader2 className="w-8 h-8 animate-spin" />
              ) : (
                <FileText className="w-8 h-8" />
              )}
              <div className="flex flex-col items-center">
                <span className="font-bold text-base">Descargar como PDF</span>
                <span className="text-xs opacity-80 font-normal">Un archivo PDF con todas las páginas</span>
              </div>
            </Button>

            <Button 
              onClick={handleZip} 
              disabled={isDownloadingPdf || isDownloadingZip}
              className="h-auto py-4 flex flex-col items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:hover:bg-blue-900/50 dark:text-blue-400 border border-blue-200 dark:border-blue-900 shadow-sm"
              variant="outline"
            >
              {isDownloadingZip ? (
                <Loader2 className="w-8 h-8 animate-spin" />
              ) : (
                <FileArchive className="w-8 h-8" />
              )}
              <div className="flex flex-col items-center">
                <span className="font-bold text-base">Descargar como ZIP</span>
                <span className="text-xs opacity-80 font-normal">Un archivo comprimido con las imágenes</span>
              </div>
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
