"use client";

import React, { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Cloud, Eye, EyeOff, AlertCircle, ArrowLeft, CheckCircle2, Lock, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ActualizarPasswordPage() {
  const router = useRouter();
  const supabase = createClient();
  const [isPending, startTransition] = useTransition();

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [shakeTrigger, setShakeTrigger] = useState(false);

  function triggerShake() {
    setShakeTrigger(true);
    setTimeout(() => setShakeTrigger(false), 400);
  }

  // Ensure user has a session (recovery flow sets a session)
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        setErrorMsg("Enlace inválido o expirado. Vuelve a solicitar el restablecimiento.");
      }
    });
  }, [supabase.auth]);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setPasswordError(false);

    if (!password || password.length < 6) {
      setPasswordError(true);
      setErrorMsg("La contraseña debe tener al menos 6 caracteres");
      triggerShake();
      return;
    }

    startTransition(async () => {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        triggerShake();
        setErrorMsg(error.message);
        return;
      }

      setSuccessMsg("Contraseña actualizada exitosamente.");
      setTimeout(() => {
        router.push("/");
      }, 2000);
    });
  }

  return (
    <main className="min-h-screen bg-background relative flex flex-col items-center justify-center overflow-hidden px-6">
      <Link
        href="/login"
        className="absolute top-6 left-6 md:top-8 md:left-8 z-50 flex items-center gap-2 px-4 py-2 text-sm font-semibold tracking-wide text-muted-foreground hover:text-foreground rounded-full bg-secondary/30 hover:bg-secondary/80 border border-border/50 backdrop-blur-md transition-all duration-300 group"
      >
        <ArrowLeft className="size-4 shrink-0 transition-transform group-hover:-translate-x-1" />
        <span className="hidden sm:inline">Volver a inicio</span>
      </Link>

      <div 
        className="absolute inset-0 z-0 pointer-events-none bg-background"
        style={{
          maskImage: 'radial-gradient(ellipse 1000px 800px at center, black 0%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse 1000px 800px at center, black 0%, transparent 80%)'
        }}
      />

      <div className="relative z-10 w-full max-w-[380px] space-y-8 flex flex-col items-center">
        <div className="flex flex-col items-center text-center animate-fade-in">
          <div className="flex items-center justify-center mb-6">
             <Cloud className="size-12 fill-foreground text-foreground" />
          </div>
          <div className="space-y-2 text-center">
            <h2 className="text-4xl sm:text-5xl font-extrabold text-foreground tracking-tighter">
              Nueva clave
            </h2>
            <p className="text-sm font-medium text-muted-foreground">
              Ingresa tu nueva contraseña para acceder.
            </p>
          </div>
        </div>

        <div className={cn("w-full transition-all duration-300 space-y-6", shakeTrigger && "animate-shake")}>
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-destructive/10 text-destructive text-sm flex items-center justify-center gap-2.5 animate-in fade-in slide-in-from-top-2 duration-300 font-medium text-center">
              <AlertCircle className="size-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-sm flex items-center justify-center gap-2.5 animate-in fade-in slide-in-from-top-2 duration-300 font-medium text-center">
              <CheckCircle2 className="size-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleReset} className="space-y-4 w-full">
            <div className="space-y-1.5">
              <div className="relative flex items-center group">
                <div className="absolute left-4 text-muted-foreground/50 group-focus-within:text-foreground transition-colors">
                  <Lock className="size-4.5" />
                </div>
                <Input
                  id="reset-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Nueva contraseña (mín. 6)"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (passwordError) setPasswordError(false);
                  }}
                  disabled={isPending}
                  className={cn(
                    "h-14 pl-12 pr-12 rounded-2xl text-base font-medium transition-all duration-200 bg-secondary/40 border-transparent hover:bg-secondary/60 focus-visible:bg-transparent focus-visible:ring-1 focus-visible:ring-border",
                    passwordError && "border-destructive focus-visible:ring-destructive focus-visible:border-destructive"
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 text-muted-foreground/50 hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="size-4.5" /> : <Eye className="size-4.5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={isPending}
              className="w-full h-14 rounded-full font-bold text-lg mt-8 bg-foreground text-background hover:bg-foreground/90 transition-transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <span>Actualizar Contraseña</span>
              )}
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
}
