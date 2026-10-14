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
    <nav className="sticky top-0 z-40 w-full border-b border-cyber-border bg-cyber-bg/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('scanner')}>
            <div className="relative p-2 rounded-xl bg-gradient-to-br from-cyan-500/20 to-teal-500/10 border border-cyan-500/30">
              <Shield className="w-6 h-6 text-cyber-neonTeal" />
              <div className="absolute inset-0 bg-cyber-neonTeal/10 blur-sm rounded-xl"></div>
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-lg tracking-wider text-white">RentShield</span>
                <span className="text-xs font-mono font-bold bg-cyan-950 text-cyber-neonCyan border border-cyan-800/80 px-1.5 py-0.5 rounded">AI</span>
              </div>
              <p className="text-[10px] text-cyber-textMuted tracking-tight hidden sm:block">Rental Scam & Fake Listing Detector</p>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            <button
              onClick={() => setActiveTab('scanner')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'scanner'
                  ? 'bg-cyber-card border border-cyber-neonTeal/40 text-cyber-neonTeal shadow-[0_0_15px_rgba(0,245,212,0.15)]'
                  : 'text-cyber-textMuted hover:text-white hover:bg-cyber-card/50'
              }`}
            >
              <SearchCode className="w-4 h-4" />
              <span>Listing Scanner</span>
            </button>

            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-cyber-card border border-cyber-neonTeal/40 text-cyber-neonTeal shadow-[0_0_15px_rgba(0,245,212,0.15)]'
                  : 'text-cyber-textMuted hover:text-white hover:bg-cyber-card/50'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Scam Analytics</span>
            </button>

            <button
              onClick={() => setActiveTab('safety')}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'safety'
                  ? 'bg-cyber-card border border-cyber-neonTeal/40 text-cyber-neonTeal shadow-[0_0_15px_rgba(0,245,212,0.15)]'
                  : 'text-cyber-textMuted hover:text-white hover:bg-cyber-card/50'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              <span>Safety Guide</span>
            </button>
          </div>

          {/* System Status Indicator */}
          <div className="hidden md:flex items-center space-x-2 px-3 py-1 rounded-full bg-cyber-card border border-cyber-border text-xs font-mono">
            <Activity className="w-3.5 h-3.5 text-cyber-neonCyan" />
            <span className="text-cyber-textMuted">AI Engine:</span>
            {isHealthy === true ? (
              <span className="text-emerald-400 flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
                <span>ONLINE</span>
              </span>
            ) : isHealthy === false ? (
              <span className="text-amber-400">DISCONNECTED</span>
            ) : (
              <span className="text-slate-400">CONNECTING...</span>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
