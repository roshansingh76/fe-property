"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  MapPin, Phone, MessageCircle, Bookmark, Share2,
  Droplets, Zap, Route, TreePine, CheckCircle2,
  Eye, ArrowRight, ArrowLeftRight, BadgeCheck,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { formatPrice, formatArea, convertArea, formatDistance } from "@/lib/utils/conversions";
import { toggleSavedProperty, useSavedProperty } from "@/lib/hooks/useSavedProperty";
import type { AgriProperty, LandUnit } from "@/lib/data/properties";

interface AgriPropertyCardProps {
  property: AgriProperty;
  displayUnit?: LandUnit;
  className?: string;
  compact?: boolean;
  compared?: boolean;
  compareDisabled?: boolean;
  onCompare?: () => void;
}

const IRRIGATION_LABELS: Record<string, string> = {
  tubewell: "Tube Well", canal: "Canal", rainfed: "Rain Fed",
  drip: "Drip", solar_pump: "Solar Pump",
};

const BADGE_STYLES: Record<string, string> = {
  verified: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
  registry:  "bg-blue-50 text-blue-700 border-blue-200/80",
  khatauni:  "bg-amber-50 text-amber-700 border-amber-200/80",
  owner:     "bg-violet-50 text-violet-700 border-violet-200/80",
  featured:  "bg-orange-50 text-orange-700 border-orange-200/80",
  new:       "bg-sky-50 text-sky-700 border-sky-200/80",
};

