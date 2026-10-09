"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { CheckCircle2, MessageCircle, Send, Target } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { buyerRequirementSchema, type BuyerRequirementFormData } from "@/lib/schemas/forms";
import { fetchLocations, createBuyerInquiry } from "@/lib/api/client";

const PURPOSES = [
  { v: "farming",              l: "Active Farming",       e: "🌾", desc: "Sugarcane, Paddy, Wheat" },
  { v: "resort_farmhouse",     l: "Resort / Farmhouse",   e: "🏡", desc: "Near Dudhwa, Sarda" },
  { v: "commercial_warehouse", l: "Commercial",           e: "🏢", desc: "Highway plots & godowns" },
  { v: "investment",           l: "Investment",           e: "📈", desc: "Land banking & appreciation" },
  { v: "residential",          l: "Residential Plot",     e: "🏘️", desc: "House construction" },
];

const inputCls = "w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-agri-green focus:ring-2 focus:ring-agri-green/10 focus:bg-white transition-all duration-200";

function buildWhatsAppUrl(data: BuyerRequirementFormData) {
  const purpose = PURPOSES.find(item => item.v === data.purpose)?.l ?? data.purpose;
  const formatBudget = (value: number) => `₹${new Intl.NumberFormat("en-IN").format(value)}`;
  const budget = data.minBudget !== undefined || data.maxBudget !== undefined
    ? `Budget: ${data.minBudget !== undefined ? formatBudget(data.minBudget) : "No minimum"} – ${data.maxBudget !== undefined ? formatBudget(data.maxBudget) : "No maximum"}`
    : null;
  const preferences = [
    data.highwayTouchRequired ? "Highway access required" : null,
    data.immediateRegistryRequired ? "Immediate registry required" : null,
  ].filter(Boolean);
  const message = [
    "Hello Palia Property Hub, I am looking for a property with these requirements:",
    "",
    `Name: ${data.buyerName}`,
    `WhatsApp: +91 ${data.whatsappNumber}`,
    `Purpose: ${purpose}`,
    `Preferred locations: ${data.preferredVillages.join(", ")}`,
    budget,
    ...preferences,
    data.additionalNotes?.trim() ? `Additional notes: ${data.additionalNotes.trim()}` : null,
  ].filter((line): line is string => line !== null).join("\n");

  return `https://wa.me/919876543210?text=${encodeURIComponent(message)}`;
}

