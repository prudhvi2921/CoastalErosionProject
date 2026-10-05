import React from 'react';
import { RiskLevel } from '../types';

interface RiskBadgeProps {
  level: RiskLevel;
  size?: 'sm' | 'md' | 'lg';
  showDot?: boolean;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level, size = 'md', showDot = true }) => {
  const configs: Record<RiskLevel, { bg: string; text: string; border: string; dot: string; label: string }> = {
    LOW: {
      bg: 'bg-emerald-950/60',
      text: 'text-emerald-400',
      border: 'border-emerald-500/30',
      dot: 'bg-emerald-400',
      label: 'LOW RISK',
    },
    MODERATE: {
      bg: 'bg-amber-950/60',
      text: 'text-amber-400',
      border: 'border-amber-500/30',
      dot: 'bg-amber-400',
      label: 'MODERATE',
    },
    HIGH: {
      bg: 'bg-orange-950/60',
      text: 'text-orange-400',
      border: 'border-orange-500/30',
      dot: 'bg-orange-400',
      label: 'HIGH RISK',
    },
    VERY_HIGH: {
      bg: 'bg-red-950/60',
      text: 'text-red-400',
      border: 'border-red-500/30',
      dot: 'bg-red-400',
      label: 'VERY HIGH',
    },
  };

  const c = configs[level] || configs.LOW;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1.5',
    md: 'text-xs px-2.5 py-1 gap-2 font-medium',
    lg: 'text-sm px-3.5 py-1.5 gap-2.5 font-semibold',
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-full border ${c.bg} ${c.text} ${c.border} ${sizeClasses} shadow-sm backdrop-blur-sm`}
    >
      {showDot && (
        <span className={`h-1.5 w-1.5 rounded-full ${c.dot} animate-pulse`} />
      )}
      <span>{c.label}</span>
    </span>
  );
};
