"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Phone, ChevronDown, Leaf, Sparkles, MessageCircle, LogIn, LogOut, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { fetchLocations } from "@/lib/api/client";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";

interface NavbarProps {
  onSellClick?: () => void;
}

const NAV_ITEMS = [
  {
    label: "Properties",
    dropdown: [
      { label: "🌾  Agriculture Land", href: "/listings?tab=buy_agri", desc: "Sugarcane, paddy & orchards" },
      { label: "🏘️  Residential Plots", href: "/listings?category=residential_plot", desc: "Urban & semi-urban plots" },
      { label: "🏡  Farmhouses & Resort", href: "/listings?category=farmhouse_resort", desc: "Near Dudhwa National Park" },
      { label: "🏢  Commercial Land", href: "/listings?category=commercial_land", desc: "Highway & industrial plots" },
    ],
  },
  {
    label: "Locations",
    dropdown: [
      { label: "📍  Palia Kalan", href: "/listings?village=Palia+Kalan", desc: "Town center & outskirts" },
      { label: "📍  Sampurna Nagar", href: "/listings?village=Sampurna+Nagar", desc: "4km from Palia" },
      { label: "📍  Mailani", href: "/listings?village=Mailani", desc: "Sarda River corridor" },
      { label: "📍  Tikunia", href: "/listings?village=Tikunia", desc: "Dudhwa buffer zone" },
      { label: "📍  Bankey Ganj", href: "/listings?village=Bankey+Ganj", desc: "Highway touch land" },
      { label: "📍  Bela Kalan", href: "/listings?village=Bela+Kalan", desc: "Orchard belt" },
    ],
  },
  { label: "Map View", href: "/#map-section" },
];

