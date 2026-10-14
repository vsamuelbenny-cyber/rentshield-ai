import React, { useEffect, useState } from 'react';
import { Sparkles, ArrowRight, ShieldCheck, AlertOctagon, DollarSign, Send } from 'lucide-react';
import { SampleListingItem } from '../types';
import { api } from '../services/api';

interface Props {
  onSelectSample: (sample: SampleListingItem) => void;
  selectedSampleTag?: string;
}

export const SampleListingLoader: React.FC<Props> = ({ onSelectSample, selectedSampleTag }) => {
  const [samples, setSamples] = useState<SampleListingItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    api.getSampleListings()
      .then((data) => setSamples(data))
      .catch((err) => console.error("Could not load samples:", err))
      .finally(() => setLoading(false));
  }, []);

  const getScenarioBadge = (tag: string) => {
    switch (tag) {
      case 'wire_transfer_urgency':
        return {
          title: 'Wire Transfer Urgency',
          icon: Send,
          color: 'text-red-200 bg-red-950/80 border-red-500/50',
          desc: 'Missionary trope, Western Union transfer, mailed keys'
        };
      case 'too_good_to_be_true_price':
        return {
          title: 'Unrealistic Price Lure',
          icon: DollarSign,
          color: 'text-orange-200 bg-orange-950/80 border-orange-500/50',
          desc: 'Miami 3BR luxury penthouse listed at $850/mo'
        };
      case 'deposit_before_viewing_zelle':
        return {
          title: 'Deposit Before Tour',
          icon: AlertOctagon,
          color: 'text-amber-200 bg-amber-950/80 border-amber-500/50',
          desc: 'Demands Zelle fee prior to providing lockbox code'
        };
      case 'legitimate_listing':
      default:
        return {
          title: 'Legitimate Standard Lease',
          icon: ShieldCheck,
          color: 'text-emerald-200 bg-emerald-950/80 border-emerald-500/50',
          desc: 'Market-rate 2BR, background check, in-person tour'
        };
    }
  };

  if (loading) {
    return (
      <div
        role="status"
        aria-label="Loading sample listing scenarios"
        className="p-4 rounded-xl bg-cyber-surface border border-cyber-border animate-pulse mb-6"
      >
        <div className="h-4 bg-cyber-card rounded w-1/4 mb-3"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-cyber-card rounded-lg"></div>
          ))}
        </div>
        <span className="sr-only">Loading demo listing scenarios...</span>
      </div>
    );
  }

  return (
    <section
      aria-labelledby="sample-scenarios-heading"
      className="p-5 rounded-2xl bg-cyber-surface/90 border border-cyber-border mb-8"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-cyber-neonTeal" aria-hidden="true" />
          <h2 id="sample-scenarios-heading" className="text-sm font-bold text-white uppercase tracking-wider">
            1-Click Demo Scenarios (Interactive Test Suite)
          </h2>
        </div>
        <span className="text-[11px] text-slate-300 hidden sm:inline">
          Click any preset to auto-fill the scanner form
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3" role="group" aria-label="Sample listing presets">
        {samples.map((sample) => {
          const badge = getScenarioBadge(sample.sample_tag);
          const Icon = badge.icon;
          const isSelected = selectedSampleTag === sample.sample_tag;

          return (
            <button
              key={sample.id}
              type="button"
              onClick={() => onSelectSample(sample)}
              aria-pressed={isSelected}
              aria-label={`Load demo preset: ${badge.title} (${sample.title}), $${sample.monthly_rent} monthly rent in ${sample.city}. ${badge.desc}`}
              className={`p-3.5 rounded-xl border text-left transition-all relative group flex flex-col justify-between min-h-[44px] focus-visible:ring-2 focus-visible:ring-cyber-neonTeal focus-visible:outline-none ${
                isSelected
                  ? 'bg-cyber-card border-cyber-neonTeal shadow-[0_0_15px_rgba(0,245,212,0.2)] ring-1 ring-cyber-neonTeal'
                  : 'bg-cyber-card/70 border-cyber-border hover:border-cyber-neonTeal/50 hover:bg-cyber-card'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`inline-flex items-center space-x-1.5 px-2 py-0.5 rounded text-[11px] font-mono border ${badge.color}`}>
                    <Icon className="w-3 h-3" aria-hidden="true" />
                    <span>{badge.title}</span>
                  </span>
                  <ArrowRight
                    className={`w-3.5 h-3.5 text-slate-400 group-hover:text-cyber-neonTeal transition-transform group-hover:translate-x-0.5 ${
                      isSelected ? 'text-cyber-neonTeal' : ''
                    }`}
                    aria-hidden="true"
                  />
                </div>

                <h3 className="text-xs font-semibold text-white line-clamp-1 mb-1">
                  {sample.title}
                </h3>
                <p className="text-[11px] text-slate-300 leading-tight mb-2">
                  {badge.desc}
                </p>
              </div>

              <div className="text-[11px] font-mono text-cyan-300 pt-2 border-t border-cyber-border flex justify-between items-center">
                <span>{sample.city}</span>
                <span className="font-bold text-white">${sample.monthly_rent.toLocaleString()}/mo</span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};
