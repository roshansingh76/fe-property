"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, SlidersHorizontal, RotateCcw, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { LandUnit } from "@/lib/data/properties";
import { useFilterData } from "@/lib/hooks/useFilterData";

// ── types ─────────────────────────────────────────────────────────────────────

export interface FilterState {
  category: string;          // PropertyType.key  e.g. "sugarcane_farm" or "" for all
  village: string;
  areaUnit: LandUnit;
  minArea: number | "";
  maxArea: number | "";
  minBudget: number | "";
  maxBudget: number | "";
  irrigationTypes: string[];
  highwayTouch: boolean;
  canalTouch: boolean;
  dedicatedTubewell: boolean;
  solarPump: boolean;
  immediateRegistry: boolean;
  singleOwner: boolean;
  sellerType: string;
}

export const DEFAULT_FILTERS: FilterState = {
  category: "",
  village: "",
  areaUnit: "bigha",
  minArea: "",
  maxArea: "",
  minBudget: "",
  maxBudget: "",
  irrigationTypes: [],
  highwayTouch: false,
  canalTouch: false,
  dedicatedTubewell: false,
  solarPump: false,
  immediateRegistry: false,
  singleOwner: false,
  sellerType: "",
};

// ── sub-components ────────────────────────────────────────────────────────────

