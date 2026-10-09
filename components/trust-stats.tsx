"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ListChecks, Users, Store, Star, Shield, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const STATS = [
  { value: 2000, suffix: "+", label: "Active Listings",    sub: "Across 12 villages",       icon: ListChecks, color: "text-forest-700",   bg: "bg-forest-50",  border: "border-forest-100",  glow: "hover:shadow-[0_4px_20px_rgba(15,81,50,0.15)]" },
  { value: 500,  suffix: "+", label: "Verified Farmers",   sub: "KYC completed",             icon: Users,      color: "text-sky-600",      bg: "bg-sky-50",     border: "border-sky-100",    glow: "hover:shadow-[0_4px_20px_rgba(2,132,199,0.15)]" },
  { value: 150,  suffix: "+", label: "Local Dealers",      sub: "Lakhimpur Kheri region",    icon: Store,      color: "text-gold-700",     bg: "bg-gold-50",    border: "border-gold-100",   glow: "hover:shadow-[0_4px_20px_rgba(180,83,9,0.15)]"  },
  { value: 98,   suffix: "%", label: "Satisfaction Rate",  sub: "Buyer feedback",            icon: Star,       color: "text-orange-600",   bg: "bg-orange-50",  border: "border-orange-100", glow: "hover:shadow-[0_4px_20px_rgba(234,88,12,0.15)]"  },
  { value: 100,  suffix: "%", label: "Free Listings",      sub: "Zero commission",           icon: Shield,     color: "text-emerald-700",  bg: "bg-emerald-50", border: "border-emerald-100",glow: "hover:shadow-[0_4px_20px_rgba(4,120,87,0.15)]"   },
  { value: 200,  suffix: "Cr+",label: "Land Transacted",   sub: "Since 2020 (₹ Crore)",     icon: TrendingUp, color: "text-violet-700",   bg: "bg-violet-50",  border: "border-violet-100", glow: "hover:shadow-[0_4px_20px_rgba(109,40,217,0.15)]" },
];

function Counter({ target, suffix, duration = 2000 }: { target: number; suffix: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => { if (entries[0].isIntersecting && !started) setStarted(true); },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    const steps = 50;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current = Math.min(current + increment, target);
      setCount(Math.round(current));
      if (current >= target) clearInterval(timer);
    }, duration / steps);
    return () => clearInterval(timer);
  }, [started, target, duration]);

  return (
    <span ref={ref}>
      {count}{suffix === "Cr+" ? "" : suffix}
      {suffix === "Cr+" && "Cr+"}
    </span>
  );
}

export function TrustStats({ className, variant = "grid" }: { className?: string; variant?: "grid" | "compact" }) {
  if (variant === "compact") {
    return (
      <div className={cn("flex flex-wrap items-center justify-center gap-6 md:gap-10", className)}>
        {STATS.slice(0, 4).map(s => (
          <div key={s.label} className="flex flex-col items-center text-white">
            <span className="text-2xl md:text-3xl font-extrabold leading-none">{s.value}{s.suffix}</span>
            <span className="text-white/60 text-xs mt-1">{s.label}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <section className={cn("w-full", className)}>
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-40px" }}
        variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
      >
        {STATS.map(s => (
          <motion.div
            key={s.label}
            variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } }}
            className={cn(
              "flex flex-col items-center text-center p-5 rounded-2xl border transition-all duration-300 cursor-default",
              s.bg, s.border, s.glow
            )}
          >
            <div className="w-10 h-10 rounded-xl bg-white/70 flex items-center justify-center mb-3 shadow-xs">
              <s.icon className={cn("w-5 h-5", s.color)} />
            </div>
            <div className={cn("text-2xl font-extrabold tabular-nums mb-0.5", s.color)}>
              <Counter target={s.value} suffix={s.suffix} />
            </div>
            <div className="text-xs font-bold text-slate-700">{s.label}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">{s.sub}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* Trust badges */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4, duration: 0.4 }}
        className="flex flex-wrap justify-center gap-2.5 mt-7"
      >
        {[
          { emoji: "🌾", text: "Terai Region Specialist" },
          { emoji: "📜", text: "Khatauni Verification" },
          { emoji: "🤝", text: "Direct Owner Contact" },
          { emoji: "📍", text: "Hyperlocal Coverage" },
          { emoji: "⚡", text: "24h Response Time" },
        ].map(b => (
          <div
            key={b.text}
            className="flex items-center gap-2 bg-white border border-slate-200 rounded-full px-4 py-1.5 shadow-xs hover:border-agri-green-200 hover:shadow-sm transition-all duration-200"
          >
            <span className="text-sm">{b.emoji}</span>
            <span className="text-xs font-semibold text-slate-700">{b.text}</span>
          </div>
        ))}
      </motion.div>
    </section>
  );
}
