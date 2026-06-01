"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { addComentarioAction } from "@/app/(main)/actividades/[slug]/actions";

interface CommentFormProps {
  actividadId: string;
  slug: string;
  parentId?: string;
  onCancel?: () => void;
}

export function CommentForm({ actividadId, slug, parentId, onCancel }: CommentFormProps) {
  const [contenido, setContenido] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shake, setShake] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contenido.trim()) {
      setError("Por favor, escribe un comentario antes de enviar.");
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("actividadId", actividadId);
    formData.append("slug", slug);
    formData.append("contenido", contenido);
    if (parentId) formData.append("parentId", parentId);

    try {
      const res = await addComentarioAction(formData);
      if (res.error) {
        setError(res.error);
        setShake(true);
        setTimeout(() => setShake(false), 500);
      } else {
        setContenido("");
        if (onCancel) onCancel();
      }
    } catch (err) {
      setError("Ocurrió un error inesperado. Inténtalo de nuevo.");
      setShake(true);
      setTimeout(() => setShake(false), 500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`mt-4 space-y-3 transition-transform ${
        shake ? "animate-shake" : ""
      }`}
    >
      <div className="relative">
        <textarea
          rows={parentId ? 2 : 3}
          value={contenido}
          onChange={(e) => {
            setContenido(e.target.value);
            if (error) setError(null);
          }}
          placeholder={parentId ? "Escribe una respuesta..." : "Escribe un comentario o pregunta..."}
          disabled={loading}
          className={`w-full rounded-xl border bg-background px-4 py-3 text-sm placeholder-muted-foreground outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary ${
            error
              ? "border-destructive focus:border-destructive focus:ring-destructive"
              : "border-input"
          }`}
        />
        {error && (
          <p className="mt-1 text-xs text-destructive animate-fade-in">
            {error}
          </p>
        )}
      </div>

      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={loading}
            className="rounded-xl px-4 text-xs font-medium"
          >
            Cancelar
          </Button>
        )}
        <Button
          type="submit"
          disabled={loading}
          className={`flex items-center gap-2 rounded-xl bg-primary px-5 font-medium text-primary-foreground transition-all hover:bg-primary/95 ${parentId ? "h-9 text-xs" : ""}`}
        >
          {loading ? (
            <>
              <svg
                className="h-4 w-4 animate-spin text-current"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span>{parentId ? "Respondiendo..." : "Publicando..."}</span>
            </>
          ) : (
            <>
              <svg
                viewBox="0 0 16 16"
                fill="currentColor"
                className="size-3.5"
              >
                <path d="M3.47 1.38A.75.75 0 0 0 2.25 2v12a.75.75 0 0 0 1.22.58l9.5-6a.75.75 0 0 0 0-1.16l-9.5-6Z" />
              </svg>
              <span>{parentId ? "Responder" : "Publicar Comentario"}</span>
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
