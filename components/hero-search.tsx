"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, ChevronDown, SlidersHorizontal, ArrowRight, Wheat, Home, Tag } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { fetchLocations } from "@/lib/api/client";

type SearchTab = "buy_agri" | "buy_residential" | "sell";

const TABS: { id: SearchTab; label: string; shortLabel: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "buy_agri", label: "Buy Agriculture", shortLabel: "Buy Agri", icon: Wheat },
  { id: "buy_residential", label: "Buy Residential", shortLabel: "Res / Com", icon: Home },
  { id: "sell", label: "Sell Property", shortLabel: "Sell", icon: Tag },
];

const AGRI_TYPES = [
  { value: "", label: "All Agricultural" },
  { value: "sugarcane_farm", label: "Sugarcane Farm" },
  { value: "paddy_wheat", label: "Paddy & Wheat" },
  { value: "mango_orchard", label: "Mango Orchard" },
  { value: "farmhouse_resort", label: "Farmhouse / Resort" },
  { value: "dairy_poultry", label: "Dairy / Poultry" },
  { value: "poplar_plantation", label: "Poplar Plantation" },
  { value: "fish_farm", label: "Fish Farm" },
];

const RES_TYPES = [
  { value: "", label: "All Property Types" },
  { value: "residential_plot", label: "Residential Plot" },
  { value: "commercial_land", label: "Commercial Land" },
  { value: "highway_investment", label: "Highway Investment" },
];

const BUDGETS = [
  { value: "", label: "Any Budget" },
  { value: "500000", label: "Under ₹5 Lakh" },
  { value: "1000000", label: "Under ₹10 Lakh" },
  { value: "2500000", label: "Under ₹25 Lakh" },
  { value: "5000000", label: "Under ₹50 Lakh" },
  { value: "10000000", label: "Under ₹1 Crore" },
  { value: "99999999", label: "Above ₹1 Crore" },
];

const AREA_UNITS = ["Bigha", "Acre", "Hectare", "Sq.Ft."];

const SelectField = ({
  label, value, onChange, options, icon,
}: {
  label: string; value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[]; icon?: React.ComponentType<{ className?: string }>;
}) => {
  const Icon = icon;
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
        {Icon && <Icon className="w-3 h-3" />}{label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full appearance-none bg-slate-50 border border-slate-200 hover:border-agri-green/40 focus:border-agri-green focus:ring-2 focus:ring-agri-green/10 rounded-xl px-3 py-2.5 pr-8 text-sm text-slate-800 font-medium outline-none transition-all duration-200 cursor-pointer"
        >
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
      </div>
    </div>
  );
};

interface HeroSearchProps { onSellClick?: () => void; }

