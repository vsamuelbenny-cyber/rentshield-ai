import React, { useEffect, useState } from 'react';
import { Shield, Activity, BarChart3, HelpCircle, SearchCode } from 'lucide-react';
import { api } from '../services/api';

interface Props {
  activeTab: 'scanner' | 'dashboard' | 'safety';
  setActiveTab: (tab: 'scanner' | 'dashboard' | 'safety') => void;
}

export const Navbar: React.FC<Props> = ({ activeTab, setActiveTab }) => {
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null);

  useEffect(() => {
    api.checkHealth()
      .then(() => setIsHealthy(true))
      .catch(() => setIsHealthy(false));
  }, []);

  return (
    <nav
      aria-label="Main Navigation"
      className="sticky top-0 z-40 w-full border-b border-cyber-border bg-cyber-bg/95 backdrop-blur-md"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title - Semantic Button for Keyboard Accessibility */}
          <button
            type="button"
            onClick={() => setActiveTab('scanner')}
            className="flex items-center space-x-3 text-left rounded-xl p-1.5 transition-all focus-visible:ring-2 focus-visible:ring-cyber-neonTeal focus-visible:outline-none min-h-[44px]"
            aria-label="RentShield AI, navigate to listing scanner"
          >
            <div className="relative p-2 rounded-xl bg-gradient-to-br from-cyan-500/20 to-teal-500/10 border border-cyan-500/30">
              <Shield className="w-6 h-6 text-cyber-neonTeal" aria-hidden="true" />
              <div className="absolute inset-0 bg-cyber-neonTeal/10 blur-sm rounded-xl" aria-hidden="true"></div>
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-lg tracking-wider text-white">RentShield</span>
                <span className="text-xs font-mono font-bold bg-cyan-950 text-cyber-neonCyan border border-cyan-800/80 px-1.5 py-0.5 rounded">
                  AI
                </span>
              </div>
              <p className="text-[10px] text-cyber-textMuted tracking-tight hidden sm:block">
                Rental Scam &amp; Fake Listing Detector
              </p>
            </div>
          </button>

          {/* Navigation Links with aria-current */}
          <div className="flex items-center space-x-1 sm:space-x-2" role="group" aria-label="Page Navigation">
            <button
              type="button"
              onClick={() => setActiveTab('scanner')}
              aria-current={activeTab === 'scanner' ? 'page' : undefined}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all min-h-[44px] focus-visible:ring-2 focus-visible:ring-cyber-neonTeal focus-visible:outline-none ${
                activeTab === 'scanner'
                  ? 'bg-cyber-card border border-cyber-neonTeal/50 text-cyber-neonTeal shadow-[0_0_15px_rgba(0,245,212,0.15)] font-semibold'
                  : 'text-cyber-textMuted hover:text-white hover:bg-cyber-card/60'
              }`}
            >
              <SearchCode className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>Listing Scanner</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('dashboard')}
              aria-current={activeTab === 'dashboard' ? 'page' : undefined}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all min-h-[44px] focus-visible:ring-2 focus-visible:ring-cyber-neonTeal focus-visible:outline-none ${
                activeTab === 'dashboard'
                  ? 'bg-cyber-card border border-cyber-neonTeal/50 text-cyber-neonTeal shadow-[0_0_15px_rgba(0,245,212,0.15)] font-semibold'
                  : 'text-cyber-textMuted hover:text-white hover:bg-cyber-card/60'
              }`}
            >
              <BarChart3 className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>Scam Analytics</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('safety')}
              aria-current={activeTab === 'safety' ? 'page' : undefined}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all min-h-[44px] focus-visible:ring-2 focus-visible:ring-cyber-neonTeal focus-visible:outline-none ${
                activeTab === 'safety'
                  ? 'bg-cyber-card border border-cyber-neonTeal/50 text-cyber-neonTeal shadow-[0_0_15px_rgba(0,245,212,0.15)] font-semibold'
                  : 'text-cyber-textMuted hover:text-white hover:bg-cyber-card/60'
              }`}
            >
              <HelpCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>Safety Guide</span>
            </button>
          </div>

          {/* System Status Indicator - Announced to Screen Readers */}
          <div
            role="status"
            aria-live="polite"
            className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-cyber-card border border-cyber-border text-xs font-mono"
          >
            <Activity className="w-3.5 h-3.5 text-cyber-neonCyan" aria-hidden="true" />
            <span className="text-slate-300">AI Engine:</span>
            {isHealthy === true ? (
              <span className="text-emerald-300 font-semibold flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" aria-hidden="true"></span>
                <span>ONLINE</span>
              </span>
            ) : isHealthy === false ? (
              <span className="text-amber-300 font-semibold">STANDALONE (CLIENT FALLBACK)</span>
            ) : (
              <span className="text-slate-300 font-semibold">CONNECTING...</span>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
