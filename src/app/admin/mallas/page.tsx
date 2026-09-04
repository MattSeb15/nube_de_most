"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Plus,
  Edit2,
  Trash2,
  Search,
  Loader2,
  CheckCircle2,
  XCircle,
  GitBranch,
  Eye,
  Settings,
} from "lucide-react";
import type { Malla } from "@/types";

export default function MallasAdminPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [mallas, setMallas] = useState<Malla[]>([]);
  const [carreras, setCarreras] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // New malla form
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newPensum, setNewPensum] = useState("2026");
  const [newCarreraId, setNewCarreraId] = useState("");

  // Auth check
  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/admin");
        return;
      }
      const { data: profile } = await supabase
        .from("perfiles")
        .select("rol")
        .eq("id", user.id)
        .single();
      if (profile?.rol !== "admin") {
        router.push("/admin");
        return;
      }
      setAuthorized(true);
      setLoading(false);
    };
    checkAuth();
  }, []);

  const fetchCarreras = useCallback(async () => {
    const { data } = await supabase.from("carreras").select("*").order("nombre", { ascending: true });
    if (data) setCarreras(data);
  }, [supabase]);

  // Fetch mallas
  const fetchMallas = useCallback(async () => {
    const { data, error } = await supabase
      .from("mallas")
      .select("*, malla_materias(count), carreras(nombre)")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setMallas(
        data.map((m: any) => ({
          id: m.id,
          carreraId: m.carrera_id,
          carreraNombre: m.carreras?.nombre || "",
          nombre: m.nombre,
          slug: m.slug,
          descripcion: m.descripcion,
          pensum: m.pensum,
          activo: m.activo,
          createdAt: m.created_at,
          updatedAt: m.updated_at,
          materiasCount: m.malla_materias?.[0]?.count || 0,
        }))
      );
    }
  }, [supabase]);

  useEffect(() => {
    if (authorized) {
      fetchMallas();
      fetchCarreras();
    }
  }, [authorized, fetchMallas, fetchCarreras]);

  // Create malla
  const handleCreate = async () => {
    if (!newName.trim() || !newSlug.trim() || !newCarreraId) return;
    setSaving(true);
    setError("");

    const { data, error: err } = await supabase
      .from("mallas")
      .insert([
        {
          carrera_id: newCarreraId,
          nombre: newName.trim(),
          slug: newSlug.trim().toLowerCase().replace(/\s+/g, "-"),
          descripcion: newDesc.trim() || null,
          pensum: newPensum.trim() || "2026",
        },
      ])
      .select()
      .single();

    if (err) {
      setError(err.message);
    } else {
      setShowCreate(false);
      setNewName("");
      setNewSlug("");
      setNewDesc("");
      setNewPensum("2026");
      await fetchMallas();
    }
    setSaving(false);
  };

  // Toggle active
  const toggleActive = async (id: string, current: boolean) => {
    await supabase
      .from("mallas")
      .update({ activo: !current, updated_at: new Date().toISOString() })
      .eq("id", id);
    await fetchMallas();
  };

  // Delete malla
  const handleDelete = async (id: string, nombre: string) => {
    if (!confirm(`¿Eliminar la malla "${nombre}"? Esta acción no se puede deshacer.`)) return;
    await supabase.from("mallas").delete().eq("id", id);
    await fetchMallas();
  };

  // Auto-generate slug from name
  const handleNameChange = (name: string) => {
    setNewName(name);
    setNewSlug(
      name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim()
    );
  };

  const filteredMallas = mallas.filter(
    (m) =>
      m.nombre.toLowerCase().includes(search.toLowerCase()) ||
      m.slug.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!authorized) return null;

  return (
    <div className="flex flex-col h-screen bg-neutral-950">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
        <div className="flex items-center gap-3">
          <Link
            href="/admin?tab=dashboard"
            className="flex items-center gap-1 text-sm text-neutral-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Admin
          </Link>
          <span className="text-neutral-600">/</span>
          <div className="flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-primary" />
            <h1 className="text-lg font-bold text-white">Mallas Curriculares</h1>
          </div>
        </div>
        <Button
          onClick={() => setShowCreate(true)}
          size="sm"
          className="gap-1.5"
        >
          <Plus className="w-4 h-4" />
          Nueva Malla
        </Button>
      </header>

      {/* Create Form */}
      {showCreate && (
        <div className="px-6 py-4 border-b border-neutral-800 bg-neutral-900/50">
          <div className="grid gap-3 max-w-xl">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Crear Nueva Malla
            </h3>
            <select
              value={newCarreraId}
              onChange={(e) => setNewCarreraId(e.target.value)}
              className="flex h-10 w-full rounded-md bg-neutral-800 border border-neutral-700 px-3 py-2 text-sm text-white placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">Selecciona una carrera...</option>
              {carreras.map((c) => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
            <Input
              placeholder="Nombre (ej: Ingeniería en Software)"
              value={newName}
              onChange={(e) => handleNameChange(e.target.value)}
              className="bg-neutral-800 border-neutral-700"
            />
            <Input
              placeholder="Slug (auto-generado)"
              value={newSlug}
              onChange={(e) => setNewSlug(e.target.value)}
              className="bg-neutral-800 border-neutral-700"
            />
            <Input
              placeholder="Descripción (opcional)"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              className="bg-neutral-800 border-neutral-700"
            />
            <Input
              placeholder="Pensum (ej: 2026)"
              value={newPensum}
              onChange={(e) => setNewPensum(e.target.value)}
              className="bg-neutral-800 border-neutral-700"
            />
            {error && (
              <p className="text-xs text-red-400">{error}</p>
            )}
            <div className="flex gap-2">
              <Button onClick={handleCreate} disabled={saving || !newName.trim() || !newSlug.trim()} size="sm">
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                Crear
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCreate(false)}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="px-6 py-3 border-b border-neutral-800">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <Input
            placeholder="Buscar mallas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-neutral-800 border-neutral-700"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {filteredMallas.length === 0 ? (
          <div className="text-center py-16 text-neutral-500">
            <GitBranch className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-lg font-medium">No hay mallas creadas</p>
            <p className="text-sm mt-1">Crea una nueva malla para empezar a organizar el plan de estudios.</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {filteredMallas.map((malla) => (
              <div
                key={malla.id}
                className={cn(
                  "flex items-center justify-between p-4 rounded-xl border transition-all",
                  malla.activo
                    ? "bg-neutral-900 border-neutral-700 hover:border-primary/40"
                    : "bg-neutral-900/50 border-neutral-800 opacity-60"
                )}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-white truncate">{malla.nombre}</h3>
                    {malla.activo ? (
                      <Badge className="bg-green-500/10 text-green-400 border-green-500/30 text-[10px]">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Activa
                      </Badge>
                    ) : (
                      <Badge className="bg-neutral-500/10 text-neutral-400 border-neutral-500/30 text-[10px]">
                        <XCircle className="w-3 h-3 mr-1" />
                        Inactiva
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-neutral-400">
                    <span className="font-medium text-white">{malla.carreraNombre || "Sin carrera"}</span>
                    <span>•</span>
                    <span className="font-mono">{malla.slug}</span>
                    <span>•</span>
                    <span>Pensum {malla.pensum}</span>
                    <span>•</span>
                    <span>{malla.materiasCount || 0} materias</span>
                    {malla.descripcion && (
                      <>
                        <span>•</span>
                        <span className="truncate max-w-[200px]">{malla.descripcion}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 ml-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-neutral-400 hover:text-white"
                    onClick={() => toggleActive(malla.id, malla.activo)}
                    title={malla.activo ? "Desactivar" : "Activar"}
                  >
                    {malla.activo ? <Eye className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                  </Button>
                  <Link href={`/admin/mallas/${malla.id}/editor`}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 gap-1.5 text-neutral-400 hover:text-white"
                    >
                      <Settings className="w-4 h-4" />
                      Editor
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-neutral-400 hover:text-red-400"
                    onClick={() => handleDelete(malla.id, malla.nombre)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
