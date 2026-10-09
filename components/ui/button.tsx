"use client";

import { cn } from "@/lib/utils/cn";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger" | "gold";
type ButtonSize = "sm" | "md" | "lg" | "xl";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:   "bg-agri-green text-white hover:bg-agri-green-dark shadow-sm hover:shadow-md active:scale-95",
  secondary: "bg-agri-green-100 text-agri-green hover:bg-agri-green-200 active:scale-95",
  outline:   "border-2 border-agri-green text-agri-green hover:bg-agri-green-50 active:scale-95",
  ghost:     "text-slate-600 hover:bg-slate-100 hover:text-slate-900 active:scale-95",
  danger:    "bg-red-600 text-white hover:bg-red-700 shadow-sm active:scale-95",
  gold:      "bg-harvest-gold text-white hover:bg-harvest-gold-dark shadow-sm hover:shadow-md active:scale-95",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm:  "text-xs px-3 py-1.5 rounded-lg gap-1.5",
  md:  "text-sm px-4 py-2 rounded-xl gap-2",
  lg:  "text-base px-6 py-3 rounded-xl gap-2",
  xl:  "text-lg px-8 py-4 rounded-2xl gap-3",
};

export function Button({
  variant = "primary",
  size = "md",
  children,
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || isLoading}
      className={cn(
        "inline-flex items-center justify-center font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-agri-green focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100",
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && "w-full",
        className
      )}
      {...props}
    >
      {isLoading ? (
        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : leftIcon}
      {children}
      {!isLoading && rightIcon}
    </button>
  );
}
