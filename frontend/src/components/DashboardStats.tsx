import React from 'react';
import { ShieldCheck, Flame, AlertTriangle, ShieldAlert, Activity } from 'lucide-react';
import { DashboardStatsResponse } from '../types';

interface Props {
  stats: DashboardStatsResponse;
}

export const DashboardStats: React.FC<Props> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 mb-8">
      {/* Total Scanned */}
      <div className="p-4 rounded-2xl bg-cyber-surface border border-cyber-border space-y-1">
        <div className="flex items-center justify-between text-cyber-textMuted text-xs">
          <span>Total Scanned</span>
          <Activity className="w-4 h-4 text-cyber-neonCyan" />
        </div>
        <div className="text-2xl font-extrabold text-white font-mono">{stats.total_listings}</div>
        <p className="text-[11px] text-cyber-textMuted">Listings evaluated</p>
      </div>

      {/* Critical Risk */}
      <div className="p-4 rounded-2xl bg-cyber-surface border border-red-500/30 space-y-1 cyber-glow-red">
        <div className="flex items-center justify-between text-red-400 text-xs">
          <span>Critical Risk</span>
          <Flame className="w-4 h-4" />
        </div>
        <div className="text-2xl font-extrabold text-red-400 font-mono">{stats.critical_risk_count}</div>
        <p className="text-[11px] text-red-300/70">Severe scam markers</p>
      </div>

      {/* High Risk */}
      <div className="p-4 rounded-2xl bg-cyber-surface border border-orange-500/30 space-y-1">
        <div className="flex items-center justify-between text-orange-400 text-xs">
          <span>High Risk</span>
          <AlertTriangle className="w-4 h-4" />
        </div>
        <div className="text-2xl font-extrabold text-orange-400 font-mono">{stats.high_risk_count}</div>
        <p className="text-[11px] text-orange-300/70">Major caution needed</p>
      </div>

      {/* Moderate Risk */}
      <div className="p-4 rounded-2xl bg-cyber-surface border border-amber-500/30 space-y-1">
        <div className="flex items-center justify-between text-amber-400 text-xs">
          <span>Moderate Risk</span>
          <ShieldAlert className="w-4 h-4" />
        </div>
        <div className="text-2xl font-extrabold text-amber-400 font-mono">{stats.medium_risk_count}</div>
        <p className="text-[11px] text-amber-300/70">Suspicious attributes</p>
      </div>

      {/* Low Risk */}
      <div className="p-4 rounded-2xl bg-cyber-surface border border-emerald-500/30 space-y-1 col-span-2 lg:col-span-1">
        <div className="flex items-center justify-between text-emerald-400 text-xs">
          <span>Low / Normal</span>
          <ShieldCheck className="w-4 h-4" />
        </div>
        <div className="text-2xl font-extrabold text-emerald-400 font-mono">{stats.low_risk_count}</div>
        <p className="text-[11px] text-emerald-300/70">Standard market listings</p>
      </div>
    </div>
  );
};
