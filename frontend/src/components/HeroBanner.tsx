import React from 'react';
import { ShieldCheck, Cpu, FileSearch, Sparkles, AlertTriangle } from 'lucide-react';

export const HeroBanner: React.FC = () => {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-cyber-border bg-gradient-to-br from-cyber-card via-cyber-surface to-[#0d1627] p-6 sm:p-8 mb-8 cyber-glow-teal">
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 max-w-4xl">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyber-bg/80 border border-cyber-neonTeal/30 text-cyber-neonTeal text-xs font-mono mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>MULTI-VECTOR RENTAL FRAUD DEFENSE ENGINE</span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white mb-3">
          Detect Rental Scams & Phantom Listings Before You Pay
        </h1>

        <p className="text-sm sm:text-base text-cyber-textMuted leading-relaxed mb-6 max-w-3xl">
          Paste any rental listing to instantly scan for high-pressure advance-fee traps, offshore landlord tropes, extreme price discounts compared against city benchmarks, and duplicate photos reused across the web.
        </p>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-cyber-bg/60 border border-cyber-border/70 flex items-start space-x-2.5">
            <FileSearch className="w-4 h-4 text-cyber-neonCyan shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-white block">Text Heuristics</span>
              <span className="text-[11px] text-cyber-textMuted">Wire, Zelle, and urgency NLP rules</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-cyber-bg/60 border border-cyber-border/70 flex items-start space-x-2.5">
            <Cpu className="w-4 h-4 text-cyber-neonTeal shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-white block">Price Z-Score</span>
              <span className="text-[11px] text-cyber-textMuted">Flag suspiciously cheap lures</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-cyber-bg/60 border border-cyber-border/70 flex items-start space-x-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-white block">Perceptual Hash</span>
              <span className="text-[11px] text-cyber-textMuted">Identify reused listing photos</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-cyber-bg/60 border border-cyber-border/70 flex items-start space-x-2.5">
            <AlertTriangle className="w-4 h-4 text-cyber-neonAmber shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-white block">Explainable AI</span>
              <span className="text-[11px] text-cyber-textMuted">Clear evidence & safety actions</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
