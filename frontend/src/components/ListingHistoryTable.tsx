import React, { useState } from 'react';
import { Search, Filter, Eye, Trash2, Tag, Calendar, MapPin, DollarSign } from 'lucide-react';
import { ListingItem, ScanReportResponse } from '../types';
import { RiskScoreBadge } from './RiskScoreBadge';

interface Props {
  listings: ListingItem[];
  onViewReport: (report: ScanReportResponse) => void;
  onDeleteListing: (id: number) => void;
  onRefresh: () => void;
}

export const ListingHistoryTable: React.FC<Props> = ({
  listings,
  onViewReport,
  onDeleteListing,
  onRefresh
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState('ALL');

  const filteredListings = listings.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.state && item.state.toLowerCase().includes(searchTerm.toLowerCase()));

    const itemTier = item.latest_report?.risk_tier || 'LOW';
    const matchesTier = tierFilter === 'ALL' || itemTier.toUpperCase() === tierFilter.toUpperCase();

    return matchesSearch && matchesTier;
  });

  return (
    <div className="p-5 rounded-2xl bg-cyber-surface border border-cyber-border space-y-4">
      {/* Table Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Evaluated Listings Registry ({filteredListings.length})
          </h3>
          <p className="text-xs text-cyber-textMuted">
            History of scanned properties with heuristic risk assessments
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-48">
            <Search className="w-3.5 h-3.5 text-cyber-textMuted absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Filter title/city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-2.5 py-1.5 rounded-lg bg-cyber-card border border-cyber-border text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyber-neonTeal"
            />
          </div>

          <div className="relative">
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-lg bg-cyber-card border border-cyber-border text-xs text-white focus:outline-none focus:border-cyber-neonTeal font-medium"
            >
              <option value="ALL">All Risk Tiers</option>
              <option value="CRITICAL">Critical Risk</option>
              <option value="HIGH">High Risk</option>
              <option value="MEDIUM">Moderate Risk</option>
              <option value="LOW">Low Risk</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-cyber-border">
        <table className="w-full text-left text-xs">
          <thead className="bg-cyber-card/80 text-cyber-textMuted uppercase font-mono text-[10px] tracking-wider border-b border-cyber-border">
            <tr>
              <th className="py-3 px-4">Property / Title</th>
              <th className="py-3 px-4">Location</th>
              <th className="py-3 px-4">Monthly Rent</th>
              <th className="py-3 px-4">Risk Evaluation</th>
              <th className="py-3 px-4">Data Source</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cyber-border/60">
            {filteredListings.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-cyber-textMuted">
                  No listings match the current filters.
                </td>
              </tr>
            ) : (
              filteredListings.map((item) => {
                const report = item.latest_report;
                const tier = report?.risk_tier || 'LOW';
                const score = report?.overall_score ?? 0;

                return (
                  <tr key={item.id} className="hover:bg-cyber-card/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white max-w-xs truncate" title={item.title}>
                        {item.title}
                      </div>
                      <div className="text-[11px] text-cyber-textMuted font-mono">
                        {item.bedrooms} BR • {item.bathrooms} BA {item.square_feet ? `• ${item.square_feet} sqft` : ''}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-300">
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-3 h-3 text-cyber-textMuted" />
                        <span>{item.city}{item.state ? `, ${item.state}` : ''}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono">
                      <div className="font-bold text-white">${item.monthly_rent.toLocaleString()}/mo</div>
                      {item.security_deposit > 0 && (
                        <div className="text-[10px] text-cyber-textMuted">
                          Deposit: ${item.security_deposit.toLocaleString()}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      {report ? (
                        <RiskScoreBadge tier={tier} score={score} size="sm" />
                      ) : (
                        <span className="text-cyber-textMuted">Not Scanned</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      {item.is_sample ? (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-mono bg-blue-950/60 text-blue-300 border border-blue-500/40">
                          <Tag className="w-2.5 h-2.5" />
                          <span>Demo Scenario</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300">
                          <span>User Scan</span>
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {report && (
                          <button
                            onClick={() => onViewReport(report)}
                            title="View Full Risk Report"
                            className="p-1.5 rounded-lg bg-cyber-card hover:bg-cyber-cardHover text-cyber-neonTeal border border-cyber-border transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => onDeleteListing(item.id)}
                          title="Delete Listing"
                          className="p-1.5 rounded-lg bg-cyber-card hover:bg-red-950 text-slate-400 hover:text-red-400 border border-cyber-border transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
