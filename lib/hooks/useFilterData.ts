"use client";

/**
 * Shared hook that fetches property types and locations once,
 * module-level cache avoids duplicate requests across components.
 */

import { useEffect, useState } from "react";
import { fetchPropertyTypes, fetchLocations } from "@/lib/api/client";
import type { PublicPropertyType, AdminLocation } from "@/lib/api/client";

// ── module-level cache so all consumers share one fetch ───────────────────────

let cachedTypes: PublicPropertyType[] | null = null;
let cachedLocations: AdminLocation[] | null = null;
let fetchPromise: Promise<void> | null = null;

async function loadOnce() {
  if (cachedTypes && cachedLocations) return;
  if (fetchPromise) return fetchPromise;
  fetchPromise = Promise.all([
    fetchPropertyTypes().then(t => { cachedTypes = t; }),
    fetchLocations().then(l => { cachedLocations = l; }),
  ]).then(() => { fetchPromise = null; });
  return fetchPromise;
}

// ── exported types ────────────────────────────────────────────────────────────

export type FilterLocation = Pick<AdminLocation, "id" | "name" | "type">;

export interface FilterData {
  types: PublicPropertyType[];
  locations: FilterLocation[];
  loading: boolean;
}

// ── hook ─────────────────────────────────────────────────────────────────────

export function useFilterData(): FilterData {
  const [data, setData] = useState<{ types: PublicPropertyType[]; locations: FilterLocation[] }>({
    types: cachedTypes ?? [],
    locations: cachedLocations
      ? cachedLocations.filter(l => ["CITY", "VILLAGE"].includes(l.type))
      : [],
  });
  const [loading, setLoading] = useState(!cachedTypes || !cachedLocations);

  useEffect(() => {
    if (cachedTypes && cachedLocations) return;
    void loadOnce().then(() => {
      setData({
        types: cachedTypes ?? [],
        locations: (cachedLocations ?? []).filter(l => ["CITY", "VILLAGE"].includes(l.type)),
      });
      setLoading(false);
    });
  }, []);

  return { ...data, loading };
}

// ── helper: convert PropertyType.key to backend enum value ───────────────────
// PropertyType keys are lowercase_underscore; backend enum is UPPER_UNDERSCORE

export function typeKeyToEnum(key: string): string {
  return key.toUpperCase();
}
