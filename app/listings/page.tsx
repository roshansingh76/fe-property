"use client";

import { Suspense, useState, useMemo, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { SlidersHorizontal, Grid3X3, List, ArrowUpDown, Search, X } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { AgriPropertyCard } from "@/components/agri-property-card";
import { FilterSidebar, type FilterState } from "@/components/filter-sidebar";
import { PropertyComparison } from "@/components/property-comparison";
import { SellLandModal } from "@/components/sell-land-modal";
import { SeoSchema } from "@/components/seo-schema";
import { cn } from "@/lib/utils/cn";
import { PROPERTY_CATEGORIES } from "@/lib/data/properties";
import type { LandUnit, PropertyCategory } from "@/lib/data/properties";
import { fetchLocations, fetchPropertyList } from "@/lib/api/client";
import type { AgriProperty } from "@/lib/data/properties";
import { convertArea } from "@/lib/utils/conversions";

type SortOption = "newest" | "price_asc" | "price_desc" | "area_desc";
type ViewMode = "grid" | "list";

const SORT_OPTIONS: { v: SortOption; l: string }[] = [
  { v: "newest",     l: "Newest First" },
  { v: "price_asc",  l: "Price: Low → High" },
  { v: "price_desc", l: "Price: High → Low" },
  { v: "area_desc",  l: "Area: Large → Small" },
];

const CATEGORIES = Object.keys(PROPERTY_CATEGORIES) as PropertyCategory[];

function isCategory(value: string | null): value is PropertyCategory {
  return Boolean(value && CATEGORIES.includes(value as PropertyCategory));
}

export default function ListingsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <ListingsContent />
    </Suspense>
  );
}

function ListingsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [sellOpen, setSellOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [sort, setSort] = useState<SortOption>((searchParams.get("sort") as SortOption) || "newest");
  const [view, setView] = useState<ViewMode>("grid");
  const [unit, setUnit] = useState<LandUnit>("bigha");
  const [cat, setCat] = useState<PropertyCategory | "all">(isCategory(searchParams.get("category")) ? searchParams.get("category") as PropertyCategory : "all");
  const [village, setVillage] = useState(searchParams.get("village") ?? "all");
  const [searchInput, setSearchInput] = useState(searchParams.get("q") ?? "");
  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const [apiProperties, setApiProperties] = useState<AgriProperty[]>([]);
  const [comparedProperties, setComparedProperties] = useState<AgriProperty[]>([]);
  const [comparisonOpen, setComparisonOpen] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [advancedFilters, setAdvancedFilters] = useState<FilterState | null>(null);
  const [locations, setLocations] = useState<string[]>([]);

  useEffect(() => {
    const timer = window.setTimeout(() => setSearch(searchInput.trim()), 400);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (village !== "all") params.set("village", village);
    if (cat !== "all") params.set("category", cat);
    if (sort !== "newest") params.set("sort", sort);
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [cat, village, search, sort, pathname, router]);

  useEffect(() => {
    void fetchLocations()
      .then(items => setLocations(items.filter(item => ["CITY", "VILLAGE"].includes(item.type)).map(item => item.name)))
      .catch(() => setLocations([]));
  }, []);

  useEffect(() => {
    let cancelled = false;
    const loadingTimer = window.setTimeout(() => setLoading(true), 0);
    fetchPropertyList({
      q: search || undefined,
      village: village === "all" ? undefined : village,
      category: cat === "all" ? undefined : cat,
      sort,
      page: 1,
      pageSize: 12,
    })
      .then(result => {
        window.clearTimeout(loadingTimer);
        if (cancelled) return;
        setApiProperties(result.items);
        setTotal(result.total);
        setPage(result.page);
        setTotalPages(result.totalPages);
        setApiError(null);
      })
      .catch(error => { if (!cancelled) setApiError(error instanceof Error ? error.message : "Unable to reach the property API"); })
      .finally(() => {
        window.clearTimeout(loadingTimer);
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
      window.clearTimeout(loadingTimer);
    };
  }, [cat, village, search, sort]);

  const loadMore = async () => {
    if (page >= totalPages || loadingMore) return;
    setLoadingMore(true);
    try {
      const result = await fetchPropertyList({
        q: search || undefined,
        village: village === "all" ? undefined : village,
        category: cat === "all" ? undefined : cat,
        sort,
        page: page + 1,
        pageSize: 12,
      });
      setApiProperties(current => [...current, ...result.items]);
      setPage(result.page);
      setTotalPages(result.totalPages);
      setTotal(result.total);
    } catch (error) {
      setApiError(error instanceof Error ? error.message : "Unable to load more listings");
    } finally {
      setLoadingMore(false);
    }
  };

  const toggleComparison = (property: AgriProperty) => {
    setComparedProperties(current => current.some(item => item.id === property.id)
      ? current.filter(item => item.id !== property.id)
      : current.length < 3 ? [...current, property] : current);
  };

  const properties = useMemo(() => {
    const filters = advancedFilters;
    return apiProperties.filter(property => {
      if (!filters) return true;
      const area = convertArea(property.area, property.areaUnit, filters.areaUnit);
      const minArea = filters.minArea === "" ? true : area >= filters.minArea;
      const maxArea = filters.maxArea === "" ? true : area <= filters.maxArea;
      const minBudget = filters.minBudget === "" ? true : property.price >= filters.minBudget;
      const maxBudget = filters.maxBudget === "" ? true : property.price <= filters.maxBudget;
      const irrigation = filters.irrigationTypes.length === 0 || filters.irrigationTypes.some(value => property.irrigation.includes(value as typeof property.irrigation[number]));
      return (!filters.village || property.village === filters.village) && minArea && maxArea && minBudget && maxBudget && irrigation && (!filters.highwayTouch || property.highwayTouch) && (!filters.canalTouch || property.canalTouch) && (!filters.dedicatedTubewell || property.irrigation.includes("tubewell")) && (!filters.solarPump || property.irrigation.includes("solar_pump")) && (!filters.immediateRegistry || property.immediateRegistry) && (!filters.singleOwner || property.singleOwner) && (!filters.sellerType || property.sellerType === filters.sellerType);
    });
  }, [advancedFilters, apiProperties]);

  const activeFilters = [
    cat !== "all" && PROPERTY_CATEGORIES[cat]?.label,
    village !== "all" && village,
    search && `"${search}"`,
  ].filter(Boolean) as string[];

  return (
    <>
      <SeoSchema page="listings" />
      <Navbar onSellClick={() => setSellOpen(true)} />

      <main id="main-content" className="min-h-screen">
        {/* Page header */}
        <section className="relative bg-gradient-to-br from-forest-950 via-forest-900 to-agri-green-dark pt-24 pb-10 overflow-hidden">
          <div className="absolute inset-0 bg-grid-white opacity-30" />
          <div className="relative max-w-7xl mx-auto px-4 md:px-6">
            <nav className="flex items-center gap-2 text-white/40 text-xs mb-5">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <span>/</span>
              <span className="text-white/70">Property Listings</span>
            </nav>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2">
              Property Listings — Palia Kalan
            </h1>
            <p className="text-white/50 text-sm">
              {loading ? "Loading live properties..." : `${total} live listings across Palia, Sampurna Nagar, Mailani, Tikunia & surrounding areas`}
            </p>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">

          {/* Search + category pills row */}
          <div className="mb-5 space-y-3">
            {/* Search bar */}
            <div className="relative max-w-lg">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder="Search by title, village, location..."
                aria-label="Search properties"
                className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-sm outline-none focus:border-agri-green focus:ring-2 focus:ring-agri-green/10 transition-all"
              />
              {searchInput && (
                <button onClick={() => { setSearchInput(""); setSearch(""); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700" aria-label="Clear search">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Category pills */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              <button onClick={() => setCat("all")}
                className={cn("flex-shrink-0 text-xs font-bold px-3.5 py-2 rounded-full border transition-all",
                  cat === "all" ? "bg-agri-green text-white border-agri-green shadow-sm" : "bg-white text-slate-600 border-slate-200 hover:border-agri-green hover:text-agri-green")}>
                All Types
              </button>
              {(Object.entries(PROPERTY_CATEGORIES) as [PropertyCategory, { label: string; icon: string }][]).map(([key, val]) => (
                <button key={key} onClick={() => setCat(key)}
                  className={cn("flex-shrink-0 flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-full border transition-all",
                    cat === key ? "bg-agri-green text-white border-agri-green shadow-sm" : "bg-white text-slate-600 border-slate-200 hover:border-agri-green hover:text-agri-green")}>
                  <span>{val.icon}</span>{val.label}
                </button>
              ))}
            </div>

            {/* Village pills */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              <button onClick={() => setVillage("all")}
                className={cn("flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all",
                  village === "all" ? "bg-trust-blue text-white border-trust-blue shadow-sm" : "bg-white text-slate-500 border-slate-200 hover:border-trust-blue hover:text-trust-blue")}>
                All Villages
              </button>
              {locations.map(v => (
                <button key={v} onClick={() => setVillage(v)}
                  className={cn("flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full border transition-all",
                    village === v ? "bg-trust-blue text-white border-trust-blue shadow-sm" : "bg-white text-slate-500 border-slate-200 hover:border-trust-blue hover:text-trust-blue")}>
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 py-3 mb-5 border-y border-slate-100">
            <div className="flex items-center gap-3">
              <button onClick={() => setFilterOpen(true)}
                className="lg:hidden flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 px-3 py-2 rounded-xl hover:border-agri-green hover:text-agri-green transition-all">
                <SlidersHorizontal className="w-3.5 h-3.5" /> Filters
              </button>
              <span className="text-sm text-slate-500">
                <strong className="text-slate-900 font-bold">{properties.length}</strong> of {total} properties
              </span>
              {/* Active filter chips */}
              <AnimatePresence>
                {activeFilters.map(f => (
                  <motion.span key={f} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                    className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-bold bg-agri-green-50 text-agri-green border border-agri-green-200 px-2.5 py-0.5 rounded-full">
                    {f}
                    <button onClick={() => {
                      if (f === village) setVillage("all");
                      else if (activeFilters.includes(f)) setCat("all");
                      else setSearch("");
                    }}><X className="w-3 h-3" /></button>
                  </motion.span>
                ))}
              </AnimatePresence>
            </div>

            <div className="flex items-center gap-2">
              {/* Unit */}
              <div className="hidden sm:flex gap-0.5 bg-slate-100 rounded-xl p-0.5">
                {(["bigha", "acre", "hectare"] as LandUnit[]).map(u => (
                  <button key={u} onClick={() => setUnit(u)}
                    className={cn("text-[11px] font-bold px-2.5 py-1.5 rounded-lg transition-all",
                      unit === u ? "bg-white text-agri-green shadow-xs" : "text-slate-400 hover:text-agri-green")}>
                    {u === "bigha" ? "Bigha" : u === "acre" ? "Acre" : "Ha."}
                  </button>
                ))}
              </div>

              {/* Sort */}
              <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-2.5 py-2">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                <select value={sort} onChange={e => setSort(e.target.value as SortOption)}
                  className="text-xs font-semibold text-slate-700 outline-none bg-transparent cursor-pointer">
                  {SORT_OPTIONS.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
                </select>
              </div>

              {/* View mode */}
              <div className="hidden sm:flex gap-0.5 bg-slate-100 rounded-xl p-0.5">
                {([{ v: "grid" as ViewMode, icon: Grid3X3 }, { v: "list" as ViewMode, icon: List }]).map(({ v, icon: Icon }) => (
                  <button key={v} onClick={() => setView(v)}
                    className={cn("p-2 rounded-lg transition-all", view === v ? "bg-white text-agri-green shadow-xs" : "text-slate-400 hover:text-agri-green")}>
                    <Icon className="w-3.5 h-3.5" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main layout */}
          <div className="flex gap-6">
            {/* Desktop sidebar */}
            <div className="hidden lg:block w-72 flex-shrink-0">
              <div className="sticky top-24">
                <FilterSidebar mode="sidebar" onFiltersChange={setAdvancedFilters} />
              </div>
            </div>

            {/* Properties grid */}
            <div className="flex-1 min-w-0">
              {loading ? (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3" aria-label="Loading properties">
                  {[1, 2, 3].map(item => <div key={item} className="h-96 animate-pulse rounded-2xl bg-slate-200" />)}
                </div>
              ) : apiError ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-6 py-12 text-center">
                  <h3 className="text-lg font-extrabold text-amber-950">Property API unavailable</h3>
                  <p className="mt-2 text-sm text-amber-800">Start the Node API at <code>http://localhost:4000</code> to load live listings.</p>
                </div>
              ) : properties.length === 0 ? (
                <div className="text-center py-20">
                  <div className="text-5xl mb-4">🌾</div>
                  <h3 className="text-lg font-extrabold text-slate-900 mb-2">No properties found</h3>
                  <p className="text-slate-500 text-sm mb-5">Try adjusting your filters or clearing the search.</p>
                  <button onClick={() => { setCat("all"); setVillage("all"); setSearch(""); setSearchInput(""); }}
                    className="text-sm font-bold text-agri-green border border-agri-green px-4 py-2 rounded-xl hover:bg-agri-green-50 transition-colors">
                    Clear all filters
                  </button>
                </div>
              ) : (
                <motion.div layout
                  className={cn("grid gap-5", view === "grid" ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3" : "grid-cols-1")}>
                  {properties.map(p => (
                    <AgriPropertyCard
                      key={p.id}
                      property={p}
                      displayUnit={unit}
                      compact={view === "list"}
                      compared={comparedProperties.some(item => item.id === p.id)}
                      compareDisabled={comparedProperties.length >= 3 && !comparedProperties.some(item => item.id === p.id)}
                      onCompare={() => toggleComparison(p)}
                    />
                  ))}
                </motion.div>
              )}

              {page < totalPages && (
                <div className="text-center mt-10">
                  <button
                    onClick={() => void loadMore()}
                    disabled={loadingMore}
                    className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 border border-slate-200 bg-white px-6 py-3 rounded-xl hover:border-agri-green hover:text-agri-green transition-all disabled:opacity-50"
                  >
                    {loadingMore ? "Loading..." : "Load More Properties"}
                  </button>
                  <p className="text-xs text-slate-400 mt-2">Showing {properties.length} of {total} listings</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <PropertyComparison
        properties={comparedProperties}
        isOpen={comparisonOpen}
        onOpen={() => setComparisonOpen(true)}
        onClose={() => setComparisonOpen(false)}
        onRemove={propertyId => setComparedProperties(current => current.filter(property => property.id !== propertyId))}
        onClear={() => { setComparedProperties([]); setComparisonOpen(false); }}
      />
      <FilterSidebar mode="drawer" isOpen={filterOpen} onClose={() => setFilterOpen(false)} onFiltersChange={setAdvancedFilters} />
      <SellLandModal isOpen={sellOpen} onClose={() => setSellOpen(false)} />
    </>
  );
}
