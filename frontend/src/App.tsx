import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Dashboard } from './pages/Dashboard';
import { DataWorkspace } from './pages/DataWorkspace';
import { PredictionStudio } from './pages/PredictionStudio';
import { RiskExplorer } from './pages/RiskExplorer';
import { Reports } from './pages/Reports';
import { ThresholdModal } from './components/ThresholdModal';
import { CoastalSegmentGeo, DashboardSummary, DatasetDetail, RiskThresholds } from './types';
import { api } from './services/api';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [dashboardSummary, setDashboardSummary] = useState<DashboardSummary | null>(null);
  const [currentDataset, setCurrentDataset] = useState<DatasetDetail | null>(null);
  const [segments, setSegments] = useState<CoastalSegmentGeo[]>([]);
  const [thresholds, setThresholds] = useState<RiskThresholds>({
    low_max: 1.0,
    moderate_max: 2.0,
    high_max: 3.0,
  });

  const [isThresholdModalOpen, setIsThresholdModalOpen] = useState<boolean>(false);
  const [isLoadingSample, setIsLoadingSample] = useState<boolean>(false);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState<boolean>(true);
  const [activeStudioSegment, setActiveStudioSegment] = useState<string>('Visakhapatnam RK Beach');

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setIsLoadingDashboard(true);
    try {
      const [summaryData, thData, datasetsList] = await Promise.all([
        api.getDashboardSummary().catch(() => null),
        api.getThresholds().catch(() => ({ low_max: 1.0, moderate_max: 2.0, high_max: 3.0 })),
        api.getDatasets().catch(() => []),
      ]);

      if (summaryData) {
        setDashboardSummary(summaryData);
        setSegments(summaryData.segments || []);
      }
      if (thData) {
        setThresholds(thData);
      }
      if (datasetsList && datasetsList.length > 0) {
        const fullDataset = await api.getDataset(datasetsList[0].id).catch(() => null);
        if (fullDataset) setCurrentDataset(fullDataset);
      }
    } catch (err) {
      console.error('Initial data load error:', err);
    } finally {
      setIsLoadingDashboard(false);
    }
  };

  const handleUpdateThresholds = async (newThresholds: RiskThresholds) => {
    const updated = await api.updateThresholds(newThresholds);
    setThresholds(updated);
    // Refresh summary to reflect new thresholds
    const freshSummary = await api.getDashboardSummary().catch(() => null);
    if (freshSummary) {
      setDashboardSummary(freshSummary);
      setSegments(freshSummary.segments || []);
    }
  };

  const handleLoadSample = async () => {
    setIsLoadingSample(true);
    try {
      const sample = await api.loadSampleDataset('default');
      setCurrentDataset(sample);
      const freshSummary = await api.getDashboardSummary().catch(() => null);
      if (freshSummary) {
        setDashboardSummary(freshSummary);
        setSegments(freshSummary.segments || []);
      }
      setCurrentTab('workspace');
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingSample(false);
    }
  };

  const handleNavigateTab = (tab: string, params?: any) => {
    if (params?.segment) {
      setActiveStudioSegment(params.segment);
    }
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#070e17] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      {/* Navigation Header */}
      <Header
        currentTab={currentTab}
        onTabChange={handleNavigateTab}
        onOpenThresholdModal={() => setIsThresholdModalOpen(true)}
        onLoadSample={handleLoadSample}
        isLoadingSample={isLoadingSample}
      />

      {/* Main View Area */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
        {currentTab === 'dashboard' && (
          <Dashboard
            summary={dashboardSummary}
            isLoading={isLoadingDashboard}
            onNavigateTab={handleNavigateTab}
            onLoadSample={handleLoadSample}
          />
        )}

        {currentTab === 'workspace' && (
          <DataWorkspace
            currentDataset={currentDataset}
            onSelectDataset={(d) => setCurrentDataset(d)}
            onNavigateTab={handleNavigateTab}
          />
        )}

        {currentTab === 'prediction' && (
          <PredictionStudio
            initialSegment={activeStudioSegment}
            currentDataset={currentDataset}
            onNavigateTab={handleNavigateTab}
          />
        )}

        {currentTab === 'risk' && (
          <RiskExplorer
            segments={segments}
            currentThresholds={thresholds}
            onUpdateThresholds={handleUpdateThresholds}
            onNavigateTab={handleNavigateTab}
          />
        )}

        {currentTab === 'reports' && (
          <Reports onNavigateTab={handleNavigateTab} />
        )}
      </main>

      {/* Threshold Modal */}
      <ThresholdModal
        isOpen={isThresholdModalOpen}
        onClose={() => setIsThresholdModalOpen(false)}
        currentThresholds={thresholds}
        onSave={handleUpdateThresholds}
      />

      {/* Footer */}
      <footer className="w-full border-t border-slate-800/80 bg-[#060d17] py-6 px-4 text-center text-xs text-slate-500">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">Coastal Erosion Prediction & Risk Assessment System</span>
            <span className="text-slate-600">•</span>
            <span className="text-cyan-400">Modules 1–5 Certified</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Linear Regression • Scikit-Learn • FastAPI • Spring Boot • Recharts • Leaflet
          </p>
        </div>
      </footer>
    </div>
  );
};
