"use client";

import { useEffect, useState } from "react";
import {
  Search, Pencil, Trash2, ShieldCheck, ShieldOff,
  CheckCircle2, XCircle, Eye, X, Bookmark,
  MessageCircle, CalendarCheck, Phone, ChevronRight,
  ArrowLeft, Users,
} from "lucide-react";
import { AdminPageShell } from "@/components/admin-page-shell";
import {
  fetchAdminUsers, fetchAdminBuyerDetail,
  updateAdminUser, type AdminUser, type AdminBuyerDetail,
} from "@/lib/api/client";
import { useAuth } from "@/lib/auth";
import {
  ConfirmDialog, EmptyState, ErrorBanner, LeadStatusBadge,
  SectionCard, Spinner, StatusBadge, inputCls,
} from "@/components/ui/dashboard-ui";
import { formatPrice } from "@/lib/utils/conversions";

// ── helpers ──────────────────────────────────────────────────────────────────

function Avatar({ name, phone, size = "md" }: { name: string | null; phone: string; size?: "sm" | "md" | "lg" }) {
  const letter = (name ?? phone).charAt(0).toUpperCase();
  const sz = size === "lg" ? "w-14 h-14 text-xl" : size === "sm" ? "w-7 h-7 text-xs" : "w-9 h-9 text-sm";
  return (
    <div className={`${sz} rounded-full bg-sky-100 text-sky-700 font-extrabold flex items-center justify-center flex-shrink-0`}>
      {letter}
    </div>
  );
}

function VerifiedChip({ verified }: { verified: boolean }) {
  return verified
    ? <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-agri-green-50 text-agri-green border border-agri-green/20"><CheckCircle2 className="w-3 h-3" />Verified</span>
    : <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">Unverified</span>;
}

function BlockedChip({ blocked }: { blocked: boolean }) {
  return blocked
    ? <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200"><XCircle className="w-3 h-3" />Blocked</span>
    : null;
}

// ── Detail panel ─────────────────────────────────────────────────────────────

