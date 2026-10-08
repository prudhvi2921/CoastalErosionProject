import React, { useState, useEffect } from 'react';
import {
  Download,
  Eye,
  FileCheck,
  FileDown,
  FileSpreadsheet,
  FileText,
  MapPin,
  Printer,
  Search,
  ShieldAlert,
  X,
} from 'lucide-react';
import { PredictionResult } from '../types';
import { api } from '../services/api';
import { RiskBadge } from '../components/RiskBadge';
import { LoadingState } from '../components/LoadingState';

interface ReportsProps {
  onNavigateTab: (tab: string, params?: any) => void;
}

export const Reports: React.FC<ReportsProps> = () => {
  const [runs, setRuns] = useState<PredictionResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeModalRun, setActiveModalRun] = useState<PredictionResult | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const savedRuns = await api.getPredictionRuns();
      setRuns(savedRuns);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPdf = (runId: string) => {
    window.open(api.getPdfReportUrl(runId), '_blank');
  };

  const handleDownloadCsv = (runId: string) => {
    window.open(api.getCsvReportUrl(runId), '_blank');
  };

  const filteredRuns = runs.filter((r) =>
    r.segment.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.riskLevel.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">Publication & Export Engine</span>
            <span className="rounded bg-cyan-950 px-2 py-0.5 text-[10px] font-mono text-cyan-300 border border-cyan-800/40">
              Publication Reports & Audit Logs
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white mt-1">Reports & Export Center</h1>
          <p className="text-xs text-slate-400">
            Access formal environmental engineering PDF assessment reports, download multi-year CSV forecasts, and inspect mathematical model assumptions.
          </p>
        </div>

        {/* Global Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 px-3.5 py-2 text-xs font-semibold border border-slate-700 transition-colors shadow-sm"
          >
            <Printer className="h-4 w-4 text-cyan-400" />
            <span>Print Summary</span>
          </button>
        </div>
      </div>

      {/* Overview Metric Banner (1 col on mobile, 3 col on tablet/desktop) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
        <div className="glass-card rounded-2xl p-4 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium">Archived Model Runs</span>
            <p className="text-2xl font-bold font-mono text-white mt-1">{runs.length}</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800">
            <FileSpreadsheet className="h-5 w-5" />
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium">Export Formats</span>
            <p className="text-sm font-bold text-slate-200 mt-1">Formal PDF • Clean CSV</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-950 text-emerald-400 border border-emerald-800">
            <FileCheck className="h-5 w-5" />
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium">Compliance Framework</span>
            <p className="text-xs font-semibold text-cyan-300 mt-1">CZM Standards • RFC JSON</p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-950 text-blue-400 border border-blue-800">
            <ShieldAlert className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Runs Archive Table */}
      <div className="rounded-2xl sm:rounded-3xl bg-[#0a1628] border border-slate-800 p-4 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-sm font-bold text-white">Historical Model Run Archive</h3>
            <p className="text-[10px] sm:text-[11px] text-slate-400">All linear regression and risk assessment executions stored in SQLite database</p>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search run by reach..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-56 rounded-xl bg-slate-900 border border-slate-800 pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
            />
          </div>
        </div>

        {isLoading ? (
          <LoadingState message="Loading Saved Reports & Prediction Archive..." />
        ) : filteredRuns.length > 0 ? (
          <div className="overflow-x-auto rounded-2xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/90 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-3 sm:px-4">Run ID</th>
                  <th className="py-3 px-3 sm:px-4">Coastal Reach</th>
                  <th className="py-3 px-3 sm:px-4">Forecast</th>
                  <th className="py-3 px-3 sm:px-4">Erosion Rate</th>
                  <th className="py-3 px-3 sm:px-4">R² Fit</th>
                  <th className="py-3 px-3 sm:px-4">Risk Level</th>
                  <th className="py-3 px-3 sm:px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
                {filteredRuns.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-3 sm:px-4 font-mono font-bold text-cyan-400">
                      {r.id ? `#${r.id.substring(0, 8)}` : '#run-default'}
                    </td>
                    <td className="py-2.5 px-3 sm:px-4 font-medium text-slate-200">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                        <span className="truncate max-w-[120px] sm:max-w-none">{r.segment}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 sm:px-4 font-mono text-slate-300">
                      Year {r.targetYear}
                    </td>
                    <td className="py-2.5 px-3 sm:px-4 font-mono font-bold text-amber-400">
                      {r.erosionRateMPerYr.toFixed(2)} m/yr
                    </td>
                    <td className="py-2.5 px-3 sm:px-4 font-mono text-emerald-400">
                      {r.rSquared.toFixed(3)}
                    </td>
                    <td className="py-2.5 px-3 sm:px-4">
                      <RiskBadge level={r.riskLevel} size="sm" />
                    </td>
                    <td className="py-2.5 px-3 sm:px-4 text-right">
                      <div className="flex items-center justify-end gap-1 sm:gap-1.5">
                        <button
                          onClick={async () => {
                            if (r.id) {
                              const full = await api.getPredictionRun(r.id);
                              setActiveModalRun(full);
                            }
                          }}
                          className="rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 text-[11px] font-semibold transition-colors"
                          title="Inspect Run Assumptions"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => r.id && handleDownloadCsv(r.id)}
                          className="rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 text-[11px] font-semibold border border-slate-700 transition-colors"
                          title="Download CSV Projections"
                        >
                          <FileDown className="h-3.5 w-3.5 text-cyan-400" />
                        </button>
                        <button
                          onClick={() => r.id && handleDownloadPdf(r.id)}
                          className="flex items-center gap-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white px-2.5 py-1 text-[11px] font-semibold shadow-sm transition-colors"
                        >
                          <Download className="h-3 w-3" />
                          <span className="hidden sm:inline">PDF</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-xs text-slate-500">
            No prediction runs found. Go to Prediction Studio to run your first forecast.
          </div>
        )}
      </div>

      {/* Run Inspection Modal / Drawer */}
      {activeModalRun && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-3 sm:p-4">
          <div className="w-[94vw] sm:w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl sm:rounded-3xl bg-[#0c1829] border border-slate-700 p-4 sm:p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800 shrink-0">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white">Model Audit & Mathematical Details</h3>
                  <p className="text-[10px] sm:text-xs text-slate-400">Run ID #{activeModalRun.id}</p>
                </div>
              </div>
              <button
                onClick={() => setActiveModalRun(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 text-xs">
              <div className="rounded-xl bg-slate-900 p-2.5 sm:p-3 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Reach Name</span>
                <span className="font-bold text-white">{activeModalRun.segment}</span>
              </div>
              <div className="rounded-xl bg-slate-900 p-2.5 sm:p-3 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Risk Tier</span>
                <RiskBadge level={activeModalRun.riskLevel} size="sm" />
              </div>
              <div className="rounded-xl bg-slate-900 p-2.5 sm:p-3 border border-slate-800 sm:col-span-2">
                <span className="text-slate-400 block text-[10px]">Linear Regression Formula</span>
                <span className="font-mono font-bold text-cyan-300 text-xs sm:text-sm">{activeModalRun.equation}</span>
              </div>
              <div className="rounded-xl bg-slate-900 p-2.5 sm:p-3 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Slope (m/year)</span>
                <span className="font-mono text-slate-200 font-bold">{activeModalRun.slope}</span>
              </div>
              <div className="rounded-xl bg-slate-900 p-2.5 sm:p-3 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">R² Coefficient</span>
                <span className="font-mono text-emerald-400 font-bold">{activeModalRun.rSquared}</span>
              </div>
            </div>

            {/* Findings Text */}
            <div className="rounded-xl bg-slate-900 p-3 sm:p-3.5 border border-slate-800 text-xs text-slate-300">
              <span className="font-semibold text-slate-200 block mb-1 text-[11px]">Scientific Conclusion:</span>
              <p className="leading-relaxed">{activeModalRun.riskDescription}</p>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between border-t border-slate-800 pt-3 gap-2">
              <span className="text-[10px] text-slate-500">Created: {activeModalRun.createdAt}</span>
              <button
                onClick={() => activeModalRun.id && handleDownloadPdf(activeModalRun.id)}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 text-xs font-bold shadow-md shadow-cyan-600/30 transition-all"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download Publication PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
