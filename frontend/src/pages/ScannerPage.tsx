import React, { useState } from 'react';
import { HeroBanner } from '../components/HeroBanner';
import { SampleListingLoader } from '../components/SampleListingLoader';
import { ScannerForm } from '../components/ScannerForm';
import { RiskReportModal } from '../components/RiskReportModal';
import { SampleListingItem, ScanReportResponse } from '../types';

interface Props {
  onListingCreated?: () => void;
}

export const ScannerPage: React.FC<Props> = ({ onListingCreated }) => {
  const [selectedSample, setSelectedSample] = useState<SampleListingItem | null>(null);
  const [activeReport, setActiveReport] = useState<ScanReportResponse | null>(null);

  const handleSelectSample = (sample: SampleListingItem) => {
    setSelectedSample(sample);
  };

  const handleScanComplete = (report: ScanReportResponse) => {
    setActiveReport(report);
    if (onListingCreated) {
      onListingCreated();
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6">
      <HeroBanner />

      <SampleListingLoader
        onSelectSample={handleSelectSample}
        selectedSampleTag={selectedSample?.sample_tag}
      />

      <ScannerForm
        onScanComplete={handleScanComplete}
        initialValues={selectedSample}
      />

      {activeReport && (
        <RiskReportModal
          report={activeReport}
          onClose={() => setActiveReport(null)}
        />
      )}
    </div>
  );
};
