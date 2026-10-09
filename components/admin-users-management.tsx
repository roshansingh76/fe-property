"use client";

import { useEffect, useState } from "react";
import { Plus, Search, Pencil, Trash2, ShieldCheck, ShieldOff, CheckCircle2, XCircle } from "lucide-react";
import { AdminPageShell } from "@/components/admin-page-shell";
import { fetchAdminUsers, updateAdminUser, type AdminUser } from "@/lib/api/client";
import { useAuth } from "@/lib/auth";
import {
  ConfirmDialog, EmptyState, ErrorBanner, RoleBadge,
  SectionCard, Spinner, inputCls,
} from "@/components/ui/dashboard-ui";

const ALL_ROLES = ["BUYER", "SELLER", "BROKER", "AGENT", "ADMIN", "SUPER_ADMIN"] as const;
type Role = typeof ALL_ROLES[number];
const TABS: { label: string; value: Role | "ALL" }[] = [
  { label: "All", value: "ALL" },
  { label: "Buyers", value: "BUYER" },
  { label: "Sellers", value: "SELLER" },
  { label: "Brokers", value: "BROKER" },
  { label: "Agents", value: "AGENT" },
  { label: "Admins", value: "ADMIN" },
];

const EMPTY: Partial<AdminUser> & { role: Role } = { name: null, role: "BUYER", isVerified: false, isBlocked: false };

