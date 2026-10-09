"use client";

import { useEffect, useState } from "react";
import { Home, MapPin, MessageCircle, Pencil, Save, ShieldCheck, Users, X } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { AdminNav } from "@/components/admin-nav";
import { api, createLocation, fetchAdminLocations, fetchAdminUsers, fetchPendingProperties, reviewProperty, updateAdminUser, updateLocation, type AdminLocation, type AdminUser, type PendingPropertyReview } from "@/lib/api/client";
import { useAuth } from "@/lib/auth";

type AdminStats = { users: number; properties: number; pendingProperties: number; activeProperties: number; leads: number };
type UserUpdate = { name: string | null; role: string; isVerified: boolean; isBlocked: boolean };
const roles = ["BUYER", "SELLER", "BROKER", "AGENT", "ADMIN", "SUPER_ADMIN"] as const;
const locationTypes = ["CITY", "VILLAGE", "BLOCK", "DISTRICT"] as const;

export default function AdminManagement() {
  const { user, loading } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<PendingPropertyReview[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [locations, setLocations] = useState<AdminLocation[]>([]);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [newLocation, setNewLocation] = useState({ name: "", type: "VILLAGE" as typeof locationTypes[number] });

  useEffect(() => {
    if (!user || !["ADMIN", "SUPER_ADMIN"].includes(user.role)) return;
    void Promise.all([api.get<AdminStats>("/admin/dashboard"), fetchPendingProperties(), fetchAdminUsers(), fetchAdminLocations()]).then(([dashboard, items, userItems, locationItems]) => {
      setStats(dashboard);
      setPending(items);
      setUsers(userItems);
      setLocations(locationItems);
    }).catch(value => setError(value instanceof Error ? value.message : "Unable to load admin dashboard"));
  }, [user]);

  const updateUser = async (item: AdminUser, data: UserUpdate) => {
    try {
      const updated = await updateAdminUser(item.id, data);
      setUsers(items => items.map(current => current.id === updated.id ? updated : current));
      setEditingUser(null);
    } catch (value) { setError(value instanceof Error ? value.message : "Unable to update user"); }
  };

  const decide = async (propertyId: string, status: "ACTIVE" | "REJECTED") => {
    try {
      await reviewProperty(propertyId, status, [{ level: 1, name: "Seller identity", status: status === "ACTIVE" ? "VERIFIED" : "REJECTED" }]);
      setPending(items => items.filter(item => item.id !== propertyId));
      setStats(current => current ? { ...current, pendingProperties: Math.max(0, current.pendingProperties - 1), activeProperties: status === "ACTIVE" ? current.activeProperties + 1 : current.activeProperties } : current);
    } catch (value) { setError(value instanceof Error ? value.message : "Unable to update review"); }
  };

  const addLocation = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!newLocation.name.trim()) return;
    try {
      const created = await createLocation(newLocation);
      setLocations(items => [...items, created].sort((left, right) => left.name.localeCompare(right.name)));
      setNewLocation({ name: "", type: "VILLAGE" });
    } catch (value) { setError(value instanceof Error ? value.message : "Unable to create location"); }
  };

  const editLocation = async (location: AdminLocation) => {
    const name = window.prompt("Location name", location.name);
    if (!name || name.trim() === location.name) return;
    try {
      const updated = await updateLocation(location.id, { name: name.trim() });
      setLocations(items => items.map(item => item.id === updated.id ? updated : item));
    } catch (value) { setError(value instanceof Error ? value.message : "Unable to update location"); }
  };

  const toggleLocation = async (location: AdminLocation) => {
    try {
      const updated = await updateLocation(location.id, { isActive: !location.isActive });
      setLocations(items => items.map(item => item.id === updated.id ? updated : item));
    } catch (value) { setError(value instanceof Error ? value.message : "Unable to update location"); }
  };

  if (loading) return <div className="min-h-screen bg-slate-bg" />;
  if (!user || !["ADMIN", "SUPER_ADMIN"].includes(user.role)) return <main className="flex min-h-screen items-center justify-center bg-slate-bg px-6 text-center"><div><ShieldCheck className="mx-auto h-10 w-10 text-red-500" /><h1 className="mt-4 text-2xl font-black text-slate-900">Admin access required</h1></div></main>;

  const cards = [["Users", stats?.users ?? 0, Users], ["Properties", stats?.properties ?? 0, Home], ["Pending review", stats?.pendingProperties ?? 0, ShieldCheck], ["Leads", stats?.leads ?? 0, MessageCircle]] as const;
  return <><Navbar /><main className="min-h-screen bg-slate-bg px-4 pb-16 pt-28 md:px-6"><div className="mx-auto max-w-7xl"><AdminNav /><p className="text-xs font-bold uppercase tracking-[0.18em] text-red-600">Operations</p><h1 className="mt-2 text-3xl font-black text-slate-950">Admin dashboard</h1>{error && <div className="mt-6 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"><span>{error}</span><button aria-label="Dismiss error" onClick={() => setError(null)}><X className="h-4 w-4" /></button></div>}<div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{cards.map(([label, value, Icon]) => <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5"><Icon className="h-5 w-5 text-agri-green" /><p className="mt-3 text-3xl font-black text-slate-950">{value}</p><p className="text-sm text-slate-500">{label}</p></div>)}</div>
<section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 md:p-7"><div className="flex items-center justify-between"><div><h2 className="text-xl font-black text-slate-950">Verification queue</h2><p className="mt-1 text-sm text-slate-500">Review documents and approve or reject pending listings.</p></div><span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">{pending.length} pending</span></div>{pending.length === 0 ? <p className="py-12 text-center text-sm text-slate-500">No properties waiting for review.</p> : <div className="mt-5 divide-y divide-slate-100">{pending.map(item => <div key={item.id} className="flex flex-col gap-4 py-5 lg:flex-row lg:items-center lg:justify-between"><div><h3 className="font-bold text-slate-900">{item.title}</h3><p className="mt-1 text-xs text-slate-500">{item.village} · Owner: {item.owner.name ?? item.owner.phone} · {item.documents.length} document(s)</p><p className="mt-2 text-xs font-semibold text-trust-blue">{item.documents.map(document => document.type).join(", ")}</p></div><div className="flex gap-2"><button onClick={() => void decide(item.id, "REJECTED")} className="rounded-xl border border-red-200 px-4 py-2 text-xs font-bold text-red-700">Reject</button><button onClick={() => void decide(item.id, "ACTIVE")} className="rounded-xl bg-agri-green px-4 py-2 text-xs font-bold text-white">Approve</button></div></div>)}</div>}</section>
<section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 md:p-7"><div><h2 className="text-xl font-black text-slate-950">People and roles</h2><p className="mt-1 text-sm text-slate-500">Edit buyer, seller, broker, agent, and administrator accounts.</p></div><div className="mt-5 divide-y divide-slate-100">{users.map(item => <div key={item.id} className="flex flex-col gap-3 py-4 lg:flex-row lg:items-center lg:justify-between">{editingUser === item.id ? <UserEditor item={item} canChangeRole={user.role === "SUPER_ADMIN"} onCancel={() => setEditingUser(null)} onSave={data => void updateUser(item, data)} /> : <><div><p className="font-bold text-slate-900">{item.name ?? "Unnamed user"}</p><p className="text-xs text-slate-500">{item.phone} · {item.role} · {item.isVerified ? "Verified" : "Unverified"} · {item.isBlocked ? "Blocked" : "Active"}</p></div><button onClick={() => setEditingUser(item.id)} className="inline-flex items-center gap-2 self-start rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700"><Pencil className="h-3.5 w-3.5" /> Edit</button></>}</div>)}</div></section>
<section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 md:p-7"><div className="flex items-start justify-between gap-4"><div><h2 className="text-xl font-black text-slate-950">Locations</h2><p className="mt-1 text-sm text-slate-500">Manage the locations available in property forms and search.</p></div><MapPin className="h-5 w-5 text-agri-green" /></div><form onSubmit={addLocation} className="mt-5 grid gap-3 md:grid-cols-[1fr_180px_auto]"><input value={newLocation.name} onChange={event => setNewLocation(current => ({ ...current, name: event.target.value }))} placeholder="New location name" className="rounded-xl border border-slate-200 px-3 py-2 text-sm" /><select value={newLocation.type} onChange={event => setNewLocation(current => ({ ...current, type: event.target.value as typeof locationTypes[number] }))} className="rounded-xl border border-slate-200 px-3 py-2 text-sm">{locationTypes.map(type => <option key={type}>{type}</option>)}</select><button className="rounded-xl bg-agri-green px-4 py-2 text-sm font-bold text-white">Add location</button></form><div className="mt-5 grid gap-3 md:grid-cols-2">{locations.map(location => <div key={location.id} className="flex items-center justify-between rounded-xl border border-slate-100 p-4"><div><p className="font-bold text-slate-900">{location.name}</p><p className="text-xs text-slate-500">{location.type} · {location.isActive ? "Active" : "Inactive"}</p></div><div className="flex gap-2"><button aria-label={`Edit ${location.name}`} onClick={() => void editLocation(location)} className="rounded-lg border border-slate-200 p-2 text-slate-600"><Pencil className="h-3.5 w-3.5" /></button><button onClick={() => void toggleLocation(location)} className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-bold text-slate-600">{location.isActive ? "Disable" : "Enable"}</button></div></div>)}</div></section>
</div></main></>;
}

