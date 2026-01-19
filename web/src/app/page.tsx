import { getLatestIncidents, Incident } from '@/lib/db';
import MapWrapper from '@/components/MapWrapper';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Activity, AlertTriangle, Gauge, MapPin } from 'lucide-react';

export const revalidate = 60;

// Helper for Status Colors
function getStatusColor(type: string, score: number = 0) {
  if (score > 7) return 'bg-red-500/10 text-red-600 border-red-200 dark:border-red-900/50 dark:text-red-400';
  if (type.toLowerCase().includes('breakdown')) return 'bg-amber-500/10 text-amber-600 border-amber-200 dark:border-amber-900/50 dark:text-amber-400';
  return 'bg-blue-500/10 text-blue-600 border-blue-200 dark:border-blue-900/50 dark:text-blue-400';
}

export default async function Page() {
  const incidents: Incident[] = await getLatestIncidents();
  
  const highImpactCount = incidents.filter(i => (i.impact_score || 0) > 7).length;
  const avgScore = incidents.length > 0 
    ? (incidents.reduce((acc, curr) => acc + (curr.impact_score || 0), 0) / incidents.length).toFixed(1)
    : "0.0";

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-100 via-slate-50 to-white dark:from-slate-900 dark:via-slate-950 dark:to-black transition-colors duration-300">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-600/20">
                <Activity className="text-white" size={24} />
              </div>
              <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Sentinel<span className="text-blue-600 dark:text-blue-500">Ops</span>
              </h1>
            </div>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-lg">
              Real-time urban transit intelligence powered by <span className="font-semibold text-slate-900 dark:text-slate-200">Generative AI</span>.
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex gap-4">
               {/* Stat Card 1 */}
               <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-md px-6 py-3 rounded-2xl shadow-sm border border-white/20 dark:border-slate-800 flex flex-col items-center min-w-[120px]">
                 <div className="flex items-center gap-2 mb-1">
                   <AlertTriangle size={14} className="text-red-500" />
                   <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Critical</span>
                 </div>
                 <span className="text-3xl font-black text-slate-900 dark:text-white">{highImpactCount}</span>
               </div>
               
               {/* Stat Card 2 */}
               <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-md px-6 py-3 rounded-2xl shadow-sm border border-white/20 dark:border-slate-800 flex flex-col items-center min-w-[120px]">
                 <div className="flex items-center gap-2 mb-1">
                   <Gauge size={14} className="text-blue-500" />
                   <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Avg Impact</span>
                 </div>
                 <span className="text-3xl font-black text-slate-900 dark:text-white">{avgScore}</span>
               </div>
            </div>
            <div className="h-12 w-px bg-slate-200 dark:bg-slate-800 mx-2"></div>
            <ThemeToggle />
          </div>
        </header>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Left Column: Map (Spans 2 cols) */}
          <section className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <MapPin size={20} className="text-blue-500" />
                Live Geospatial View
              </h2>
              <span className="px-3 py-1 bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-bold rounded-full animate-pulse border border-green-500/20">
                ● Live Updates
              </span>
            </div>
            <MapWrapper incidents={incidents} />
          </section>

          {/* Right Column: Feed */}
          <section className="lg:col-span-1 space-y-4">
             <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Activity size={20} className="text-violet-500" />
                Incident Feed
              </h2>
            
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {incidents.length === 0 ? (
                <div className="p-8 text-center bg-white/50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-slate-400">
                  <div className="animate-spin mb-2 mx-auto w-6 h-6 border-2 border-slate-400 border-t-transparent rounded-full"></div>
                  System Online. Scanning...
                </div>
              ) : (
                incidents.map((inc) => (
                  <div 
                    key={inc.id} 
                    className="group bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm p-5 rounded-2xl shadow-sm border border-white/50 dark:border-slate-800 hover:shadow-md hover:scale-[1.02] transition-all duration-200"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${getStatusColor(inc.type, inc.impact_score)}`}>
                        {inc.type}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        {new Date(inc.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                    
                    <p className="text-sm text-slate-800 dark:text-slate-200 font-medium leading-relaxed mb-3">
                      {inc.message}
                    </p>

                    {inc.ai_analysis && (
                      <div className="relative mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                        <div className="absolute top-3 left-0 w-0.5 h-full bg-gradient-to-b from-blue-500 to-violet-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 italic pl-2">
                          <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600 dark:from-blue-400 dark:to-violet-400 not-italic">
                            AI Analysis: 
                          </span>
                          {" "}{inc.ai_analysis}
                        </p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}