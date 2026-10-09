"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  X, ChevronRight, ChevronLeft, Check, Upload, User, MapPin,
  Ruler, IndianRupee, FileText, ImagePlus, Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { sellLandSchema, type SellLandFormData } from "@/lib/schemas/forms";
import {
  createProperty, fetchLocations,
  uploadPropertyDocument, uploadPropertyImages,
} from "@/lib/api/client";

interface SellLandModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const STEPS = [
  { id: 1, title: "Owner Details",  icon: User,         color: "from-violet-500 to-purple-600" },
  { id: 2, title: "Location",       icon: MapPin,       color: "from-agri-green to-forest-600" },
  { id: 3, title: "Land Details",   icon: Ruler,        color: "from-trust-blue to-sky-600" },
  { id: 4, title: "Pricing",        icon: IndianRupee,  color: "from-harvest-gold to-amber-500" },
  { id: 5, title: "Photos & Docs",  icon: FileText,     color: "from-rose-500 to-pink-500" },
];

const STEP_FIELDS: Record<number, (keyof SellLandFormData)[]> = {
  1: ["ownerName", "whatsappNumber"],
  2: ["villageName", "khasraNumber"],
  3: ["landArea", "landUnit", "irrigationType"],
  4: ["expectedPrice"],
  5: ["consentToContact"],
};

const Field = ({
  label, error, hint, required, children,
}: {
  label: string; error?: string; hint?: string; required?: boolean; children: React.ReactNode;
}) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-sm font-semibold text-slate-700">
      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {children}
    {error  && <p className="text-xs text-red-500 flex items-center gap-1">⚠ {error}</p>}
    {hint && !error && <p className="text-xs text-slate-400">{hint}</p>}
  </div>
);

// ── Image preview tile ─────────────────────────────────────────────────────

function ImageTile({ src, onRemove }: { src: string; onRemove: () => void }) {
  return (
    <div className="relative group aspect-square rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="preview" className="w-full h-full object-cover" />
      <button
        type="button"
        onClick={onRemove}
        className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
        aria-label="Remove image"
      >
        <Trash2 className="w-5 h-5 text-white" />
      </button>
    </div>
  );
}

