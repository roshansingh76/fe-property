"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Users, Building2, ShieldAlert, MessageCircle, TrendingUp,
  CheckCircle2, XCircle, Clock, Eye, ArrowRight,
  UserCheck, UserCog, Briefcase, MapPin, Tag,
  Activity, AlertTriangle, Star,
} from "lucide-react";
import { Navbar } from "@/components/navbar";
import { AdminSidebar, AdminMobileBar } from "@/components/admin-sidebar";
import {
  api, fetchPendingProperties, fetchAdminUsers,
  reviewProperty, type AdminUser, type PendingPropertyReview,
} from "@/lib/api/client";
import { useAuth } from "@/lib/auth";
import { DashboardSignOutButton, ErrorBanner, RoleBadge } from "@/components/ui/dashboard-ui";
import { formatPrice } from "@/lib/utils/conversions";

// ── types ─────────────────────────────────────────────────────────────────────

interface AdminStats {
  users: number;
  properties: number;
  pendingProperties: number;
  activeProperties: number;
  leads: number;
}

interface RoleBreakdown {
  buyers: number;
  sellers: number;
  brokers: number;
  agents: number;
  admins: number;
}

// ── sub-components ────────────────────────────────────────────────────────────

function KpiCard({
  label, value, icon: Icon, accent, sub, href,
}: {
  label: string;
  value: number | string;
  icon: React.ElementType;
  accent: "green" | "blue" | "amber" | "red" | "violet";
  sub?: string;
  href?: string;
}) {
  const styles = {
    green:  { bg: "bg-agri-green-50",      icon: "text-agri-green",      border: "border-agri-green/10",     bar: "bg-agri-green"     },
    blue:   { bg: "bg-trust-blue-50",       icon: "text-trust-blue",       border: "border-trust-blue/10",     bar: "bg-trust-blue"     },
    amber:  { bg: "bg-harvest-gold-50",     icon: "text-harvest-gold-dark",border: "border-harvest-gold/10",   bar: "bg-harvest-gold"   },
    red:    { bg: "bg-red-50",              icon: "text-red-500",          border: "border-red-100",           bar: "bg-red-400"        },
    violet: { bg: "bg-violet-50",           icon: "text-violet-600",       border: "border-violet-100",        bar: "bg-violet-500"     },
  };
  const s = styles[accent];
  const inner = (
    <div className={`group relative rounded-2xl border bg-white p-5 hover:shadow-md transition-all duration-200 ${s.border} overflow-hidden`}>
      {/* accent bar */}
      <div className={`absolute top-0 left-0 right-0 h-0.5 ${s.bar}`} />
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</p>
          <p className="mt-2 text-3xl font-black text-slate-900 tabular-nums leading-none">{value}</p>
          {sub && <p className="mt-1.5 text-xs text-slate-400">{sub}</p>}
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${s.bg}`}>
          <Icon className={`w-5 h-5 ${s.icon}`} />
        </div>
      </div>
      {href && <ArrowRight className="absolute bottom-4 right-4 w-3.5 h-3.5 text-slate-300 group-hover:text-slate-500 transition-colors" />}
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

function SectionHeader({ title, action }: { title: string; action?: { label: string; href: string } }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-base font-extrabold text-slate-900">{title}</h2>
      {action && (
        <Link href={action.href} className="inline-flex items-center gap-1 text-xs font-bold text-agri-green hover:text-forest-700 transition-colors">
          {action.label} <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      )}
    </div>
  );
}

// ── main dashboard ────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [pending, setPending] = useState<PendingPropertyReview[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [deciding, setDeciding] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !["ADMIN", "SUPER_ADMIN"].includes(user.role)) return;
    Promise.all([
      api.get<AdminStats>("/admin/dashboard"),
      fetchPendingProperties(),
      fetchAdminUsers(),
    ])
      .then(([s, p, u]) => { setStats(s); setPending(p); setUsers(u); setLoading(false); })
      .catch(e => { setError(e instanceof Error ? e.message : "Failed to load dashboard"); setLoading(false); });
  }, [user]);

  const decide = async (id: string, status: "ACTIVE" | "REJECTED") => {
    setDeciding(id);
    try {
      await reviewProperty(id, status, [{ level: 1, name: "Admin review", status: status === "ACTIVE" ? "VERIFIED" : "REJECTED" }]);
      setPending(prev => prev.filter(p => p.id !== id));
      setStats(prev => prev ? {
        ...prev,
        pendingProperties: Math.max(0, prev.pendingProperties - 1),
        activeProperties: status === "ACTIVE" ? prev.activeProperties + 1 : prev.activeProperties,
      } : prev);
    } catch (e) { setError(e instanceof Error ? e.message : "Action failed"); }
    finally { setDeciding(null); }
  };

  if (authLoading) return <div className="min-h-screen bg-slate-bg" />;

  if (!user || !["ADMIN", "SUPER_ADMIN"].includes(user.role)) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-bg px-6 text-center">
        <div>
          <div className="mx-auto w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
            <ShieldAlert className="w-7 h-7 text-red-500" />
          </div>
          <h1 className="text-2xl font-black text-slate-900">Admin access required</h1>
        </div>
      </main>
    );
  }

  // compute role breakdown
  const rb: RoleBreakdown = {
    buyers:  users.filter(u => u.role === "BUYER").length,
    sellers: users.filter(u => u.role === "SELLER").length,
    brokers: users.filter(u => u.role === "BROKER").length,
    agents:  users.filter(u => u.role === "AGENT").length,
    admins:  users.filter(u => ["ADMIN", "SUPER_ADMIN"].includes(u.role)).length,
  };

  const recentUsers = [...users].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 6);
  const verified = users.filter(u => u.isVerified).length;
  const blocked  = users.filter(u => u.isBlocked).length;

  return (
    <div className="min-h-screen bg-slate-bg">
      <Navbar />
      <div className="flex pt-16">
        <AdminSidebar />
        <div className="flex-1 min-w-0">
          <AdminMobileBar />
          <main className="px-5 pb-16 pt-6 md:px-8 md:pt-8">
            <div className="mx-auto max-w-6xl space-y-8">

              {/* ── Page header ── */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-red-500">Admin Console</p>
                  <h1 className="mt-1 text-2xl font-black text-slate-950">
                    Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"},{" "}
                    {user.name?.split(" ")[0] ?? "Admin"}
                  </h1>
                  <p className="text-sm text-slate-500 mt-0.5">
                    {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {stats?.pendingProperties ? (
                    <Link href="/admin/properties"
                      className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-amber-600 transition-colors animate-pulse">
                      <AlertTriangle className="w-4 h-4" />
                      {stats.pendingProperties} pending review{stats.pendingProperties !== 1 ? "s" : ""}
                    </Link>
                  ) : null}
                  <DashboardSignOutButton />
                </div>
              </div>

              {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}

              {/* ── KPI cards ── */}
              {loading ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {[1,2,3,4].map(i => <div key={i} className="h-28 rounded-2xl skeleton" />)}
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <KpiCard label="Total users"      value={stats?.users ?? 0}              icon={Users}        accent="blue"   sub={`${verified} verified · ${blocked} blocked`} href="/admin/users" />
                  <KpiCard label="Properties"       value={stats?.properties ?? 0}         icon={Building2}    accent="green"  sub={`${stats?.activeProperties ?? 0} active`}    href="/admin/properties" />
                  <KpiCard label="Pending review"   value={stats?.pendingProperties ?? 0}  icon={ShieldAlert}  accent="amber"  sub="Awaiting approval"                           href="/admin/properties" />
                  <KpiCard label="Total enquiries"  value={stats?.leads ?? 0}              icon={MessageCircle}accent="violet" sub="Across all listings" />
                </div>
              )}

              {/* ── Second row: user breakdown + activity ── */}
              <div className="grid gap-6 lg:grid-cols-3">

                {/* Role breakdown */}
                <div className="lg:col-span-1 rounded-2xl border border-slate-200 bg-white p-5">
                  <SectionHeader title="Users by role" action={{ label: "Manage", href: "/admin/users" }} />
                  {loading ? (
                    <div className="space-y-3">{[1,2,3,4].map(i => <div key={i} className="h-9 rounded-xl skeleton" />)}</div>
                  ) : (
                    <div className="space-y-2">
                      {[
                        { label: "Buyers",  value: rb.buyers,  href: "/admin/buyers",  color: "bg-sky-400",      text: "text-sky-700"     },
                        { label: "Sellers", value: rb.sellers, href: "/admin/sellers", color: "bg-agri-green",   text: "text-agri-green"  },
                        { label: "Brokers", value: rb.brokers, href: "/admin/brokers", color: "bg-violet-500",   text: "text-violet-700"  },
                        { label: "Agents",  value: rb.agents,  href: "/admin/users",   color: "bg-amber-400",    text: "text-amber-700"   },
                        { label: "Admins",  value: rb.admins,  href: "/admin/users",   color: "bg-red-400",      text: "text-red-600"     },
                      ].map(row => {
                        const total = stats?.users || 1;
                        const pct = Math.round((row.value / total) * 100);
                        return (
                          <Link key={row.label} href={row.href}
                            className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors group">
                            <div className="w-24 shrink-0">
                              <p className="text-xs font-bold text-slate-700 group-hover:text-agri-green transition-colors">{row.label}</p>
                            </div>
                            <div className="flex-1 bg-slate-100 rounded-full h-1.5">
                              <div className={`${row.color} h-1.5 rounded-full transition-all duration-500`} style={{ width: `${pct}%` }} />
                            </div>
                            <span className={`text-xs font-extrabold w-6 text-right tabular-nums ${row.text}`}>{row.value}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}

                  {/* Quick stats */}
                  <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-agri-green-50 border border-agri-green/10 p-3 text-center">
                      <p className="text-lg font-black text-agri-green">{verified}</p>
                      <p className="text-[10px] font-semibold text-slate-500 mt-0.5">Verified</p>
                    </div>
                    <div className="rounded-xl bg-red-50 border border-red-100 p-3 text-center">
                      <p className="text-lg font-black text-red-500">{blocked}</p>
                      <p className="text-[10px] font-semibold text-slate-500 mt-0.5">Blocked</p>
                    </div>
                  </div>
                </div>

                {/* Recent signups */}
                <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-5">
                  <SectionHeader title="Recent sign-ups" action={{ label: "All users", href: "/admin/users" }} />
                  {loading ? (
                    <div className="space-y-3">{[1,2,3,4,5].map(i => <div key={i} className="h-12 rounded-xl skeleton" />)}</div>
                  ) : recentUsers.length === 0 ? (
                    <p className="py-10 text-center text-sm text-slate-400">No users yet.</p>
                  ) : (
                    <div className="divide-y divide-slate-50">
                      {recentUsers.map(u => (
                        <div key={u.id} className="flex items-center gap-3 py-2.5">
                          <div className="w-8 h-8 rounded-full bg-agri-green-50 flex items-center justify-center text-xs font-extrabold text-agri-green flex-shrink-0">
                            {(u.name ?? u.phone).charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-900 truncate">{u.name ?? <span className="text-slate-400 italic font-normal">No name</span>}</p>
                            <p className="text-xs text-slate-400">{u.phone}</p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <RoleBadge role={u.role} />
                            <span className="text-xs text-slate-400 hidden sm:block">
                              {new Date(u.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                            </span>
                            {u.isVerified
                              ? <CheckCircle2 className="w-3.5 h-3.5 text-agri-green" />
                              : <Clock className="w-3.5 h-3.5 text-slate-300" />}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* ── Pending review queue ── */}
              <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center">
                      <ShieldAlert className="w-4 h-4 text-amber-500" />
                    </div>
                    <div>
                      <h2 className="text-sm font-extrabold text-slate-900">Verification queue</h2>
                      <p className="text-xs text-slate-500">Properties waiting for admin approval</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {pending.length > 0 && (
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-500 text-white text-xs font-extrabold">
                        {pending.length}
                      </span>
                    )}
                    <Link href="/admin/properties"
                      className="text-xs font-bold text-agri-green hover:text-forest-700 transition-colors inline-flex items-center gap-1">
                      View all <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>

                {loading ? (
                  <div className="p-5 space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 rounded-xl skeleton" />)}</div>
                ) : pending.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-2">
                    <CheckCircle2 className="w-10 h-10 text-agri-green-200" />
                    <p className="text-sm font-bold text-slate-600">All caught up!</p>
                    <p className="text-xs text-slate-400">No properties waiting for review.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-50">
                    {pending.slice(0, 8).map(item => (
                      <div key={item.id} className="flex flex-col gap-3 px-5 py-4 hover:bg-slate-50/50 transition-colors sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-start gap-3 min-w-0">
                          {/* Image preview */}
                          <div className="w-12 h-12 rounded-xl bg-agri-green-50 flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {item.images?.[0] ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={item.images[0]} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-xl">🌾</span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 truncate">{item.title}</p>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {item.village} · {formatPrice(item.price, true)} · Owner: {item.owner.name ?? item.owner.phone}
                            </p>
                            {item.documents.length > 0 && (
                              <div className="flex gap-1 mt-1.5 flex-wrap">
                                {item.documents.map(d => (
                                  <span key={d.id} className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-trust-blue-50 text-trust-blue border border-trust-blue/20">
                                    {d.type}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs text-slate-400 hidden md:block">
                            {item.documents.length} doc{item.documents.length !== 1 ? "s" : ""}
                          </span>
                          <button
                            onClick={() => void decide(item.id, "REJECTED")}
                            disabled={deciding === item.id}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50">
                            <XCircle className="w-3.5 h-3.5" /> Reject
                          </button>
                          <button
                            onClick={() => void decide(item.id, "ACTIVE")}
                            disabled={deciding === item.id}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-agri-green px-3 py-2 text-xs font-bold text-white hover:opacity-90 transition-opacity disabled:opacity-50">
                            {deciding === item.id ? <Spinner className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                            Approve
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ── Quick actions ── */}
              <div>
                <h2 className="text-base font-extrabold text-slate-900 mb-4">Quick actions</h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    { label: "Manage buyers",       desc: "View & verify buyers",          href: "/admin/buyers",         icon: UserCheck,  color: "text-sky-600",    bg: "bg-sky-50"          },
                    { label: "Manage sellers",       desc: "Listings & approval",           href: "/admin/sellers",        icon: UserCog,    color: "text-agri-green", bg: "bg-agri-green-50"   },
                    { label: "Manage brokers",       desc: "Portfolio oversight",           href: "/admin/brokers",        icon: Briefcase,  color: "text-violet-600", bg: "bg-violet-50"       },
                    { label: "All properties",       desc: "Full listing control",          href: "/admin/properties",     icon: Building2,  color: "text-agri-green", bg: "bg-agri-green-50"   },
                    { label: "Property types",       desc: "Category management",           href: "/admin/property-types", icon: Tag,        color: "text-amber-600",  bg: "bg-amber-50"        },
                    { label: "Locations",            desc: "Village & area setup",          href: "/admin/locations",      icon: MapPin,     color: "text-trust-blue", bg: "bg-trust-blue-50"   },
                    { label: "All users",            desc: "Cross-role management",         href: "/admin/users",          icon: Users,      color: "text-slate-600",  bg: "bg-slate-100"       },
                    { label: "Live listings",        desc: `${stats?.activeProperties ?? 0} active now`, href: "/admin/properties", icon: Star, color: "text-harvest-gold-dark", bg: "bg-harvest-gold-50" },
                  ].map(action => (
                    <Link key={action.href + action.label} href={action.href}
                      className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 hover:border-agri-green/30 hover:shadow-sm transition-all duration-200">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${action.bg}`}>
                        <action.icon className={`w-4 h-4 ${action.color}`} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900 group-hover:text-agri-green transition-colors truncate">{action.label}</p>
                        <p className="text-xs text-slate-400 truncate">{action.desc}</p>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-agri-green transition-colors ml-auto flex-shrink-0" />
                    </Link>
                  ))}
                </div>
              </div>

            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

function Spinner({ className }: { className?: string }) {
  return <span className={`inline-block animate-spin border-2 border-white border-t-transparent rounded-full ${className ?? "w-4 h-4"}`} />;
}
