"use client";

import { cn } from "@/lib/utils/cn";
import type { InputHTMLAttributes, ReactNode } from "react";
import { forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: ReactNode;
  rightElement?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, leftIcon, rightElement, className, id, ...props },
  ref
) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-slate-700">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative flex items-center">
        {leftIcon && (
          <span className="absolute left-3 text-slate-400 pointer-events-none">
            {leftIcon}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "w-full rounded-xl border bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400",
            "transition-colors duration-200",
            "focus:outline-none focus:ring-2 focus:ring-agri-green/30 focus:border-agri-green",
            error
              ? "border-red-400 focus:ring-red-200 focus:border-red-400"
              : "border-slate-200 hover:border-slate-300",
            leftIcon && "pl-10",
            rightElement && "pr-10",
            className
          )}
          {...props}
        />
        {rightElement && (
          <span className="absolute right-3 text-slate-400">{rightElement}</span>
        )}
      </div>
      {error && <p className="text-xs text-red-500 flex items-center gap-1">⚠ {error}</p>}
      {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
});
