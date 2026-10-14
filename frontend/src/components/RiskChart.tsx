import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis
} from 'recharts';
import { DashboardStatsResponse } from '../types';

interface Props {
  stats: DashboardStatsResponse;
}

export const RiskChart: React.FC<Props> = ({ stats }) => {
  const pieData = [
    { name: 'Low Risk', value: stats.low_risk_count, color: '#10B981' },
    { name: 'Moderate Risk', value: stats.medium_risk_count, color: '#F59E0B' },
    { name: 'High Risk', value: stats.high_risk_count, color: '#F97316' },
    { name: 'Critical Scam', value: stats.critical_risk_count, color: '#EF4444' },
  ].filter(d => d.value > 0);

  const barData = stats.common_flags.slice(0, 6).map((f) => ({
    name: f.flag_name.length > 25 ? f.flag_name.substring(0, 22) + '...' : f.flag_name,
    count: f.count,
    category: f.category,
  }));

  const customTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="p-2.5 rounded-lg bg-cyber-surface border border-cyber-border text-xs shadow-xl">
          <p className="font-semibold text-white">{data.name}</p>
          <p className="font-mono text-cyber-neonTeal">Occurrences: {data.value}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Chart 1: Risk Distribution */}
      <div className="p-5 rounded-2xl bg-cyber-surface border border-cyber-border flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1">
            Risk Classification Distribution
          </h3>
          <p className="text-xs text-cyber-textMuted mb-4">
            Aggregated breakdown of listings evaluated by RentShield AI
          </p>
        </div>

        <div className="h-64 w-full flex items-center justify-center">
          {pieData.length === 0 ? (
            <span className="text-xs text-cyber-textMuted">No scan data available yet.</span>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={customTooltip} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 text-xs pt-3 border-t border-cyber-border">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span className="text-cyber-textMuted">Low ({stats.low_risk_count})</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span className="text-cyber-textMuted">Moderate ({stats.medium_risk_count})</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
            <span className="text-cyber-textMuted">High ({stats.high_risk_count})</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
            <span className="text-cyber-textMuted">Critical ({stats.critical_risk_count})</span>
          </div>
        </div>
      </div>

      {/* Chart 2: Top Scam Indicators */}
      <div className="p-5 rounded-2xl bg-cyber-surface border border-cyber-border flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1">
            Top Detected Scam Indicators
          </h3>
          <p className="text-xs text-cyber-textMuted mb-4">
            Most frequent payment triggers and fraud tropes
          </p>
        </div>

        <div className="h-64 w-full">
          {barData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-cyber-textMuted">
              No fraud flags recorded yet.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} layout="vertical" margin={{ left: 10, right: 20, top: 10, bottom: 10 }}>
                <XAxis type="number" stroke="#64748B" fontSize={11} />
                <YAxis dataKey="name" type="category" stroke="#94A3B8" fontSize={11} width={130} />
                <Tooltip content={customTooltip} />
                <Bar dataKey="count" fill="#00F5D4" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="text-[11px] text-cyber-textMuted text-right pt-2 border-t border-cyber-border">
          Live aggregation from SQLite scan records
        </div>
      </div>
    </div>
  );
};
