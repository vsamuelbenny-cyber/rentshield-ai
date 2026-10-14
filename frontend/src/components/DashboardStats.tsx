import React from 'react';
import { ShieldCheck, Flame, AlertTriangle, ShieldAlert, Activity } from 'lucide-react';
import { DashboardStatsResponse } from '../types';

interface Props {
  stats: DashboardStatsResponse;
}

export const DashboardStats: React.FC<Props> = ({ stats }) => {
  return (
    <section aria-labelledby="dashboard-kpis-heading" className="mb-8">
      <h2 id="dashboard-kpis-heading" className="sr-only">
        Key Rental Fraud Detection Metrics
      </h2>

      <ul role="list" className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Total Scanned */}
        <li className="p-4 rounded-2xl bg-cyber-surface border border-cyber-border space-y-1">
          <div className="flex items-center justify-between text-slate-300 text-xs">
            <span>Total Scanned</span>
            <Activity className="w-4 h-4 text-cyber-neonCyan" aria-hidden="true" />
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">{stats.total_listings}</div>
          <p className="text-[11px] text-slate-300">Listings evaluated</p>
        </li>

        {/* Critical Risk */}
        <li className="p-4 rounded-2xl bg-cyber-surface border border-red-500/50 space-y-1 cyber-glow-red">
          <div className="flex items-center justify-between text-red-300 text-xs font-semibold">
            <span>Critical Risk</span>
            <Flame className="w-4 h-4 text-red-400" aria-hidden="true" />
          </div>
          <div className="text-2xl font-extrabold text-red-200 font-mono">{stats.critical_risk_count}</div>
          <p className="text-[11px] text-red-200 font-medium">Severe scam markers</p>
        </li>

        {/* High Risk */}
        <li className="p-4 rounded-2xl bg-cyber-surface border border-orange-500/50 space-y-1">
          <div className="flex items-center justify-between text-orange-300 text-xs font-semibold">
            <span>High Risk</span>
            <AlertTriangle className="w-4 h-4 text-orange-400" aria-hidden="true" />
          </div>
          <div className="text-2xl font-extrabold text-orange-200 font-mono">{stats.high_risk_count}</div>
          <p className="text-[11px] text-orange-200 font-medium">Major caution needed</p>
        </li>

        {/* Moderate Risk */}
        <li className="p-4 rounded-2xl bg-cyber-surface border border-amber-500/50 space-y-1">
          <div className="flex items-center justify-between text-amber-300 text-xs font-semibold">
            <span>Moderate Risk</span>
            <ShieldAlert className="w-4 h-4 text-amber-400" aria-hidden="true" />
          </div>
          <div className="text-2xl font-extrabold text-amber-200 font-mono">{stats.medium_risk_count}</div>
          <p className="text-[11px] text-amber-200 font-medium">Suspicious attributes</p>
        </li>

        {/* Low Risk */}
        <li className="p-4 rounded-2xl bg-cyber-surface border border-emerald-500/50 space-y-1 col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-emerald-300 text-xs font-semibold">
            <span>Low / Normal</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" aria-hidden="true" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-200 font-mono">{stats.low_risk_count}</div>
          <p className="text-[11px] text-emerald-200 font-medium">Standard market listings</p>
        </li>
      </ul>
    </section>
  );
};
