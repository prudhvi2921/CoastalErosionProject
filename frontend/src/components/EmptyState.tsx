import React from 'react';
import { FileSpreadsheet, PlusCircle } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ElementType;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionText,
  onAction,
  icon: Icon = FileSpreadsheet,
}) => {
  return (
    <div className="flex min-h-[320px] w-full flex-col items-center justify-center rounded-2xl bg-slate-900/30 border border-slate-800/80 p-8 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800/80 border border-slate-700/80 text-cyan-400 shadow-inner">
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="text-base font-semibold text-slate-200">{title}</h3>
      <p className="mt-1.5 max-w-md text-xs text-slate-400 leading-relaxed">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 text-xs font-semibold shadow-lg shadow-cyan-600/25 transition-all"
        >
          <PlusCircle className="h-4 w-4" />
          <span>{actionText}</span>
        </button>
      )}
    </div>
  );
};
