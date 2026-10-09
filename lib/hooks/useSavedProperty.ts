"use client";

import { useSyncExternalStore } from "react";

const STORAGE_KEY = "pph_saved_property_ids";
const CHANGE_EVENT = "pph:saved-properties-changed";
const EMPTY_SNAPSHOT = "[]";

function subscribe(listener: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(CHANGE_EVENT, listener);
  window.addEventListener("storage", listener);
  return () => {
    window.removeEventListener(CHANGE_EVENT, listener);
    window.removeEventListener("storage", listener);
  };
}

function getSnapshot() {
  try {
    return window.localStorage.getItem(STORAGE_KEY) ?? EMPTY_SNAPSHOT;
  } catch {
    return EMPTY_SNAPSHOT;
  }
}

function getServerSnapshot() {
  return EMPTY_SNAPSHOT;
}

export function useSavedProperty(propertyId: string) {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  try {
    const ids = JSON.parse(snapshot) as unknown;
    return Array.isArray(ids) && ids.includes(propertyId);
  } catch {
    return false;
  }
}

export function toggleSavedProperty(propertyId: string) {
  if (typeof window === "undefined") return;

  let ids: string[] = [];
  try {
    const stored = JSON.parse(getSnapshot()) as unknown;
    if (Array.isArray(stored)) ids = stored.filter((id): id is string => typeof id === "string");
  } catch {
    ids = [];
  }

  const next = ids.includes(propertyId)
    ? ids.filter(id => id !== propertyId)
    : [...ids, propertyId];

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(CHANGE_EVENT));
  } catch {
    return;
  }
}