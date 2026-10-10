"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Bookmark, BookmarkCheck, Home, MapPin, Search,
  SlidersHorizontal, Bell, Eye, Phone, MessageCircle,
} from "lucide-react";
import { Navbar } from "@/components/navbar";
import {
  fetchProperties, fetchSavedProperties, toggleSavedProperty,
  type AdminLocation, fetchLocations,
} from "@/lib/api/client";
import { fetchBuyerDashboard } from "@/lib/api/client";
import { useAuth } from "@/lib/auth";
import type { AgriProperty } from "@/lib/data/properties";
import { formatPrice, formatArea } from "@/lib/utils/conversions";
import {
  DashboardSignOutButton, EmptyState, ErrorBanner, PageSpinner,
  SectionCard, StatCard,
} from "@/components/ui/dashboard-ui";

const CATEGORY_LABELS: Record<string, string> = {
  AGRICULTURAL_LAND: "Agricultural", PADDY_WHEAT: "Paddy/Wheat", SUGARCANE_FARM: "Sugarcane",
  MANGO_ORCHARD: "Mango Orchard", POPLAR_PLANTATION: "Poplar", FARMHOUSE: "Farmhouse",
  DAIRY_POULTRY: "Dairy/Poultry", RESIDENTIAL_PLOT: "Residential", HOUSE: "House",
  COMMERCIAL_PROPERTY: "Commercial", HIGHWAY_INVESTMENT: "Highway", INDUSTRIAL_LAND: "Industrial",
  WAREHOUSE: "Warehouse", RESORT_HOTEL_LAND: "Resort/Hotel",
};

type SavedSearchAlert = {
  id: string;
  label: string;
  keyword: string;
  village: string;
  category: string;
  enabled: boolean;
};

const DEFAULT_ALERTS: SavedSearchAlert[] = [
  { id: "sugarcane", label: "Sugarcane farms", keyword: "sugarcane", village: "Palia Kalan", category: "SUGARCANE_FARM", enabled: true },
  { id: "highway", label: "Highway touch", keyword: "highway", village: "Mailani", category: "HIGHWAY_INVESTMENT", enabled: true },
  { id: "farmhouse", label: "Farmhouse plots", keyword: "farmhouse", village: "Sampurna Nagar", category: "FARMHOUSE", enabled: true },
];

