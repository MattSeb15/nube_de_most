"use client";

import React, { useState, useEffect } from "react";
import type { ArchivoApunte } from "@/types";
import { X, ExternalLink, Loader2, AlertCircle, Eye } from "lucide-react";

import { Worker, Viewer, SpecialZoomLevel } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin, ToolbarProps, ToolbarSlot } from '@react-pdf-viewer/default-layout';

import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

// Worker URL provided by unpkg
const pdfjsVersion = "3.11.174";
const workerUrl = `https://unpkg.com/pdfjs-dist@${pdfjsVersion}/build/pdf.worker.min.js`;

interface VisorPDFProps {
  file: ArchivoApunte;
  onClose: () => void;
}

export function VisorPDF({ file, onClose }: VisorPDFProps) {
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
          CurrentPageInput,
          Download,
          EnterFullScreen,
          GoToNextPage,
          GoToPreviousPage,
          NumberOfPages,
          Print,
          ShowSearchPopover,
          Zoom,
          ZoomIn,
          ZoomOut,
        } = slots;
        return (
          <div className="flex items-center w-full justify-between p-1 bg-white dark:bg-[#1a1a1a]">
            <div className="flex items-center gap-1">
              <ShowSearchPopover />
              <div className="hidden sm:flex items-center gap-1">
                <ZoomOut />
                <Zoom />
                <ZoomIn />
              </div>
            </div>
            <div className="flex items-center gap-1">
              <GoToPreviousPage />
              <div className="flex items-center gap-2 px-2 text-sm text-neutral-700 dark:text-neutral-300">
                <CurrentPageInput /> <span>/</span> <NumberOfPages />
              </div>
              <GoToNextPage />
            </div>
            <div className="flex items-center gap-1">
              <EnterFullScreen />
              <Download />
              <Print />
            </div>
          </div>
        );
      }}
    </Toolbar>
  );

  const defaultLayoutPluginInstance = defaultLayoutPlugin({
    // Hide the sidebar completely (thumbnails, bookmarks, attachments)
    sidebarTabs: () => [],
    renderToolbar,
  });

  const [blobUrl, setBlobUrl] = useState<string | null>(null);
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

  return (
    <div className="w-full max-w-5xl mx-auto aspect-[3/4] max-h-[85vh] bg-white dark:bg-[#0f0f0f] border border-neutral-200 dark:border-neutral-800 rounded-2xl flex flex-col overflow-hidden animate-slide-up shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-neutral-50 dark:bg-[#1a1a1a] border-b border-neutral-200 dark:border-[#333]">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
              {file.nombre}
            </h2>
            {typeof (file as any).vistas === 'number' && (file as any).vistas > 0 && (
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-neutral-200 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 text-xs font-semibold rounded-full border border-neutral-300 dark:border-neutral-700 shrink-0" title="Vistas">
                <Eye className="w-3.5 h-3.5" />
                <span>{(file as any).vistas}</span>
              </div>
            )}
          </div>
          {file.descripcion && <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">{file.descripcion}</p>}
        </div>
        <div className="flex items-center space-x-2">
          <a
            href={rawUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition-colors"
            title="Descargar o abrir original"
          >
            <ExternalLink className="w-5 h-5" />
          </a>
          <button
            onClick={onClose}
            className="p-2 bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white rounded-full transition-colors ml-2"
            title="Cerrar visor"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Viewer Body */}
      <div 
        className="flex-1 overflow-hidden relative bg-[#eee] dark:bg-[#1a1a1a] flex flex-col"
        onWheelCapture={(e) => {
          if (e.ctrlKey || e.metaKey) {
            e.stopPropagation();
          }
        }}
      >
        {error ? (
          <div className="flex-1 flex flex-col items-center justify-center text-red-500 p-6 text-center">
            <AlertCircle className="w-12 h-12 mb-4" />
            <p className="font-medium">{error}</p>
          </div>
        ) : !blobUrl ? (
          <div className="flex-1 flex flex-col items-center justify-center text-neutral-500">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
            <p>Descargando archivo PDF, por favor espera...</p>
          </div>
        ) : (
          <Worker workerUrl={workerUrl}>
            <Viewer
              fileUrl={blobUrl}
              plugins={[defaultLayoutPluginInstance]}
              theme={isDark ? "dark" : "light"}
            />
          </Worker>
        )}
      </div>
    </div>
  );
}
