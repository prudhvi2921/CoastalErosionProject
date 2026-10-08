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

// Fallback initial dataset for instant preview while servers connect
const FALLBACK_SEGMENTS: CoastalSegmentGeo[] = [
  {
    name: 'Visakhapatnam RK Beach',
    latitude: 17.7126,
    longitude: 83.3197,
    baselineYear: 2012,
    latestYear: 2025,
    baselinePosition: 124.5,
    latestPosition: 89.2,
    erosionRate: 2.74,
    riskLevel: 'HIGH',
    riskColor: '#ea580c',
    actionPriority: 'Targeted Mitigation & Beach Nourishment',
    recordsCount: 14,
  },
  {
    name: 'Marina Beach Sector B',
    latitude: 13.0475,
    longitude: 80.2824,
    baselineYear: 2012,
    latestYear: 2025,
    baselinePosition: 145.0,
    latestPosition: 126.5,
    erosionRate: 1.42,
    riskLevel: 'MODERATE',
    riskColor: '#d97706',
    actionPriority: 'Active Monitoring & Dune Restoration',
    recordsCount: 14,
  },
  {
    name: 'Malpe Coastline North',
    latitude: 13.3516,
    longitude: 74.6987,
    baselineYear: 2012,
    latestYear: 2025,
    baselinePosition: 110.2,
    latestPosition: 101.4,
    erosionRate: 0.68,
    riskLevel: 'LOW',
    riskColor: '#0d9488',
    actionPriority: 'Routine Annual Monitoring',
    recordsCount: 14,
  },
  {
    name: 'Outer Banks Reach 4',
    latitude: 35.5585,
    longitude: -75.4665,
    baselineYear: 2012,
    latestYear: 2025,
    baselinePosition: 150.0,
    latestPosition: 109.0,
    erosionRate: 3.15,
    riskLevel: 'VERY_HIGH',
    riskColor: '#dc2626',
    actionPriority: 'Immediate Structural Defense & Managed Retreat',
    recordsCount: 14,
  },
  {
    name: 'Puri Coastline East',
    latitude: 19.7983,
    longitude: 85.8249,
    baselineYear: 2012,
    latestYear: 2025,
    baselinePosition: 138.0,
    latestPosition: 114.0,
    erosionRate: 1.85,
    riskLevel: 'MODERATE',
    riskColor: '#d97706',
    actionPriority: 'Active Monitoring & Dune Restoration',
    recordsCount: 14,
  },
];

const FALLBACK_SUMMARY: DashboardSummary = {
  totalMonitoredSegments: 5,
  highRiskSegmentsCount: 2,
  averageErosionRate: 1.97,
  maxErosionRate: 3.15,
  totalSurveysCount: 70,
  latestRun: null,
  riskDistribution: [
    { name: 'Low Risk (<1m/yr)', level: 'LOW', count: 1, color: '#0d9488' },
    { name: 'Moderate (1-2m/yr)', level: 'MODERATE', count: 2, color: '#d97706' },
    { name: 'High Risk (2-3m/yr)', level: 'HIGH', count: 1, color: '#ea580c' },
    { name: 'Very High (>=3m/yr)', level: 'VERY_HIGH', count: 1, color: '#dc2626' },
  ],
  segments: FALLBACK_SEGMENTS,
};

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [dashboardSummary, setDashboardSummary] = useState<DashboardSummary | null>(FALLBACK_SUMMARY);
  const [currentDataset, setCurrentDataset] = useState<DatasetDetail | null>(null);
  const [segments, setSegments] = useState<CoastalSegmentGeo[]>(FALLBACK_SEGMENTS);
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

      if (summaryData && summaryData.segments?.length > 0) {
        setDashboardSummary(summaryData);
        setSegments(summaryData.segments);
      }
      if (thData) {
        setThresholds(thData);
      }
      if (datasetsList && datasetsList.length > 0) {
        const fullDataset = await api.getDataset(datasetsList[0].id).catch(() => null);
        if (fullDataset) setCurrentDataset(fullDataset);
      }
    } catch (err) {
      console.warn('Initial data load notice:', err);
    } finally {
      setIsLoadingDashboard(false);
    }
  };

  const handleUpdateThresholds = async (newThresholds: RiskThresholds) => {
    const updated = await api.updateThresholds(newThresholds).catch(() => newThresholds);
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
      console.warn(err);
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

      {/* Main View Area (Responsive padding for mobile bottom nav + desktop footer) */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-3.5 py-4 sm:px-6 sm:py-7 pb-24 lg:pb-10">
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

      {/* Footer (Desktop & Tablet) */}
      <footer className="w-full border-t border-slate-800/80 bg-[#060d17] py-6 px-4 text-center text-xs text-slate-500 hidden sm:block">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">Coastal Erosion Prediction & Risk Assessment System</span>
            <span className="text-slate-600">•</span>
            <span className="text-cyan-400 font-medium">Responsive Mobile & Laptop Ready</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Linear Regression • Scikit-Learn • FastAPI • Spring Boot • Recharts • Leaflet
          </p>
        </div>
      </footer>
    </div>
  );
};
