"use client";

import { useState } from "react";
import { ArchivoCard, Archivo } from "@/components/apuntes/ArchivoCard";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaginatedArchivosProps {
  archivos: Archivo[];
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
  itemsPerPage?: number;
}

export function PaginatedArchivos({
  archivos,
  emptyMessage = "No hay archivos",
  emptyIcon,
  itemsPerPage = 6,
}: PaginatedArchivosProps) {
  const [currentPage, setCurrentPage] = useState(1);

  if (archivos.length === 0) {
    return (
      <div className="py-12 border border-dashed border-border/40 rounded-2xl w-full flex flex-col items-center justify-center bg-muted/10 opacity-80">
        {emptyIcon}
        <p className="text-sm font-medium text-muted-foreground mt-4">{emptyMessage}</p>
      </div>
    );
  }

  const totalPages = Math.ceil(archivos.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedArchivos = archivos.slice(startIndex, startIndex + itemsPerPage);

  const handlePrev = () => setCurrentPage((p) => Math.max(1, p - 1));
  const handleNext = () => setCurrentPage((p) => Math.min(totalPages, p + 1));

  return (
    <div className="w-full flex flex-col space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {paginatedArchivos.map((archivo) => (
          <ArchivoCard key={archivo.id} archivo={archivo} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            onClick={handlePrev}
            disabled={currentPage === 1}
            className="p-2 rounded-full hover:bg-muted disabled:opacity-50 disabled:pointer-events-none transition-colors"
            aria-label="Página anterior"
          >
            <ChevronLeft className="size-5" />
          </button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }).map((_, i) => {
              const page = i + 1;
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={cn(
                    "size-8 rounded-full text-sm font-medium transition-colors",
                    currentPage === page 
                      ? "bg-foreground text-background shadow-md" 
                      : "hover:bg-muted text-muted-foreground"
                  )}
                >
                  {page}
                </button>
              );
            })}
          </div>

          <button
            onClick={handleNext}
            disabled={currentPage === totalPages}
            className="p-2 rounded-full hover:bg-muted disabled:opacity-50 disabled:pointer-events-none transition-colors"
            aria-label="Siguiente página"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>
      )}
    </div>
  );
}
