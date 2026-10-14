import React from 'react';
import {
  X,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Flame,
  CheckCircle2,
  ExternalLink,
  Info,
  DollarSign,
  FileText,
  Image as ImageIcon,
  UserCheck
} from 'lucide-react';
import { ScanReportResponse } from '../types';
import { RiskScoreBadge } from './RiskScoreBadge';

interface Props {
  report: ScanReportResponse;
  onClose: () => void;
}

export const RiskReportModal: React.FC<Props> = ({ report, onClose }) => {
  const { overall_score, risk_tier, score_breakdown, summary_verdict, detected_flags, price_analysis, image_analysis, recommendations, disclaimer } = report;

  const getScoreColor = (score: number) => {
    if (score >= 75) return 'text-red-400 stroke-red-500';
    if (score >= 50) return 'text-orange-400 stroke-orange-500';
    if (score >= 25) return 'text-amber-400 stroke-amber-500';
    return 'text-emerald-400 stroke-emerald-500';
  };

  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (overall_score / 100) * circumference;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="relative w-full max-w-4xl rounded-2xl bg-cyber-surface border border-cyber-border shadow-2xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-cyber-border bg-cyber-card/70 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-cyber-bg border border-cyber-border">
              {risk_tier === 'CRITICAL' ? (
                <Flame className="w-6 h-6 text-red-400" />
              ) : risk_tier === 'HIGH' ? (
                <AlertTriangle className="w-6 h-6 text-orange-400" />
              ) : risk_tier === 'MEDIUM' ? (
                <ShieldAlert className="w-6 h-6 text-amber-400" />
              ) : (
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2.5">
                <h2 className="text-lg sm:text-xl font-extrabold text-white">RentShield AI Risk Evaluation</h2>
                <RiskScoreBadge tier={risk_tier} score={overall_score} size="sm" />
              </div>
              <p className="text-xs text-cyber-textMuted font-mono">Report ID: RS-{report.report_id || 'DEMO'} • Generated {new Date(report.created_at).toLocaleTimeString()}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-cyber-bg hover:bg-cyber-card border border-cyber-border text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* Top Row: Score Circular Gauge + Verdict Banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-center p-5 rounded-2xl bg-cyber-card/80 border border-cyber-border">
            {/* Circular Meter */}
            <div className="flex flex-col items-center justify-center">
              <div className="relative w-28 h-28 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="56"
                    cy="56"
                    r="45"
                    className="stroke-cyber-border"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  <circle
                    cx="56"
                    cy="56"
                    r="45"
                    className={`transition-all duration-1000 ease-out ${getScoreColor(overall_score)}`}
                    strokeWidth="8"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    fill="transparent"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-3xl font-extrabold font-mono text-white">{overall_score}</span>
                  <span className="text-[10px] uppercase tracking-wider text-cyber-textMuted">/ 100 Risk</span>
                </div>
              </div>
              <span className="mt-2 text-xs font-bold tracking-wide uppercase">
                {risk_tier} FRAUD PROBABILITY
              </span>
            </div>

            {/* Verdict Explanation */}
            <div className="md:col-span-2 space-y-2.5">
              <h3 className="text-sm font-bold text-cyber-neonCyan uppercase tracking-wider">
                Automated Risk Synthesis
              </h3>
              <p className="text-sm text-slate-200 leading-relaxed font-medium">
                {summary_verdict}
              </p>
              
              {/* Disclaimer Pill */}
              <div className="p-2.5 rounded-xl bg-cyber-bg/90 border border-cyber-border/80 flex items-start space-x-2 text-[11px] text-cyber-textMuted leading-tight">
                <Info className="w-4 h-4 text-cyber-neonTeal shrink-0 mt-0.5" />
                <span>{disclaimer}</span>
              </div>
            </div>
          </div>

          {/* Sub-Vector Risk Breakdown Bars */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Inspection Vector Scores
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-cyber-card border border-cyber-border">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-cyber-textMuted flex items-center space-x-1">
                    <FileText className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Text Scam</span>
                  </span>
                  <span className="font-mono font-bold text-white">{score_breakdown.text_score}%</span>
                </div>
                <div className="w-full bg-cyber-bg h-2 rounded-full overflow-hidden">
                  <div className="bg-cyan-400 h-full rounded-full" style={{ width: `${score_breakdown.text_score}%` }}></div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-cyber-card border border-cyber-border">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-cyber-textMuted flex items-center space-x-1">
                    <DollarSign className="w-3.5 h-3.5 text-teal-400" />
                    <span>Price Anomaly</span>
                  </span>
                  <span className="font-mono font-bold text-white">{score_breakdown.price_score}%</span>
                </div>
                <div className="w-full bg-cyber-bg h-2 rounded-full overflow-hidden">
                  <div className="bg-teal-400 h-full rounded-full" style={{ width: `${score_breakdown.price_score}%` }}></div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-cyber-card border border-cyber-border">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-cyber-textMuted flex items-center space-x-1">
                    <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Image Reused</span>
                  </span>
                  <span className="font-mono font-bold text-white">{score_breakdown.image_score}%</span>
                </div>
                <div className="w-full bg-cyber-bg h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${score_breakdown.image_score}%` }}></div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-cyber-card border border-cyber-border">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-cyber-textMuted flex items-center space-x-1">
                    <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                    <span>Contact Flag</span>
                  </span>
                  <span className="font-mono font-bold text-white">{score_breakdown.contact_score}%</span>
                </div>
                <div className="w-full bg-cyber-bg h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-400 h-full rounded-full" style={{ width: `${score_breakdown.contact_score}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Detected Indicators & Evidence Snippets */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center justify-between">
              <span>Detected Fraud Indicators ({detected_flags.length})</span>
              <span className="text-[11px] font-normal text-cyber-textMuted">Exact text and pattern triggers</span>
            </h3>

            {detected_flags.length === 0 ? (
              <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs text-emerald-300 flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>No high-risk scam triggers or payment anomalies detected in this submission.</span>
              </div>
            ) : (
              <div className="space-y-2.5">
                {detected_flags.map((flag, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-cyber-card border border-cyber-border hover:border-cyber-border/80 transition-all space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                          flag.severity === 'critical' ? 'bg-red-950 text-red-300 border border-red-500/50' :
                          flag.severity === 'high' ? 'bg-orange-950 text-orange-300 border border-orange-500/50' :
                          'bg-amber-950 text-amber-300 border border-amber-500/50'
                        }`}>
                          {flag.severity}
                        </span>
                        <span className="text-xs font-bold text-white">{flag.name}</span>
                      </div>
                      <span className="text-[11px] font-mono text-cyber-textMuted">
                        Impact: +{flag.score_impact} pts
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {flag.description}
                    </p>

                    {flag.matched_snippet && (
                      <div className="p-2 rounded-lg bg-cyber-bg/90 border border-cyber-border font-mono text-[11px] text-amber-200/90 break-words">
                        <span className="text-cyber-textMuted select-none">Snippet: </span>
                        "{flag.matched_snippet}"
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section: Price Benchmark Analysis Card */}
          <div className="p-4 rounded-2xl bg-cyber-card border border-cyber-border space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <DollarSign className="w-4 h-4 text-cyber-neonTeal" />
              <span>Regional Price Benchmark Comparison ({price_analysis.city})</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-2.5 rounded-xl bg-cyber-bg border border-cyber-border">
                <span className="text-cyber-textMuted block text-[11px]">Advertised Rent</span>
                <span className="text-sm font-bold text-white font-mono">${price_analysis.monthly_rent.toLocaleString()}/mo</span>
              </div>
              <div className="p-2.5 rounded-xl bg-cyber-bg border border-cyber-border">
                <span className="text-cyber-textMuted block text-[11px]">Regional Median ({price_analysis.bedrooms}BR)</span>
                <span className="text-sm font-bold text-cyan-300 font-mono">
                  {price_analysis.benchmark_median ? `$${price_analysis.benchmark_median.toLocaleString()}/mo` : 'N/A'}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-cyber-bg border border-cyber-border">
                <span className="text-cyber-textMuted block text-[11px]">Price Deviation</span>
                <span className={`text-sm font-bold font-mono ${
                  (price_analysis.discount_percentage || 0) > 40 ? 'text-red-400' : 'text-slate-300'
                }`}>
                  {price_analysis.discount_percentage !== undefined ? `${price_analysis.discount_percentage}% under` : 'N/A'}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-cyber-bg border border-cyber-border">
                <span className="text-cyber-textMuted block text-[11px]">Deposit Ratio</span>
                <span className="text-sm font-bold text-white font-mono">
                  {price_analysis.deposit_to_rent_ratio}x rent
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-cyber-bg/70 p-2.5 rounded-xl border border-cyber-border/70">
              {price_analysis.explanation}
            </p>
          </div>

          {/* Section: Image Hashing Results */}
          {image_analysis.length > 0 && (
            <div className="p-4 rounded-2xl bg-cyber-card border border-cyber-border space-y-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                <ImageIcon className="w-4 h-4 text-cyber-neonTeal" />
                <span>Perceptual Image Hash Match Results</span>
              </h3>

              {image_analysis.map((img, i) => (
                <div key={i} className="p-3 rounded-xl bg-cyber-bg border border-cyber-border space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-white">{img.uploaded_image}</span>
                    {img.is_reused_duplicate ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-950 text-red-300 border border-red-500">
                        DUPLICATE PHOTO MATCH ({img.similarity_percentage}% MATCH)
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500">
                        UNIQUE (NO DUPLICATE FOUND)
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] font-mono text-cyber-textMuted">
                    Perceptual Hash (pHash): <span className="text-cyber-neonCyan">{img.perceptual_hash}</span>
                  </div>
                  <p className="text-xs text-slate-300">{img.notes}</p>
                </div>
              ))}
            </div>
          )}

          {/* Section: Actionable Verification Steps Checklist */}
          <div className="p-4 rounded-2xl bg-cyber-card border border-cyber-border space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-cyber-neonTeal" />
              <span>Recommended Verification Steps (Before Paying Any Deposit)</span>
            </h3>

            <div className="space-y-2.5">
              {recommendations.map((step, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-cyber-bg/90 border border-cyber-border flex items-start space-x-3 text-xs"
                >
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase shrink-0 mt-0.5 ${
                    step.priority === 'immediate' ? 'bg-red-950 text-red-300 border border-red-500/50' :
                    step.priority === 'recommended' ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50' :
                    'bg-slate-800 text-slate-300'
                  }`}>
                    {step.priority}
                  </span>
                  <div className="space-y-1">
                    <strong className="text-white block">{step.title}</strong>
                    <p className="text-slate-300">{step.action_text}</p>
                    <p className="text-[11px] text-cyber-textMuted italic">Why: {step.why_it_matters}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-cyber-border bg-cyber-card/70 flex items-center justify-between">
          <span className="text-[11px] text-cyber-textMuted font-mono">
            Always verify deed ownership through official municipal records.
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-cyber-neonTeal text-slate-950 font-bold text-xs hover:bg-cyan-300 transition-colors shadow-[0_0_15px_rgba(0,245,212,0.2)]"
          >
            Close Report
          </button>
        </div>

      </div>
    </div>
  );
};
