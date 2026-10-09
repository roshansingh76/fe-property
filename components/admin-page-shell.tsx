"use client";

import type { ReactNode } from "react";
import { ShieldCheck } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { AdminSidebar, AdminMobileBar } from "@/components/admin-sidebar";
import { DashboardSignOutButton } from "@/components/ui/dashboard-ui";
import { useAuth } from "@/lib/auth";

export function AdminPageShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  const { user, loading } = useAuth();

  if (loading) return <div className="min-h-screen bg-slate-bg" />;

  if (!user || !["ADMIN", "SUPER_ADMIN"].includes(user.role)) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-bg px-6 text-center">
        <div>
          <div className="mx-auto w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
            <ShieldCheck className="w-7 h-7 text-red-500" />
          </div>
          <h1 className="text-2xl font-black text-slate-900">Admin access required</h1>
          <p className="mt-2 text-sm text-slate-500">Sign in with an admin account to continue.</p>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-slate-bg">
      <Navbar />
      <div className="flex pt-16">
        {/* Sidebar — desktop */}
        <AdminSidebar />

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Mobile nav bar */}
          <AdminMobileBar />

          <main className="px-5 pb-16 pt-6 md:px-8 md:pt-8">
            <div className="mx-auto max-w-6xl">
              {/* Page header */}
              <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-red-500 mb-1">Admin</p>
                  <h1 className="text-2xl font-black text-slate-950">{title}</h1>
                  {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
                </div>
                <DashboardSignOutButton />
              </div>
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
