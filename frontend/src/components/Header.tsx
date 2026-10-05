import React from 'react';
import {
  Activity,
  BarChart3,
  Database,
  FileText,
  Settings,
  ShieldAlert,
  Sparkles,
  Waves,
} from 'lucide-react';

interface HeaderProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  onOpenThresholdModal: () => void;
  onLoadSample: () => void;
  isLoadingSample?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onTabChange,
  onOpenThresholdModal,
  onLoadSample,
  isLoadingSample = false,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'workspace', label: 'Data Workspace', icon: Database },
    { id: 'prediction', label: 'Prediction Studio', icon: BarChart3 },
    { id: 'risk', label: 'Risk Explorer', icon: ShieldAlert },
    { id: 'reports', label: 'Reports & Export', icon: FileText },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#070e17]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-md shadow-cyan-500/20">
            <Waves className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight text-white sm:text-lg">
                COASTAL<span className="text-cyan-400">INTELLIGENCE</span>
              </span>
              <span className="rounded-full bg-cyan-950/80 px-2 py-0.5 text-[10px] font-semibold text-cyan-400 border border-cyan-800/50">
                PROD v1.0
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Shoreline Erosion Prediction & Environmental Decision System
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden lg:flex items-center gap-1 bg-[#0c1829] p-1 rounded-xl border border-slate-800/80">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 shadow-sm border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={onLoadSample}
            disabled={isLoadingSample}
            title="Load sample national coastal survey"
            className="hidden sm:flex items-center gap-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 px-3 py-1.5 text-xs font-medium border border-slate-700/60 transition-colors shadow-sm disabled:opacity-50"
          >
            <Sparkles className={`h-3.5 w-3.5 text-amber-400 ${isLoadingSample ? 'animate-spin' : ''}`} />
            <span>{isLoadingSample ? 'Loading Demo...' : 'Load Sample Data'}</span>
          </button>

          <button
            onClick={onOpenThresholdModal}
            title="Configure Risk Assessment Thresholds"
            className="flex items-center gap-1.5 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 px-3 py-1.5 text-xs font-medium border border-cyan-800/60 transition-colors shadow-sm"
          >
            <Settings className="h-3.5 w-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Risk Thresholds</span>
          </button>
        </div>
      </div>

      {/* Mobile Tab Bar */}
      <div className="flex lg:hidden overflow-x-auto border-t border-slate-800/60 bg-[#091422] px-2 py-1.5 scrollbar-none gap-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {item.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};