export function Navbar({ onSellClick }: NavbarProps) {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [locationLinks, setLocationLinks] = useState<{ label: string; href: string; desc: string }[]>([]);

  useEffect(() => {
    void fetchLocations()
      .then(items => setLocationLinks(items.filter(item => ["CITY", "VILLAGE"].includes(item.type)).map(item => ({ label: `📍  ${item.name}`, href: `/listings?village=${encodeURIComponent(item.name)}`, desc: item.district }))))
      .catch(() => setLocationLinks([]));
  }, []);

  const navigationItems = NAV_ITEMS.map(item => item.label === "Locations" ? { ...item, dropdown: locationLinks } : item);
  const dashboardHref = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN"
    ? "/admin"
    : user?.role === "BROKER"
      ? "/broker"
      : user?.role === "SELLER" || user?.role === "AGENT"
        ? "/seller"
        : "/buyer";

  const handleLogout = async () => {
    await logout();
    setMobileOpen(false);
    router.replace("/login");
  };

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Close mobile on resize
  useEffect(() => {
    const handler = () => { if (window.innerWidth >= 768) setMobileOpen(false); };
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-300",
        scrolled
          ? "glass border-b border-white/40 shadow-sm"
          : "bg-transparent"
      )}
      role="banner"
    >
      {/* Top announcement bar */}
      <div className={cn(
        "overflow-hidden transition-all duration-500",
        scrolled ? "max-h-0 opacity-0" : "max-h-10 opacity-100"
      )}>
        <div className="bg-gradient-to-r from-agri-green to-forest-700 text-white/90 text-[11px] font-medium text-center py-1.5 px-4">
          <span className="inline-flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-gold-300" />
            Free property listing for farmers &amp; landowners — No commission charged
            <Sparkles className="w-3 h-3 text-gold-300" />
          </span>
        </div>
      </div>

      <nav
        className="max-w-7xl mx-auto flex items-center justify-between px-4 md:px-6 h-16"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 flex-shrink-0 group"
          aria-label="Palia Property Hub — Home"
        >
          <div className={cn(
            "w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300",
            "bg-gradient-to-br from-agri-green to-forest-700 shadow-sm group-hover:shadow-green group-hover:scale-105"
          )}>
            <Leaf className="w-4.5 h-4.5 text-white" />
          </div>
          <div className="flex flex-col leading-none">
            <span className={cn(
              "font-extrabold text-[15px] tracking-tight transition-colors duration-300",
              scrolled ? "text-agri-green" : "text-white"
            )}>
              Palia Property
            </span>
            <span className={cn(
              "font-bold text-[9px] tracking-[0.15em] uppercase transition-colors duration-300",
              scrolled ? "text-harvest-gold" : "text-gold-300"
            )}>
              Hub
            </span>
          </div>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-0.5">
          {navigationItems.map((item) =>
            item.dropdown ? (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => setActiveDropdown(item.label)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <button className={cn(
                  "flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                  scrolled
                    ? "text-slate-700 hover:text-agri-green hover:bg-agri-green-50"
                    : "text-white/85 hover:text-white hover:bg-white/10"
                )}>
                  {item.label}
                  <ChevronDown className={cn(
                    "w-3.5 h-3.5 transition-transform duration-200",
                    activeDropdown === item.label && "rotate-180"
                  )} />
                </button>

                <AnimatePresence>
                  {activeDropdown === item.label && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.98 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="absolute top-full left-0 mt-2 w-64 glass-card rounded-2xl overflow-hidden z-50"
                    >
                      <div className="p-2">
                        {item.dropdown.map((sub) => (
                          <Link
                            key={sub.href}
                            href={sub.href}
                            className="flex flex-col px-3 py-2.5 rounded-xl hover:bg-agri-green-50 transition-colors duration-150 group"
                          >
                            <span className="text-sm font-semibold text-slate-800 group-hover:text-agri-green">{sub.label}</span>
                            <span className="text-[11px] text-slate-400 mt-0.5">{sub.desc}</span>
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                key={item.label}
                href={item.href ?? "#"}
                className={cn(
                  "px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                  scrolled
                    ? "text-slate-700 hover:text-agri-green hover:bg-agri-green-50"
                    : "text-white/85 hover:text-white hover:bg-white/10"
                )}
              >
                {item.label}
              </Link>
            )
          )}
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-2">
          <a
            href="https://wa.me/919876543210"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-xl transition-all duration-200",
              scrolled
                ? "text-slate-600 hover:text-[#25D366] hover:bg-green-50"
                : "text-white/80 hover:text-white hover:bg-white/10"
            )}
          >
            <MessageCircle className="w-4 h-4" />
            <span className="hidden lg:inline">WhatsApp</span>
          </a>
          <a
            href="tel:+919876543210"
            className={cn(
              "flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-xl transition-all duration-200",
              scrolled
                ? "text-slate-600 hover:text-agri-green hover:bg-agri-green-50"
                : "text-white/80 hover:text-white hover:bg-white/10"
            )}
          >
            <Phone className="w-4 h-4" />
            <span className="hidden lg:inline">Call Us</span>
          </a>
          {authLoading ? (
            <span aria-hidden="true" className="min-w-24" />
          ) : user ? (
            <>
              <Link href={dashboardHref} className={cn(
                "flex items-center gap-1.5 text-sm font-semibold px-3 py-2 rounded-xl transition-all duration-200",
                scrolled ? "text-slate-700 hover:text-agri-green hover:bg-agri-green-50" : "text-white/85 hover:text-white hover:bg-white/10"
              )}>
                <LayoutDashboard className="w-4 h-4" /> Dashboard
              </Link>
              <button onClick={() => void handleLogout()} className={cn(
                "flex items-center gap-1.5 text-sm font-semibold px-3 py-2 rounded-xl transition-all duration-200",
                scrolled ? "text-slate-600 hover:text-red-600 hover:bg-red-50" : "text-white/80 hover:text-white hover:bg-white/10"
              )}>
                <LogOut className="w-4 h-4" /> Sign out
              </button>
            </>
          ) : (
            <Link href="/login" className={cn(
              "flex items-center gap-1.5 text-sm font-semibold px-3 py-2 rounded-xl transition-all duration-200",
              scrolled ? "text-slate-700 hover:text-agri-green hover:bg-agri-green-50" : "text-white/85 hover:text-white hover:bg-white/10"
            )}>
              <LogIn className="w-4 h-4" /> Log in
            </Link>
          )}
          <button
            onClick={() => onSellClick ? onSellClick() : router.push("/login")}
            className="flex items-center gap-1.5 bg-gradient-to-r from-harvest-gold to-gold-400 hover:from-harvest-gold-dark hover:to-harvest-gold text-white text-sm font-bold px-4 py-2 rounded-xl shadow-sm hover:shadow-gold transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <span>+ List Free</span>
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className={cn(
            "md:hidden p-2 rounded-xl transition-all duration-200",
            scrolled
              ? "text-slate-700 hover:bg-slate-100"
              : "text-white hover:bg-white/15"
          )}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
        >
          <AnimatePresence mode="wait" initial={false}>
            {mobileOpen ? (
              <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
                <X className="w-5 h-5" />
              </motion.div>
            ) : (
              <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
                <Menu className="w-5 h-5" />
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden md:hidden glass border-t border-white/20"
          >
            <div className="px-4 py-4 space-y-1">
              {[
                { label: "🌾  Browse Agriculture Land", href: "/listings?tab=buy_agri" },
                { label: "🏘️  Residential & Commercial", href: "/listings?tab=buy_residential" },
                { label: "🏡  Farmhouses & Resort Land", href: "/listings?category=farmhouse_resort" },
                { label: "🗺️  Map View", href: "/#map-section" },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block py-2.5 px-4 rounded-xl text-sm font-medium text-slate-700 hover:bg-agri-green-50 hover:text-agri-green transition-colors"
                >
                  {link.label}
                </Link>
              ))}

              {!authLoading && (
                <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
                  {user ? (
                    <>
                      <Link href={dashboardHref} onClick={() => setMobileOpen(false)} className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700">
                        <LayoutDashboard className="w-4 h-4" /> Dashboard
                      </Link>
                      <button onClick={() => void handleLogout()} className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-red-200 text-sm font-semibold text-red-600">
                        <LogOut className="w-4 h-4" /> Sign out
                      </button>
                    </>
                  ) : (
                    <Link href="/login" onClick={() => setMobileOpen(false)} className="col-span-2 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-agri-green/30 bg-agri-green-50 text-sm font-bold text-agri-green">
                      <LogIn className="w-4 h-4" /> Log in / Register
                    </Link>
                  )}
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
                <a
                  href="tel:+919876543210"
                  className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-slate-700 border border-slate-200 hover:border-agri-green hover:text-agri-green transition-all"
                >
                  <Phone className="w-4 h-4" /> Call Us
                </a>
                <a
                  href="https://wa.me/919876543210"
                  className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#25D366] hover:bg-[#1ebe5a] transition-all"
                >
                  <MessageCircle className="w-4 h-4" /> WhatsApp
                </a>
              </div>
              <button
                onClick={() => { setMobileOpen(false); if (onSellClick) onSellClick(); else router.push("/login"); }}
                className="w-full py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-harvest-gold to-gold-400 hover:from-harvest-gold-dark hover:to-harvest-gold shadow-sm transition-all"
              >
                + List My Property Free
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
