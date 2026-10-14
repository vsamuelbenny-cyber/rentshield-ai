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
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1">
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
