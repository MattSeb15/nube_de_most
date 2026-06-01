"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CommentForm } from "./comment-form";
import { MessageSquareReply, CornerDownRight } from "lucide-react";

function formatFechaCorta(fecha: string): string {
  return new Date(fecha).toLocaleDateString("es-EC", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface ComentarioType {
  id: string;
  actividadId: string;
  parentId?: string | null;
  autor: string;
  avatarUrl?: string;
  contenido: string;
  fecha: string;
  respuestas?: ComentarioType[];
}

export function CommentItem({
  comentario,
  actividadId,
  slug,
  canComment,
  isReply = false,
}: {
  comentario: ComentarioType;
  actividadId: string;
  slug: string;
  canComment: boolean;
  isReply?: boolean;
}) {
  const [isReplying, setIsReplying] = useState(false);

  // Determine which parent ID to pass to the reply form
  // If we are replying to a reply, we still attach it to the root comment
  // to maintain 1-level depth as planned.
  const replyParentId = comentario.parentId ? comentario.parentId : comentario.id;

  return (
    <div className={cn("space-y-4", isReply && "ml-8 md:ml-12 relative")}>
      {isReply && (
        <div className="absolute -left-6 top-4 text-muted-foreground/40">
          <CornerDownRight className="size-5" />
        </div>
      )}
      <Card className={cn(isReply && "border-l-2 border-l-primary/30")}>
        <CardContent className="p-4 flex gap-3">
          {/* Avatar */}
          <div
            className={cn(
              "flex flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold",
              isReply ? "h-7 w-7 text-xs" : "h-9 w-9",
              comentario.autor === "Most"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            )}
          >
            {comentario.autor.charAt(0).toUpperCase()}
          </div>

          {/* Content */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">
                {comentario.autor}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatFechaCorta(comentario.fecha)}
              </span>
            </div>
            <p className="mt-1 text-sm text-foreground/80 break-words whitespace-pre-wrap">
              {comentario.contenido}
            </p>

            {canComment && !isReplying && (
              <button
                onClick={() => setIsReplying(true)}
                className="mt-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                <MessageSquareReply className="size-3.5" />
                Responder
              </button>
            )}

            {isReplying && (
              <div className="mt-4">
                <CommentForm
                  actividadId={actividadId}
                  slug={slug}
                  parentId={replyParentId}
                  onCancel={() => setIsReplying(false)}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Render children (respuestas) if any */}
      {comentario.respuestas && comentario.respuestas.length > 0 && (
        <div className="space-y-4 mt-4">
          {comentario.respuestas.map((respuesta) => (
            <CommentItem
              key={respuesta.id}
              comentario={respuesta}
              actividadId={actividadId}
              slug={slug}
              canComment={canComment}
              isReply={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}
