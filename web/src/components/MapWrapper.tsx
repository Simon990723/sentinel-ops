'use client';

import dynamic from 'next/dynamic';
import { Incident } from '@/lib/db';

// Move the dynamic import with ssr: false into a Client Component wrapper
const MapComponent = dynamic(() => import('@/components/IncidentMap'), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] w-full bg-slate-100 animate-pulse rounded-xl flex items-center justify-center text-slate-400">
      Loading Map Intelligence...
    </div>
  )
});

export default function MapWrapper({ incidents }: { incidents: Incident[] }) {
  return <MapComponent incidents={incidents} />;
}
