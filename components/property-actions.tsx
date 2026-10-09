"use client";

import { useState } from "react";
import { Bookmark, CalendarDays, Check, Share2 } from "lucide-react";
import { createLead, requestSiteVisit, toggleSavedProperty } from "@/lib/api/client";

export function PropertyActions({ propertyId, title }: { propertyId: string; title: string }) {
  const [saved, setSaved] = useState(false);
  const [showEnquiry, setShowEnquiry] = useState(false);
  const [showVisit, setShowVisit] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const save = async () => {
    setBusy(true);
    try { setSaved(await toggleSavedProperty(propertyId)); setMessage("Saved state updated"); } catch { setMessage("Sign in to save properties"); } finally { setBusy(false); }
  };

  const share = async () => {
    if (navigator.share) await navigator.share({ title, url: window.location.href });
    else await navigator.clipboard.writeText(window.location.href);
    setMessage("Property link copied");
  };

  const submitEnquiry = async (form: HTMLFormElement) => {
    const data = new FormData(form);
    setBusy(true);
    try { await createLead({ propertyId, buyerName: String(data.get("name")), buyerPhone: String(data.get("phone")), message: String(data.get("message") ?? "") }); setMessage("Enquiry sent to the seller"); setShowEnquiry(false); } catch { setMessage("Unable to send enquiry"); } finally { setBusy(false); }
  };

  const submitVisit = async (form: HTMLFormElement) => {
    const data = new FormData(form);
    setBusy(true);
    try { await requestSiteVisit({ propertyId, scheduledFor: String(data.get("scheduledFor")), note: String(data.get("note") ?? "") }); setMessage("Site visit requested"); setShowVisit(false); } catch { setMessage("Sign in to request a site visit"); } finally { setBusy(false); }
  };

  return <div className="space-y-3"><div className="grid grid-cols-2 gap-2"><button onClick={() => void save()} disabled={busy} className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-3 text-sm font-bold text-slate-600 hover:border-agri-green hover:text-agri-green"><Bookmark className={`h-4 w-4 ${saved ? "fill-current text-harvest-gold" : ""}`} /> {saved ? "Saved" : "Save"}</button><button onClick={() => void share()} className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-3 text-sm font-bold text-slate-600 hover:border-agri-green hover:text-agri-green"><Share2 className="h-4 w-4" /> Share</button></div><div className="grid grid-cols-2 gap-2"><button onClick={() => setShowEnquiry(value => !value)} className="rounded-xl bg-agri-green py-3 text-sm font-extrabold text-white">Make enquiry</button><button onClick={() => setShowVisit(value => !value)} className="flex items-center justify-center gap-2 rounded-xl border border-agri-green py-3 text-sm font-extrabold text-agri-green"><CalendarDays className="h-4 w-4" /> Site visit</button></div>{message && <p className="flex items-center gap-1 text-xs font-semibold text-agri-green"><Check className="h-3.5 w-3.5" /> {message}</p>}{showEnquiry && <form onSubmit={event => { event.preventDefault(); void submitEnquiry(event.currentTarget); }} className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3"><input name="name" required placeholder="Your name" className="input-modern" /><input name="phone" required pattern="[6-9][0-9]{9}" placeholder="WhatsApp number" className="input-modern" /><textarea name="message" placeholder={`I am interested in ${title}`} className="input-modern resize-none" rows={2} /><button disabled={busy} className="w-full rounded-lg bg-agri-green py-2 text-xs font-bold text-white">Send enquiry</button></form>}{showVisit && <form onSubmit={event => { event.preventDefault(); void submitVisit(event.currentTarget); }} className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3"><input name="scheduledFor" required type="datetime-local" className="input-modern" /><textarea name="note" placeholder="Any timing or access note" className="input-modern resize-none" rows={2} /><button disabled={busy} className="w-full rounded-lg bg-agri-green py-2 text-xs font-bold text-white">Request visit</button></form>}</div>;
}