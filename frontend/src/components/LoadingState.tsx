import React from 'react';
import { Waves } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  subMessage?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Processing Environmental Data...',
  subMessage = 'Running mathematical trend regressions and risk models',
}) => {
  return (
    <div className="flex min-h-[300px] w-full flex-col items-center justify-center rounded-2xl bg-slate-900/40 border border-slate-800/80 p-8 text-center">
      <div className="relative mb-4 flex items-center justify-center">
        <div className="h-16 w-16 rounded-full border-2 border-cyan-500/20 border-t-cyan-400 animate-spin" />
        <Waves className="absolute h-6 w-6 text-cyan-400 animate-pulse" />
      </div>
      <h4 className="text-sm font-semibold text-slate-200">{message}</h4>
      <p className="mt-1 text-xs text-slate-400 max-w-sm">{subMessage}</p>
    </div>
  );
};
