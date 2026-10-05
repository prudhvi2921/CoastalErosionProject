import React, { useState, useEffect } from 'react';
import {
  Calendar,
  CheckCircle2,
  Download,
  FileDown,
  FileText,
  MapPin,
  Play,
  ShieldAlert,
  TrendingDown,
} from 'lucide-react';
import { DatasetDetail, PredictionResult } from '../types';
import { api } from '../services/api';
import { TrendChart } from '../components/TrendChart';
import { RiskBadge } from '../components/RiskBadge';
import { LoadingState } from '../components/LoadingState';
import { ErrorAlert } from '../components/ErrorAlert';

interface PredictionStudioProps {
  initialSegment?: string;
  currentDataset: DatasetDetail | null;
  onNavigateTab: (tab: string, params?: any) => void;
}

export const PredictionStudio: React.FC<PredictionStudioProps> = ({
  initialSegment,
  currentDataset,
}) => {
  const [selectedSegment, setSelectedSegment] = useState<string>(initialSegment || 'Visakhapatnam RK Beach');
  const [horizonYears, setHorizonYears] = useState<number>(5);
  const targetType = 'shoreline_position';
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [predictionResult, setPredictionResult] = useState<PredictionResult | null>(null);

  // Available segments in dataset
  const availableSegments = currentDataset?.segments?.length
    ? currentDataset.segments
    : ['Visakhapatnam RK Beach', 'Marina Beach Sector B', 'Malpe Coastline North', 'Miami Beach', 'Outer Banks'];

  useEffect(() => {
    if (initialSegment && availableSegments.includes(initialSegment)) {
      setSelectedSegment(initialSegment);
    } else if (availableSegments.length > 0 && !availableSegments.includes(selectedSegment)) {
      setSelectedSegment(availableSegments[0]);
    }
  }, [initialSegment, availableSegments]);

  // Run initial prediction on load if not already computed
  useEffect(() => {
    if (!predictionResult) {
      handleRunPrediction();
    }
  }, [selectedSegment]);

  const handleRunPrediction = async () => {
    setIsRunning(true);
    setErrorMsg(null);
    try {
      const res = await api.runPrediction({
        dataset_id: currentDataset?.id,
        segment: selectedSegment,
        horizon: horizonYears,
        target_type: targetType,
      });
      setPredictionResult(res);
    } catch (err: any) {
      setErrorMsg(err.message || 'Prediction execution failed');
    } finally {
      setIsRunning(false);
    }
  };

  const handleDownloadPdf = () => {
    if (!predictionResult?.id) return;
    window.open(api.getPdfReportUrl(predictionResult.id), '_blank');
  };

  const handleDownloadCsv = () => {
    if (!predictionResult?.id) return;
    window.open(api.getCsvReportUrl(predictionResult.id), '_blank');
  };

  const calculateTargetYear = () => {
    const base = predictionResult?.lastYear || 2025;
    return base + horizonYears;
  };

  return (
    <div className="space-y-6">
      {/* Page Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">Module 2 & 3 Engine</span>
            <span className="rounded bg-cyan-950 px-2 py-0.5 text-[10px] font-mono text-cyan-300 border border-cyan-800/40">
              Scikit-Learn Regression & Risk Rules
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">Prediction Studio</h1>
          <p className="text-xs text-slate-400">
            Fit linear regression trend models, forecast future shoreline retreats across custom horizons, and derive engineering risk decisions.
          </p>
        </div>

        {/* Action Buttons */}
        {predictionResult && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadCsv}
              className="flex items-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 px-3.5 py-2 text-xs font-semibold border border-slate-700 transition-colors shadow-sm"
            >
              <FileDown className="h-4 w-4 text-cyan-400" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={handleDownloadPdf}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-4 py-2 text-xs font-semibold shadow-lg shadow-cyan-600/30 transition-all"
            >
              <FileText className="h-4 w-4" />
              <span>Download PDF Report</span>
            </button>
          </div>
        )}
      </div>

      {errorMsg && <ErrorAlert message={errorMsg} onDismiss={() => setErrorMsg(null)} />}

      {/* Modeling Controls Bar */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 rounded-3xl bg-[#0a1628] border border-slate-800 p-5 shadow-xl">
        {/* Reach Selector (4 cols) */}
        <div className="md:col-span-4 space-y-1.5">
          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-cyan-400" />
            Target Coastal Reach / Transect
          </label>
          <select
            value={selectedSegment}
            onChange={(e) => setSelectedSegment(e.target.value)}
            className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-xs font-medium text-white focus:border-cyan-500 focus:outline-none"
          >
            {availableSegments.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Forecast Horizon Slider (5 cols) */}
        <div className="md:col-span-5 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <label className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-cyan-400" />
              Forecast Horizon: <span className="font-mono text-cyan-400 font-bold">{horizonYears} Years</span>
            </label>
            <span className="font-mono text-[11px] text-slate-400 font-medium">
              Target Year: <span className="text-white font-bold">{calculateTargetYear()}</span>
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="20"
            step="1"
            value={horizonYears}
            onChange={(e) => setHorizonYears(parseInt(e.target.value))}
            className="w-full accent-cyan-500 cursor-pointer mt-1"
          />
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>+1 Year</span>
            <span>+5 Years</span>
            <span>+10 Years</span>
            <span>+20 Years</span>
          </div>
        </div>

        {/* Run Button (3 cols) */}
        <div className="md:col-span-3 flex items-end">
          <button
            onClick={handleRunPrediction}
            disabled={isRunning}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white py-2.5 px-4 text-xs font-bold shadow-lg shadow-cyan-600/30 transition-all disabled:opacity-50"
          >
            <Play className={`h-4 w-4 fill-current ${isRunning ? 'animate-spin' : ''}`} />
            <span>{isRunning ? 'Calculating...' : 'Run Trend Forecast'}</span>
          </button>
        </div>
      </div>

      {isRunning && !predictionResult ? (
        <LoadingState message="Fitting Linear Regression Model..." subMessage="Optimizing slope & intercept coefficients" />
      ) : predictionResult ? (
        <div className="space-y-6">
          {/* Key Regression Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Metric 1: Annual Retreat Rate */}
            <div className="glass-card rounded-2xl p-5 border border-slate-800 relative overflow-hidden">
              <span className="text-xs font-medium text-slate-400">Annual Erosion Rate</span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-amber-400 font-mono">
                  {predictionResult.erosionRateMPerYr.toFixed(2)}
                </span>
                <span className="text-xs text-slate-400 font-medium">m / year</span>
              </div>
              <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1">
                <TrendingDown className="h-3.5 w-3.5 text-amber-400" />
                <span>Slope: {predictionResult.slope.toFixed(3)} m/step</span>
              </div>
            </div>

            {/* Metric 2: Target Year Predicted Position */}
            <div className="glass-card rounded-2xl p-5 border border-slate-800 relative overflow-hidden">
              <span className="text-xs font-medium text-slate-400">Projected Shoreline ({predictionResult.targetYear})</span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-cyan-400 font-mono">
                  {predictionResult.predictedPositionM.toFixed(1)}
                </span>
                <span className="text-xs text-slate-400 font-medium">meters</span>
              </div>
              <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1">
                <span className="text-cyan-300 font-medium">
                  Δ {predictionResult.projectedRetreatM?.toFixed(1) || (predictionResult.erosionRateMPerYr * horizonYears).toFixed(1)} m retreat
                </span>
              </div>
            </div>

            {/* Metric 3: Regression R-Squared Fit */}
            <div className="glass-card rounded-2xl p-5 border border-slate-800 relative overflow-hidden">
              <span className="text-xs font-medium text-slate-400">Statistical Fit (R² Score)</span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-emerald-400 font-mono">
                  {predictionResult.rSquared.toFixed(3)}
                </span>
                <span className="text-xs text-emerald-400/80 font-medium">
                  {predictionResult.rSquared >= 0.8 ? 'Strong Correlation' : 'Moderate Fit'}
                </span>
              </div>
              <div className="mt-2 text-[11px] text-slate-500 truncate" title={predictionResult.equation}>
                <span className="font-mono">{predictionResult.equation}</span>
              </div>
            </div>

            {/* Metric 4: Risk Level Badge */}
            <div className="glass-card rounded-2xl p-5 border border-slate-800 relative overflow-hidden flex flex-col justify-between">
              <span className="text-xs font-medium text-slate-400">Assessed Risk Tier</span>
              <div className="mt-2">
                <RiskBadge level={predictionResult.riskLevel} size="lg" />
              </div>
              <div className="mt-2 text-[11px] text-slate-400 truncate">
                <span>{predictionResult.riskActionPriority}</span>
              </div>
            </div>
          </div>

          {/* Time Series Chart & Future Projections Table */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Interactive Trend Chart (8 cols) */}
            <div className="lg:col-span-8 rounded-3xl bg-[#0a1628] border border-slate-800 p-6 shadow-xl flex flex-col justify-between h-[460px]">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="text-sm font-bold text-white">Historical Survey Trend & Model Projection</h3>
                  <p className="text-[11px] text-slate-400">
                    Observed field records ({predictionResult.firstYear}–{predictionResult.lastYear}) vs Projected Horizon ({predictionResult.lastYear}–{predictionResult.targetYear})
                  </p>
                </div>
              </div>
              <div className="flex-1 w-full">
                <TrendChart prediction={predictionResult} />
              </div>
            </div>

            {/* Year-by-Year Forecast Table (4 cols) */}
            <div className="lg:col-span-4 rounded-3xl bg-[#0a1628] border border-slate-800 p-5 shadow-xl flex flex-col justify-between h-[460px]">
              <div>
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-white">Forecast Trajectory</h3>
                    <p className="text-[10px] text-slate-400">Step-by-step retreat projections</p>
                  </div>
                  <span className="rounded bg-slate-800 px-2 py-0.5 font-mono text-[10px] text-cyan-300">
                    +{horizonYears} Yrs
                  </span>
                </div>

                <div className="mt-3 overflow-y-auto max-h-[330px] pr-1">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-[10px] text-slate-400 font-semibold uppercase">
                        <th className="pb-2">Year</th>
                        <th className="pb-2">Predicted Pos</th>
                        <th className="pb-2 text-right">Net Loss</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {predictionResult.future?.map((f: any, idx: number) => {
                        const yr = f.Year || f.StandardTime;
                        const pos = f.PredictedPosition_m || f.StandardTarget;
                        const base = predictionResult.lastHistoricalPositionM || 0;
                        const loss = base - pos;
                        return (
                          <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                            <td className="py-2.5 font-mono font-semibold text-cyan-300">
                              {yr}
                            </td>
                            <td className="py-2.5 font-mono text-slate-200">
                              {pos.toFixed(2)} m
                            </td>
                            <td className="py-2.5 font-mono text-right text-red-400">
                              -{Math.abs(loss).toFixed(2)} m
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Baseline: {predictionResult.lastHistoricalPositionM?.toFixed(1)} m</span>
                <span className="text-cyan-400 font-mono font-bold">End: {predictionResult.predictedPositionM?.toFixed(1)} m</span>
              </div>
            </div>
          </div>

          {/* Module 3 Risk Decision & Mitigation Action Plan */}
          <div className="rounded-3xl bg-gradient-to-r from-[#0d1f38] via-[#0a1628] to-[#070e17] border border-slate-700/80 p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-950 border border-cyan-800 text-cyan-400">
                  <ShieldAlert className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white">Module 3 Risk Assessment Decision</h3>
                    <RiskBadge level={predictionResult.riskLevel} size="sm" />
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Scientific rationale and engineering guidance for {predictionResult.segment}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400">Action Priority:</span>
                <span className="font-semibold text-white bg-slate-800 px-3 py-1 rounded-xl border border-slate-700">
                  {predictionResult.riskActionPriority}
                </span>
              </div>
            </div>

            {/* Assessment Rationale Text */}
            <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4">
              <span className="text-[11px] font-semibold text-slate-300 block mb-1">Assessment Finding:</span>
              <p className="text-xs text-slate-300 leading-relaxed">
                {predictionResult.riskDescription}
              </p>
            </div>

            {/* Recommendations Grid */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold text-slate-200">Recommended Coastal Engineering & Ecological Actions:</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {predictionResult.riskRecommendations?.map((rec: string, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 p-3.5 text-xs text-slate-300"
                  >
                    <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{rec}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Report Export Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-800/80 pt-4">
              <div className="text-[11px] text-slate-400">
                Ready for project presentation & mentor evaluation.
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownloadCsv}
                  className="flex items-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 px-3.5 py-2 text-xs font-semibold border border-slate-700 transition-colors"
                >
                  <Download className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Download Projections CSV</span>
                </button>
                <button
                  onClick={handleDownloadPdf}
                  className="flex items-center gap-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 text-xs font-semibold shadow-md shadow-cyan-600/30 transition-all"
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span>Generate Full PDF Assessment</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center text-xs text-slate-500">
          No prediction result available. Select a coastal reach and click "Run Trend Forecast".
        </div>
      )}
    </div>
  );
};
