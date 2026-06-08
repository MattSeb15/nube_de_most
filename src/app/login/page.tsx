"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Cloud,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Lock,
  Mail,
  User,
  CheckCircle2,
  Sparkles,
  BookOpen,
  Calendar,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [isPending, startTransition] = useTransition();

  // Authentication mode: unified state
  const [mode, setMode] = useState<"login" | "register" | "forgot">("login");
  const [displayMode, setDisplayMode] = useState<"login" | "register" | "forgot">("login");
  const [isFading, setIsFading] = useState(false);

  // Sync mode with URL query parameter on mount and state change
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const queryMode = params.get("mode");
      const targetMode = queryMode === "register" ? "register" : queryMode === "forgot" ? "forgot" : "login";
      setMode(targetMode);
      setDisplayMode(targetMode);
    }
  }, []);

  const handleModeChange = (newMode: "login" | "register" | "forgot") => {
    if (newMode === displayMode) return;

    setIsFading(true);
    setErrorMsg("");
    setSuccessMsg("");
    setEmailError(false);
    setPasswordError(false);
    setNameError(false);
    setApodoError(false);

    setTimeout(() => {
      setMode(newMode);
      setDisplayMode(newMode);
      setIsFading(false);

      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        url.searchParams.set("mode", newMode);
        window.history.pushState({}, "", url.toString());
      }
    }, 200);
  };

  // Form states
  const [emailPrefix, setEmailPrefix] = useState("");
  const [password, setPassword] = useState("");
  const [nombreCompleto, setNombreCompleto] = useState("");
  const [apodo, setApodo] = useState("");

  // Visual/Animation states
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Specific input error states (for shake animations & red borders)
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [nameError, setNameError] = useState(false);
  const [apodoError, setApodoError] = useState(false);

  // Form shake trigger
  const [shakeTrigger, setShakeTrigger] = useState(false);

  function triggerShake() {
    setShakeTrigger(true);
    setTimeout(() => setShakeTrigger(false), 400);
  }

  // Handle Login
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setEmailError(false);
    setPasswordError(false);

    let hasErrors = false;

    if (!emailPrefix) {
      setEmailError(true);
      hasErrors = true;
    }
    if (!password) {
      setPasswordError(true);
      hasErrors = true;
    }

    if (hasErrors) {
      triggerShake();
      return;
    }

    const fullEmail = `${emailPrefix.trim()}@uta.edu.ec`;

    startTransition(async () => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: fullEmail,
        password,
      });

      if (error) {
        triggerShake();
        if (
          error.message.toLowerCase().includes("invalid login credentials") ||
          error.message.toLowerCase().includes("email not confirmed")
        ) {
          setEmailError(true);
          setPasswordError(true);

          if (error.message.toLowerCase().includes("email not confirmed")) {
            setErrorMsg("Tu correo institucional aún no ha sido verificado.");
            router.push(`/verificar-correo?email=${encodeURIComponent(fullEmail)}`);
            return;
          } else {
            setErrorMsg("Credenciales incorrectas. Verifica tu correo y contraseña.");
          }
        } else {
          setErrorMsg(error.message);
        }
        return;
      }

      // Check if email is verified
      const user = data.user;
      if (user && !user.email_confirmed_at) {
        router.push(`/verificar-correo?email=${encodeURIComponent(fullEmail)}`);
      } else {
        router.push("/");
        router.refresh();
      }
    });
  }

  // Handle Forgot Password
  async function handleForgot(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setEmailError(false);

    if (!emailPrefix) {
      setEmailError(true);
      triggerShake();
      return;
    }

    const fullEmail = `${emailPrefix.trim()}@uta.edu.ec`;

    startTransition(async () => {
      const { error } = await supabase.auth.resetPasswordForEmail(fullEmail, {
        redirectTo: `${window.location.origin}/actualizar-password`,
      });

      if (error) {
        triggerShake();
        setErrorMsg(error.message);
        return;
      }

      setSuccessMsg("Correo de recuperación enviado. Revisa tu bandeja de entrada.");
    });
  }

  // Handle Registration
  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setEmailError(false);
    setPasswordError(false);
    setNameError(false);
    setApodoError(false);

    let hasErrors = false;

    if (!nombreCompleto) {
      setNameError(true);
      hasErrors = true;
    }
    if (!apodo) {
      setApodoError(true);
      hasErrors = true;
    }
    if (!emailPrefix) {
      setEmailError(true);
      hasErrors = true;
    }
    if (!password) {
      setPasswordError(true);
      hasErrors = true;
    }

    if (password && password.length < 6) {
      setPasswordError(true);
      setErrorMsg("La contraseña debe tener al menos 6 caracteres");
      hasErrors = true;
    }

    if (hasErrors) {
      triggerShake();
      return;
    }

    const fullEmail = `${emailPrefix.trim()}@uta.edu.ec`;

    startTransition(async () => {
      // First check if username is available
      try {
        const res = await fetch(`/api/check-username?username=${encodeURIComponent(apodo)}`);
        const result = await res.json();
        
        if (!res.ok || !result.available) {
          setApodoError(true);
          setErrorMsg(result.error || "El nombre de usuario ya está en uso o es inválido.");
          triggerShake();
          return;
        }
      } catch (err) {
        setErrorMsg("Error al validar el nombre de usuario.");
        triggerShake();
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email: fullEmail,
        password,
        options: {
          data: {
            nombre_completo: nombreCompleto,
            full_name: nombreCompleto,
            nickname: apodo,
            role: "estudiante",
          },
        },
      });

      if (error) {
        triggerShake();
        setErrorMsg(error.message);
        return;
      }

      if (data.user) {
        // Safe fallback insert to perfiles table
        const { error: profileError } = await supabase
          .from("perfiles")
          .insert({
            id: data.user.id,
            nombre_completo: nombreCompleto,
            apodo: apodo,
            rol: "estudiante",
            bio: `Estudiante verificado de la Universidad Técnica de Ambato (@uta.edu.ec).`,
            redes: [],
          });

        if (profileError) {
          console.log("Perfil público creado o manejado por trigger:", profileError.message);
        }

        // Redirect to beautiful verification waiting room immediately
        router.push(`/verificar-correo?email=${encodeURIComponent(fullEmail)}`);
      }
    });
  }

  return (
    <main className="min-h-screen bg-background relative flex flex-col items-center justify-center overflow-hidden px-6">
      
      {/* Botón flotante para volver al inicio */}
      <Link
        href="/"
        className="absolute top-6 left-6 md:top-8 md:left-8 z-50 flex items-center gap-2 px-4 py-2 text-sm font-semibold tracking-wide text-muted-foreground hover:text-foreground rounded-full bg-secondary/30 hover:bg-secondary/80 border border-border/50 backdrop-blur-md transition-all duration-300 group"
      >
        <ArrowLeft className="size-4 shrink-0 transition-transform group-hover:-translate-x-1" />
        <span className="hidden sm:inline">Volver al inicio</span>
      </Link>

      {/* Hero-like Fog Background */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none bg-background"
        style={{
          maskImage: 'radial-gradient(ellipse 1000px 800px at center, black 0%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse 1000px 800px at center, black 0%, transparent 80%)'
        }}
      />

      <div className="relative z-10 w-full max-w-[380px] space-y-8 flex flex-col items-center">
        
        {/* Minimalist Logo Header */}
        <div className="flex flex-col items-center text-center animate-fade-in">
          <Link href="/" className="flex items-center justify-center mb-6 group focus-visible:outline-none">
             <Cloud className="size-12 fill-foreground text-foreground transition-transform group-hover:scale-105" />
          </Link>
          <div className="space-y-2 text-center transition-all duration-300">
            <h2 className="text-4xl sm:text-5xl font-extrabold text-foreground tracking-tighter">
              {displayMode === "login" ? "Bienvenido" : displayMode === "register" ? "Regístrate" : "Recuperar"}
            </h2>
            <p className="text-sm font-medium text-muted-foreground">
              {displayMode === "login"
                ? "Inicia sesión para continuar en la nube"
                : displayMode === "register"
                ? "Usa tus credenciales institucionales"
                : "Ingresa tu correo para restablecer tu contraseña"}
            </p>
          </div>
        </div>

        <div
          className={cn(
            "w-full transition-all duration-300 space-y-6",
            shakeTrigger && "animate-shake"
          )}
        >
          {/* Feedback Alerts */}
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

          {/* Smooth transition container */}
          <div
            className={cn(
              "transition-all duration-300 ease-in-out transform w-full",
              isFading ? "opacity-0 translate-y-3 scale-[0.98]" : "opacity-100 translate-y-0 scale-100"
            )}
          >
            {displayMode === "login" ? (
              /* ─── FORMULARIO INICIO SESIÓN ─── */
              <form onSubmit={handleLogin} className="space-y-4 w-full">
                {/* Email */}
                <div className="space-y-1.5">
                  <div className="relative flex items-center group">
                    <div className="absolute left-4 text-muted-foreground/50 group-focus-within:text-foreground transition-colors">
                      <Mail className="size-4.5" />
                    </div>
                    <Input
                      id="login-email"
                      type="text"
                      placeholder="nombre.apellido"
                      value={emailPrefix}
                      onChange={(e) => {
                        const val = e.target.value.toLowerCase().replace(/\s+/g, "").split("@")[0];
                        setEmailPrefix(val);
                        if (emailError) setEmailError(false);
                      }}
                      disabled={isPending}
                      className={cn(
                        "h-14 pl-12 pr-28 rounded-2xl text-base font-medium transition-all duration-200 bg-secondary/40 border-transparent hover:bg-secondary/60 focus-visible:bg-transparent focus-visible:ring-1 focus-visible:ring-border",
                        emailError && "border-destructive focus-visible:ring-destructive focus-visible:border-destructive"
                      )}
                    />
                    <span className="absolute right-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground/60 select-none pointer-events-none">
                      @uta.edu.ec
                    </span>
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <div className="relative flex items-center group">
                    <div className="absolute left-4 text-muted-foreground/50 group-focus-within:text-foreground transition-colors">
                      <Lock className="size-4.5" />
                    </div>
                    <Input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Contraseña"
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

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => handleModeChange("forgot")}
                    className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>

                <Button
                  type="submit"
                  disabled={isPending}
                  className="w-full h-14 rounded-full font-bold text-lg mt-8 bg-foreground text-background hover:bg-foreground/90 transition-transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  {isPending ? (
                    <>
                      <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Ingresando...</span>
                    </>
                  ) : (
                    <span>Ingresar</span>
                  )}
                </Button>

                <div className="text-center pt-6">
                  <button
                    type="button"
                    onClick={() => handleModeChange("register")}
                    className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
                  >
                    ¿No tienes cuenta? <span className="text-foreground underline decoration-border underline-offset-4">Regístrate</span>
                  </button>
                </div>
              </form>
            ) : displayMode === "register" ? (
              /* ─── FORMULARIO REGISTRO ─── */
              <form onSubmit={handleRegister} className="space-y-4 w-full">
                {/* Nombre Completo */}
                <div className="space-y-1.5">
                  <div className="relative flex items-center group">
                    <div className="absolute left-4 text-muted-foreground/50 group-focus-within:text-foreground transition-colors">
                      <User className="size-4.5" />
                    </div>
                    <Input
                      id="reg-name"
                      type="text"
                      placeholder="Nombre Completo"
                      value={nombreCompleto}
                      onChange={(e) => {
                        setNombreCompleto(e.target.value);
                        if (nameError) setNameError(false);
                      }}
                      disabled={isPending}
                      className={cn(
                        "h-14 pl-12 rounded-2xl text-base font-medium transition-all duration-200 bg-secondary/40 border-transparent hover:bg-secondary/60 focus-visible:bg-transparent focus-visible:ring-1 focus-visible:ring-border",
                        nameError && "border-destructive focus-visible:ring-destructive focus-visible:border-destructive"
                      )}
                    />
                  </div>
                </div>

                {/* Apodo */}
                <div className="space-y-1.5">
                  <div className="relative flex items-center group">
                    <span className="absolute left-4 text-base text-muted-foreground/50 font-bold select-none pointer-events-none">
                      @
                    </span>
                    <Input
                      id="reg-apodo"
                      type="text"
                      placeholder="Usuario / Apodo"
                      value={apodo}
                      onChange={(e) => {
                        const val = e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, "");
                        setApodo(val);
                        if (apodoError) setApodoError(false);
                      }}
                      disabled={isPending}
                      className={cn(
                        "h-14 pl-10 rounded-2xl text-base font-medium transition-all duration-200 bg-secondary/40 border-transparent hover:bg-secondary/60 focus-visible:bg-transparent focus-visible:ring-1 focus-visible:ring-border",
                        apodoError && "border-destructive focus-visible:ring-destructive focus-visible:border-destructive"
                      )}
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <div className="relative flex items-center group">
                    <div className="absolute left-4 text-muted-foreground/50 group-focus-within:text-foreground transition-colors">
                      <Mail className="size-4.5" />
                    </div>
                    <Input
                      id="reg-email"
                      type="text"
                      placeholder="nombre.apellido"
                      value={emailPrefix}
                      onChange={(e) => {
                        const val = e.target.value.toLowerCase().replace(/\s+/g, "").split("@")[0];
                        setEmailPrefix(val);
                        if (emailError) setEmailError(false);
                      }}
                      disabled={isPending}
                      className={cn(
                        "h-14 pl-12 pr-28 rounded-2xl text-base font-medium transition-all duration-200 bg-secondary/40 border-transparent hover:bg-secondary/60 focus-visible:bg-transparent focus-visible:ring-1 focus-visible:ring-border",
                        emailError && "border-destructive focus-visible:ring-destructive focus-visible:border-destructive"
                      )}
                    />
                    <span className="absolute right-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground/60 select-none pointer-events-none">
                      @uta.edu.ec
                    </span>
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <div className="relative flex items-center group">
                    <div className="absolute left-4 text-muted-foreground/50 group-focus-within:text-foreground transition-colors">
                      <Lock className="size-4.5" />
                    </div>
                    <Input
                      id="reg-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Contraseña (mín. 6)"
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
                      <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Creando cuenta...</span>
                    </>
                  ) : (
                    <span>Registrarse</span>
                  )}
                </Button>

                <div className="text-center pt-6">
                  <button
                    type="button"
                    onClick={() => handleModeChange("login")}
                    className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
                  >
                    ¿Ya tienes cuenta? <span className="text-foreground underline decoration-border underline-offset-4">Ingresa aquí</span>
                  </button>
                </div>
              </form>
            ) : (
              /* ─── FORMULARIO RECUPERAR CONTRASEÑA ─── */
              <form onSubmit={handleForgot} className="space-y-4 w-full">
                {/* Email */}
                <div className="space-y-1.5">
                  <div className="relative flex items-center group">
                    <div className="absolute left-4 text-muted-foreground/50 group-focus-within:text-foreground transition-colors">
                      <Mail className="size-4.5" />
                    </div>
                    <Input
                      id="forgot-email"
                      type="text"
                      placeholder="nombre.apellido"
                      value={emailPrefix}
                      onChange={(e) => {
                        const val = e.target.value.toLowerCase().replace(/\s+/g, "").split("@")[0];
                        setEmailPrefix(val);
                        if (emailError) setEmailError(false);
                      }}
                      disabled={isPending}
                      className={cn(
                        "h-14 pl-12 pr-28 rounded-2xl text-base font-medium transition-all duration-200 bg-secondary/40 border-transparent hover:bg-secondary/60 focus-visible:bg-transparent focus-visible:ring-1 focus-visible:ring-border",
                        emailError && "border-destructive focus-visible:ring-destructive focus-visible:border-destructive"
                      )}
                    />
                    <span className="absolute right-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground/60 select-none pointer-events-none">
                      @uta.edu.ec
                    </span>
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
                      <span>Enviando...</span>
                    </>
                  ) : (
                    <span>Enviar enlace de recuperación</span>
                  )}
                </Button>

                <div className="text-center pt-6">
                  <button
                    type="button"
                    onClick={() => handleModeChange("login")}
                    className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-2 mx-auto"
                  >
                    <ArrowLeft className="size-4" /> Volver al inicio de sesión
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
