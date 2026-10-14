import React, { useEffect, useState } from 'react';
import { RefreshCw, BarChart2, ShieldAlert } from 'lucide-react';
import { DashboardStats } from '../components/DashboardStats';
import { RiskChart } from '../components/RiskChart';
import { ListingHistoryTable } from '../components/ListingHistoryTable';
import { RiskReportModal } from '../components/RiskReportModal';
import { DashboardStatsResponse, ListingItem, ScanReportResponse } from '../types';
import { api } from '../services/api';

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStatsResponse | null>(null);
  const [listings, setListings] = useState<ListingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeReport, setActiveReport] = useState<ScanReportResponse | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsData, listingsData] = await Promise.all([
        api.getDashboardStats(),
        api.getListings()
      ]);
      setStats(statsData);
      setListings(listingsData);
    } catch (err) {
      console.error("Error loading dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeleteListing = async (id: number) => {
    if (!window.confirm(`Are you sure you want to remove listing #${id}?`)) return;
    try {
      await api.deleteListing(id);
      loadData();
    } catch (err) {
      console.error("Failed to delete listing:", err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 mb-6 border-b border-cyber-border gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white flex items-center space-x-2.5">
            <BarChart2 className="w-6 h-6 text-cyber-neonTeal" />
            <span>Rental Scam Analytics & Scan History</span>
          </h1>
          <p className="text-xs text-cyber-textMuted mt-1">
            Aggregated metrics, risk distribution charts, and audit history from local SQLite registry.
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-cyber-card hover:bg-cyber-cardHover border border-cyber-border text-xs text-cyber-neonTeal font-medium transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {stats ? (
        <>
          <DashboardStats stats={stats} />
          <RiskChart stats={stats} />
        </>
      ) : (
        <div className="h-48 rounded-2xl bg-cyber-surface border border-cyber-border flex items-center justify-center text-xs text-cyber-textMuted animate-pulse mb-8">
          Loading analytics metrics...
        </div>
      )}

      <ListingHistoryTable
        listings={listings}
        onViewReport={(rep) => setActiveReport(rep)}
        onDeleteListing={handleDeleteListing}
        onRefresh={loadData}
      />

      {activeReport && (
        <RiskReportModal
          report={activeReport}
          onClose={() => setActiveReport(null)}
        />
      )}
    </div>
  );
};
