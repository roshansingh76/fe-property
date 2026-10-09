"use client";

import { useEffect, useState } from "react";
import { Pencil, X } from "lucide-react";
import { AdminPageShell } from "@/components/admin-page-shell";
import { createLocation, fetchAdminLocations, updateLocation, type AdminLocation } from "@/lib/api/client";

const types = ["CITY", "VILLAGE", "BLOCK", "DISTRICT"] as const;

export default function AdminLocationsPage() {
  const [locations, setLocations] = useState<AdminLocation[]>([]);
  const [form, setForm] = useState({ name: "", type: "VILLAGE" as typeof types[number] });
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { void fetchAdminLocations().then(setLocations).catch(value => setError(value instanceof Error ? value.message : "Unable to load locations")); }, []);
  const add = async (event: React.FormEvent) => { event.preventDefault(); if (!form.name.trim()) return; try { const item = await createLocation(form); setLocations(items => [...items, item]); setForm({ name: "", type: "VILLAGE" }); } catch (value) { setError(value instanceof Error ? value.message : "Unable to create location"); } };
  const rename = async (item: AdminLocation) => { const name = window.prompt("Location name", item.name)?.trim(); if (!name || name === item.name) return; try { const updated = await updateLocation(item.id, { name }); setLocations(items => items.map(current => current.id === updated.id ? updated : current)); } catch (value) { setError(value instanceof Error ? value.message : "Unable to update location"); } };
  const toggle = async (item: AdminLocation) => { try { const updated = await updateLocation(item.id, { isActive: !item.isActive }); setLocations(items => items.map(current => current.id === updated.id ? updated : current)); } catch (value) { setError(value instanceof Error ? value.message : "Unable to update location"); } };
  return <AdminPageShell title="Location management" description="Add, rename, enable, and disable locations used throughout the marketplace.">{error && <div className="mt-6 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"><span>{error}</span><button aria-label="Dismiss error" onClick={() => setError(null)}><X className="h-4 w-4" /></button></div>}<section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 md:p-7"><form onSubmit={add} className="grid gap-3 md:grid-cols-[1fr_180px_auto]"><input value={form.name} onChange={event => setForm(current => ({ ...current, name: event.target.value }))} placeholder="Location name" className="rounded-xl border border-slate-200 px-3 py-2 text-sm" /><select value={form.type} onChange={event => setForm(current => ({ ...current, type: event.target.value as typeof types[number] }))} className="rounded-xl border border-slate-200 px-3 py-2 text-sm">{types.map(type => <option key={type}>{type}</option>)}</select><button className="rounded-xl bg-agri-green px-4 py-2 text-sm font-bold text-white">Add location</button></form><div className="mt-6 grid gap-3 md:grid-cols-2">{locations.map(item => <div key={item.id} className="flex items-center justify-between rounded-xl border border-slate-100 p-4"><div><p className="font-bold text-slate-900">{item.name}</p><p className="text-xs text-slate-500">{item.type} · {item.isActive ? "Active" : "Inactive"}</p></div><div className="flex gap-2"><button aria-label={`Edit ${item.name}`} onClick={() => void rename(item)} className="rounded-lg border border-slate-200 p-2 text-slate-600"><Pencil className="h-3.5 w-3.5" /></button><button onClick={() => void toggle(item)} className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-bold text-slate-600">{item.isActive ? "Disable" : "Enable"}</button></div></div>)}</div></section></AdminPageShell>;
}
