"use client";

import { useEffect, useRef } from "react";
import { MapPin } from "lucide-react";
import { mockProperties } from "@/lib/data/properties";
import { fetchProperties } from "@/lib/api/client";
import { formatPrice, formatArea } from "@/lib/utils/conversions";

// Leaflet is only loaded client-side
export default function MapComponent() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;
    let cancelled = false;

    // Dynamically import leaflet
    void (async () => {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");

      // Fix default icon paths
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      if (cancelled || !mapRef.current || mapInstanceRef.current) return;

      const liveProperties = await fetchProperties().catch(() => []);
      if (cancelled) return;
      const properties = liveProperties.length > 0 ? liveProperties : mockProperties;

      // Palia Kalan center coordinates
      const map = L.map(mapRef.current, {
        center: [28.433, 80.589],
        zoom: 11,
        scrollWheelZoom: false,
        zoomControl: true,
      });

      mapInstanceRef.current = map;

      // OpenStreetMap tiles
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      // Category color map
      const categoryColors: Record<string, string> = {
        sugarcane_farm: "#0F5132",
        paddy_wheat: "#D97706",
        mango_orchard: "#EA580C",
        farmhouse_resort: "#0D9488",
        dairy_poultry: "#0284C7",
        highway_investment: "#475569",
        residential_plot: "#7C3AED",
        commercial_land: "#DC2626",
        poplar_plantation: "#65A30D",
        fish_farm: "#0891B2",
      };

      // Add property markers
      properties.forEach((property) => {
        const color = categoryColors[property.category] ?? "#0F5132";

        const customIcon = L.divIcon({
          html: `
            <div style="
              width: 36px; height: 36px;
              background: ${color};
              border-radius: 50% 50% 50% 0;
              transform: rotate(-45deg);
              border: 2px solid white;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              display: flex; align-items: center; justify-content: center;
            ">
              <div style="
                transform: rotate(45deg);
                font-size: 14px; line-height: 1;
                color: white; font-weight: bold;
              ">₹</div>
            </div>
          `,
          className: "custom-map-marker",
          iconSize: [36, 36],
          iconAnchor: [18, 36],
          popupAnchor: [0, -36],
        });

        const areaDisplay = formatArea(property.area, property.areaUnit);
        const priceDisplay = formatPrice(property.price, true);

        const popupContent = `
          <div style="font-family: Inter, system-ui, sans-serif; min-width: 220px; max-width: 260px;">
            <div style="background: ${color}; color: white; padding: 10px 12px; margin: -12px -12px 10px; border-radius: 8px 8px 0 0;">
              <div style="font-size: 11px; opacity: 0.8; text-transform: uppercase; letter-spacing: 0.05em;">${property.category.replace(/_/g, " ")}</div>
              <div style="font-weight: 700; font-size: 14px; margin-top: 2px;">${priceDisplay}</div>
            </div>
            <div style="padding: 0 4px;">
              <div style="font-weight: 600; font-size: 13px; color: #1e293b; margin-bottom: 6px; line-height: 1.3;">${property.title}</div>
              <div style="display: flex; gap: 8px; margin-bottom: 8px; flex-wrap: wrap;">
                <span style="background: #f0fdf4; color: #0f5132; font-size: 11px; padding: 2px 8px; border-radius: 20px; font-weight: 600; border: 1px solid #bbf7d0;">${areaDisplay}</span>
                <span style="background: #f1f5f9; color: #475569; font-size: 11px; padding: 2px 8px; border-radius: 20px;">${property.village}</span>
              </div>
              <div style="font-size: 11px; color: #64748b; margin-bottom: 8px;">📍 ${property.location}</div>
              <a
                href="https://wa.me/${property.sellerPhone.replace(/\D/g, "")}?text=${encodeURIComponent(`Hi, interested in: ${property.title}`)}"
                target="_blank"
                style="display: block; background: #25D366; color: white; text-align: center; padding: 6px; border-radius: 8px; font-size: 12px; font-weight: 600; text-decoration: none;"
              >
                💬 WhatsApp Seller
              </a>
            </div>
          </div>
        `;

        L.marker([property.coordinates.lat, property.coordinates.lng], { icon: customIcon })
          .addTo(map)
          .bindPopup(popupContent, {
            maxWidth: 280,
            className: "custom-popup",
          });
      });

      const villageCoordinates = new Map<string, { lat: number; lng: number }>();
      properties.forEach(property => {
        if (!villageCoordinates.has(property.village)) villageCoordinates.set(property.village, property.coordinates);
      });

      villageCoordinates.forEach(({ lat, lng }, name) => {
        L.marker([lat, lng], {
          icon: L.divIcon({
            html: `<div style="background: rgba(255,255,255,0.9); border: 1px solid #e2e8f0; padding: 3px 8px; border-radius: 20px; font-size: 10px; font-weight: 600; color: #334155; white-space: nowrap; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">${name}</div>`,
            className: "",
            iconAnchor: [40, 10],
          }),
          interactive: false,
        }).addTo(map);
      });
    })();

    return () => {
      cancelled = true;
      if (mapInstanceRef.current) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (mapInstanceRef.current as any).remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
      <div ref={mapRef} className="w-full h-full" />

      {/* Legend overlay */}
      <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm rounded-xl p-3 shadow-md border border-slate-100 z-[1000]">
        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-2">Map Legend</p>
        <div className="space-y-1">
          {[
            { color: "#0F5132", label: "Sugarcane Farm" },
            { color: "#D97706", label: "Paddy / Wheat" },
            { color: "#0D9488", label: "Farmhouse / Resort" },
            { color: "#475569", label: "Highway Land" },
            { color: "#7C3AED", label: "Residential Plot" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-1.5">
              <div
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-[10px] text-slate-600">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Property count badge */}
      <div className="absolute top-3 right-3 bg-agri-green text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md z-[1000] flex items-center gap-1.5">
        <MapPin className="w-3 h-3" />
        {mockProperties.length} Properties
      </div>
    </div>
  );
}
