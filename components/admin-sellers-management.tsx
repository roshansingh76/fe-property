"use client";

/**
 * Reusable admin management page for SELLER and BROKER roles.
 * Usage: <AdminSellersManagement role="SELLER" /> or role="BROKER"
 */

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Search, Pencil, Trash2, ShieldCheck, ShieldOff,
  CheckCircle2, XCircle, Eye, X, Home, MessageCircle,
  Phone, ChevronRight, ArrowLeft, Users,
  Star, StarOff, CheckCircle, Ban, BarChart3,
} from "lucide-react";
import { AdminPageShell } from "@/components/admin-page-shell";
import {
  fetchAdminUsers, fetchAdminSellerDetail,
  updateAdminUser, reviewProperty, updateAdminProperty,
  deleteAdminProperty, type AdminUser, type AdminSellerDetail,
  type AdminSellerProperty,
} from "@/lib/api/client";
import { useAuth } from "@/lib/auth";
import {
  ConfirmDialog, EmptyState, ErrorBanner,
  SectionCard, Spinner, StatusBadge, inputCls,
} from "@/components/ui/dashboard-ui";
import { formatPrice } from "@/lib/utils/conversions";

// ── small helpers ─────────────────────────────────────────────────────────────

type RoleType = "SELLER" | "BROKER";

const ROLE_STYLE: Record<RoleType, { avatar: string; accent: string; gradient: string }> = {
  SELLER: {
    avatar: "bg-agri-green-50 text-agri-green",
    accent:  "text-agri-green",
    gradient: "from-agri-green via-forest-600 to-forest-800",
  },
  BROKER: {
    avatar: "bg-violet-50 text-violet-700",
    accent:  "text-violet-700",
    gradient: "from-violet-500 via-violet-600 to-violet-800",
  },
};

