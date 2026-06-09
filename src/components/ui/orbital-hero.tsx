"use client";

import { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MouseTooltip } from "@/components/ui/cursor-tooltip";
import { Cloud, FileText, BookOpen } from "lucide-react";
import { MateriaIcon } from "@/components/ui/materia-icon";
import { MateriaCard } from "@/components/apuntes/MateriaCard";
import { ArchivoCard } from "@/components/apuntes/ArchivoCard";
import { createClient } from "@/utils/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export interface OrbitItem {
  id: string;
  nombre: string;
  tipo: string;
  materiaSlug?: string;
  icono?: string;
  color?: string;
  originalMateria?: any;
  originalArchivo?: any;
}

export interface OrbitStat {
  value: number | string;
  label: string;
}

interface OrbitalHeroProps {
  items: OrbitItem[];
  stats?: OrbitStat[];
  users?: any[];
}

export function OrbitalHero({ items, stats, users = [] }: OrbitalHeroProps) {
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    setMounted(true);
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  // Use items directly without duplication
  const displayItems = useMemo(() => {
    return [...items].sort(() => Math.random() - 0.5);
  }, [items]);

  // If not mounted yet, render a static version to prevent hydration mismatches
  if (!mounted) {
    return (
      <section className="relative w-full min-h-[90vh] flex flex-col items-center justify-center overflow-hidden bg-background pt-24 pb-16">
        <div className="relative z-10 flex flex-col items-center text-center px-4">
          <h1 className="text-5xl sm:text-7xl md:text-[5.5rem] font-extrabold tracking-tighter text-foreground mb-4">
            La Nube de Most
          </h1>
          <p className="text-xl sm:text-2xl text-muted-foreground max-w-2xl font-medium mb-2">
            Tu espacio para la inspiración
          </p>
          <p className="text-sm sm:text-base text-muted-foreground/80 max-w-2xl font-medium mb-10">
            Apuntes de la carrera de Ingeniería en Software, Universidad Técnica de Ambato
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="relative w-full min-h-[90vh] flex flex-col items-center justify-center overflow-hidden bg-background pt-24 pb-16">
      
      {/* Orbital Background */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none overflow-hidden">
        
        {/* Inner Orbit Container (Materias) */}
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 160, repeat: Infinity, ease: "linear" }} // Faster inner orbit
          className="absolute rounded-full flex items-center justify-center"
          style={{ width: "150vw", height: "150vw", minWidth: "1200px", minHeight: "1200px" }}
        >
          {displayItems.filter(item => item.tipo === "materia").map((item, i, arr) => {
            const radius = 10 + Math.random() * 5; // Inner orbit (closer to center)
            const angle = (i / arr.length) * 360;
            const angleRad = (angle * Math.PI) / 180;
            
            const left = 50 + radius * Math.cos(angleRad);
            const top = 50 + radius * Math.sin(angleRad);
            
            const size = 90 + Math.random() * 20; 

            return (
              <div 
                key={item.id} 
                className="absolute pointer-events-auto" 
                style={{ left: `${left}%`, top: `${top}%`, transform: 'translate(-50%, -50%)' }}
              >
                <motion.div 
                  animate={{ rotate: -360, y: [0, -10, 0] }} 
                  transition={{ 
                    rotate: { duration: 160, repeat: Infinity, ease: "linear" }, // Match inner orbit speed
                    y: { duration: 4 + Math.random() * 2, repeat: Infinity, ease: "easeInOut" }
                  }}
                  whileHover={{ scale: 1.15, zIndex: 50 }}
                  className="relative group cursor-pointer"
                >
                  <div className="pointer-events-auto origin-center shadow-xl hover:shadow-2xl transition-shadow rounded-xl"
                       style={{ 
                         width: "300px",
                         transform: `scale(${size / 200})`
                       }}>
                    {item.originalMateria && (
                      <MateriaCard materia={item.originalMateria} href={`/apuntes/nivelacion/${item.materiaSlug}`} />
                    )}
                  </div>
                </motion.div>
              </div>
            );
          })}
        </motion.div>

        {/* Outer Orbit Container (Apuntes/Archivos) */}
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 220, repeat: Infinity, ease: "linear" }} // Slower outer orbit
          className="absolute rounded-full flex items-center justify-center"
          style={{ width: "150vw", height: "150vw", minWidth: "1200px", minHeight: "1200px" }}
        >
          {displayItems.filter(item => item.tipo !== "materia").map((item, i, arr) => {
            const radius = 18 + Math.random() * 6; // Middle orbit
            const angle = (i / arr.length) * 360;
            const angleRad = (angle * Math.PI) / 180;
            
            const left = 50 + radius * Math.cos(angleRad);
            const top = 50 + radius * Math.sin(angleRad);
            
            const size = 80 + Math.random() * 20; // Slightly smaller for outer orbit

            return (
              <div 
                key={item.id} 
                className="absolute pointer-events-auto" 
                style={{ left: `${left}%`, top: `${top}%`, transform: 'translate(-50%, -50%)' }}
              >
                <motion.div 
                  animate={{ rotate: -360, y: [0, -10, 0] }} 
                  transition={{ 
                    rotate: { duration: 220, repeat: Infinity, ease: "linear" }, // Match outer orbit speed
                    y: { duration: 4 + Math.random() * 2, repeat: Infinity, ease: "easeInOut" }
                  }}
                  whileHover={{ scale: 1.15, zIndex: 50 }}
                  className="relative group cursor-pointer"
                >
                  <div className="pointer-events-auto origin-center shadow-xl hover:shadow-2xl transition-shadow rounded-xl"
                       style={{ 
                         width: "280px",
                         transform: `scale(${size / 200})`
                       }}>
                    {item.originalArchivo && (
                      <ArchivoCard archivo={item.originalArchivo} />
                    )}
                  </div>
                </motion.div>
              </div>
            );
          })}
        </motion.div>

        {/* Outermost Orbit Container (Usuarios) */}
        {users.length > 0 && (
          <motion.div 
            animate={{ rotate: -360 }}
            transition={{ duration: 300, repeat: Infinity, ease: "linear" }} // Slowest outermost orbit, rotating opposite
            className="absolute rounded-full flex items-center justify-center"
            style={{ width: "150vw", height: "150vw", minWidth: "1200px", minHeight: "1200px" }}
          >
            {users.map((u, i, arr) => {
              const radius = 26 + Math.random() * 5; // Outermost orbit (now closer)
              const angle = (i / arr.length) * 360;
              const angleRad = (angle * Math.PI) / 180;
              
              const left = 50 + radius * Math.cos(angleRad);
              const top = 50 + radius * Math.sin(angleRad);
              
              const size = 50 + Math.random() * 20;

              return (
                <div 
                  key={u.id} 
                  className="absolute pointer-events-auto" 
                  style={{ left: `${left}%`, top: `${top}%`, transform: 'translate(-50%, -50%)' }}
                >
                  <motion.div 
                    animate={{ rotate: 360, y: [0, -10, 0] }} 
                    transition={{ 
                      rotate: { duration: 300, repeat: Infinity, ease: "linear" }, 
                      y: { duration: 4 + Math.random() * 2, repeat: Infinity, ease: "easeInOut", delay: Math.random() * 2 }
                    }}
                    whileHover={{ scale: 1.2, zIndex: 50 }}
                    className="relative group cursor-pointer"
                  >
                    <MouseTooltip text={u.apodo || u.nombre_completo || "Usuario"}>
                      <Link href={`/perfil/${u.apodo || u.id}`} className="block">
                        <Avatar className="shadow-lg border-2 border-primary/20 hover:border-primary/50 transition-colors" style={{ width: size, height: size }}>
                          {u.avatar_url && (
                            <AvatarImage src={u.avatar_url} alt={u.nombre_completo} />
                          )}
                          <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                            {(u.nombre_completo || "U").substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </Link>
                    </MouseTooltip>
                  </motion.div>
                </div>
              );
            })}
          </motion.div>
        )}
      </div>

      {/* Neblina (fog) central para difuminar las tarjetas bajo el texto */}
      <div 
        className="absolute inset-0 z-10 pointer-events-none bg-background"
        style={{
          maskImage: 'radial-gradient(ellipse min(900px, 140vw) min(700px, 140vh) at center, black 20%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse min(900px, 140vw) min(700px, 140vh) at center, black 20%, transparent 80%)'
        }}
      />
      {/* Foreground Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 mt-8 md:mt-0 w-full max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="mb-8"
        >
          <h1 className="text-6xl sm:text-7xl md:text-[6rem] lg:text-[7rem] font-extrabold tracking-tighter text-foreground leading-[1.1]">
            La Nube de Most
          </h1>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <p className="text-xl sm:text-3xl text-foreground font-medium mb-4 tracking-tight">
            Tu espacio para la inspiración
          </p>
          <p className="text-base sm:text-xl text-muted-foreground font-medium mb-12 tracking-tight max-w-2xl mx-auto">
            Apuntes de la carrera de Ingeniería en Software, Universidad Técnica de Ambato
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-4 mb-16"
        >
           {!user ? (
             <>
               <Link href="/login?mode=register">
                 <Button size="lg" className="rounded-full px-8 h-14 text-lg font-semibold bg-foreground text-background hover:bg-foreground/90 transition-transform hover:scale-105">
                   Registrarse
                 </Button>
               </Link>
               <Link href="/apuntes">
                 <Button variant="outline" size="lg" className="rounded-full px-8 h-14 text-lg font-semibold bg-background/50 backdrop-blur-sm border-border hover:bg-background/80 transition-transform hover:scale-105">
                   Obtener apuntes
                 </Button>
               </Link>
             </>
           ) : (
             <Link href="/apuntes">
               <Button size="lg" className="rounded-full px-8 h-14 text-lg font-semibold bg-foreground text-background hover:bg-foreground/90 transition-transform hover:scale-105">
                 Explorar apuntes
               </Button>
             </Link>
           )}
        </motion.div>

        {stats && stats.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-x-12 gap-y-8 mt-8"
          >
            {stats.map((stat) => (
              <div key={stat.label} className="flex flex-col items-center gap-2">
                <span className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
                  {stat.value}
                </span>
                <span className="text-sm sm:text-base text-muted-foreground font-medium">
                  {stat.label}
                </span>
              </div>
            ))}
          </motion.div>
        )}
      </div>

    </section>
  );
}
