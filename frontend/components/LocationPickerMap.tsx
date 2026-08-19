"use client";
import { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapPin } from 'lucide-react';
import { useLanguage } from './LanguageContext';

const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

function LocationMarker({ position, setPosition }: { position: [number, number] | null, setPosition: (pos: [number, number]) => void }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  return position === null ? null : (
    <Marker position={position}></Marker>
  );
}

export default function LocationPickerMap({ 
  onSelect 
}: { 
  onSelect: (locationName: string, lat: number, lng: number) => void 
}) {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [loadingName, setLoadingName] = useState(false);
  const { t } = useLanguage();

  // Default to Dhaka
  const defaultCenter: [number, number] = [23.8103, 90.4125];

  const handleConfirm = async () => {
    if (!position) return;
    setLoadingName(true);
    try {
      const headers = { "User-Agent": "WayMark-Hackathon-App" };
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position[0]}&lon=${position[1]}`, { headers });
      const data = await response.json();
      
      let locationStr = "Unknown Location";
      if (data && data.address) {
        const parts = [
          data.address.road || data.address.suburb,
          data.address.city || data.address.town || data.address.village,
          data.address.country
        ].filter(Boolean);
        locationStr = parts.join(", ");
      } else if (data && data.display_name) {
        locationStr = data.display_name.split(",").slice(0, 3).join(", ");
      }
      
      onSelect(locationStr, position[0], position[1]);
    } catch (e) {
      console.error("Reverse geocoding failed", e);
      onSelect(`${position[0].toFixed(4)}, ${position[1].toFixed(4)}`, position[0], position[1]);
    } finally {
      setLoadingName(false);
    }
  };

  return (
    <div className="w-full h-[400px] flex flex-col relative z-0">
      <div className="flex-grow z-0 relative">
        <MapContainer center={defaultCenter} zoom={12} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />
          <LocationMarker position={position} setPosition={setPosition} />
        </MapContainer>
      </div>
      <div className="p-4 bg-white dark:bg-[#1A1825] border-t border-gray-200 dark:border-gray-800 flex justify-between items-center z-10">
        <p className="text-xs text-gray-500 font-mono">
          {position ? t("location_selected", "Location selected.") : t("click_to_pin", "Click on the map to place a pin.")}
        </p>
        <button 
          type="button"
          onClick={handleConfirm}
          disabled={!position || loadingName}
          className="neu-btn px-4 py-2 text-xs font-bold font-mono uppercase bg-[var(--color-primary)] text-white disabled:opacity-50 flex items-center gap-2 shadow-[4px_4px_8px_rgba(0,0,0,0.1),-4px_-4px_8px_rgba(255,255,255,0.7)]"
        >
          {loadingName ? t("getting_address", "Getting Address...") : (
            <>
              <MapPin className="w-4 h-4" />
              {t("confirm_location", "Confirm Location")}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