export function HeroSearch({ onSellClick }: HeroSearchProps) {
  const [tab, setTab] = useState<SearchTab>("buy_agri");
  const [village, setVillage] = useState("");
  const [type, setType] = useState("");
  const [budget, setBudget] = useState("");
  const [unit, setUnit] = useState("Bigha");
  const [advanced, setAdvanced] = useState(false);
  const [irrigation, setIrrigation] = useState("");
  const [locations, setLocations] = useState<string[]>([]);

  useEffect(() => {
    void fetchLocations()
      .then(items => setLocations(items.filter(item => ["CITY", "VILLAGE"].includes(item.type)).map(item => item.name)))
      .catch(() => setLocations([]));
  }, []);

  const handleSearch = () => {
    const p = new URLSearchParams({ tab });
    if (village) p.set("village", village);
    if (type) p.set("category", type);
    if (budget) p.set("maxBudget", budget);
    window.location.href = `/listings?${p.toString()}`;
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Tab row */}
      <div className="flex gap-1 p-1 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 mb-3">
        {TABS.map(t => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); if (t.id === "sell") onSellClick?.(); }}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-semibold transition-all duration-250",
                active
                  ? "bg-white text-agri-green shadow-md"
                  : "text-white/75 hover:text-white hover:bg-white/10"
              )}
            >
              <Icon className={cn("w-3.5 h-3.5", !active && "opacity-70")} />
              <span className="hidden sm:inline">{t.label}</span>
              <span className="sm:hidden">{t.shortLabel}</span>
            </button>
          );
        })}
      </div>

      {/* Panel */}
      <AnimatePresence mode="wait">
        {tab !== "sell" ? (
          <motion.div
            key="search"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="glass-card rounded-2xl p-4 md:p-5"
          >
            {/* Main row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
              <SelectField
                label="Location / Village"
                value={village}
                onChange={setVillage}
                icon={MapPin}
                options={[{ value: "", label: "All Locations" }, ...locations.map(location => ({ value: location, label: location }))]}
              />
              <SelectField
                label="Property Type"
                value={type}
                onChange={setType}
                options={tab === "buy_agri" ? AGRI_TYPES : RES_TYPES}
              />
              <SelectField
                label="Max Budget"
                value={budget}
                onChange={setBudget}
                options={BUDGETS}
              />
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest opacity-0 select-none">Search</span>
                <button
                  onClick={handleSearch}
                  className="w-full h-[42px] flex items-center justify-center gap-2 bg-gradient-to-r from-agri-green to-forest-600 hover:from-forest-700 hover:to-agri-green text-white text-sm font-bold rounded-xl shadow-sm hover:shadow-green transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Search className="w-4 h-4" />
                  Search Land
                </button>
              </div>
            </div>

            {/* Bottom row */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <button
                onClick={() => setAdvanced(!advanced)}
                className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-agri-green font-medium transition-colors"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                {advanced ? "Hide" : "More"} Filters
                <ChevronDown className={cn("w-3 h-3 transition-transform", advanced && "rotate-180")} />
              </button>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-400 font-medium">Unit:</span>
                <div className="flex bg-slate-100 rounded-xl p-0.5 gap-0.5">
                  {AREA_UNITS.map(u => (
                    <button
                      key={u}
                      onClick={() => setUnit(u)}
                      className={cn(
                        "text-[11px] font-bold px-2.5 py-1 rounded-lg transition-all duration-200",
                        unit === u ? "bg-agri-green text-white shadow-sm" : "text-slate-500 hover:text-agri-green"
                      )}
                    >{u}</button>
                  ))}
                </div>
              </div>
            </div>

            {/* Advanced filters */}
            <AnimatePresence>
              {advanced && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 pt-3 border-t border-slate-100">
                    {[
                      {
                        label: "Irrigation",
                        value: irrigation,
                        onChange: setIrrigation,
                        options: [
                          { value: "", label: "Any Irrigation" },
                          { value: "tubewell", label: "💧 Tube Well" },
                          { value: "canal", label: "🌊 Sarda Canal" },
                          { value: "drip", label: "💦 Drip System" },
                          { value: "solar_pump", label: "☀️ Solar Pump" },
                        ],
                      },
                      {
                        label: "Road Access",
                        value: "",
                        onChange: () => {},
                        options: [
                          { value: "", label: "Any Road" },
                          { value: "highway", label: "🛣️ Highway Touch" },
                          { value: "district", label: "District Road" },
                          { value: "kuccha", label: "Kuccha Road" },
                        ],
                      },
                      {
                        label: "Legal Status",
                        value: "",
                        onChange: () => {},
                        options: [
                          { value: "", label: "Any Status" },
                          { value: "immediate", label: "✅ Immediate Registry" },
                          { value: "khatauni", label: "📜 Khatauni Verified" },
                          { value: "single", label: "Single Owner" },
                        ],
                      },
                      {
                        label: "Seller Type",
                        value: "",
                        onChange: () => {},
                        options: [
                          { value: "", label: "All Sellers" },
                          { value: "owner", label: "Direct Owner" },
                          { value: "farmer", label: "Direct Farmer" },
                          { value: "broker", label: "Verified Broker" },
                        ],
                      },
                    ].map(f => (
                      <SelectField key={f.label} label={f.label} value={f.value} onChange={f.onChange} options={f.options} />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            key="sell"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="glass-card rounded-2xl p-6 text-center"
          >
            <p className="text-slate-700 text-base mb-5">
              List your land for <span className="text-agri-green font-bold">free</span> and reach <span className="font-bold text-slate-900">10,000+ buyers</span> across Lakhimpur Kheri.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={onSellClick}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-agri-green to-forest-600 text-white font-bold px-6 py-3.5 rounded-xl hover:shadow-green transition-all hover:scale-[1.02] active:scale-95"
              >
                List My Property Free <ArrowRight className="w-4 h-4" />
              </button>
              <a
                href="tel:+919876543210"
                className="flex items-center justify-center gap-2 bg-white border-2 border-agri-green text-agri-green font-bold px-6 py-3.5 rounded-xl hover:bg-agri-green-50 transition-all"
              >
                Talk to a Local Expert
              </a>
            </div>
            <p className="text-xs text-slate-400 mt-3">Free · No commission · 24-hour response</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
