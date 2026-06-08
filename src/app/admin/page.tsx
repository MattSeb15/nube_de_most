"use client";

import { getStorage, ref as storageRef, uploadBytes, getDownloadURL, listAll, getMetadata } from "firebase/storage";
import { initializeApp, getApps } from "firebase/app";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { cn, formatPeriodo } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";
import { EmptyState } from "@/components/ui/empty-state";
import { AdminApuntesPanel } from "@/components/admin/AdminApuntesPanel";
import { Button } from "@/components/ui/button";
import { MateriaIcon } from "@/components/ui/materia-icon";
import {
  Shield,
  Users,
  BookOpen,
  MessageSquare,
  Lock,
  Unlock,
  Trash2,
  RefreshCw,
  Search,
  Mail,
  UserCheck,
  UserX,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Settings,
  Plus,
  Edit2,
  Save,
  X,
  Calendar,
  Globe,
  Folder,
  File as FileIcon,
  HardDrive,
  Database,
  Image as ImageIcon,
  FileText,
  FileArchive,
  Film,
  Music,
  ChevronRight,
  Home,
} from "lucide-react";

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

function SunIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("size-4", className)}
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </svg>
  );
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("size-4", className)}
    >
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  );
}

interface RedSocial {
  plataforma: string;
  usuario: string;
  url: string;
  icono: string;
}

interface FileData {
  name: string;
  fullPath: string;
  size: number;
  contentType: string;
  timeCreated: string;
  updated: string;
  isFolder: boolean;
}

