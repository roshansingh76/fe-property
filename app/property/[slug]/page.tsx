import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  Eye,
  MapPin,
  MessageCircle,
  Phone,
  Route,
  ShieldCheck,
} from "lucide-react";

import { AgriPropertyCard } from "@/components/agri-property-card";
import { PropertyActions } from "@/components/property-actions";
import { RegionalMap } from "@/components/regional-map";
import { SeoSchema } from "@/components/seo-schema";
import { PROPERTY_CATEGORIES } from "@/lib/data/properties";
import type { AgriProperty } from "@/lib/data/properties";
import { fetchProperties, fetchPropertyBySlug } from "@/lib/api/client";
import { convertArea, formatArea, formatPrice } from "@/lib/utils/conversions";

interface PropertyPageProps {
  params: Promise<{ slug: string }>;
}

const featureLabels: Record<string, string> = {
  tubewell: "Tube well",
  canal: "Canal access",
  rainfed: "Rain fed",
  drip: "Drip irrigation",
  solar_pump: "Solar pump",
};

function getTrustScore(property: AgriProperty) {
  let score = 62;
  if (property.badges.some(badge => badge.variant === "verified")) score += 10;
  if (property.badges.some(badge => badge.variant === "khatauni")) score += 10;
  if (property.badges.some(badge => badge.variant === "registry")) score += 8;
  if (property.roadFrontage > 0) score += 5;
  if (property.electricityConnection) score += 5;
  return Math.min(score, 100);
}

export async function generateMetadata({ params }: PropertyPageProps): Promise<Metadata> {
  const { slug } = await params;
  const property = await fetchPropertyBySlug(slug);
  if (!property) return { title: "Property not found" };

  return {
    title: `${property.title} | ${property.village}`,
    description: `${property.title} in ${property.location}. ${formatArea(convertArea(property.area, property.areaUnit, "bigha"), "bigha")} from ${formatPrice(property.price, true)}. Review property details and contact the seller on WhatsApp.`,
    alternates: { canonical: `/property/${property.slug}` },
    openGraph: {
      title: property.title,
      description: property.description,
      images: property.images.length > 0 ? [{ url: property.images[0], alt: property.title }] : [],
    },
  };
}

