import React from 'react';
import { ShieldCheck, Lock, AlertCircle } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer
      role="contentinfo"
      className="w-full border-t border-cyber-border bg-cyber-bg/95 py-8 mt-16 text-xs text-slate-300"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-cyber-neonTeal" aria-hidden="true" />
            <span className="font-semibold text-white">RentShield AI Protection System</span>
            <span>• Verified Scam Defense</span>
          </div>

          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1.5">
              <Lock className="w-3.5 h-3.5 text-cyber-neonCyan" aria-hidden="true" />
              <span>Zero External Uploads (Local pHash)</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-cyber-neonAmber" aria-hidden="true" />
              <span>Explainable Heuristics</span>
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-cyber-surface/80 border border-cyber-border text-[11px] leading-relaxed text-slate-200">
          <strong className="text-cyber-neonCyan">Important Transparency Notice:</strong> RentShield AI produces automated risk indicators by analyzing language patterns, regional price distributions, and perceptual photo hashes. Risk scores reflect heuristic suspicion levels and do not constitute a legal determination of fraud. Users must always verify deed ownership through official municipal records and never transfer funds before an in-person physical walkthrough.
        </div>
      </div>
    </footer>
  );
};
