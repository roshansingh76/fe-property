"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, TreePine, Waves, Globe, PhoneCall, ChevronRight, MapPin, Sparkles, TrendingUp } from "lucide-react";

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { HeroSearch } from "@/components/hero-search";
import { CategoryGrid } from "@/components/category-grid";
import { AgriPropertyCard } from "@/components/agri-property-card";
import { TrustStats } from "@/components/trust-stats";
import { FilterSidebar } from "@/components/filter-sidebar";
import { SellLandModal } from "@/components/sell-land-modal";
import { BuyerForm } from "@/components/buyer-form";
import { RegionalMap } from "@/components/regional-map";
import { MarketIntelligence } from "@/components/market-intelligence";
import { SeoSchema } from "@/components/seo-schema";
import { fetchLocations, fetchProperties } from "@/lib/api/client";
import type { AgriProperty, LandUnit } from "@/lib/data/properties";

const UNIT_LABELS: Record<LandUnit, string> = { bigha: "Bigha", acre: "Acre", hectare: "Hectare", sqft: "Sq. Ft." };

const WHY_INVEST = [
  { emoji: "🌾", title: "Fertile Alluvial Terai Soil", desc: "Deep alluvial loam ideal for sugarcane (350+ qtl/acre), paddy, wheat, and mango orchards.", stat: "350+", unit: "Qtl/Acre yield" },
  { emoji: "💧", title: "Sarda Canal Irrigation",      desc: "Year-round irrigation across Lakhimpur Kheri via the Sarda Canal network.", stat: "Year-round", unit: "Water supply" },
  { emoji: "🛣️", title: "NH-730 Trade Corridors",     desc: "National Highway 730 and Indo-Nepal border trade drive commercial land premiums.", stat: "30-50%", unit: "Highway premium" },
  { emoji: "🌿", title: "Dudhwa Eco-Tourism Boom",     desc: "8km from Dudhwa Tiger Reserve — farmhouse & resort land prices surging.", stat: "18L+", unit: "Annual visitors" },
  { emoji: "🏭", title: "Sugar Mill Proximity",        desc: "Multiple sugar mills ensure MSP-guaranteed procurement for sugarcane farmers.", stat: "MSP", unit: "Price guaranteed" },
  { emoji: "📈", title: "Land Appreciation Trend",     desc: "Agricultural land up 40-60% over 5 years, driven by infra growth.", stat: "40-60%", unit: "5-yr appreciation" },
];

const CONVERSIONS = [
  { from: "1 Pucca Bigha", to: "0.62 Acres",   also: "= 27,000 Sq. Ft." },
  { from: "1 Acre",        to: "1.61 Bigha",    also: "= 43,560 Sq. Ft." },
  { from: "1 Hectare",     to: "3.95 Bigha",    also: "= 2.47 Acres" },
  { from: "1 Acre (Ha.)",  to: "0.40 Hectare",  also: "= 100 Decimal" },
];

