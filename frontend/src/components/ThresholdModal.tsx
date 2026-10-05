import React, { useState, useEffect } from 'react';
import { Check, RotateCcw, Sliders, X, AlertCircle } from 'lucide-react';
import { RiskThresholds } from '../types';

interface ThresholdModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentThresholds: RiskThresholds;
  onSave: (thresholds: RiskThresholds) => Promise<void>;
}

export const ThresholdModal: React.FC<ThresholdModalProps> = ({
  isOpen,
  onClose,
  currentThresholds,
  onSave,
}) => {
  const [lowMax, setLowMax] = useState<number>(currentThresholds.low_max || 1.0);
  const [modMax, setModMax] = useState<number>(currentThresholds.moderate_max || 2.0);
  const [highMax, setHighMax] = useState<number>(currentThresholds.high_max || 3.0);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setLowMax(currentThresholds.low_max || 1.0);
    setModMax(currentThresholds.moderate_max || 2.0);
    setHighMax(currentThresholds.high_max || 3.0);
  }, [currentThresholds]);

  if (!isOpen) return null;

  const handleReset = () => {
    setLowMax(1.0);
    setModMax(2.0);
    setHighMax(3.0);
    setErrorMsg(null);
  };

  const handleSave = async () => {
    if (lowMax <= 0) {
      setErrorMsg('Low risk threshold must be greater than 0');
      return;
    }
    if (modMax <= lowMax) {
      setErrorMsg('Moderate risk threshold must be strictly greater than Low threshold');
      return;
    }
    if (highMax <= modMax) {
      setErrorMsg('High risk threshold must be strictly greater than Moderate threshold');
      return;
    }

    setErrorMsg(null);
    setIsSaving(true);
    try {
      await onSave({
        low_max: Number(lowMax),
        moderate_max: Number(modMax),
        high_max: Number(highMax),
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update threshold rules');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl bg-[#0c1829] border border-slate-700/80 p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-950 border border-cyan-800 text-cyan-400">
              <Sliders className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Module 3 Risk Thresholds</h3>
              <p className="text-xs text-slate-400">Configure annual shoreline erosion rate criteria (m/year)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-red-950/60 border border-red-800/60 p-3 text-xs text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Visual Range Indicator Bar */}
        <div className="mt-5 rounded-xl bg-slate-900/90 border border-slate-800 p-3.5">
          <div className="text-[11px] font-medium text-slate-400 mb-2">Live Range Classification:</div>
          <div className="flex h-4 w-full overflow-hidden rounded-full text-[9px] font-bold text-white shadow-inner">
            <div
              style={{ width: `${Math.min(30, (lowMax / highMax) * 100)}%` }}
              className="flex items-center justify-center bg-emerald-600 transition-all"
              title={`Low: 0 to ${lowMax} m/yr`}
            >
              LOW
            </div>
            <div
              style={{ width: `${Math.min(35, ((modMax - lowMax) / highMax) * 100)}%` }}
              className="flex items-center justify-center bg-amber-600 transition-all"
              title={`Moderate: ${lowMax} to ${modMax} m/yr`}
            >
              MOD
            </div>
            <div
              style={{ width: `${Math.min(25, ((highMax - modMax) / highMax) * 100)}%` }}
              className="flex items-center justify-center bg-orange-600 transition-all"
              title={`High: ${modMax} to ${highMax} m/yr`}
            >
              HIGH
            </div>
            <div
              className="flex-1 flex items-center justify-center bg-red-600 transition-all"
              title={`Very High: >= ${highMax} m/yr`}
            >
              V.HIGH
            </div>
          </div>
          <div className="flex justify-between text-[10px] text-slate-500 mt-1 px-1">
            <span>0 m/yr</span>
            <span>{lowMax} m/yr</span>
            <span>{modMax} m/yr</span>
            <span>{highMax} m/yr+</span>
          </div>
        </div>

        {/* Sliders / Inputs */}
        <div className="mt-5 space-y-4">
          {/* Low Risk */}
          <div className="rounded-xl bg-slate-900/60 border border-slate-800/80 p-3.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Low Risk Ceiling (m/year)
              </span>
              <span className="font-mono text-sm font-bold text-slate-200">&lt; {lowMax} m/yr</span>
            </div>
            <input
              type="range"
              min="0.2"
              max="2.0"
              step="0.1"
              value={lowMax}
              onChange={(e) => setLowMax(parseFloat(e.target.value))}
              className="mt-2 w-full accent-emerald-500 cursor-pointer"
            />
            <p className="text-[10px] text-slate-500 mt-1">Erosion rates beneath this cutoff represent routine stable conditions.</p>
          </div>

          {/* Moderate Risk */}
          <div className="rounded-xl bg-slate-900/60 border border-slate-800/80 p-3.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-amber-400 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-amber-400" />
                Moderate Risk Ceiling (m/year)
              </span>
              <span className="font-mono text-sm font-bold text-slate-200">{lowMax} – {modMax} m/yr</span>
            </div>
            <input
              type="range"
              min={lowMax + 0.1}
              max="3.5"
              step="0.1"
              value={modMax}
              onChange={(e) => setModMax(parseFloat(e.target.value))}
              className="mt-2 w-full accent-amber-500 cursor-pointer"
            />
            <p className="text-[10px] text-slate-500 mt-1">Triggers active shoreline monitoring and dune restoration measures.</p>
          </div>

          {/* High Risk */}
          <div className="rounded-xl bg-slate-900/60 border border-slate-800/80 p-3.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-orange-400 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-orange-400" />
                High Risk Ceiling / Very High Floor (m/year)
              </span>
              <span className="font-mono text-sm font-bold text-slate-200">{modMax} – {highMax} m/yr</span>
            </div>
            <input
              type="range"
              min={modMax + 0.1}
              max="5.0"
              step="0.1"
              value={highMax}
              onChange={(e) => setHighMax(parseFloat(e.target.value))}
              className="mt-2 w-full accent-orange-500 cursor-pointer"
            />
            <p className="text-[10px] text-slate-500 mt-1">Rates &ge; {highMax} m/yr will be designated as Very High alert zones.</p>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="mt-6 flex items-center justify-between border-t border-slate-800 pt-4">
          <button
            onClick={handleReset}
            type="button"
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset Defaults (1.0 / 2.0 / 3.0)
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              type="button"
              className="rounded-lg px-3.5 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              type="button"
              className="flex items-center gap-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-1.5 text-xs font-medium shadow-md shadow-cyan-600/30 transition-colors disabled:opacity-50"
            >
              <Check className="h-3.5 w-3.5" />
              {isSaving ? 'Saving...' : 'Apply Thresholds'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
