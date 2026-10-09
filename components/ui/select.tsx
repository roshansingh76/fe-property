"use client";

import { cn } from "@/lib/utils/cn";
import type { SelectHTMLAttributes } from "react";
import { forwardRef } from "react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, error, hint, options, placeholder, className, id, ...props },
  ref
) {
  const selectId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={selectId} className="text-sm font-medium text-slate-700">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        ref={ref}
        id={selectId}
        className={cn(
          "w-full rounded-xl border bg-white px-3 py-2.5 text-sm text-slate-900",
          "transition-colors duration-200 appearance-none cursor-pointer",
          "focus:outline-none focus:ring-2 focus:ring-agri-green/30 focus:border-agri-green",
          error
            ? "border-red-400 focus:ring-red-200 focus:border-red-400"
            : "border-slate-200 hover:border-slate-300",
          className
        )}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-500">⚠ {error}</p>}
      {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
});
