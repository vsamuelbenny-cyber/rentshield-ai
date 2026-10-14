import React from 'react';
import {
  ShieldAlert,
  Send,
  AlertOctagon,
  Image as ImageIcon,
  KeyRound,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Search
} from 'lucide-react';

export const AboutSafetyPage: React.FC = () => {
  return (
    <article aria-labelledby="safety-guide-title" className="max-w-5xl mx-auto py-6 px-4 sm:px-6 space-y-8">
      {/* Title */}
      <header className="border-b border-cyber-border pb-6">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-800/80 text-cyber-neonCyan text-xs font-mono mb-3">
          <HelpCircle className="w-3.5 h-3.5" aria-hidden="true" />
          <span>CYBERSECURITY EDUCATION &amp; FRAUD PREVENTION</span>
        </div>
        <h1 id="safety-guide-title" className="text-2xl sm:text-3xl font-extrabold text-white">
          The Rental Fraud Playbook: How Scammers Operate &amp; How to Stay Safe
        </h1>
        <p className="text-sm text-slate-300 mt-2 max-w-3xl leading-relaxed">
          Rental scams result in over $1.3 billion in annual losses. Scammers exploit tight housing markets using psychological pressure, deep discounts, and anonymous payment platforms.
        </p>
      </header>

      {/* 4 Major Scam Archetypes */}
      <section aria-labelledby="scam-archetypes-heading">
        <h2 id="scam-archetypes-heading" className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center space-x-2">
          <ShieldAlert className="w-4 h-4 text-cyber-neonTeal" aria-hidden="true" />
          <span>The 4 Most Common Rental Scam Tropes</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-cyber-surface border border-cyber-border space-y-2">
            <h3 className="flex items-center space-x-2 text-red-300 font-semibold text-xs">
              <Send className="w-4 h-4 text-red-400" aria-hidden="true" />
              <span>1. The "Overseas Missionary / Relocation" Trope</span>
            </h3>
            <p className="text-xs text-slate-200 leading-relaxed">
              The purported landlord claims they were abruptly called out of the country for a church mission, diplomatic posting, or military deployment. They claim they are not in it for the money and offer low rent, but insist on a wire transfer before mailing the keys via courier.
            </p>
            <div className="text-[11px] font-mono text-amber-200 bg-cyber-bg p-2 rounded-lg border border-cyber-border">
              Scam signature: "Keys couriered via FedEx after Western Union confirmation."
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-cyber-surface border border-cyber-border space-y-2">
            <h3 className="flex items-center space-x-2 text-orange-300 font-semibold text-xs">
              <AlertOctagon className="w-4 h-4 text-orange-400" aria-hidden="true" />
              <span>2. The "Holding Deposit Before Viewing" Trap</span>
            </h3>
            <p className="text-xs text-slate-200 leading-relaxed">
              The listing asserts extreme competition ("over 30 inquiries today") and demands a $200–$500 refundable deposit via Zelle, Venmo, or Apple Pay before providing the address or lockbox code. Once the money is sent, the contact disappears.
            </p>
            <div className="text-[11px] font-mono text-amber-200 bg-cyber-bg p-2 rounded-lg border border-cyber-border">
              Scam signature: "Send $300 deposit to reserve your appointment time."
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-cyber-surface border border-cyber-border space-y-2">
            <h3 className="flex items-center space-x-2 text-amber-300 font-semibold text-xs">
              <ImageIcon className="w-4 h-4 text-amber-400" aria-hidden="true" />
              <span>3. Stolen MLS Photos / Phantom Listings</span>
            </h3>
            <p className="text-xs text-slate-200 leading-relaxed">
              Scammers download high-resolution photos and descriptions from properties currently for sale on Zillow or Redfin, then post them as cheap rentals on Craigslist or Facebook Marketplace with their own contact info.
            </p>
            <div className="text-[11px] font-mono text-amber-200 bg-cyber-bg p-2 rounded-lg border border-cyber-border">
              Detection method: Perceptual image hashing or reverse image search.
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-cyber-surface border border-cyber-border space-y-2">
            <h3 className="flex items-center space-x-2 text-cyan-300 font-semibold text-xs">
              <KeyRound className="w-4 h-4 text-cyan-400" aria-hidden="true" />
              <span>4. Sublease &amp; Short-Term Rental Takeover</span>
            </h3>
            <p className="text-xs text-slate-200 leading-relaxed">
              A fraudster books an Airbnb or Vrbo for 2 days, poses as the landlord, hosts open house walkthroughs for prospective tenants simultaneously, collects deposits in cash or wire, and vanishes before lease start.
            </p>
            <div className="text-[11px] font-mono text-amber-200 bg-cyber-bg p-2 rounded-lg border border-cyber-border">
              Detection method: Cross-reference deed owner on the County Assessor portal.
            </div>
          </div>
        </div>
      </section>

      {/* Safe vs Dangerous Payment Methods */}
      <section aria-labelledby="payment-safety-heading" className="p-5 rounded-2xl bg-cyber-surface border border-cyber-border space-y-4">
        <h2 id="payment-safety-heading" className="text-sm font-bold text-white uppercase tracking-wider">
          Payment Method Risk Assessment
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {/* Unsafe */}
          <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/50 space-y-2.5">
            <h3 className="flex items-center space-x-2 text-red-300 font-bold">
              <XCircle className="w-4 h-4 text-red-400" aria-hidden="true" />
              <span>HIGH RISK / SCAM FAVORITES (NEVER USE)</span>
            </h3>
            <ul className="space-y-2 text-slate-200" role="list">
              <li className="flex items-start space-x-1.5">
                <span className="text-red-400 font-bold" aria-hidden="true">•</span>
                <span><strong>Western Union / MoneyGram:</strong> Instant irreversible wire transfers. No consumer fraud protection.</span>
              </li>
              <li className="flex items-start space-x-1.5">
                <span className="text-red-400 font-bold" aria-hidden="true">•</span>
                <span><strong>Prepaid Gift Cards (Apple, Vanilla Visa):</strong> 100% untraceable once codes are read. Pure fraud.</span>
              </li>
              <li className="flex items-start space-x-1.5">
                <span className="text-red-400 font-bold" aria-hidden="true">•</span>
                <span><strong>Zelle / Venmo / CashApp for Strangers:</strong> Intended only for friends and family; banks treat sent funds as authorized.</span>
              </li>
              <li className="flex items-start space-x-1.5">
                <span className="text-red-400 font-bold" aria-hidden="true">•</span>
                <span><strong>Cryptocurrency (BTC / USDT):</strong> Irreversible anonymous blockchain transfers.</span>
              </li>
            </ul>
          </div>

          {/* Safe */}
          <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/50 space-y-2.5">
            <h3 className="flex items-center space-x-2 text-emerald-300 font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" aria-hidden="true" />
              <span>STANDARD &amp; VERIFIED PAYMENT PRACTICES</span>
            </h3>
            <ul className="space-y-2 text-slate-200" role="list">
              <li className="flex items-start space-x-1.5">
                <span className="text-emerald-400 font-bold" aria-hidden="true">•</span>
                <span><strong>Licensed Property Portal (e.g. AppFolio, Buildium):</strong> Encrypted ACH with verified corporate management entity.</span>
              </li>
              <li className="flex items-start space-x-1.5">
                <span className="text-emerald-400 font-bold" aria-hidden="true">•</span>
                <span><strong>Cashier's Check / Personal Check in Person:</strong> Handed over simultaneously with signing the lease and receiving keys.</span>
              </li>
              <li className="flex items-start space-x-1.5">
                <span className="text-emerald-400 font-bold" aria-hidden="true">•</span>
                <span><strong>Credit Card via Formal Application Portal:</strong> Provides dispute rights and strict merchant KYC.</span>
              </li>
              <li className="flex items-start space-x-1.5">
                <span className="text-emerald-400 font-bold" aria-hidden="true">•</span>
                <span><strong>Attorney / Broker Escrow Account:</strong> Funds held in trust until occupancy is delivered.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Tenant Verification Checklist */}
      <section aria-labelledby="verification-protocol-heading" className="p-5 rounded-2xl bg-cyber-card border border-cyber-border space-y-3">
        <h2 id="verification-protocol-heading" className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
          <Search className="w-4 h-4 text-cyber-neonTeal" aria-hidden="true" />
          <span>The 3-Step Verification Protocol</span>
        </h2>

        <ol className="space-y-3 text-xs text-slate-200" role="list">
          <li className="p-3.5 rounded-xl bg-cyber-bg border border-cyber-border">
            <h3 className="text-cyber-neonTeal font-bold block mb-1">
              Step 1: Verify Ownership on the County Tax Assessor Website
            </h3>
            <p className="leading-relaxed">
              Every US county provides a free public property records portal (search "[County Name] Property Appraiser" or "Tax Assessor"). Type in the listing address to check the legal deed holder's name. If the listing contact claims to be "John Smith" but the property deed is owned by "Oakland Investments LLC" or "Maria Garcia", demand explanation and broker proof.
            </p>
          </li>

          <li className="p-3.5 rounded-xl bg-cyber-bg border border-cyber-border">
            <h3 className="text-cyber-neonTeal font-bold block mb-1">
              Step 2: Reverse Image Search the Listing Photos
            </h3>
            <p className="leading-relaxed">
              Right-click the photos and search via Google Lens or upload to TinEye. If the same living room appears in a Seattle real estate sale from 2022, or an active Airbnb in another state, you are viewing a duplicate phishing listing.
            </p>
          </li>

          <li className="p-3.5 rounded-xl bg-cyber-bg border border-cyber-border">
            <h3 className="text-cyber-neonTeal font-bold block mb-1">
              Step 3: Insist on In-Person Key Demo Before Funds Move
            </h3>
            <p className="leading-relaxed">
              Never pay to "reserve" a spot in line. Legitimate landlords show the apartment, accept an application with background screening, sign a formal lease, and only then require payment.
            </p>
          </li>
        </ol>
      </section>
    </article>
  );
};
