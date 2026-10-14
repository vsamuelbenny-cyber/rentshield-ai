import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ScannerPage } from './pages/ScannerPage';
import { DashboardPage } from './pages/DashboardPage';
import { AboutSafetyPage } from './pages/AboutSafetyPage';

export function App() {
  const [activeTab, setActiveTab] = useState<'scanner' | 'dashboard' | 'safety'>('scanner');

  return (
    <div className="min-h-screen bg-cyber-bg text-cyber-textBright flex flex-col font-sans cyber-grid-bg selection:bg-cyan-400 selection:text-black">
      {/* Skip to Main Content Link for Keyboard & Screen Reader Users (WCAG 2.2 AA) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2.5 focus:bg-cyber-neonTeal focus:text-slate-950 focus:font-bold focus:rounded-lg focus:shadow-xl focus:ring-2 focus:ring-white"
      >
        Skip to main content
      </a>

      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">
        {activeTab === 'scanner' && (
          <ScannerPage onListingCreated={() => {}} />
        )}

        {activeTab === 'dashboard' && (
          <DashboardPage />
        )}

        {activeTab === 'safety' && (
          <AboutSafetyPage />
        )}
      </main>

      <Footer />
    </div>
  );
}

export default App;
