"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth";

const links = [
  ["Overview", "/admin"],
  ["Users", "/admin/users"],
  ["Buyers", "/admin/buyers"],
  ["Sellers", "/admin/sellers"],
  ["Brokers", "/admin/brokers"],
  ["Properties", "/admin/properties"],
  ["Property Types", "/admin/property-types"],
  ["Locations", "/admin/locations"],
] as const;

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  return <nav aria-label="Admin navigation" className="mb-8 flex items-center gap-2 overflow-x-auto border-b border-slate-200 pb-3">{links.map(([label, href]) => <Link key={href} href={href} className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-bold ${pathname === href ? "bg-agri-green text-white" : "text-slate-600 hover:bg-slate-100"}`}>{label}</Link>)}<button onClick={() => void logout().then(() => router.push("/login"))} className="ml-auto inline-flex shrink-0 items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-600"><LogOut className="h-4 w-4" /> Logout</button></nav>;
}
