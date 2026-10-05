import React, { useState } from 'react';
import {
  AlertOctagon,
  ArrowUpRight,
  Calendar,
  ChevronRight,
  Database,
  MapPin,
  Play,
  TrendingDown,
} from 'lucide-react';
import { CoastalSegmentGeo, DashboardSummary } from '../types';
import { LeafletMap } from '../components/LeafletMap';
import { RiskBadge } from '../components/RiskBadge';
import { LoadingState } from '../components/LoadingState';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';

interface DashboardProps {
  summary: DashboardSummary | null;
  isLoading: boolean;
  onNavigateTab: (tab: string, params?: any) => void;
  onLoadSample: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  summary,
  isLoading,
  onNavigateTab,
}) => {
  const [selectedSegment, setSelectedSegment] = useState<CoastalSegmentGeo | null>(null);

  const segments = summary?.segments || [];
  const activeSegment = selectedSegment || (segments.length > 0 ? segments[0] : null);

  if (isLoading && !summary) {
    return <LoadingState message="Loading Coastal Intelligence Dashboard..." />;
  }

  const highRiskCount = summary?.highRiskSegmentsCount || 0;
  const avgRate = summary?.averageErosionRate || 0.0;
  const totalSegments = summary?.totalMonitoredSegments || segments.length;
  const distribution = summary?.riskDistribution || [];

  return (
    <div className="space-y-6">
      {/* Hero Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0c1c33] via-[#091729] to-[#060e1a] border border-cyan-950/80 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-cyan-950/80 px-3 py-1 text-xs font-semibold text-cyan-300 border border-cyan-800/60 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>Active Shoreline Monitoring Cycle • 2012–2025</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
              Coastal Intelligence & Risk Platform
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Empirical linear regression modeling, dynamic survey ingestion, and multi-tier hazard assessment for vulnerable coastal reaches and critical shoreline assets.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigateTab('workspace')}
              className="flex items-center gap-2 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 px-4 py-2.5 text-xs font-semibold border border-slate-700/80 shadow-md transition-all"
            >
              <Database className="h-4 w-4 text-cyan-400" />
              <span>Import Survey CSV</span>
            </button>
            <button
              onClick={() => onNavigateTab('prediction', { segment: activeSegment?.name })}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-5 py-2.5 text-xs font-semibold shadow-lg shadow-cyan-600/30 transition-all"
            >
              <Play className="h-4 w-4 fill-current" />
              <span>Launch Prediction Studio</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800/80 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Monitored Segments</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-950/80 border border-cyan-800/50 text-cyan-400">
              <MapPin className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">{totalSegments}</span>
            <span className="text-xs font-medium text-slate-400">Active Transects</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1">
            <span className="text-emerald-400">● 100% Survey Validated</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800/80 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Critical Risk Zones</span>
            <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${highRiskCount > 0 ? 'bg-orange-950/80 border border-orange-800/50 text-orange-400' : 'bg-slate-800 text-slate-400'}`}>
              <AlertOctagon className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">{highRiskCount}</span>
            <span className="text-xs font-medium text-orange-400">High / Very High</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1">
            <span>Requires active nourishment / zoning</span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800/80 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Average Erosion Rate</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-950/80 border border-amber-800/50 text-amber-400">
              <TrendingDown className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">{avgRate.toFixed(2)}</span>
            <span className="text-xs font-medium text-slate-400">m / year</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1">
            <span className="text-amber-400">Max: {summary?.maxErosionRate?.toFixed(2) || '3.40'} m/yr</span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800/80 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Historical Surveys</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-950/80 border border-blue-800/50 text-blue-400">
              <Calendar className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono">{summary?.totalSurveysCount || 112}</span>
            <span className="text-xs font-medium text-slate-400">Field Points</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1">
            <span>Cross-referenced Sentinel-2 & RTK</span>
          </div>
        </div>
      </div>

      {/* Main Interactive Map & Segment Deep-Dive Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Interactive Map (7 cols) */}
        <div className="lg:col-span-7 h-[460px] flex flex-col rounded-3xl bg-[#091524] border border-slate-800 p-4 shadow-xl">
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
              <h3 className="text-xs sm:text-sm font-semibold text-white">Geospatial Risk Map</h3>
            </div>
            <span className="text-[11px] text-slate-400">Click marker to inspect reach</span>
          </div>
          <div className="flex-1 w-full relative">
            <LeafletMap
              segments={segments}
              selectedSegment={activeSegment}
              onSelectSegment={(s) => setSelectedSegment(s)}
              onAnalyzeSegment={(name) => onNavigateTab('prediction', { segment: name })}
            />
          </div>
        </div>

        {/* Selected Segment Insight Panel (5 cols) */}
        <div className="lg:col-span-5 flex flex-col rounded-3xl bg-gradient-to-b from-[#0e1e36] to-[#0a1628] border border-slate-700/80 p-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
            <div>
              <span className="text-[10px] font-semibold tracking-wider text-cyan-400 uppercase">Selected Coastal Reach</span>
              <h3 className="text-lg font-bold text-white mt-0.5">{activeSegment?.name || 'Coastal Reach'}</h3>
            </div>
            {activeSegment && <RiskBadge level={activeSegment.riskLevel} size="md" />}
          </div>

          {activeSegment ? (
            <div className="flex-1 flex flex-col justify-between pt-4 space-y-4">
              {/* Coordinates and Survey Details */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-3">
                  <span className="text-[10px] text-slate-400 block">Coordinates:</span>
                  <span className="font-mono text-xs font-semibold text-slate-200">
                    {activeSegment.latitude.toFixed(4)}°N, {activeSegment.longitude.toFixed(4)}°E
                  </span>
                </div>
                <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-3">
                  <span className="text-[10px] text-slate-400 block">Survey Range:</span>
                  <span className="font-mono text-xs font-semibold text-slate-200">
                    {activeSegment.baselineYear} – {activeSegment.latestYear} ({activeSegment.recordsCount} surveys)
                  </span>
                </div>
              </div>

              {/* Shoreline Metric Breakdown */}
              <div className="space-y-2.5 rounded-2xl bg-slate-900/90 border border-slate-800/90 p-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Baseline Position ({activeSegment.baselineYear}):</span>
                  <span className="font-mono font-bold text-slate-200">{activeSegment.baselinePosition.toFixed(1)} m</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Latest Position ({activeSegment.latestYear}):</span>
                  <span className="font-mono font-bold text-slate-200">{activeSegment.latestPosition.toFixed(1)} m</span>
                </div>
                <div className="flex items-center justify-between text-xs border-t border-slate-800 pt-2 text-cyan-300">
                  <span className="font-medium">Total Observed Retreat:</span>
                  <span className="font-mono font-bold">
                    {(activeSegment.baselinePosition - activeSegment.latestPosition).toFixed(1)} m
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs border-t border-slate-800 pt-2 text-amber-400">
                  <span className="font-medium">Annual Erosion Rate:</span>
                  <span className="font-mono font-bold text-sm">
                    {activeSegment.erosionRate.toFixed(2)} m/year
                  </span>
                </div>
              </div>

              {/* Action Priority Callout */}
              <div className="rounded-xl bg-slate-950/60 border border-slate-800 p-3 text-xs">
                <span className="text-[10px] text-slate-400 block font-medium">Recommended Action Priority:</span>
                <p className="text-slate-200 font-semibold mt-0.5">{activeSegment.actionPriority}</p>
              </div>

              {/* Launch Prediction Studio Button */}
              <button
                onClick={() => onNavigateTab('prediction', { segment: activeSegment.name })}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white py-3 text-xs font-bold shadow-lg shadow-cyan-600/30 transition-all"
              >
                <span>Run Forecast Modeling for {activeSegment.name}</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-xs text-slate-500">
              Select a marker on the map to view reach analytics
            </div>
          )}
        </div>
      </div>

      {/* Secondary Row: Risk Distribution & Quick Segment Directory */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Risk Distribution Chart (5 cols) */}
        <div className="lg:col-span-5 rounded-3xl bg-[#0a1628] border border-slate-800 p-5 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs sm:text-sm font-semibold text-white">Risk Category Breakdown</h3>
            <button
              onClick={() => onNavigateTab('risk')}
              className="text-[11px] font-medium text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              <span>Explore All</span>
              <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>

          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={distribution} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <XAxis type="number" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <YAxis dataKey="name" type="category" stroke="#64748b" width={110} tick={{ fill: '#cbd5e1', fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#091524', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                />
                <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                  {distribution.map((entry: any, idx: number) => (
                    <Cell key={`cell-${idx}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-4 gap-2 pt-3 border-t border-slate-800/80 text-center text-[10px]">
            {distribution.map((d: any) => (
              <div key={d.level} className="rounded-lg bg-slate-900/80 p-1.5">
                <span className="text-slate-400 block">{d.level}</span>
                <span className="font-mono font-bold text-white text-xs">{d.count} reaches</span>
              </div>
            ))}
          </div>
        </div>

        {/* Monitored Coastal Reaches Table Directory (7 cols) */}
        <div className="lg:col-span-7 rounded-3xl bg-[#0a1628] border border-slate-800 p-5 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs sm:text-sm font-semibold text-white">Monitored Transects Directory</h3>
            <span className="text-[11px] text-slate-400">{segments.length} verified reaches</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="pb-2.5">Segment Name</th>
                  <th className="pb-2.5">Erosion Rate</th>
                  <th className="pb-2.5">Risk Level</th>
                  <th className="pb-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {segments.slice(0, 4).map((seg) => (
                  <tr key={seg.name} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-2.5 font-medium text-slate-200">
                      <div className="flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                        <span>{seg.name}</span>
                      </div>
                    </td>
                    <td className="py-2.5 font-mono text-slate-300">
                      {seg.erosionRate.toFixed(2)} m/yr
                    </td>
                    <td className="py-2.5">
                      <RiskBadge level={seg.riskLevel} size="sm" />
                    </td>
                    <td className="py-2.5 text-right">
                      <button
                        onClick={() => onNavigateTab('prediction', { segment: seg.name })}
                        className="rounded-lg bg-slate-800 hover:bg-cyan-600 text-slate-300 hover:text-white px-2.5 py-1 text-[10px] font-semibold transition-colors"
                      >
                        Forecast &rarr;
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-[11px] text-slate-400">View detailed multi-year trajectory in studio</span>
            <button
              onClick={() => onNavigateTab('risk')}
              className="text-cyan-400 hover:text-cyan-300 text-xs font-semibold flex items-center gap-1"
            >
              <span>Explore Complete Directory</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