function PropertyCard({ prop, isSaved, onToggleSave }: { prop: AgriProperty; isSaved: boolean; onToggleSave: (id: string) => void }) {
  const API_ORIGIN = (process.env.NEXT_PUBLIC_API_URL ?? "https://be-property.onrender.com/api/v1").replace(/\/api\/v1\/?$/, "");
  const imgSrc = prop.images[0]?.startsWith("/") ? `${API_ORIGIN}${prop.images[0]}` : prop.images[0];
  return (
    <div className="group relative bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-card-hover hover:border-agri-green/20 transition-all duration-300 overflow-hidden flex flex-col">
      {/* Image */}
      <div className="relative aspect-[4/3] bg-agri-green-50 overflow-hidden">
        {imgSrc ? (
          <Image src={imgSrc} alt={prop.title} fill sizes="(max-width:640px)100vw,50vw" className="object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">🌾</div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        {/* Save button */}
        <button
          onClick={() => onToggleSave(prop.id)}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm transition-all duration-200 ${isSaved ? "bg-harvest-gold text-white shadow-gold" : "bg-black/25 text-white hover:bg-white hover:text-harvest-gold"}`}
          aria-label={isSaved ? "Remove from watchlist" : "Add to watchlist"}
        >
          {isSaved ? <BookmarkCheck className="w-4 h-4 fill-current" /> : <Bookmark className="w-4 h-4" />}
        </button>
        {prop.featured && (
          <span className="absolute top-3 left-3 text-[10px] font-bold px-2 py-0.5 rounded-full bg-harvest-gold text-white">⭐ Featured</span>
        )}
        <div className="absolute bottom-3 left-3">
          <p className="text-white font-extrabold text-lg drop-shadow">{formatPrice(prop.price, true)}</p>
          {prop.pricePerBigha > 0 && <p className="text-white/80 text-xs">{formatPrice(prop.pricePerBigha, true)}/Bigha</p>}
        </div>
      </div>
      {/* Body */}
      <div className="flex flex-col flex-1 p-4 gap-2">
        <Link href={`/property/${prop.slug}`}>
          <h3 className="font-bold text-slate-900 line-clamp-2 text-sm group-hover:text-agri-green transition-colors">{prop.title}</h3>
        </Link>
        <div className="flex items-center gap-1 text-xs text-slate-500">
          <MapPin className="w-3 h-3 text-agri-green flex-shrink-0" />
          <span className="truncate">{prop.village}, {prop.district}</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap mt-1">
          <span className="inline-flex items-center gap-1 bg-agri-green-50 text-agri-green border border-agri-green/20 text-xs font-bold px-2.5 py-1 rounded-xl">
            📐 {formatArea(prop.area, prop.areaUnit)}
          </span>
          <span className="text-xs text-slate-400 bg-slate-100 px-2.5 py-1 rounded-xl">{CATEGORY_LABELS[prop.category.toUpperCase()] ?? prop.category}</span>
        </div>
        <div className="flex gap-2 pt-2 mt-auto">
          <a href={`https://wa.me/${prop.sellerPhone?.replace(/\D/, "")}?text=Hi, interested in: ${prop.title}`} target="_blank" rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1.5 bg-[#25D366] hover:bg-[#1da851] text-white text-xs font-bold py-2 rounded-xl transition-colors">
            <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
          </a>
          <Link href={`/property/${prop.slug}`}
            className="flex-1 flex items-center justify-center gap-1.5 bg-agri-green-50 hover:bg-agri-green hover:text-white text-agri-green text-xs font-bold py-2 rounded-xl transition-colors">
            <Eye className="w-3.5 h-3.5" /> View
          </Link>
        </div>
      </div>
    </div>
  );
}

export function BuyerDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [properties, setProperties] = useState<AgriProperty[]>([]);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [stats, setStats] = useState<{ activeProperties: number; savedProperties: number; alerts: number } | null>(null);
  const [locations, setLocations] = useState<AdminLocation[]>([]);
  const [savedAlerts, setSavedAlerts] = useState<SavedSearchAlert[]>(DEFAULT_ALERTS);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // filters
  const [search, setSearch] = useState("");
  const [village, setVillage] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState<"browse" | "watchlist">("browse");

  useEffect(() => {
    if (!user) return;

    let savedAlertsTimer: number | undefined;
    try {
      const stored = window.localStorage.getItem("pph_saved_alerts");
      if (stored) {
        const parsed = JSON.parse(stored) as SavedSearchAlert[];
        if (Array.isArray(parsed) && parsed.length) {
          savedAlertsTimer = window.setTimeout(() => setSavedAlerts(parsed), 0);
        }
      }
    } catch {
      // Ignore malformed local storage data.
    }

    Promise.all([
      fetchProperties(),
      fetchBuyerDashboard(),
      fetchSavedProperties(),
      fetchLocations(),
    ]).then(([props, dash, saved, locs]) => {
      setProperties(props);
      setStats(dash);
      setSavedIds(new Set(saved.map((s: { propertyId: string }) => s.propertyId)));
      setLocations(locs.filter(l => ["CITY", "VILLAGE"].includes(l.type)));
      setLoading(false);
    }).catch(e => { setError(e instanceof Error ? e.message : "Failed to load"); setLoading(false); });
    return () => {
      if (savedAlertsTimer !== undefined) window.clearTimeout(savedAlertsTimer);
    };
  }, [user]);

  useEffect(() => {
    if (!user) return;
    window.localStorage.setItem("pph_saved_alerts", JSON.stringify(savedAlerts));
  }, [savedAlerts, user]);

  const handleToggleSave = async (propertyId: string) => {
    try {
      const result = await toggleSavedProperty(propertyId);
      setSavedIds(prev => {
        const next = new Set(prev);
        if (result) next.add(propertyId); else next.delete(propertyId);
        return next;
      });
      if (stats) setStats({ ...stats, savedProperties: result ? stats.savedProperties + 1 : stats.savedProperties - 1 });
    } catch (e) { setError(e instanceof Error ? e.message : "Failed to update watchlist"); }
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const results = await fetchProperties({ q: search || undefined, village: village || undefined });
      setProperties(results);
    } catch (e) { setError(e instanceof Error ? e.message : "Search failed"); }
    finally { setLoading(false); }
  };

  const activeAlertCount = savedAlerts.filter(alert => alert.enabled).length;

  const recommendedProperties = useMemo(() => {
    return [...properties]
      .map(property => {
        let score = 68;
        const userKeyword = search.trim().toLowerCase();

        if (savedIds.has(property.id)) score += 10;
        if (property.featured) score += 8;
        if (property.highwayTouch) score += 10;
        if (property.canalTouch) score += 6;
        if (property.irrigation.includes("tubewell") || property.irrigation.includes("canal")) score += 7;

        if (userKeyword) {
          const haystack = `${property.title} ${property.village} ${property.location} ${property.category}`.toLowerCase();
          if (haystack.includes(userKeyword)) score += 18;
        }

        const matchesAlert = savedAlerts.some(alert => {
          if (!alert.enabled) return false;
          const text = `${property.title} ${property.category} ${property.village} ${property.location}`.toLowerCase();
          return text.includes(alert.keyword.toLowerCase()) || property.village === alert.village;
        });
        if (matchesAlert) score += 22;

        if (village && property.village === village) score += 14;

        return { property, score: Math.min(score, 99) };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }, [properties, savedAlerts, savedIds, search, village]);

  const displayed = activeTab === "watchlist"
    ? properties.filter(p => savedIds.has(p.id))
    : properties;

  const toggleAlert = (alertId: string) => {
    setSavedAlerts(current => current.map(alert => alert.id === alertId ? { ...alert, enabled: !alert.enabled } : alert));
  };

  const addCurrentAlert = () => {
    const label = search.trim() || village || "custom search";
    const nextAlert: SavedSearchAlert = {
      id: `custom-${Date.now()}`,
      label: label.length > 18 ? `${label.slice(0, 18)}…` : label,
      keyword: search.trim() || "highway",
      village: village || "Palia Kalan",
      category: "CUSTOM",
      enabled: true,
    };
    setSavedAlerts(current => [nextAlert, ...current].slice(0, 4));
  };

  if (authLoading) return <PageSpinner />;
  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-bg px-6">
        <div className="text-center">
          <h1 className="text-2xl font-black text-slate-900">Sign in to continue</h1>
          <Link href="/login" className="mt-4 inline-flex rounded-xl bg-agri-green px-5 py-3 text-sm font-bold text-white">Sign in</Link>
        </div>
      </main>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-bg px-4 pb-20 pt-28 md:px-6">
        <div className="mx-auto max-w-7xl space-y-8">

          {/* Header */}
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-900 p-5 text-white shadow-[0_20px_50px_-20px_rgba(15,23,42,0.8)]">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-emerald-200">Buyer workspace</p>
                <h1 className="mt-2 text-3xl font-black tracking-tight">
                  {user.name ? `Welcome back, ${user.name}` : "Find your next property"}
                </h1>
                <p className="mt-2 text-sm text-slate-300">Browse quality listings, track your watchlist, and reach sellers faster.</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button onClick={() => setActiveTab("browse")} className="rounded-xl bg-white/10 px-3 py-2 text-sm font-bold text-white ring-1 ring-white/10 hover:bg-white/15">Browse</button>
                <button onClick={() => setActiveTab("watchlist")} className="rounded-xl bg-emerald-400 px-3 py-2 text-sm font-bold text-slate-900 hover:bg-emerald-300">Watchlist</button>
                <DashboardSignOutButton />
              </div>
            </div>
          </div>

          {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}

          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="Available listings" value={stats?.activeProperties ?? 0} Icon={Home} accent="green" />
            <StatCard label="Watchlist" value={savedIds.size} Icon={Bookmark} accent="gold" sub="Saved properties" />
            <StatCard label="Alerts" value={stats?.alerts ?? 0} Icon={Bell} accent="blue" sub="Active notifications" />
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
            <div className="bg-white rounded-2xl border border-slate-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Smart match</p>
                  <h2 className="mt-1 text-xl font-black text-slate-900">Property recommendations</h2>
                </div>
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">{recommendedProperties.length} matches</span>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                {recommendedProperties.map(({ property, score }) => (
                  <Link key={property.id} href={`/property/${property.slug}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 hover:border-agri-green/40 hover:bg-agri-green/5 transition-all">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">Match</span>
                      <span className="rounded-full bg-agri-green text-white px-2 py-0.5 text-[10px] font-bold">{score}%</span>
                    </div>
                    <p className="mt-3 text-sm font-bold text-slate-800 line-clamp-2">{property.title}</p>
                    <p className="mt-2 text-xs text-slate-500">{property.village}</p>
                    <div className="mt-3 text-sm font-extrabold text-agri-green">{formatPrice(property.price, true)}</div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Saved alerts</p>
                  <h2 className="mt-1 text-xl font-black text-slate-900">Buyer watchlist</h2>
                </div>
                <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700">{activeAlertCount} active</span>
              </div>
              <div className="space-y-2">
                {savedAlerts.map(alert => (
                  <button key={alert.id} onClick={() => toggleAlert(alert.id)} className={`w-full flex items-center justify-between rounded-xl border px-3 py-2 text-left transition ${alert.enabled ? "border-agri-green bg-agri-green/5 text-slate-800" : "border-slate-200 bg-slate-50 text-slate-500"}`}>
                    <div>
                      <div className="text-sm font-bold">{alert.label}</div>
                      <div className="text-[11px] opacity-80">{alert.village}</div>
                    </div>
                    <span className={`inline-flex h-6 w-10 items-center rounded-full p-1 ${alert.enabled ? "bg-agri-green" : "bg-slate-300"}`}>
                      <span className={`h-4 w-4 rounded-full bg-white transition ${alert.enabled ? "translate-x-4" : "translate-x-0"}`} />
                    </span>
                  </button>
                ))}
              </div>
              <button onClick={addCurrentAlert} className="mt-3 w-full rounded-xl bg-slate-900 px-3 py-2 text-sm font-bold text-white hover:bg-slate-800 transition">Save current search alert</button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input value={search} onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === "Enter" && void handleSearch()}
                  placeholder="Search by title, village…"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-agri-green focus:ring-2 focus:ring-agri-green/10" />
              </div>
              <button onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-bold transition-all ${showFilters ? "bg-agri-green text-white border-agri-green" : "border-slate-200 text-slate-600 hover:border-agri-green/40"}`}>
                <SlidersHorizontal className="w-4 h-4" /> Filters
              </button>
              <button onClick={handleSearch} className="rounded-xl bg-agri-green px-4 py-2.5 text-sm font-bold text-white hover:opacity-90">Search</button>
            </div>
            {showFilters && (
              <div className="mt-3 grid gap-3 sm:grid-cols-2 pt-3 border-t border-slate-100">
                <div>
                  <label className="text-xs font-bold text-slate-600 mb-1 block">Village</label>
                  <select value={village} onChange={e => setVillage(e.target.value)} className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-slate-50 outline-none focus:border-agri-green">
                    <option value="">All villages</option>
                    {locations.map(l => <option key={l.id} value={l.name}>{l.name}</option>)}
                  </select>
                </div>
                <div className="flex items-end">
                  <button onClick={() => { setSearch(""); setVillage(""); void fetchProperties().then(setProperties); }}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50 w-full">
                    Clear filters
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            {(["browse", "watchlist"] as const).map(t => (
              <button key={t} onClick={() => setActiveTab(t)}
                className={`flex items-center gap-2 rounded-full px-5 py-2 text-sm font-bold border transition-all ${activeTab === t ? "bg-agri-green text-white border-agri-green shadow-sm" : "bg-white text-slate-600 border-slate-200 hover:border-agri-green/40"}`}>
                {t === "browse" ? <><Home className="w-3.5 h-3.5" /> Browse</> : <><BookmarkCheck className="w-3.5 h-3.5" /> Watchlist <span className="ml-1 opacity-70">{savedIds.size}</span></>}
              </button>
            ))}
          </div>

          {/* Grid */}
          {loading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[1,2,3,4,5,6].map(i => <div key={i} className="h-72 rounded-2xl skeleton" />)}
            </div>
          ) : displayed.length === 0 ? (
            <EmptyState
              icon={activeTab === "watchlist" ? "🔖" : "🏡"}
              title={activeTab === "watchlist" ? "Watchlist is empty" : "No properties found"}
              description={activeTab === "watchlist" ? "Browse listings and bookmark properties to save them here." : "Try different search terms or clear filters."}
              action={activeTab === "watchlist" ? <button onClick={() => setActiveTab("browse")} className="rounded-xl bg-agri-green px-4 py-2 text-sm font-bold text-white">Browse listings</button> : undefined}
            />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {displayed.map(p => (
                <PropertyCard key={p.id} prop={p} isSaved={savedIds.has(p.id)} onToggleSave={id => void handleToggleSave(id)} />
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
