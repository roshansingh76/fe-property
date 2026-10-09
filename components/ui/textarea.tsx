"use client";

import { cn } from "@/lib/utils/cn";
import type { TextareaHTMLAttributes } from "react";
import { forwardRef } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, error, hint, className, id, ...props },
  ref
) {
  const textareaId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={textareaId} className="text-sm font-medium text-slate-700">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        ref={ref}
        id={textareaId}
        rows={4}
        className={cn(
          "w-full rounded-xl border bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 resize-none",
          "transition-colors duration-200",
          "focus:outline-none focus:ring-2 focus:ring-agri-green/30 focus:border-agri-green",
          error
            ? "border-red-400 focus:ring-red-200 focus:border-red-400"
            : "border-slate-200 hover:border-slate-300",
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-500">⚠ {error}</p>}
      {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
});
