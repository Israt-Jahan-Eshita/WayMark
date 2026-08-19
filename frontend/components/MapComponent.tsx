"use client";
import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useRouter } from 'next/navigation';
import { useLanguage } from './LanguageContext';

const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface BuildingData {
  id: string;
  name: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
  latest_score: string;
}

export default function MapComponent({ buildings }: { buildings: BuildingData[] }) {
  const router = useRouter();
  const { t } = useLanguage();

  const validBuildings = buildings.filter(b => b.latitude !== null && b.longitude !== null).map((b, i) => {
    // Add jitter so duplicate locations don't stack perfectly
    const latJitter = (Math.sin(i * 12.3) * 0.003);
    const lngJitter = (Math.cos(i * 45.6) * 0.003);
    return {
      ...b,
      renderLat: b.latitude! + latJitter,
      renderLng: b.longitude! + lngJitter
    };
  });

  const centerLat = validBuildings.length > 0 ? validBuildings[0].latitude! : 23.8103;
  const centerLng = validBuildings.length > 0 ? validBuildings[0].longitude! : 90.4125;

  return (
    <div className="w-full h-full min-h-[400px] z-0 relative">
      <MapContainer center={[centerLat, centerLng]} zoom={12} style={{ height: '400px', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        {validBuildings.map((building) => (
          <Marker 
            key={building.id} 
            position={[building.renderLat, building.renderLng]}
          >
            <Popup>
              <div className="font-sans text-center min-w-[150px]">
                <h3 className="font-bold text-[14px] mb-1">{building.name}</h3>
                <p className="text-[10px] text-gray-500 mb-2 font-mono">{building.location}</p>
                <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded font-bold font-mono text-[11px] mb-2 dark:text-white border dark:border-gray-600">
                  {t("score", "SCORE")}: {building.latest_score || t("not_available", "N/A")}
                </div>
                <button 
                  onClick={() => router.push(`/buildings/${building.id}`)}
                  className="bg-black text-white px-3 py-1.5 text-xs rounded hover:bg-gray-800 transition-colors w-full font-bold uppercase"
                >
                  {t("view_details", "View Details")}
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
