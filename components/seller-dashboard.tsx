"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight, BarChart3, BellRing, CalendarClock, Eye, Home,
  MessageCircle, Plus, Search, Send, ShieldCheck, Sparkles, Pencil,
  Trash2, ChevronDown, ChevronUp, Phone, Target, TrendingUp,
} from "lucide-react";
import { Navbar } from "@/components/navbar";
import { SellLandModal } from "@/components/sell-land-modal";
import {
  api, fetchMyProperties, fetchSellerLeads,
  deleteSellerProperty, updateSellerProperty, updateSellerLeadStatus, type SellerLead,
} from "@/lib/api/client";
import { useAuth } from "@/lib/auth";
import type { AgriProperty } from "@/lib/data/properties";
import { formatPrice } from "@/lib/utils/conversions";
import {
  ConfirmDialog, DashboardSignOutButton, EmptyState, ErrorBanner, LeadStatusBadge,
  PageSpinner, SectionCard, StatCard, StatusBadge,
} from "@/components/ui/dashboard-ui";

interface DashStats { listings: number; active: number; pending: number; sold: number; views: number; leads: number }
const LEAD_STATUSES = ["NEW", "CONTACTED", "QUALIFIED", "SITE_VISIT", "OFFER_MADE", "CLOSED"] as const;

