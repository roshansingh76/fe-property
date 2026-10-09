"use client";

import { useEffect, useState } from "react";
import { Save, X } from "lucide-react";
import { AdminPageShell } from "@/components/admin-page-shell";
import { fetchAdminUsers, updateAdminUser, type AdminUser } from "@/lib/api/client";
import { useAuth } from "@/lib/auth";

const roles = ["BUYER", "SELLER", "BROKER", "AGENT", "ADMIN", "SUPER_ADMIN"] as const;

export function AdminUsersPage({ roleFilter, title }: { roleFilter?: AdminUser["role"]; title: string }) {
  const { user } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetchAdminUsers().then(setUsers).catch(value => setError(value instanceof Error ? value.message : "Unable to load users"));
  }, []);

  const visibleUsers = roleFilter ? users.filter(item => item.role === roleFilter) : users;
  const save = async (item: AdminUser, data: { name: string | null; role: string; isVerified: boolean; isBlocked: boolean }) => {
    try {
      const updated = await updateAdminUser(item.id, data);
      setUsers(items => items.map(current => current.id === updated.id ? updated : current));
      setEditing(null);
    } catch (value) { setError(value instanceof Error ? value.message : "Unable to update user"); }
  };

  return <AdminPageShell title={title} description="Manage account details, verification, blocking, and role assignments from live data.">
    {error && <div className="mt-6 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"><span>{error}</span><button aria-label="Dismiss error" onClick={() => setError(null)}><X className="h-4 w-4" /></button></div>}
    <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 md:p-7"><div className="divide-y divide-slate-100">{visibleUsers.map(item => editing === item.id ? <UserEditor key={item.id} item={item} canChangeRole={user?.role === "SUPER_ADMIN"} onCancel={() => setEditing(null)} onSave={data => void save(item, data)} /> : <div key={item.id} className="flex flex-col gap-3 py-4 first:pt-0 lg:flex-row lg:items-center lg:justify-between"><div><p className="font-bold text-slate-900">{item.name ?? "Unnamed user"}</p><p className="text-xs text-slate-500">{item.phone} · {item.role} · {item.isVerified ? "Verified" : "Unverified"} · {item.isBlocked ? "Blocked" : "Active"}</p></div><button onClick={() => setEditing(item.id)} className="self-start rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700">Edit account</button></div>)}{visibleUsers.length === 0 && <p className="py-12 text-center text-sm text-slate-500">No accounts in this role.</p>}</div></section>
  </AdminPageShell>;
}

function UserEditor({ item, canChangeRole, onCancel, onSave }: { item: AdminUser; canChangeRole: boolean; onCancel: () => void; onSave: (data: { name: string | null; role: string; isVerified: boolean; isBlocked: boolean }) => void }) {
  const [name, setName] = useState(item.name ?? "");
  const [role, setRole] = useState(item.role);
  const [isVerified, setIsVerified] = useState(item.isVerified);
  const [isBlocked, setIsBlocked] = useState(item.isBlocked);
  return <div className="grid gap-3 py-4 md:grid-cols-[1fr_170px_auto_auto_auto_auto] md:items-center"><input value={name} onChange={event => setName(event.target.value)} placeholder="Full name" className="rounded-lg border border-slate-200 px-3 py-2 text-sm" /><select value={role} onChange={event => setRole(event.target.value)} disabled={!canChangeRole} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">{roles.map(value => <option key={value}>{value}</option>)}</select><label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={isVerified} onChange={event => setIsVerified(event.target.checked)} /> Verified</label><label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={isBlocked} onChange={event => setIsBlocked(event.target.checked)} /> Blocked</label><button onClick={() => onSave({ name: name.trim() || null, role, isVerified, isBlocked })} className="inline-flex items-center justify-center gap-2 rounded-lg bg-agri-green px-3 py-2 text-xs font-bold text-white"><Save className="h-3.5 w-3.5" /> Save</button><button onClick={onCancel} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600">Cancel</button></div>;
}