export function BuyerForm({ className, compact = false }: { className?: string; compact?: boolean }) {
  const [submitted, setSubmitted] = useState(false);
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState("");
  const [locations, setLocations] = useState<string[]>([]);

  useEffect(() => {
    void fetchLocations()
      .then(items => setLocations(items.filter(item => ["CITY", "VILLAGE"].includes(item.type)).map(item => item.name)))
      .catch(() => setLocations([]));
  }, []);

  const { register, handleSubmit, control, watch, formState: { errors, isSubmitting } } =
    useForm<BuyerRequirementFormData>({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      resolver: zodResolver(buyerRequirementSchema) as any,
      defaultValues: { preferredVillages: [], waterSourceRequired: "any", highwayTouchRequired: false, immediateRegistryRequired: false },
      mode: "onTouched",
    });

  const selectedVillages = (watch("preferredVillages") ?? []) as string[];
  const onSubmit = async (data: BuyerRequirementFormData) => {
    setSubmitError("");
    try {
      await createBuyerInquiry({
        buyerName: data.buyerName,
        buyerPhone: data.whatsappNumber,
        purpose: data.purpose,
        preferredVillages: data.preferredVillages,
        minArea: data.minArea,
        maxArea: data.maxArea,
        areaUnit: data.areaUnit,
        minBudget: data.minBudget,
        maxBudget: data.maxBudget,
        waterSourceRequired: data.waterSourceRequired,
        highwayTouchRequired: data.highwayTouchRequired,
        immediateRegistryRequired: data.immediateRegistryRequired,
        notes: data.additionalNotes,
      });
      setWhatsappUrl(buildWhatsAppUrl(data));
      setSubmitted(true);
    } catch {
      setSubmitError("Unable to submit your requirement right now. Please try again.");
    }
  };

  if (submitted) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className={cn("bg-white rounded-2xl p-8 text-center border border-agri-green-200 shadow-sm", className)}>
        <div className="w-16 h-16 bg-agri-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-agri-green" />
        </div>
        <h3 className="text-lg font-extrabold text-slate-900 mb-2">Requirement Saved!</h3>
        <p className="text-slate-500 text-sm mb-5">Continue to WhatsApp to review your prefilled request and send it to our local property team.</p>
        {whatsappUrl && (
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer"
            className="mb-4 inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#1da851]">
            <MessageCircle className="h-4 w-4" /> Continue on WhatsApp
          </a>
        )}
        <button onClick={() => { setSubmitted(false); setWhatsappUrl(null); }} className="block mx-auto text-sm font-semibold text-agri-green border border-agri-green px-4 py-2 rounded-xl hover:bg-agri-green-50 transition-colors">
          Submit Another
        </button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className={cn("bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden", className)}>
      {/* Header */}
      <div className="bg-gradient-to-r from-trust-blue to-sky-600 px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
            <Target className="w-4.5 h-4.5 text-white" />
          </div>
          <div>
            <h3 className="text-white font-extrabold text-base">Find My Property</h3>
            <p className="text-white/70 text-[11px]">Tell us what you need — we&apos;ll find it</p>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Contact */}
        <div className={cn("grid gap-3", compact ? "grid-cols-1" : "grid-cols-2")}>
          <div>
            <label className="text-xs font-bold text-slate-600 mb-1.5 block">Your Name *</label>
            <input placeholder="e.g. Mohan Kumar" className={inputCls} {...register("buyerName")} />
            {errors.buyerName && <p className="text-[11px] text-red-500 mt-1">⚠ {errors.buyerName.message}</p>}
          </div>
          <div>
            <label className="text-xs font-bold text-slate-600 mb-1.5 block">WhatsApp *</label>
            <input placeholder="10-digit mobile" type="tel" maxLength={10} className={inputCls} {...register("whatsappNumber")} />
            {errors.whatsappNumber && <p className="text-[11px] text-red-500 mt-1">⚠ {errors.whatsappNumber.message}</p>}
          </div>
        </div>

        {/* Purpose */}
        <div>
          <label className="text-xs font-bold text-slate-600 mb-2 block">Purpose *</label>
          <Controller name="purpose" control={control} render={({ field }) => (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {PURPOSES.map(p => (
                <button key={p.v} type="button" onClick={() => field.onChange(p.v)}
                  className={cn(
                    "flex items-center gap-2.5 p-2.5 rounded-xl border-2 text-left transition-all duration-200",
                    field.value === p.v ? "border-trust-blue bg-trust-blue-50 shadow-sm" : "border-slate-200 hover:border-trust-blue/40 hover:bg-slate-50"
                  )}>
                  <span className="text-xl">{p.e}</span>
                  <div>
                    <p className="text-xs font-bold text-slate-800">{p.l}</p>
                    <p className="text-[10px] text-slate-400">{p.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          )} />
          {errors.purpose && <p className="text-[11px] text-red-500 mt-1">⚠ {errors.purpose.message}</p>}
        </div>

        {/* Budget */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold text-slate-600 mb-1.5 block">Min Budget (₹)</label>
            <input type="number" min={0} placeholder="e.g. 500000" className={inputCls} {...register("minBudget", { setValueAs: value => value === "" ? undefined : Number(value) })} />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-600 mb-1.5 block">Max Budget (₹)</label>
            <input type="number" min={0} placeholder="e.g. 5000000" className={inputCls} {...register("maxBudget", { setValueAs: value => value === "" ? undefined : Number(value) })} />
          </div>
        </div>

        {/* Villages */}
        <div>
          <label className="text-xs font-bold text-slate-600 mb-2 block">Preferred Villages *</label>
          <Controller name="preferredVillages" control={control} render={({ field }) => (
            <div className="flex flex-wrap gap-1.5">
              {locations.map(v => {
                const sel = (field.value as string[]).includes(v);
                return (
                  <button key={v} type="button"
                    onClick={() => field.onChange(sel ? (field.value as string[]).filter(x => x !== v) : [...(field.value as string[]), v])}
                    className={cn(
                      "text-xs px-2.5 py-1.5 rounded-full border font-semibold transition-all duration-200",
                      sel ? "bg-agri-green text-white border-agri-green shadow-sm" : "bg-white text-slate-600 border-slate-200 hover:border-agri-green hover:text-agri-green"
                    )}
                  >
                    {sel && "✓ "}{v}
                  </button>
                );
              })}
            </div>
          )} />
          {errors.preferredVillages && <p className="text-[11px] text-red-500 mt-1">⚠ {errors.preferredVillages.message}</p>}
          {selectedVillages.length > 0 && <p className="text-[11px] text-slate-400 mt-1">{selectedVillages.length} location(s) selected</p>}
        </div>

        {/* Preferences */}
        {!compact && (
          <div>
            <label className="text-xs font-bold text-slate-600 mb-2 block">Preferences</label>
            <div className="flex flex-wrap gap-2">
              {[
                { name: "highwayTouchRequired" as const, l: "Highway Touch" },
                { name: "immediateRegistryRequired" as const, l: "Immediate Registry" },
              ].map(pref => (
                <Controller key={pref.name} name={pref.name} control={control} render={({ field }) => (
                  <button type="button" onClick={() => field.onChange(!field.value)}
                    className={cn(
                      "text-xs px-3 py-1.5 rounded-full border font-semibold transition-all",
                      field.value ? "bg-harvest-gold text-white border-harvest-gold shadow-sm" : "bg-white text-slate-600 border-slate-200 hover:border-harvest-gold hover:text-harvest-gold"
                    )}>
                    {pref.l}
                  </button>
                )} />
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        <div>
          <label className="text-xs font-bold text-slate-600 mb-1.5 block">Additional Notes</label>
          <textarea rows={2} placeholder="Any specific requirements..." className={cn(inputCls, "resize-none")} {...register("additionalNotes")} />
        </div>

        <button type="submit" disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-harvest-gold to-gold-400 hover:from-harvest-gold-dark hover:to-harvest-gold text-white font-bold py-3.5 rounded-xl hover:shadow-gold transition-all disabled:opacity-60"
        >
          {isSubmitting
            ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            : <Send className="w-4 h-4" />
          }
          Save Requirement
        </button>

        {submitError && <p role="alert" className="text-center text-xs font-medium text-red-600">{submitError}</p>}

        <p className="text-center text-[11px] text-slate-400">Free service · No broker fees · Local expert responds within 4 hours</p>
      </div>
    </form>
  );
}
