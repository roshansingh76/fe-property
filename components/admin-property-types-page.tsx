"use client";

import { useEffect, useRef, useState } from "react";
import { GripVertical, Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { AdminPageShell } from "@/components/admin-page-shell";
import {
  createPropertyType,
  deletePropertyType,
  fetchAdminPropertyTypes,
  updatePropertyType,
  type AdminPropertyType,
} from "@/lib/api/client";

// ── helpers ──────────────────────────────────────────────────────────────────

const EMPTY_FORM = { key: "", label: "", description: "", icon: "", sortOrder: 0, isActive: true };
type FormState = typeof EMPTY_FORM;

function keyify(label: string) {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
}

const STATUS_COLORS: Record<string, string> = {
  active: "bg-agri-green-50 text-agri-green border-agri-green/20",
  inactive: "bg-slate-100 text-slate-500 border-slate-200",
};

// ── main component ───────────────────────────────────────────────────────────

export default function AdminPropertyTypesPage() {
  const [types, setTypes] = useState<AdminPropertyType[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // create form
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState<FormState>(EMPTY_FORM);
  const [keyTouched, setKeyTouched] = useState(false);
  const firstInput = useRef<HTMLInputElement>(null);

  // inline edit
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Omit<FormState, "key">>({ label: "", description: "", icon: "", sortOrder: 0, isActive: true });

  useEffect(() => {
    void fetchAdminPropertyTypes()
      .then(setTypes)
      .catch(err => setError(err instanceof Error ? err.message : "Unable to load property types"));
  }, []);

  // auto-generate key from label while untouched
  const handleCreateLabelChange = (label: string) => {
    setCreateForm(f => ({ ...f, label, ...(!keyTouched ? { key: keyify(label) } : {}) }));
  };

  const openCreate = () => {
    setCreateForm(EMPTY_FORM);
    setKeyTouched(false);
    setShowCreate(true);
    setTimeout(() => firstInput.current?.focus(), 50);
  };

  const submitCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const created = await createPropertyType({
        key: createForm.key,
        label: createForm.label,
        description: createForm.description || null,
        icon: createForm.icon || null,
        isActive: createForm.isActive,
        sortOrder: createForm.sortOrder,
      });
      setTypes(prev => [...prev, created].sort((a, b) => a.sortOrder - b.sortOrder || a.label.localeCompare(b.label)));
      setShowCreate(false);
      setCreateForm(EMPTY_FORM);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create property type");
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (item: AdminPropertyType) => {
    setEditingId(item.id);
    setEditForm({ label: item.label, description: item.description ?? "", icon: item.icon ?? "", sortOrder: item.sortOrder, isActive: item.isActive });
  };

  const submitEdit = async (item: AdminPropertyType) => {
    setSaving(true);
    setError(null);
    try {
      const updated = await updatePropertyType(item.id, {
        label: editForm.label,
        description: editForm.description || null,
        icon: editForm.icon || null,
        isActive: editForm.isActive,
        sortOrder: editForm.sortOrder,
      });
      setTypes(prev => prev.map(t => t.id === updated.id ? updated : t).sort((a, b) => a.sortOrder - b.sortOrder || a.label.localeCompare(b.label)));
      setEditingId(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update property type");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (item: AdminPropertyType) => {
    try {
      const updated = await updatePropertyType(item.id, { isActive: !item.isActive });
      setTypes(prev => prev.map(t => t.id === updated.id ? updated : t));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update property type");
    }
  };

  const remove = async (item: AdminPropertyType) => {
    if (!window.confirm(`Delete "${item.label}"? This cannot be undone.`)) return;
    try {
      await deletePropertyType(item.id);
      setTypes(prev => prev.filter(t => t.id !== item.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete property type");
    }
  };

  const active = types.filter(t => t.isActive).length;
  const inactive = types.length - active;

  return (
    <AdminPageShell
      title="Property types"
      description="Define the categories shown to sellers and buyers when listing or searching for property."
    >
      {/* error banner */}
      {error && (
        <div className="mt-6 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>{error}</span>
          <button aria-label="Dismiss" onClick={() => setError(null)}><X className="h-4 w-4" /></button>
        </div>
      )}

      {/* summary + add button */}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-3">
          <span className="rounded-full border border-agri-green/20 bg-agri-green-50 px-3 py-1 text-xs font-bold text-agri-green">
            {active} active
          </span>
          <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">
            {inactive} inactive
          </span>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-xl bg-agri-green px-4 py-2 text-sm font-bold text-white shadow-sm hover:opacity-90 transition-opacity"
        >
          <Plus className="h-4 w-4" /> Add property type
        </button>
      </div>

      {/* create form */}
      {showCreate && (
        <form
          onSubmit={submitCreate}
          className="mt-4 rounded-2xl border border-agri-green/30 bg-agri-green-50/40 p-5 md:p-6"
        >
          <h3 className="mb-4 text-sm font-extrabold text-slate-900">New property type</h3>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-600">Label <span className="text-red-500">*</span></label>
              <input
                ref={firstInput}
                required
                value={createForm.label}
                onChange={e => handleCreateLabelChange(e.target.value)}
                placeholder="e.g. Mango Orchard"
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-agri-green focus:outline-none focus:ring-2 focus:ring-agri-green/10"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-600">
                Key <span className="text-red-500">*</span>
                <span className="ml-1 font-normal text-slate-400">(unique, lowercase, underscores)</span>
              </label>
              <input
                required
                value={createForm.key}
                onChange={e => { setKeyTouched(true); setCreateForm(f => ({ ...f, key: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "") })); }}
                placeholder="e.g. mango_orchard"
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 font-mono text-sm focus:border-agri-green focus:outline-none focus:ring-2 focus:ring-agri-green/10"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-600">Icon <span className="text-slate-400 font-normal">(emoji or icon name)</span></label>
              <input
                value={createForm.icon}
                onChange={e => setCreateForm(f => ({ ...f, icon: e.target.value }))}
                placeholder="🥭"
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-agri-green focus:outline-none focus:ring-2 focus:ring-agri-green/10"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-600">Sort order</label>
              <input
                type="number"
                min={0}
                value={createForm.sortOrder}
                onChange={e => setCreateForm(f => ({ ...f, sortOrder: Number(e.target.value) }))}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-agri-green focus:outline-none focus:ring-2 focus:ring-agri-green/10"
              />
            </div>
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-xs font-bold text-slate-600">Description</label>
              <textarea
                value={createForm.description}
                onChange={e => setCreateForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Short description shown to buyers and sellers"
                rows={2}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-agri-green focus:outline-none focus:ring-2 focus:ring-agri-green/10"
              />
            </div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                checked={createForm.isActive}
                onChange={e => setCreateForm(f => ({ ...f, isActive: e.target.checked }))}
                className="h-4 w-4 rounded accent-agri-green"
              />
              Active (visible to users)
            </label>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-agri-green px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
            >
              <Save className="h-3.5 w-3.5" />
              {saving ? "Saving…" : "Create"}
            </button>
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* list */}
      <section className="mt-4 rounded-2xl border border-slate-200 bg-white">
        {/* table header */}
        <div className="hidden grid-cols-[28px_2fr_1fr_80px_80px_80px_120px] items-center gap-3 border-b border-slate-100 px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-400 md:grid">
          <span />
          <span>Label / Key</span>
          <span>Description</span>
          <span>Icon</span>
          <span>Order</span>
          <span>Status</span>
          <span className="text-right">Actions</span>
        </div>

        <div className="divide-y divide-slate-100">
          {types.length === 0 && (
            <p className="py-14 text-center text-sm text-slate-400">No property types yet. Add one above.</p>
          )}

          {types.map(item =>
            editingId === item.id ? (
              /* ── inline edit row ── */
              <div key={item.id} className="grid gap-3 bg-slate-50/60 p-4 md:grid-cols-[28px_2fr_1fr_80px_80px_80px_120px] md:items-center md:px-5 md:py-3">
                <GripVertical className="hidden h-4 w-4 text-slate-300 md:block" />
                <div className="flex flex-col gap-1">
                  <input
                    autoFocus
                    value={editForm.label}
                    onChange={e => setEditForm(f => ({ ...f, label: e.target.value }))}
                    placeholder="Label"
                    className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm focus:border-agri-green focus:outline-none"
                  />
                  <span className="font-mono text-xs text-slate-400">{item.key}</span>
                </div>
                <input
                  value={editForm.description}
                  onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Description"
                  className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm focus:border-agri-green focus:outline-none"
                />
                <input
                  value={editForm.icon}
                  onChange={e => setEditForm(f => ({ ...f, icon: e.target.value }))}
                  placeholder="🌾"
                  className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm focus:border-agri-green focus:outline-none"
                />
                <input
                  type="number"
                  min={0}
                  value={editForm.sortOrder}
                  onChange={e => setEditForm(f => ({ ...f, sortOrder: Number(e.target.value) }))}
                  className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm focus:border-agri-green focus:outline-none"
                />
                <label className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                  <input
                    type="checkbox"
                    checked={editForm.isActive}
                    onChange={e => setEditForm(f => ({ ...f, isActive: e.target.checked }))}
                    className="h-3.5 w-3.5 rounded accent-agri-green"
                  />
                  Active
                </label>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => void submitEdit(item)}
                    disabled={saving}
                    aria-label="Save"
                    className="inline-flex items-center gap-1 rounded-lg bg-agri-green px-3 py-1.5 text-xs font-bold text-white disabled:opacity-50"
                  >
                    <Save className="h-3 w-3" /> Save
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    aria-label="Cancel"
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              /* ── read row ── */
              <div
                key={item.id}
                className="grid gap-3 px-5 py-4 md:grid-cols-[28px_2fr_1fr_80px_80px_80px_120px] md:items-center"
              >
                <GripVertical className="hidden h-4 w-4 text-slate-300 md:block" />
                <div>
                  <p className="font-bold text-slate-900">{item.label}</p>
                  <p className="font-mono text-xs text-slate-400">{item.key}</p>
                </div>
                <p className="truncate text-xs text-slate-500">{item.description ?? <span className="italic text-slate-300">—</span>}</p>
                <p className="text-xl leading-none">{item.icon ?? <span className="text-xs text-slate-300">—</span>}</p>
                <p className="text-sm text-slate-600">{item.sortOrder}</p>
                <span
                  className={`w-fit rounded-full border px-2.5 py-0.5 text-xs font-bold ${
                    item.isActive ? STATUS_COLORS.active : STATUS_COLORS.inactive
                  }`}
                >
                  {item.isActive ? "Active" : "Inactive"}
                </span>
                <div className="flex flex-wrap justify-end gap-2">
                  <button
                    onClick={() => openEdit(item)}
                    aria-label={`Edit ${item.label}`}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                  >
                    <Pencil className="h-3 w-3" /> Edit
                  </button>
                  <button
                    onClick={() => void toggleActive(item)}
                    aria-label={item.isActive ? "Disable" : "Enable"}
                    className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                  >
                    {item.isActive ? "Disable" : "Enable"}
                  </button>
                  <button
                    onClick={() => void remove(item)}
                    aria-label={`Delete ${item.label}`}
                    className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-bold text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ),
          )}
        </div>
      </section>
    </AdminPageShell>
  );
}
