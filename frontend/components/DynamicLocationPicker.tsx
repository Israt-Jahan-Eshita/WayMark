"use client";
import dynamic from 'next/dynamic';

const DynamicLocationPicker = dynamic(() => import('./LocationPickerMap'), { 
  ssr: false,
  loading: () => <div className="w-full h-[400px] bg-[#EBEBEB] dark:bg-[#1A1825] animate-pulse rounded-xl shadow-inner flex items-center justify-center font-mono text-sm text-[var(--text-secondary)]">Loading Map...</div>
});

export default DynamicLocationPicker;
