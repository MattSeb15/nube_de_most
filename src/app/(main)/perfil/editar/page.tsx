"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";
import { uploadFile } from "@/utils/firebase/storage";
import { ImageOptimizerModal } from "@/components/apuntes/ImageOptimizerModal";
import { Button } from "@/components/ui/button";
import {
  User,
  Mail,
  Lock,
  Shield,
  Save,
  Globe,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Calendar,
  Camera,
} from "lucide-react";

interface RedSocial {
  plataforma: string;
  usuario: string;
  url: string;
  icono: string;
}

// ── Custom SVG Brand Icons (Filled/Solid Styles) ──

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12Z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
    </svg>
  );
}

function TwitterIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  );
}

export default function PerfilPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  // Form fields
  const [nombreCompleto, setNombreCompleto] = useState("");
  const [apodo, setApodo] = useState("");
  const [bio, setBio] = useState("");
  const [rol, setRol] = useState("estudiante");
  const [avatarUrl, setAvatarUrl] = useState("");
  
  // Avatar upload states
  const [fileToOptimize, setFileToOptimize] = useState<File | null>(null);
  const [showOptimizer, setShowOptimizer] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Social links
  const [github, setGithub] = useState("");
  const [instagram, setInstagram] = useState("");
  const [twitter, setTwitter] = useState("");
  const [facebook, setFacebook] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [web, setWeb] = useState("");

  // Password change state
  const [newPassword, setNewPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Feedback states
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        // Get authenticated user
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !authUser) {
          router.push("/login");
          return;
        }

        setUser(authUser);

        // Fetch public profile details
        const { data: profile, error: profileError } = await supabase
          .from("perfiles")
          .select("*")
          .eq("id", authUser.id)
          .single();

        if (!profileError && profile) {
          setNombreCompleto(profile.nombre_completo || "");
          setApodo(profile.apodo || "");
          setBio(profile.bio || "");
          setRol(profile.rol || "estudiante");
          setAvatarUrl(profile.avatar_url || authUser.user_metadata?.avatar_url || "");

          // Parse social networks jsonb
          const redes: RedSocial[] = profile.redes || [];
          redes.forEach((red) => {
            const platform = red.plataforma.toLowerCase();
            if (platform.includes("github")) setGithub(red.usuario);
            if (platform.includes("instagram")) setInstagram(red.usuario);
            if (platform.includes("twitter") || platform.includes("x")) setTwitter(red.usuario);
            if (platform.includes("facebook")) setFacebook(red.usuario);
            if (platform.includes("linkedin")) setLinkedin(red.usuario);
            if (platform.includes("web") || platform.includes("link") || platform.includes("portfolio")) setWeb(red.url);
          });
        } else {
          // If no profile row yet (e.g. newly created user), set fallback defaults
          setNombreCompleto(authUser.user_metadata?.nombre_completo || authUser.user_metadata?.full_name || "");
          setApodo(authUser.user_metadata?.nickname || "");
          setBio("Estudiante verificado de la Universidad Técnica de Ambato (@uta.edu.ec).");
        }
      } catch (err: any) {
        setErrorMsg("Error al cargar la información del perfil.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [supabase, router]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      // Validate unique username
      const res = await fetch(`/api/check-username?username=${encodeURIComponent(apodo)}&exclude=${user.id}`);
      const data = await res.json();
      
      if (!res.ok || !data.available) {
        throw new Error(data.error || "El nombre de usuario ya está en uso o es inválido.");
      }

      // Build the redes jsonb array
      const newRedes: RedSocial[] = [];
      if (github.trim()) {
        newRedes.push({
          plataforma: "GitHub",
          usuario: github.trim(),
          url: `https://github.com/${github.trim().replace("@", "")}`,
          icono: "github",
        });
      }
      if (instagram.trim()) {
        newRedes.push({
          plataforma: "Instagram",
          usuario: instagram.trim(),
          url: `https://instagram.com/${instagram.trim().replace("@", "")}`,
          icono: "instagram",
        });
      }
      if (twitter.trim()) {
        newRedes.push({
          plataforma: "Twitter / X",
          usuario: twitter.trim(),
          url: `https://x.com/${twitter.trim().replace("@", "")}`,
          icono: "twitter",
        });
      }
      if (facebook.trim()) {
        newRedes.push({
          plataforma: "Facebook",
          usuario: facebook.trim(),
          url: `https://facebook.com/${facebook.trim().replace("@", "")}`,
          icono: "facebook",
        });
      }
      if (linkedin.trim()) {
        newRedes.push({
          plataforma: "LinkedIn",
          usuario: linkedin.trim(),
          url: `https://linkedin.com/in/${linkedin.trim().replace("@", "")}`,
          icono: "linkedin",
        });
      }
      if (web.trim()) {
        let webUrl = web.trim();
        if (!/^https?:\/\//i.test(webUrl)) {
          webUrl = `https://${webUrl}`;
        }
        newRedes.push({
          plataforma: "Web",
          usuario: web.trim().replace(/^https?:\/\/(www\.)?/i, ""),
          url: webUrl,
          icono: "globe",
        });
      }

      // Upsert the profile into the perfiles table
      const { error } = await supabase.from("perfiles").upsert({
        id: user.id,
        nombre_completo: nombreCompleto.trim(),
        apodo: apodo.trim(),
        bio: bio.trim(),
        rol: rol,
        redes: newRedes,
        avatar_url: avatarUrl,
      });

      if (error) {
        throw error;
      }

      setSuccessMsg("¡Tu perfil se ha actualizado con éxito!");
      // Auto clear success message after 4s
      setTimeout(() => setSuccessMsg(""), 4000);
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || "Error al actualizar el perfil.");
    } finally {
      setSaving(false);
    }
  }

  async function handleChangePassword() {
    if (!newPassword || newPassword.length < 6) return;
    setIsChangingPassword(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setSuccessMsg("¡Contraseña actualizada correctamente!");
      setNewPassword("");
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || "Error al actualizar la contraseña.");
    } finally {
      setIsChangingPassword(false);
    }
  }

  // Loading skeleton placeholder
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 max-w-4xl min-h-[70vh] flex flex-col justify-center items-center">
        <div className="flex items-center gap-3 text-muted-foreground animate-pulse mb-6">
          <Loader2 className="size-6 animate-spin text-primary" />
          <span className="font-semibold text-sm">Cargando información académica...</span>
        </div>
        <div className="w-full space-y-4 max-w-xl">
          <div className="h-4 bg-muted/40 rounded-md w-3/4 mx-auto" />
          <div className="h-10 bg-muted/40 rounded-xl w-full" />
          <div className="h-32 bg-muted/40 rounded-xl w-full" />
        </div>
      </div>
    );
  }

  // Not logged in fallback (though redirected by useEffect, keep as safety guard)
  if (!user) {
    return null;
  }

  const isAdmin = rol === "admin";
  const userInitials = (apodo || nombreCompleto || user.email || "U")
    .substring(0, 2)
    .toUpperCase();

  const bioLength = bio.length;
  const bioLimit = 300;

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileToOptimize(e.target.files[0]);
      setShowOptimizer(true);
    }
  };

  const handleOptimizedUpload = async (optimizedFile: File) => {
    if (!user) return;
    setIsUploadingAvatar(true);
    setShowOptimizer(false);
    try {
      const path = `avatars/${user.id}/${Date.now()}_avatar.webp`;
      const { downloadUrl } = await uploadFile(optimizedFile, path);
      setAvatarUrl(downloadUrl);
      
      // Update supabase immediately so they don't lose the avatar if they refresh
      await supabase.from("perfiles").update({ avatar_url: downloadUrl }).eq("id", user.id);
      
      setSuccessMsg("¡Foto de perfil actualizada!");
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err: any) {
      setErrorMsg("Error al subir la foto de perfil.");
      console.error(err);
    } finally {
      setIsUploadingAvatar(false);
      setFileToOptimize(null);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* ── Volver al Inicio ── */}
      <div className="mb-6 flex justify-between items-center animate-fade-in stagger-1">
        <Link
          href={`/perfil/${apodo || user.id}`}
          className="group flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors duration-200"
        >
          <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
          <span>Volver al perfil</span>
        </Link>
        <span className="text-[10px] font-mono font-medium text-muted-foreground bg-muted/30 border border-border/40 rounded-full px-2.5 py-0.5">
          Zona Estudiante
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-16 animate-fade-in stagger-2">
        {/* ── Left Column: Avatar and Quick Stats ── */}
        <div className="md:col-span-4 flex flex-col items-center text-center px-2 py-4">
          {/* Glowing Avatar */}
          <div className="relative mb-4 group select-none">
            <button 
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingAvatar}
              className="relative rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary overflow-hidden"
            >
              <div className={cn(
                "size-24 flex items-center justify-center text-3xl font-bold font-mono tracking-wider shadow-lg",
                isAdmin
                  ? "bg-gradient-to-tr from-primary to-rose-500 text-white shadow-primary/20"
                  : "bg-gradient-to-tr from-neutral-800 to-neutral-700 text-neutral-100 dark:from-neutral-900 dark:to-neutral-800 border border-border/80"
              )}>
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  userInitials
                )}
              </div>
              
              {/* Overlay for hover */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                {isUploadingAvatar ? (
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                ) : (
                  <Camera className="w-6 h-6 text-white" />
                )}
              </div>
            </button>
            <div className={cn(
              "absolute bottom-0 right-0 size-4 rounded-full border-2 border-card shrink-0 animate-pulse pointer-events-none",
              isAdmin ? "bg-primary" : "bg-emerald-500"
            )} />
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleAvatarSelect} 
            />
          </div>

          <h2 className="text-lg font-bold tracking-tight text-foreground truncate max-w-full">
            {apodo || "Estudiante UTA"}
          </h2>
          <p className="text-xs text-muted-foreground truncate max-w-full font-medium mb-3">
            {nombreCompleto || user.email}
          </p>

          {/* Role badge */}
          <div className="mb-6">
            {isAdmin ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 border border-primary/20 rounded-full px-3 py-1">
                <Shield className="size-3" />
                Administrador
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1">
                <Shield className="size-3" />
                Estudiante Verificado
              </span>
            )}
          </div>

          {/* User metadata table */}
          <div className="w-full space-y-3.5 text-left border-t border-border/40 pt-5 mt-2">
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-0.5 flex items-center gap-1">
                <Mail className="size-3" /> Correo Institucional
              </span>
              <span className="text-xs font-semibold font-mono text-foreground truncate" title={user.email}>
                {user.email}
              </span>
            </div>

            <div className="flex flex-col min-w-0">
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-0.5 flex items-center gap-1">
                <Calendar className="size-3" /> Miembro desde
              </span>
              <span className="text-xs font-semibold text-foreground">
                {user.created_at ? new Date(user.created_at).toLocaleDateString("es-EC", {
                  year: "numeric",
                  month: "long",
                  day: "numeric"
                }) : "No disponible"}
              </span>
            </div>
          </div>
        </div>

        {/* ── Right Column: Form Fields ── */}
        <div className="md:col-span-8 sm:px-6 py-4">
          <div className="mb-8">
            <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <User className="size-5 text-primary" /> Información de Perfil
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Personaliza tu identidad en la plataforma académica.
            </p>
          </div>

          {/* Alert messages */}
          {successMsg && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-emerald-600 dark:text-emerald-400 animate-slide-in">
              <CheckCircle2 className="size-5 shrink-0 mt-0.5" />
              <div className="text-xs font-medium">{successMsg}</div>
            </div>
          )}

          {errorMsg && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 p-4 text-red-600 dark:text-red-400 animate-shake">
              <AlertCircle className="size-5 shrink-0 mt-0.5" />
              <div className="text-xs font-medium">{errorMsg}</div>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-6">
            {/* General section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  Nombre Completo
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/60" />
                  <input
                    type="text"
                    required
                    value={nombreCompleto}
                    onChange={(e) => setNombreCompleto(e.target.value)}
                    placeholder="Ej. Mateo Sebastian Oviedo Trujillo"
                    className="w-full rounded-xl border border-border/80 bg-background/50 pl-10 pr-4 py-2.5 text-xs text-foreground placeholder-muted-foreground/50 transition-all duration-200 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 dark:focus:ring-primary/20"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  Apodo / Nickname
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-muted-foreground/60">@</span>
                  <input
                    type="text"
                    required
                    value={apodo}
                    onChange={(e) => setApodo(e.target.value)}
                    placeholder="Ej. Most"
                    className="w-full rounded-xl border border-border/80 bg-background/50 pl-8 pr-4 py-2.5 text-xs font-mono text-foreground placeholder-muted-foreground/50 transition-all duration-200 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 dark:focus:ring-primary/20"
                  />
                </div>
              </div>
            </div>

            {/* Locked fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-muted/10 border-0 rounded-none p-2 select-none border-y border-border/20 my-2">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 flex items-center gap-1">
                  <Lock className="size-3" /> Correo Institucional
                </span>
                <span className="text-xs font-semibold font-mono text-muted-foreground/90 truncate block">
                  {user.email}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 flex items-center gap-1">
                  <Shield className="size-3" /> Rol en el Sistema
                </span>
                <span className={cn(
                  "text-xs font-bold uppercase block tracking-wider",
                  isAdmin ? "text-primary" : "text-emerald-600 dark:text-emerald-400"
                )}>
                  {isAdmin ? "Administrador" : "Estudiante"}
                </span>
              </div>
            </div>

            {/* Biography */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Biografía
                </label>
                <span className={cn(
                  "text-[10px] font-mono font-medium",
                  bioLength > bioLimit ? "text-primary font-bold" : "text-muted-foreground"
                )}>
                  {bioLength}/{bioLimit}
                </span>
              </div>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value.slice(0, bioLimit))}
                rows={3}
                placeholder="Cuéntanos un poco sobre ti o tus materias..."
                className="w-full rounded-xl border border-border/80 bg-background/50 px-4 py-2.5 text-xs text-foreground placeholder-muted-foreground/50 transition-all duration-200 outline-none resize-none focus:border-primary focus:ring-2 focus:ring-primary/10 dark:focus:ring-primary/20"
              />
              {/* Custom micro bio progress bar */}
              <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                <div
                  style={{ width: `${Math.min((bioLength / bioLimit) * 100, 100)}%` }}
                  className={cn(
                    "h-full rounded-full transition-all duration-300",
                    bioLength > bioLimit - 20 ? "bg-primary" : "bg-neutral-600 dark:bg-neutral-400"
                  )}
                />
              </div>
            </div>

            {/* Social media links */}
            <div className="space-y-4 pt-2 border-t border-border/40">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                  <Globe className="size-4 text-primary" /> Redes Sociales
                </h3>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Agrega tus perfiles para conectar con otros estudiantes.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* GitHub */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                    <GithubIcon className="size-3.5" /> GitHub
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-mono font-medium text-muted-foreground/60">@</span>
                    <input
                      type="text"
                      value={github}
                      onChange={(e) => setGithub(e.target.value)}
                      placeholder="usuario"
                      className="w-full rounded-xl border border-border/80 bg-background/50 pl-8 pr-4 py-2.5 text-xs text-foreground placeholder-muted-foreground/50 transition-all duration-200 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                    />
                  </div>
                </div>

                {/* Instagram */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                    <InstagramIcon className="size-3.5" /> Instagram
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-mono font-medium text-muted-foreground/60">@</span>
                    <input
                      type="text"
                      value={instagram}
                      onChange={(e) => setInstagram(e.target.value)}
                      placeholder="usuario"
                      className="w-full rounded-xl border border-border/80 bg-background/50 pl-8 pr-4 py-2.5 text-xs text-foreground placeholder-muted-foreground/50 transition-all duration-200 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                    />
                  </div>
                </div>

                {/* Twitter / X */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                    <TwitterIcon className="size-3.5" /> Twitter / X
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-mono font-medium text-muted-foreground/60">@</span>
                    <input
                      type="text"
                      value={twitter}
                      onChange={(e) => setTwitter(e.target.value)}
                      placeholder="usuario"
                      className="w-full rounded-xl border border-border/80 bg-background/50 pl-8 pr-4 py-2.5 text-xs text-foreground placeholder-muted-foreground/50 transition-all duration-200 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                    />
                  </div>
                </div>

                {/* Facebook */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                    <FacebookIcon className="size-3.5" /> Facebook
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-mono font-medium text-muted-foreground/60">@</span>
                    <input
                      type="text"
                      value={facebook}
                      onChange={(e) => setFacebook(e.target.value)}
                      placeholder="usuario"
                      className="w-full rounded-xl border border-border/80 bg-background/50 pl-8 pr-4 py-2.5 text-xs text-foreground placeholder-muted-foreground/50 transition-all duration-200 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                    />
                  </div>
                </div>

                {/* LinkedIn */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                    <LinkedinIcon className="size-3.5" /> LinkedIn
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-mono font-medium text-muted-foreground/60">@</span>
                    <input
                      type="text"
                      value={linkedin}
                      onChange={(e) => setLinkedin(e.target.value)}
                      placeholder="usuario"
                      className="w-full rounded-xl border border-border/80 bg-background/50 pl-8 pr-4 py-2.5 text-xs text-foreground placeholder-muted-foreground/50 transition-all duration-200 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                    />
                  </div>
                </div>

                {/* Web / Portfolio */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                    <Globe className="size-3.5" /> Portafolio / Web
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground/60" />
                    <input
                      type="text"
                      value={web}
                      onChange={(e) => setWeb(e.target.value)}
                      placeholder="ejemplo.com"
                      className="w-full rounded-xl border border-border/80 bg-background/50 pl-10 pr-4 py-2.5 text-xs text-foreground placeholder-muted-foreground/50 transition-all duration-200 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-border/40">
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5 mb-4">
                <Lock className="size-4 text-primary" /> Seguridad
              </h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-foreground">Cambiar Contraseña</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Ingresa una nueva contraseña de al menos 6 caracteres.</p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60">
                      <Lock className="size-3.5" />
                    </div>
                    <input
                      type="password"
                      placeholder="Nueva contraseña"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full rounded-xl border border-border/80 bg-background/50 pl-10 pr-4 py-2.5 text-xs text-foreground placeholder-muted-foreground/50 transition-all duration-200 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                    />
                  </div>
                  <Button 
                    type="button"
                    onClick={handleChangePassword}
                    disabled={isChangingPassword || !newPassword || newPassword.length < 6}
                    className="shrink-0 h-[38px] rounded-xl bg-foreground text-background hover:bg-foreground/90 transition-all duration-200"
                  >
                    {isChangingPassword ? <Loader2 className="size-3.5 animate-spin mr-2" /> : <Lock className="size-3.5 mr-2" />}
                    <span className="text-xs font-semibold">Actualizar</span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-4 border-t border-border/40 flex justify-end">
              <Button
                type="submit"
                disabled={saving}
                className="h-10 px-5 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all duration-200 flex items-center gap-2 shadow-md shadow-primary/10 hover:shadow-primary/20 scale-100 hover:scale-[1.01] active:scale-95"
              >
                {saving ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>Guardando...</span>
                  </>
                ) : (
                  <>
                    <Save className="size-4" />
                    <span>Guardar Cambios</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>

      <ImageOptimizerModal
        isOpen={showOptimizer}
        file={fileToOptimize}
        onClose={() => {
          setShowOptimizer(false);
          setFileToOptimize(null);
        }}
        onUpload={handleOptimizedUpload}
        title="Optimizar Foto de Perfil"
        description="Ajusta la foto de perfil. Se limitará a una resolución óptima y formato WebP para cargar rápidamente."
        maxWidth={400}
        maxHeight={400}
      />
    </div>
  );
}
