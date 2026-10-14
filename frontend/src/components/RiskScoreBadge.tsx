import React from 'react';
import { RiskTier } from '../types';
import { ShieldCheck, ShieldAlert, AlertTriangle, Flame } from 'lucide-react';

interface Props {
  tier: RiskTier;
  score?: number;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const RiskScoreBadge: React.FC<Props> = ({
  tier,
  score,
  size = 'md',
  showIcon = true,
}) => {
  const getStyles = () => {
    switch (tier) {
      case 'CRITICAL':
        return {
          bg: 'bg-red-950/70 border-red-500/60 text-red-300 shadow-[0_0_12px_rgba(239,68,68,0.3)]',
          dot: 'bg-red-400 animate-ping',
          icon: Flame,
          label: 'CRITICAL FRAUD RISK',
        };
      case 'HIGH':
        return {
          bg: 'bg-orange-950/60 border-orange-500/50 text-orange-300 shadow-[0_0_10px_rgba(249,115,22,0.25)]',
          dot: 'bg-orange-400',
          icon: AlertTriangle,
          label: 'HIGH RISK WARNING',
        };
      case 'MEDIUM':
        return {
          bg: 'bg-amber-950/60 border-amber-500/50 text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.2)]',
          dot: 'bg-amber-400',
          icon: ShieldAlert,
          label: 'MODERATE RISK',
        };
      case 'LOW':
      default:
        return {
          bg: 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.2)]',
          dot: 'bg-emerald-400',
          icon: ShieldCheck,
          label: 'LOW RISK / NORMAL',
        };
    }
  };

  const style = getStyles();
  const IconComponent = style.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 space-x-1.5',
    md: 'text-xs font-semibold px-2.5 py-1 space-x-2',
    lg: 'text-sm font-bold px-3.5 py-1.5 space-x-2.5',
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-full border backdrop-blur-md transition-all ${style.bg} ${sizeClasses}`}
    >
      <span className="relative flex h-2 w-2">
        <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${style.dot}`}></span>
        <span className={`relative inline-flex rounded-full h-2 w-2 ${style.dot.replace('animate-ping', '')}`}></span>
      </span>
      {showIcon && <IconComponent className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />}
      <span>{style.label}</span>
      {score !== undefined && (
        <span className="ml-1 opacity-80 font-mono">({score}/100)</span>
      )}
    </span>
  );
};
