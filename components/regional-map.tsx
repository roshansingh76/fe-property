"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

// Dynamically import the actual map to avoid SSR issues with Leaflet
const MapComponent = dynamic(() => import("@/components/map-component"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[400px] bg-agri-green-50 rounded-2xl flex items-center justify-center border border-agri-green-200">
      <div className="flex flex-col items-center gap-3 text-agri-green">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="text-sm font-medium">Loading Map...</span>
      </div>
    </div>
  ),
});

interface RegionalMapProps {
  className?: string;
  height?: string;
}

export function RegionalMap({ className, height = "480px" }: RegionalMapProps) {
  return (
    <div className={className} style={{ height }}>
      <MapComponent />
    </div>
  );
}
