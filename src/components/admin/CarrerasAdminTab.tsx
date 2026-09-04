"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Search, Loader2, GraduationCap, Edit2, Save, X } from "lucide-react";
import { Carrera } from "@/types";

export function CarrerasAdminTab() {
  const [carreras, setCarreras] = useState<Carrera[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const supabase = createClient();

  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states (used for both create and edit)
  const [formName, setFormName] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formColor, setFormColor] = useState("#3b82f6");
  
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchCarreras = async () => {
    const { data, error } = await supabase
      .from("carreras")
      .select("*")
      .order("nombre", { ascending: true });

    if (!error && data) {
      setCarreras(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCarreras();
  }, []);

  const handleNameChange = (name: string) => {
    setFormName(name);
    if (!editingId) {
      setFormSlug(
        name
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-")
          .trim()
      );
    }
  };

  const handleSave = async () => {
    if (!formName.trim() || !formSlug.trim()) return;
    setSaving(true);
    setError("");

    const payload = {
      nombre: formName.trim(),
      slug: formSlug.trim(),
      descripcion: formDesc.trim() || null,
      color: formColor.trim() || "#3b82f6",
    };

    let err;
    if (editingId) {
      const { error: updateErr } = await supabase.from("carreras").update(payload).eq("id", editingId);
      err = updateErr;
    } else {
      const { error: insertErr } = await supabase.from("carreras").insert([payload]);
      err = insertErr;
    }

    if (err) {
      setError(err.message);
      setSaving(false);
    } else {
      resetForm();
      await fetchCarreras();
    }
  };

  const handleDelete = async (id: string, nombre: string) => {
    if (!confirm(`¿Eliminar la carrera "${nombre}"? Asegurate de borrar o cambiar las mallas asociadas antes.`)) return;
    await supabase.from("carreras").delete().eq("id", id);
    await fetchCarreras();
  };

  const startEdit = (c: Carrera) => {
    setEditingId(c.id);
    setFormName(c.nombre);
    setFormSlug(c.slug);
    setFormDesc(c.descripcion || "");
    setFormColor(c.color || "#3b82f6");
    setShowCreate(true);
    setError("");
  };

  const resetForm = () => {
    setShowCreate(false);
    setEditingId(null);
    setFormName("");
    setFormSlug("");
    setFormDesc("");
    setFormColor("#3b82f6");
    setError("");
    setSaving(false);
  };

  const filtered = carreras.filter(
    (c) =>
      c.nombre.toLowerCase().includes(search.toLowerCase()) ||
      c.slug.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-scale-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <Input
            placeholder="Buscar carreras..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800"
          />
        </div>
        <Button onClick={() => setShowCreate(true)} className="gap-1.5 shrink-0" disabled={showCreate}>
          <Plus className="w-4 h-4" />
          Nueva Carrera
        </Button>
      </div>

      {showCreate && (
        <div className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/30 shadow-sm">
          <div className="grid gap-4 max-w-xl">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
                {editingId ? "Editar Carrera" : "Crear Nueva Carrera"}
              </h3>
              <Button variant="ghost" size="icon" onClick={resetForm} className="h-6 w-6">
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="grid gap-3">
              <Input
                placeholder="Nombre (ej: Ingeniería en Software)"
                value={formName}
                onChange={(e) => handleNameChange(e.target.value)}
                className="bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700"
              />
              <Input
                placeholder="Slug (url, ej: software)"
                value={formSlug}
                onChange={(e) => setFormSlug(e.target.value)}
                className="bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700"
              />
              <Input
                placeholder="Descripción (opcional)"
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                className="bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700"
              />
              <Input
                placeholder="Color (ej: #3b82f6)"
                value={formColor}
                onChange={(e) => setFormColor(e.target.value)}
                className="bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 w-1/2"
              />
            </div>

            {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
            
            <div className="flex gap-2 pt-2">
              <Button onClick={handleSave} disabled={saving || !formName.trim() || !formSlug.trim()} size="sm" className="gap-1.5">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {editingId ? "Guardar Cambios" : "Crear Carrera"}
              </Button>
              <Button variant="outline" size="sm" onClick={resetForm}>
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}

      {filtered.length === 0 && !showCreate ? (
        <div className="text-center py-16 text-neutral-500 bg-white dark:bg-neutral-900/10 rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800">
          <GraduationCap className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium">No hay carreras creadas</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((c) => (
            <div key={c.id} className="flex items-center justify-between p-4 rounded-xl border bg-white dark:bg-neutral-900/50 border-neutral-200 dark:border-neutral-800 hover:border-primary/30 transition-colors">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <div 
                    className="w-2.5 h-2.5 rounded-full shadow-sm" 
                    style={{ backgroundColor: c.color }}
                  />
                  <h3 className="font-bold text-neutral-900 dark:text-white truncate">{c.nombre}</h3>
                </div>
                <div className="flex items-center gap-3 text-xs text-neutral-500 dark:text-neutral-400">
                  <span className="font-mono bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded text-neutral-600 dark:text-neutral-300">{c.slug}</span>
                  {c.descripcion && (
                    <>
                      <span>•</span>
                      <span className="truncate max-w-[250px]">{c.descripcion}</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1.5 ml-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-neutral-500 hover:text-primary hover:bg-primary/10"
                  onClick={() => startEdit(c)}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-neutral-500 hover:text-red-500 hover:bg-red-500/10"
                  onClick={() => handleDelete(c.id, c.nombre)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
