"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Users, UserCheck, UserCog, Briefcase,
  Building2, Tag, MapPin, LogOut, ChevronRight,
  Leaf, ShieldAlert,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils/cn";

type NavItem = { label: string; href: string; icon: React.ElementType };

const NAV_GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard",      href: "/admin",                  icon: LayoutDashboard },
    ],
  },
  {
    label: "People",
    items: [
      { label: "All users",      href: "/admin/users",            icon: Users },
      { label: "Buyers",         href: "/admin/buyers",           icon: UserCheck },
      { label: "Sellers",        href: "/admin/sellers",          icon: UserCog },
      { label: "Brokers",        href: "/admin/brokers",          icon: Briefcase },
    ],
  },
  {
    label: "Listings",
    items: [
      { label: "Properties",     href: "/admin/properties",       icon: Building2 },
      { label: "Property types", href: "/admin/property-types",   icon: Tag },
      { label: "Locations",      href: "/admin/locations",        icon: MapPin },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  return (
    <aside className="hidden lg:flex flex-col w-60 shrink-0 min-h-screen bg-white border-r border-slate-100 sticky top-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-100">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-agri-green to-forest-700 flex items-center justify-center shadow-green">
          <Leaf className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-sm font-extrabold text-slate-900 leading-none">Palia Property</p>
          <p className="text-[10px] text-slate-400 mt-0.5 font-medium">Admin Console</p>
        </div>
      </div>

      {/* Nav groups */}
      <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
        {NAV_GROUPS.map(group => (
          <div key={group.label}>
            <p className="px-2 mb-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">{group.label}</p>
            <div className="space-y-0.5">
              {group.items.map(item => {
                const active = pathname === item.href;
                return (
                  <Link key={item.href} href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-150",
                      active
                        ? "bg-agri-green text-white shadow-sm"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    )}>
                    <item.icon className="w-4 h-4 flex-shrink-0" />
                    {item.label}
                    {active && <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-70" />}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User + logout */}
      <div className="px-3 py-4 border-t border-slate-100 space-y-1">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-7 h-7 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
            <ShieldAlert className="w-3.5 h-3.5 text-red-500" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-900 truncate">{user?.name ?? user?.phone}</p>
            <p className="text-[10px] text-slate-400">{user?.role?.replace("_", " ")}</p>
          </div>
        </div>
        <button
          onClick={() => void logout().then(() => router.push("/login"))}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut className="w-4 h-4" /> Sign out
        </button>
      </div>
    </aside>
  );
}

/* Mobile top bar — shown instead of sidebar on small screens */
export function AdminMobileBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  const allItems = NAV_GROUPS.flatMap(g => g.items);

  return (
    <div className="lg:hidden sticky top-16 z-30 bg-white border-b border-slate-100 shadow-sm">
      <div className="flex items-center gap-1 px-4 py-2 overflow-x-auto scrollbar-none">
        {allItems.map(item => {
          const active = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}
              className={cn(
                "flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-bold transition-all shrink-0",
                active ? "bg-agri-green text-white" : "text-slate-600 hover:bg-slate-100"
              )}>
              <item.icon className="w-3.5 h-3.5" />
              {item.label}
            </Link>
          );
        })}
        <button onClick={() => void logout().then(() => router.push("/login"))}
          className="ml-auto shrink-0 flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-red-500 hover:border-red-200">
          <LogOut className="w-3.5 h-3.5" /> Out
        </button>
      </div>
    </div>
  );
}