function Avatar({ name, phone, role, size = "md" }: { name: string | null; phone: string; role: RoleType; size?: "sm" | "md" | "lg" }) {
  const letter = (name ?? phone).charAt(0).toUpperCase();
  const sz = size === "lg" ? "w-14 h-14 text-xl" : size === "sm" ? "w-7 h-7 text-xs" : "w-9 h-9 text-sm";
  return (
    <div className={`${sz} rounded-full font-extrabold flex items-center justify-center flex-shrink-0 ${ROLE_STYLE[role].avatar}`}>
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

// ── Detail panel ──────────────────────────────────────────────────────────────

function SellerDetailPanel({
  userId, role, onBack, onUpdated, isSuperAdmin,
}: {
  userId: string;
  role: RoleType;
  onBack: () => void;
  onUpdated: (u: AdminUser) => void;
  isSuperAdmin: boolean;
}) {
  const [seller, setSeller] = useState<AdminSellerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState({ name: "", isVerified: false, isBlocked: false, role: role as string });
  const [saving, setSaving] = useState(false);
  const [blockConfirm, setBlockConfirm] = useState(false);
  const [propAction, setPropAction] = useState<{ prop: AdminSellerProperty; action: "approve" | "reject" | "delete" | "feature" } | null>(null);

  const label = role === "BROKER" ? "broker" : "seller";

  useEffect(() => {
    fetchAdminSellerDetail(userId)
      .then(data => {
        setSeller(data);
        setForm({ name: data.name ?? "", isVerified: data.isVerified, isBlocked: data.isBlocked, role: data.role });
        setLoading(false);
      })
      .catch(e => { setError(e instanceof Error ? e.message : `Failed to load ${label}`); setLoading(false); });
  }, [userId, label]);

  const saveEdit = async () => {
    if (!seller) return;
    setSaving(true);
    try {
      const updated = await updateAdminUser(seller.id, {
        name: form.name.trim() || null,
        isVerified: form.isVerified,
        isBlocked: form.isBlocked,
        ...(isSuperAdmin ? { role: form.role } : {}),
      });
      setSeller(prev => prev ? { ...prev, ...updated } : prev);
      onUpdated(updated);
      setEditOpen(false);
    } catch (e) { setError(e instanceof Error ? e.message : "Failed to save"); }
    finally { setSaving(false); }
  };

  const confirmBlock = async () => {
    if (!seller) return;
    try {
      const updated = await updateAdminUser(seller.id, { isBlocked: !seller.isBlocked });
      setSeller(prev => prev ? { ...prev, isBlocked: updated.isBlocked } : prev);
      onUpdated(updated);
    } catch (e) { setError(e instanceof Error ? e.message : "Failed to update"); }
    finally { setBlockConfirm(false); }
  };

  const quickVerify = async () => {
    if (!seller) return;
    try {
      const updated = await updateAdminUser(seller.id, { isVerified: !seller.isVerified });
      setSeller(prev => prev ? { ...prev, isVerified: updated.isVerified } : prev);
      onUpdated(updated);
    } catch (e) { setError(e instanceof Error ? e.message : "Failed to update"); }
  };

  const executePropAction = async () => {
    if (!propAction || !seller) return;
    const { prop, action } = propAction;
    setPropAction(null);
    try {
      if (action === "approve") {
        await reviewProperty(prop.id, "ACTIVE", [{ level: 1, name: "Admin approval", status: "VERIFIED" }]);
        setSeller(prev => prev ? { ...prev, properties: prev.properties.map(p => p.id === prop.id ? { ...p, status: "ACTIVE" } : p) } : prev);
      } else if (action === "reject") {
        await reviewProperty(prop.id, "REJECTED", [{ level: 1, name: "Admin rejection", status: "REJECTED" }]);
        setSeller(prev => prev ? { ...prev, properties: prev.properties.map(p => p.id === prop.id ? { ...p, status: "REJECTED" } : p) } : prev);
      } else if (action === "feature") {
        const updated = await updateAdminProperty(prop.id, { featured: !prop.featured });
        setSeller(prev => prev ? { ...prev, properties: prev.properties.map(p => p.id === prop.id ? { ...p, featured: updated.featured } : p) } : prev);
      } else if (action === "delete") {
        await deleteAdminProperty(prop.id);
        setSeller(prev => prev ? { ...prev, properties: prev.properties.map(p => p.id === prop.id ? { ...p, status: "ARCHIVED" } : p) } : prev);
      }
    } catch (e) { setError(e instanceof Error ? e.message : "Action failed"); }
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner className="w-7 h-7 text-agri-green" /></div>;
  if (!seller) return <EmptyState icon="👤" title={`${label} not found`} />;

  const active = seller.properties.filter(p => p.status === "ACTIVE").length;
  const pending = seller.properties.filter(p => p.status === "PENDING").length;
  const totalViews = seller.properties.reduce((s, p) => s + p.viewCount, 0);
  const totalLeads = seller.properties.reduce((s, p) => s + p.leadCount, 0);

  const confirmMessages: Record<string, string> = {
    approve: `Approve "${propAction?.prop.title}" and make it live?`,
    reject: `Reject "${propAction?.prop.title}"?`,
    delete: `Archive "${propAction?.prop.title}"? It will be hidden from listings.`,
    feature: propAction?.prop.featured ? `Remove "${propAction?.prop.title}" from featured?` : `Feature "${propAction?.prop.title}" on the homepage?`,
  };

  return (
    <div>
      {error && <div className="mb-4"><ErrorBanner message={error} onDismiss={() => setError(null)} /></div>}

      <button onClick={onBack} className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-agri-green mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> All {label}s
      </button>

      {/* Profile card */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden mb-6">
        <div className={`h-1.5 bg-gradient-to-r ${ROLE_STYLE[role].gradient}`} />
        <div className="p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-center gap-4">
              <Avatar name={seller.name} phone={seller.phone} role={role} size="lg" />
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">
                  {seller.name ?? <span className="text-slate-400 italic font-normal">No name set</span>}
                </h2>
                <p className="text-sm text-slate-500 mt-0.5">{seller.phone}</p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${role === "BROKER" ? "bg-violet-50 text-violet-700 border-violet-200" : "bg-agri-green-50 text-agri-green border-agri-green/20"}`}>
                    {seller.role}
                  </span>
                  <VerifiedChip verified={seller.isVerified} />
                  <BlockedChip blocked={seller.isBlocked} />
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={quickVerify}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:border-agri-green hover:text-agri-green transition-colors">
                {seller.isVerified ? <ShieldOff className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                {seller.isVerified ? "Unverify" : "Verify"}
              </button>
              <button onClick={() => setEditOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:border-agri-green hover:text-agri-green transition-colors">
                <Pencil className="w-3.5 h-3.5" /> Edit
              </button>
              <button onClick={() => setBlockConfirm(true)}
                className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition-colors ${seller.isBlocked ? "border-agri-green/30 text-agri-green hover:bg-agri-green-50" : "border-red-200 text-red-600 hover:bg-red-50"}`}>
                {seller.isBlocked ? <CheckCircle className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5" />}
                {seller.isBlocked ? "Unblock" : "Block"}
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-5 grid grid-cols-2 gap-3 border-t border-slate-100 pt-5 sm:grid-cols-4">
            {[
              { label: "Listings", value: seller.properties.length, icon: "🏡" },
              { label: "Active", value: active, icon: "✅" },
              { label: "Views", value: totalViews, icon: "👁️" },
              { label: "Leads", value: totalLeads, icon: "💬" },
            ].map(s => (
              <div key={s.label} className="text-center p-3 rounded-xl bg-slate-50">
                <p className="text-lg">{s.icon}</p>
                <p className="text-2xl font-black text-slate-900 mt-1">{s.value}</p>
                <p className="text-xs text-slate-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Properties */}
      <SectionCard
        title={`${role === "BROKER" ? "Client" : "Own"} listings`}
        description={`All properties listed by this ${label}. Approve, reject, feature or delete from here.`}
      >
        {seller.properties.length === 0 ? (
          <EmptyState icon="🏡" title="No listings yet" description={`This ${label} hasn't listed any properties.`} />
        ) : (
          <div className="divide-y divide-slate-100">
            {seller.properties.map(prop => (
              <div key={prop.id} className="flex flex-col gap-3 px-5 py-4 hover:bg-slate-50/50 transition-colors sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-agri-green-50 flex items-center justify-center text-base flex-shrink-0">🌾</div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-slate-900 truncate">{prop.title}</p>
                      {prop.featured && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">⭐ Featured</span>}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {prop.village} · {prop.area} {prop.areaUnit} · {formatPrice(prop.price, true)}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {prop.category.replace(/_/g, " ")} · {prop.viewCount} views · {prop.leadCount} lead{prop.leadCount !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap shrink-0">
                  <StatusBadge status={prop.status} />

                  {/* Approve */}
                  {prop.status === "PENDING" && (
                    <button onClick={() => setPropAction({ prop, action: "approve" })}
                      className="inline-flex items-center gap-1 rounded-lg bg-agri-green px-2.5 py-1.5 text-xs font-bold text-white hover:opacity-90">
                      <CheckCircle className="w-3 h-3" /> Approve
                    </button>
                  )}

                  {/* Reject */}
                  {(prop.status === "PENDING" || prop.status === "ACTIVE") && (
                    <button onClick={() => setPropAction({ prop, action: "reject" })}
                      className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50">
                      Reject
                    </button>
                  )}

                  {/* View */}
                  {prop.status === "ACTIVE" && (
                    <Link href={`/property/${prop.slug}`} target="_blank"
                      className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:border-trust-blue hover:text-trust-blue transition-colors">
                      <Eye className="w-3.5 h-3.5" />
                    </Link>
                  )}

                  {/* Feature toggle */}
                  <button onClick={() => setPropAction({ prop, action: "feature" })}
                    title={prop.featured ? "Unfeature" : "Feature"}
                    className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:border-amber-400 hover:text-amber-500 transition-colors">
                    {prop.featured ? <StarOff className="w-3.5 h-3.5" /> : <Star className="w-3.5 h-3.5" />}
                  </button>

                  {/* Delete / archive */}
                  <button onClick={() => setPropAction({ prop, action: "delete" })}
                    disabled={prop.status === "ARCHIVED"}
                    title="Archive"
                    className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:border-red-300 hover:text-red-500 transition-colors disabled:opacity-30">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
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
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 capitalize">Edit {label}</h3>
                <p className="text-xs text-slate-500">{seller.phone}</p>
              </div>
              <button onClick={() => setEditOpen(false)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-600 mb-1.5 block">Full name</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder={`${label} name`} className={inputCls()} />
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

      {/* Block confirm */}
      <ConfirmDialog
        open={blockConfirm}
        title={seller.isBlocked ? `Unblock this ${label}?` : `Block this ${label}?`}
        message={seller.isBlocked
          ? `${seller.name ?? seller.phone} will regain access and their listings will remain.`
          : `${seller.name ?? seller.phone} will be blocked. Their listings will stay but they cannot log in.`}
        confirmLabel={seller.isBlocked ? "Unblock" : "Block"}
        danger={!seller.isBlocked}
        onConfirm={confirmBlock}
        onCancel={() => setBlockConfirm(false)}
      />

      {/* Property action confirm */}
      <ConfirmDialog
        open={!!propAction}
        title={propAction?.action === "approve" ? "Approve listing?" : propAction?.action === "reject" ? "Reject listing?" : propAction?.action === "delete" ? "Archive listing?" : "Toggle featured?"}
        message={propAction ? confirmMessages[propAction.action] ?? "" : ""}
        confirmLabel={propAction?.action === "approve" ? "Approve" : propAction?.action === "reject" ? "Reject" : propAction?.action === "delete" ? "Archive" : "Confirm"}
        danger={propAction?.action === "reject" || propAction?.action === "delete"}
        onConfirm={executePropAction}
        onCancel={() => setPropAction(null)}
      />
    </div>
  );
}

// ── Main list ─────────────────────────────────────────────────────────────────

export default function AdminSellersManagement({ role }: { role: RoleType }) {
  const { user: me } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [form, setForm] = useState({ name: "", isVerified: false, isBlocked: false, role: role as string });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<AdminUser | null>(null);

  const label = role === "BROKER" ? "broker" : "seller";
  const Label = role === "BROKER" ? "Broker" : "Seller";

  useEffect(() => {
    fetchAdminUsers()
      .then(all => { setUsers(all.filter(u => u.role === role)); setLoading(false); })
      .catch(e => { setError(e instanceof Error ? e.message : `Failed to load ${label}s`); setLoading(false); });
  }, [role, label]);

  const filtered = users.filter(u => {
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
      setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
      setEditing(null);
    } catch (e) { setError(e instanceof Error ? e.message : "Failed to save"); }
    finally { setSaving(false); }
  };

  const quickToggle = async (u: AdminUser, key: "isVerified" | "isBlocked") => {
    try {
      const updated = await updateAdminUser(u.id, { [key]: !u[key] });
      setUsers(prev => prev.map(x => x.id === updated.id ? updated : x));
    } catch (e) { setError(e instanceof Error ? e.message : "Failed to update"); }
  };

  const confirmBlock = async () => {
    if (!deleting) return;
    try {
      const updated = await updateAdminUser(deleting.id, { isBlocked: !deleting.isBlocked });
      setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
    } catch (e) { setError(e instanceof Error ? e.message : "Failed to update"); }
    finally { setDeleting(null); }
  };

  const handleUpdatedFromDetail = (updated: AdminUser) => {
    setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
  };

  // ── Detail view ──
  if (selectedId) {
    return (
      <AdminPageShell
        title={`${Label} detail`}
        description={`Full profile, listings, approval queue and stats for this ${label}.`}
      >
        <SellerDetailPanel
          userId={selectedId}
          role={role}
          onBack={() => setSelectedId(null)}
          onUpdated={handleUpdatedFromDetail}
          isSuperAdmin={me?.role === "SUPER_ADMIN"}
        />
      </AdminPageShell>
    );
  }

  // ── List view ──
  const verified = users.filter(u => u.isVerified).length;
  const blocked = users.filter(u => u.isBlocked).length;

  const accentChip = role === "BROKER"
    ? "border-violet-200 bg-violet-50 text-violet-700"
    : "border-agri-green/20 bg-agri-green-50 text-agri-green";

  return (
    <AdminPageShell
      title={`${Label} management`}
      description={`View, edit, approve and manage all ${label} accounts and their listings.`}
    >
      {error && <div className="mt-6"><ErrorBanner message={error} onDismiss={() => setError(null)} /></div>}

      {/* Summary chips */}
      <div className="mt-8 flex flex-wrap gap-3">
        <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3">
          <Users className="w-4 h-4 text-slate-400" />
          <span className="text-sm font-black text-slate-900">{users.length}</span>
          <span className="text-xs text-slate-500">Total {label}s</span>
        </div>
        <div className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-3 ${accentChip}`}>
          <CheckCircle2 className="w-4 h-4" />
          <span className="text-sm font-black">{verified}</span>
          <span className="text-xs opacity-70">Verified</span>
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
            placeholder={`Search ${label} name or phone…`}
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm outline-none focus:border-agri-green focus:ring-2 focus:ring-agri-green/10" />
        </div>
        <span className="text-xs text-slate-500 font-medium">{filtered.length} result{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      {/* Table */}
      <div className="mt-4 rounded-2xl border border-slate-200 bg-white overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><Spinner className="w-6 h-6 text-agri-green" /></div>
        ) : filtered.length === 0 ? (
          <EmptyState icon="👤" title={`No ${label}s found`} description={search ? "Try a different search." : `No ${label} accounts yet.`} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs text-slate-400 uppercase tracking-wide bg-slate-50/50">
                  <th className="text-left px-5 py-3 font-semibold">{Label}</th>
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
                        <Avatar name={u.name} phone={u.phone} role={role} size="sm" />
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
                        <button onClick={() => void quickToggle(u, "isVerified")}
                          title={u.isVerified ? "Unverify" : "Verify"}
                          className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:border-agri-green hover:text-agri-green transition-colors">
                          {u.isVerified ? <ShieldOff className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                        </button>
                        <button onClick={() => setSelectedId(u.id)}
                          title={`View ${label} profile`}
                          className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:border-trust-blue hover:text-trust-blue transition-colors">
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => openEdit(u)}
                          title="Edit"
                          className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:border-agri-green hover:text-agri-green transition-colors">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
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
                <h3 className="text-lg font-extrabold text-slate-900">Edit {label}</h3>
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
                  placeholder={`${Label} name`} className={inputCls()} />
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
              <button onClick={() => setEditing(null)}
                className="rounded-xl border border-slate-200 px-4 text-sm font-bold text-slate-600">Cancel</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleting}
        title={deleting?.isBlocked ? `Unblock this ${label}?` : `Block this ${label}?`}
        message={deleting?.isBlocked
          ? `${deleting?.name ?? deleting?.phone} will regain platform access.`
          : `${deleting?.name ?? deleting?.phone} will be blocked. Their listings remain but they cannot log in.`}
        confirmLabel={deleting?.isBlocked ? "Unblock" : "Block"}
        danger={!deleting?.isBlocked}
        onConfirm={confirmBlock}
        onCancel={() => setDeleting(null)}
      />
    </AdminPageShell>
  );
}
