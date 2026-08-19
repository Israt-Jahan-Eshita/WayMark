"use client";
import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';

const DynamicMap = dynamic(() => import('./MapComponent'), { 
  ssr: false,
  loading: () => <div className="w-full h-full min-h-[400px] bg-[#EBEBEB] dark:bg-[#1A1825] animate-pulse rounded-xl shadow-inner flex items-center justify-center font-mono text-sm text-[var(--text-secondary)]">Loading Map...</div>
});

interface BuildingData {
  id: string;
  name: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
  latest_score: string;
}

export default function MapWrapper({ buildings }: { buildings: BuildingData[] }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-full h-full min-h-[400px] bg-[#EBEBEB] dark:bg-[#1A1825] animate-pulse rounded-xl shadow-inner flex items-center justify-center font-mono text-sm text-[var(--text-secondary)]">Loading Map...</div>;
  }

  return (
    <div className="w-full h-full min-h-[400px] rounded-xl overflow-hidden border border-[var(--color-primary)]/20 shadow-[8px_8px_16px_rgba(0,0,0,0.1),-8px_-8px_16px_rgba(255,255,255,0.7)] dark:shadow-[8px_8px_16px_rgba(0,0,0,0.5),-8px_-8px_16px_rgba(255,255,255,0.05)] z-0 relative">
      <DynamicMap buildings={buildings} />
    </div>
  );
}
