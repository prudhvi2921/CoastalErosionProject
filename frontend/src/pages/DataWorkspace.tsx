import React, { useState, useRef } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Layers,
  RefreshCw,
  Search,
  UploadCloud,
} from 'lucide-react';
import { DatasetDetail, DatasetSummary } from '../types';
import { api } from '../services/api';
import { ErrorAlert } from '../components/ErrorAlert';

interface DataWorkspaceProps {
  currentDataset: DatasetDetail | null;
  onSelectDataset: (dataset: DatasetDetail) => void;
  onNavigateTab: (tab: string, params?: any) => void;
}

export const DataWorkspace: React.FC<DataWorkspaceProps> = ({
  currentDataset,
  onSelectDataset,
  onNavigateTab,
}) => {
  const [, setDatasetsList] = useState<DatasetSummary[]>([]);
  const [isPreprocessing, setIsPreprocessing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Column Mappings State
  const [timeCol, setTimeCol] = useState<string>('Year');
  const [targetCol, setTargetCol] = useState<string>('ShorelinePosition_m');
  const [locationCol, setLocationCol] = useState<string>('Segment');

  // Preview Tabs
  const [previewTab, setPreviewTab] = useState<'cleaned' | 'raw' | 'validation'>('cleaned');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load existing datasets on mount
  React.useEffect(() => {
    fetchDatasetsList();
  }, []);

  // Update mappings when current dataset changes
  React.useEffect(() => {
    if (currentDataset?.column_mapping) {
      setTimeCol(currentDataset.column_mapping.timeColumn || 'Year');
      setTargetCol(currentDataset.column_mapping.targetColumn || 'ShorelinePosition_m');
      setLocationCol(currentDataset.column_mapping.locationColumn || 'Segment');
    }
  }, [currentDataset]);

  const fetchDatasetsList = async () => {
    try {
      const list = await api.getDatasets();
      setDatasetsList(list);
      if (!currentDataset && list.length > 0) {
        const full = await api.getDataset(list[0].id);
        onSelectDataset(full);
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      setErrorMsg('Please upload a standard comma-separated (.csv) dataset file.');
      return;
    }

    setErrorMsg(null);
    try {
      const uploaded = await api.uploadDataset(file);
      setSuccessMsg(`Dataset "${uploaded.name}" imported successfully with ${uploaded.row_count} rows.`);
      onSelectDataset(uploaded);
      fetchDatasetsList();
    } catch (err: any) {
      setErrorMsg(err.message || 'CSV upload failed');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleLoadSample = async (type: 'default' | 'high_risk' | 'moderate_risk' | 'low_risk') => {
    setErrorMsg(null);
    try {
      const sample = await api.loadSampleDataset(type);
      setSuccessMsg(`Sample survey "${sample.name}" loaded with ${sample.row_count} records.`);
      onSelectDataset(sample);
      fetchDatasetsList();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to load sample dataset');
    }
  };

  const handleRunPreprocessing = async () => {
    if (!currentDataset) return;
    setIsPreprocessing(true);
    setErrorMsg(null);
    try {
      const updated = await api.preprocessDataset(currentDataset.id, {
        time_col: timeCol,
        target_col: targetCol,
        location_col: locationCol,
      });
      setSuccessMsg(`Module 1 Preprocessing completed: ${updated.valid_row_count} valid records cleaned.`);
      onSelectDataset(updated);
      setPreviewTab('cleaned');
    } catch (err: any) {
      setErrorMsg(err.message || 'Preprocessing execution failed');
    } finally {
      setIsPreprocessing(false);
    }
  };

  const handleDownloadCleanCsv = () => {
    if (!currentDataset) return;
    const dataToExport = currentDataset.cleaned_data?.length ? currentDataset.cleaned_data : currentDataset.raw_data;
    if (!dataToExport || dataToExport.length === 0) return;

    const headers = Object.keys(dataToExport[0]);
    const csvRows = [headers.join(',')];
    dataToExport.forEach((row) => {
      const vals = headers.map((h) => {
        const val = row[h];
        return typeof val === 'string' && val.includes(',') ? `"${val}"` : val ?? '';
      });
      csvRows.push(vals.join(','));
    });

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Cleaned_${currentDataset.name.replace(/\s+/g, '_')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const rawRows = currentDataset?.raw_data || [];
  const cleanedRows = currentDataset?.cleaned_data || [];
  const validationErrors = currentDataset?.validation_errors || [];

  // Available column names for dropdowns
  const availableColumns = rawRows.length > 0 ? Object.keys(rawRows[0]) : ['Year', 'Segment', 'ShorelinePosition_m', 'Latitude', 'Longitude'];

  // Filtered rows for search
  const displayedRows = (previewTab === 'cleaned' ? (cleanedRows.length ? cleanedRows : rawRows) : rawRows).filter((r) => {
    if (!searchTerm) return true;
    return Object.values(r).some((val) => String(val).toLowerCase().includes(searchTerm.toLowerCase()));
  });

  return (
    <div className="space-y-6">
      {/* Page Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">Module 1 Engine</span>
            <span className="rounded bg-cyan-950 px-2 py-0.5 text-[10px] font-mono text-cyan-300 border border-cyan-800/40">
              CSV Ingestion & Validation
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">Data Workspace</h1>
          <p className="text-xs text-slate-400">
            Upload field surveys, auto-detect time & coordinate columns, inspect row-level errors, and generate preprocessed datasets.
          </p>
        </div>

        {/* Quick Sample Dataset Selector Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] text-slate-400 font-medium">Quick Demo Datasets:</span>
          <button
            onClick={() => handleLoadSample('default')}
            className="rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 px-3 py-1.5 text-xs font-medium border border-slate-700 transition-colors"
          >
            Multi-Segment (All)
          </button>
          <button
            onClick={() => handleLoadSample('high_risk')}
            className="rounded-lg bg-red-950/50 hover:bg-red-900/50 text-red-300 px-3 py-1.5 text-xs font-medium border border-red-800/50 transition-colors"
          >
            High Risk (Vizag)
          </button>
          <button
            onClick={() => handleLoadSample('moderate_risk')}
            className="rounded-lg bg-amber-950/50 hover:bg-amber-900/50 text-amber-300 px-3 py-1.5 text-xs font-medium border border-amber-800/50 transition-colors"
          >
            Moderate (Marina)
          </button>
          <button
            onClick={() => handleLoadSample('low_risk')}
            className="rounded-lg bg-emerald-950/50 hover:bg-emerald-900/50 text-emerald-300 px-3 py-1.5 text-xs font-medium border border-emerald-800/50 transition-colors"
          >
            Low Risk (Malpe)
          </button>
        </div>
      </div>

      {/* Alerts */}
      {errorMsg && <ErrorAlert message={errorMsg} onDismiss={() => setErrorMsg(null)} />}
      {successMsg && (
        <div className="flex items-center justify-between rounded-xl bg-emerald-950/60 border border-emerald-800/80 p-4 text-xs text-emerald-300 shadow-md">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-400 hover:text-emerald-200">
            &times;
          </button>
        </div>
      )}

      {/* Upload Zone & Column Mapping Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Upload Card (5 cols) */}
        <div className="lg:col-span-5 flex flex-col rounded-3xl bg-[#0a1628] border border-slate-800 p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800">
                <UploadCloud className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-bold text-white">Import Survey Dataset</h3>
            </div>
            <span className="text-[11px] text-slate-400">CSV format</span>
          </div>

          {/* Drag & Drop Box */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="cursor-pointer group flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-700/80 hover:border-cyan-500 bg-slate-900/50 hover:bg-cyan-950/20 p-8 text-center transition-all"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-800 group-hover:bg-cyan-900/60 text-cyan-400 shadow-inner transition-colors">
              <FileSpreadsheet className="h-6 w-6" />
            </div>
            <p className="mt-3 text-xs font-semibold text-slate-200">
              Click to browse or drag and drop CSV
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Auto-detects Year, Coordinates, Shoreline Position, and Segments
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          {/* Active Dataset Selection Info */}
          {currentDataset && (
            <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Active Dataset:</span>
                <span className="font-semibold text-white truncate max-w-[200px]" title={currentDataset.name}>
                  {currentDataset.name}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Total Records:</span>
                <span className="font-mono font-bold text-slate-200">{currentDataset.row_count} rows</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Cleaned Valid Rows:</span>
                <span className="font-mono font-bold text-emerald-400">{currentDataset.valid_row_count || currentDataset.row_count} rows</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Discovered Segments:</span>
                <span className="text-cyan-300 font-medium">
                  {currentDataset.segments?.length ? currentDataset.segments.join(', ') : 'All Coastal Area'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Column Mapping & Module 1 Preprocessor (7 cols) */}
        <div className="lg:col-span-7 flex flex-col justify-between rounded-3xl bg-[#0a1628] border border-slate-800 p-6 shadow-xl space-y-5">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-950 text-blue-400 border border-blue-800">
                  <Layers className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Dynamic Column Mapping</h3>
                  <p className="text-[11px] text-slate-400">Map survey attributes for linear regression modeling</p>
                </div>
              </div>
              <span className="rounded-full bg-emerald-950 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-800/40">
                Auto-Matched
              </span>
            </div>

            {/* Mappings Form */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Time Column */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-300">
                  Time / Survey Year <span className="text-red-400">*</span>
                </label>
                <select
                  value={timeCol}
                  onChange={(e) => setTimeCol(e.target.value)}
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                >
                  {availableColumns.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-slate-500 block">X-Axis independent variable</span>
              </div>

              {/* Target Column */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-300">
                  Target Shoreline Pos (m) <span className="text-red-400">*</span>
                </label>
                <select
                  value={targetCol}
                  onChange={(e) => setTargetCol(e.target.value)}
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                >
                  {availableColumns.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-slate-500 block">Y-Axis dependent variable</span>
              </div>

              {/* Location Column */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-300">
                  Location / Segment
                </label>
                <select
                  value={locationCol}
                  onChange={(e) => setLocationCol(e.target.value)}
                  className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-xs text-white focus:border-cyan-500 focus:outline-none"
                >
                  <option value="None">None (Single Segment)</option>
                  {availableColumns.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-slate-500 block">Multi-reach grouping</span>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 pt-4">
            <button
              onClick={handleRunPreprocessing}
              disabled={isPreprocessing || !currentDataset}
              className="flex items-center gap-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white px-5 py-2.5 text-xs font-bold shadow-lg shadow-cyan-600/30 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isPreprocessing ? 'animate-spin' : ''}`} />
              <span>{isPreprocessing ? 'Preprocessing...' : 'Run Module 1 Preprocessing'}</span>
            </button>

            <button
              onClick={() => onNavigateTab('prediction', { datasetId: currentDataset?.id })}
              disabled={!currentDataset}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-5 py-2.5 text-xs font-bold shadow-lg shadow-emerald-600/25 transition-all disabled:opacity-50"
            >
              <span>Send to Prediction Studio</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Before / After Data Inspection Table & Validation Report */}
      <div className="rounded-3xl bg-[#0a1628] border border-slate-800 p-6 shadow-xl space-y-4">
        {/* Table Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-4">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 rounded-xl bg-slate-900 p-1 border border-slate-800">
            <button
              onClick={() => setPreviewTab('cleaned')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                previewTab === 'cleaned'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Preprocessed & Cleaned ({cleanedRows.length || rawRows.length})
            </button>
            <button
              onClick={() => setPreviewTab('raw')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                previewTab === 'raw'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Raw Input Data ({rawRows.length})
            </button>
            <button
              onClick={() => setPreviewTab('validation')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                previewTab === 'validation'
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Validation Issues ({validationErrors.length})
            </button>
          </div>

          {/* Search & Export Actions */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
              <input
                type="text"
                placeholder="Filter table rows..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="rounded-xl bg-slate-900 border border-slate-800 pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:border-cyan-500 focus:outline-none w-44 sm:w-56"
              />
            </div>
            <button
              onClick={handleDownloadCleanCsv}
              disabled={!currentDataset}
              className="flex items-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 text-xs font-semibold border border-slate-700 transition-colors disabled:opacity-50"
            >
              <Download className="h-3.5 w-3.5 text-cyan-400" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Tab 1 & 2: Data Rows Table */}
        {previewTab !== 'validation' ? (
          <div className="overflow-x-auto rounded-2xl border border-slate-800">
            {displayedRows.length > 0 ? (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/90 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">#</th>
                    {Object.keys(displayedRows[0])
                      .filter((k) => !k.startsWith('_'))
                      .map((header) => (
                        <th key={header} className="py-3 px-4">
                          {header}
                        </th>
                      ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
                  {displayedRows.slice(0, 50).map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-2.5 px-4 font-mono text-slate-500">{idx + 1}</td>
                      {Object.entries(row)
                        .filter(([k]) => !k.startsWith('_'))
                        .map(([, val], cIdx) => (
                          <td key={cIdx} className="py-2.5 px-4 text-slate-200 font-mono">
                            {typeof val === 'number' ? val.toFixed(2) : String(val ?? '')}
                          </td>
                        ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center text-xs text-slate-500">
                No rows match the search query.
              </div>
            )}
          </div>
        ) : (
          /* Tab 3: Row-Level Validation Issues Table */
          <div className="overflow-x-auto rounded-2xl border border-slate-800">
            {validationErrors.length > 0 ? (
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900/90 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Row #</th>
                    <th className="py-3 px-4">Column</th>
                    <th className="py-3 px-4">Found Value</th>
                    <th className="py-3 px-4">Validation Message & Recommendation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
                  {validationErrors.map((err, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-2.5 px-4 font-mono font-bold text-amber-400">{err.row}</td>
                      <td className="py-2.5 px-4 font-semibold text-slate-200">{err.column}</td>
                      <td className="py-2.5 px-4 font-mono text-red-400">{String(err.value)}</td>
                      <td className="py-2.5 px-4 text-slate-300">{err.message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center text-xs text-emerald-400 flex flex-col items-center gap-2">
                <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                <span>Zero validation errors detected. All rows satisfy schema and range criteria.</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