export default function HomePage() {
  const [sellOpen, setSellOpen] = useState(false);
  const [displayUnit, setDisplayUnit] = useState<LandUnit>("bigha");
  const [properties, setProperties] = useState<AgriProperty[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [apiError, setApiError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchProperties()
      .then(items => { if (!cancelled) setProperties(items); })
      .catch(() => { if (!cancelled) setApiError(true); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    void fetchLocations()
      .then(items => setLocations(items.filter(item => ["CITY", "VILLAGE"].includes(item.type)).map(item => item.name)))
      .catch(() => setLocations([]));
  }, []);

  const featured = properties.filter(property => property.featured).slice(0, 3);
  const recent = properties.slice(0, 8);

  return (
    <>
      <SeoSchema page="home" />
      <Navbar onSellClick={() => setSellOpen(true)} />

      <main id="main-content">
        {/* ══ HERO ══════════════════════════════════════════════════════ */}
        <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0 z-0">
            <Image
              src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1920&q=85"
              alt="Agricultural fields in Palia Kalan, Lakhimpur Kheri"
              fill priority sizes="100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 mesh-hero opacity-90" />
            <div className="absolute inset-0 bg-grid-white" />
            <div className="absolute inset-0 bg-dot-white opacity-40" />
          </div>

          {/* Floating orbs */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-forest-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-gold-400/8 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 w-full max-w-5xl mx-auto px-4 md:px-6 pt-28 pb-20 flex flex-col items-center text-center">
            {/* Pill badge */}
            <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 glass-dark rounded-full px-4 py-1.5 mb-8">
              <div className="w-1.5 h-1.5 rounded-full bg-gold-300 animate-pulse" />
              <span className="text-white/85 text-xs font-semibold tracking-wide">
                <MapPin className="w-3 h-3 inline mr-1 text-gold-300" />
                Palia Kalan · Lakhimpur Kheri · Uttar Pradesh
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl md:text-6xl lg:text-7xl font-black leading-[1.05] mb-5 tracking-tight">
              <span className="text-white">Buy & Sell</span>
              <br />
              <span className="text-gradient-hero">Agriculture Land</span>
              <br />
              <span className="text-white/90 text-4xl md:text-5xl lg:text-6xl">in Palia Kalan</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.2 }}
              className="text-white/65 text-lg md:text-xl max-w-2xl leading-relaxed mb-3">
              Verified sugarcane farms, residential plots, farmhouses &amp; investment land — with local experts who know every khasra in the region.
            </motion.p>

            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
              className="text-white/35 text-sm mb-10 tracking-widest uppercase font-medium">
              Buy · Sell · Agriculture · Farmhouses · Commercial · Residential
            </motion.p>

            {/* Search */}
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.35 }}
              className="w-full">
              <HeroSearch onSellClick={() => setSellOpen(true)} />
            </motion.div>

            {/* Trust strip */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
              className="mt-10">
              <TrustStats variant="compact" />
            </motion.div>

            {/* Landmark badges */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.75 }}
              className="flex flex-wrap justify-center gap-2 mt-6">
              {[
                { icon: TreePine, label: "Near Dudhwa National Park", color: "text-forest-400" },
                { icon: Waves, label: "Sarda River Corridor", color: "text-sky-400" },
                { icon: Globe, label: "Indo-Nepal Trade Route", color: "text-gold-300" },
              ].map(b => (
                <div key={b.label} className="flex items-center gap-1.5 glass-dark rounded-full px-3 py-1.5 text-white/60 text-xs font-medium">
                  <b.icon className={`w-3 h-3 ${b.color}`} />
                  {b.label}
                </div>
              ))}
            </motion.div>
          </div>

          {/* Scroll indicator */}
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1 text-white/30">
            <div className="w-5 h-8 rounded-full border border-white/20 flex items-start justify-center pt-1.5">
              <div className="w-1 h-2 bg-white/40 rounded-full" />
            </div>
          </motion.div>
        </section>

        {/* ══ TRUST STATS ══════════════════════════════════════════════ */}
        <section className="bg-white py-14 md:py-16 border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <TrustStats />
          </div>
        </section>

        {/* ══ CATEGORIES ═══════════════════════════════════════════════ */}
        <section className="py-16 md:py-20 mesh-section">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="text-center mb-10">
              <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
                className="inline-flex items-center gap-2 bg-agri-green-50 border border-agri-green-200 rounded-full px-4 py-1.5 text-agri-green text-xs font-bold uppercase tracking-wider mb-4">
                <Sparkles className="w-3.5 h-3.5" /> Browse by Type
              </motion.div>
              <motion.h2 initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-3">
                Specialized Agriculture Categories
              </motion.h2>
              <motion.p initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
                className="text-slate-500 text-base max-w-xl mx-auto">
                From sugarcane farms to Dudhwa resort plots — find exactly what you need in the Terai region.
              </motion.p>
            </div>
            <CategoryGrid />
          </div>
        </section>

        <MarketIntelligence properties={properties} />

        {/* ══ FEATURED LISTINGS ════════════════════════════════════════ */}
        <section className="py-16 md:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
              <div>
                <div className="inline-flex items-center gap-2 bg-harvest-gold-50 border border-harvest-gold-100 rounded-full px-3 py-1 text-harvest-gold-dark text-[11px] font-bold uppercase tracking-wider mb-3">
                  ⭐ Premium Properties
                </div>
                <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900">Featured Listings</h2>
                <p className="text-slate-500 text-sm mt-1.5">Handpicked, verified properties in the Palia region</p>
              </div>
              {/* Unit toggle */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-semibold">Area in:</span>
                <div className="flex bg-slate-100 rounded-xl p-0.5 gap-0.5">
                  {(["bigha", "acre", "hectare"] as LandUnit[]).map(u => (
                    <button key={u} onClick={() => setDisplayUnit(u)}
                      className={`text-xs px-3 py-1.5 rounded-xl font-bold transition-all duration-200 ${displayUnit === u ? "bg-agri-green text-white shadow-sm" : "text-slate-500 hover:text-agri-green"}`}>
                      {UNIT_LABELS[u]}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {apiError ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-6 py-10 text-center text-sm text-amber-900">
                Live listings will appear when the Node API is running on port 4000.
              </div>
            ) : featured.length > 0 ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 md:gap-6">
                {featured.map(p => <AgriPropertyCard key={p.id} property={p} displayUnit={displayUnit} />)}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map(item => <div key={item} className="h-96 animate-pulse rounded-2xl bg-slate-100" />)}
              </div>
            )}

            <div className="mt-10 text-center">
              <Link href="/listings" className="inline-flex items-center gap-2 rounded-xl border-2 border-agri-green px-6 py-3 font-bold text-agri-green transition-all duration-200 hover:bg-agri-green hover:text-white hover:shadow-green">
                View All {properties.length}+ Listings <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* ══ ALL LISTINGS + FILTER ════════════════════════════════════ */}
        <section className="py-16 md:py-20 mesh-section">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <h2 className="text-3xl font-extrabold text-slate-900 md:text-4xl">Latest Listings</h2>
              </div>
              <Link href="/listings" className="flex items-center gap-1.5 text-sm font-bold text-agri-green transition-colors hover:text-forest-700">
                See all <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="flex gap-6">
              {/* Sidebar */}
              <div className="hidden lg:block w-72 flex-shrink-0">
                <div className="sticky top-24">
                  <FilterSidebar mode="sidebar" />
                </div>
              </div>
              {/* Cards */}
              <div className="flex-1 min-w-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {recent.map(p => <AgriPropertyCard key={p.id} property={p} displayUnit={displayUnit} />)}
                </div>
                <div className="text-center mt-8">
                  <Link href="/listings"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-agri-green to-forest-600 text-white font-bold px-6 py-3 rounded-xl hover:shadow-green transition-all hover:scale-[1.02]">
                    Browse All Properties <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══ MAP ═══════════════════════════════════════════════════════ */}
        <section id="map-section" className="py-16 md:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 bg-agri-green-50 border border-agri-green-200 rounded-full px-4 py-1.5 text-agri-green text-xs font-bold uppercase tracking-wider mb-4">
                🗺️ Live Map
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-3">Explore Properties on Map</h2>
              <p className="text-slate-500 text-base max-w-lg mx-auto">
                Browse active listings across Palia Kalan, Sampurna Nagar, Tikunia, Mailani and surrounding villages.
              </p>
            </div>
            <RegionalMap height="520px" className="rounded-2xl overflow-hidden shadow-xl border border-slate-200" />
          </div>
        </section>

        {/* ══ SELL CTA + BUYER FORM ════════════════════════════════════ */}
        <section id="sell" className="py-16 md:py-20 relative overflow-hidden bg-gradient-to-br from-forest-950 via-forest-900 to-agri-green-dark">
          <div className="absolute inset-0 bg-grid-white opacity-40" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-forest-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-gold-400/8 rounded-full blur-3xl" />

          <div className="relative max-w-7xl mx-auto px-4 md:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
              {/* Sell CTA */}
              <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                className="text-white">
                <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-full px-3 py-1.5 text-white/70 text-xs font-bold uppercase tracking-wider mb-5">
                  For Property Owners
                </div>
                <h2 className="text-4xl md:text-5xl font-black leading-tight mb-5">
                  Sell Your Land
                  <span className="block text-gradient-gold">Reach 10,000+ Buyers</span>
                </h2>
                <p className="text-white/60 text-base mb-8 leading-relaxed max-w-md">
                  List your sugarcane farm, plot, or commercial land for free. Our verified buyer network covers all of Lakhimpur Kheri and beyond.
                </p>

                <div className="space-y-2.5 mb-8">
                  {[
                    "✅  Free listing — zero commission",
                    "✅  Khatauni verification support",
                    "✅  WhatsApp lead delivery",
                    "✅  Local field expert assistance",
                    "✅  Registry & legal documentation help",
                  ].map(item => (
                    <p key={item} className="text-white/70 text-sm font-medium">{item}</p>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button onClick={() => setSellOpen(true)}
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-harvest-gold to-gold-400 hover:from-gold-700 hover:to-harvest-gold text-white font-extrabold px-6 py-4 rounded-xl shadow-gold hover:scale-[1.02] transition-all text-base">
                    List My Property Free <ArrowRight className="w-4 h-4" />
                  </button>
                  <a href="tel:+919876543210"
                    className="flex items-center justify-center gap-2 border-2 border-white/25 hover:border-white/50 text-white font-bold px-6 py-4 rounded-xl transition-all text-base hover:bg-white/10">
                    <PhoneCall className="w-4 h-4" /> Talk to Expert
                  </a>
                </div>

                {/* Mini stats */}
                <div className="flex gap-8 mt-8 pt-6 border-t border-white/10">
                  {[{ v: "24h", l: "Avg response" }, { v: "500+", l: "Properties sold" }, { v: "0%", l: "Commission" }].map(s => (
                    <div key={s.l}>
                      <div className="text-2xl font-extrabold text-gold-400">{s.v}</div>
                      <div className="text-white/50 text-xs mt-0.5">{s.l}</div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Buyer form */}
              <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
                <BuyerForm />
              </motion.div>
            </div>
          </div>
        </section>

        {/* ══ WHY INVEST ══════════════════════════════════════════════ */}
        <section className="py-16 md:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 bg-harvest-gold-50 border border-harvest-gold-100 rounded-full px-4 py-1.5 text-harvest-gold-dark text-xs font-bold uppercase tracking-wider mb-4">
                <TrendingUp className="w-3.5 h-3.5" /> Investment Insight
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-3">Why Invest in Palia Kalan?</h2>
              <p className="text-slate-500 text-base max-w-xl mx-auto">
                The Terai belt of Lakhimpur Kheri offers India&apos;s most fertile agricultural land with excellent infrastructure.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {WHY_INVEST.map((item, i) => (
                <motion.div key={item.title}
                  initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.06 }}
                  className="group bg-slate-50 hover:bg-white border border-slate-100 hover:border-agri-green-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300"
                >
                  <div className="text-3xl mb-3">{item.emoji}</div>
                  <h3 className="font-extrabold text-slate-900 text-base mb-2 group-hover:text-agri-green transition-colors">{item.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed mb-4">{item.desc}</p>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xl font-extrabold text-agri-green">{item.stat}</span>
                    <span className="text-xs text-slate-400 font-medium">{item.unit}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ CONVERTER ══════════════════════════════════════════════ */}
        <section id="converter" className="py-12 bg-agri-green-50 border-y border-agri-green-200">
          <div className="max-w-4xl mx-auto px-4 md:px-6 text-center">
            <h2 className="text-2xl font-extrabold text-agri-green mb-1.5">UP Land Measurement Quick Reference</h2>
            <p className="text-slate-500 text-sm mb-8">Standard conversion for Palia Kalan / Terai region (Pucca Bigha)</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {CONVERSIONS.map((c, i) => (
                <div key={i} className="bg-white rounded-2xl p-4 border border-agri-green-200 shadow-xs text-left hover:shadow-md hover:border-agri-green transition-all">
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">{c.from}</div>
                  <div className="text-lg font-extrabold text-agri-green mb-1">{c.to}</div>
                  <div className="text-[11px] text-slate-400">{c.also}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ QUICK VILLAGE LINKS ═══════════════════════════════════ */}
        <section className="py-10 bg-white border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="flex flex-wrap items-center gap-3 justify-center">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Explore by Village:</span>
              {locations.map(v => (
                <Link key={v} href={`/listings?village=${encodeURIComponent(v)}`}
                  className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200 rounded-full px-3 py-1.5 hover:border-agri-green hover:text-agri-green hover:bg-agri-green-50 transition-all duration-200">
                  <MapPin className="w-3 h-3" /> {v}
                </Link>
              ))}
              <Link href="/listings" className="flex items-center gap-1 text-xs font-bold text-agri-green hover:text-forest-700">
                All Locations <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <SellLandModal isOpen={sellOpen} onClose={() => setSellOpen(false)} />
    </>
  );
}