function AdminDashboardContent() {
  const router = useRouter();
  const supabase = createClient();

  // Firebase Storage init
  const firebaseConfig = {
    storageBucket: "la-nube-de-most.firebasestorage.app",
  };
  const firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  const storage = getStorage(firebaseApp);

  // Datetime helper
  function toDatetimeLocalValue(isoString: string | null | undefined): string {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return '';
      return d.toISOString().slice(0, 16);
    } catch { return ''; }
  }

  // Auth States
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Active section tab using URL
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const activeTab = (tabParam as "dashboard" | "students" | "notes" | "activities" | "sobremi" | "comments" | "nube" | "roadmap") || "dashboard";

  function handleTabChange(tab: string) {
    setEditingItem(null);
    router.push(`?tab=${tab}`);
  }

  // Live Data States
  const [loadingData, setLoadingData] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  
  const [roadmapFeatures, setRoadmapFeatures] = useState<any[]>([]);
  const [searchRoadmap, setSearchRoadmap] = useState("");
  
  // Maps to convert UUIDs to readable names in lists
  const [materiaMap, setMateriaMap] = useState<Record<string, string>>({});
  const [semestreMap, setSemestreMap] = useState<Record<string, string>>({});
  const [profesorMap, setProfesorMap] = useState<Record<string, string>>({});
  
  // List states to populate dropdowns in note/activity creations
  const [semestresList, setSemestresList] = useState<any[]>([]);
  const [materiasList, setMateriasList] = useState<any[]>([]);
  const [profesoresList, setProfesoresList] = useState<any[]>([]);

  // Sub-tab navigation and type check states for CRUD objects
  const [notesSubTab, setNotesSubTab] = useState<"notes" | "materias" | "semestres" | "profesores">("notes");
  const [editingItemType, setEditingItemType] = useState<"note" | "activity" | "materia" | "semestre" | "profesor" | null>(null);

  // Search states
  const [searchStudent, setSearchStudent] = useState("");
  const [searchNote, setSearchNote] = useState("");
  const [searchActivity, setSearchActivity] = useState("");
  const [searchComment, setSearchComment] = useState("");
  const [searchMateria, setSearchMateria] = useState("");
  const [searchSemestre, setSearchSemestre] = useState("");
  const [searchProfesor, setSearchProfesor] = useState("");

  // Action states (creating/updating)
  const [saving, setSaving] = useState(false);
  const [pendingActionId, setPendingActionId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [uploading, setUploading] = useState(false);
  const [carpetasDestino, setCarpetasDestino] = useState<any[]>([]);

  // Editor states
  const [editingItem, setEditingItem] = useState<any | null>(null);
  
  // "Sobre mí" Editor state
  const [sobreMiId, setSobreMiId] = useState("");
  const [sobreMiName, setSobreMiName] = useState("");
  const [sobreMiNickname, setSobreMiNickname] = useState("");
  const [sobreMiBio, setSobreMiBio] = useState("");
  const [sobreMiGithub, setSobreMiGithub] = useState("");
  const [sobreMiInstagram, setSobreMiInstagram] = useState("");
  const [sobreMiTwitter, setSobreMiTwitter] = useState("");
  const [sobreMiWeb, setSobreMiWeb] = useState("");
  const [sobreMiProyectoGithub, setSobreMiProyectoGithub] = useState("");

  // Theme State
  const [isDark, setIsDark] = useState(false);

  // Nube (Storage) States
  const [currentPath, setCurrentPath] = useState<string>("");
  const [nubeFiles, setNubeFiles] = useState<FileData[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [totalBucketSize, setTotalBucketSize] = useState<number>(0);
  const [totalFilesCount, setTotalFilesCount] = useState<number>(0);
  const [calculatingSize, setCalculatingSize] = useState(false);

  // Nube logic
  useEffect(() => {
    if (!authorized) return;
    loadDirectory(currentPath);
  }, [currentPath, authorized]);

  useEffect(() => {
    if (!authorized) return;
    calculateGlobalStats();
  }, [authorized]);

  async function loadDirectory(path: string) {
    setLoadingFiles(true);
    try {
      const listRef = storageRef(storage, path);
      const res = await listAll(listRef);
      
      const folderPromises = res.prefixes.map(async (folder) => ({
        name: folder.name,
        fullPath: folder.fullPath,
        size: 0,
        contentType: "folder",
        timeCreated: "",
        updated: "",
        isFolder: true,
      }));

      const filePromises = res.items.map(async (item) => {
        const meta = await getMetadata(item);
        return {
          name: item.name,
          fullPath: item.fullPath,
          size: meta.size,
          contentType: meta.contentType || "unknown",
          timeCreated: meta.timeCreated,
          updated: meta.updated,
          isFolder: false,
        };
      });

      const folders = await Promise.all(folderPromises);
      const items = await Promise.all(filePromises);

      setNubeFiles([...folders, ...items]);
    } catch (error) {
      console.error("Error loading directory", error);
    } finally {
      setLoadingFiles(false);
    }
  }

  async function calculateGlobalStats() {
    setCalculatingSize(true);
    let totalSize = 0;
    let fileCount = 0;

    async function processDirectory(path: string) {
      const listRef = storageRef(storage, path);
      try {
        const res = await listAll(listRef);
        for (const item of res.items) {
          const meta = await getMetadata(item);
          totalSize += meta.size;
          fileCount++;
        }
        for (const folder of res.prefixes) {
          await processDirectory(folder.fullPath);
        }
      } catch (error) {
        console.error("Error processing directory for stats", path, error);
      }
    }

    await processDirectory("");
    setTotalBucketSize(totalSize);
    setTotalFilesCount(fileCount);
    setCalculatingSize(false);
  }

  function formatBytes(bytes: number, decimals = 2) {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  }

  function getFileIcon(contentType: string) {
    if (contentType.includes("image")) return <ImageIcon className="size-5 text-blue-500" />;
    if (contentType.includes("video")) return <Film className="size-5 text-purple-500" />;
    if (contentType.includes("audio")) return <Music className="size-5 text-yellow-500" />;
    if (contentType.includes("pdf") || contentType.includes("document")) return <FileText className="size-5 text-red-500" />;
    if (contentType.includes("zip") || contentType.includes("tar") || contentType.includes("rar")) return <FileArchive className="size-5 text-orange-500" />;
    return <FileIcon className="size-5 text-neutral-400" />;
  }

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggleTheme() {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch (_) {}
  }

  // 1. Authorization check on mount
  useEffect(() => {
    async function checkAdminAuth() {
      try {
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !authUser) {
          router.push("/login");
          return;
        }

        setCurrentUser(authUser);

        const { data: profile, error: profileError } = await supabase
          .from("perfiles")
          .select("rol")
          .eq("id", authUser.id)
          .single();

        if (!profileError && profile && profile.rol === "admin") {
          setAuthorized(true);
          loadAllData();
        } else {
          router.push("/");
        }
      } catch (err) {
        console.error(err);
        router.push("/");
      } finally {
        setLoadingAuth(false);
      }
    }

    checkAdminAuth();
  }, [supabase, router]);

  // 2. Fetch all databases dynamically
  async function loadAllData() {
    setLoadingData(true);
    setErrorMsg("");
    try {
      const { data: semestresData } = await supabase.from("semestres").select("*");
      const { data: materiasData } = await supabase.from("materias").select("*");
      const { data: profesoresData } = await supabase.from("profesores").select("*").order("nombre", { ascending: true });

      setSemestresList(semestresData || []);
      setMateriasList(materiasData || []);
      setProfesoresList(profesoresData || []);

      const sMap: Record<string, string> = {};
      semestresData?.forEach(s => sMap[s.id] = s.nombre);
      setSemestreMap(sMap);

      const mMap: Record<string, string> = {};
      materiasData?.forEach(m => mMap[m.id] = m.nombre);
      setMateriaMap(mMap);

      const pMap: Record<string, string> = {};
      profesoresData?.forEach(p => pMap[p.id] = p.nombre);
      setProfesorMap(pMap);

      const { data: profilesData } = await supabase
        .from("perfiles")
        .select("*")
        .order("nombre_completo", { ascending: true });
      setStudents(profilesData || []);

      setNotes([]);

      const { data: activitiesData } = await supabase
        .from("actividades")
        .select("*")
        .order("fecha_entrega", { ascending: true });
      setActivities(activitiesData || []);

      const { data: commentsData } = await supabase
        .from("comentarios")
        .select("*")
        .order("fecha", { ascending: false });
      setComments(commentsData || []);

      const { data: roadmapData } = await supabase
        .from("roadmap_features")
        .select("*")
        .order("created_at", { ascending: true });
      setRoadmapFeatures(roadmapData || []);

      const { data: profileMost } = await supabase
        .from("perfiles")
        .select("*")
        .eq("rol", "admin")
        .single();

      if (profileMost) {
        setSobreMiId(profileMost.id);
        setSobreMiName(profileMost.nombre_completo || "");
        setSobreMiNickname(profileMost.apodo || "");
        setSobreMiBio(profileMost.bio || "");

        const redes: RedSocial[] = profileMost.redes || [];
        setSobreMiGithub("");
        setSobreMiInstagram("");
        setSobreMiTwitter("");
        setSobreMiWeb("");
        
        redes.forEach(red => {
          const plat = red.plataforma.toLowerCase();
          if (plat === "github proyecto") setSobreMiProyectoGithub(red.url);
          else if (plat.includes("github")) setSobreMiGithub(red.usuario);
          else if (plat.includes("instagram")) setSobreMiInstagram(red.usuario);
          else if (plat.includes("twitter") || plat.includes("x")) setSobreMiTwitter(red.usuario);
          else if (plat.includes("web") || plat.includes("portfolio")) setSobreMiWeb(red.url);
        });
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Error al sincronizar datos relacionales.");
    } finally {
      setLoadingData(false);
    }
  }

  // 3. Promote/Demote Student Role
  async function handleToggleRole(targetId: string, currentRole: string) {
    if (targetId === currentUser?.id) {
      setErrorMsg("No puedes revocar tus propios privilegios por seguridad.");
      return;
    }

    setPendingActionId(targetId);
    setSuccessMsg("");
    setErrorMsg("");

    const newRole = currentRole === "admin" ? "estudiante" : "admin";

    try {
      const { error } = await supabase
        .from("perfiles")
        .update({ rol: newRole })
        .eq("id", targetId);

      if (error) throw error;

      setStudents(prev =>
        prev.map(s => s.id === targetId ? { ...s, rol: newRole } : s)
      );

      setSuccessMsg(`Usuario ${newRole === "admin" ? "ascendido a Admin" : "degradado a Estudiante"} con éxito.`);
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || "Error al actualizar rol.");
    } finally {
      setPendingActionId(null);
    }
  }

  // 4. Lock/Unlock Note
  async function handleToggleLockNote(noteId: string, currentStatus: boolean) {
    setPendingActionId(noteId);
    setSuccessMsg("");
    setErrorMsg("");

    const newStatus = !currentStatus;

    try {
      const { error } = await supabase
        .from("apuntes")
        .update({ bloqueado: newStatus })
        .eq("id", noteId);

      if (error) throw error;

      setNotes(prev =>
        prev.map(n => n.id === noteId ? { ...n, bloqueado: newStatus } : n)
      );

      setSuccessMsg(`Apunte ${newStatus ? "bloqueado" : "desbloqueado"} con éxito.`);
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || "Error al moderar visibilidad.");
    } finally {
      setPendingActionId(null);
    }
  }

  // 5. Delete Comment
  async function handleDeleteComment(commentId: string) {
    if (!confirm("¿Deseas eliminar este comentario de la base de datos de manera definitiva?")) return;

    setPendingActionId(commentId);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const { error } = await supabase
        .from("comentarios")
        .delete()
        .eq("id", commentId);

      if (error) throw error;

      setComments(prev => prev.filter(c => c.id !== commentId));
      setSuccessMsg("Comentario eliminado correctamente.");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || "Error al borrar comentario.");
    } finally {
      setPendingActionId(null);
    }
  }

  // 6. Save "Sobre mí" Mateo Profile
  async function handleSaveSobreMi(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg("");
    setErrorMsg("");

    const newRedes: RedSocial[] = [];
    if (sobreMiProyectoGithub.trim()) {
      newRedes.push({
        plataforma: "GitHub Proyecto",
        usuario: "Proyecto",
        url: sobreMiProyectoGithub.trim(),
        icono: "github",
      });
    }
    if (sobreMiGithub.trim()) {
      newRedes.push({
        plataforma: "GitHub",
        usuario: sobreMiGithub.trim(),
        url: `https://github.com/${sobreMiGithub.trim().replace("@", "")}`,
        icono: "github",
      });
    }
    if (sobreMiInstagram.trim()) {
      newRedes.push({
        plataforma: "Instagram",
        usuario: sobreMiInstagram.trim(),
        url: `https://instagram.com/${sobreMiInstagram.trim().replace("@", "")}`,
        icono: "instagram",
      });
    }
    if (sobreMiTwitter.trim()) {
      newRedes.push({
        plataforma: "Twitter / X",
        usuario: sobreMiTwitter.trim(),
        url: `https://x.com/${sobreMiTwitter.trim().replace("@", "")}`,
        icono: "twitter",
      });
    }
    if (sobreMiWeb.trim()) {
      let webUrl = sobreMiWeb.trim();
      if (!/^https?:\/\//i.test(webUrl)) webUrl = `https://${webUrl}`;
      newRedes.push({
        plataforma: "Web",
        usuario: sobreMiWeb.trim().replace(/^https?:\/\/(www\.)?/i, ""),
        url: webUrl,
        icono: "globe",
      });
    }

    try {
      const { error } = await supabase
        .from("perfiles")
        .update({
          nombre_completo: sobreMiName.trim(),
          apodo: sobreMiNickname.trim(),
          bio: sobreMiBio.trim(),
          redes: newRedes,
        })
        .eq("id", sobreMiId);

      if (error) throw error;

      setSuccessMsg("¡El perfil 'Sobre mí' de Mateo se ha actualizado con éxito!");
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || "Error al actualizar 'Sobre mí'.");
    } finally {
      setSaving(false);
    }
  }

  // 7. Save Note Changes
  async function handleSaveNote(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg("");
    setErrorMsg("");

    const parsedTags = typeof editingItem.tags === "string" 
      ? editingItem.tags.split(",").map((t: string) => t.trim()).filter(Boolean)
      : editingItem.tags;

    try {
      if (editingItem.isNew) {
        const { data, error } = await supabase
          .from("apuntes")
          .insert({
            titulo: editingItem.titulo,
            slug: editingItem.slug,
            contenido: editingItem.contenido,
            autor: editingItem.autor,
            vistas: Number(editingItem.vistas || 0),
            tags: parsedTags || [],
            materia_id: editingItem.materia_id,
            semestre_id: editingItem.semestre_id,
            bloqueado: false
          })
          .select()
          .single();

        if (error) throw error;

        setNotes(prev => [data, ...prev]);
        setSuccessMsg("¡Apunte académico creado con éxito!");
      } else {
        const { data, error } = await supabase
          .from("apuntes")
          .update({
            titulo: editingItem.titulo,
            slug: editingItem.slug,
            contenido: editingItem.contenido,
            autor: editingItem.autor,
            vistas: Number(editingItem.vistas),
            tags: parsedTags,
            materia_id: editingItem.materia_id,
            semestre_id: editingItem.semestre_id
          })
          .eq("id", editingItem.id)
          .select()
          .single();

        if (error) throw error;

        setNotes(prev => prev.map(n => n.id === editingItem.id ? data : n));
        setSuccessMsg("Apunte académico guardado con éxito.");
      }

      setEditingItem(null);
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || "Error al procesar apunte.");
    } finally {
      setSaving(false);
    }
  }

  // 8. Save Activity Changes
  async function handleSaveActivity(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      if (editingItem.isNew) {
        const { data, error } = await supabase
          .from("actividades")
          .insert({
            nombre: editingItem.nombre,
            slug: editingItem.slug,
            descripcion_oficial: editingItem.descripcion_oficial,
            tips_most: editingItem.tips_most,
            estado: editingItem.estado,
            fecha_inicio: editingItem.fecha_inicio || new Date().toISOString(),
            fecha_entrega: editingItem.fecha_entrega,
            materia_id: editingItem.materia_id,
            visibilidad_archivo: editingItem.visibilidad_archivo || 'completa',
            fecha_desbloqueo_visibilidad: editingItem.fecha_desbloqueo_visibilidad || null,
            archivo_resolucion_url: editingItem.archivo_resolucion_url || null,
            archivo_resolucion_nombre: editingItem.archivo_resolucion_nombre || null,
            destino_semestre_id: editingItem.destino_semestre_id || null,
            destino_materia_id: editingItem.destino_materia_id || null,
            destino_carpeta_id: editingItem.destino_carpeta_id || null,
            destino_nueva_carpeta: editingItem.destino_nueva_carpeta || null,
            colaborativa: editingItem.colaborativa ?? true,
          })
          .select()
          .single();

        if (error) throw error;

        setActivities(prev => [data, ...prev]);
        setSuccessMsg("¡Actividad académica creada con éxito!");
      } else {
        const { data, error } = await supabase
          .from("actividades")
          .update({
            nombre: editingItem.nombre,
            slug: editingItem.slug,
            descripcion_oficial: editingItem.descripcion_oficial,
            tips_most: editingItem.tips_most,
            estado: editingItem.estado,
            fecha_inicio: editingItem.fecha_inicio || new Date().toISOString(),
            fecha_entrega: editingItem.fecha_entrega,
            materia_id: editingItem.materia_id,
            visibilidad_archivo: editingItem.visibilidad_archivo || 'completa',
            fecha_desbloqueo_visibilidad: editingItem.fecha_desbloqueo_visibilidad || null,
            archivo_resolucion_url: editingItem.archivo_resolucion_url || null,
            archivo_resolucion_nombre: editingItem.archivo_resolucion_nombre || null,
            destino_semestre_id: editingItem.destino_semestre_id || null,
            destino_materia_id: editingItem.destino_materia_id || null,
            destino_carpeta_id: editingItem.destino_carpeta_id || null,
            destino_nueva_carpeta: editingItem.destino_nueva_carpeta || null,
            colaborativa: editingItem.colaborativa ?? true,
          })
          .eq("id", editingItem.id)
          .select()
          .single();

        if (error) throw error;

        setActivities(prev => prev.map(act => act.id === editingItem.id ? data : act));
        setSuccessMsg("Actividad académica guardada con éxito.");
      }

      setEditingItem(null);
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || "Error al procesar actividad.");
    } finally {
      setSaving(false);
    }
  }

  // 9. Save Semestre Changes
  async function handleSaveSemestre(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      if (editingItem.isNew) {
        const { data, error } = await supabase
          .from("semestres")
          .insert({
            nombre: editingItem.nombre,
            slug: editingItem.slug,
            activo: editingItem.activo ?? true,
            fecha_inicio: editingItem.fecha_inicio || null,
            fecha_fin: editingItem.fecha_fin || null
          })
          .select()
          .single();

        if (error) throw error;

        setSemestresList(prev => [data, ...prev]);
        setSemestreMap(prev => ({ ...prev, [data.id]: data.nombre }));
        setSuccessMsg("¡Semestre creado con éxito!");
      } else {
        const { data, error } = await supabase
          .from("semestres")
          .update({
            nombre: editingItem.nombre,
            slug: editingItem.slug,
            activo: editingItem.activo,
            fecha_inicio: editingItem.fecha_inicio || null,
            fecha_fin: editingItem.fecha_fin || null
          })
          .eq("id", editingItem.id)
          .select()
          .single();

        if (error) throw error;

        setSemestresList(prev => prev.map(s => s.id === editingItem.id ? data : s));
        setSemestreMap(prev => ({ ...prev, [data.id]: data.nombre }));
        setSuccessMsg("Semestre guardado con éxito.");
      }

      setEditingItem(null);
      setEditingItemType(null);
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || "Error al guardar semestre.");
    } finally {
      setSaving(false);
    }
  }

  // 10. Save Materia Changes
  async function handleSaveMateria(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      if (editingItem.isNew) {
        const { data, error } = await supabase
          .from("materias")
          .insert({
            nombre: editingItem.nombre,
            slug: editingItem.slug,
            codigo: editingItem.codigo,
            icono: editingItem.icono || "book",
            descripcion: editingItem.descripcion || "",
            color: editingItem.color || "#ef4444",
            semestre_id: editingItem.semestre_id,
            profesor_id: editingItem.profesor_id || null
          })
          .select()
          .single();

        if (error) throw error;

        setMateriasList(prev => [data, ...prev]);
        setMateriaMap(prev => ({ ...prev, [data.id]: data.nombre }));
        setSuccessMsg("¡Materia académica creada con éxito!");
      } else {
        const { data, error } = await supabase
          .from("materias")
          .update({
            nombre: editingItem.nombre,
            slug: editingItem.slug,
            codigo: editingItem.codigo,
            icono: editingItem.icono,
            descripcion: editingItem.descripcion,
            color: editingItem.color,
            semestre_id: editingItem.semestre_id,
            profesor_id: editingItem.profesor_id || null
          })
          .eq("id", editingItem.id)
          .select()
          .single();

        if (error) throw error;

        setMateriasList(prev => prev.map(m => m.id === editingItem.id ? data : m));
        setMateriaMap(prev => ({ ...prev, [data.id]: data.nombre }));
        setSuccessMsg("Materia académica guardada con éxito.");
      }

      setEditingItem(null);
      setEditingItemType(null);
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || "Error al guardar materia.");
    } finally {
      setSaving(false);
    }
  }

  // 11. Delete Semestre
  async function handleDeleteSemestre(semestreId: string) {
    if (!confirm("¿Deseas eliminar este semestre definitivamente? Se borrarán en cascada las materias y apuntes asociados.")) return;

    setPendingActionId(semestreId);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const { error } = await supabase
        .from("semestres")
        .delete()
        .eq("id", semestreId);

      if (error) throw error;

      setSemestresList(prev => prev.filter(s => s.id !== semestreId));
      setSuccessMsg("Semestre eliminado correctamente.");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || "Error al borrar semestre.");
    } finally {
      setPendingActionId(null);
    }
  }

  // 12. Delete Materia
  async function handleDeleteMateria(materiaId: string) {
    if (!confirm("¿Deseas eliminar esta materia definitivamente? Se borrarán en cascada los apuntes y actividades asociadas.")) return;

    setPendingActionId(materiaId);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const { error } = await supabase
        .from("materias")
        .delete()
        .eq("id", materiaId);

      if (error) throw error;

      setMateriasList(prev => prev.filter(m => m.id !== materiaId));
      setSuccessMsg("Materia académica eliminada correctamente.");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || "Error al borrar materia.");
    } finally {
      setPendingActionId(null);
    }
  }

  // 13. Save Profesor
  async function handleSaveProfesor(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      if (editingItem.isNew) {
        const { data, error } = await supabase
          .from("profesores")
          .insert({
            nombre: editingItem.nombre,
          })
          .select()
          .single();

        if (error) throw error;

        setProfesoresList(prev => [data, ...prev].sort((a, b) => a.nombre.localeCompare(b.nombre)));
        setProfesorMap(prev => ({ ...prev, [data.id]: data.nombre }));
        setSuccessMsg("¡Profesor añadido con éxito!");
      } else {
        const { data, error } = await supabase
          .from("profesores")
          .update({
            nombre: editingItem.nombre,
          })
          .eq("id", editingItem.id)
          .select()
          .single();

        if (error) throw error;

        setProfesoresList(prev => prev.map(p => p.id === editingItem.id ? data : p).sort((a, b) => a.nombre.localeCompare(b.nombre)));
        setProfesorMap(prev => ({ ...prev, [data.id]: data.nombre }));
        setSuccessMsg("Profesor modificado con éxito.");
      }

      setEditingItem(null);
      setEditingItemType(null);
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || "Error al guardar profesor.");
    } finally {
      setSaving(false);
    }
  }

  // 14. Roadmap Features
  async function handleAddRoadmapFeature(e: React.FormEvent) {
    e.preventDefault();
    if (!editingItem?.titulo?.trim()) return;
    setSaving(true);
    setSuccessMsg("");
    setErrorMsg("");
    try {
      const { data, error } = await supabase
        .from("roadmap_features")
        .insert({ titulo: editingItem.titulo.trim() })
        .select()
        .single();
      if (error) throw error;
      setRoadmapFeatures(prev => [...prev, data]);
      setEditingItem(null);
      setSuccessMsg("Feature añadida.");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || "Error al añadir feature.");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleRoadmapFeature(id: string, currentStatus: boolean) {
    try {
      const { error } = await supabase
        .from("roadmap_features")
        .update({ completada: !currentStatus })
        .eq("id", id);
      if (error) throw error;
      setRoadmapFeatures(prev => prev.map(f => f.id === id ? { ...f, completada: !currentStatus } : f));
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  }

  async function handleDeleteRoadmapFeature(id: string) {
    if (!confirm("¿Deseas eliminar esta feature del roadmap?")) return;
    try {
      const { error } = await supabase.from("roadmap_features").delete().eq("id", id);
      if (error) throw error;
      setRoadmapFeatures(prev => prev.filter(f => f.id !== id));
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  }

  // Helper: Load carpetas destino for a materia
  async function loadCarpetasDestino(materiaId: string) {
    if (!materiaId) { setCarpetasDestino([]); return; }
    const { data } = await supabase
      .from("carpetas_apuntes")
      .select("id, nombre, parent_id")
      .eq("materia_id", materiaId)
      .eq("tipo", "normal")
      .order("nombre", { ascending: true });
    setCarpetasDestino(data || []);
  }

  // Helper: Upload archivo de resolución to Firebase Storage
  async function handleUploadArchivoResolucion(file: File) {
    if (!file || !editingItem) return;
    setUploading(true);
    setErrorMsg("");
    try {
      const slug = editingItem.slug || 'actividad';
      const fileRef = storageRef(storage, `actividades/${slug}/${file.name}`);
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);
      setEditingItem({ ...editingItem, archivo_resolucion_url: url, archivo_resolucion_nombre: file.name });
      setSuccessMsg("Archivo subido exitosamente.");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || "Error al subir archivo.");
    } finally {
      setUploading(false);
    }
  }

  // 14. Delete Profesor
  async function handleDeleteProfesor(profesorId: string) {
    if (!confirm("¿Deseas eliminar este profesor definitivamente? Las materias que lo tengan asignado quedarán sin profesor.")) return;

    setPendingActionId(profesorId);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const { error } = await supabase
        .from("profesores")
        .delete()
        .eq("id", profesorId);

      if (error) throw error;

      setProfesoresList(prev => prev.filter(p => p.id !== profesorId));
      setSuccessMsg("Profesor eliminado correctamente.");
      setTimeout(() => setSuccessMsg(""), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || "Error al borrar profesor.");
    } finally {
      setPendingActionId(null);
    }
  }

  // 13. Standard Logout
  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  // Filter lists
  const filteredStudents = students.filter(
    (s) =>
      s.nombre_completo?.toLowerCase().includes(searchStudent.toLowerCase()) ||
      s.apodo?.toLowerCase().includes(searchStudent.toLowerCase())
  );

  const filteredNotes = notes.filter(
    (n) =>
      n.titulo?.toLowerCase().includes(searchNote.toLowerCase()) ||
      n.autor?.toLowerCase().includes(searchNote.toLowerCase())
  );

  const filteredActivities = activities.filter(
    (a) =>
      a.nombre?.toLowerCase().includes(searchActivity.toLowerCase()) ||
      a.estado?.toLowerCase().includes(searchActivity.toLowerCase())
  );

  const filteredComments = comments.filter(
    (c) =>
      c.autor?.toLowerCase().includes(searchComment.toLowerCase()) ||
      c.contenido?.toLowerCase().includes(searchComment.toLowerCase())
  );

  const filteredMaterias = materiasList.filter(
    (m) =>
      m.nombre?.toLowerCase().includes(searchMateria.toLowerCase()) ||
      m.codigo?.toLowerCase().includes(searchMateria.toLowerCase())
  );

  const filteredSemestres = semestresList.filter(
    (s) =>
      s.nombre?.toLowerCase().includes(searchSemestre.toLowerCase()) ||
      s.fecha_inicio?.includes(searchSemestre) ||
      s.fecha_fin?.includes(searchSemestre)
  );

  const filteredProfesores = profesoresList.filter(
    (p) => p.nombre?.toLowerCase().includes(searchProfesor.toLowerCase())
  );

  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col justify-center items-center">
        <div className="flex items-center gap-3 text-neutral-400 animate-pulse">
          <Loader2 className="size-6 animate-spin text-primary" />
          <span className="font-semibold text-sm">Verificando credenciales de control...</span>
        </div>
      </div>
    );
  }

  if (!authorized) return null;

  return (
    <div className="w-full h-full min-h-screen md:min-h-0 flex flex-col md:flex-row dark:bg-neutral-950 bg-neutral-50 dark:text-neutral-200 text-neutral-800 transition-colors duration-200 md:overflow-hidden">
      
      {/* ─── SIDEBAR (Theme Adaptive Executive Console) ─── */}
      <aside className="w-full md:w-64 dark:bg-neutral-900 bg-white border-b md:border-b-0 md:border-r border-neutral-200 dark:border-neutral-800 flex flex-col justify-between shrink-0 select-none text-neutral-800 dark:text-neutral-200 md:h-full md:overflow-y-auto transition-colors duration-200">
        <div>
          {/* Logo header */}
          <div className="p-6 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 text-neutral-900 dark:text-white hover:opacity-85 transition-opacity">
              <div className="size-6 rounded-md bg-primary flex items-center justify-center">
                <Shield className="size-3.5 text-white" />
              </div>
              <span className="font-bold tracking-tight text-sm">La Nube de Most</span>
            </Link>
          </div>

          {/* Quick status bar */}
          <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/20 flex items-center gap-2.5">
            <div className="size-2 rounded-full bg-primary animate-pulse shrink-0" />
            <div className="flex flex-col min-w-0">
              <span className="text-[9px] uppercase tracking-wider font-extrabold text-neutral-400 dark:text-neutral-500">Administrador</span>
              <span className="text-xs font-semibold font-mono text-neutral-700 dark:text-neutral-300 truncate" title={currentUser?.email}>
                {currentUser?.email}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            <button
              onClick={() => handleTabChange("dashboard")}
              className={cn(
                "w-full flex items-center gap-3 rounded-xl px-4 py-2.5 text-xs font-bold transition-all duration-200 cursor-pointer",
                activeTab === "dashboard"
                  ? "bg-primary text-white shadow-lg shadow-primary/10"
                  : "text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white"
              )}
            >
              <Settings className="size-4" />
              <span>Resumen Global</span>
            </button>

            <button
              onClick={() => handleTabChange("students")}
              className={cn(
                "w-full flex items-center gap-3 rounded-xl px-4 py-2.5 text-xs font-bold transition-all duration-200 cursor-pointer",
                activeTab === "students"
                  ? "bg-primary text-white shadow-lg shadow-primary/10"
                  : "text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white"
              )}
            >
              <Users className="size-4" />
              <span>Estudiantes ({students.length})</span>
            </button>

            <button
              onClick={() => handleTabChange("notes")}
              className={cn(
                "w-full flex items-center gap-3 rounded-xl px-4 py-2.5 text-xs font-bold transition-all duration-200 cursor-pointer",
                activeTab === "notes"
                  ? "bg-primary text-white shadow-lg shadow-primary/10"
                  : "text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white"
              )}
            >
              <BookOpen className="size-4" />
              <span>Apuntes ({notes.length})</span>
            </button>

            <button
              onClick={() => handleTabChange("activities")}
              className={cn(
                "w-full flex items-center gap-3 rounded-xl px-4 py-2.5 text-xs font-bold transition-all duration-200 cursor-pointer",
                activeTab === "activities"
                  ? "bg-primary text-white shadow-lg shadow-primary/10"
                  : "text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white"
              )}
            >
              <Calendar className="size-4" />
              <span>Actividades ({activities.length})</span>
            </button>

            <button
              onClick={() => handleTabChange("sobremi")}
              className={cn(
                "w-full flex items-center gap-3 rounded-xl px-4 py-2.5 text-xs font-bold transition-all duration-200 cursor-pointer",
                activeTab === "sobremi"
                  ? "bg-primary text-white shadow-lg shadow-primary/10"
                  : "text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white"
              )}
            >
              <Globe className="size-4" />
              <span>Sobre mí Editor</span>
            </button>

            <button
              onClick={() => handleTabChange("roadmap")}
              className={cn(
                "w-full flex items-center gap-3 rounded-xl px-4 py-2.5 text-xs font-bold transition-all duration-200 cursor-pointer",
                activeTab === "roadmap"
                  ? "bg-primary text-white shadow-lg shadow-primary/10"
                  : "text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white"
              )}
            >
              <CheckCircle2 className="size-4" />
              <span>Roadmap Features</span>
            </button>

            <button
              onClick={() => handleTabChange("nube")}
              className={cn(
                "w-full flex items-center gap-3 rounded-xl px-4 py-2.5 text-xs font-bold transition-all duration-200 cursor-pointer",
                activeTab === "nube"
                  ? "bg-primary text-white shadow-lg shadow-primary/10"
                  : "text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white"
              )}
            >
              <Database className="size-4" />
              <span>La Nube</span>
            </button>

            <button
              onClick={() => handleTabChange("comments")}
              className={cn(
                "w-full flex items-center gap-3 rounded-xl px-4 py-2.5 text-xs font-bold transition-all duration-200 cursor-pointer",
                activeTab === "comments"
                  ? "bg-primary text-white shadow-lg shadow-primary/10"
                  : "text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white"
              )}
            >
              <MessageSquare className="size-4" />
              <span>Comentarios ({comments.length})</span>
            </button>
          </nav>
        </div>

        {/* Footer Sidebar with Logout */}
        <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 rounded-xl px-4 py-2.5 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-300 transition-all duration-200 cursor-pointer"
          >
            <Trash2 className="size-4" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* ─── MAIN WORKSPACE (Theme Adaptive) ─── */}
      <main className="flex-1 flex flex-col min-w-0 dark:bg-neutral-950 bg-neutral-50 transition-colors duration-200 md:h-full md:overflow-hidden">
        {/* Workspace Toolbar Header */}
        <header className="px-8 py-5 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/10 flex justify-between items-center select-none shrink-0">
          <div>
            <h2 className="text-base font-extrabold text-neutral-900 dark:text-white flex items-center gap-2">
              {activeTab === "dashboard" && "Resumen Global"}
              {activeTab === "students" && "Gestión de Estudiantes"}
              {activeTab === "notes" && "Apuntes, Materias y Semestres"}
              {activeTab === "activities" && "Actividades Oficiales"}
              {activeTab === "sobremi" && "Editor del Perfil 'Sobre Mí'"}
              {activeTab === "nube" && "La Nube (Storage)"}
              {activeTab === "comments" && "Moderación de Comentarios"}
            </h2>
            <p className="text-[10px] text-neutral-500 mt-0.5">
              Consola administrativa • Sincronización real con Supabase
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Theme Toggle Button */}
            <Button
              variant="ghost"
              size="icon"
              aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
              onClick={toggleTheme}
              className="text-muted-foreground hover:text-foreground rounded-xl"
            >
              {isDark ? <SunIcon /> : <MoonIcon />}
            </Button>

            <Button
              onClick={loadAllData}
              disabled={loadingData}
              variant="outline"
              className="h-8.5 rounded-lg border-border hover:bg-muted text-foreground font-semibold text-[11px] flex items-center gap-1.5 cursor-pointer"
            >
              {loadingData ? (
                <Loader2 className="size-3 animate-spin" />
              ) : (
                <RefreshCw className="size-3" />
              )}
              <span>Actualizar</span>
            </Button>
          </div>
        </header>

        {/* Workspace Container */}
        <div className="p-8 flex-1 md:overflow-y-auto">
          {/* Action alerts feedback */}
          {successMsg && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-emerald-600 dark:text-emerald-400 animate-slide-in">
              <CheckCircle2 className="size-4 shrink-0 mt-0.5" />
              <div className="text-xs font-semibold">{successMsg}</div>
            </div>
          )}

          {errorMsg && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 p-4 text-red-600 dark:text-red-400 animate-shake">
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              <div className="text-xs font-semibold">{errorMsg}</div>
            </div>
          )}

          {/* ── VIEW ROUTER ── */}
          {loadingData && students.length === 0 ? (
            <div className="py-20 flex flex-col justify-center items-center text-neutral-400 gap-3">
              <Loader2 className="size-6 animate-spin text-primary" />
              <span className="text-xs font-semibold animate-pulse">Sincronizando información académica...</span>
            </div>
          ) : (
            <>
              {/* ── 1. DASHBOARD VIEW ── */}
              {activeTab === "dashboard" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-scale-in">
                  <div className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800/80 bg-white dark:bg-neutral-900/20 flex items-center justify-between shadow-sm">
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">Estudiantes</span>
                      <h3 className="text-2xl font-bold font-mono tracking-tight text-neutral-900 dark:text-white">{students.length}</h3>
                    </div>
                    <div className="size-9 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                      <Users className="size-4.5" />
                    </div>
                  </div>

                  <div className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800/80 bg-white dark:bg-neutral-900/20 flex items-center justify-between shadow-sm">
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">Admins</span>
                      <h3 className="text-2xl font-bold font-mono tracking-tight text-neutral-900 dark:text-white">
                        {students.filter(s => s.rol === "admin").length}
                      </h3>
                    </div>
                    <div className="size-9 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                      <Shield className="size-4.5" />
                    </div>
                  </div>

                  <div className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800/80 bg-white dark:bg-neutral-900/20 flex items-center justify-between shadow-sm">
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">Apuntes</span>
                      <h3 className="text-2xl font-bold font-mono tracking-tight text-neutral-900 dark:text-white">{notes.length}</h3>
                    </div>
                    <div className="size-9 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                      <BookOpen className="size-4.5" />
                    </div>
                  </div>

                  <div className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800/80 bg-white dark:bg-neutral-900/20 flex items-center justify-between shadow-sm">
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">Moderados / Bloqueados</span>
                      <h3 className="text-2xl font-bold font-mono tracking-tight text-neutral-900 dark:text-white">
                        {notes.filter(n => n.bloqueado).length}
                      </h3>
                    </div>
                    <div className="size-9 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                      <Lock className="size-4.5" />
                    </div>
                  </div>
                </div>
              )}

              {/* ── 2. STUDENTS VIEW ── */}
              {activeTab === "students" && (
                <div className="space-y-4 animate-scale-in">
                  <div className="relative max-w-md">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-neutral-500" />
                    <input
                      type="text"
                      value={searchStudent}
                      onChange={(e) => setSearchStudent(e.target.value)}
                      placeholder="Buscar estudiante..."
                      className="w-full rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-950 pl-10 pr-4 py-2.5 text-xs text-neutral-900 dark:text-white placeholder-neutral-500 transition-all outline-none focus:border-primary"
                    />
                  </div>

                  {filteredStudents.length === 0 ? (
                    <div className="py-12 text-center text-xs text-neutral-500">No se encontraron perfiles.</div>
                  ) : (
                    <div className="overflow-hidden border border-neutral-200 dark:border-neutral-800 rounded-2xl bg-white dark:bg-neutral-900/10 backdrop-blur-md shadow-sm">
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left text-xs">
                          <thead>
                            <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-500 dark:text-neutral-400 font-semibold">
                              <th className="px-5 py-3">Nombre Completo</th>
                              <th className="px-5 py-3">Apodo</th>
                              <th className="px-5 py-3">Rol</th>
                              <th className="px-5 py-3 text-right">Acciones</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800/60 font-medium">
                            {filteredStudents.map((s) => {
                              const isStudentAdmin = s.rol === "admin";
                              const isSelf = s.id === currentUser?.id;
                              const acting = pendingActionId === s.id;

                              return (
                                <tr key={s.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/20 transition-colors">
                                  <td className="px-5 py-3.5">
                                    <div className="flex flex-col min-w-0">
                                      <span className="font-bold text-neutral-900 dark:text-white text-sm truncate">{s.nombre_completo || "Estudiante UTA"}</span>
                                      <span className="text-[9px] font-mono text-neutral-400 dark:text-neutral-500 truncate">{s.id}</span>
                                    </div>
                                  </td>
                                  <td className="px-5 py-3.5 font-mono text-neutral-500 dark:text-neutral-400">@{s.apodo || "sin alias"}</td>
                                  <td className="px-5 py-3.5">
                                    {isStudentAdmin ? (
                                      <span className="inline-flex items-center gap-1 text-[8.5px] font-extrabold uppercase tracking-wider text-primary bg-primary/10 border border-primary/20 rounded-full px-2.5 py-0.5">
                                        Admin
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 text-[8.5px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2.5 py-0.5">
                                        Estudiante
                                      </span>
                                    )}
                                  </td>
                                  <td className="px-5 py-3.5 text-right">
                                    <Button
                                      onClick={() => handleToggleRole(s.id, s.rol)}
                                      disabled={acting || isSelf}
                                      variant="outline"
                                      className={cn(
                                        "h-8 rounded-lg font-bold text-[10px] px-2.5 inline-flex items-center gap-1 cursor-pointer border",
                                        isStudentAdmin 
                                          ? "border-red-500/20 dark:border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-500/5 dark:hover:bg-red-500/10" 
                                          : "border-emerald-500/20 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/5 dark:hover:bg-emerald-500/10"
                                      )}
                                    >
                                      {acting ? (
                                        <Loader2 className="size-3 animate-spin" />
                                      ) : isStudentAdmin ? (
                                        <>
                                          <UserX className="size-3" />
                                          Degradar
                                        </>
                                      ) : (
                                        <>
                                          <UserCheck className="size-3" />
                                          Ascender
                                        </>
                                      )}
                                    </Button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── 3. NOTES CRUD VIEW ── */}
              {activeTab === "notes" && (
                <div className="space-y-6 animate-scale-in">
                  {!editingItem ? (
                    <>
                      {/* Secondary Sub-Tabs Navigation */}
                      <div className="flex border-b border-neutral-200 dark:border-neutral-800 pb-px mb-6 gap-2">
                        <button
                          onClick={() => setNotesSubTab("notes")}
                          className={cn(
                            "px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5",
                            notesSubTab === "notes"
                              ? "border-primary text-neutral-900 dark:text-white"
                              : "border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                          )}
                        >
                          <BookOpen className="size-3.5" />
                          Apuntes ({notes.length})
                        </button>
                        <button
                          onClick={() => setNotesSubTab("materias")}
                          className={cn(
                            "px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5",
                            notesSubTab === "materias"
                              ? "border-primary text-neutral-900 dark:text-white"
                              : "border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                          )}
                        >
                          <Settings className="size-3.5" />
                          Materias ({materiasList.length})
                        </button>
                        <button
                          onClick={() => setNotesSubTab("semestres")}
                          className={cn(
                            "px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5",
                            notesSubTab === "semestres"
                              ? "border-primary text-neutral-900 dark:text-white"
                              : "border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                          )}
                        >
                          <Calendar className="size-3.5" />
                          Semestres ({semestresList.length})
                        </button>
                        <button
                          onClick={() => setNotesSubTab("profesores")}
                          className={cn(
                            "px-4 py-2 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5",
                            notesSubTab === "profesores"
                              ? "border-primary text-neutral-900 dark:text-white"
                              : "border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                          )}
                        >
                          <Users className="size-3.5" />
                          Profesores ({profesoresList.length})
                        </button>
                      </div>

                      {/* SUB-TAB CONTENTS */}
                      {notesSubTab === "notes" && (
                        <div className="bg-white dark:bg-neutral-900/10 rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 p-6">
                          <AdminApuntesPanel />
                        </div>
                      )}

                      {notesSubTab === "materias" && (
                        <>
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="relative max-w-md flex-1">
                              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-neutral-500" />
                              <input
                                type="text"
                                value={searchMateria}
                                onChange={(e) => setSearchMateria(e.target.value)}
                                placeholder="Buscar por nombre o código..."
                                className="w-full rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-950 pl-10 pr-4 py-2.5 text-xs text-neutral-900 dark:text-white placeholder-neutral-500 transition-all outline-none focus:border-primary"
                              />
                            </div>
                            
                            <Button
                              onClick={() => setEditingItem({
                                isNew: true,
                                nombre: "",
                                slug: "",
                                codigo: "",
                                icono: "Book",
                                descripcion: "",
                                color: "#ef4444",
                                semestre_id: semestresList[0]?.id || ""
                              })}
                              className="h-9 px-4 rounded-xl bg-primary text-primary-foreground font-bold text-xs flex items-center gap-2 shadow-md shadow-primary/10 hover:bg-primary/95 cursor-pointer shrink-0"
                            >
                              <Plus className="size-4" />
                              <span>Crear Materia</span>
                            </Button>
                          </div>

                          {filteredMaterias.length === 0 ? (
                            <div className="py-12 text-center text-xs text-neutral-500">No se encontraron materias.</div>
                          ) : (
                            <div className="overflow-hidden border border-neutral-200 dark:border-neutral-800 rounded-2xl bg-white dark:bg-neutral-900/10 backdrop-blur-md shadow-sm">
                              <div className="overflow-x-auto">
                                <table className="w-full border-collapse text-left text-xs">
                                  <thead>
                                    <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-500 dark:text-neutral-400 font-semibold">
                                      <th className="px-5 py-3">Icono / Color</th>
                                      <th className="px-5 py-3">Materia</th>
                                      <th className="px-5 py-3">Código</th>
                                      <th className="px-5 py-3">Semestre Asociado</th>
                                      <th className="px-5 py-3">Profesor</th>
                                      <th className="px-5 py-3 text-right">Acciones</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800/60 font-medium">
                                    {filteredMaterias.map((m) => {
                                      const acting = pendingActionId === m.id;
                                      return (
                                        <tr key={m.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/20 transition-colors">
                                          <td className="px-5 py-3.5">
                                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-100 dark:bg-neutral-800 p-1.5 shadow-sm" style={{ backgroundColor: m.color ? `${m.color}20` : undefined }}>
                                              <MateriaIcon name={m.icono || "Book"} className="size-5" style={{ color: m.color || "currentColor" }} />
                                            </div>
                                          </td>
                                          <td className="px-5 py-3.5">
                                            <div className="flex flex-col min-w-0">
                                              <span className="font-bold text-neutral-900 dark:text-white text-sm truncate">{m.nombre}</span>
                                              <span className="text-[9px] font-mono text-neutral-500 dark:text-neutral-400 truncate" title={m.descripcion}>{m.descripcion ? (m.descripcion.length > 40 ? m.descripcion.substring(0, 40) + "..." : m.descripcion) : "Sin descripción"}</span>
                                            </div>
                                          </td>
                                          <td className="px-5 py-3.5 font-mono text-neutral-700 dark:text-neutral-300">{m.codigo}</td>
                                          <td className="px-5 py-3.5 text-neutral-800 dark:text-neutral-300 text-xs font-medium">
                                            {semestreMap[m.semestre_id] || "Semestre de nivelación"}
                                          </td>
                                          <td className="px-5 py-3.5 text-neutral-800 dark:text-neutral-300 text-xs">
                                            {m.profesor_id && profesorMap[m.profesor_id] ? (
                                              <span className="flex items-center gap-1.5 font-medium text-neutral-700 dark:text-neutral-300">
                                                <UserCheck className="size-3.5 text-primary" />
                                                {profesorMap[m.profesor_id]}
                                              </span>
                                            ) : (
                                              <span className="text-neutral-400 dark:text-neutral-500 italic">No asignado</span>
                                            )}
                                          </td>
                                          <td className="px-5 py-3.5 text-right space-x-2">
                                            <Button
                                              onClick={() => setEditingItem(m)}
                                              variant="outline"
                                              className="h-8 rounded-lg border-border hover:bg-muted text-foreground text-[10px] font-bold px-2.5 inline-flex items-center gap-1 cursor-pointer"
                                            >
                                              <Edit2 className="size-3 text-muted-foreground" />
                                              Editar
                                            </Button>

                                            <Button
                                              onClick={() => handleDeleteMateria(m.id)}
                                              disabled={acting}
                                              variant="outline"
                                              className="h-8 rounded-lg border-red-500/20 dark:border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-500/5 dark:hover:bg-red-500/10 font-bold text-[10px] px-2.5 inline-flex items-center gap-1 cursor-pointer border"
                                            >
                                              {acting ? (
                                                <Loader2 className="size-3 animate-spin" />
                                              ) : (
                                                <>
                                                  <Trash2 className="size-3" />
                                                  Eliminar
                                                </>
                                              )}
                                            </Button>
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}
                        </>
                      )}

                      {notesSubTab === "semestres" && (
                        <>
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="relative max-w-md flex-1">
                              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-neutral-500" />
                              <input
                                type="text"
                                value={searchSemestre}
                                onChange={(e) => setSearchSemestre(e.target.value)}
                                placeholder="Buscar por nombre o periodo..."
                                className="w-full rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-950 pl-10 pr-4 py-2.5 text-xs text-neutral-900 dark:text-white placeholder-neutral-500 transition-all outline-none focus:border-primary"
                              />
                            </div>
                            
                            <Button
                              onClick={() => setEditingItem({
                                isNew: true,
                                nombre: "",
                                slug: "",
                                activo: true,
                                fecha_inicio: null,
                                fecha_fin: null
                              })}
                              className="h-9 px-4 rounded-xl bg-primary text-primary-foreground font-bold text-xs flex items-center gap-2 shadow-md shadow-primary/10 hover:bg-primary/95 cursor-pointer shrink-0"
                            >
                              <Plus className="size-4" />
                              <span>Crear Semestre</span>
                            </Button>
                          </div>

                          {filteredSemestres.length === 0 ? (
                            <div className="py-12 text-center text-xs text-neutral-500">No se encontraron semestres.</div>
                          ) : (
                            <div className="overflow-hidden border border-neutral-200 dark:border-neutral-800 rounded-2xl bg-white dark:bg-neutral-900/10 backdrop-blur-md shadow-sm">
                              <div className="overflow-x-auto">
                                <table className="w-full border-collapse text-left text-xs">
                                  <thead>
                                    <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-500 dark:text-neutral-400 font-semibold">
                                      <th className="px-5 py-3">Semestre</th>
                                      <th className="px-5 py-3">Fechas (Inicio - Fin)</th>
                                      <th className="px-5 py-3">Estado</th>
                                      <th className="px-5 py-3 text-right">Acciones</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800/60 font-medium">
                                    {filteredSemestres.map((s) => {
                                      const acting = pendingActionId === s.id;
                                      return (
                                        <tr key={s.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/20 transition-colors">
                                          <td className="px-5 py-3.5">
                                            <div className="flex flex-col min-w-0">
                                              <span className="font-bold text-neutral-900 dark:text-white text-sm truncate">{s.nombre}</span>
                                              <span className="text-[9px] font-mono text-neutral-500 dark:text-neutral-400 truncate">Slug: {s.slug}</span>
                                            </div>
                                          </td>
                                          <td className="px-5 py-3.5 font-mono text-neutral-700 dark:text-neutral-300">
                                            {formatPeriodo(s.fecha_inicio, s.fecha_fin)}
                                          </td>
                                          <td className="px-5 py-3.5">
                                            {s.activo ? (
                                              <span className="inline-flex items-center gap-1 text-[8.5px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2.5 py-0.5">
                                                Activo
                                              </span>
                                            ) : (
                                              <span className="inline-flex items-center gap-1 text-[8.5px] font-extrabold uppercase tracking-wider text-neutral-500 bg-neutral-500/10 border border-neutral-500/20 rounded-full px-2.5 py-0.5">
                                                Inactivo
                                              </span>
                                            )}
                                          </td>
                                          <td className="px-5 py-3.5 text-right space-x-2">
                                            <Button
                                              onClick={() => setEditingItem(s)}
                                              variant="outline"
                                              className="h-8 rounded-lg border-border hover:bg-muted text-foreground text-[10px] font-bold px-2.5 inline-flex items-center gap-1 cursor-pointer"
                                            >
                                              <Edit2 className="size-3 text-muted-foreground" />
                                              Editar
                                            </Button>

                                            <Button
                                              onClick={() => handleDeleteSemestre(s.id)}
                                              disabled={acting}
                                              variant="outline"
                                              className="h-8 rounded-lg border-red-500/20 dark:border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-500/5 dark:hover:bg-red-500/10 font-bold text-[10px] px-2.5 inline-flex items-center gap-1 cursor-pointer border"
                                            >
                                              {acting ? (
                                                <Loader2 className="size-3 animate-spin" />
                                              ) : (
                                                <>
                                                  <Trash2 className="size-3" />
                                                  Eliminar
                                                </>
                                              )}
                                            </Button>
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}
                        </>
                      )}

                      {notesSubTab === "profesores" && (
                        <>
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="relative max-w-md flex-1">
                              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-neutral-500" />
                              <input
                                type="text"
                                value={searchProfesor}
                                onChange={(e) => setSearchProfesor(e.target.value)}
                                placeholder="Buscar por nombre..."
                                className="w-full rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-950 pl-10 pr-4 py-2.5 text-xs text-neutral-900 dark:text-white placeholder-neutral-500 transition-all outline-none focus:border-primary"
                              />
                            </div>
                            
                            <Button
                              onClick={() => setEditingItem({
                                isNew: true,
                                nombre: ""
                              })}
                              className="h-9 px-4 rounded-xl bg-primary text-primary-foreground font-bold text-xs flex items-center gap-2 shadow-md shadow-primary/10 hover:bg-primary/95 cursor-pointer shrink-0"
                            >
                              <Plus className="size-4" />
                              <span>Crear Profesor</span>
                            </Button>
                          </div>

                          {filteredProfesores.length === 0 ? (
                            <div className="py-12 text-center text-xs text-neutral-500">No se encontraron profesores.</div>
                          ) : (
                            <div className="overflow-hidden border border-neutral-200 dark:border-neutral-800 rounded-2xl bg-white dark:bg-neutral-900/10 backdrop-blur-md shadow-sm">
                              <div className="overflow-x-auto">
                                <table className="w-full border-collapse text-left text-xs">
                                  <thead>
                                    <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-500 dark:text-neutral-400 font-semibold">
                                      <th className="px-5 py-3">Profesor</th>
                                      <th className="px-5 py-3 text-right">Acciones</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800/60 font-medium">
                                    {filteredProfesores.map((p) => {
                                      const acting = pendingActionId === p.id;
                                      return (
                                        <tr key={p.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/20 transition-colors">
                                          <td className="px-5 py-3.5">
                                            <div className="flex flex-col min-w-0">
                                              <span className="font-bold text-neutral-900 dark:text-white text-sm truncate">{p.nombre}</span>
                                              <span className="text-[9px] font-mono text-neutral-500 dark:text-neutral-400 truncate">ID: {p.id}</span>
                                            </div>
                                          </td>
                                          <td className="px-5 py-3.5 text-right space-x-2">
                                            <Button
                                              onClick={() => setEditingItem(p)}
                                              variant="outline"
                                              className="h-8 rounded-lg border-border hover:bg-muted text-foreground text-[10px] font-bold px-2.5 inline-flex items-center gap-1 cursor-pointer"
                                            >
                                              <Edit2 className="size-3 text-muted-foreground" />
                                              Editar
                                            </Button>

                                            <Button
                                              onClick={() => handleDeleteProfesor(p.id)}
                                              disabled={acting}
                                              variant="outline"
                                              className="h-8 rounded-lg border-red-500/20 dark:border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-500/5 dark:hover:bg-red-500/10 font-bold text-[10px] px-2.5 inline-flex items-center gap-1 cursor-pointer border"
                                            >
                                              {acting ? (
                                                <Loader2 className="size-3 animate-spin" />
                                              ) : (
                                                <>
                                                  <Trash2 className="size-3" />
                                                  Eliminar
                                                </>
                                              )}
                                            </Button>
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      {/* EDIT / CREATE FORMS */}
                      {notesSubTab === "notes" && (
                        // Edit Note Form
                        <div className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/30 shadow-sm">
                          <div className="mb-6 flex justify-between items-center">
                            <h3 className="font-extrabold text-sm text-neutral-900 dark:text-white flex items-center gap-2">
                              <Edit2 className="size-4 text-primary animate-pulse" /> {editingItem.isNew ? "Crear Nuevo Apunte Académico" : "Editar Apunte Académico"}
                            </h3>
                            <Button
                              onClick={() => setEditingItem(null)}
                              variant="ghost"
                              className="h-8 w-8 p-0 rounded-full text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                            >
                              <X className="size-4" />
                            </Button>
                          </div>

                          <form onSubmit={handleSaveNote} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-500">Materia Académica</label>
                                <select
                                  required
                                  value={editingItem.materia_id || ""}
                                  onChange={(e) => setEditingItem({ ...editingItem, materia_id: e.target.value })}
                                  className="w-full rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-4 py-2.5 text-xs text-neutral-900 dark:text-white outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-colors"
                                >
                                  <option value="" disabled>Selecciona una Materia</option>
                                  {materiasList.map(m => (
                                    <option key={m.id} value={m.id}>{m.nombre}</option>
                                  ))}
                                </select>
                              </div>

                              <div className="space-y-1.5">
                                <label className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-500">Semestre Académico</label>
                                <select
                                  required
                                  value={editingItem.semestre_id || ""}
                                  onChange={(e) => setEditingItem({ ...editingItem, semestre_id: e.target.value })}
                                  className="w-full rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-4 py-2.5 text-xs text-neutral-900 dark:text-white outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-colors"
                                >
                                  <option value="" disabled>Selecciona un Semestre</option>
                                  {semestresList.map(s => (
                                    <option key={s.id} value={s.id}>{s.nombre}</option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-500">Título del Apunte</label>
                                <input
                                  type="text"
                                  required
                                  value={editingItem.titulo}
                                  onChange={(e) => {
                                    const nextTitle = e.target.value;
                                    const computedSlug = nextTitle.toLowerCase()
                                      .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // remove accents
                                      .replace(/[^a-z0-9\s-]/g, "")
                                      .trim()
                                      .replace(/\s+/g, "-");
                                    setEditingItem({
                                      ...editingItem,
                                      titulo: nextTitle,
                                      slug: editingItem.isNew ? computedSlug : editingItem.slug
                                    });
                                  }}
                                  className="w-full rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-4 py-2.5 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                                />
                              </div>

                              <div className="space-y-1.5">
                                <label className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-500">Slug</label>
                                <input
                                  type="text"
                                  required
                                  value={editingItem.slug}
                                  onChange={(e) => setEditingItem({ ...editingItem, slug: e.target.value })}
                                  className="w-full rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-4 py-2.5 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-500">Autor</label>
                                <input
                                  type="text"
                                  required
                                  value={editingItem.autor}
                                  onChange={(e) => setEditingItem({ ...editingItem, autor: e.target.value })}
                                  className="w-full rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-4 py-2.5 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                                />
                              </div>

                              <div className="space-y-1.5">
                                <label className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-500">Vistas / Clics</label>
                                <input
                                  type="number"
                                  required
                                  value={editingItem.vistas}
                                  onChange={(e) => setEditingItem({ ...editingItem, vistas: e.target.value })}
                                  className="w-full rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-4 py-2.5 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                                />
                              </div>
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-500">Tags (Separados por coma)</label>
                              <input
                                type="text"
                                value={Array.isArray(editingItem.tags) ? editingItem.tags.join(", ") : editingItem.tags}
                                onChange={(e) => setEditingItem({ ...editingItem, tags: e.target.value })}
                                className="w-full rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-4 py-2.5 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                              />
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-500">Contenido del Apunte (Markdown)</label>
                              <textarea
                                rows={12}
                                required
                                value={editingItem.contenido}
                                onChange={(e) => setEditingItem({ ...editingItem, contenido: e.target.value })}
                                className="w-full rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-4 py-2.5 text-xs font-mono text-neutral-900 dark:text-white placeholder-neutral-400 outline-none resize-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                              />
                            </div>

                            <div className="flex justify-end gap-3 pt-3 border-t border-neutral-200 dark:border-neutral-800">
                              <Button
                                type="button"
                                onClick={() => setEditingItem(null)}
                                variant="outline"
                                className="h-9 rounded-xl border-border text-neutral-500 dark:text-neutral-400 font-bold text-xs cursor-pointer"
                              >
                                Cancelar
                              </Button>
                              <Button
                                type="submit"
                                disabled={saving}
                                className="h-9.5 px-5 rounded-xl bg-primary text-primary-foreground font-bold text-xs flex items-center gap-2 shadow-md shadow-primary/10 hover:bg-primary/95 cursor-pointer"
                              >
                                {saving ? (
                                  <>
                                    <Loader2 className="size-3.5 animate-spin" />
                                    <span>{editingItem.isNew ? "Creando..." : "Guardando..."}</span>
                                  </>
                                ) : (
                                  <>
                                    <Save className="size-3.5" />
                                    <span>{editingItem.isNew ? "Crear Apunte" : "Guardar Cambios"}</span>
                                  </>
                                )}
                              </Button>
                            </div>
                          </form>
                        </div>
                      )}

                      {notesSubTab === "materias" && (
                        // Edit/Create Materia Form
                        <div className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/30 shadow-sm">
                          <div className="mb-6 flex justify-between items-center">
                            <h3 className="font-extrabold text-sm text-neutral-900 dark:text-white flex items-center gap-2">
                              <Edit2 className="size-4 text-primary animate-pulse" /> {editingItem.isNew ? "Crear Nueva Materia Académica" : "Editar Materia Académica"}
                            </h3>
                            <Button
                              onClick={() => setEditingItem(null)}
                              variant="ghost"
                              className="h-8 w-8 p-0 rounded-full text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                            >
                              <X className="size-4" />
                            </Button>
                          </div>

                          <form onSubmit={handleSaveMateria} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-500">Nombre de la Materia</label>
                                <input
                                  type="text"
                                  required
                                  value={editingItem.nombre}
                                  onChange={(e) => {
                                    const nextName = e.target.value;
                                    const computedSlug = nextName.toLowerCase()
                                      .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // remove accents
                                      .replace(/[^a-z0-9\s-]/g, "")
                                      .trim()
                                      .replace(/\s+/g, "-");
                                    setEditingItem({
                                      ...editingItem,
                                      nombre: nextName,
                                      slug: editingItem.isNew ? computedSlug : editingItem.slug
                                    });
                                  }}
                                  className="w-full rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-4 py-2.5 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                                />
                              </div>

                              <div className="space-y-1.5">
                                <label className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-500">Slug</label>
                                <input
                                  type="text"
                                  required
                                  value={editingItem.slug}
                                  onChange={(e) => setEditingItem({ ...editingItem, slug: e.target.value })}
                                  className="w-full rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-4 py-2.5 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-500">Código (e.g. INF-201)</label>
                                <input
                                  type="text"
                                  required
                                  value={editingItem.codigo}
                                  onChange={(e) => setEditingItem({ ...editingItem, codigo: e.target.value })}
                                  className="w-full rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-4 py-2.5 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                                />
                              </div>

                              <div className="space-y-1.5">
                                <label className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-500">Semestre Relacionado</label>
                                <select
                                  required
                                  value={editingItem.semestre_id || ""}
                                  onChange={(e) => setEditingItem({ ...editingItem, semestre_id: e.target.value })}
                                  className="w-full rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-4 py-2.5 text-xs text-neutral-900 dark:text-white outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-colors"
                                >
                                  <option value="" disabled>Selecciona un Semestre</option>
                                  {semestresList.map(s => (
                                    <option key={s.id} value={s.id}>{s.nombre}</option>
                                  ))}
                                </select>
                              </div>

                              <div className="space-y-1.5">
                                <label className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-500">Profesor (Opcional)</label>
                                <select
                                  value={editingItem.profesor_id || ""}
                                  onChange={(e) => setEditingItem({ ...editingItem, profesor_id: e.target.value || null })}
                                  className="w-full rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-4 py-2.5 text-xs text-neutral-900 dark:text-white outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-colors"
                                >
                                  <option value="">Sin Profesor Asignado</option>
                                  {profesoresList.map(p => (
                                    <option key={p.id} value={p.id}>{p.nombre}</option>
                                  ))}
                                </select>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-500">Nombre del Icono (Lucide)</label>
                                <div className="flex flex-wrap gap-2 mb-2">
                                  {["Book", "Code", "Microscope", "Calculator", "PenTool", "BarChart", "Palette", "Dna"].map(iconName => (
                                    <button
                                      key={iconName}
                                      type="button"
                                      onClick={() => setEditingItem({ ...editingItem, icono: iconName })}
                                      className={cn(
                                        "px-2 h-7 rounded-lg border flex items-center justify-center text-[10px] transition-all hover:bg-neutral-105 dark:hover:bg-neutral-800",
                                        editingItem.icono === iconName ? "border-primary bg-primary/10 text-primary font-bold" : "border-neutral-200 dark:border-neutral-800"
                                      )}
                                    >
                                      {iconName}
                                    </button>
                                  ))}
                                </div>
                                <input
                                  type="text"
                                  required
                                  value={editingItem.icono}
                                  onChange={(e) => setEditingItem({ ...editingItem, icono: e.target.value })}
                                  className="w-full rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-4 py-2.5 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                                />
                              </div>

                              <div className="space-y-1.5">
                                <label className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-500">Color (Hex)</label>
                                <div className="flex gap-3 items-center">
                                  <input
                                    type="color"
                                    value={editingItem.color || "#ef4444"}
                                    onChange={(e) => setEditingItem({ ...editingItem, color: e.target.value })}
                                    className="size-10 rounded-xl cursor-pointer border-0 p-0"
                                  />
                                  <input
                                    type="text"
                                    value={editingItem.color || "#ef4444"}
                                    onChange={(e) => setEditingItem({ ...editingItem, color: e.target.value })}
                                    className="flex-1 rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-4 py-2.5 text-xs text-neutral-900 dark:text-white outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-colors"
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-500">Descripción de la Materia</label>
                              <textarea
                                rows={4}
                                value={editingItem.descripcion || ""}
                                onChange={(e) => setEditingItem({ ...editingItem, descripcion: e.target.value })}
                                className="w-full rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-4 py-2.5 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 outline-none resize-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                              />
                            </div>

                            <div className="flex justify-end gap-3 pt-3 border-t border-neutral-200 dark:border-neutral-800">
                              <Button
                                type="button"
                                onClick={() => setEditingItem(null)}
                                variant="outline"
                                className="h-9 rounded-xl border-border text-neutral-500 dark:text-neutral-400 font-bold text-xs cursor-pointer"
                              >
                                Cancelar
                              </Button>
                              <Button
                                type="submit"
                                disabled={saving}
                                className="h-9.5 px-5 rounded-xl bg-primary text-primary-foreground font-bold text-xs flex items-center gap-2 shadow-md shadow-primary/10 hover:bg-primary/95 cursor-pointer"
                              >
                                {saving ? (
                                  <>
                                    <Loader2 className="size-3.5 animate-spin" />
                                    <span>{editingItem.isNew ? "Creando..." : "Guardando..."}</span>
                                  </>
                                ) : (
                                  <>
                                    <Save className="size-3.5" />
                                    <span>{editingItem.isNew ? "Crear Materia" : "Guardar Cambios"}</span>
                                  </>
                                )}
                              </Button>
                            </div>
                          </form>
                        </div>
                      )}

                      {notesSubTab === "semestres" && (
                        // Edit/Create Semestre Form
                        <div className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/30 shadow-sm">
                          <div className="mb-6 flex justify-between items-center">
                            <h3 className="font-extrabold text-sm text-neutral-900 dark:text-white flex items-center gap-2">
                              <Edit2 className="size-4 text-primary animate-pulse" /> {editingItem.isNew ? "Crear Nuevo Semestre" : "Editar Semestre"}
                            </h3>
                            <Button
                              onClick={() => setEditingItem(null)}
                              variant="ghost"
                              className="h-8 w-8 p-0 rounded-full text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                            >
                              <X className="size-4" />
                            </Button>
                          </div>

                          <form onSubmit={handleSaveSemestre} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-500">Nombre del Semestre (e.g. Primer Semestre)</label>
                                <input
                                  type="text"
                                  required
                                  value={editingItem.nombre}
                                  onChange={(e) => {
                                    const nextName = e.target.value;
                                    const computedSlug = nextName.toLowerCase()
                                      .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // remove accents
                                      .replace(/[^a-z0-9\s-]/g, "")
                                      .trim()
                                      .replace(/\s+/g, "-");
                                    setEditingItem({
                                      ...editingItem,
                                      nombre: nextName,
                                      slug: editingItem.isNew ? computedSlug : editingItem.slug
                                    });
                                  }}
                                  className="w-full rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-4 py-2.5 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                                />
                              </div>

                              <div className="space-y-1.5">
                                <label className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-500">Slug</label>
                                <input
                                  type="text"
                                  required
                                  value={editingItem.slug}
                                  onChange={(e) => setEditingItem({ ...editingItem, slug: e.target.value })}
                                  className="w-full rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-4 py-2.5 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="space-y-1.5 flex flex-col gap-2">
                                <div className="flex gap-4 w-full">
                                  <div className="flex-1 space-y-1.5">
                                    <label className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-500">Fecha de Inicio</label>
                                    <input
                                      type="date"

                                      value={editingItem.fecha_inicio || ""}
                                      onChange={(e) => setEditingItem({ ...editingItem, fecha_inicio: e.target.value })}
                                      className="w-full rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-4 py-2.5 text-xs text-neutral-900 dark:text-white outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                                    />
                                  </div>
                                  <div className="flex-1 space-y-1.5">
                                    <label className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-500">Fecha de Fin</label>
                                    <input
                                      type="date"

                                      value={editingItem.fecha_fin || ""}
                                      onChange={(e) => setEditingItem({ ...editingItem, fecha_fin: e.target.value })}
                                      className="w-full rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-4 py-2.5 text-xs text-neutral-900 dark:text-white outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                                    />
                                  </div>
                                </div>
                              </div>

                              <div className="space-y-1.5">
                                <label className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-500">Estado de Actividad del Semestre</label>
                                <select
                                  value={editingItem.activo ? "true" : "false"}
                                  onChange={(e) => setEditingItem({ ...editingItem, activo: e.target.value === "true" })}
                                  className="w-full rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-4 py-2.5 text-xs text-neutral-900 dark:text-white outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-colors"
                                >
                                  <option value="true">Activo</option>
                                  <option value="false">Inactivo / Pasado</option>
                                </select>
                              </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-3 border-t border-neutral-200 dark:border-neutral-800">
                              <Button
                                type="button"
                                onClick={() => setEditingItem(null)}
                                variant="outline"
                                className="h-9 rounded-xl border-border text-neutral-500 dark:text-neutral-400 font-bold text-xs cursor-pointer"
                              >
                                Cancelar
                              </Button>
                              <Button
                                type="submit"
                                disabled={saving}
                                className="h-9.5 px-5 rounded-xl bg-primary text-primary-foreground font-bold text-xs flex items-center gap-2 shadow-md shadow-primary/10 hover:bg-primary/95 cursor-pointer"
                              >
                                {saving ? (
                                  <>
                                    <Loader2 className="size-3.5 animate-spin" />
                                    <span>{editingItem.isNew ? "Creando..." : "Guardando..."}</span>
                                  </>
                                ) : (
                                  <>
                                    <Save className="size-3.5" />
                                    <span>{editingItem.isNew ? "Crear Semestre" : "Guardar Cambios"}</span>
                                  </>
                                )}
                              </Button>
                            </div>
                          </form>
                        </div>
                      )}

                      {notesSubTab === "profesores" && (
                        // Edit/Create Profesor Form
                        <div className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/30 shadow-sm">
                          <div className="mb-6 flex justify-between items-center">
                            <h3 className="font-extrabold text-sm text-neutral-900 dark:text-white flex items-center gap-2">
                              <Edit2 className="size-4 text-primary animate-pulse" /> {editingItem.isNew ? "Crear Nuevo Profesor" : "Editar Profesor"}
                            </h3>
                            <Button
                              onClick={() => setEditingItem(null)}
                              variant="ghost"
                              className="h-8 w-8 p-0 rounded-full text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                            >
                              <X className="size-4" />
                            </Button>
                          </div>

                          <form onSubmit={handleSaveProfesor} className="space-y-4">
                            <div className="grid grid-cols-1 gap-4">
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-500">Nombre del Profesor</label>
                                <input
                                  type="text"
                                  required
                                  value={editingItem.nombre}
                                  onChange={(e) => setEditingItem({ ...editingItem, nombre: e.target.value })}
                                  className="w-full rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-4 py-2.5 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                                />
                              </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-3 border-t border-neutral-200 dark:border-neutral-800">
                              <Button
                                type="button"
                                onClick={() => setEditingItem(null)}
                                variant="outline"
                                className="h-9 rounded-xl border-border text-neutral-500 dark:text-neutral-400 font-bold text-xs cursor-pointer"
                              >
                                Cancelar
                              </Button>
                              <Button
                                type="submit"
                                disabled={saving}
                                className="h-9.5 px-5 rounded-xl bg-primary text-primary-foreground font-bold text-xs flex items-center gap-2 shadow-md shadow-primary/10 hover:bg-primary/95 cursor-pointer"
                              >
                                {saving ? (
                                  <>
                                    <Loader2 className="size-3.5 animate-spin" />
                                    <span>{editingItem.isNew ? "Creando..." : "Guardando..."}</span>
                                  </>
                                ) : (
                                  <>
                                    <Save className="size-3.5" />
                                    <span>{editingItem.isNew ? "Crear Profesor" : "Guardar Cambios"}</span>
                                  </>
                                )}
                              </Button>
                            </div>
                          </form>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* ── 4. ACTIVITIES CRUD VIEW ── */}
              {activeTab === "activities" && (
                <div className="space-y-6 animate-scale-in">
                  {!editingItem ? (
                    <>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="relative max-w-md flex-1">
                          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-neutral-500" />
                          <input
                            type="text"
                            value={searchActivity}
                            onChange={(e) => setSearchActivity(e.target.value)}
                            placeholder="Buscar actividad oficial..."
                            className="w-full rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-950 pl-10 pr-4 py-2.5 text-xs text-neutral-900 dark:text-white placeholder-neutral-500 transition-all outline-none focus:border-primary"
                          />
                        </div>
                        
                        <Button
                          onClick={() => setEditingItem({
                            isNew: true,
                            nombre: "",
                            slug: "",
                            estado: "pendiente",
                            fecha_inicio: new Date().toISOString().slice(0, 16),
                            fecha_entrega: new Date(Date.now() + 86400000 * 3).toISOString().slice(0, 16),
                            descripcion_oficial: "",
                            tips_most: "",
                            materia_id: materiasList[0]?.id || "",
                            visibilidad_archivo: 'completa',
                            fecha_desbloqueo_visibilidad: null,
                            archivo_resolucion_url: null,
                            archivo_resolucion_nombre: null,
                            destino_semestre_id: semestresList[0]?.id || '',
                            destino_materia_id: '',
                            destino_carpeta_id: null,
                            destino_nueva_carpeta: '',
                            colaborativa: true,
                            _destinoTipo: 'nueva',
                          })}
                          className="h-9 px-4 rounded-xl bg-primary text-primary-foreground font-bold text-xs flex items-center gap-2 shadow-md shadow-primary/10 hover:bg-primary/95 cursor-pointer shrink-0"
                        >
                          <Plus className="size-4" />
                          <span>Crear Actividad</span>
                        </Button>
                      </div>

                      {filteredActivities.length === 0 ? (
                        <div className="py-12 text-center text-xs text-neutral-500">No se encontraron actividades académicas.</div>
                      ) : (
                        <div className="overflow-hidden border border-neutral-200 dark:border-neutral-800 rounded-2xl bg-white dark:bg-neutral-900/10 backdrop-blur-md shadow-sm">
                          <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-left text-xs">
                              <thead>
                                <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-500 dark:text-neutral-400 font-semibold">
                                  <th className="px-5 py-3">Actividad</th>
                                  <th className="px-5 py-3">Materia</th>
                                  <th className="px-5 py-3">Fecha de Entrega</th>
                                  <th className="px-5 py-3">Estado</th>
                                  <th className="px-5 py-3 text-right">Moderación</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800/60 font-medium">
                                {filteredActivities.map((act) => {
                                  return (
                                    <tr key={act.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/20 transition-colors">
                                      <td className="px-5 py-3.5">
                                        <div className="flex flex-col min-w-0">
                                          <span className="font-bold text-neutral-900 dark:text-white text-sm truncate">{act.nombre}</span>
                                          <span className="text-[9px] font-mono text-neutral-400 dark:text-neutral-500 truncate">slug: {act.slug}</span>
                                        </div>
                                      </td>
                                      <td className="px-5 py-3.5 text-neutral-800 dark:text-neutral-300">
                                        {materiaMap[act.materia_id] || "Materia"}
                                      </td>
                                      <td className="px-5 py-3.5 font-mono text-neutral-800 dark:text-neutral-300">
                                        {new Date(act.fecha_entrega).toLocaleDateString("es-EC", {
                                          year: "numeric",
                                          month: "short",
                                          day: "numeric"
                                        })}
                                      </td>
                                      <td className="px-5 py-3.5">
                                        {act.estado === "entregada" && (
                                          <span className="inline-flex items-center gap-1 text-[8.5px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2.5 py-0.5">
                                            Entregada
                                          </span>
                                        )}
                                        {act.estado === "pendiente" && (
                                          <span className="inline-flex items-center gap-1 text-[8.5px] font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-full px-2.5 py-0.5 animate-pulse">
                                            Pendiente
                                          </span>
                                        )}
                                        {act.estado === "vencida" && (
                                          <span className="inline-flex items-center gap-1 text-[8.5px] font-extrabold uppercase tracking-wider text-primary bg-primary/10 border border-primary/20 rounded-full px-2.5 py-0.5">
                                            Vencida
                                          </span>
                                        )}
                                      </td>
                                      <td className="px-5 py-3.5 text-right">
                                        <Button
                                          onClick={() => setEditingItem(act)}
                                          variant="outline"
                                          className="h-8 rounded-lg border-border hover:bg-muted text-foreground text-[10px] font-bold px-2.5 inline-flex items-center gap-1 cursor-pointer"
                                        >
                                          <Edit2 className="size-3 text-muted-foreground" />
                                          Editar Deber
                                        </Button>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    // Edit Activity Form
                    <div className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/30 shadow-sm">
                      <div className="mb-6 flex justify-between items-center">
                        <h3 className="font-extrabold text-sm text-neutral-900 dark:text-white flex items-center gap-2">
                          <Edit2 className="size-4 text-primary animate-pulse" /> {editingItem.isNew ? "Crear Nueva Actividad Académica" : "Editar Actividad Académica"}
                        </h3>
                        <Button
                          onClick={() => setEditingItem(null)}
                          variant="ghost"
                          className="h-8 w-8 p-0 rounded-full text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-full"
                        >
                          <X className="size-4" />
                        </Button>
                      </div>

                      <form onSubmit={handleSaveActivity} className="space-y-4">
                        {/* Materia Académica */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-500">Materia Académica</label>
                          <select
                            required
                            value={editingItem.materia_id || ""}
                            onChange={(e) => setEditingItem({ ...editingItem, materia_id: e.target.value })}
                            className="w-full rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-4 py-2.5 text-xs text-neutral-900 dark:text-white outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-colors"
                          >
                            <option value="" disabled>Selecciona una Materia</option>
                            {materiasList.map(m => (
                              <option key={m.id} value={m.id}>{m.nombre}</option>
                            ))}
                          </select>
                        </div>

                        {/* Nombre + Slug */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-500">Nombre de la Actividad</label>
                            <input
                              type="text"
                              required
                              value={editingItem.nombre}
                              onChange={(e) => {
                                const val = e.target.value;
                                const updates: any = { nombre: val };
                                if (editingItem.isNew) {
                                  updates.slug = val.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[\s\W-]+/g, '-').replace(/^-+|-+$/g, '');
                                }
                                setEditingItem({ ...editingItem, ...updates });
                              }}
                              className="w-full rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-4 py-2.5 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-colors"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-500">Slug</label>
                            <input
                              type="text"
                              required
                              value={editingItem.slug}
                              onChange={(e) => setEditingItem({ ...editingItem, slug: e.target.value })}
                              className="w-full rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-4 py-2.5 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-colors"
                            />
                          </div>
                        </div>

                        {/* Estado + Fecha de Entrega */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-500">Estado de la Tarea</label>
                            <select
                              value={editingItem.estado}
                              onChange={(e) => setEditingItem({ ...editingItem, estado: e.target.value })}
                              className="w-full rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-4 py-2.5 text-xs text-neutral-900 dark:text-white outline-none focus:border-primary transition-colors"
                            >
                              <option value="pendiente">Pendiente</option>
                              <option value="entregada">Entregada</option>
                              <option value="vencida">Vencida</option>
                            </select>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-500">Fecha de Entrega</label>
                            <input
                              type="datetime-local"
                              required
                              value={toDatetimeLocalValue(editingItem.fecha_entrega)}
                              onChange={(e) => setEditingItem({ ...editingItem, fecha_entrega: e.target.value ? new Date(e.target.value).toISOString() : '' })}
                              className="w-full rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-4 py-2.5 text-xs text-neutral-900 dark:text-white outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-colors"
                            />
                          </div>
                        </div>

                        {/* Fecha de Inicio */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-500">Fecha de Inicio</label>
                          <input
                            type="datetime-local"
                            value={toDatetimeLocalValue(editingItem.fecha_inicio)}
                            onChange={(e) => setEditingItem({ ...editingItem, fecha_inicio: e.target.value ? new Date(e.target.value).toISOString() : '' })}
                            className="w-full rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-4 py-2.5 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-colors"
                          />
                        </div>

                        {/* Descripción Oficial */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-500">Descripción Oficial</label>
                          <textarea
                            rows={4}
                            required
                            value={editingItem.descripcion_oficial}
                            onChange={(e) => setEditingItem({ ...editingItem, descripcion_oficial: e.target.value })}
                            className="w-full rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-4 py-2.5 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 outline-none resize-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-colors"
                          />
                        </div>

                        {/* Tips de Most */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-500">Tips de Mateo (Most) 💡</label>
                          <textarea
                            rows={5}
                            value={editingItem.tips_most || ""}
                            onChange={(e) => setEditingItem({ ...editingItem, tips_most: e.target.value })}
                            className="w-full rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-4 py-2.5 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 outline-none resize-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-colors"
                          />
                        </div>

                        {/* Archivo de Resolución */}
                        <div className="space-y-1.5 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                          <label className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-500">Archivo de Resolución</label>
                          {editingItem.archivo_resolucion_nombre && (
                            <p className="text-xs text-neutral-700 dark:text-neutral-300">
                              Archivo actual: <a href={editingItem.archivo_resolucion_url} target="_blank" rel="noopener noreferrer" className="text-primary underline">{editingItem.archivo_resolucion_nombre}</a>
                            </p>
                          )}
                          <input
                            type="file"
                            disabled={uploading}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleUploadArchivoResolucion(file);
                            }}
                            className="w-full rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-4 py-2.5 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-colors file:mr-3 file:rounded-lg file:border-0 file:bg-primary/10 file:px-3 file:py-1 file:text-xs file:font-semibold file:text-primary"
                          />
                          {uploading && (
                            <div className="flex items-center gap-2 text-xs text-neutral-500">
                              <Loader2 className="size-3.5 animate-spin" />
                              <span>Subiendo archivo...</span>
                            </div>
                          )}
                        </div>

                        {/* Visibilidad del Archivo */}
                        <div className="space-y-1.5 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                          <label className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-500">Visibilidad del Archivo</label>
                          <select
                            value={editingItem.visibilidad_archivo || 'completa'}
                            onChange={(e) => setEditingItem({ ...editingItem, visibilidad_archivo: e.target.value })}
                            className="w-full rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-4 py-2.5 text-xs text-neutral-900 dark:text-white outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-colors"
                          >
                            <option value="completa">Completa</option>
                            <option value="parcial">Parcial</option>
                            <option value="ninguna">Ninguna</option>
                          </select>
                          {editingItem.visibilidad_archivo && editingItem.visibilidad_archivo !== 'completa' && (
                            <div className="space-y-1.5 mt-2">
                              <label className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-500">Fecha de Desbloqueo de Visibilidad</label>
                              <input
                                type="datetime-local"
                                value={toDatetimeLocalValue(editingItem.fecha_desbloqueo_visibilidad)}
                                onChange={(e) => setEditingItem({ ...editingItem, fecha_desbloqueo_visibilidad: e.target.value ? new Date(e.target.value).toISOString() : null })}
                                className="w-full rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-4 py-2.5 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-colors"
                              />
                            </div>
                          )}
                        </div>

                        {/* Destino al Vencer */}
                        <div className="space-y-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                          <label className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-500">Destino al Vencer</label>

                          {/* Semestre destino */}
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-500">Semestre</label>
                            <select
                              value={editingItem.destino_semestre_id || ''}
                              onChange={(e) => setEditingItem({ ...editingItem, destino_semestre_id: e.target.value, destino_materia_id: '', destino_carpeta_id: null })}
                              className="w-full rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-4 py-2.5 text-xs text-neutral-900 dark:text-white outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-colors"
                            >
                              <option value="">Selecciona un semestre</option>
                              {semestresList.map(s => (
                                <option key={s.id} value={s.id}>{s.nombre}</option>
                              ))}
                            </select>
                          </div>

                          {/* Materia destino (filtrada por semestre) */}
                          {editingItem.destino_semestre_id && (
                            <div className="space-y-1.5">
                              <label className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-500">Materia</label>
                              <select
                                value={editingItem.destino_materia_id || ''}
                                onChange={(e) => {
                                  const materiaId = e.target.value;
                                  setEditingItem({ ...editingItem, destino_materia_id: materiaId, destino_carpeta_id: null });
                                  loadCarpetasDestino(materiaId);
                                }}
                                className="w-full rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-4 py-2.5 text-xs text-neutral-900 dark:text-white outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-colors"
                              >
                                <option value="">Selecciona una materia</option>
                                {materiasList.filter(m => m.semestre_id === editingItem.destino_semestre_id).map(m => (
                                  <option key={m.id} value={m.id}>{m.nombre}</option>
                                ))}
                              </select>
                            </div>
                          )}

                          {/* Carpeta destino */}
                          {editingItem.destino_materia_id && (
                            <div className="space-y-2">
                              <div className="flex items-center gap-4">
                                <label className="flex items-center gap-1.5 text-xs text-neutral-700 dark:text-neutral-300 cursor-pointer">
                                  <input
                                    type="radio"
                                    name="destinoTipo"
                                    checked={editingItem._destinoTipo !== 'existente'}
                                    onChange={() => setEditingItem({ ...editingItem, _destinoTipo: 'nueva', destino_carpeta_id: null })}
                                    className="accent-primary"
                                  />
                                  Crear carpeta nueva
                                </label>
                                <label className="flex items-center gap-1.5 text-xs text-neutral-700 dark:text-neutral-300 cursor-pointer">
                                  <input
                                    type="radio"
                                    name="destinoTipo"
                                    checked={editingItem._destinoTipo === 'existente'}
                                    onChange={() => {
                                      setEditingItem({ ...editingItem, _destinoTipo: 'existente', destino_nueva_carpeta: '' });
                                      loadCarpetasDestino(editingItem.destino_materia_id);
                                    }}
                                    className="accent-primary"
                                  />
                                  Carpeta existente
                                </label>
                              </div>

                              {editingItem._destinoTipo === 'existente' ? (
                                <select
                                  value={editingItem.destino_carpeta_id || ''}
                                  onChange={(e) => setEditingItem({ ...editingItem, destino_carpeta_id: e.target.value || null })}
                                  className="w-full rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-4 py-2.5 text-xs text-neutral-900 dark:text-white outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-colors"
                                >
                                  <option value="">Selecciona una carpeta</option>
                                  {carpetasDestino.map(c => (
                                    <option key={c.id} value={c.id}>{c.nombre}</option>
                                  ))}
                                </select>
                              ) : (
                                <input
                                  type="text"
                                  placeholder="Nombre de la nueva carpeta"
                                  value={editingItem.destino_nueva_carpeta || ''}
                                  onChange={(e) => setEditingItem({ ...editingItem, destino_nueva_carpeta: e.target.value })}
                                  className="w-full rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-4 py-2.5 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-colors"
                                />
                              )}
                            </div>
                          )}
                        </div>

                        {/* Colaborativa */}
                        <div className="space-y-1.5 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                          <label className="flex items-center gap-2.5 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={editingItem.colaborativa ?? true}
                              onChange={(e) => setEditingItem({ ...editingItem, colaborativa: e.target.checked })}
                              className="accent-primary size-4 rounded"
                            />
                            <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-500">Actividad Colaborativa</span>
                          </label>
                        </div>

                        <div className="flex justify-end gap-3 pt-3 border-t border-neutral-200 dark:border-neutral-800">
                          <Button
                            type="button"
                            onClick={() => setEditingItem(null)}
                            variant="outline"
                            className="h-9 rounded-xl border-border text-neutral-500 dark:text-neutral-400 font-bold text-xs cursor-pointer"
                          >
                            Cancelar
                          </Button>
                          <Button
                            type="submit"
                            disabled={saving}
                            className="h-9.5 px-5 rounded-xl bg-primary text-primary-foreground font-bold text-xs flex items-center gap-2 shadow-md shadow-primary/10 hover:bg-primary/95 cursor-pointer"
                          >
                            {saving ? (
                              <>
                                <Loader2 className="size-3.5 animate-spin" />
                                <span>{editingItem.isNew ? "Creando..." : "Guardando..."}</span>
                              </>
                            ) : (
                              <>
                                <Save className="size-3.5" />
                                <span>{editingItem.isNew ? "Crear Actividad" : "Guardar Cambios"}</span>
                              </>
                            )}
                          </Button>
                        </div>
                      </form>
                    </div>
                  )}
                </div>
              )}

              {/* ── 5. SOBRE MI EDITOR VIEW ── */}
              {activeTab === "sobremi" && (
                <div className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/30 shadow-sm animate-scale-in">
                  <div className="mb-6">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-900 dark:text-white flex items-center gap-2">
                      <Globe className="size-5 text-primary" /> Editar Perfil Público de Mateo ("Most")
                    </h3>
                    <p className="text-[10px] text-neutral-500 mt-0.5">
                      Este formulario actualiza el perfil principal de la pestaña "Sobre mí" que visualizan todos los estudiantes.
                    </p>
                  </div>

                  <form onSubmit={handleSaveSobreMi} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-500">Nombre Completo Profesional</label>
                        <input
                          type="text"
                          required
                          value={sobreMiName}
                          onChange={(e) => setSobreMiName(e.target.value)}
                          className="w-full rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-4 py-2.5 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 outline-none focus:border-primary"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-500">Apodo (Nickname)</label>
                        <input
                          type="text"
                          required
                          value={sobreMiNickname}
                          onChange={(e) => setSobreMiNickname(e.target.value)}
                          className="w-full rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-4 py-2.5 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 outline-none focus:border-primary"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-500">Biografía del Proyecto (Sobre Mateo)</label>
                      <textarea
                        rows={4}
                        required
                        value={sobreMiBio}
                        onChange={(e) => setSobreMiBio(e.target.value)}
                        className="w-full rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-4 py-2.5 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 outline-none resize-none focus:border-primary"
                      />
                    </div>

                    <div className="space-y-4 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                      <div>
                        <h4 className="text-xs font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">Enlaces de Redes Sociales</h4>
                        <p className="text-[9px] text-neutral-500">Sincroniza tus perfiles de desarrollador y redes.</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* GitHub del Proyecto */}
                        <div className="space-y-1.5 sm:col-span-2">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1">
                            <GithubIcon className="size-3.5 text-neutral-500 dark:text-neutral-400" /> GitHub del Proyecto
                          </label>
                          <input
                            type="text"
                            value={sobreMiProyectoGithub}
                            onChange={(e) => setSobreMiProyectoGithub(e.target.value)}
                            placeholder="URL del repositorio (ej. https://github.com/...)"
                            className="w-full rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-4 py-2.5 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 outline-none focus:border-primary"
                          />
                        </div>

                        {/* GitHub */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1">
                            <GithubIcon className="size-3.5 text-neutral-500 dark:text-neutral-400" /> GitHub
                          </label>
                          <input
                            type="text"
                            value={sobreMiGithub}
                            onChange={(e) => setSobreMiGithub(e.target.value)}
                            placeholder="usuario"
                            className="w-full rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-4 py-2.5 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 outline-none focus:border-primary"
                          />
                        </div>

                        {/* Instagram */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1">
                            <InstagramIcon className="size-3.5 text-neutral-500 dark:text-neutral-400" /> Instagram
                          </label>
                          <input
                            type="text"
                            value={sobreMiInstagram}
                            onChange={(e) => setSobreMiInstagram(e.target.value)}
                            placeholder="usuario"
                            className="w-full rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-4 py-2.5 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 outline-none focus:border-primary"
                          />
                        </div>

                        {/* Twitter / X */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1">
                            <TwitterIcon className="size-3.5 text-neutral-500 dark:text-neutral-400" /> Twitter / X
                          </label>
                          <input
                            type="text"
                            value={sobreMiTwitter}
                            onChange={(e) => setSobreMiTwitter(e.target.value)}
                            placeholder="usuario"
                            className="w-full rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-4 py-2.5 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 outline-none focus:border-primary"
                          />
                        </div>

                        {/* Portfolio Web */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1">
                            <Globe className="size-3.5 text-neutral-500 dark:text-neutral-400" /> Portafolio Web / URL
                          </label>
                          <input
                            type="text"
                            value={sobreMiWeb}
                            onChange={(e) => setSobreMiWeb(e.target.value)}
                            placeholder="url-completa"
                            className="w-full rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-4 py-2.5 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 outline-none focus:border-primary"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 flex justify-end">
                      <Button
                        type="submit"
                        disabled={saving}
                        className="h-9.5 px-5 rounded-xl bg-primary text-primary-foreground font-bold text-xs flex items-center gap-2 shadow-md shadow-primary/10 hover:bg-primary/95 cursor-pointer"
                      >
                        {saving ? (
                          <>
                            <Loader2 className="size-3.5 animate-spin" />
                            <span>Guardando Perfil...</span>
                          </>
                        ) : (
                          <>
                            <Save className="size-3.5" />
                            <span>Guardar Perfil de Mateo</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </div>
              )}

              {/* ── ROADMAP FEATURES VIEW ── */}
              {activeTab === "roadmap" && (
                <div className="space-y-6 animate-scale-in">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="relative max-w-md flex-1">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-neutral-500" />
                      <input
                        type="text"
                        value={searchRoadmap}
                        onChange={(e) => setSearchRoadmap(e.target.value)}
                        placeholder="Buscar feature..."
                        className="w-full rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-950 pl-10 pr-4 py-2.5 text-xs text-neutral-900 dark:text-white placeholder-neutral-500 transition-all outline-none focus:border-primary"
                      />
                    </div>
                    
                    <Button
                      onClick={() => setEditingItem({ isNew: true, titulo: "" })}
                      className="h-9.5 px-4 rounded-xl bg-primary text-primary-foreground font-bold text-xs flex items-center gap-2 shadow-md shadow-primary/10 hover:bg-primary/95 cursor-pointer shrink-0"
                    >
                      <Plus className="size-3.5" />
                      <span>Añadir Feature</span>
                    </Button>
                  </div>

                  {editingItem && editingItem.isNew && (
                    <form onSubmit={handleAddRoadmapFeature} className="p-5 border border-neutral-200 dark:border-neutral-800 rounded-2xl bg-white dark:bg-neutral-900/50 flex flex-col sm:flex-row gap-3 items-end">
                      <div className="space-y-1.5 flex-1 w-full">
                        <label className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-500">Título de la Feature</label>
                        <input
                          type="text"
                          required
                          value={editingItem.titulo}
                          onChange={(e) => setEditingItem({ ...editingItem, titulo: e.target.value })}
                          placeholder="Ej: Modo offline para apuntes..."
                          className="w-full rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-4 py-2.5 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 outline-none focus:border-primary"
                        />
                      </div>
                      <div className="flex gap-2 w-full sm:w-auto">
                        <Button type="button" variant="outline" onClick={() => setEditingItem(null)} className="h-9.5 flex-1 sm:flex-none">
                          Cancelar
                        </Button>
                        <Button type="submit" disabled={saving} className="h-9.5 bg-primary hover:bg-primary/90 text-white flex-1 sm:flex-none">
                          {saving ? <Loader2 className="size-4 animate-spin" /> : "Guardar"}
                        </Button>
                      </div>
                    </form>
                  )}

                  <div className="overflow-hidden border border-neutral-200 dark:border-neutral-800 rounded-2xl bg-white dark:bg-neutral-900/10 backdrop-blur-md shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse text-left text-xs">
                        <thead>
                          <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-500 dark:text-neutral-400 font-semibold">
                            <th className="px-5 py-3 w-12">Estado</th>
                            <th className="px-5 py-3">Feature</th>
                            <th className="px-5 py-3 text-right">Acciones</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800/60 font-medium">
                          {roadmapFeatures
                            .filter(f => searchRoadmap ? f.titulo.toLowerCase().includes(searchRoadmap.toLowerCase()) : true)
                            .map((f) => (
                            <tr key={f.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-900/20 transition-colors">
                              <td className="px-5 py-3.5 text-center">
                                <button onClick={() => handleToggleRoadmapFeature(f.id, f.completada)} className="focus:outline-none">
                                  {f.completada ? (
                                    <CheckCircle2 className="size-5 text-emerald-500" />
                                  ) : (
                                    <div className="size-5 rounded-full border-2 border-neutral-300 dark:border-neutral-600 hover:border-primary transition-colors" />
                                  )}
                                </button>
                              </td>
                              <td className="px-5 py-3.5">
                                <span className={cn("text-sm font-bold", f.completada ? "text-neutral-400 line-through decoration-neutral-300" : "text-neutral-900 dark:text-white")}>
                                  {f.titulo}
                                </span>
                              </td>
                              <td className="px-5 py-3.5 text-right space-x-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteRoadmapFeature(f.id)}
                                  className="h-8 w-8 text-neutral-400 hover:text-red-600 hover:bg-red-500/10"
                                >
                                  <Trash2 className="size-4" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {roadmapFeatures.length === 0 && (
                        <div className="p-8 text-center text-neutral-500 text-sm">No hay features en el roadmap. Añade una arriba.</div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ── 6. COMMENTS VIEW ── */}
              {activeTab === "comments" && (
                <div className="space-y-4 animate-scale-in">
                  <div className="relative max-w-md">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-neutral-500" />
                    <input
                      type="text"
                      value={searchComment}
                      onChange={(e) => setSearchComment(e.target.value)}
                      placeholder="Buscar por comentario o autor..."
                      className="w-full rounded-xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-950 pl-10 pr-4 py-2.5 text-xs text-neutral-900 dark:text-white placeholder-neutral-500 transition-all outline-none focus:border-primary"
                    />
                  </div>

                  {filteredComments.length === 0 ? (
                    <div className="py-12 text-center text-xs text-neutral-500">No hay comentarios registrados.</div>
                  ) : (
                    <div className="space-y-3">
                      {filteredComments.map((c) => {
                        const acting = pendingActionId === c.id;
                        return (
                          <div
                            key={c.id}
                            className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800/80 bg-white dark:bg-neutral-900/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-neutral-300 transition-all duration-200 shadow-sm"
                          >
                            <div className="min-w-0 space-y-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-bold text-sm text-neutral-900 dark:text-white">{c.autor}</span>
                                <span className="text-[9px] font-mono text-neutral-400 dark:text-neutral-500">
                                  {new Date(c.fecha).toLocaleString("es-EC", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit"
                                  })}
                                </span>
                              </div>
                              <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed italic pr-4">
                                "{c.contenido}"
                              </p>
                            </div>

                            <Button
                              onClick={() => handleDeleteComment(c.id)}
                              disabled={acting}
                              variant="outline"
                              className="h-8 rounded-lg border-red-500/25 text-red-600 dark:text-red-400 hover:bg-red-500/10 hover:text-red-300 font-bold text-[10px] px-3 shrink-0 flex items-center gap-1.5 cursor-pointer border shadow-sm"
                            >
                              {acting ? (
                                <Loader2 className="size-3 animate-spin" />
                              ) : (
                                <>
                                  <Trash2 className="size-3.5 animate-pulse" />
                                  Eliminar
                                </>
                              )}
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ─── TAB: LA NUBE STORAGE ─── */}
              {activeTab === "nube" && (
                <div className="space-y-6">
                  {/* Global Stats Widgets */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 flex items-center gap-4 shadow-sm">
                      <div className="p-3 bg-primary/10 rounded-xl text-primary">
                        <Database className="size-8" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-1">Bucket Size</p>
                        <div className="flex items-center gap-2">
                          <p className="text-2xl font-bold">{formatBytes(totalBucketSize)}</p>
                          {calculatingSize && <Loader2 className="size-4 animate-spin text-neutral-400" />}
                        </div>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 flex items-center gap-4 shadow-sm">
                      <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500">
                        <HardDrive className="size-8" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-1">Total Files</p>
                        <div className="flex items-center gap-2">
                          <p className="text-2xl font-bold">{totalFilesCount}</p>
                          {calculatingSize && <Loader2 className="size-4 animate-spin text-neutral-400" />}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* File Browser */}
                  <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-sm">
                    {/* Breadcrumb Navigation */}
                    <div className="bg-neutral-100 dark:bg-neutral-950/50 p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center gap-2 overflow-x-auto">
                      <button
                        onClick={() => setCurrentPath("")}
                        className={cn(
                          "flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary",
                          currentPath === "" ? "text-primary" : "text-neutral-500 dark:text-neutral-400"
                        )}
                      >
                        <Home className="size-4" />
                        <span>Raíz</span>
                      </button>
                      
                      {currentPath.split("/").filter(Boolean).map((crumb, index, arr) => {
                        const crumbPath = arr.slice(0, index + 1).join("/");
                        return (
                          <div key={crumbPath} className="flex items-center gap-2">
                            <ChevronRight className="size-4 text-neutral-400" />
                            <button
                              onClick={() => setCurrentPath(crumbPath)}
                              className={cn(
                                "text-sm font-medium transition-colors hover:text-primary",
                                currentPath === crumbPath ? "text-primary" : "text-neutral-500 dark:text-neutral-400"
                              )}
                            >
                              {crumb}
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    {/* Files List */}
                    <div className="p-0">
                      {loadingFiles ? (
                        <div className="flex flex-col items-center justify-center py-24 text-neutral-400">
                          <Loader2 className="size-8 animate-spin mb-4" />
                          <p className="text-sm font-medium">Cargando directorio...</p>
                        </div>
                      ) : nubeFiles.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 text-neutral-400">
                          <Folder className="size-12 mb-4 opacity-20" />
                          <p className="text-sm font-medium">Este directorio está vacío</p>
                        </div>
                      ) : (
                        <div className="divide-y divide-neutral-100 dark:divide-neutral-800/50">
                          <div className="grid grid-cols-12 gap-4 px-6 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider bg-neutral-50/50 dark:bg-neutral-900/50">
                            <div className="col-span-6 md:col-span-5">Nombre</div>
                            <div className="col-span-3 hidden md:block">Tipo</div>
                            <div className="col-span-3 md:col-span-2 text-right">Tamaño</div>
                            <div className="col-span-3 md:col-span-2 text-right">Modificado</div>
                          </div>
                          
                          {nubeFiles.map((file) => (
                            <div
                              key={file.fullPath}
                              onClick={() => {
                                if (file.isFolder) setCurrentPath(file.fullPath);
                              }}
                              className={cn(
                                "grid grid-cols-12 gap-4 px-6 py-4 items-center group transition-colors",
                                file.isFolder ? "cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800/50" : "hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30"
                              )}
                            >
                              <div className="col-span-6 md:col-span-5 flex items-center gap-4">
                                {file.isFolder ? (
                                  <Folder className="size-5 text-blue-400 fill-blue-400/20" />
                                ) : (
                                  getFileIcon(file.contentType)
                                )}
                                <span className="font-medium text-sm truncate">{file.name}</span>
                              </div>
                              <div className="col-span-3 hidden md:block">
                                <span className="text-xs text-neutral-500 bg-neutral-100 dark:bg-neutral-800 px-2.5 py-1 rounded-md">
                                  {file.isFolder ? "Carpeta" : file.contentType.split("/")[1] || "Archivo"}
                                </span>
                              </div>
                              <div className="col-span-3 md:col-span-2 text-right">
                                <span className="text-sm font-mono text-neutral-600 dark:text-neutral-400">
                                  {file.isFolder ? "--" : formatBytes(file.size)}
                                </span>
                              </div>
                              <div className="col-span-3 md:col-span-2 text-right">
                                <span className="text-xs text-neutral-500">
                                  {file.isFolder ? "--" : new Date(file.updated).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-neutral-950 flex flex-col justify-center items-center">
        <div className="flex items-center gap-3 text-neutral-400 animate-pulse">
          <span className="font-semibold text-sm">Cargando consola...</span>
        </div>
      </div>
    }>
      <AdminDashboardContent />
    </Suspense>
  );
}
