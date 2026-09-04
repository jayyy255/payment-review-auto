import React, { useState } from 'react';
import { Layout } from './components/layout/Layout';
import { ApiActivityPage } from './pages/ApiActivityPage';
import { DashboardPage } from './pages/DashboardPage';
import { PaymentAnalysisPage } from './pages/PaymentAnalysisPage';
import { ReviewQueuePage } from './pages/ReviewQueuePage';
import { RiskRulesPage } from './pages/RiskRulesPage';
import { ScenarioComparePage } from './pages/ScenarioComparePage';
import { SystemInfoPage } from './pages/SystemInfoPage';
import { PaymentAnalysisRequest } from './types/api';
import { ActivePage } from './types/ui';

export const App: React.FC = () => {
  const [activePage, setActivePage] = useState<ActivePage>('dashboard');
  const [selectedPayloadForAnalysis, setSelectedPayloadForAnalysis] = useState<PaymentAnalysisRequest | undefined>(undefined);

  const handleNavigate = (page: ActivePage, scenarioPayload?: PaymentAnalysisRequest) => {
    if (scenarioPayload) {
      setSelectedPayloadForAnalysis(scenarioPayload);
    }
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderActivePage = () => {
    switch (activePage) {
      case 'dashboard':
        return <DashboardPage onNavigate={handleNavigate} />;
      case 'analysis':
        return <PaymentAnalysisPage initialPayload={selectedPayloadForAnalysis} />;
      case 'queue':
        return <ReviewQueuePage />;
      case 'rules':
        return <RiskRulesPage />;
      case 'compare':
        return <ScenarioComparePage />;
      case 'activity':
        return <ApiActivityPage />;
      case 'system':
        return <SystemInfoPage />;
      default:
        return <DashboardPage onNavigate={handleNavigate} />;
    }
  };

  return (
    <Layout activePage={activePage} onSelectPage={(page) => handleNavigate(page)}>
      {renderActivePage()}
    </Layout>
  );
};

export default App;
