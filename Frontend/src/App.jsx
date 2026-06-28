import React, { useState } from 'react';
import GatewayDashboard from './components/GatewayDashboard';
import LedgerCreate from './components/LedgerCreate';
import GroupCreate from './components/GroupCreate'; 

export default function App() {
  const [currentView, setCurrentView] = useState('DASHBOARD');

  if (currentView === 'LEDGER_CREATE') {
    return <LedgerCreate onBack={() => setCurrentView('DASHBOARD')} />;
  }
  
  
  if (currentView === 'GROUP_CREATE') {
    return <GroupCreate onBack={() => setCurrentView('DASHBOARD')} />;
  }

  return (
    <GatewayDashboard 
      onNavigateToCreateLedger={() => setCurrentView('LEDGER_CREATE')} 
      onNavigateToCreateGroup={() => setCurrentView('GROUP_CREATE')} // 🟩 PASS CALLBACK
    />
  );
}
