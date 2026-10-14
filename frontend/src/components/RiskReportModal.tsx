import React, { useEffect, useRef } from 'react';
import {
  X,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Flame,
  CheckCircle2,
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

  const modalRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Focus trap & Escape key management (WCAG 2.2 AA)
  useEffect(() => {
    previousActiveElement.current = document.activeElement as HTMLElement;
    closeBtnRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previousActiveElement.current?.focus();
    };
  }, [onClose]);

  const getScoreColor = (score: number) => {
    if (score >= 75) return 'text-red-400 stroke-red-500';
    if (score >= 50) return 'text-orange-400 stroke-orange-500';
    if (score >= 25) return 'text-amber-400 stroke-amber-500';
    return 'text-emerald-400 stroke-emerald-500';
  };

  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (overall_score / 100) * circumference;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-report-title"
      aria-describedby="modal-report-verdict"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6"
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-4xl rounded-2xl bg-cyber-surface border border-cyber-border shadow-2xl overflow-hidden my-8"
      >
        {/* Header */}
        <header className="p-5 sm:p-6 border-b border-cyber-border bg-cyber-card/80 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-cyber-bg border border-cyber-border">
              {risk_tier === 'CRITICAL' ? (
                <Flame className="w-6 h-6 text-red-400" aria-hidden="true" />
              ) : risk_tier === 'HIGH' ? (
                <AlertTriangle className="w-6 h-6 text-orange-400" aria-hidden="true" />
              ) : risk_tier === 'MEDIUM' ? (
                <ShieldAlert className="w-6 h-6 text-amber-400" aria-hidden="true" />
              ) : (
                <ShieldCheck className="w-6 h-6 text-emerald-400" aria-hidden="true" />
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2.5">
                <h2 id="modal-report-title" className="text-lg sm:text-xl font-extrabold text-white">
                  RentShield AI Risk Evaluation
                </h2>
                <RiskScoreBadge tier={risk_tier} score={overall_score} size="sm" />
              </div>
              <p className="text-xs text-slate-300 font-mono">
                Report ID: RS-{report.report_id || 'DEMO'} • Generated {new Date(report.created_at).toLocaleTimeString()}
              </p>
            </div>
          </div>

          <button
            ref={closeBtnRef}
            type="button"
            onClick={onClose}
            aria-label="Close risk evaluation report"
            className="p-2.5 rounded-xl bg-cyber-bg hover:bg-cyber-card border border-cyber-border text-slate-300 hover:text-white transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-cyber-neonTeal focus-visible:outline-none"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </header>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Top Row: Score Circular Gauge + Verdict Banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-center p-5 rounded-2xl bg-cyber-card/90 border border-cyber-border">
            {/* Circular Meter with full ARIA meter attributes */}
            <div
              className="flex flex-col items-center justify-center"
              role="meter"
              aria-valuenow={overall_score}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuetext={`${overall_score} out of 100, ${risk_tier} fraud probability`}
              aria-label="Overall Rental Fraud Risk Score"
            >
              <div className="relative w-28 h-28 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" aria-hidden="true">
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
                <div className="absolute flex flex-col items-center" aria-hidden="true">
                  <span className="text-3xl font-extrabold font-mono text-white">{overall_score}</span>
                  <span className="text-[10px] uppercase tracking-wider text-slate-300">/ 100 Risk</span>
                </div>
              </div>
              <span className="mt-2 text-xs font-bold tracking-wide uppercase text-slate-200">
                {risk_tier} FRAUD PROBABILITY
              </span>
            </div>

            {/* Verdict Explanation */}
            <div className="md:col-span-2 space-y-2.5">
              <h3 className="text-sm font-bold text-cyber-neonCyan uppercase tracking-wider">
                Automated Risk Synthesis
              </h3>
              <p id="modal-report-verdict" className="text-sm text-slate-100 leading-relaxed font-medium">
                {summary_verdict}
              </p>
              
              {/* Disclaimer Pill */}
              <div className="p-2.5 rounded-xl bg-cyber-bg/95 border border-cyber-border flex items-start space-x-2 text-[11px] text-slate-300 leading-tight">
                <Info className="w-4 h-4 text-cyber-neonTeal shrink-0 mt-0.5" aria-hidden="true" />
                <span>{disclaimer}</span>
              </div>
            </div>
          </div>

          {/* Sub-Vector Risk Breakdown Bars with ARIA progressbar semantics */}
          <section aria-labelledby="sub-vector-heading">
            <h3 id="sub-vector-heading" className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">
              Inspection Vector Scores
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-cyber-card border border-cyber-border">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-slate-300 flex items-center space-x-1">
                    <FileText className="w-3.5 h-3.5 text-cyan-400" aria-hidden="true" />
                    <span>Text Scam</span>
                  </span>
                  <span className="font-mono font-bold text-white">{score_breakdown.text_score}%</span>
                </div>
                <div
                  role="progressbar"
                  aria-valuenow={score_breakdown.text_score}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`Text scam risk: ${score_breakdown.text_score} percent`}
                  className="w-full bg-cyber-bg h-2 rounded-full overflow-hidden"
                >
                  <div className="bg-cyan-400 h-full rounded-full" style={{ width: `${score_breakdown.text_score}%` }}></div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-cyber-card border border-cyber-border">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-slate-300 flex items-center space-x-1">
                    <DollarSign className="w-3.5 h-3.5 text-teal-400" aria-hidden="true" />
                    <span>Price Anomaly</span>
                  </span>
                  <span className="font-mono font-bold text-white">{score_breakdown.price_score}%</span>
                </div>
                <div
                  role="progressbar"
                  aria-valuenow={score_breakdown.price_score}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`Price anomaly risk: ${score_breakdown.price_score} percent`}
                  className="w-full bg-cyber-bg h-2 rounded-full overflow-hidden"
                >
                  <div className="bg-teal-400 h-full rounded-full" style={{ width: `${score_breakdown.price_score}%` }}></div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-cyber-card border border-cyber-border">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-slate-300 flex items-center space-x-1">
                    <ImageIcon className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
                    <span>Image Reused</span>
                  </span>
                  <span className="font-mono font-bold text-white">{score_breakdown.image_score}%</span>
                </div>
                <div
                  role="progressbar"
                  aria-valuenow={score_breakdown.image_score}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`Image reuse risk: ${score_breakdown.image_score} percent`}
                  className="w-full bg-cyber-bg h-2 rounded-full overflow-hidden"
                >
                  <div className="bg-emerald-400 h-full rounded-full" style={{ width: `${score_breakdown.image_score}%` }}></div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-cyber-card border border-cyber-border">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-slate-300 flex items-center space-x-1">
                    <UserCheck className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
                    <span>Contact Flag</span>
                  </span>
                  <span className="font-mono font-bold text-white">{score_breakdown.contact_score}%</span>
                </div>
                <div
                  role="progressbar"
                  aria-valuenow={score_breakdown.contact_score}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`Contact flag risk: ${score_breakdown.contact_score} percent`}
                  className="w-full bg-cyber-bg h-2 rounded-full overflow-hidden"
                >
                  <div className="bg-amber-400 h-full rounded-full" style={{ width: `${score_breakdown.contact_score}%` }}></div>
                </div>
              </div>
            </div>
          </section>

          {/* Section: Detected Indicators & Evidence Snippets */}
          <section aria-labelledby="detected-flags-heading">
            <h3 id="detected-flags-heading" className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3 flex items-center justify-between">
              <span>Detected Fraud Indicators ({detected_flags.length})</span>
              <span className="text-[11px] font-normal text-slate-300">Exact text and pattern triggers</span>
            </h3>

            {detected_flags.length === 0 ? (
              <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-xs text-emerald-200 flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
                <span>No high-risk scam triggers or payment anomalies detected in this submission.</span>
              </div>
            ) : (
              <ul className="space-y-2.5" role="list" aria-label="List of detected fraud indicators">
                {detected_flags.map((flag, idx) => (
                  <li
                    key={idx}
                    className="p-3.5 rounded-xl bg-cyber-card border border-cyber-border hover:border-cyber-border/80 transition-all space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                          flag.severity === 'critical' ? 'bg-red-950 text-red-200 border border-red-500/60' :
                          flag.severity === 'high' ? 'bg-orange-950 text-orange-200 border border-orange-500/60' :
                          'bg-amber-950 text-amber-200 border border-amber-500/60'
                        }`}>
                          {flag.severity}
                        </span>
                        <strong className="text-xs font-bold text-white">{flag.name}</strong>
                      </div>
                      <span className="text-[11px] font-mono text-slate-300">
                        Impact: +{flag.score_impact} pts
                      </span>
                    </div>

                    <p className="text-xs text-slate-200 leading-relaxed">
                      {flag.description}
                    </p>

                    {flag.matched_snippet && (
                      <div className="p-2 rounded-lg bg-cyber-bg border border-cyber-border font-mono text-[11px] text-amber-200 break-words">
                        <span className="text-slate-400 select-none">Snippet: </span>
                        "{flag.matched_snippet}"
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Section: Price Benchmark Analysis Card */}
          <section aria-labelledby="price-analysis-heading" className="p-4 rounded-2xl bg-cyber-card border border-cyber-border space-y-3">
            <h3 id="price-analysis-heading" className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <DollarSign className="w-4 h-4 text-cyber-neonTeal" aria-hidden="true" />
              <span>Regional Price Benchmark Comparison ({price_analysis.city})</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-2.5 rounded-xl bg-cyber-bg border border-cyber-border">
                <span className="text-slate-300 block text-[11px]">Advertised Rent</span>
                <span className="text-sm font-bold text-white font-mono">${price_analysis.monthly_rent.toLocaleString()}/mo</span>
              </div>
              <div className="p-2.5 rounded-xl bg-cyber-bg border border-cyber-border">
                <span className="text-slate-300 block text-[11px]">Regional Median ({price_analysis.bedrooms}BR)</span>
                <span className="text-sm font-bold text-cyan-300 font-mono">
                  {price_analysis.benchmark_median ? `$${price_analysis.benchmark_median.toLocaleString()}/mo` : 'N/A'}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-cyber-bg border border-cyber-border">
                <span className="text-slate-300 block text-[11px]">Price Deviation</span>
                <span className={`text-sm font-bold font-mono ${
                  (price_analysis.discount_percentage || 0) > 40 ? 'text-red-300' : 'text-slate-200'
                }`}>
                  {price_analysis.discount_percentage !== undefined ? `${price_analysis.discount_percentage}% under` : 'N/A'}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-cyber-bg border border-cyber-border">
                <span className="text-slate-300 block text-[11px]">Deposit Ratio</span>
                <span className="text-sm font-bold text-white font-mono">
                  {price_analysis.deposit_to_rent_ratio}x rent
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-200 leading-relaxed bg-cyber-bg/90 p-2.5 rounded-xl border border-cyber-border">
              {price_analysis.explanation}
            </p>
          </section>

          {/* Section: Image Hashing Results */}
          {image_analysis.length > 0 && (
            <section aria-labelledby="image-analysis-heading" className="p-4 rounded-2xl bg-cyber-card border border-cyber-border space-y-3">
              <h3 id="image-analysis-heading" className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                <ImageIcon className="w-4 h-4 text-cyber-neonTeal" aria-hidden="true" />
                <span>Perceptual Image Hash Match Results</span>
              </h3>

              <div className="space-y-2">
                {image_analysis.map((img, i) => (
                  <div key={i} className="p-3 rounded-xl bg-cyber-bg border border-cyber-border space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <strong className="font-semibold text-white">{img.uploaded_image}</strong>
                      {img.is_reused_duplicate ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-950 text-red-200 border border-red-500">
                          DUPLICATE PHOTO MATCH ({img.similarity_percentage}% MATCH)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-200 border border-emerald-500">
                          UNIQUE (NO DUPLICATE FOUND)
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] font-mono text-slate-300">
                      Perceptual Hash (pHash): <span className="text-cyber-neonCyan">{img.perceptual_hash}</span>
                    </div>
                    <p className="text-xs text-slate-200">{img.notes}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Section: Actionable Verification Steps Checklist */}
          <section aria-labelledby="verification-steps-heading" className="p-4 rounded-2xl bg-cyber-card border border-cyber-border space-y-3">
            <h3 id="verification-steps-heading" className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-cyber-neonTeal" aria-hidden="true" />
              <span>Recommended Verification Steps (Before Paying Any Deposit)</span>
            </h3>

            <ol className="space-y-2.5" role="list" aria-label="Tenant verification protocol">
              {recommendations.map((step, idx) => (
                <li
                  key={idx}
                  className="p-3 rounded-xl bg-cyber-bg/95 border border-cyber-border flex items-start space-x-3 text-xs"
                >
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase shrink-0 mt-0.5 ${
                    step.priority === 'immediate' ? 'bg-red-950 text-red-200 border border-red-500/60' :
                    step.priority === 'recommended' ? 'bg-cyan-950 text-cyan-200 border border-cyan-500/60' :
                    'bg-slate-800 text-slate-200'
                  }`}>
                    {step.priority}
                  </span>
                  <div className="space-y-1">
                    <strong className="text-white block font-semibold">{step.title}</strong>
                    <p className="text-slate-200">{step.action_text}</p>
                    <p className="text-[11px] text-slate-300 italic">Why: {step.why_it_matters}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

        </div>

        {/* Modal Footer Actions */}
        <footer className="p-4 sm:p-5 border-t border-cyber-border bg-cyber-card/80 flex items-center justify-between">
          <span className="text-[11px] text-slate-300 font-mono">
            Always verify deed ownership through official municipal records.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-cyber-neonTeal text-slate-950 font-bold text-xs hover:bg-cyan-300 transition-colors shadow-[0_0_15px_rgba(0,245,212,0.2)] min-h-[44px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
          >
            Close Report
          </button>
        </footer>

      </div>
    </div>
  );
};