export default function AdminUsersManagement() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<Role | "ALL">("ALL");

  // modal
  const [modal, setModal] = useState<{ open: boolean; user: AdminUser | null }>({ open: false, user: null });
  const [form, setForm] = useState<{ name: string; role: Role; isVerified: boolean; isBlocked: boolean }>({ name: "", role: "BUYER", isVerified: false, isBlocked: false });
  const [saving, setSaving] = useState(false);

  // delete confirm
  const [deleting, setDeleting] = useState<AdminUser | null>(null);

  useEffect(() => {
    fetchAdminUsers()
      .then(data => { setUsers(data); setLoading(false); })
      .catch(e => { setError(e instanceof Error ? e.message : "Failed to load users"); setLoading(false); });
  }, []);

  const filtered = users.filter(u => {
    if (tab !== "ALL" && u.role !== tab) return false;
    if (search) {
      const q = search.toLowerCase();
      return u.phone.includes(q) || (u.name ?? "").toLowerCase().includes(q);
    }
    return true;
  });

  const openEdit = (u: AdminUser) => {
    setForm({ name: u.name ?? "", role: u.role as Role, isVerified: u.isVerified, isBlocked: u.isBlocked });
    setModal({ open: true, user: u });
  };

  const openCreate = () => {
    setForm({ name: "", role: "BUYER", isVerified: false, isBlocked: false });
    setModal({ open: true, user: null });
  };

  const saveModal = async () => {
    if (!modal.user) return; // create not supported via admin (users sign up via OTP)
    setSaving(true);
    try {
      const updated = await updateAdminUser(modal.user.id, {
        name: form.name.trim() || null,
        role: form.role,
        isVerified: form.isVerified,
        isBlocked: form.isBlocked,
      });
      setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
      setModal({ open: false, user: null });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    try {
      await updateAdminUser(deleting.id, { isBlocked: true });
      setUsers(prev => prev.map(u => u.id === deleting.id ? { ...u, isBlocked: true } : u));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to block user");
    } finally {
      setDeleting(null);
    }
  };

  const quickToggle = async (u: AdminUser, key: "isVerified" | "isBlocked") => {
    try {
      const updated = await updateAdminUser(u.id, { [key]: !u[key] });
      setUsers(prev => prev.map(x => x.id === updated.id ? updated : x));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update");
    }
  };

  return (
    <AdminPageShell title="User management" description="Search, edit roles, verify and block accounts across all user types.">
      {error && <div className="mt-6"><ErrorBanner message={error} onDismiss={() => setError(null)} /></div>}

      {/* Toolbar */}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search name or phone…"
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm outline-none focus:border-agri-green focus:ring-2 focus:ring-agri-green/10"
          />
        </div>
        <div className="text-xs text-slate-500 font-medium">{filtered.length} user{filtered.length !== 1 ? "s" : ""}</div>
      </div>

      {/* Role tabs */}
      <div className="mt-4 flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {TABS.map(t => (
          <button key={t.value} onClick={() => setTab(t.value)}
            className={`whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-bold border transition-all ${tab === t.value ? "bg-agri-green text-white border-agri-green shadow-sm" : "bg-white text-slate-600 border-slate-200 hover:border-agri-green/40"}`}>
            {t.label}
            <span className="ml-1.5 opacity-60">
              {t.value === "ALL" ? users.length : users.filter(u => u.role === t.value).length}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <SectionCard title="" className="mt-4">
        {loading ? (
          <div className="flex justify-center py-14"><Spinner className="w-6 h-6 text-agri-green" /></div>
        ) : filtered.length === 0 ? (
          <EmptyState icon="👤" title="No users found" description={search ? "Try a different search." : "No users in this role."} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs text-slate-400 uppercase tracking-wide">
                  <th className="text-left px-5 py-3 font-semibold">User</th>
                  <th className="text-left px-3 py-3 font-semibold">Role</th>
                  <th className="text-left px-3 py-3 font-semibold hidden md:table-cell">Joined</th>
                  <th className="text-left px-3 py-3 font-semibold">Status</th>
                  <th className="text-right px-5 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50/60 transition-colors group">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-agri-green-50 flex items-center justify-center text-xs font-extrabold text-agri-green flex-shrink-0">
                          {(u.name ?? u.phone).charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{u.name ?? <span className="text-slate-400 italic">No name</span>}</p>
                          <p className="text-xs text-slate-500">{u.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3.5"><RoleBadge role={u.role} /></td>
                    <td className="px-3 py-3.5 hidden md:table-cell text-xs text-slate-500">
                      {new Date(u.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-3 py-3.5">
                      <div className="flex gap-1.5 flex-wrap">
                        {u.isVerified
                          ? <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-agri-green-50 text-agri-green border border-agri-green/20"><CheckCircle2 className="w-3 h-3" /> Verified</span>
                          : <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">Unverified</span>}
                        {u.isBlocked && <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200"><XCircle className="w-3 h-3" /> Blocked</span>}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => quickToggle(u, "isVerified")} title={u.isVerified ? "Unverify" : "Verify"}
                          className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:border-agri-green hover:text-agri-green transition-colors">
                          {u.isVerified ? <ShieldOff className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
                        </button>
                        <button onClick={() => openEdit(u)} title="Edit"
                          className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:border-agri-green hover:text-agri-green transition-colors">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        {u.id !== me?.id && (
                          <button onClick={() => setDeleting(u)} title={u.isBlocked ? "Already blocked" : "Block user"}
                            disabled={u.isBlocked}
                            className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:border-red-300 hover:text-red-500 transition-colors disabled:opacity-30">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      {/* Edit modal */}
      {modal.open && modal.user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setModal({ open: false, user: null })} />
          <div className="relative bg-white rounded-2xl shadow-modal w-full max-w-md p-6 z-10">
            <h3 className="text-lg font-extrabold text-slate-900 mb-1">Edit user</h3>
            <p className="text-xs text-slate-500 mb-5">{modal.user.phone}</p>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-600 mb-1.5 block">Full name</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Full name" className={inputCls()} />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 mb-1.5 block">Role</label>
                <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value as Role }))}
                  disabled={me?.role !== "SUPER_ADMIN"}
                  className={inputCls()}>
                  {ALL_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                {me?.role !== "SUPER_ADMIN" && <p className="text-xs text-slate-400 mt-1">Only super admin can change roles.</p>}
              </div>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
                  <input type="checkbox" checked={form.isVerified} onChange={e => setForm(f => ({ ...f, isVerified: e.target.checked }))} className="w-4 h-4 rounded accent-agri-green" />
                  Verified
                </label>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
                  <input type="checkbox" checked={form.isBlocked} onChange={e => setForm(f => ({ ...f, isBlocked: e.target.checked }))}
                    disabled={modal.user.id === me?.id} className="w-4 h-4 rounded accent-red-500" />
                  Blocked
                </label>
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button onClick={saveModal} disabled={saving} className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-agri-green text-white text-sm font-bold py-2.5 disabled:opacity-50">
                {saving && <Spinner />} Save changes
              </button>
              <button onClick={() => setModal({ open: false, user: null })} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Block confirm */}
      <ConfirmDialog
        open={!!deleting}
        title="Block this user?"
        message={`${deleting?.name ?? deleting?.phone} will be blocked from accessing the platform.`}
        confirmLabel="Block"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setDeleting(null)}
      />
    </AdminPageShell>
  );
}