export function SellLandModal({ isOpen, onClose }: SellLandModalProps) {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [locations, setLocations] = useState<string[]>([]);

  // Multi-image state (File objects + object-URL previews)
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const photoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    void fetchLocations()
      .then(items => setLocations(
        items.filter(i => ["CITY", "VILLAGE"].includes(i.type)).map(i => i.name)
      ))
      .catch(() => setLocations([]));
  }, []);

  // Clean up object URLs on unmount / modal close
  useEffect(() => {
    return () => { photoPreviews.forEach(url => URL.revokeObjectURL(url)); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photoPreviews]);

  const {
    register, handleSubmit, control, trigger, watch,
    formState: { errors, isSubmitting },
  } = useForm<SellLandFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(sellLandSchema) as any,
    defaultValues: {
      tehsil: "Palia",
      electricityConnection: false,
      highwayTouch: false,
      canalTouch: false,
      consentToContact: false,
      irrigationType: [],
    },
    mode: "onTouched",
  });

  const goNext = async () => {
    if (await trigger(STEP_FIELDS[step])) setStep(s => Math.min(s + 1, 5));
  };
  const goPrev = () => setStep(s => Math.max(s - 1, 1));

  // ── Image handlers ──────────────────────────────────────────────────────

  const addPhotos = (files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files).filter(f => f.type.startsWith("image/")).slice(0, 10 - photoFiles.length);
    const newPreviews = newFiles.map(f => URL.createObjectURL(f));
    setPhotoFiles(prev => [...prev, ...newFiles]);
    setPhotoPreviews(prev => [...prev, ...newPreviews]);
  };

  const removePhoto = (index: number) => {
    URL.revokeObjectURL(photoPreviews[index]);
    setPhotoFiles(prev => prev.filter((_, i) => i !== index));
    setPhotoPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handlePhotoDrop = (e: React.DragEvent) => {
    e.preventDefault();
    addPhotos(e.dataTransfer.files);
  };

  // ── Submit ──────────────────────────────────────────────────────────────

  const onSubmit = async (data: SellLandFormData) => {
    setSubmitError(null);
    try {
      const village = data.villageName === "Other" ? (data.customVillage ?? data.villageName) : data.villageName;
      const property = await createProperty({
        title: `${data.landArea} ${data.landUnit} land near ${village}`,
        category: "AGRICULTURAL_LAND",
        description: data.propertyDescription,
        village,
        tehsil: data.tehsil,
        price: data.expectedPrice,
        area: data.landArea,
        areaUnit: data.landUnit.toUpperCase(),
        irrigation: data.irrigationType,
        roadFrontage: data.roadFrontage,
        electricity: data.electricityConnection,
        highwayTouch: data.highwayTouch,
        canalTouch: data.canalTouch,
        khasraNumber: data.khasraNumber,
        images: [],
      });

      // Upload photos if any selected
      if (photoFiles.length > 0) {
        await uploadPropertyImages(property.id, photoFiles);
      }

      // Upload khatauni doc if provided
      if (data.khatauniFile instanceof FileList && data.khatauniFile.length > 0) {
        await uploadPropertyDocument(property.id, data.khatauniFile[0], "KHATAUNI");
      }

      setSubmitted(true);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Unable to submit listing");
    }
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setStep(1);
      setSubmitted(false);
      setSubmitError(null);
      photoPreviews.forEach(url => URL.revokeObjectURL(url));
      setPhotoFiles([]);
      setPhotoPreviews([]);
    }, 300);
  };

  const inputCls = (err?: string) => cn(
    "w-full bg-slate-50 border rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-200",
    err
      ? "border-red-400 focus:ring-2 focus:ring-red-200 focus:border-red-400"
      : "border-slate-200 focus:border-agri-green focus:ring-2 focus:ring-agri-green/10 focus:bg-white",
  );

  const stepData = STEPS[step - 1];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="bd"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.94, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 24 }}
            transition={{ type: "spring", damping: 28, stiffness: 340 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            aria-modal="true" role="dialog"
          >
            <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">

              {/* ── Header ── */}
              <div className={cn("bg-gradient-to-r px-6 py-5 flex-shrink-0", submitted ? "from-agri-green to-forest-600" : stepData.color)}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-white font-extrabold text-lg">
                      {submitted ? "Property Listed! 🎉" : "List Your Property"}
                    </h2>
                    <p className="text-white/70 text-xs mt-0.5">
                      {submitted ? "Our team will call you shortly" : "Free · No commission · 24h response"}
                    </p>
                  </div>
                  <button onClick={handleClose} className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {!submitted && (
                  <>
                    <div className="flex gap-1.5">
                      {STEPS.map(s => (
                        <button
                          key={s.id}
                          onClick={() => s.id < step && setStep(s.id)}
                          className={cn(
                            "flex-1 h-1.5 rounded-full transition-all duration-300",
                            s.id < step ? "bg-white/90" : s.id === step ? "bg-white" : "bg-white/25",
                          )}
                          title={s.title}
                        />
                      ))}
                    </div>
                    <p className="text-white/80 text-[11px] font-semibold mt-2">
                      Step {step}/5 — {stepData.title}
                    </p>
                  </>
                )}
              </div>

              {/* ── Body ── */}
              <div className="flex-1 overflow-y-auto">
                {submitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-10 px-6 text-center"
                  >
                    <div className="w-20 h-20 bg-agri-green-100 rounded-full flex items-center justify-center mb-5">
                      <Check className="w-10 h-10 text-agri-green" />
                    </div>
                    <h3 className="text-xl font-extrabold text-slate-900 mb-2">Successfully Listed!</h3>
                    <p className="text-slate-500 text-sm mb-6 max-w-xs">
                      Our local expert will verify your details and call you within <strong>24 hours</strong>.
                    </p>
                    <div className="bg-agri-green-50 border border-agri-green-200 rounded-2xl p-4 w-full text-left mb-6">
                      <p className="text-xs font-bold text-agri-green mb-2">What happens next?</p>
                      <ol className="text-xs text-slate-600 space-y-1.5 list-decimal list-inside">
                        <li>Team verifies Khasra details (within 4 hours)</li>
                        <li>Property goes live within 24 hours</li>
                        <li>Buyers contact you directly on WhatsApp</li>
                      </ol>
                    </div>
                    <button onClick={handleClose} className="w-full py-3 bg-agri-green text-white font-bold rounded-xl hover:bg-forest-700 transition-colors">
                      Close
                    </button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit(onSubmit)} noValidate>
                    {submitError && (
                      <div className="mx-6 mt-6 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                        {submitError}
                      </div>
                    )}
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={step}
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                        className="p-6 space-y-4"
                      >
                        {/* ── Step 1 — Owner Details ── */}
                        {step === 1 && (
                          <>
                            <Field label="Full Name" required error={errors.ownerName?.message}>
                              <input placeholder="e.g. Ramesh Kumar Verma" className={inputCls(errors.ownerName?.message)} {...register("ownerName")} />
                            </Field>
                            <Field label="WhatsApp Number" required error={errors.whatsappNumber?.message} hint="Buyers will contact you on this number">
                              <input placeholder="10-digit mobile" type="tel" maxLength={10} className={inputCls(errors.whatsappNumber?.message)} {...register("whatsappNumber")} />
                            </Field>
                            <Field label="Alternate Phone (Optional)" error={errors.alternatePhone?.message}>
                              <input placeholder="10-digit mobile" type="tel" maxLength={10} className={inputCls(errors.alternatePhone?.message)} {...register("alternatePhone")} />
                            </Field>
                          </>
                        )}

                        {/* ── Step 2 — Location ── */}
                        {step === 2 && (
                          <>
                            <Field label="Village / Area" required error={errors.villageName?.message}>
                              <Controller name="villageName" control={control} render={({ field }) => (
                                <select {...field} className={inputCls(errors.villageName?.message)}>
                                  <option value="">Select village</option>
                                  {locations.map(v => <option key={v} value={v}>{v}</option>)}
                                  <option value="Other">Other Village</option>
                                </select>
                              )} />
                            </Field>
                            {watch("villageName") === "Other" && (
                              <Field label="Specify Village" error={errors.customVillage?.message}>
                                <input placeholder="Village name" className={inputCls(errors.customVillage?.message)} {...register("customVillage")} />
                              </Field>
                            )}
                            <Field label="Tehsil">
                              <input defaultValue="Palia" className={inputCls()} {...register("tehsil")} />
                            </Field>
                            <Field label="Khasra / Survey Number" required error={errors.khasraNumber?.message} hint="Found on Khatauni documents">
                              <input placeholder="e.g. 245/3" className={inputCls(errors.khasraNumber?.message)} {...register("khasraNumber")} />
                            </Field>
                          </>
                        )}

                        {/* ── Step 3 — Land Details ── */}
                        {step === 3 && (
                          <>
                            <div className="grid grid-cols-2 gap-3">
                              <Field label="Land Area" required error={errors.landArea?.message}>
                                <input type="number" min={0} step={0.01} placeholder="e.g. 5" className={inputCls(errors.landArea?.message)} {...register("landArea", { valueAsNumber: true })} />
                              </Field>
                              <Field label="Unit" required error={errors.landUnit?.message}>
                                <Controller name="landUnit" control={control} render={({ field }) => (
                                  <select {...field} className={inputCls(errors.landUnit?.message)}>
                                    <option value="">Select</option>
                                    <option value="bigha">Bigha</option>
                                    <option value="acre">Acre</option>
                                    <option value="hectare">Hectare</option>
                                    <option value="sqft">Sq. Ft.</option>
                                  </select>
                                )} />
                              </Field>
                            </div>

                            <Field label="Irrigation Source" required error={errors.irrigationType?.message}>
                              <div className="grid grid-cols-2 gap-2">
                                {[
                                  { v: "tubewell",   l: "💧 Tube Well"   },
                                  { v: "canal",      l: "🌊 Sarda Canal" },
                                  { v: "drip",       l: "💦 Drip System" },
                                  { v: "solar_pump", l: "☀️ Solar Pump"  },
                                  { v: "rainfed",    l: "🌧️ Rain Fed"    },
                                  { v: "none",       l: "❌ None"        },
                                ].map(item => (
                                  <Controller key={item.v} name="irrigationType" control={control} render={({ field }) => {
                                    const checked = (field.value as string[]).includes(item.v);
                                    return (
                                      <label className={cn("flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all", checked ? "border-agri-green bg-agri-green-50" : "border-slate-200 hover:border-agri-green/50")}>
                                        <input type="checkbox" className="sr-only" checked={checked}
                                          onChange={() => field.onChange(
                                            checked ? (field.value as string[]).filter(v => v !== item.v) : [...(field.value as string[]), item.v]
                                          )} />
                                        <div className={cn("w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0", checked ? "bg-agri-green border-agri-green" : "border-slate-300")}>
                                          {checked && <Check className="w-2.5 h-2.5 text-white" />}
                                        </div>
                                        <span className="text-xs font-medium text-slate-700">{item.l}</span>
                                      </label>
                                    );
                                  }} />
                                ))}
                              </div>
                            </Field>

                            <Field label="Road Frontage (ft)" hint="Road frontage in feet">
                              <input type="number" min={0} placeholder="e.g. 60" className={inputCls()} {...register("roadFrontage", { valueAsNumber: true })} />
                            </Field>

                            <div className="grid grid-cols-3 gap-2">
                              {[
                                { name: "electricityConnection" as const, l: "⚡ Electricity" },
                                { name: "highwayTouch" as const,          l: "🛣️ Highway"     },
                                { name: "canalTouch" as const,            l: "🌊 Canal"       },
                              ].map(item => (
                                <Controller key={item.name} name={item.name} control={control} render={({ field }) => (
                                  <button type="button" onClick={() => field.onChange(!field.value)}
                                    className={cn("p-2.5 rounded-xl border text-xs font-bold text-center transition-all", field.value ? "border-agri-green bg-agri-green-50 text-agri-green" : "border-slate-200 text-slate-500 hover:border-agri-green/50")}>
                                    {item.l}
                                  </button>
                                )} />
                              ))}
                            </div>
                          </>
                        )}

                        {/* ── Step 4 — Pricing ── */}
                        {step === 4 && (
                          <>
                            <Field label="Expected Total Price (₹)" required error={errors.expectedPrice?.message} hint="Enter total price in Indian Rupees">
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
                                <input type="number" min={0} placeholder="e.g. 4500000"
                                  className={cn(inputCls(errors.expectedPrice?.message), "pl-7")}
                                  {...register("expectedPrice", { valueAsNumber: true })} />
                              </div>
                            </Field>
                            <Field label="Crop History" hint="What crops have been grown?">
                              <textarea rows={3} placeholder="e.g. Sugarcane (5 years), Wheat (Rabi)"
                                className={cn(inputCls(), "resize-none")} {...register("cropHistory")} />
                            </Field>
                            <Field label="Property Description (Optional)">
                              <textarea rows={3} placeholder="Any additional details about the land..."
                                className={cn(inputCls(), "resize-none")} {...register("propertyDescription")} />
                            </Field>
                          </>
                        )}

                        {/* ── Step 5 — Photos & Docs ── */}
                        {step === 5 && (
                          <>
                            {/* Multi-image drop zone */}
                            <div>
                              <label className="text-sm font-semibold text-slate-700 mb-2 block">
                                Land Photos <span className="text-slate-400 font-normal text-xs">(up to 10 images)</span>
                              </label>

                              {/* Previews grid */}
                              {photoPreviews.length > 0 && (
                                <div className="grid grid-cols-4 gap-2 mb-3">
                                  {photoPreviews.map((src, i) => (
                                    <ImageTile key={src} src={src} onRemove={() => removePhoto(i)} />
                                  ))}
                                  {/* Add more button inside grid */}
                                  {photoFiles.length < 10 && (
                                    <button
                                      type="button"
                                      onClick={() => photoInputRef.current?.click()}
                                      className="aspect-square rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-1 text-slate-400 hover:border-agri-green hover:text-agri-green transition-all"
                                    >
                                      <ImagePlus className="w-5 h-5" />
                                      <span className="text-[10px] font-semibold">Add</span>
                                    </button>
                                  )}
                                </div>
                              )}

                              {/* Drop zone (shown when no photos yet) */}
                              {photoPreviews.length === 0 && (
                                <div
                                  onDrop={handlePhotoDrop}
                                  onDragOver={e => e.preventDefault()}
                                  onClick={() => photoInputRef.current?.click()}
                                  className="group flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:border-agri-green hover:bg-agri-green-50/30 transition-all"
                                >
                                  <div className="w-12 h-12 rounded-xl bg-slate-100 group-hover:bg-agri-green-100 flex items-center justify-center transition-colors">
                                    <Upload className="w-6 h-6 text-slate-400 group-hover:text-agri-green transition-colors" />
                                  </div>
                                  <div className="text-center">
                                    <p className="text-sm font-semibold text-slate-700">Drop photos here or click to browse</p>
                                    <p className="text-xs text-slate-400 mt-0.5">JPG, PNG — up to 10 photos, 5MB each</p>
                                  </div>
                                </div>
                              )}

                              <input
                                ref={photoInputRef}
                                type="file"
                                accept="image/*"
                                multiple
                                className="sr-only"
                                onChange={e => addPhotos(e.target.files)}
                              />
                            </div>

                            {/* Khatauni document upload */}
                            <label className="group flex flex-col items-center justify-center gap-2 p-5 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:border-agri-green hover:bg-agri-green-50 transition-all">
                              <Upload className="w-7 h-7 text-slate-300 group-hover:text-agri-green group-hover:scale-110 transition-all" />
                              <span className="text-sm font-semibold text-slate-600">Upload Khatauni / Khasra</span>
                              <span className="text-xs text-slate-400">PDF, JPG, PNG — Max 5MB</span>
                              <input type="file" className="sr-only" accept=".pdf,.jpg,.jpeg,.png" {...register("khatauniFile")} />
                            </label>

                            {/* Consent */}
                            <Controller name="consentToContact" control={control} render={({ field }) => (
                              <div>
                                <label className="flex items-start gap-3 cursor-pointer">
                                  <div
                                    onClick={() => field.onChange(!field.value)}
                                    className={cn("w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all cursor-pointer", field.value ? "bg-agri-green border-agri-green" : "border-slate-300 hover:border-agri-green")}
                                  >
                                    {field.value && <Check className="w-3 h-3 text-white" />}
                                  </div>
                                  <span className="text-xs text-slate-600 leading-relaxed">
                                    I agree to be contacted by Palia Property Hub and verified buyers. I confirm the details provided are accurate.
                                  </span>
                                </label>
                                {errors.consentToContact && (
                                  <p className="text-xs text-red-500 mt-1 ml-8">⚠ {errors.consentToContact.message}</p>
                                )}
                              </div>
                            )} />
                          </>
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </form>
                )}
              </div>

              {/* ── Footer ── */}
              {!submitted && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/80 flex-shrink-0">
                  <button
                    onClick={goPrev} disabled={step === 1}
                    className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-800 disabled:opacity-30 transition-colors px-3 py-2 rounded-xl hover:bg-slate-100"
                  >
                    <ChevronLeft className="w-4 h-4" /> Back
                  </button>

                  <div className="flex gap-1">
                    {STEPS.map(s => (
                      <div key={s.id} className={cn("w-1.5 h-1.5 rounded-full transition-all", step === s.id ? "bg-agri-green w-4" : step > s.id ? "bg-agri-green-300" : "bg-slate-200")} />
                    ))}
                  </div>

                  {step < 5 ? (
                    <button
                      onClick={goNext}
                      className="flex items-center gap-1.5 text-sm font-bold text-white bg-agri-green hover:bg-forest-700 px-4 py-2 rounded-xl transition-colors shadow-sm"
                    >
                      Next <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmit(onSubmit)} disabled={isSubmitting}
                      className="flex items-center gap-1.5 text-sm font-bold text-white bg-gradient-to-r from-agri-green to-forest-600 hover:shadow-lg px-4 py-2 rounded-xl transition-all disabled:opacity-50 shadow-sm"
                    >
                      {isSubmitting
                        ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        : <Check className="w-4 h-4" />}
                      Submit
                    </button>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
