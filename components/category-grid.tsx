"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { PROPERTY_CATEGORIES } from "@/lib/data/properties";
import type { PropertyCategory } from "@/lib/data/properties";

const CATS: {
  key: PropertyCategory; count: number; hot?: boolean;
  from: string; to: string; iconBg: string; glow: string;
}[] = [
  { key: "sugarcane_farm",    count: 48, hot: true,  from: "#0f5132", to: "#16a34a", iconBg: "from-forest-800 to-forest-600", glow: "group-hover:shadow-[0_8px_32px_rgba(15,81,50,0.3)]" },
  { key: "paddy_wheat",       count: 32,             from: "#b45309", to: "#f59e0b", iconBg: "from-gold-700 to-gold-400",    glow: "group-hover:shadow-[0_8px_32px_rgba(217,119,6,0.3)]" },
  { key: "mango_orchard",     count: 24,             from: "#c2410c", to: "#fb923c", iconBg: "from-orange-700 to-orange-400",glow: "group-hover:shadow-[0_8px_32px_rgba(194,65,12,0.25)]" },
  { key: "farmhouse_resort",  count: 18, hot: true,  from: "#0d9488", to: "#2dd4bf", iconBg: "from-teal-700 to-teal-400",   glow: "group-hover:shadow-[0_8px_32px_rgba(13,148,136,0.28)]" },
  { key: "dairy_poultry",     count: 15,             from: "#0369a1", to: "#38bdf8", iconBg: "from-sky-700 to-sky-400",     glow: "group-hover:shadow-[0_8px_32px_rgba(3,105,161,0.25)]" },
  { key: "highway_investment",count: 27, hot: true,  from: "#334155", to: "#64748b", iconBg: "from-slate-700 to-slate-500", glow: "group-hover:shadow-[0_8px_32px_rgba(51,65,85,0.25)]" },
  { key: "residential_plot",  count: 63,             from: "#6d28d9", to: "#a78bfa", iconBg: "from-violet-700 to-violet-400",glow: "group-hover:shadow-[0_8px_32px_rgba(109,40,217,0.25)]" },
  { key: "commercial_land",   count: 21,             from: "#be123c", to: "#fb7185", iconBg: "from-rose-700 to-rose-400",   glow: "group-hover:shadow-[0_8px_32px_rgba(190,18,60,0.25)]" },
  { key: "poplar_plantation", count: 14,             from: "#3d7a0f", to: "#86efac", iconBg: "from-lime-700 to-lime-500",   glow: "group-hover:shadow-[0_8px_32px_rgba(61,122,15,0.25)]" },
  { key: "fish_farm",         count: 9,              from: "#0e7490", to: "#67e8f9", iconBg: "from-cyan-700 to-cyan-400",   glow: "group-hover:shadow-[0_8px_32px_rgba(14,116,144,0.25)]" },
];

export function CategoryGrid({ className }: { className?: string }) {
  return (
    <section className={cn("w-full", className)}>
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
        variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4"
      >
        {CATS.map(cat => {
          const data = PROPERTY_CATEGORIES[cat.key];
          return (
            <motion.a
              key={cat.key}
              href={`/listings?category=${cat.key}`}
              variants={{
                hidden: { opacity: 0, y: 20, scale: 0.95 },
                visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4 } },
              }}
              whileHover={{ y: -5, scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className={cn(
                "group relative flex flex-col items-center text-center p-4 md:p-5 rounded-2xl",
                "bg-white border border-slate-100 hover:border-transparent",
                "transition-all duration-300 cursor-pointer overflow-hidden",
                cat.glow
              )}
            >
              {/* Gradient fill on hover */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-2xl"
                style={{ background: `linear-gradient(135deg, ${cat.from}, ${cat.to})` }}
              />

              {/* Hot badge */}
              {cat.hot && (
                <span className="absolute top-2.5 right-2.5 text-[9px] font-extrabold uppercase tracking-wider bg-gradient-to-r from-harvest-gold to-gold-400 text-white px-1.5 py-0.5 rounded-full">
                  Hot
                </span>
              )}

              {/* Icon circle */}
              <div
                className={cn(
                  "w-12 h-12 rounded-xl mb-3 flex items-center justify-center text-xl shadow-sm",
                  "bg-gradient-to-br transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3",
                  cat.iconBg
                )}
              >
                {data.icon}
              </div>

              {/* Label */}
              <h3 className="text-[13px] font-bold text-slate-800 leading-tight mb-1 group-hover:text-agri-green transition-colors">
                {data.label}
              </h3>

              {/* Description (desktop) */}
              <p className="hidden md:block text-[10px] text-slate-400 leading-snug mb-2.5">{data.description}</p>

              {/* Count */}
              <div className="flex items-center gap-1 mt-auto">
                <span className="text-[11px] font-semibold text-slate-400">{cat.count} listings</span>
                <ArrowUpRight className="w-3 h-3 text-slate-300 opacity-0 group-hover:opacity-100 group-hover:text-agri-green transition-all duration-200" />
              </div>
            </motion.a>
          );
        })}
      </motion.div>
    </section>
  );
}
