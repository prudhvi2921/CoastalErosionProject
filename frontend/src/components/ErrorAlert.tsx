import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ErrorAlertProps {
  title?: string;
  message: string;
  onDismiss?: () => void;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({
  title = 'System Validation Issue',
  message,
  onDismiss,
}) => {
  return (
    <div className="flex items-start justify-between rounded-xl bg-red-950/70 border border-red-800/80 p-4 text-xs text-red-200 shadow-lg backdrop-blur-sm">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 shrink-0 text-red-400 mt-0.5" />
        <div>
          <h4 className="font-semibold text-red-300">{title}</h4>
          <p className="mt-0.5 text-red-200/90 leading-relaxed">{message}</p>
        </div>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="rounded-lg p-1 text-red-400 hover:bg-red-900/50 hover:text-red-200 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};