export function SellerDashboard({ role }: { role: "SELLER" | "BROKER" }) {
  const { user, loading: authLoading } = useAuth();
  const [sellOpen, setSellOpen] = useState(false);
  const [properties, setProperties] = useState<AgriProperty[]>([]);
  const [leads, setLeads] = useState<SellerLead[]>([]);
  const [stats, setStats] = useState<DashStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedLeads, setExpandedLeads] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<AgriProperty | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState("");
  const [requestQuery, setRequestQuery] = useState("");
  const [requestStatus, setRequestStatus] = useState("ALL");
  const [updatingLeadId, setUpdatingLeadId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const dashEndpoint = role === "BROKER" ? "/broker/dashboard" : "/seller/dashboard";
    Promise.all([fetchMyProperties(), api.get<DashStats>(dashEndpoint), fetchSellerLeads()])
      .then(([props, dash, l]) => { setProperties(props); setStats(dash); setLeads(l); setLoading(false); })
      .catch(e => { setError(e instanceof Error ? e.message : "Failed to load"); setLoading(false); });
  }, [user, role]);

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await deleteSellerProperty(deleting.id);
      setProperties(prev => prev.filter(p => p.id !== deleting.id));
      if (stats) setStats({ ...stats, listings: stats.listings - 1 });
    } catch (e) { setError(e instanceof Error ? e.message : "Failed to delete"); }
    finally { setDeleting(null); }
  };

  const savePrice = async (prop: AgriProperty) => {
    const price = Number(editPrice);
    if (!price || price <= 0) return;
    try {
      const updated = await updateSellerProperty(prop.id, { price });
      setProperties(prev => prev.map(p => p.id === updated.id ? updated : p));
      setEditingId(null);
    } catch (e) { setError(e instanceof Error ? e.message : "Failed to update"); }
  };

  const leadsForProp = (propId: string) => leads.filter(l => l.property.id === propId);
  const visibleRequests = leads.filter(lead => {
    const query = requestQuery.trim().toLowerCase();
    const matchesQuery = !query || [lead.buyerName, lead.buyerPhone, lead.property.title, lead.property.village, lead.message ?? ""]
      .some(value => value.toLowerCase().includes(query));
    return matchesQuery && (requestStatus === "ALL" || lead.status === requestStatus);
  });

  const brokerMetrics = useMemo(() => {
    const totalPortfolioValue = properties.reduce((sum, property) => sum + property.price, 0);
    const totalLeads = leads.length;
    const qualified = leads.filter(lead => ["QUALIFIED", "SITE_VISIT", "OFFER_MADE", "CLOSED"].includes(lead.status)).length;
    const closed = leads.filter(lead => lead.status === "CLOSED").length;
    const avgLeadValue = totalLeads ? totalPortfolioValue / totalLeads : 0;
    const conversionRate = totalLeads ? (closed / totalLeads) * 100 : 0;
    const qualifiedRate = totalLeads ? (qualified / totalLeads) * 100 : 0;

    return {
      totalPortfolioValue,
      qualified,
      closed,
      conversionRate,
      qualifiedRate,
      avgLeadValue,
    };
  }, [leads, properties]);

  const funnelData = useMemo(() => LEAD_STATUSES.map(status => {
    const count = leads.filter(lead => lead.status === status).length;
    const total = leads.length || 1;
    return {
      status,
      count,
      pct: (count / total) * 100,
    };
  }), [leads]);

  const recommendedBuyers = useMemo(() => {
    return leads.slice(0, 3).map((lead, index) => {
      const property = properties.find(item => item.id === lead.property.id) ?? properties[0];
      const matchKeywords = ["highway", "farmhouse", "commercial", "investment", "sugarcane", "canal", "bigha"];
      const keywordHits = matchKeywords.filter(word => `${lead.message ?? ""} ${lead.property.title}`.toLowerCase().includes(word)).length;
      const score = Math.min(96, 62 + keywordHits * 9 + (lead.status === "QUALIFIED" ? 12 : 0) + index * 3 + (property?.featured ? 6 : 0));
      return {
        lead,
        property,
        score,
      };
    }).filter(item => item.property);
  }, [leads, properties]);

  const autoTemplates = [
    {
      label: "Follow-up 1",
      body: "Hi {buyerName}, this is {brokerName}. I found a strong matching option for your requirement near {village}. Would you like a WhatsApp walk-through or a site visit today?",
    },
    {
      label: "High-intent push",
      body: "Hi {buyerName}, the property matching your budget and location is still available. I can share the price, location, and ROI details in the next 10 minutes.",
    },
    {
      label: "Site visit reminder",
      body: "Hi {buyerName}, the site visit slot is still open tomorrow. I can arrange a guided visit and share the exact location details on WhatsApp.",
    },
  ];

  const updateLeadStatus = async (leadId: string, status: string) => {
    setUpdatingLeadId(leadId);
    setError(null);
    try {
      const updated = await updateSellerLeadStatus(leadId, status);
      setLeads(current => current.map(lead => lead.id === updated.id ? { ...lead, status: updated.status } : lead));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to update request");
    } finally {
      setUpdatingLeadId(null);
    }
  };

  if (authLoading || (user && loading)) return <PageSpinner />;
  if (!user || !["SELLER", "BROKER", "AGENT"].includes(user.role)) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-bg px-6">
        <div className="text-center">
          <h1 className="text-2xl font-black text-slate-900">Seller access required</h1>
          <Link href={role === "BROKER" ? "/broker/login" : "/login"} className="mt-4 inline-flex rounded-xl bg-agri-green px-5 py-3 text-sm font-bold text-white">Sign in</Link>
        </div>
      </main>
    );
  }

  return (
    <>
      <Navbar onSellClick={() => setSellOpen(true)} />
      <main className="min-h-screen bg-slate-bg px-4 pb-20 pt-28 md:px-6">
        <div className="mx-auto max-w-7xl space-y-8">

          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-900 p-5 text-white shadow-[0_20px_50px_-20px_rgba(15,23,42,0.8)]">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-emerald-200">
                  {role === "BROKER" ? "Broker workspace" : "Seller workspace"}
                </p>
                <h1 className="mt-2 text-3xl font-black tracking-tight">
                  {user.name ? `Welcome back, ${user.name}` : "Your deals dashboard"}
                </h1>
                <p className="mt-2 text-sm text-slate-300">
                  {role === "BROKER" ? "Manage client interest, list performance, and conversion flow in one place." : "Track your listings, respond to buyers, and improve close rate."}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button onClick={() => setSellOpen(true)} className="inline-flex items-center gap-2 rounded-xl bg-emerald-400 px-4 py-2.5 text-sm font-extrabold text-slate-900 hover:bg-emerald-300">
                  <Plus className="w-4 h-4" /> List property
                </button>
                <Link href="/profile" className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-bold text-white hover:bg-white/10">Profile</Link>
                <DashboardSignOutButton />
              </div>
            </div>
          </div>

          {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Listings" value={stats?.listings ?? 0} Icon={Home} accent="green" />
            <StatCard label="Active" value={stats?.active ?? 0} Icon={ShieldCheck} accent="blue" sub={`${stats?.pending ?? 0} pending review`} />
            <StatCard label="Total Views" value={stats?.views ?? 0} Icon={Eye} accent="gold" />
            <StatCard label="Enquiries" value={stats?.leads ?? 0} Icon={MessageCircle} accent="slate" />
          </div>

          {role === "BROKER" && (
            <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
              <SectionCard title="Broker CRM analytics" description="Performance snapshot across your client pipeline and listing portfolio.">
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center justify-between text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                      <span>Portfolio</span>
                      <BarChart3 className="h-4 w-4 text-agri-green" />
                    </div>
                    <div className="mt-3 text-2xl font-black text-slate-900">{formatPrice(brokerMetrics.totalPortfolioValue, true)}</div>
                    <div className="mt-1 text-xs text-slate-500">Active portfolio value</div>
                  </div>
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                    <div className="flex items-center justify-between text-xs font-bold uppercase tracking-[0.12em] text-emerald-700">
                      <span>Conv.</span>
                      <TrendingUp className="h-4 w-4" />
                    </div>
                    <div className="mt-3 text-2xl font-black text-emerald-700">{brokerMetrics.conversionRate.toFixed(1)}%</div>
                    <div className="mt-1 text-xs text-emerald-700/80">Closed ratio</div>
                  </div>
                  <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4">
                    <div className="flex items-center justify-between text-xs font-bold uppercase tracking-[0.12em] text-sky-700">
                      <span>Qualified</span>
                      <Target className="h-4 w-4" />
                    </div>
                    <div className="mt-3 text-2xl font-black text-sky-700">{brokerMetrics.qualified}</div>
                    <div className="mt-1 text-xs text-sky-700/80">High-intent buyers</div>
                  </div>
                  <div className="rounded-2xl border border-violet-200 bg-violet-50 p-4">
                    <div className="flex items-center justify-between text-xs font-bold uppercase tracking-[0.12em] text-violet-700">
                      <span>Avg lead</span>
                      <ArrowRight className="h-4 w-4" />
                    </div>
                    <div className="mt-3 text-2xl font-black text-violet-700">{formatPrice(brokerMetrics.avgLeadValue, true)}</div>
                    <div className="mt-1 text-xs text-violet-700/80">Per enquiry</div>
                  </div>
                </div>

                <div className="mt-6 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Lead conversion funnel</p>
                        <h3 className="mt-1 text-lg font-black text-slate-900">Pipeline health</h3>
                      </div>
                      <Sparkles className="h-4 w-4 text-agri-green" />
                    </div>
                    <div className="space-y-3">
                      {funnelData.map(entry => (
                        <div key={entry.status}>
                          <div className="mb-1 flex items-center justify-between text-xs font-semibold text-slate-600">
                            <span>{entry.status.replace("_", " ")}</span>
                            <span>{entry.count}</span>
                          </div>
                          <div className="h-2.5 rounded-full bg-slate-100">
                            <div className="h-full rounded-full bg-gradient-to-r from-agri-green to-trust-blue" style={{ width: `${Math.max(entry.pct, 10)}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">AI match</p>
                        <h3 className="mt-1 text-lg font-black text-slate-900">Best buyer prospects</h3>
                      </div>
                      <BellRing className="h-4 w-4 text-violet-500" />
                    </div>
                    <div className="space-y-3">
                      {recommendedBuyers.length === 0 ? (
                        <div className="text-sm text-slate-500">No leads yet to score.</div>
                      ) : recommendedBuyers.map(({ lead, property, score }) => (
                        <div key={lead.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                          <div className="flex items-center justify-between">
                            <div className="text-sm font-bold text-slate-900">{lead.buyerName}</div>
                            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">{score.toFixed(0)}%</span>
                          </div>
                          <div className="mt-1 text-xs text-slate-500">{property?.title ?? lead.property.title}</div>
                          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-600">
                            <span>{lead.status}</span>
                            <span>{lead.buyerPhone}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </SectionCard>

              <SectionCard title="WhatsApp follow-up automation" description="Send high-converting follow-ups without leaving the dashboard.">
                <div className="space-y-3">
                  {autoTemplates.map(template => (
                    <div key={template.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">{template.label}</span>
                        <Send className="h-4 w-4 text-emerald-600" />
                      </div>
                      <p className="text-sm text-slate-600">{template.body}</p>
                      <a
                        href={`https://wa.me/919999999999?text=${encodeURIComponent(template.body.replace("{buyerName}", "Buyer").replace("{brokerName}", user?.name ?? "Broker").replace("{village}", "Palia Kalan"))}`}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-3 py-2 text-xs font-bold text-white"
                      >
                        <MessageCircle className="h-3.5 w-3.5" /> Quick send
                      </a>
                    </div>
                  ))}
                </div>
                <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-white p-3">
                  <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                    <CalendarClock className="h-4 w-4" /> Next follow-up queue
                  </div>
                  <div className="space-y-2 text-sm text-slate-600">
                    <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
                      <span>High-intent buyer follow-up</span>
                      <span className="font-bold text-agri-green">Today</span>
                    </div>
                    <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
                      <span>Site-visit reminder</span>
                      <span className="font-bold text-trust-blue">Tomorrow</span>
                    </div>
                  </div>
                </div>
              </SectionCard>
            </div>
          )}

          {/* Properties */}
          <SectionCard
            title="My listings"
            description="Every listing starts as Pending until approved by admin."
            action={
              <button onClick={() => setSellOpen(true)} className="inline-flex items-center gap-1.5 rounded-xl bg-agri-green px-3 py-2 text-xs font-bold text-white">
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            }
          >
            {properties.length === 0 ? (
              <EmptyState icon="🏡" title="No listings yet" description="Add your first property to start receiving enquiries."
                action={<button onClick={() => setSellOpen(true)} className="rounded-xl bg-agri-green px-4 py-2 text-sm font-bold text-white">List a property</button>} />
            ) : (
              <div className="divide-y divide-slate-100">
                {properties.map(prop => {
                  const propLeads = leadsForProp(prop.id);
                  const isExpanded = expandedLeads === prop.id;
                  return (
                    <div key={prop.id}>
                      <div className="flex flex-col gap-3 px-5 py-4 hover:bg-slate-50/50 transition-colors sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-agri-green-50 flex items-center justify-center text-lg flex-shrink-0">🌾</div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 truncate">{prop.title}</p>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {prop.village} · {prop.area} {prop.areaUnit} ·{" "}
                              {editingId === prop.id ? (
                                <span className="inline-flex items-center gap-1">
                                  <input autoFocus value={editPrice} onChange={e => setEditPrice(e.target.value)} type="number" className="w-28 border border-agri-green rounded-lg px-2 py-0.5 text-xs" />
                                  <button onClick={() => void savePrice(prop)} className="text-agri-green font-bold text-xs">Save</button>
                                  <button onClick={() => setEditingId(null)} className="text-slate-400 text-xs">✕</button>
                                </span>
                              ) : (
                                <button onClick={() => { setEditingId(prop.id); setEditPrice(String(prop.price)); }} className="text-agri-green font-semibold hover:underline">
                                  {formatPrice(prop.price, true)}
                                </button>
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap shrink-0">
                          <StatusBadge status={prop.featured ? "ACTIVE" : "PENDING"} />
                          {propLeads.length > 0 && (
                            <button onClick={() => setExpandedLeads(isExpanded ? null : prop.id)}
                              className="inline-flex items-center gap-1 rounded-full border border-trust-blue/20 bg-trust-blue-50 px-3 py-1 text-xs font-bold text-trust-blue">
                              <MessageCircle className="w-3 h-3" /> {propLeads.length} lead{propLeads.length !== 1 ? "s" : ""}
                              {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            </button>
                          )}
                          <Link href={`/property/${prop.slug}`} target="_blank"
                            className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:text-trust-blue hover:border-trust-blue/40 transition-colors">
                            <Eye className="w-3.5 h-3.5" />
                          </Link>
                          <button onClick={() => { setSellOpen(true); }}
                            className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:text-agri-green hover:border-agri-green/40 transition-colors">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => setDeleting(prop)}
                            className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:text-red-500 hover:border-red-200 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Leads drawer */}
                      {isExpanded && propLeads.length > 0 && (
                        <div className="bg-slate-50 border-t border-slate-100 px-5 py-3 divide-y divide-slate-100">
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-wide pb-2">Buyer enquiries</p>
                          {propLeads.map(lead => (
                            <div key={lead.id} className="flex items-center justify-between py-2.5 gap-3">
                              <div>
                                <p className="text-sm font-bold text-slate-900">{lead.buyerName}</p>
                                <p className="text-xs text-slate-500">{lead.buyerPhone} · {new Date(lead.createdAt).toLocaleDateString("en-IN")}</p>
                                {lead.message && <p className="text-xs text-slate-600 mt-0.5 italic">&ldquo;{lead.message}&rdquo;</p>}
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <LeadStatusBadge status={lead.status} />
                                <a href={`tel:${lead.buyerPhone}`} className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:text-agri-green hover:border-agri-green/40 transition-colors">
                                  <Phone className="w-3.5 h-3.5" />
                                </a>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </SectionCard>

          {role === "BROKER" ? (
            <SectionCard title="Client requests" description="Every buyer enquiry across your listings, with status and follow-up actions.">
              <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row">
                <label className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="search"
                    value={requestQuery}
                    onChange={event => setRequestQuery(event.target.value)}
                    placeholder="Search buyer, phone or property"
                    aria-label="Search client requests"
                    className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-agri-green focus:ring-2 focus:ring-agri-green/10"
                  />
                </label>
                <label className="flex items-center gap-2 text-xs font-bold text-slate-500">
                  <span>Status</span>
                  <select
                    value={requestStatus}
                    onChange={event => setRequestStatus(event.target.value)}
                    aria-label="Filter client requests by status"
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-800 outline-none focus:border-agri-green"
                  >
                    <option value="ALL">All statuses</option>
                    {LEAD_STATUSES.map(status => <option key={status} value={status}>{status.replace("_", " ")}</option>)}
                  </select>
                </label>
              </div>
              {visibleRequests.length === 0 ? (
                <EmptyState icon="📋" title={leads.length ? "No matching requests" : "No buyer requests yet"}
                  description={leads.length ? "Adjust your search or status filter." : "Buyer enquiries for your listings will appear here."} />
              ) : (
                <div className="divide-y divide-slate-100">
                  {visibleRequests.map(lead => (
                    <article key={lead.id} className="flex flex-col gap-4 px-5 py-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                          <h3 className="text-sm font-extrabold text-slate-900">{lead.buyerName}</h3>
                          <span className="text-xs text-slate-500">+91 {lead.buyerPhone}</span>
                          <span className="text-xs text-slate-400">{new Date(lead.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</span>
                        </div>
                        <Link href={`/property/${lead.property.slug}`} target="_blank" className="mt-1 inline-block text-sm font-semibold text-agri-green hover:underline">
                          {lead.property.title} · {lead.property.village}
                        </Link>
                        {lead.message && <p className="mt-2 max-w-3xl whitespace-pre-wrap text-sm text-slate-600">{lead.message}</p>}
                        <p className="mt-1 text-[11px] uppercase tracking-wide text-slate-400">Source: {lead.source}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <label className="sr-only" htmlFor={`request-status-${lead.id}`}>Request status for {lead.buyerName}</label>
                        <select
                          id={`request-status-${lead.id}`}
                          value={lead.status}
                          disabled={updatingLeadId === lead.id}
                          onChange={event => void updateLeadStatus(lead.id, event.target.value)}
                          className="min-w-36 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-agri-green disabled:opacity-60"
                        >
                          {LEAD_STATUSES.map(status => <option key={status} value={status}>{status.replace("_", " ")}</option>)}
                        </select>
                        <a href={`tel:+91${lead.buyerPhone}`} aria-label={`Call ${lead.buyerName}`} title="Call buyer" className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:border-agri-green/40 hover:text-agri-green">
                          <Phone className="h-4 w-4" />
                        </a>
                        {lead.buyerWhatsapp && (
                          <a href={`https://wa.me/91${lead.buyerWhatsapp}`} target="_blank" rel="noreferrer" aria-label={`Message ${lead.buyerName} on WhatsApp`} title="WhatsApp buyer" className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:border-emerald-300 hover:text-emerald-700">
                            <MessageCircle className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </SectionCard>
          ) : leads.length > 0 && (
            <SectionCard title="Recent enquiries" description="Latest buyer contacts across all your listings.">
              <div className="divide-y divide-slate-100">
                {leads.slice(0, 8).map(lead => (
                  <div key={lead.id} className="flex items-center justify-between px-5 py-3 gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900">{lead.buyerName}</p>
                      <p className="text-xs text-slate-500 truncate">{lead.property.title} · {lead.property.village}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <LeadStatusBadge status={lead.status} />
                      <a href={`tel:${lead.buyerPhone}`} className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:text-agri-green hover:border-agri-green/40 transition-colors">
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          )}
        </div>
      </main>

      <SellLandModal isOpen={sellOpen} onClose={() => { setSellOpen(false); void fetchMyProperties().then(setProperties); }} />

      <ConfirmDialog
        open={!!deleting}
        title="Delete this listing?"
        message={`"${deleting?.title}" will be archived. This cannot be undone.`}
        confirmLabel="Delete"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </>
  );
}