function UserEditor({ item, canChangeRole, onCancel, onSave }: { item: AdminUser; canChangeRole: boolean; onCancel: () => void; onSave: (data: UserUpdate) => void }) {
  const [name, setName] = useState(item.name ?? "");
  const [role, setRole] = useState(item.role);
  const [isVerified, setIsVerified] = useState(item.isVerified);
  const [isBlocked, setIsBlocked] = useState(item.isBlocked);
  return <div className="grid w-full gap-3 md:grid-cols-[1fr_160px_auto_auto_auto_auto] md:items-center"><input value={name} onChange={event => setName(event.target.value)} placeholder="Full name" className="rounded-lg border border-slate-200 px-3 py-2 text-sm" /><select value={role} onChange={event => setRole(event.target.value)} disabled={!canChangeRole} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">{roles.map(value => <option key={value}>{value}</option>)}</select><label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={isVerified} onChange={event => setIsVerified(event.target.checked)} /> Verified</label><label className="flex items-center gap-2 text-xs"><input type="checkbox" checked={isBlocked} onChange={event => setIsBlocked(event.target.checked)} /> Blocked</label><button onClick={() => onSave({ name: name.trim() || null, role, isVerified, isBlocked })} className="inline-flex items-center justify-center gap-2 rounded-lg bg-agri-green px-3 py-2 text-xs font-bold text-white"><Save className="h-3.5 w-3.5" /> Save</button><button onClick={onCancel} className="inline-flex items-center justify-center rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600">Cancel</button></div>;
}