function BuyerDetailPanel({
  buyerId,
  onBack,
  onUpdated,
  isSuperAdmin,
}: {
  buyerId: string;
  onBack: () => void;
  onUpdated: (u: AdminUser) => void;
  isSuperAdmin: boolean;
}) {
  const [buyer, setBuyer] = useState<AdminBuyerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState({ name: "", isVerified: false, isBlocked: false, role: "BUYER" });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState<"saves" | "leads" | "visits">("saves");

  useEffect(() => {
    fetchAdminBuyerDetail(buyerId)
      .then(data => {
        setBuyer(data);
        setForm({ name: data.name ?? "", isVerified: data.isVerified, isBlocked: data.isBlocked, role: data.role });
        setLoading(false);
      })
      .catch(e => { setError(e instanceof Error ? e.message : "Failed to load buyer"); setLoading(false); });
  }, [buyerId]);

  const saveEdit = async () => {
    if (!buyer) return;
    setSaving(true);
    try {
      const updated = await updateAdminUser(buyer.id, {
        name: form.name.trim() || null,
        isVerified: form.isVerified,
        isBlocked: form.isBlocked,
        ...(isSuperAdmin ? { role: form.role } : {}),
      });
      setBuyer(prev => prev ? { ...prev, ...updated } : prev);
      onUpdated(updated);
      setEditOpen(false);
    } catch (e) { setError(e instanceof Error ? e.message : "Failed to save"); }
    finally { setSaving(false); }
  };

  const confirmBlock = async () => {
    if (!buyer) return;
    try {
      const updated = await updateAdminUser(buyer.id, { isBlocked: !buyer.isBlocked });
      setBuyer(prev => prev ? { ...prev, isBlocked: updated.isBlocked } : prev);
      onUpdated(updated);
    } catch (e) { setError(e instanceof Error ? e.message : "Failed to update"); }
    finally { setDeleting(false); }
  };

  const quickVerify = async () => {
    if (!buyer) return;
    try {
      const updated = await updateAdminUser(buyer.id, { isVerified: !buyer.isVerified });
      setBuyer(prev => prev ? { ...prev, isVerified: updated.isVerified } : prev);
      onUpdated(updated);
    } catch (e) { setError(e instanceof Error ? e.message : "Failed to update"); }
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner className="w-7 h-7 text-agri-green" /></div>;
  if (!buyer) return <EmptyState icon="👤" title="Buyer not found" />;

  const tabs = [
    { key: "saves" as const, label: "Saved properties", count: buyer.savedProperties.length, icon: Bookmark },
    { key: "leads" as const, label: "Enquiries", count: buyer.leads.length, icon: MessageCircle },
    { key: "visits" as const, label: "Site visits", count: buyer.siteVisits.length, icon: CalendarCheck },
  ];

  return (
    <div>
      {error && <div className="mb-4"><ErrorBanner message={error} onDismiss={() => setError(null)} /></div>}

      {/* Back button */}
      <button onClick={onBack} className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-agri-green mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> All buyers
      </button>

      {/* Profile card */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden mb-6">
        <div className="h-1.5 bg-gradient-to-r from-sky-400 via-trust-blue to-agri-green" />
        <div className="p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-center gap-4">
              <Avatar name={buyer.name} phone={buyer.phone} size="lg" />
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">{buyer.name ?? <span className="text-slate-400 italic font-normal">No name set</span>}</h2>
                <p className="text-sm text-slate-500 mt-0.5">{buyer.phone}</p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border bg-sky-50 text-sky-700 border-sky-200">{buyer.role}</span>
                  <VerifiedChip verified={buyer.isVerified} />
                  <BlockedChip blocked={buyer.isBlocked} />
                </div>
              </div>
            </div>
            {/* Action buttons */}
            <div className="flex flex-wrap gap-2">
              <button onClick={quickVerify}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:border-agri-green hover:text-agri-green transition-colors">
                {buyer.isVerified ? <ShieldOff className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                {buyer.isVerified ? "Unverify" : "Verify"}
              </button>
              <button onClick={() => setEditOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:border-agri-green hover:text-agri-green transition-colors">
                <Pencil className="w-3.5 h-3.5" /> Edit
              </button>
              <button onClick={() => setDeleting(true)}
                className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition-colors ${buyer.isBlocked ? "border-agri-green/30 text-agri-green hover:bg-agri-green-50" : "border-red-200 text-red-600 hover:bg-red-50"}`}>
                <Trash2 className="w-3.5 h-3.5" />
                {buyer.isBlocked ? "Unblock" : "Block"}
              </button>
            </div>
          </div>

          {/* Stats row */}
          <div className="mt-5 grid grid-cols-3 gap-3 border-t border-slate-100 pt-5">
            {tabs.map(t => (
              <div key={t.key} className="text-center">
                <p className="text-2xl font-black text-slate-900">{t.count}</p>
                <p className="text-xs text-slate-500 mt-0.5">{t.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold border transition-all ${activeTab === t.key ? "bg-agri-green text-white border-agri-green" : "bg-white text-slate-600 border-slate-200 hover:border-agri-green/40"}`}>
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
            <span className="opacity-70">{t.count}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <SectionCard title="">
        {activeTab === "saves" && (
          buyer.savedProperties.length === 0
            ? <EmptyState icon="🔖" title="No saved properties" description="This buyer hasn't saved any listings yet." />
            : <div className="divide-y divide-slate-100">
              {buyer.savedProperties.map(s => (
                <div key={s.id} className="flex items-center justify-between px-5 py-3.5 gap-3 hover:bg-slate-50/50">
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 truncate">{s.property.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{s.property.village} · {formatPrice(s.property.price, true)}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <StatusBadge status={s.property.status} />
                    <span className="text-xs text-slate-400">{new Date(s.createdAt).toLocaleDateString("en-IN")}</span>
                  </div>
                </div>
              ))}
            </div>
        )}

        {activeTab === "leads" && (
          buyer.leads.length === 0
            ? <EmptyState icon="💬" title="No enquiries" description="This buyer hasn't submitted any enquiries yet." />
            : <div className="divide-y divide-slate-100">
              {buyer.leads.map(l => (
                <div key={l.id} className="flex items-center justify-between px-5 py-3.5 gap-3 hover:bg-slate-50/50">
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 truncate">{l.property.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{l.property.village}</p>
                    {l.message && <p className="text-xs text-slate-600 italic mt-1">&ldquo;{l.message}&rdquo;</p>}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <LeadStatusBadge status={l.status} />
                    <span className="text-xs text-slate-400">{new Date(l.createdAt).toLocaleDateString("en-IN")}</span>
                  </div>
                </div>
              ))}
            </div>
        )}

        {activeTab === "visits" && (
          buyer.siteVisits.length === 0
            ? <EmptyState icon="🗓️" title="No site visits" description="This buyer hasn't scheduled any site visits yet." />
            : <div className="divide-y divide-slate-100">
              {buyer.siteVisits.map(v => (
                <div key={v.id} className="flex items-center justify-between px-5 py-3.5 gap-3 hover:bg-slate-50/50">
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 truncate">{v.property.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{v.property.village}</p>
                    {v.note && <p className="text-xs text-slate-600 italic mt-1">&ldquo;{v.note}&rdquo;</p>}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <StatusBadge status={v.status} />
                    <span className="text-xs text-slate-400">{new Date(v.scheduledFor).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
                  </div>
                </div>
              ))}
            </div>
        )}
      </SectionCard>

      {/* Edit modal */}
      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setEditOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-modal w-full max-w-md p-6 z-10">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-extrabold text-slate-900">Edit buyer</h3>
              <button onClick={() => setEditOpen(false)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-600 mb-1.5 block">Full name</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Buyer's full name" className={inputCls()} />
              </div>
              {isSuperAdmin && (
                <div>
                  <label className="text-xs font-bold text-slate-600 mb-1.5 block">Role</label>
                  <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} className={inputCls()}>
                    {["BUYER", "SELLER", "BROKER", "AGENT", "ADMIN"].map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
              )}
              <div className="flex gap-6 pt-1">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
                  <input type="checkbox" checked={form.isVerified} onChange={e => setForm(f => ({ ...f, isVerified: e.target.checked }))}
                    className="w-4 h-4 rounded accent-agri-green" />
                  Verified
                </label>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
                  <input type="checkbox" checked={form.isBlocked} onChange={e => setForm(f => ({ ...f, isBlocked: e.target.checked }))}
                    className="w-4 h-4 rounded accent-red-500" />
                  Blocked
                </label>
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button onClick={saveEdit} disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-agri-green text-white text-sm font-bold py-2.5 disabled:opacity-50">
                {saving && <Spinner />} Save changes
              </button>
              <button onClick={() => setEditOpen(false)}
                className="rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-600">Cancel</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={deleting}
        title={buyer.isBlocked ? "Unblock this buyer?" : "Block this buyer?"}
        message={buyer.isBlocked
          ? `${buyer.name ?? buyer.phone} will regain access to the platform.`
          : `${buyer.name ?? buyer.phone} will be blocked from accessing the platform.`}
        confirmLabel={buyer.isBlocked ? "Unblock" : "Block"}
        danger={!buyer.isBlocked}
        onConfirm={confirmBlock}
        onCancel={() => setDeleting(false)}
      />
    </div>
  );
}

// ── Main list ─────────────────────────────────────────────────────────────────

export default function AdminBuyersManagement() {
  const { user: me } = useAuth();
  const [buyers, setBuyers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // edit modal (from list)
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [form, setForm] = useState({ name: "", isVerified: false, isBlocked: false, role: "BUYER" });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<AdminUser | null>(null);

  useEffect(() => {
    fetchAdminUsers()
      .then(all => { setBuyers(all.filter(u => u.role === "BUYER")); setLoading(false); })
      .catch(e => { setError(e instanceof Error ? e.message : "Failed to load"); setLoading(false); });
  }, []);

  const filtered = buyers.filter(u => {
    if (!search) return true;
    const q = search.toLowerCase();
    return u.phone.includes(q) || (u.name ?? "").toLowerCase().includes(q);
  });

  const openEdit = (u: AdminUser) => {
    setEditing(u);
    setForm({ name: u.name ?? "", isVerified: u.isVerified, isBlocked: u.isBlocked, role: u.role });
  };

  const saveEdit = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      const updated = await updateAdminUser(editing.id, {
        name: form.name.trim() || null,
        isVerified: form.isVerified,
        isBlocked: form.isBlocked,
        ...(me?.role === "SUPER_ADMIN" ? { role: form.role } : {}),
      });
      setBuyers(prev => prev.map(u => u.id === updated.id ? updated : u));
      setEditing(null);
    } catch (e) { setError(e instanceof Error ? e.message : "Failed to save"); }
    finally { setSaving(false); }
  };

  const quickToggle = async (u: AdminUser, key: "isVerified" | "isBlocked") => {
    try {
      const updated = await updateAdminUser(u.id, { [key]: !u[key] });
      setBuyers(prev => prev.map(x => x.id === updated.id ? updated : x));
    } catch (e) { setError(e instanceof Error ? e.message : "Failed to update"); }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    try {
      const updated = await updateAdminUser(deleting.id, { isBlocked: !deleting.isBlocked });
      setBuyers(prev => prev.map(u => u.id === updated.id ? updated : u));
    } catch (e) { setError(e instanceof Error ? e.message : "Failed to update"); }
    finally { setDeleting(null); }
  };

  const handleUpdatedFromDetail = (updated: AdminUser) => {
    setBuyers(prev => prev.map(u => u.id === updated.id ? updated : u));
  };

  // ── Detail view ──
  if (selectedId) {
    return (
      <AdminPageShell title="Buyer detail" description="Full profile, saved properties, enquiries and site visits.">
        <BuyerDetailPanel
          buyerId={selectedId}
          onBack={() => setSelectedId(null)}
          onUpdated={handleUpdatedFromDetail}
          isSuperAdmin={me?.role === "SUPER_ADMIN"}
        />
      </AdminPageShell>
    );
  }

  // ── List view ──
  const verified = buyers.filter(u => u.isVerified).length;
  const blocked = buyers.filter(u => u.isBlocked).length;

  return (
    <AdminPageShell title="Buyer management" description="View, edit, approve and block buyer accounts. Click a row to see full activity.">
      {error && <div className="mt-6"><ErrorBanner message={error} onDismiss={() => setError(null)} /></div>}

      {/* Summary chips */}
      <div className="mt-8 flex flex-wrap gap-3">
        <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3">
          <Users className="w-4 h-4 text-sky-500" />
          <span className="text-sm font-black text-slate-900">{buyers.length}</span>
          <span className="text-xs text-slate-500">Total buyers</span>
        </div>
        <div className="inline-flex items-center gap-2 rounded-2xl border border-agri-green/20 bg-agri-green-50 px-4 py-3">
          <CheckCircle2 className="w-4 h-4 text-agri-green" />
          <span className="text-sm font-black text-slate-900">{verified}</span>
          <span className="text-xs text-slate-500">Verified</span>
        </div>
        <div className="inline-flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
          <XCircle className="w-4 h-4 text-red-500" />
          <span className="text-sm font-black text-slate-900">{blocked}</span>
          <span className="text-xs text-slate-500">Blocked</span>
        </div>
      </div>

      {/* Search */}
      <div className="mt-5 flex items-center gap-3">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search name or phone…"
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm outline-none focus:border-agri-green focus:ring-2 focus:ring-agri-green/10" />
        </div>
        <span className="text-xs text-slate-500 font-medium">{filtered.length} result{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      {/* Table */}
      <div className="mt-4 rounded-2xl border border-slate-200 bg-white overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><Spinner className="w-6 h-6 text-agri-green" /></div>
        ) : filtered.length === 0 ? (
          <EmptyState icon="👤" title="No buyers found" description={search ? "Try a different search." : "No buyer accounts yet."} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs text-slate-400 uppercase tracking-wide bg-slate-50/50">
                  <th className="text-left px-5 py-3 font-semibold">Buyer</th>
                  <th className="text-left px-3 py-3 font-semibold hidden sm:table-cell">Phone</th>
                  <th className="text-left px-3 py-3 font-semibold hidden md:table-cell">Joined</th>
                  <th className="text-left px-3 py-3 font-semibold">Status</th>
                  <th className="text-right px-5 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(u => (
                  <tr key={u.id}
                    onClick={() => setSelectedId(u.id)}
                    className="hover:bg-slate-50/60 transition-colors cursor-pointer group">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar name={u.name} phone={u.phone} size="sm" />
                        <div>
                          <p className="font-bold text-slate-900 group-hover:text-agri-green transition-colors">
                            {u.name ?? <span className="text-slate-400 italic font-normal text-xs">No name</span>}
                          </p>
                          <p className="text-xs text-slate-500 sm:hidden">{u.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3.5 hidden sm:table-cell">
                      <a href={`tel:${u.phone}`} onClick={e => e.stopPropagation()}
                        className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-agri-green transition-colors">
                        <Phone className="w-3 h-3" /> {u.phone}
                      </a>
                    </td>
                    <td className="px-3 py-3.5 hidden md:table-cell text-xs text-slate-500">
                      {new Date(u.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-3 py-3.5">
                      <div className="flex gap-1.5 flex-wrap">
                        <VerifiedChip verified={u.isVerified} />
                        <BlockedChip blocked={u.isBlocked} />
                      </div>
                    </td>
                    <td className="px-5 py-3.5" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Approve / verify */}
                        <button onClick={() => void quickToggle(u, "isVerified")}
                          title={u.isVerified ? "Unverify" : "Approve (verify)"}
                          className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:border-agri-green hover:text-agri-green transition-colors">
                          {u.isVerified ? <ShieldOff className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                        </button>
                        {/* View detail */}
                        <button onClick={() => setSelectedId(u.id)}
                          title="View profile"
                          className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:border-trust-blue hover:text-trust-blue transition-colors">
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {/* Edit */}
                        <button onClick={() => openEdit(u)}
                          title="Edit"
                          className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:border-agri-green hover:text-agri-green transition-colors">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        {/* Block / Unblock */}
                        {u.id !== me?.id && (
                          <button onClick={() => setDeleting(u)}
                            title={u.isBlocked ? "Unblock" : "Block"}
                            className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:border-red-300 hover:text-red-500 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-agri-green transition-colors" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setEditing(null)} />
          <div className="relative bg-white rounded-2xl shadow-modal w-full max-w-md p-6 z-10">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">Edit buyer</h3>
                <p className="text-xs text-slate-500">{editing.phone}</p>
              </div>
              <button onClick={() => setEditing(null)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-600 mb-1.5 block">Full name</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Buyer's name" className={inputCls()} />
              </div>
              {me?.role === "SUPER_ADMIN" && (
                <div>
                  <label className="text-xs font-bold text-slate-600 mb-1.5 block">Role</label>
                  <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} className={inputCls()}>
                    {["BUYER", "SELLER", "BROKER", "AGENT", "ADMIN"].map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
              )}
              <div className="flex gap-6 pt-1">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
                  <input type="checkbox" checked={form.isVerified} onChange={e => setForm(f => ({ ...f, isVerified: e.target.checked }))}
                    className="w-4 h-4 rounded accent-agri-green" />
                  Verified (Approved)
                </label>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
                  <input type="checkbox" checked={form.isBlocked} onChange={e => setForm(f => ({ ...f, isBlocked: e.target.checked }))}
                    className="w-4 h-4 rounded accent-red-500" />
                  Blocked
                </label>
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button onClick={saveEdit} disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-agri-green text-white text-sm font-bold py-2.5 disabled:opacity-50">
                {saving && <Spinner />} Save changes
              </button>
              <button onClick={() => setEditing(null)}
                className="rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-600">Cancel</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleting}
        title={deleting?.isBlocked ? "Unblock this buyer?" : "Block this buyer?"}
        message={deleting?.isBlocked
          ? `${deleting?.name ?? deleting?.phone} will regain platform access.`
          : `${deleting?.name ?? deleting?.phone} will be blocked from the platform.`}
        confirmLabel={deleting?.isBlocked ? "Unblock" : "Block"}
        danger={!deleting?.isBlocked}
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </AdminPageShell>
  );
}
