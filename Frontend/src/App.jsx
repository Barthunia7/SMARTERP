import React, { useState } from 'react';
import GatewayDashboard from './components/GatewayDashboard';
import LedgerCreate from './components/LedgerCreate';

export default function App() {
  const [currentView, setCurrentView] = useState('DASHBOARD');

  // 1. Swap layout when state updates
  if (currentView === 'LEDGER_CREATE') {
    return <LedgerCreate onBack={() => setCurrentView('DASHBOARD')} />;
  }

  // 2. Default landing layout
  return (
    <GatewayDashboard 
      onNavigateToCreateLedger={() => setCurrentView('LEDGER_CREATE')} 
    />
  );
}
