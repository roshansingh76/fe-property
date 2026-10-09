"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  CheckCircle2, Eye, ImagePlus, MessageCircle, Pencil,
  Phone, Plus, Search, Star, StarOff, Trash2, Upload, X,
  XCircle, ChevronDown,
} from "lucide-react";
import { AdminPageShell } from "@/components/admin-page-shell";
import {
  createAdminProperty, deleteAdminProperty, deletePropertyImage,
  fetchAdminLeads, fetchAdminProperties, fetchAdminUsers,
  reviewProperty, updateAdminProperty, uploadPropertyImages,
  type AdminLead, type AdminProperty, type AdminUser,
} from "@/lib/api/client";
import {
  ConfirmDialog, EmptyState, ErrorBanner, LeadStatusBadge,
  SectionCard, Spinner, StatusBadge, inputCls,
} from "@/components/ui/dashboard-ui";
import { formatPrice } from "@/lib/utils/conversions";
import { cn } from "@/lib/utils/cn";

// ── constants ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  "AGRICULTURAL_LAND","PADDY_WHEAT","SUGARCANE_FARM","MANGO_ORCHARD","POPLAR_PLANTATION",
  "FARMHOUSE","DAIRY_POULTRY","RESIDENTIAL_PLOT","COMMERCIAL_PROPERTY",
  "HIGHWAY_INVESTMENT","FISH_FARM",
] as const;

const STATUSES  = ["DRAFT","PENDING","ACTIVE","REJECTED","SOLD","ARCHIVED"] as const;
const UNITS     = ["BIGHA","ACRE","HECTARE","SQFT"] as const;

type Cat   = (typeof CATEGORIES)[number];
type Stat  = (typeof STATUSES)[number];
type Unit  = (typeof UNITS)[number];

type FormState = {
  title: string; category: Cat; village: string; price: string;
  area: string; areaUnit: Unit; status: Stat; ownerId: string;
  description: string; featured: boolean;
};

const emptyForm = (ownerId = ""): FormState => ({
  title: "", category: "AGRICULTURAL_LAND", village: "", price: "",
  area: "", areaUnit: "BIGHA", status: "PENDING", ownerId,
  description: "", featured: false,
});

const STATUS_TABS: { label: string; value: Stat | "ALL" }[] = [
  { label: "All",      value: "ALL"      },
  { label: "Pending",  value: "PENDING"  },
  { label: "Active",   value: "ACTIVE"   },
  { label: "Rejected", value: "REJECTED" },
  { label: "Sold",     value: "SOLD"     },
  { label: "Archived", value: "ARCHIVED" },
];

const LEAD_STATUSES = ["NEW","CONTACTED","QUALIFIED","SITE_VISIT","OFFER_MADE","CLOSED"] as const;

// ── helpers ──────────────────────────────────────────────────────────────────

