"use client";

import { cn } from "@/lib/utils/cn";
import type { ReactNode } from "react";

type BadgeVariant = "verified" | "registry" | "khatauni" | "owner" | "featured" | "new" | "default" | "success" | "warning" | "info";

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
  size?: "sm" | "md";
}

const variantStyles: Record<BadgeVariant, string> = {
  verified: "bg-green-50 text-green-800 border border-green-200 ring-0",
  registry: "bg-blue-50 text-blue-800 border border-blue-200",
  khatauni: "bg-amber-50 text-amber-800 border border-amber-200",
  owner:    "bg-purple-50 text-purple-800 border border-purple-200",
  featured: "bg-harvest-gold-50 text-harvest-gold-dark border border-harvest-gold-100",
  new:      "bg-trust-blue-50 text-trust-blue-dark border border-trust-blue-light/40",
  default:  "bg-slate-100 text-slate-700 border border-slate-200",
  success:  "bg-agri-green-100 text-agri-green border border-agri-green-200",
  warning:  "bg-amber-50 text-amber-700 border border-amber-200",
  info:     "bg-sky-50 text-sky-700 border border-sky-200",
};

const sizeStyles = {
  sm: "text-[10px] px-1.5 py-0.5 gap-0.5",
  md: "text-xs px-2 py-0.5 gap-1",
};

export function Badge({ variant = "default", children, className, size = "md" }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium whitespace-nowrap",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      {children}
    </span>
  );
}
