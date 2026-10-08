import React, { useState } from 'react';
import {
  Activity,
  BarChart3,
  Database,
  FileText,
  Menu,
  RotateCcw,
  Settings,
  ShieldAlert,
  Sparkles,
  Waves,
  X,
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity, shortLabel: 'Dashboard' },
    { id: 'workspace', label: 'Data Workspace', icon: Database, shortLabel: 'Data' },
    { id: 'prediction', label: 'Prediction Studio', icon: BarChart3, shortLabel: 'Predict' },
    { id: 'risk', label: 'Risk Explorer', icon: ShieldAlert, shortLabel: 'Risk' },
    { id: 'reports', label: 'Reports & Export', icon: FileText, shortLabel: 'Reports' },
  ];

  const handleTabClick = (tabId: string) => {
    onTabChange(tabId);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#070e17]/95 backdrop-blur-md transition-all">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-3.5 py-2.5 sm:px-6 sm:py-3">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-md shadow-cyan-500/25 shrink-0">
              <Waves className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-sm font-bold tracking-tight text-white sm:text-base md:text-lg">
                  COASTAL<span className="text-cyan-400">INTELLIGENCE</span>
                </span>
                <span className="rounded-full bg-cyan-950/90 px-1.5 py-0.5 text-[9px] font-bold text-cyan-400 border border-cyan-800/60 sm:text-[10px] sm:px-2">
                  PROD v1.0
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden md:block sm:text-[11px]">
                Shoreline Erosion Prediction & Environmental Decision System
              </p>
            </div>
          </div>

          {/* Desktop Navigation Tabs (Laptop / Desktop 1024px+) */}
          <nav className="hidden lg:flex items-center gap-1 bg-[#0c1829] p-1 rounded-xl border border-slate-800/80 shadow-inner">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-300 shadow-sm border border-cyan-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Action Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Load Demo Sample Data (Available on both mobile and desktop) */}
            <button
              onClick={onLoadSample}
              disabled={isLoadingSample}
              title="Load full multi-segment coastal survey dataset"
              className="flex items-center gap-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 px-2.5 py-1.5 text-xs font-semibold border border-slate-700/70 transition-all shadow-sm disabled:opacity-50 sm:px-3.5"
            >
              <Sparkles className={`h-3.5 w-3.5 text-amber-400 shrink-0 ${isLoadingSample ? 'animate-spin' : ''}`} />
              <span className="hidden xs:inline sm:inline">
                {isLoadingSample ? 'Loading...' : 'Demo Data'}
              </span>
            </button>

            {/* Risk Thresholds Config */}
            <button
              onClick={onOpenThresholdModal}
              title="Configure Risk Assessment Threshold Rules"
              className="flex items-center gap-1.5 rounded-xl bg-cyan-950/80 hover:bg-cyan-900/80 text-cyan-300 px-2.5 py-1.5 text-xs font-semibold border border-cyan-800/70 transition-all shadow-sm sm:px-3"
            >
              <Settings className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
              <span className="hidden sm:inline">Thresholds</span>
            </button>

            {/* Mobile Hamburger Drawer Toggle (Mobile / Tablet only) */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden flex items-center justify-center h-9 w-9 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
              aria-label="Toggle Navigation Menu"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Drawer when hamburger is open */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-800 bg-[#0a1628] px-4 py-3 space-y-2 shadow-2xl animate-in slide-in-from-top-2 duration-150">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 px-2 pt-1">
              Navigate System Modules
            </div>
            <div className="grid grid-cols-1 gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleTabClick(item.id)}
                    className={`flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                        : 'text-slate-300 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`h-4 w-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>
                    {isActive && <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-sm" />}
                  </button>
                );
              })}
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 px-1">
              <span>Mobile & Laptop Responsive</span>
              <span className="text-cyan-400 font-mono">100% Adaptive UI</span>
            </div>
          </div>
        )}

        {/* Mobile Horizontal Fast Scroll Bar (Small screens) */}
        <div className="flex lg:hidden overflow-x-auto border-t border-slate-800/60 bg-[#091422] px-2 py-1 scrollbar-none gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className={`h-3 w-3 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Mobile Sticky Bottom Navigation Bar (Optimized for 9:16 / 9:19.5 smartphone thumb reach) */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-[#070e17]/95 backdrop-blur-xl border-t border-slate-800/90 px-2 py-1.5 flex justify-around items-center pb-safe shadow-2xl">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
                isActive ? 'text-cyan-300 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div
                className={`flex h-7 w-7 items-center justify-center rounded-lg transition-all ${
                  isActive ? 'bg-cyan-500/20 text-cyan-400 shadow-sm border border-cyan-500/30' : ''
                }`}
              >
                <Icon className="h-4 w-4" />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight font-medium">
                {item.shortLabel}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