const API_ORIGIN =
  (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1")
    .replace(/\/api\/v1\/?$/, "");

function fullImageUrl(url: string) {
  return url.startsWith("/") ? `${API_ORIGIN}${url}` : url;
}

// ── sub-component: image drawer ──────────────────────────────────────────────

function ImagesDrawer({
  property,
  onClose,
  onImagesChanged,
}: {
  property: AdminProperty;
  onClose: () => void;
  onImagesChanged: (id: string, images: string[]) => void;
}) {
  const [images, setImages]     = useState<string[]>(property.images ?? []);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting]  = useState<string | null>(null);
  const [error, setError]        = useState<string | null>(null);
  const inputRef                 = useRef<HTMLInputElement>(null);

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError(null);
    try {
      const updated = await uploadPropertyImages(property.id, files);
      setImages(updated);
      onImagesChanged(property.id, updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleDelete = async (imageUrl: string) => {
    setDeleting(imageUrl);
    setError(null);
    try {
      const updated = await deletePropertyImage(property.id, imageUrl);
      setImages(updated);
      onImagesChanged(property.id, updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setDeleting(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    void handleUpload(e.dataTransfer.files);
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <aside className="relative ml-auto w-full max-w-md bg-white shadow-2xl flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div>
            <h3 className="font-extrabold text-slate-900">Property Images</h3>
            <p className="text-xs text-slate-500 mt-0.5 truncate max-w-xs">{property.title}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}

          {/* Upload zone */}
          <div
            onDrop={handleDrop}
            onDragOver={e => e.preventDefault()}
            onClick={() => inputRef.current?.click()}
            className="group flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:border-agri-green hover:bg-agri-green-50/30 transition-all"
          >
            {uploading ? (
              <Spinner className="w-6 h-6 text-agri-green" />
            ) : (
              <>
                <Upload className="w-7 h-7 text-slate-300 group-hover:text-agri-green transition-colors" />
                <p className="text-sm font-semibold text-slate-600">Drop images here or click to upload</p>
                <p className="text-xs text-slate-400">JPG, PNG — multiple files allowed, 5MB each</p>
              </>
            )}
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            onChange={e => void handleUpload(e.target.files)}
          />

          {/* Image grid */}
          {images.length === 0 ? (
            <EmptyState icon="🖼️" title="No images yet" description="Upload photos to make this listing more attractive." />
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {images.map((url, idx) => {
                const full = fullImageUrl(url);
                const isDeleting = deleting === url;
                return (
                  <div key={url} className="relative group aspect-video rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={full}
                      alt={`Property image ${idx + 1}`}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <a
                        href={full}
                        target="_blank"
                        rel="noreferrer"
                        onClick={e => e.stopPropagation()}
                        className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/40 flex items-center justify-center text-white transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => void handleDelete(url)}
                        disabled={isDeleting}
                        className="w-8 h-8 rounded-lg bg-red-500/80 hover:bg-red-600 flex items-center justify-center text-white transition-colors disabled:opacity-50"
                      >
                        {isDeleting ? <Spinner className="w-3.5 h-3.5 text-white" /> : <Trash2 className="w-4 h-4" />}
                      </button>
                    </div>
                    {/* Index badge */}
                    <div className="absolute top-2 left-2 bg-black/50 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      {idx + 1}
                    </div>
                  </div>
                );
              })}

              {/* Add more tile */}
              <button
                onClick={() => inputRef.current?.click()}
                className="aspect-video rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-1.5 text-slate-400 hover:border-agri-green hover:text-agri-green transition-all"
              >
                <ImagePlus className="w-5 h-5" />
                <span className="text-xs font-semibold">Add more</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-slate-100 bg-slate-50">
          <p className="text-xs text-slate-400">
            {images.length} image{images.length !== 1 ? "s" : ""} · First image is used as cover photo
          </p>
        </div>
      </aside>
    </div>
  );
}

// ── sub-component: enquiries drawer ─────────────────────────────────────────

function EnquiriesDrawer({
  property,
  leads,
  onClose,
  onStatusChange,
}: {
  property: AdminProperty;
  leads: AdminLead[];
  onClose: () => void;
  onStatusChange: (leadId: string, status: string) => void;
}) {
  const [updating, setUpdating] = useState<string | null>(null);
  const [error, setError]       = useState<string | null>(null);
  const propLeads = leads.filter(l => l.property.id === property.id);

  const changeStatus = async (leadId: string, status: string) => {
    setUpdating(leadId);
    setError(null);
    try {
      const { updateAdminLeadStatus } = await import("@/lib/api/client");
      await updateAdminLeadStatus(leadId, status);
      onStatusChange(leadId, status);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update");
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <aside className="relative ml-auto w-full max-w-md bg-white shadow-2xl flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div>
            <h3 className="font-extrabold text-slate-900">Enquiries</h3>
            <p className="text-xs text-slate-500 mt-0.5 truncate max-w-xs">{property.title}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}

          {propLeads.length === 0 ? (
            <EmptyState icon="📭" title="No enquiries yet" description="Buyer enquiries for this property will appear here." />
          ) : (
            propLeads.map(lead => (
              <div key={lead.id} className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
                {/* Buyer info */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900">{lead.buyerName}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{lead.buyerPhone}</p>
                    {lead.buyerWhatsapp && lead.buyerWhatsapp !== lead.buyerPhone && (
                      <p className="text-xs text-slate-400">WA: {lead.buyerWhatsapp}</p>
                    )}
                    <p className="text-xs text-slate-400 mt-1">
                      {new Date(lead.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      {" · "}{lead.source}
                    </p>
                  </div>
                  <LeadStatusBadge status={lead.status} />
                </div>

                {/* Message */}
                {lead.message && (
                  <p className="text-xs text-slate-600 bg-slate-50 rounded-xl px-3 py-2 italic">
                    &ldquo;{lead.message}&rdquo;
                  </p>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 pt-1">
                  <a
                    href={`tel:${lead.buyerPhone}`}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 py-2 text-xs font-bold text-slate-600 hover:border-agri-green hover:text-agri-green transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" /> Call
                  </a>
                  {lead.buyerWhatsapp && (
                    <a
                      href={`https://wa.me/${lead.buyerWhatsapp.replace(/\D/g,"")}?text=${encodeURIComponent(`Hello, regarding your enquiry about: ${property.title}`)}`}
                      target="_blank" rel="noreferrer"
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 py-2 text-xs font-bold text-slate-600 hover:border-green-500 hover:text-green-600 transition-colors"
                    >
                      💬 WhatsApp
                    </a>
                  )}

                  {/* Status dropdown */}
                  <div className="relative">
                    <select
                      value={lead.status}
                      disabled={updating === lead.id}
                      onChange={e => void changeStatus(lead.id, e.target.value)}
                      className="appearance-none rounded-xl border border-slate-200 bg-white px-3 py-2 pr-7 text-xs font-bold text-slate-700 outline-none focus:border-agri-green cursor-pointer disabled:opacity-50"
                    >
                      {LEAD_STATUSES.map(s => (
                        <option key={s} value={s}>{s.replace("_"," ")}</option>
                      ))}
                    </select>
                    {updating === lead.id
                      ? <Spinner className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-agri-green" />
                      : <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                    }
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="px-5 py-4 border-t border-slate-100 bg-slate-50">
          <p className="text-xs text-slate-400">{propLeads.length} enquir{propLeads.length !== 1 ? "ies" : "y"} total</p>
        </div>
      </aside>
    </div>
  );
}

// ── main component ────────────────────────────────────────────────────────────

export default function AdminPropertiesManagement() {
  const [properties, setProperties] = useState<AdminProperty[]>([]);
  const [owners,     setOwners]     = useState<AdminUser[]>([]);
  const [leads,      setLeads]      = useState<AdminLead[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState<string | null>(null);
  const [search,     setSearch]     = useState("");
  const [tab,        setTab]        = useState<Stat | "ALL">("ALL");

  // form modal
  const [editing,   setEditing]   = useState<AdminProperty | null>(null);
  const [formOpen,  setFormOpen]  = useState(false);
  const [form,      setForm]      = useState<FormState>(emptyForm());
  const [saving,    setSaving]    = useState(false);

  // drawers
  const [imagesFor,   setImagesFor]   = useState<AdminProperty | null>(null);
  const [enquiriesFor, setEnquiriesFor] = useState<AdminProperty | null>(null);

  // delete confirm
  const [deleting, setDeleting] = useState<AdminProperty | null>(null);

  useEffect(() => {
    Promise.all([fetchAdminProperties(), fetchAdminUsers(), fetchAdminLeads()])
      .then(([props, users, l]) => {
        setProperties(props);
        setOwners(users.filter(u => ["SELLER","BROKER","AGENT","ADMIN","SUPER_ADMIN"].includes(u.role)));
        setLeads(l);
        setLoading(false);
      })
      .catch(e => { setError(e instanceof Error ? e.message : "Failed to load"); setLoading(false); });
  }, []);

  // ── filtering ──────────────────────────────────────────────────────────

  const filtered = properties.filter(p => {
    if (tab !== "ALL" && p.status !== tab) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        p.title.toLowerCase().includes(q) ||
        p.village.toLowerCase().includes(q) ||
        (p.owner.name ?? "").toLowerCase().includes(q) ||
        p.owner.phone.includes(q)
      );
    }
    return true;
  });

  // ── form helpers ───────────────────────────────────────────────────────

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm(owners[0]?.id ?? ""));
    setFormOpen(true);
  };

  const openEdit = (p: AdminProperty) => {
    setEditing(p);
    setForm({
      title: p.title,
      category: p.category as Cat,
      village: p.village,
      price: String(p.price),
      area: String(p.area),
      areaUnit: p.areaUnit as Unit,
      status: p.status as Stat,
      ownerId: p.owner.id,
      description: p.description ?? "",
      featured: p.featured ?? false,
    });
    setFormOpen(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, price: Number(form.price), area: Number(form.area) };
      const result = editing
        ? await updateAdminProperty(editing.id, payload)
        : await createAdminProperty(payload);
      setProperties(prev =>
        editing ? prev.map(p => p.id === result.id ? result : p) : [result, ...prev]
      );
      setFormOpen(false);
      setEditing(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  // ── review actions ─────────────────────────────────────────────────────

  const approve = async (p: AdminProperty) => {
    try {
      await reviewProperty(p.id, "ACTIVE", [{ level: 1, name: "Admin approval", status: "VERIFIED" }]);
      setProperties(prev => prev.map(x => x.id === p.id ? { ...x, status: "ACTIVE" } : x));
    } catch (e) { setError(e instanceof Error ? e.message : "Failed to approve"); }
  };

  const reject = async (p: AdminProperty) => {
    try {
      await reviewProperty(p.id, "REJECTED", [{ level: 1, name: "Admin rejection", status: "REJECTED" }]);
      setProperties(prev => prev.map(x => x.id === p.id ? { ...x, status: "REJECTED" } : x));
    } catch (e) { setError(e instanceof Error ? e.message : "Failed to reject"); }
  };

  const toggleFeatured = async (p: AdminProperty) => {
    try {
      const updated = await updateAdminProperty(p.id, { featured: !p.featured });
      setProperties(prev => prev.map(x => x.id === updated.id ? updated : x));
    } catch (e) { setError(e instanceof Error ? e.message : "Failed to update"); }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    try {
      await deleteAdminProperty(deleting.id);
      setProperties(prev => prev.map(x => x.id === deleting.id ? { ...x, status: "ARCHIVED" } : x));
    } catch (e) { setError(e instanceof Error ? e.message : "Failed to delete"); }
    finally { setDeleting(null); }
  };

  // ── drawer callbacks ───────────────────────────────────────────────────

  const handleImagesChanged = (propId: string, images: string[]) => {
    setProperties(prev => prev.map(p => p.id === propId ? { ...p, images } : p));
  };

  const handleLeadStatusChange = (leadId: string, status: string) => {
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status } : l));
  };

  const f = (k: keyof FormState, v: string | boolean) =>
    setForm(prev => ({ ...prev, [k]: v }));

  // ── helpers ────────────────────────────────────────────────────────────

  const leadsForProp = (id: string) => leads.filter(l => l.property.id === id);

  return (
    <AdminPageShell
      title="Property management"
      description="Create, edit, approve, manage images and enquiries for every listing."
    >
      {error && <div className="mt-6"><ErrorBanner message={error} onDismiss={() => setError(null)} /></div>}

      {/* Toolbar */}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search title, village, owner…"
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm outline-none focus:border-agri-green focus:ring-2 focus:ring-agri-green/10"
          />
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-xl bg-agri-green px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:opacity-90"
        >
          <Plus className="w-4 h-4" /> Add property
        </button>
      </div>

      {/* Status tabs */}
      <div className="mt-4 flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {STATUS_TABS.map(t => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={cn(
              "whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-bold border transition-all",
              tab === t.value
                ? "bg-agri-green text-white border-agri-green"
                : "bg-white text-slate-600 border-slate-200 hover:border-agri-green/40",
            )}
          >
            {t.label}
            <span className="ml-1.5 opacity-60">
              {t.value === "ALL" ? properties.length : properties.filter(p => p.status === t.value).length}
            </span>
          </button>
        ))}
      </div>

      {/* ── Property form modal ── */}
      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setFormOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto z-10">
            <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
              <h3 className="font-extrabold text-slate-900">{editing ? "Edit property" : "Add property"}</h3>
              <button onClick={() => setFormOpen(false)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={save} className="p-6 grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="text-xs font-bold text-slate-600 mb-1.5 block">Title <span className="text-red-500">*</span></label>
                <input required minLength={5} value={form.title} onChange={e => f("title", e.target.value)} placeholder="Property title" className={inputCls()} />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 mb-1.5 block">Village <span className="text-red-500">*</span></label>
                <input required value={form.village} onChange={e => f("village", e.target.value)} placeholder="Village" className={inputCls()} />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 mb-1.5 block">Category</label>
                <select value={form.category} onChange={e => f("category", e.target.value)} className={inputCls()}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c.replace(/_/g, " ")}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 mb-1.5 block">Price (₹) <span className="text-red-500">*</span></label>
                <input required type="number" min={1} value={form.price} onChange={e => f("price", e.target.value)} placeholder="e.g. 4500000" className={inputCls()} />
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-xs font-bold text-slate-600 mb-1.5 block">Area <span className="text-red-500">*</span></label>
                  <input required type="number" min={0.01} step={0.01} value={form.area} onChange={e => f("area", e.target.value)} placeholder="Area" className={inputCls()} />
                </div>
                <div className="w-28">
                  <label className="text-xs font-bold text-slate-600 mb-1.5 block">Unit</label>
                  <select value={form.areaUnit} onChange={e => f("areaUnit", e.target.value)} className={inputCls()}>
                    {UNITS.map(u => <option key={u}>{u}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 mb-1.5 block">Status</label>
                <select value={form.status} onChange={e => f("status", e.target.value)} className={inputCls()}>
                  {STATUSES.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 mb-1.5 block">
                  Owner {editing ? "(locked)" : <span className="text-red-500">*</span>}
                </label>
                <select required value={form.ownerId} onChange={e => f("ownerId", e.target.value)} disabled={!!editing} className={inputCls()}>
                  <option value="">Select owner</option>
                  {owners.map(o => <option key={o.id} value={o.id}>{o.name ?? o.phone} · {o.role}</option>)}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-bold text-slate-600 mb-1.5 block">Description</label>
                <textarea rows={3} value={form.description} onChange={e => f("description", e.target.value)} placeholder="Optional description" className={inputCls()} />
              </div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer md:col-span-2">
                <input type="checkbox" checked={form.featured} onChange={e => f("featured", e.target.checked)} className="w-4 h-4 rounded accent-harvest-gold" />
                Mark as featured
              </label>
              <div className="md:col-span-2 flex gap-2 pt-2">
                <button type="submit" disabled={saving} className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-agri-green text-white text-sm font-bold py-2.5 disabled:opacity-50">
                  {saving && <Spinner />} {editing ? "Save changes" : "Create property"}
                </button>
                <button type="button" onClick={() => setFormOpen(false)} className="rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-600">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── List ── */}
      <SectionCard title="" className="mt-4">
        {loading ? (
          <div className="flex justify-center py-14"><Spinner className="w-6 h-6 text-agri-green" /></div>
        ) : filtered.length === 0 ? (
          <EmptyState icon="🏡" title="No properties" description={search ? "Try different search terms." : "No listings in this status."} />
        ) : (
          <div className="divide-y divide-slate-50">
            {filtered.map(p => {
              const propLeadCount = leadsForProp(p.id).length;
              const coverImage = (p.images ?? [])[0];
              return (
                <div key={p.id} className="flex flex-col gap-3 px-5 py-4 hover:bg-slate-50/50 transition-colors lg:flex-row lg:items-center lg:justify-between">
                  {/* Left: thumbnail + info */}
                  <div className="flex items-start gap-3 min-w-0">
                    {/* Cover thumbnail */}
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-agri-green-50 flex-shrink-0 relative">
                      {coverImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={fullImageUrl(coverImage)}
                          alt={p.title}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xl">🏡</div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-slate-900 truncate max-w-xs">{p.title}</p>
                        {p.featured && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-harvest-gold-100 text-harvest-gold-dark border border-harvest-gold/20">
                            ⭐ Featured
                          </span>
                        )}
                        {(p.images ?? []).length > 0 && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                            📷 {(p.images ?? []).length}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {p.village} · {p.area} {p.areaUnit} · {formatPrice(p.price, true)}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Owner: {p.owner.name ?? p.owner.phone} · {p.category.replace(/_/g, " ")}
                      </p>
                    </div>
                  </div>

                  {/* Right: badges + actions */}
                  <div className="flex items-center gap-2 flex-wrap shrink-0">
                    <StatusBadge status={p.status} />

                    {p.status === "PENDING" && (
                      <>
                        <button
                          onClick={() => void approve(p)}
                          className="inline-flex items-center gap-1 rounded-lg bg-agri-green px-3 py-1.5 text-xs font-bold text-white hover:opacity-90"
                        >
                          <CheckCircle2 className="w-3 h-3" /> Approve
                        </button>
                        <button
                          onClick={() => void reject(p)}
                          className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50"
                        >
                          <XCircle className="w-3 h-3" /> Reject
                        </button>
                      </>
                    )}

                    {/* Enquiries button */}
                    <button
                      onClick={() => setEnquiriesFor(p)}
                      title="View enquiries"
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-bold transition-colors",
                        propLeadCount > 0
                          ? "border-trust-blue/30 bg-trust-blue-50 text-trust-blue hover:bg-trust-blue-100"
                          : "border-slate-200 text-slate-400 hover:border-slate-300",
                      )}
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      {propLeadCount > 0 ? propLeadCount : "0"}
                    </button>

                    {/* Images button */}
                    <button
                      onClick={() => setImagesFor(p)}
                      title="Manage images"
                      className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:border-violet-400 hover:text-violet-500 transition-colors"
                    >
                      <ImagePlus className="w-3.5 h-3.5" />
                    </button>

                    {/* Feature toggle */}
                    <button
                      onClick={() => void toggleFeatured(p)}
                      title={p.featured ? "Unfeature" : "Feature"}
                      className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:border-harvest-gold hover:text-harvest-gold transition-colors"
                    >
                      {p.featured ? <StarOff className="w-3.5 h-3.5" /> : <Star className="w-3.5 h-3.5" />}
                    </button>

                    {/* View live */}
                    {p.status === "ACTIVE" && (
                      <Link
                        href={`/property/${p.slug}`}
                        target="_blank"
                        className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:border-trust-blue hover:text-trust-blue transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Link>
                    )}

                    {/* Edit */}
                    <button
                      onClick={() => openEdit(p)}
                      className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:border-agri-green hover:text-agri-green transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>

                    {/* Archive */}
                    <button
                      onClick={() => setDeleting(p)}
                      disabled={p.status === "ARCHIVED"}
                      className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:border-red-300 hover:text-red-500 transition-colors disabled:opacity-30"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>

      {/* ── Drawers ── */}
      {imagesFor && (
        <ImagesDrawer
          property={imagesFor}
          onClose={() => setImagesFor(null)}
          onImagesChanged={handleImagesChanged}
        />
      )}

      {enquiriesFor && (
        <EnquiriesDrawer
          property={enquiriesFor}
          leads={leads}
          onClose={() => setEnquiriesFor(null)}
          onStatusChange={handleLeadStatusChange}
        />
      )}

      {/* ── Delete confirm ── */}
      <ConfirmDialog
        open={!!deleting}
        title="Archive this property?"
        message={`"${deleting?.title}" will be archived and hidden from listings.`}
        confirmLabel="Archive"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </AdminPageShell>
  );
}
