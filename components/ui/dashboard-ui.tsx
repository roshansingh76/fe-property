"use client";

/**
 * Shared UI primitives used across all role dashboards and admin pages.
 */

import { type ReactNode } from "react";
import { AlertTriangle, Loader2, LogOut, type LucideIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { useAuth } from "@/lib/auth";

export function DashboardSignOutButton() {
  const router = useRouter();
  const { logout } = useAuth();

  const signOut = async () => {
    await logout();
    router.replace("/login");
  };

  return (
    <button
      type="button"
      onClick={() => void signOut()}
      className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-bold text-red-700 transition-colors hover:bg-red-50"
    >
      <LogOut className="h-4 w-4" />
      Sign out
    </button>
  );
}

// ── StatCard ─────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: number | string;
  Icon: LucideIcon;
  accent?: "green" | "gold" | "blue" | "red" | "slate";
  sub?: string;
}

const ACCENT = {
  green: { icon: "bg-agri-green-100 text-agri-green", border: "border-agri-green/10" },
  gold:  { icon: "bg-harvest-gold-100 text-harvest-gold-dark", border: "border-harvest-gold/10" },
  blue:  { icon: "bg-trust-blue-50 text-trust-blue", border: "border-trust-blue/10" },
  red:   { icon: "bg-red-50 text-red-500", border: "border-red-100" },
  slate: { icon: "bg-slate-100 text-slate-500", border: "border-slate-200" },
} as const;

export function StatCard({ label, value, Icon, accent = "green", sub }: StatCardProps) {
  const a = ACCENT[accent];
  return (
    <div className={cn("rounded-2xl border bg-white p-5 flex items-start gap-4", a.border)}>
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", a.icon)}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</p>
        <p className="mt-0.5 text-2xl font-black text-slate-900 tabular-nums">{value}</p>
        {sub && <p className="mt-0.5 text-xs text-slate-400">{sub}</p>}
      </div>
    </div>
  );
}

// ── StatusBadge ──────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, string> = {
  ACTIVE:   "bg-agri-green-50 text-agri-green border-agri-green/20",
  PENDING:  "bg-amber-50 text-amber-700 border-amber-200",
  REJECTED: "bg-red-50 text-red-600 border-red-200",
  SOLD:     "bg-trust-blue-50 text-trust-blue border-trust-blue/20",
  ARCHIVED: "bg-slate-100 text-slate-500 border-slate-200",
  DRAFT:    "bg-slate-100 text-slate-500 border-slate-200",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border", STATUS_STYLES[status] ?? "bg-slate-100 text-slate-500 border-slate-200")}>
      {status}
    </span>
  );
}

// ── LeadStatusBadge ───────────────────────────────────────────────────────────

const LEAD_STYLES: Record<string, string> = {
  NEW:        "bg-sky-50 text-sky-700 border-sky-200",
  CONTACTED:  "bg-violet-50 text-violet-700 border-violet-200",
  QUALIFIED:  "bg-amber-50 text-amber-700 border-amber-200",
  SITE_VISIT: "bg-agri-green-50 text-agri-green border-agri-green/20",
  OFFER_MADE: "bg-harvest-gold-100 text-harvest-gold-dark border-harvest-gold/20",
  CLOSED:     "bg-slate-100 text-slate-500 border-slate-200",
};

export function LeadStatusBadge({ status }: { status: string }) {
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border", LEAD_STYLES[status] ?? "bg-slate-100 text-slate-500 border-slate-200")}>
      {status.replace("_", " ")}
    </span>
  );
}

// ── RoleBadge ────────────────────────────────────────────────────────────────

const ROLE_STYLES: Record<string, string> = {
  BUYER:       "bg-sky-50 text-sky-700 border-sky-200",
  SELLER:      "bg-agri-green-50 text-agri-green border-agri-green/20",
  BROKER:      "bg-violet-50 text-violet-700 border-violet-200",
  AGENT:       "bg-amber-50 text-amber-700 border-amber-200",
  ADMIN:       "bg-red-50 text-red-600 border-red-200",
  SUPER_ADMIN: "bg-red-100 text-red-700 border-red-300",
};

export function RoleBadge({ role }: { role: string }) {
  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border", ROLE_STYLES[role] ?? "bg-slate-100 text-slate-500 border-slate-200")}>
      {role.replace("_", " ")}
    </span>
  );
}

// ── ConfirmDialog ────────────────────────────────────────────────────────────

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ open, title, message, confirmLabel = "Confirm", danger = false, onConfirm, onCancel }: ConfirmDialogProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-modal w-full max-w-sm p-6 z-10">
        <div className="flex items-start gap-3 mb-3">
          <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0", danger ? "bg-red-50" : "bg-amber-50")}>
            <AlertTriangle className={cn("w-5 h-5", danger ? "text-red-500" : "text-amber-500")} />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900">{title}</h3>
            <p className="mt-1 text-sm text-slate-500">{message}</p>
          </div>
        </div>
        <div className="flex gap-2 justify-end mt-5">
          <button onClick={onCancel} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50">Cancel</button>
          <button onClick={onConfirm} className={cn("rounded-xl px-4 py-2 text-sm font-bold text-white", danger ? "bg-red-500 hover:bg-red-600" : "bg-agri-green hover:bg-forest-700")}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── EmptyState ───────────────────────────────────────────────────────────────

export function EmptyState({ icon, title, description, action }: { icon: string; title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="font-extrabold text-slate-900 text-lg">{title}</h3>
      {description && <p className="mt-1 text-sm text-slate-500 max-w-xs">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

// ── PageSpinner ───────────────────────────────────────────────────────────────

export function PageSpinner() {
  return (
    <div className="min-h-screen bg-slate-bg flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-agri-green animate-spin" />
    </div>
  );
}

// ── SectionCard ───────────────────────────────────────────────────────────────

export function SectionCard({ title, description, action, children, className }: {
  title: string; description?: string; action?: ReactNode; children: ReactNode; className?: string;
}) {
  return (
    <div className={cn("rounded-2xl border border-slate-200 bg-white overflow-hidden", className)}>
      <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-slate-100">
        <div>
          <h2 className="font-extrabold text-slate-900">{title}</h2>
          {description && <p className="mt-0.5 text-xs text-slate-500">{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

// ── input helper ─────────────────────────────────────────────────────────────

export function inputCls(err?: boolean) {
  return cn(
    "w-full rounded-xl border px-3 py-2.5 text-sm bg-slate-50 outline-none transition-all",
    err
      ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100"
      : "border-slate-200 focus:border-agri-green focus:ring-2 focus:ring-agri-green/10 focus:bg-white",
  );
}

// ── ErrorBanner ───────────────────────────────────────────────────────────────

export function ErrorBanner({ message, onDismiss }: { message: string; onDismiss?: () => void }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      <span>{message}</span>
      {onDismiss && (
        <button onClick={onDismiss} className="ml-3 text-red-400 hover:text-red-600 font-bold text-lg leading-none">&times;</button>
      )}
    </div>
  );
}

// ── Spinner ───────────────────────────────────────────────────────────────────

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn("animate-spin", className ?? "w-4 h-4")} />;
}
