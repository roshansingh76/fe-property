"use client";

import { useMemo, useState } from "react";
import { ArrowUpRight, BarChart3, Building2, Droplets, Route, TriangleAlert } from "lucide-react";
import { convertArea, formatArea, formatPrice } from "@/lib/utils/conversions";
import type { AgriProperty, LandUnit } from "@/lib/data/properties";

const UNIT_OPTIONS: LandUnit[] = ["bigha", "acre", "hectare"];

export function MarketIntelligence({ properties }: { properties: AgriProperty[] }) {
  const [selectedUnit, setSelectedUnit] = useState<LandUnit>("bigha");
  const [landSize, setLandSize] = useState(5);

  const metrics = useMemo(() => {
    if (!properties.length) {
      return {
        avgPricePerBigha: 0,
        avgArea: 0,
        irrigationCoverage: 0,
        highwayShare: 0,
        villageCount: 0,
      };
    }

    const totalPricePerBigha = properties.reduce((sum, property) => {
      const areaInBigha = convertArea(property.area, property.areaUnit, "bigha");
      const pricePerBigha = areaInBigha > 0 ? property.price / areaInBigha : 0;
      return sum + pricePerBigha;
    }, 0);

    const totalArea = properties.reduce((sum, property) => sum + convertArea(property.area, property.areaUnit, "bigha"), 0);
    const irrigationCoverage = (properties.filter(property => property.irrigation.some(item => ["tubewell", "canal", "solar_pump"].includes(item))).length / properties.length) * 100;
    const highwayShare = (properties.filter(property => property.highwayTouch || property.canalTouch).length / properties.length) * 100;

    return {
      avgPricePerBigha: totalPricePerBigha / properties.length,
      avgArea: totalArea / properties.length,
      irrigationCoverage,
      highwayShare,
      villageCount: new Set(properties.map(property => property.village)).size,
    };
  }, [properties]);

  const estimatedValue = useMemo(() => {
    const areaInBigha = convertArea(landSize, selectedUnit, "bigha");
    return areaInBigha * metrics.avgPricePerBigha;
  }, [landSize, metrics.avgPricePerBigha, selectedUnit]);

  const marketCards = [
    {
      label: "Avg. value",
      value: metrics.avgPricePerBigha > 0 ? formatPrice(metrics.avgPricePerBigha, true) : "₹0",
      detail: "per bigha",
      accent: "bg-agri-green-50 text-agri-green border-agri-green-200",
      icon: BarChart3,
    },
    {
      label: "Irrigated supply",
      value: `${Math.round(metrics.irrigationCoverage)}%`,
      detail: "water-secure land",
      accent: "bg-sky-50 text-sky-700 border-sky-200",
      icon: Droplets,
    },
    {
      label: "Transit premium",
      value: `${Math.round(metrics.highwayShare)}%`,
      detail: "on highway/canal edge",
      accent: "bg-amber-50 text-amber-700 border-amber-200",
      icon: Route,
    },
    {
      label: "Micro-market reach",
      value: `${metrics.villageCount}`,
      detail: "villages covered",
      accent: "bg-violet-50 text-violet-700 border-violet-200",
      icon: Building2,
    },
  ];

  return (
    <section className="py-16 md:py-20 bg-slate-950 text-white">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-10">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-200 mb-4">
              <TriangleAlert className="w-3.5 h-3.5" /> Market Pulse
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
              Investor-grade land intelligence for Palia
            </h2>
          </div>
          <p className="max-w-xl text-sm text-slate-300 leading-relaxed">
            Price, irrigation, and connectivity signals help buyers compare opportunity quickly and negotiate with confidence.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {marketCards.map(({ label, value, detail, accent, icon: Icon }) => (
            <div key={label} className={`rounded-2xl border p-5 ${accent}`}>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-[0.18em] opacity-80">{label}</span>
                <Icon className="w-4 h-4" />
              </div>
              <div className="text-3xl font-black tracking-tight">{value}</div>
              <div className="mt-2 text-xs font-medium opacity-80">{detail}</div>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-300">Quick valuation</div>
                <h3 className="mt-2 text-xl font-bold text-white">Estimate your land value</h3>
              </div>
              <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-slate-200">
                <ArrowUpRight className="w-3 h-3" /> Live market
              </div>
            </div>

            <div className="space-y-5">
              <div className="flex gap-2">
                {UNIT_OPTIONS.map(unit => (
                  <button
                    key={unit}
                    type="button"
                    onClick={() => setSelectedUnit(unit)}
                    className={`flex-1 rounded-xl px-3 py-2 text-sm font-bold transition ${
                      selectedUnit === unit ? "bg-emerald-400 text-slate-950" : "bg-white/5 text-slate-200 hover:bg-white/10"
                    }`}
                  >
                    {unit === "bigha" ? "Bigha" : unit === "acre" ? "Acre" : "Hectare"}
                  </button>
                ))}
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">
                  Land size
                </label>
                <input
                  type="number"
                  min={0.5}
                  step={0.5}
                  value={landSize}
                  onChange={event => setLandSize(Number(event.target.value) || 0)}
                  className="w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-lg text-white outline-none ring-0 placeholder:text-slate-500 focus:border-emerald-400"
                  placeholder="Enter area"
                />
              </div>

              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200">Estimated value</div>
                <div className="mt-3 text-3xl font-black text-white">
                  {formatPrice(estimatedValue, false)}
                </div>
                <div className="mt-1 text-sm text-emerald-100">
                  {formatArea(convertArea(landSize, selectedUnit, "bigha"), "bigha")} at around {formatPrice(metrics.avgPricePerBigha, true)} / Bigha
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-300">Why this market wins</div>
            <div className="mt-5 space-y-4">
              {[
                "High-value sugarcane belts maintain stable crop-linked cash flow.",
                "Canal and highway connectivity create premium pricing across Palia, Mailani, and Sampurna Nagar.",
                "Land banks around Dudhwa and NH-730 show resilient appreciation for long-term hold strategies.",
              ].map((item) => (
                <div key={item} className="flex gap-3 rounded-2xl border border-white/10 bg-slate-900/60 p-3 text-sm text-slate-200">
                  <div className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
