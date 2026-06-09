"use client";

import React, { useState, useEffect } from "react";
import { ThumbsUp, ThumbsDown, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getMateriaInteraction, toggleLikeDislikeMateria, toggleSaveMateria } from "@/app/(main)/materias/acciones";

interface MateriaInteractionsProps {
  materiaId: string;
}

export function MateriaInteractions({ materiaId }: MateriaInteractionsProps) {
  const [likes, setLikes] = useState(0);
  const [dislikes, setDislikes] = useState(0);
  const [interaction, setInteraction] = useState<'like' | 'dislike' | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, setIsPending] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    async function loadInteractions() {
      const data = await getMateriaInteraction(materiaId);
      setLikes(data.likes);
      setDislikes(data.dislikes);
      setInteraction(data.userInteraction);
      setIsSaved(data.isSaved);
      setUserId(data.userId || null);
      setIsLoading(false);
    }
    loadInteractions();
  }, [materiaId]);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!userId || isPending) return;
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
    
    const res = await toggleLikeDislikeMateria(materiaId, 'like');
    if (res?.error) {
      setInteraction(prevInteraction);
      setLikes(likes);
      setDislikes(dislikes);
    }
    setIsPending(false);
  };

  const handleDislike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!userId || isPending) return;
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
    
    const res = await toggleLikeDislikeMateria(materiaId, 'dislike');
    if (res?.error) {
      setInteraction(prevInteraction);
      setLikes(likes);
      setDislikes(dislikes);
    }
    setIsPending(false);
  };

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!userId || isPending) return;
    setIsPending(true);
    
    const prevSaved = isSaved;
    setIsSaved(!isSaved);
    
    const res = await toggleSaveMateria(materiaId);
    if (res?.error) {
      setIsSaved(prevSaved);
    }
    setIsPending(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border/50 animate-pulse h-[36px]">
        <div className="w-16 h-8 bg-muted rounded-full"></div>
        <div className="w-8 h-8 bg-muted rounded-full ml-auto"></div>
      </div>
    );
  }

  // Si no hay usuario, mostrar estático o deshabilitado
  const btnGhost = "text-muted-foreground hover:bg-muted";
  const likeBtnGhost = "text-green-600/70 hover:text-green-700 hover:bg-green-50/50 dark:text-green-500/70";
  const dislikeBtnGhost = "text-red-600/70 hover:text-red-700 hover:bg-red-50/50 dark:text-red-500/70";

  return (
    <div className="flex items-center gap-1.5 mt-auto pt-4 border-t border-border/50 z-20 relative pointer-events-auto">
      <div className="flex items-center rounded-full mr-2 bg-muted/40 h-8">
        <Button 
          onClick={handleLike} 
          variant="ghost" 
          size="sm" 
          disabled={!userId}
          data-cursor-tooltip={interaction === 'like' ? "Quitar me gusta" : "Me gusta"}
          data-cursor-color="#16a34a"
          className={cn("rounded-l-full px-2 h-full transition-colors", interaction === 'like' ? "bg-green-100/80 text-green-700 dark:bg-green-900/30 dark:text-green-400" : likeBtnGhost)}
        >
          <ThumbsUp className={cn("w-3.5 h-3.5", interaction === 'like' && "fill-current")} /> 
          {likes > 0 && <span className="ml-1 text-xs font-medium">{likes}</span>}
        </Button>
        <div className="w-[1px] h-3 bg-border"></div>
        <Button 
          onClick={handleDislike} 
          variant="ghost" 
          size="sm" 
          disabled={!userId}
          data-cursor-tooltip={interaction === 'dislike' ? "Quitar no me gusta" : "No me gusta"}
          data-cursor-color="#dc2626"
          className={cn("rounded-r-full px-2 h-full transition-colors", interaction === 'dislike' ? "bg-red-100/80 text-red-700 dark:bg-red-900/30 dark:text-red-400" : dislikeBtnGhost)}
        >
          <ThumbsDown className={cn("w-3.5 h-3.5", interaction === 'dislike' && "fill-current")} />
          {dislikes > 0 && <span className="ml-1 text-xs font-medium">{dislikes}</span>}
        </Button>
      </div>
      
      <Button 
        onClick={handleSave} 
        variant="ghost" 
        size="icon" 
        disabled={!userId}
        data-cursor-tooltip={isSaved ? "Quitar de guardados" : "Guardar materia"}
        data-cursor-color="#dc2626"
        className={cn("rounded-full h-8 w-8 ml-auto transition-colors", isSaved ? "bg-red-100/80 text-red-700 dark:bg-red-900/30 dark:text-red-400" : btnGhost)}
      >
        <Bookmark className={cn("w-4 h-4", isSaved && "fill-current")} />
      </Button>
    </div>
  );
}
