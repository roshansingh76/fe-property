"use client";

import Link from "next/link";
import { ArrowLeftRight, X } from "lucide-react";
import { formatArea, formatPrice } from "@/lib/utils/conversions";
import { PROPERTY_CATEGORIES, type AgriProperty } from "@/lib/data/properties";

interface PropertyComparisonProps {
  properties: AgriProperty[];
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onRemove: (propertyId: string) => void;
  onClear: () => void;
}

const COMPARISON_ROWS: { label: string; value: (property: AgriProperty) => string }[] = [
  { label: "Property type", value: property => PROPERTY_CATEGORIES[property.category]?.label ?? property.category },
  { label: "Location", value: property => `${property.village}, ${property.district}` },
  { label: "Total price", value: property => formatPrice(property.price, true) },
  { label: "Area", value: property => formatArea(property.area, property.areaUnit) },
  { label: "Price per bigha", value: property => property.pricePerBigha > 0 ? formatPrice(property.pricePerBigha, true) : "Not listed" },
  { label: "Price per acre", value: property => property.pricePerAcre > 0 ? formatPrice(property.pricePerAcre, true) : "Not listed" },
  { label: "Water", value: property => property.irrigation.length ? property.irrigation.join(", ") : "Not specified" },
  { label: "Road frontage", value: property => property.roadFrontage > 0 ? `${property.roadFrontage} ft` : "Not specified" },
  { label: "Electricity", value: property => property.electricityConnection ? "Available" : "Not available" },
  { label: "Highway access", value: property => property.highwayTouch ? "Highway touch" : "No direct touch" },
  { label: "Khatauni", value: property => property.badges.some(badge => badge.variant === "khatauni") ? "Verified" : "Not verified" },
  { label: "Registry", value: property => property.immediateRegistry ? "Ready" : "Not confirmed" },
  { label: "Seller", value: property => property.sellerType === "verified_broker" ? "Verified broker" : property.sellerType === "direct_farmer" ? "Direct farmer" : "Owner" },
];

export function PropertyComparison({ properties, isOpen, onOpen, onClose, onRemove, onClear }: PropertyComparisonProps) {
  if (properties.length === 0) return null;

  return (
    <>
      <aside className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 shadow-[0_-8px_30px_rgba(15,23,42,0.12)] backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-trust-blue/10 text-trust-blue">
              <ArrowLeftRight className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-900">Compare properties <span className="text-trust-blue">{properties.length}/3</span></p>
              <p className="hidden truncate text-xs text-slate-500 sm:block">
                {properties.map(property => property.title).join(" · ")}
              </p>
            </div>
          </div>
          <div className="flex flex-shrink-0 items-center gap-2">
            <button onClick={onClear} className="hidden px-3 py-2 text-xs font-semibold text-slate-500 hover:text-red-600 sm:inline-flex">
              Clear
            </button>
            <button onClick={onOpen} className="rounded-lg bg-trust-blue px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-trust-blue/90">
              Compare now
            </button>
          </div>
        </div>
      </aside>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
          <div className="absolute inset-0 bg-slate-950/60" />
          <section role="dialog" aria-modal="true" aria-labelledby="property-comparison-title" className="relative flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
            <header className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 sm:px-6">
              <div>
                <h2 id="property-comparison-title" className="text-lg font-extrabold text-slate-900">Compare land listings</h2>
                <p className="mt-1 text-xs text-slate-500">Compare listed details side by side. Confirm legal and price details with the seller.</p>
              </div>
              <button onClick={onClose} aria-label="Close comparison" className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900">
                <X className="h-4 w-4" />
              </button>
            </header>

            <div className="overflow-auto">
              <table className="w-full min-w-[680px] border-collapse text-left text-sm">
                <thead className="sticky top-0 z-10 bg-white">
                  <tr>
                    <th className="w-36 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-bold uppercase text-slate-500 sm:w-48">Details</th>
                    {properties.map(property => (
                      <th key={property.id} className="min-w-44 border-b border-l border-slate-200 px-4 py-3 align-top">
                        <div className="flex items-start justify-between gap-2">
                          <Link href={`/property/${property.slug}`} onClick={onClose} className="line-clamp-2 text-sm font-bold text-slate-900 hover:text-agri-green">
                            {property.title}
                          </Link>
                          <button onClick={() => onRemove(property.id)} aria-label={`Remove ${property.title} from comparison`} className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md text-slate-400 hover:bg-red-50 hover:text-red-600">
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON_ROWS.map((row, index) => (
                    <tr key={row.label} className={index % 2 === 0 ? "bg-white" : "bg-slate-50/70"}>
                      <th scope="row" className="px-4 py-3 text-xs font-semibold text-slate-600">{row.label}</th>
                      {properties.map(property => (
                        <td key={property.id} className="border-l border-slate-100 px-4 py-3 text-sm font-medium text-slate-800">{row.value(property)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <footer className="flex justify-end border-t border-slate-200 px-5 py-3 sm:px-6">
              <button onClick={onClear} className="text-xs font-bold text-slate-500 hover:text-red-600">Clear comparison</button>
            </footer>
          </section>
        </div>
      )}
    </>
  );
}