export function AgriPropertyCard({ property, displayUnit = "bigha", className, compact = false, compared = false, compareDisabled = false, onCompare }: AgriPropertyCardProps) {
  const saved = useSavedProperty(property.id);
  const [imgError, setImgError] = useState(false);

  const displayArea = convertArea(property.area, property.areaUnit, displayUnit);
  const waMsg = encodeURIComponent(`Hi, interested in: "${property.title}" (Khasra: ${property.khasraNumber}) listed on Palia Property Hub.`);
  const waUrl = `https://wa.me/${property.sellerPhone.replace(/\D/g, "")}?text=${waMsg}`;

  const handleShare = async () => {
    try {
      if (navigator.share) await navigator.share({ title: property.title, url: `/property/${property.slug}` });
      else { await navigator.clipboard.writeText(window.location.origin + `/property/${property.slug}`); }
    } catch { /* cancelled */ }
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4 }}
      className={cn(
        "group relative flex flex-col bg-white rounded-2xl overflow-hidden border border-slate-100/80",
        "shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_16px_40px_-8px_rgba(15,81,50,0.16)] hover:border-agri-green-200",
        "transition-all duration-350 cursor-pointer",
        className
      )}
      style={{ transition: "all 0.3s cubic-bezier(0.34,1.2,0.64,1)" }}
    >
      {/* ── Image ── */}
      <div className="relative overflow-hidden aspect-[16/9] bg-agri-green-50">
        {!imgError && property.images.length > 0 ? (
          <Image
            src={property.images[0]}
            alt={property.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.06]"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <TreePine className="w-12 h-12 text-agri-green-200" />
          </div>
        )}

        {/* Gradient scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

        {/* Featured ribbon */}
        {property.featured && (
          <div className="absolute top-3 left-3 flex items-center gap-1 bg-gradient-to-r from-harvest-gold to-gold-400 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-gold">
            ⭐ Featured
          </div>
        )}

        {/* Actions */}
        <div className="absolute top-3 right-3 flex gap-1.5">
          {onCompare && (
            <button
              onClick={e => { e.stopPropagation(); onCompare(); }}
              disabled={compareDisabled}
              title={compared ? "Remove from comparison" : compareDisabled ? "Compare up to 3 properties" : "Add to comparison"}
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 backdrop-blur-sm disabled:cursor-not-allowed disabled:opacity-50",
                compared ? "bg-trust-blue text-white" : "bg-black/25 text-white hover:bg-white hover:text-trust-blue"
              )}
              aria-label={compared ? "Remove from comparison" : "Add to comparison"}
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={e => { e.stopPropagation(); toggleSavedProperty(property.id); }}
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 backdrop-blur-sm",
              saved ? "bg-harvest-gold text-white shadow-gold" : "bg-black/25 text-white hover:bg-white hover:text-harvest-gold"
            )}
            aria-label={saved ? "Unsave" : "Save"}
          >
            <Bookmark className={cn("w-3.5 h-3.5", saved && "fill-current")} />
          </button>
          <button
            onClick={e => { e.stopPropagation(); void handleShare(); }}
            className="w-8 h-8 rounded-full bg-black/25 backdrop-blur-sm text-white hover:bg-white hover:text-trust-blue flex items-center justify-center transition-all duration-200"
            aria-label="Share"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Price overlay */}
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
          <div>
            <div className="text-[11px] text-white/70 font-medium mb-0.5">Total Price</div>
            <div className="text-xl font-extrabold text-white drop-shadow">{formatPrice(property.price, true)}</div>
          </div>
          <div className="text-right">
            {property.pricePerBigha > 0 && (
              <div className="text-[11px] text-white/80 font-semibold bg-black/30 backdrop-blur-sm px-2 py-0.5 rounded-lg">
                {formatPrice(property.pricePerBigha, true)}/Bigha
              </div>
            )}
          </div>
        </div>

        {/* Views */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 text-white/60 text-[10px]">
          <Eye className="w-3 h-3" />{property.views} views
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex flex-col flex-1 p-4 gap-3">

        {/* Badges */}
        <div className="flex flex-wrap gap-1.5">
          {property.badges.slice(0, compact ? 2 : 3).map(badge => (
            <span
              key={badge.label}
              className={cn(
                "inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border",
                BADGE_STYLES[badge.variant] ?? "bg-slate-50 text-slate-600 border-slate-200"
              )}
            >
              {badge.variant === "verified" && <BadgeCheck className="w-2.5 h-2.5" />}
              {badge.variant === "khatauni" && <CheckCircle2 className="w-2.5 h-2.5" />}
              {badge.label}
            </span>
          ))}
        </div>

        {/* Title */}
        <Link href={`/property/${property.slug}`} onClick={e => e.stopPropagation()}>
          <h3 className="font-bold text-slate-900 text-[15px] leading-snug line-clamp-2 group-hover:text-agri-green transition-colors duration-200">
            {property.title}
          </h3>
        </Link>

        {/* Location */}
        <div className="flex items-center gap-1 text-xs text-slate-500">
          <MapPin className="w-3.5 h-3.5 text-agri-green flex-shrink-0" />
          <span className="truncate">{property.location}</span>
          <span className="text-slate-300 flex-shrink-0 mx-0.5">·</span>
          <span className="flex-shrink-0 whitespace-nowrap">{formatDistance(property.distanceFromPalia)}</span>
        </div>

        {/* Area chip */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1.5 bg-agri-green-50 text-agri-green border border-agri-green-200 text-xs font-bold px-3 py-1.5 rounded-xl">
            📐 {formatArea(displayArea, displayUnit)}
          </span>
          {property.khasraNumber && (
            <span className="text-[11px] text-slate-400 font-mono bg-slate-50 border border-slate-200 px-2 py-1 rounded-lg">
              K: {property.khasraNumber}
            </span>
          )}
        </div>

        {/* Agri features */}
        {!compact && (
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 py-2.5 border-t border-b border-slate-100 text-xs text-slate-600">
            <div className="flex items-center gap-1.5">
              <Droplets className="w-3.5 h-3.5 text-trust-blue flex-shrink-0" />
              <span className="truncate">{property.irrigation.length > 0 ? property.irrigation.map(i => IRRIGATION_LABELS[i] ?? i).join(", ") : "Rain Fed"}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap className={cn("w-3.5 h-3.5 flex-shrink-0", property.electricityConnection ? "text-gold-500" : "text-slate-300")} />
              <span>{property.electricityConnection ? "Electricity" : "No Power"}</span>
            </div>
            {property.roadFrontage > 0 && (
              <div className="flex items-center gap-1.5">
                <Route className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span>{property.roadFrontage}ft Road Front</span>
              </div>
            )}
            {(property.highwayTouch || property.canalTouch) && (
              <div className="flex items-center gap-1.5 text-agri-green font-semibold">
                <span className="text-sm">{property.highwayTouch ? "🛣️" : "🌊"}</span>
                <span>{property.highwayTouch ? "Highway Touch" : "Canal Touch"}</span>
              </div>
            )}
          </div>
        )}

        {/* Seller row */}
        <div className="flex items-center gap-2 text-xs">
          <div className={cn(
            "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-extrabold flex-shrink-0",
            property.sellerType === "owner" ? "bg-violet-100 text-violet-700"
              : property.sellerType === "direct_farmer" ? "bg-agri-green-100 text-agri-green"
              : "bg-sky-100 text-sky-700"
          )}>
            {property.sellerName.charAt(0).toUpperCase()}
          </div>
          <span className="font-semibold text-slate-700 truncate">{property.sellerName}</span>
          <span className="text-slate-300">·</span>
          <span className="text-slate-400 whitespace-nowrap capitalize flex-shrink-0">
            {property.sellerType === "direct_farmer" ? "Farmer" : property.sellerType === "owner" ? "Owner" : "Broker"}
          </span>
        </div>

        {/* CTA */}
        <div className="flex gap-2 pt-1">
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="flex-1 btn-whatsapp flex items-center justify-center gap-1.5 text-xs font-bold py-2.5 rounded-xl"
          >
            <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
          </a>
          <a
            href={`tel:${property.sellerPhone}`}
            onClick={e => e.stopPropagation()}
            className="flex-1 flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-agri-green-100 text-slate-700 hover:text-agri-green text-xs font-bold py-2.5 rounded-xl transition-colors duration-200"
          >
            <Phone className="w-3.5 h-3.5" /> Call
          </a>
          <Link
            href={`/property/${property.slug}`}
            onClick={e => e.stopPropagation()}
            className="w-10 flex items-center justify-center bg-agri-green-50 hover:bg-agri-green hover:text-white text-agri-green rounded-xl transition-colors duration-200"
            aria-label={`View ${property.title}`}
          >
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </motion.article>
  );
}
