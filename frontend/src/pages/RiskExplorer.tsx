import React, { useState } from 'react';
import {
  ArrowUpDown,
  Check,
  MapPin,
  Search,
  Sliders,
} from 'lucide-react';
import { CoastalSegmentGeo, RiskLevel, RiskThresholds } from '../types';
import { RiskBadge } from '../components/RiskBadge';
import { LeafletMap } from '../components/LeafletMap';

interface RiskExplorerProps {
  segments: CoastalSegmentGeo[];
  currentThresholds: RiskThresholds;
  onUpdateThresholds: (thresholds: RiskThresholds) => Promise<void>;
  onNavigateTab: (tab: string, params?: any) => void;
}

export const RiskExplorer: React.FC<RiskExplorerProps> = ({
  segments,
  currentThresholds,
  onUpdateThresholds,
  onNavigateTab,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<RiskLevel | 'ALL'>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortField, setSortField] = useState<'name' | 'erosionRate' | 'latestPosition'>('erosionRate');
  const [sortAsc, setSortAsc] = useState<boolean>(false);
  const [selectedSegment, setSelectedSegment] = useState<CoastalSegmentGeo | null>(segments[0] || null);

  // Live threshold tuning state inside Explorer
  const [lowMax, setLowMax] = useState<number>(currentThresholds.low_max || 1.0);
  const [modMax, setModMax] = useState<number>(currentThresholds.moderate_max || 2.0);
  const [highMax, setHighMax] = useState<number>(currentThresholds.high_max || 3.0);
  const [isSavingTh, setIsSavingTh] = useState<boolean>(false);

  React.useEffect(() => {
    setLowMax(currentThresholds.low_max || 1.0);
    setModMax(currentThresholds.moderate_max || 2.0);
    setHighMax(currentThresholds.high_max || 3.0);
  }, [currentThresholds]);

  // Recalculate dynamic segment risk levels based on live slider values
  const evaluatedSegments = segments.map((seg) => {
    const rate = Math.abs(seg.erosionRate);
    let level: RiskLevel = 'LOW';
    let color = '#0d9488';
    let action = 'Routine Annual Monitoring';

    if (rate < lowMax) {
      level = 'LOW';
      color = '#0d9488';
      action = 'Routine Annual Monitoring';
    } else if (rate < modMax) {
      level = 'MODERATE';
      color = '#d97706';
      action = 'Active Monitoring & Dune Restoration';
    } else if (rate < highMax) {
      level = 'HIGH';
      color = '#ea580c';
      action = 'Targeted Mitigation & Beach Nourishment';
    } else {
      level = 'VERY_HIGH';
      color = '#dc2626';
      action = 'Immediate Structural Intervention & Emergency Planning';
    }

    return {
      ...seg,
      riskLevel: level,
      riskColor: color,
      actionPriority: action,
    };
  });

  // Filter and sort
  const filteredSegments = evaluatedSegments
    .filter((s) => {
      const matchFilter = selectedFilter === 'ALL' || s.riskLevel === selectedFilter;
      const matchSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchFilter && matchSearch;
    })
    .sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];
      if (typeof valA === 'string') {
        return sortAsc ? valA.localeCompare(valB as string) : (valB as string).localeCompare(valA);
      }
      return sortAsc ? (valA as number) - (valB as number) : (valB as number) - (valA as number);
    });

  const handleApplyThresholds = async () => {
    setIsSavingTh(true);
    try {
      await onUpdateThresholds({
        low_max: Number(lowMax),
        moderate_max: Number(modMax),
        high_max: Number(highMax),
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingTh(false);
    }
  };

  const counts = {
    LOW: evaluatedSegments.filter((s) => s.riskLevel === 'LOW').length,
    MODERATE: evaluatedSegments.filter((s) => s.riskLevel === 'MODERATE').length,
    HIGH: evaluatedSegments.filter((s) => s.riskLevel === 'HIGH').length,
    VERY_HIGH: evaluatedSegments.filter((s) => s.riskLevel === 'VERY_HIGH').length,
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">Module 3 Engine</span>
            <span className="rounded bg-cyan-950 px-2 py-0.5 text-[10px] font-mono text-cyan-300 border border-cyan-800/40">
              Configurable Risk Threshold Rules
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">Risk Explorer</h1>
          <p className="text-xs text-slate-400">
            Dynamically adjust classification thresholds, filter coastal reaches by hazard level, and review structural mitigation guidelines.
          </p>
        </div>

        {/* Filter Badges */}
        <div className="flex flex-wrap items-center gap-1.5 bg-[#0c1829] p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setSelectedFilter('ALL')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
              selectedFilter === 'ALL' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All ({evaluatedSegments.length})
          </button>
          <button
            onClick={() => setSelectedFilter('LOW')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
              selectedFilter === 'LOW' ? 'bg-emerald-600 text-white' : 'text-emerald-400/80 hover:text-emerald-300'
            }`}
          >
            Low ({counts.LOW})
          </button>
          <button
            onClick={() => setSelectedFilter('MODERATE')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
              selectedFilter === 'MODERATE' ? 'bg-amber-600 text-white' : 'text-amber-400/80 hover:text-amber-300'
            }`}
          >
            Moderate ({counts.MODERATE})
          </button>
          <button
            onClick={() => setSelectedFilter('HIGH')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
              selectedFilter === 'HIGH' ? 'bg-orange-600 text-white' : 'text-orange-400/80 hover:text-orange-300'
            }`}
          >
            High ({counts.HIGH})
          </button>
          <button
            onClick={() => setSelectedFilter('VERY_HIGH')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
              selectedFilter === 'VERY_HIGH' ? 'bg-red-600 text-white' : 'text-red-400/80 hover:text-red-300'
            }`}
          >
            Very High ({counts.VERY_HIGH})
          </button>
        </div>
      </div>

      {/* Threshold Configuration Card */}
      <div className="rounded-3xl bg-[#0a1628] border border-slate-800 p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800">
              <Sliders className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Live Decision Threshold Tuning</h3>
              <p className="text-[11px] text-slate-400">Sliders re-evaluate all coastal transects in real time</p>
            </div>
          </div>
          <button
            onClick={handleApplyThresholds}
            disabled={isSavingTh}
            className="flex items-center gap-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white px-3.5 py-1.5 text-xs font-bold shadow-md shadow-cyan-600/30 transition-all disabled:opacity-50"
          >
            <Check className="h-3.5 w-3.5" />
            <span>{isSavingTh ? 'Saving...' : 'Persist Thresholds to Database'}</span>
          </button>
        </div>

        {/* Sliders Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          {/* Low Threshold */}
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-emerald-400">Low Limit</span>
              <span className="font-mono font-bold text-white">&lt; {lowMax} m/yr</span>
            </div>
            <input
              type="range"
              min="0.2"
              max="2.0"
              step="0.1"
              value={lowMax}
              onChange={(e) => setLowMax(parseFloat(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <span className="text-[10px] text-slate-500 block">Default demonstration: &lt; 1.0 m/yr</span>
          </div>

          {/* Moderate Threshold */}
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-amber-400">Moderate Limit</span>
              <span className="font-mono font-bold text-white">{lowMax} – {modMax} m/yr</span>
            </div>
            <input
              type="range"
              min={lowMax + 0.1}
              max="3.5"
              step="0.1"
              value={modMax}
              onChange={(e) => setModMax(parseFloat(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <span className="text-[10px] text-slate-500 block">Default demonstration: 1.0 to 2.0 m/yr</span>
          </div>

          {/* High / Very High Threshold */}
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-orange-400">High / V.High Limit</span>
              <span className="font-mono font-bold text-white">{modMax} – {highMax} m/yr</span>
            </div>
            <input
              type="range"
              min={modMax + 0.1}
              max="5.0"
              step="0.1"
              value={highMax}
              onChange={(e) => setHighMax(parseFloat(e.target.value))}
              className="w-full accent-orange-500 cursor-pointer"
            />
            <span className="text-[10px] text-slate-500 block">Default demonstration: 2.0 to 3.0 m/yr (V.High &ge;3m)</span>
          </div>
        </div>
      </div>

      {/* Map & Reaches Table Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Geospatial Map (5 cols) */}
        <div className="lg:col-span-5 h-[460px] rounded-3xl bg-[#091524] border border-slate-800 p-4 shadow-xl flex flex-col">
          <div className="flex items-center justify-between mb-2 px-1">
            <h3 className="text-xs sm:text-sm font-semibold text-white">Risk Map Overview</h3>
            <span className="text-[10px] text-slate-400">{filteredSegments.length} Reaches Plotted</span>
          </div>
          <div className="flex-1 w-full relative">
            <LeafletMap
              segments={filteredSegments}
              selectedSegment={selectedSegment}
              onSelectSegment={(s) => setSelectedSegment(s)}
              onAnalyzeSegment={(name) => onNavigateTab('prediction', { segment: name })}
            />
          </div>
        </div>

        {/* Filterable Table (7 cols) */}
        <div className="lg:col-span-7 rounded-3xl bg-[#0a1628] border border-slate-800 p-6 shadow-xl flex flex-col justify-between h-[460px]">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white">Evaluated Coastal Segments</h3>
              <div className="relative">
                <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search reach..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="rounded-xl bg-slate-900 border border-slate-800 pl-8 pr-3 py-1 text-xs text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none w-44"
                />
              </div>
            </div>

            <div className="mt-3 overflow-y-auto max-h-[320px] pr-1">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] text-slate-400 font-semibold uppercase">
                    <th
                      className="pb-2 cursor-pointer hover:text-white"
                      onClick={() => {
                        setSortField('name');
                        setSortAsc(!sortAsc);
                      }}
                    >
                      <div className="flex items-center gap-1">
                        <span>Segment</span>
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </th>
                    <th
                      className="pb-2 cursor-pointer hover:text-white"
                      onClick={() => {
                        setSortField('erosionRate');
                        setSortAsc(!sortAsc);
                      }}
                    >
                      <div className="flex items-center gap-1">
                        <span>Erosion Rate</span>
                        <ArrowUpDown className="h-3 w-3" />
                      </div>
                    </th>
                    <th className="pb-2">Risk Category</th>
                    <th className="pb-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {filteredSegments.map((seg) => (
                    <tr
                      key={seg.name}
                      onClick={() => setSelectedSegment(seg)}
                      className={`cursor-pointer transition-colors ${
                        selectedSegment?.name === seg.name ? 'bg-cyan-950/40' : 'hover:bg-slate-800/30'
                      }`}
                    >
                      <td className="py-2.5 font-medium text-slate-200">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="h-3 w-3 text-cyan-400 shrink-0" />
                          <span className="truncate max-w-[180px]">{seg.name}</span>
                        </div>
                      </td>
                      <td className="py-2.5 font-mono text-amber-400 font-bold">
                        {seg.erosionRate.toFixed(2)} m/yr
                      </td>
                      <td className="py-2.5">
                        <RiskBadge level={seg.riskLevel} size="sm" />
                      </td>
                      <td className="py-2.5 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onNavigateTab('prediction', { segment: seg.name });
                          }}
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
          </div>

          <div className="pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Showing {filteredSegments.length} of {evaluatedSegments.length} reaches</span>
            <span>Click any reach to center on map</span>
          </div>
        </div>
      </div>

      {/* Engineering Decision Matrix Cards */}
      <div className="rounded-3xl bg-[#0a1628] border border-slate-800 p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white">Coastal Engineering & Ecological Management Matrix</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Low Risk Protocol */}
          <div className="rounded-2xl bg-slate-900/80 border border-emerald-900/40 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400">LOW RISK PROTOCOL</span>
              <span className="font-mono text-[10px] text-slate-400">&lt; {lowMax} m/yr</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Maintain native vegetative buffers and sand fencing. Conduct annual satellite multispectral surveys.
            </p>
          </div>

          {/* Moderate Risk Protocol */}
          <div className="rounded-2xl bg-slate-900/80 border border-amber-900/40 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400">MODERATE PROTOCOL</span>
              <span className="font-mono text-[10px] text-slate-400">{lowMax}–{modMax} m/yr</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Bi-annual profiling, dune grass stabilization (Spinifex/Ipomoea), and 100m development setback enforcement.
            </p>
          </div>

          {/* High Risk Protocol */}
          <div className="rounded-2xl bg-slate-900/80 border border-orange-900/40 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-orange-400">HIGH RISK PROTOCOL</span>
              <span className="font-mono text-[10px] text-slate-400">{modMax}–{highMax} m/yr</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Scheduled beach nourishment, hybrid living shorelines, geotextile revetments, and municipal hazard zoning.
            </p>
          </div>

          {/* Very High Risk Protocol */}
          <div className="rounded-2xl bg-slate-900/80 border border-red-900/40 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-red-400">VERY HIGH PROTOCOL</span>
              <span className="font-mono text-[10px] text-slate-400">&ge; {highMax} m/yr</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Immediate structural defense (submerged breakwaters/groynes), disaster hazard zoning, and managed retreat.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
