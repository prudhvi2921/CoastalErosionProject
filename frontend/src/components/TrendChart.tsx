import React, { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Area,
} from 'recharts';
import { PredictionResult } from '../types';

interface TrendChartProps {
  prediction: PredictionResult;
}

export const TrendChart: React.FC<TrendChartProps> = ({ prediction }) => {
  const [chartMode, setChartMode] = useState<'position' | 'rate'>('position');

  // Build unified dataset for Recharts
  const chartData: any[] = [];

  const hist = prediction.history || [];
  const fut = prediction.future || [];

  // 1. Add historical points
  hist.forEach((h: any) => {
    const yr = h.Year !== undefined ? h.Year : h.StandardTime;
    const pos = h.ShorelinePosition_m !== undefined ? h.ShorelinePosition_m : h.StandardTarget;
    const rate = h.RateOfChange_m_per_yr !== undefined ? h.RateOfChange_m_per_yr : null;

    // Linear regression model line value at this year
    const regressed = prediction.slope * yr + prediction.intercept;

    chartData.push({
      year: yr,
      displayYear: String(yr),
      actualPosition: Math.round(pos * 100) / 100,
      predictedPosition: null,
      trendLine: Math.round(regressed * 100) / 100,
      erosionRate: rate !== null ? Math.round(rate * 100) / 100 : null,
      type: 'historical',
    });
  });

  // 2. Connect bridge point from last historical point
  if (hist.length > 0) {
    const lastHist = chartData[chartData.length - 1];
    lastHist.predictedPosition = lastHist.actualPosition;
  }

  // 3. Add projected future points
  fut.forEach((f: any) => {
    const yr = f.Year !== undefined ? f.Year : f.StandardTime;
    const pos = f.PredictedPosition_m !== undefined ? f.PredictedPosition_m : f.StandardTarget;
    const regressed = prediction.slope * yr + prediction.intercept;

    chartData.push({
      year: yr,
      displayYear: `${yr} (Forecast)`,
      actualPosition: null,
      predictedPosition: Math.round(pos * 100) / 100,
      trendLine: Math.round(regressed * 100) / 100,
      erosionRate: Math.round(prediction.erosionRateMPerYr * 100) / 100,
      upperConfidence: Math.round((pos + 1.2) * 100) / 100,
      lowerConfidence: Math.round((pos - 1.2) * 100) / 100,
      type: 'future',
    });
  });

  const lastHistYear = prediction.lastYear;

  // Custom Tooltip Formatter
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="rounded-xl bg-[#091524] border border-slate-700 p-3 shadow-2xl text-xs backdrop-blur-md">
          <div className="font-semibold text-cyan-300 mb-1 flex items-center justify-between gap-4">
            <span>Year: {data.displayYear}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
              {data.type === 'historical' ? 'Observed Survey' : 'Model Prediction'}
            </span>
          </div>
          {data.actualPosition !== null && (
            <div className="flex items-center justify-between gap-4 text-emerald-400 py-0.5">
              <span>Observed Position:</span>
              <span className="font-mono font-bold">{data.actualPosition} m</span>
            </div>
          )}
          {data.predictedPosition !== null && (
            <div className="flex items-center justify-between gap-4 text-cyan-400 py-0.5">
              <span>Predicted Shoreline:</span>
              <span className="font-mono font-bold">{data.predictedPosition} m</span>
            </div>
          )}
          {data.trendLine !== null && (
            <div className="flex items-center justify-between gap-4 text-slate-400 py-0.5">
              <span>Regression Fit:</span>
              <span className="font-mono">{data.trendLine} m</span>
            </div>
          )}
          {data.erosionRate !== null && (
            <div className="flex items-center justify-between gap-4 text-amber-400 py-0.5 border-t border-slate-800 mt-1 pt-1">
              <span>Retreat Rate:</span>
              <span className="font-mono font-bold">{data.erosionRate} m/yr</span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-full w-full flex flex-col">
      {/* Chart Control Toolbar */}
      <div className="flex items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-300">Metric View:</span>
          <div className="flex rounded-lg bg-slate-900/90 border border-slate-800 p-0.5 text-xs">
            <button
              onClick={() => setChartMode('position')}
              className={`rounded-md px-2.5 py-1 font-medium transition-all ${
                chartMode === 'position'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Shoreline Position (m)
            </button>
            <button
              onClick={() => setChartMode('rate')}
              className={`rounded-md px-2.5 py-1 font-medium transition-all ${
                chartMode === 'rate'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Annual Erosion Rate (m/yr)
            </button>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-3 text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
            <span>Observed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-cyan-400" />
            <span>Projected</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-slate-500" />
            <span>Trend Line</span>
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="flex-1 w-full min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          {chartMode === 'position' ? (
            <ComposedChart data={chartData} margin={{ top: 15, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                dataKey="year"
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                tickLine={{ stroke: '#334155' }}
              />
              <YAxis
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                tickLine={{ stroke: '#334155' }}
                unit="m"
                domain={['dataMin - 5', 'dataMax + 5']}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine
                x={lastHistYear}
                stroke="#f59e0b"
                strokeDasharray="4 4"
                label={{
                  value: 'Forecast Start',
                  position: 'top',
                  fill: '#f59e0b',
                  fontSize: 10,
                }}
              />
              {/* Confidence Band */}
              <Area
                type="monotone"
                dataKey="upperConfidence"
                stroke="none"
                fill="rgba(6, 182, 212, 0.12)"
              />
              {/* Historical Line */}
              <Line
                type="monotone"
                dataKey="actualPosition"
                name="Observed Survey"
                stroke="#10b981"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#10b981', stroke: '#ffffff', strokeWidth: 1.5 }}
                activeDot={{ r: 6, fill: '#34d399' }}
                connectNulls={false}
              />
              {/* Projected Line */}
              <Line
                type="monotone"
                dataKey="predictedPosition"
                name="Model Forecast"
                stroke="#06b6d4"
                strokeWidth={2.5}
                strokeDasharray="5 5"
                dot={{ r: 4, fill: '#06b6d4', stroke: '#ffffff', strokeWidth: 1.5 }}
                activeDot={{ r: 6, fill: '#38bdf8' }}
                connectNulls
              />
              {/* Linear Regression Line */}
              <Line
                type="linear"
                dataKey="trendLine"
                name="Regression Fit"
                stroke="#64748b"
                strokeWidth={1.5}
                strokeDasharray="3 3"
                dot={false}
              />
            </ComposedChart>
          ) : (
            <ComposedChart data={chartData} margin={{ top: 15, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis
                dataKey="year"
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                tickLine={{ stroke: '#334155' }}
              />
              <YAxis
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                tickLine={{ stroke: '#334155' }}
                unit=" m/yr"
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={0} stroke="#475569" strokeWidth={1} />
              <ReferenceLine y={1.0} stroke="#10b981" strokeDasharray="3 3" label={{ value: 'Low Risk', fill: '#10b981', fontSize: 9 }} />
              <ReferenceLine y={2.0} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'Mod Risk', fill: '#f59e0b', fontSize: 9 }} />
              <ReferenceLine y={3.0} stroke="#ea580c" strokeDasharray="3 3" label={{ value: 'High Risk', fill: '#ea580c', fontSize: 9 }} />
              <Line
                type="monotone"
                dataKey="erosionRate"
                name="Annual Rate of Change"
                stroke="#f59e0b"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#f59e0b', stroke: '#ffffff', strokeWidth: 1.5 }}
              />
            </ComposedChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};