function Section({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-slate-100 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-3 text-xs font-bold text-slate-700 uppercase tracking-wider hover:text-agri-green transition-colors"
      >
        {title}
        <ChevronDown
          className={cn(
            "w-4 h-4 text-slate-400 transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            <div className="pb-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PillToggle({
  label,
  checked,
  onChange,
  emoji,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  emoji?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={cn(
        "flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all duration-200",
        checked
          ? "bg-agri-green text-white border-agri-green shadow-sm"
          : "bg-white text-slate-600 border-slate-200 hover:border-agri-green hover:text-agri-green",
      )}
    >
      {emoji && <span>{emoji}</span>}
      {label}
    </button>
  );
}

function NumInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: number | "";
  onChange: (v: number | "") => void;
  placeholder: string;
}) {
  return (
    <div>
      <label className="text-[10px] text-slate-400 font-semibold mb-1 block uppercase">
        {label}
      </label>
      <input
        type="number"
        min={0}
        placeholder={placeholder}
        value={value}
        onChange={e =>
          onChange(e.target.value === "" ? "" : Number(e.target.value))
        }
        className="input-modern"
      />
    </div>
  );
}

// ── main component ────────────────────────────────────────────────────────────

interface FilterSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  onFiltersChange?: (f: FilterState) => void;
  mode?: "sidebar" | "drawer";
}

export function FilterSidebar({
  isOpen = true,
  onClose,
  onFiltersChange,
  mode = "sidebar",
}: FilterSidebarProps) {
  const [f, setF] = useState<FilterState>(DEFAULT_FILTERS);
  const { types, locations } = useFilterData();

  const update = useCallback(
    <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
      // Compute next state without using the functional updater so we can
      // call onFiltersChange in the same event handler, outside of any
      // setState call — this avoids the "update a component while rendering
      // a different component" React warning.
      setF(prev => {
        const next = { ...prev, [key]: value };
        return next;
      });
      onFiltersChange?.({ ...f, [key]: value });
    },
    [onFiltersChange, f],
  );

  const toggleArr = useCallback(
    (key: "irrigationTypes", value: string) => {
      const arr = f[key];
      const next = arr.includes(value)
        ? arr.filter(v => v !== value)
        : [...arr, value];
      const updated = { ...f, [key]: next };
      setF(updated);
      onFiltersChange?.(updated);
    },
    [onFiltersChange, f],
  );

  const reset = () => {
    setF(DEFAULT_FILTERS);
    onFiltersChange?.(DEFAULT_FILTERS);
  };

  const activeCount = [
    f.category !== "",
    f.village !== "",
    f.minArea !== "",
    f.maxArea !== "",
    f.minBudget !== "",
    f.maxBudget !== "",
    f.irrigationTypes.length > 0,
    f.highwayTouch,
    f.canalTouch,
    f.dedicatedTubewell,
    f.solarPump,
    f.immediateRegistry,
    f.singleOwner,
    f.sellerType !== "",
  ].filter(Boolean).length;

  const BUDGET_PRESETS = [
    { label: "< ₹5L",  max: 500_000 },
    { label: "< ₹25L", max: 2_500_000 },
    { label: "< ₹50L", max: 5_000_000 },
    { label: "< ₹1Cr", max: 10_000_000 },
  ];

  const panelContent = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-agri-green" />
          <span className="font-bold text-slate-900 text-sm">Filters</span>
          {activeCount > 0 && (
            <span className="bg-agri-green text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {activeCount > 0 && (
            <button
              onClick={reset}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-red-500 transition-colors font-medium"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          )}
          {mode === "drawer" && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4 text-slate-500" />
            </button>
          )}
        </div>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-4 py-1">

        {/* ── Category (dynamic) ── */}
        <Section title="Property type" defaultOpen>
          {types.length === 0 ? (
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-7 w-24 rounded-full skeleton" />
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => update("category", "")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all duration-200",
                  f.category === ""
                    ? "bg-agri-green text-white border-agri-green shadow-sm"
                    : "bg-white text-slate-600 border-slate-200 hover:border-agri-green hover:text-agri-green",
                )}
              >
                All types
              </button>
              {types.map(t => (
                <button
                  key={t.key}
                  onClick={() => update("category", t.key)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all duration-200",
                    f.category === t.key
                      ? "bg-agri-green text-white border-agri-green shadow-sm"
                      : "bg-white text-slate-600 border-slate-200 hover:border-agri-green hover:text-agri-green",
                  )}
                >
                  {t.icon && <span>{t.icon}</span>}
                  {t.label}
                </button>
              ))}
            </div>
          )}
        </Section>

        {/* ── Location (dynamic) ── */}
        <Section title="Location" defaultOpen>
          {locations.length === 0 ? (
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-7 w-20 rounded-full skeleton" />
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              <PillToggle
                label="All locations"
                checked={f.village === ""}
                onChange={() => update("village", "")}
              />
              {locations.map(loc => (
                <PillToggle
                  key={loc.id}
                  label={loc.name}
                  checked={f.village === loc.name}
                  onChange={() => update("village", loc.name)}
                />
              ))}
            </div>
          )}
        </Section>

        {/* ── Land area ── */}
        <Section title="Land area" defaultOpen>
          <div className="flex gap-1 mb-3">
            {(["bigha", "acre", "hectare", "sqft"] as LandUnit[]).map(u => (
              <button
                key={u}
                onClick={() => update("areaUnit", u)}
                className={cn(
                  "flex-1 text-[10px] font-bold py-1.5 rounded-xl border transition-all",
                  f.areaUnit === u
                    ? "bg-agri-green text-white border-agri-green shadow-sm"
                    : "bg-white text-slate-500 border-slate-200 hover:border-agri-green hover:text-agri-green",
                )}
              >
                {u === "sqft" ? "Sq.Ft" : u.charAt(0).toUpperCase() + u.slice(1)}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <NumInput
              label="Min"
              value={f.minArea}
              onChange={v => update("minArea", v)}
              placeholder="0"
            />
            <NumInput
              label="Max"
              value={f.maxArea}
              onChange={v => update("maxArea", v)}
              placeholder="Any"
            />
          </div>
        </Section>

        {/* ── Budget ── */}
        <Section title="Budget (₹)" defaultOpen>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <NumInput
              label="Min ₹"
              value={f.minBudget}
              onChange={v => update("minBudget", v)}
              placeholder="0"
            />
            <NumInput
              label="Max ₹"
              value={f.maxBudget}
              onChange={v => update("maxBudget", v)}
              placeholder="Any"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {BUDGET_PRESETS.map(b => (
              <button
                key={b.max}
                onClick={() =>
                  update("maxBudget", f.maxBudget === b.max ? "" : b.max)
                }
                className={cn(
                  "text-[11px] px-2.5 py-1 rounded-full border font-semibold transition-all",
                  f.maxBudget === b.max
                    ? "bg-agri-green text-white border-agri-green"
                    : "bg-white text-slate-500 border-slate-200 hover:border-agri-green hover:text-agri-green",
                )}
              >
                {b.label}
              </button>
            ))}
          </div>
        </Section>

        {/* ── Infrastructure ── */}
        <Section title="Infrastructure">
          <div className="flex flex-wrap gap-2">
            <PillToggle label="Highway" checked={f.highwayTouch} onChange={v => update("highwayTouch", v)} emoji="🛣️" />
            <PillToggle label="Canal touch" checked={f.canalTouch} onChange={v => update("canalTouch", v)} emoji="🌊" />
            <PillToggle label="Tube well" checked={f.dedicatedTubewell} onChange={v => update("dedicatedTubewell", v)} emoji="💧" />
            <PillToggle label="Solar pump" checked={f.solarPump} onChange={v => update("solarPump", v)} emoji="☀️" />
          </div>
        </Section>

        {/* ── Irrigation ── */}
        <Section title="Irrigation source">
          <div className="flex flex-wrap gap-2">
            {[
              { v: "tubewell",   l: "Tube well",   e: "💧" },
              { v: "canal",      l: "Sarda canal",  e: "🌊" },
              { v: "drip",       l: "Drip system",  e: "💦" },
              { v: "solar_pump", l: "Solar pump",   e: "☀️" },
              { v: "rainfed",    l: "Rain fed",     e: "🌧️" },
            ].map(item => (
              <PillToggle
                key={item.v}
                label={item.l}
                emoji={item.e}
                checked={f.irrigationTypes.includes(item.v)}
                onChange={() => toggleArr("irrigationTypes", item.v)}
              />
            ))}
          </div>
        </Section>

        {/* ── Legal ── */}
        <Section title="Legal status">
          <div className="flex flex-wrap gap-2">
            <PillToggle label="Immediate registry" checked={f.immediateRegistry} onChange={v => update("immediateRegistry", v)} emoji="✅" />
            <PillToggle label="Single owner" checked={f.singleOwner} onChange={v => update("singleOwner", v)} emoji="👤" />
          </div>
        </Section>

        {/* ── Seller type ── */}
        <Section title="Seller type">
          <div className="flex flex-wrap gap-2">
            {[
              { v: "",                l: "All" },
              { v: "owner",           l: "Direct owner" },
              { v: "direct_farmer",   l: "Farmer" },
              { v: "verified_broker", l: "Broker" },
            ].map(s => (
              <button
                key={s.v}
                onClick={() => update("sellerType", s.v)}
                className={cn(
                  "px-3 py-1.5 rounded-full border text-xs font-semibold transition-all duration-200",
                  f.sellerType === s.v
                    ? "bg-agri-green text-white border-agri-green shadow-sm"
                    : "bg-white text-slate-600 border-slate-200 hover:border-agri-green hover:text-agri-green",
                )}
              >
                {s.l}
              </button>
            ))}
          </div>
        </Section>
      </div>

      {/* Drawer apply button */}
      {mode === "drawer" && (
        <div className="px-4 py-3.5 border-t border-slate-100">
          <button
            onClick={onClose}
            className="w-full py-3 bg-gradient-to-r from-agri-green to-forest-600 text-white font-bold rounded-xl hover:shadow-green transition-all"
          >
            Apply filters{activeCount > 0 && ` (${activeCount})`}
          </button>
        </div>
      )}
    </div>
  );

  if (mode === "drawer") {
    return (
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              key="bd"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            />
            <motion.aside
              key="dr"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 left-0 h-full w-80 bg-white shadow-2xl z-50 flex flex-col"
            >
              {panelContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    );
  }

  return (
    <aside className="w-full bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
      {panelContent}
    </aside>
  );
}
