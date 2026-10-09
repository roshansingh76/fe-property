"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertCircle, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type ToastVariant = "success" | "error" | "info";
type Toast = { id: number; message: string; variant: ToastVariant };

const ToastContext = createContext<{
  push: (message: string, variant?: ToastVariant) => void;
} | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((message: string, variant: ToastVariant = "info") => {
    const id = Date.now() + Math.random();
    setToasts(current => [...current.slice(-4), { id, message, variant }]);
    window.setTimeout(() => setToasts(current => current.filter(toast => toast.id !== id)), 4500);
  }, []);

  const value = useMemo(() => ({ push }), [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[80] flex w-[min(100%-2rem,22rem)] flex-col gap-2">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className={cn(
                "pointer-events-auto flex items-start gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold shadow-lg",
                toast.variant === "success" && "border-agri-green-200 bg-white text-agri-green",
                toast.variant === "error" && "border-red-200 bg-white text-red-700",
                toast.variant === "info" && "border-slate-200 bg-white text-slate-700",
              )}
              role="status"
            >
              {toast.variant === "error" ? <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> : <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />}
              <span className="flex-1">{toast.message}</span>
              <button type="button" className="text-slate-400 hover:text-slate-700" onClick={() => setToasts(current => current.filter(item => item.id !== toast.id))} aria-label="Dismiss notification">
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
