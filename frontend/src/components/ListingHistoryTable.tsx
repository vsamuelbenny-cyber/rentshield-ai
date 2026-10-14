import React, { useState } from 'react';
import { Search, Eye, Trash2, Tag, MapPin } from 'lucide-react';
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
    <section aria-labelledby="registry-heading" className="p-5 rounded-2xl bg-cyber-surface border border-cyber-border space-y-4">
      {/* Table Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 id="registry-heading" className="text-sm font-bold text-white uppercase tracking-wider">
            Evaluated Listings Registry ({filteredListings.length})
          </h2>
          <p className="text-xs text-slate-300">
            History of scanned properties with heuristic risk assessments
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto" role="search" aria-label="Filter evaluated listings">
          <div className="relative flex-1 sm:w-48">
            <label htmlFor="history-search" className="sr-only">
              Filter listings by title or city
            </label>
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" aria-hidden="true" />
            <input
              id="history-search"
              type="search"
              placeholder="Filter title/city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-2.5 py-2 rounded-lg bg-cyber-card border border-cyber-border text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyber-neonTeal focus-visible:ring-2 focus-visible:ring-cyber-neonTeal min-h-[44px]"
            />
          </div>

          <div className="relative">
            <label htmlFor="history-tier-filter" className="sr-only">
              Filter listings by risk tier
            </label>
            <select
              id="history-tier-filter"
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="px-3 py-2 rounded-lg bg-cyber-card border border-cyber-border text-xs text-white focus:outline-none focus:border-cyber-neonTeal focus-visible:ring-2 focus-visible:ring-cyber-neonTeal font-medium min-h-[44px]"
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

      {/* Table with Full WCAG Accessible Table Semantics */}
      <div className="overflow-x-auto rounded-xl border border-cyber-border">
        <table className="w-full text-left text-xs">
          <caption className="sr-only">
            Evaluated rental listings audit table with risk scores, price analysis, and verification actions
          </caption>
          <thead className="bg-cyber-card/90 text-slate-300 uppercase font-mono text-[10px] tracking-wider border-b border-cyber-border">
            <tr>
              <th scope="col" className="py-3 px-4">Property / Title</th>
              <th scope="col" className="py-3 px-4">Location</th>
              <th scope="col" className="py-3 px-4">Monthly Rent</th>
              <th scope="col" className="py-3 px-4">Risk Evaluation</th>
              <th scope="col" className="py-3 px-4">Data Source</th>
              <th scope="col" className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cyber-border">
            {filteredListings.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-300">
                  No listings match the current filters.
                </td>
              </tr>
            ) : (
              filteredListings.map((item) => {
                const report = item.latest_report;
                const tier = report?.risk_tier || 'LOW';
                const score = report?.overall_score ?? 0;

                return (
                  <tr key={item.id} className="hover:bg-cyber-card/50 transition-colors">
                    <th scope="row" className="py-3.5 px-4 font-normal text-left">
                      <div className="font-semibold text-white max-w-xs truncate" title={item.title}>
                        {item.title}
                      </div>
                      <div className="text-[11px] text-slate-300 font-mono">
                        {item.bedrooms} BR • {item.bathrooms} BA {item.square_feet ? `• ${item.square_feet} sqft` : ''}
                      </div>
                    </th>

                    <td className="py-3.5 px-4 text-slate-200">
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-3 h-3 text-slate-400" aria-hidden="true" />
                        <span>{item.city}{item.state ? `, ${item.state}` : ''}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono">
                      <div className="font-bold text-white">${item.monthly_rent.toLocaleString()}/mo</div>
                      {item.security_deposit > 0 && (
                        <div className="text-[10px] text-slate-300">
                          Deposit: ${item.security_deposit.toLocaleString()}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      {report ? (
                        <RiskScoreBadge tier={tier} score={score} size="sm" />
                      ) : (
                        <span className="text-slate-400">Not Scanned</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      {item.is_sample ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded text-[10px] font-mono bg-blue-950/80 text-blue-200 border border-blue-500/50">
                          <Tag className="w-2.5 h-2.5" aria-hidden="true" />
                          <span>Demo Scenario</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded text-[10px] font-mono bg-slate-800 text-slate-200 border border-slate-600">
                          <span>User Scan</span>
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {report && (
                          <button
                            type="button"
                            onClick={() => onViewReport(report)}
                            aria-label={`View full risk evaluation report for ${item.title}`}
                            className="p-2.5 rounded-lg bg-cyber-card hover:bg-cyber-cardHover text-cyber-neonTeal border border-cyber-border transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-cyber-neonTeal focus-visible:outline-none"
                          >
                            <Eye className="w-4 h-4" aria-hidden="true" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => onDeleteListing(item.id)}
                          aria-label={`Delete listing record for ${item.title}`}
                          className="p-2.5 rounded-lg bg-cyber-card hover:bg-red-950 text-slate-300 hover:text-red-300 border border-cyber-border transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:outline-none"
                        >
                          <Trash2 className="w-4 h-4" aria-hidden="true" />
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
    </section>
  );
};
