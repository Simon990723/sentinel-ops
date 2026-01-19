'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Incident } from '@/lib/db';
import { useTheme } from 'next-themes';

// Singapore coordinates
const SG_CENTER: [number, number] = [1.3521, 103.8198];

export default function IncidentMap({ incidents }: { incidents: Incident[] }) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme(); // Get current theme

  // Handle map initialization and cleanup
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current).setView(SG_CENTER, 11);
    mapRef.current = map;

    // We start with a default layer, the effect below will switch it
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Handle Theme Switching (Tile Layer) & Markers
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    // 1. Google Maps Layer (Standard Roadmap)
    // Note: This accesses Google Tiles directly for the demo visual. 
    // For a commercial production app, you should use the official Google Maps API.
    const tileUrl = 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}';
    
    // Clear existing tile layers to avoid stacking
    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    L.tileLayer(tileUrl, {
      attribution: '&copy; Google Maps',
      maxZoom: 20
    }).addTo(map);

    // 2. Re-add Markers (Need to re-add because we might want different styles, 
    // although for now we just keep them on top)
    // Clear existing markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    // Custom Icons
    const defaultIcon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41]
    });

    const highImpactIcon = L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    incidents.forEach(inc => {
      const marker = L.marker([inc.latitude, inc.longitude], {
        icon: (inc.impact_score || 0) > 7 ? highImpactIcon : defaultIcon
      }).addTo(map);

      // Popup content (Always use dark text since map background is white)
      const popupContent = `
        <div class="text-sm text-slate-900">
          <strong class="block mb-1 text-base">${inc.type}</strong>
          <p class="mb-2 opacity-80">${inc.message}</p>
          ${inc.impact_score ? `
            <div class="flex items-center gap-2 mt-2 pt-2 border-t border-slate-200">
              <span class="px-2 py-0.5 rounded text-xs font-bold text-white ${inc.impact_score > 7 ? 'bg-red-600' : 'bg-blue-600'}">
                Impact: ${inc.impact_score}/10
              </span>
            </div>
          ` : ''}
        </div>
      `;

      marker.bindPopup(popupContent);
    });

  }, [theme, incidents]); // Re-run when theme or incidents change

  return (
    <div 
      ref={containerRef} 
      className="h-[500px] w-full rounded-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 z-0 transition-all duration-300"
    />
  );
}