export default async function PropertyPage({ params }: PropertyPageProps) {
  const { slug } = await params;
  const property = await fetchPropertyBySlug(slug);
  if (!property) notFound();

  const trustScore = getTrustScore(property);
  const category = PROPERTY_CATEGORIES[property.category];
  const whatsappMessage = encodeURIComponent(
    `Hello, I am interested in your ${property.title} near ${property.village} listed on Palia Property Hub.`
  );
  const whatsappUrl = `https://wa.me/${property.sellerPhone.replace(/\D/g, "")}?text=${whatsappMessage}`;
  const related = (await fetchProperties({ village: property.village }))
    .filter(item => item.id !== property.id)
    .slice(0, 3);

  return (
    <>
      <SeoSchema
        page="property"
        propertyTitle={property.title}
        propertyPrice={property.price}
        propertyDescription={property.description}
        propertyUrl={`https://paliaproperty.in/property/${property.slug}`}
      />

      <main className="min-h-screen bg-slate-bg pb-24 lg:pb-12">
        <div className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-6">
            <Link href="/listings" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-agri-green">
              <ArrowLeft className="h-4 w-4" /> Back to properties
            </Link>
            <span className="hidden items-center gap-2 text-xs font-semibold text-slate-400 sm:flex">
              <span className="h-2 w-2 rounded-full bg-amber-400" /> Demo listing for product preview
            </span>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
          <div className="mb-5 flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <Link href="/" className="hover:text-agri-green">Home</Link>
            <span>/</span>
            <Link href="/listings" className="hover:text-agri-green">Properties</Link>
            <span>/</span>
            <span className="text-slate-700">{property.village}</span>
          </div>

          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.65fr)]">
            <section>
              <div className="relative aspect-[16/10] overflow-hidden rounded-3xl bg-forest-950 shadow-xl">
                {property.images.length > 0 ? (
                  <Image src={property.images[0]} alt={property.title} fill priority sizes="(max-width: 1024px) 100vw, 65vw" className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-6xl">🌾</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-black/10" />
                <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                  <span className="rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold text-agri-green">{category.icon} {category.label}</span>
                  <span className="rounded-full bg-amber-400 px-3 py-1.5 text-xs font-bold text-amber-950">DEMO DATA</span>
                </div>
                <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4 text-white">
                  <div>
                    <p className="mb-1 text-sm text-white/75">Asking price</p>
                    <p className="text-3xl font-black md:text-4xl">{formatPrice(property.price, true)}</p>
                  </div>
                  <div className="hidden rounded-xl bg-black/30 px-3 py-2 text-right backdrop-blur-sm sm:block">
                    <p className="text-xs text-white/70">Listed</p>
                    <p className="text-sm font-bold">{new Date(property.postedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {property.badges.map(badge => (
                  <span key={badge.label} className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                    <BadgeCheck className="h-3.5 w-3.5" /> {badge.label}
                  </span>
                ))}
              </div>

              <div className="mt-6">
                <h1 className="max-w-3xl text-3xl font-black tracking-tight text-slate-950 md:text-4xl">{property.title}</h1>
                <p className="mt-3 flex items-center gap-2 text-sm text-slate-500"><MapPin className="h-4 w-4 text-agri-green" /> {property.location} <span className="text-slate-300">·</span> {property.distanceFromPalia} km from Palia</p>
              </div>

              <div className="mt-7 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-slate-200 bg-slate-200 sm:grid-cols-4">
                {[
                  ["Area", formatArea(property.area, property.areaUnit)],
                  ["Price / Bigha", property.pricePerBigha ? formatPrice(property.pricePerBigha, true) : "Available on request"],
                  ["Road frontage", `${property.roadFrontage} ft`],
                  ["Views", property.views.toLocaleString("en-IN")],
                ].map(([label, value]) => <div key={label} className="bg-white p-4"><p className="text-xs text-slate-400">{label}</p><p className="mt-1 text-sm font-extrabold text-slate-900">{value}</p></div>)}
              </div>

              <div className="mt-8 border-t border-slate-200 pt-7">
                <h2 className="text-xl font-black text-slate-950">About this property</h2>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">{property.description}</p>
              </div>

              <div className="mt-8 border-t border-slate-200 pt-7">
                <h2 className="text-xl font-black text-slate-950">Property details</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {[
                    ["Land type", category.label],
                    ["Soil", property.soilType.replaceAll("_", " ")],
                    ["Water", property.irrigation.map(item => featureLabels[item]).join(", ") || "Not specified"],
                    ["Electricity", property.electricityConnection ? "Connected" : "Not connected"],
                    ["Ownership", property.singleOwner ? "Single owner stated" : "Multiple owners stated"],
                    ["Legal status", property.legalStatus.replaceAll("_", " ")],
                  ].map(([label, value]) => <div key={label} className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"><span className="text-slate-500">{label}</span><span className="text-right font-bold capitalize text-slate-800">{value}</span></div>)}
                </div>
              </div>

              <div className="mt-8 border-t border-slate-200 pt-7">
                <h2 className="text-xl font-black text-slate-950">Location</h2>
                <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200"><RegionalMap height="360px" /></div>
              </div>
            </section>

            <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div><p className="text-xs font-bold uppercase tracking-wider text-slate-400">Property trust score</p><p className="mt-1 text-3xl font-black text-agri-green">{trustScore}<span className="text-lg text-slate-400">/100</span></p><p className="text-sm font-bold text-slate-700">{trustScore >= 85 ? "Highly verified" : "Verification in progress"}</p></div>
                  <div className="rounded-2xl bg-agri-green-50 p-3 text-agri-green"><ShieldCheck className="h-7 w-7" /></div>
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-agri-green" style={{ width: `${trustScore}%` }} /></div>
                <p className="mt-3 text-xs leading-5 text-slate-500">This score summarizes listing signals. It is not a legal clearance or a substitute for independent document review.</p>
                <div className="mt-4 space-y-2 border-t border-slate-100 pt-4 text-sm">
                  {[
                    ["Seller identity", property.badges.some(badge => badge.variant === "verified")],
                    ["Khatauni signal", property.badges.some(badge => badge.variant === "khatauni")],
                    ["Registry signal", property.badges.some(badge => badge.variant === "registry")],
                    ["Road access", property.roadFrontage > 0],
                  ].map(([label, verified]) => <div key={label as string} className="flex items-center justify-between"><span className="text-slate-600">{label as string}</span>{verified ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <span className="text-xs text-slate-400">Not confirmed</span>}</div>)}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-full bg-agri-green-100 text-lg font-black text-agri-green">{property.sellerName.charAt(0)}</div><div><p className="text-xs text-slate-400">Listed by</p><p className="font-extrabold text-slate-900">{property.sellerName}</p><p className="text-xs capitalize text-slate-500">{property.sellerType.replaceAll("_", " ")}</p></div></div>
                <div className="mt-5 grid grid-cols-2 gap-2 text-xs text-slate-500"><span className="flex items-center gap-1.5"><Eye className="h-3.5 w-3.5" /> {property.views} views</span><span className="flex items-center gap-1.5"><BadgeCheck className="h-3.5 w-3.5 text-emerald-600" /> Local contact</span></div>
                <div className="mt-5 space-y-2"><a href={whatsappUrl} target="_blank" rel="noreferrer" className="btn-whatsapp flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-extrabold"><MessageCircle className="h-4 w-4" /> WhatsApp seller</a><a href={`tel:${property.sellerPhone}`} className="flex w-full items-center justify-center gap-2 rounded-xl bg-agri-green-50 py-3 text-sm font-extrabold text-agri-green hover:bg-agri-green-100"><Phone className="h-4 w-4" /> Call seller</a><a href={`mailto:info@paliaproperty.in?subject=Site visit: ${encodeURIComponent(property.title)}`} className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 py-3 text-sm font-extrabold text-slate-700 hover:border-agri-green hover:text-agri-green"><CalendarDays className="h-4 w-4" /> Request site visit</a></div>
              </div>

              <PropertyActions propertyId={property.id} title={property.title} />
              <div className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-3 text-xs font-semibold text-slate-500"><Route className="h-4 w-4" /> {property.roadFrontage} ft road</div>
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-900"><strong>Buyer note:</strong> Verify original ownership records, land use, boundaries, and registration requirements with an authorized professional before making a payment.</div>
            </aside>
          </div>

          {related.length > 0 && <section className="mt-12 border-t border-slate-200 pt-8"><div className="mb-5 flex items-end justify-between"><div><p className="text-xs font-bold uppercase tracking-wider text-harvest-gold-dark">More nearby</p><h2 className="mt-1 text-2xl font-black text-slate-950">Properties in {property.village}</h2></div><Link href={`/listings?village=${encodeURIComponent(property.village)}`} className="text-sm font-bold text-agri-green">View all</Link></div><div className="grid gap-5 md:grid-cols-3">{related.map(item => <AgriPropertyCard key={item.id} property={item} compact />)}</div></section>}
        </div>
      </main>
    </>
  );
}
