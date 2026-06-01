"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/utils/supabase/client";

interface TrackVisitProps {
  entidadId: string;
  tipoEntidad: "materia" | "apunte";
}

export function TrackVisit({ entidadId, tipoEntidad }: TrackVisitProps) {
  const trackedRef = useRef(false);

  useEffect(() => {
    // Solo trackear una vez por montaje de componente
    if (trackedRef.current) return;
    trackedRef.current = true;

    const track = async () => {
      try {
        // Evitar spam comprobando localStorage
        const storageKey = `visit_${tipoEntidad}_${entidadId}`;
        const lastVisit = localStorage.getItem(storageKey);
        const now = Date.now();
        
        // Si ya visitó en la última hora (o 24 hrs), no registramos otra vez
        // Usaremos 1 hora para desarrollo/producción razonable
        if (lastVisit && now - parseInt(lastVisit) < 60 * 60 * 1000) {
          return;
        }

        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        const { error } = await supabase.from("visitas").insert({
          entidad_id: entidadId,
          tipo_entidad: tipoEntidad,
          usuario_id: user?.id || null,
        });

        if (!error) {
          localStorage.setItem(storageKey, now.toString());
        }
      } catch (error) {
        console.error("Error al registrar visita:", error);
      }
    };

    track();
  }, [entidadId, tipoEntidad]);

  return null;
}
